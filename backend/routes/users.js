const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Watchlist = require('../models/Watchlist');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's watchlists with summary data
    const watchlists = await Watchlist.find({ userId: req.user.id })
      .select('name description stocks totalStocks totalInvestment currentValue totalGainLoss totalGainLossPercent color createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate portfolio summary
    const portfolioSummary = {
      totalWatchlists: watchlists.length,
      totalStocks: watchlists.reduce((sum, w) => sum + w.totalStocks, 0),
      totalInvestment: watchlists.reduce((sum, w) => sum + w.totalInvestment, 0),
      currentValue: watchlists.reduce((sum, w) => sum + w.currentValue, 0),
      totalGainLoss: watchlists.reduce((sum, w) => sum + w.totalGainLoss, 0),
    };

    portfolioSummary.totalGainLossPercent = portfolioSummary.totalInvestment > 0 
      ? ((portfolioSummary.totalGainLoss / portfolioSummary.totalInvestment) * 100)
      : 0;

    // Get recent activity (last 10 watchlist updates)
    const recentActivity = await Watchlist.find({ userId: req.user.id })
      .select('name updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          avatar: user.avatar,
          preferences: user.preferences,
          memberSince: user.createdAt,
          lastLogin: user.lastLogin
        },
        portfolio: portfolioSummary,
        recentWatchlists: watchlists,
        recentActivity
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/portfolio
// @desc    Get detailed portfolio analysis
// @access  Private
router.get('/portfolio', auth, async (req, res) => {
  try {
    const watchlists = await Watchlist.find({ userId: req.user.id });

    // Aggregate all stocks across watchlists
    const allStocks = [];
    const stockSummary = {};

    watchlists.forEach(watchlist => {
      watchlist.stocks.forEach(stock => {
        allStocks.push({
          ...stock.toObject(),
          watchlistName: watchlist.name,
          watchlistId: watchlist._id
        });

        // Aggregate by symbol
        if (stockSummary[stock.symbol]) {
          stockSummary[stock.symbol].quantity += stock.quantity;
          stockSummary[stock.symbol].totalInvestment += stock.totalInvestment;
          stockSummary[stock.symbol].currentValue += stock.currentValue;
        } else {
          stockSummary[stock.symbol] = {
            symbol: stock.symbol,
            quantity: stock.quantity,
            averagePrice: stock.purchasePrice,
            currentPrice: stock.currentPrice,
            totalInvestment: stock.totalInvestment,
            currentValue: stock.currentValue,
            gainLoss: stock.gainLoss,
            gainLossPercent: stock.gainLossPercent
          };
        }
      });
    });

    // Recalculate aggregated values
    Object.keys(stockSummary).forEach(symbol => {
      const stock = stockSummary[symbol];
      stock.averagePrice = stock.totalInvestment / stock.quantity;
      stock.gainLoss = stock.currentValue - stock.totalInvestment;
      stock.gainLossPercent = stock.totalInvestment > 0 
        ? ((stock.gainLoss / stock.totalInvestment) * 100)
        : 0;
    });

    // Portfolio totals
    const portfolio = {
      totalInvestment: Object.values(stockSummary).reduce((sum, s) => sum + s.totalInvestment, 0),
      currentValue: Object.values(stockSummary).reduce((sum, s) => sum + s.currentValue, 0),
      totalGainLoss: Object.values(stockSummary).reduce((sum, s) => sum + s.gainLoss, 0),
      totalStocks: Object.keys(stockSummary).length,
      totalPositions: allStocks.length
    };

    portfolio.totalGainLossPercent = portfolio.totalInvestment > 0 
      ? ((portfolio.totalGainLoss / portfolio.totalInvestment) * 100)
      : 0;

    // Top performers and losers
    const stockArray = Object.values(stockSummary);
    const topGainers = stockArray
      .filter(s => s.gainLoss > 0)
      .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
      .slice(0, 5);

    const topLosers = stockArray
      .filter(s => s.gainLoss < 0)
      .sort((a, b) => a.gainLossPercent - b.gainLossPercent)
      .slice(0, 5);

    // Sector allocation (mock data - would need company info for real sectors)
    const sectorAllocation = [
      { sector: 'Technology', value: portfolio.currentValue * 0.4, percentage: 40 },
      { sector: 'Healthcare', value: portfolio.currentValue * 0.2, percentage: 20 },
      { sector: 'Finance', value: portfolio.currentValue * 0.15, percentage: 15 },
      { sector: 'Consumer Goods', value: portfolio.currentValue * 0.15, percentage: 15 },
      { sector: 'Energy', value: portfolio.currentValue * 0.1, percentage: 10 }
    ];

    res.json({
      success: true,
      data: {
        portfolio,
        holdings: stockArray.sort((a, b) => b.currentValue - a.currentValue),
        topGainers,
        topLosers,
        sectorAllocation,
        detailedPositions: allStocks
      }
    });

  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching portfolio data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get watchlist stats
    const watchlistStats = await Watchlist.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: null,
          totalWatchlists: { $sum: 1 },
          totalStocks: { $sum: { $size: '$stocks' } },
          avgStocksPerWatchlist: { $avg: { $size: '$stocks' } }
        }
      }
    ]);

    const stats = watchlistStats.length > 0 ? watchlistStats[0] : {
      totalWatchlists: 0,
      totalStocks: 0,
      avgStocksPerWatchlist: 0
    };

    // Monthly activity (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyActivity = await Watchlist.aggregate([
      { 
        $match: { 
          userId: user._id,
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // User achievements (mock data for now)
    const achievements = [
      {
        id: 'first_watchlist',
        name: 'Getting Started',
        description: 'Created your first watchlist',
        earned: stats.totalWatchlists > 0,
        earnedAt: user.createdAt
      },
      {
        id: 'stock_collector',
        name: 'Stock Collector',
        description: 'Added 10 stocks to watchlists',
        earned: stats.totalStocks >= 10,
        earnedAt: stats.totalStocks >= 10 ? new Date() : null
      },
      {
        id: 'diversified',
        name: 'Diversified Investor',
        description: 'Created 5 different watchlists',
        earned: stats.totalWatchlists >= 5,
        earnedAt: stats.totalWatchlists >= 5 ? new Date() : null
      },
      {
        id: 'active_trader',
        name: 'Active Trader',
        description: 'Made updates in the last 7 days',
        earned: true, // Would check recent activity
        earnedAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: {
        user: user.getStats(),
        watchlistStats: {
          ...stats,
          avgStocksPerWatchlist: Math.round(stats.avgStocksPerWatchlist * 10) / 10
        },
        monthlyActivity,
        achievements: {
          total: achievements.length,
          earned: achievements.filter(a => a.earned).length,
          list: achievements
        }
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', [
  auth,
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'])
    .withMessage('Invalid currency'),
  body('theme')
    .optional()
    .isIn(['light', 'dark'])
    .withMessage('Theme must be light or dark'),
  body('notifications.priceAlerts')
    .optional()
    .isBoolean()
    .withMessage('Price alerts setting must be boolean'),
  body('notifications.marketNews')
    .optional()
    .isBoolean()
    .withMessage('Market news setting must be boolean'),
  body('notifications.portfolioUpdates')
    .optional()
    .isBoolean()
    .withMessage('Portfolio updates setting must be boolean')
], handleValidation, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { currency, theme, notifications } = req.body;

    // Update preferences
    if (currency) user.preferences.currency = currency;
    if (theme) user.preferences.theme = theme;
    if (notifications) {
      user.preferences.notifications = {
        ...user.preferences.notifications,
        ...notifications
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: {
        preferences: user.preferences
      }
    });

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating preferences',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Deactivate user account
// @access  Private
router.delete('/account', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    await user.save();

    // Optional: Delete all user's watchlists
    await Watchlist.deleteMany({ userId: req.user.id });

    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });

  } catch (error) {
    console.error('Account deactivation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating account',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;