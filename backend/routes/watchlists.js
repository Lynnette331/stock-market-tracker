const express = require('express');
const { body, validationResult } = require('express-validator');
const Watchlist = require('../models/Watchlist');
const { auth } = require('../middleware/auth');
const axios = require('axios'); // For API calls

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

// @route   GET /api/watchlists
// @desc    Get all user's watchlists
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Max 100 per page
      sortBy,
      sortOrder: order === 'desc' ? -1 : 1
    };

    const watchlists = await Watchlist.getUserWatchlists(req.user.id, options);
    
    // Get total count for pagination
    const totalWatchlists = await Watchlist.countDocuments({ userId: req.user.id });
    
    const pagination = {
      currentPage: options.page,
      totalPages: Math.ceil(totalWatchlists / options.limit),
      totalItems: totalWatchlists,
      hasNextPage: options.page < Math.ceil(totalWatchlists / options.limit),
      hasPrevPage: options.page > 1
    };

    res.json({
      success: true,
      data: {
        watchlists,
        pagination
      }
    });

  } catch (error) {
    console.error('❌ Get watchlists error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack,
      userId: req.user?.id,
      userExists: !!req.user
    });
    res.status(500).json({
      success: false,
      message: 'Error fetching watchlists',
      error: error.message, // Temporarily show errors for debugging
      errorDetails: {
        name: error.name,
        code: error.code,
        userId: req.user?.id
      }
    });
  }
});

// @route   GET /api/watchlists/:id
// @desc    Get specific watchlist by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('userId', 'username firstName lastName');

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    res.json({
      success: true,
      data: { watchlist }
    });

  } catch (error) {
    console.error('Get watchlist error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watchlist ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching watchlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/watchlists
// @desc    Create new watchlist
// @access  Private
router.post('/', [
  auth,
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Watchlist name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters')
], handleValidation, async (req, res) => {
  try {
    const { name, description, isPublic, color, tags } = req.body;

    const watchlist = new Watchlist({
      name,
      description,
      userId: req.user.id,
      isPublic: isPublic || false,
      color: color || '#3B82F6',
      tags: tags || []
    });

    await watchlist.save();

    // Populate user info before sending response
    await watchlist.populate('userId', 'username firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Watchlist created successfully',
      data: { watchlist }
    });

  } catch (error) {
    console.error('Create watchlist error:', error);
    
    if (error.message === 'Watchlist name already exists') {
      return res.status(400).json({
        success: false,
        message: 'You already have a watchlist with this name'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating watchlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/watchlists/:id
// @desc    Update watchlist
// @access  Private
router.put('/:id', [
  auth,
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Watchlist name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('color')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('Color must be a valid hex color'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ max: 30 })
    .withMessage('Each tag cannot exceed 30 characters')
], handleValidation, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    // Update fields
    const { name, description, isPublic, color, tags } = req.body;
    
    if (name !== undefined) watchlist.name = name;
    if (description !== undefined) watchlist.description = description;
    if (isPublic !== undefined) watchlist.isPublic = isPublic;
    if (color !== undefined) watchlist.color = color;
    if (tags !== undefined) watchlist.tags = tags;

    await watchlist.save();
    await watchlist.populate('userId', 'username firstName lastName');

    res.json({
      success: true,
      message: 'Watchlist updated successfully',
      data: { watchlist }
    });

  } catch (error) {
    console.error('Update watchlist error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watchlist ID'
      });
    }
    
    if (error.message === 'Watchlist name already exists') {
      return res.status(400).json({
        success: false,
        message: 'You already have a watchlist with this name'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating watchlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/watchlists/:id
// @desc    Delete watchlist
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    res.json({
      success: true,
      message: 'Watchlist deleted successfully',
      data: { 
        deletedWatchlist: {
          id: watchlist._id,
          name: watchlist.name
        }
      }
    });

  } catch (error) {
    console.error('Delete watchlist error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watchlist ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting watchlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/watchlists/:id/refresh-prices
// @desc    Refresh all stock prices in a watchlist
// @access  Private
router.put('/:id/refresh-prices', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    // Update prices for all stocks in the watchlist
    for (let stock of watchlist.stocks) {
      try {
        const stockResponse = await axios.get(`http://localhost:3000/api/stocks/quote/${stock.symbol}`);
        if (stockResponse.data.data?.price) {
          stock.previousPrice = stock.currentPrice; // Store previous price
          stock.currentPrice = stockResponse.data.data.price; // Update to new price
        }
      } catch (error) {
        console.warn(`Failed to update price for ${stock.symbol}:`, error.message);
      }
    }

    await watchlist.save();

    res.json({
      success: true,
      message: 'Stock prices refreshed successfully',
      data: { watchlist }
    });

  } catch (error) {
    console.error('Refresh prices error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while refreshing prices'
    });
  }
});

// @route   POST /api/watchlists/:id/stocks
// @desc    Add stock to watchlist
// @access  Private
router.post('/:id/stocks', [
  auth,
  body('symbol')
    .trim()
    .toUpperCase()
    .isLength({ min: 1, max: 10 })
    .withMessage('Stock symbol is required and cannot exceed 10 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], handleValidation, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    const { symbol, notes } = req.body;

    // Fetch current stock price from your stock API
    let currentPrice = 0;
    try {
      const stockResponse = await axios.get(`http://localhost:3000/api/stocks/quote/${symbol.toUpperCase()}`);
      currentPrice = stockResponse.data.data?.price || 0;
    } catch (error) {
      console.warn('Failed to fetch current price for', symbol, ':', error.message);
    }

    const stockData = {
      symbol: symbol.toUpperCase(),
      currentPrice: currentPrice,
      previousPrice: 0, // Will be updated when price changes
      notes: notes || ''
    };

    await watchlist.addStock(stockData);

    res.status(201).json({
      success: true,
      message: 'Stock added to watchlist successfully',
      data: { watchlist }
    });

  } catch (error) {
    console.error('Add stock error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watchlist ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error adding stock to watchlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/watchlists/:id/stocks/:symbol
// @desc    Update stock in watchlist
// @access  Private
router.put('/:id/stocks/:symbol', [
  auth,
  body('quantity')
    .optional()
    .isFloat({ min: 0.001, max: 1000000 })
    .withMessage('Quantity must be between 0.001 and 1,000,000'),
  body('purchasePrice')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Purchase price must be greater than 0.01'),
  body('purchaseDate')
    .optional()
    .isISO8601()
    .withMessage('Purchase date must be a valid date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
  body('currentPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Current price must be greater than or equal to 0')
], handleValidation, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    const { symbol } = req.params;
    const stock = watchlist.stocks.find(s => s.symbol === symbol.toUpperCase());

    if (!stock) {
      return res.status(404).json({
        success: false,
        message: 'Stock not found in watchlist'
      });
    }

    const { quantity, purchasePrice, purchaseDate, notes, currentPrice } = req.body;

    // Update stock fields
    if (quantity !== undefined) stock.quantity = parseFloat(quantity);
    if (purchasePrice !== undefined) stock.purchasePrice = parseFloat(purchasePrice);
    if (purchaseDate !== undefined) stock.purchaseDate = new Date(purchaseDate);
    if (notes !== undefined) stock.notes = notes;
    if (currentPrice !== undefined) stock.currentPrice = parseFloat(currentPrice);

    await watchlist.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: { watchlist }
    });

  } catch (error) {
    console.error('Update stock error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watchlist ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/watchlists/:id/stocks/:symbol
// @desc    Remove stock from watchlist
// @access  Private
router.delete('/:id/stocks/:symbol', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!watchlist) {
      return res.status(404).json({
        success: false,
        message: 'Watchlist not found'
      });
    }

    const { symbol } = req.params;
    const { quantity } = req.query;

    await watchlist.removeStock(symbol.toUpperCase(), quantity ? parseFloat(quantity) : null);

    res.json({
      success: true,
      message: 'Stock removed from watchlist successfully',
      data: { watchlist }
    });

  } catch (error) {
    console.error('Remove stock error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid watchlist ID'
      });
    }
    
    if (error.message === 'Stock not found in watchlist') {
      return res.status(404).json({
        success: false,
        message: 'Stock not found in watchlist'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error removing stock from watchlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;