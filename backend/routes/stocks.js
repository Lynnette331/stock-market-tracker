const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

const router = express.Router();

// Cache for stock data (1 minute for live updates)
const cache = new NodeCache({ stdTTL: 60 });

// Alpha Vantage API configuration
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = process.env.ALPHA_VANTAGE_BASE_URL;

// Alpha Vantage API helper functions
const fetchFromAlphaVantage = async (params) => {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        ...params,
        apikey: ALPHA_VANTAGE_API_KEY
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Alpha Vantage API Error:', error.message);
    throw error;
  }
};

// Company name mapping for common stocks
const companyNames = {
  'AAPL': { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics' },
  'GOOGL': { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Content & Information' },
  'MSFT': { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software' },
  'TSLA': { name: 'Tesla Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers' },
  'AMZN': { name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail' },
  'META': { name: 'Meta Platforms Inc.', sector: 'Technology', industry: 'Internet Content & Information' },
  'NVDA': { name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors' },
  'NFLX': { name: 'Netflix Inc.', sector: 'Communication Services', industry: 'Entertainment' },
  'AMD': { name: 'Advanced Micro Devices Inc.', sector: 'Technology', industry: 'Semiconductors' },
  'INTC': { name: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors' }
};

// Parse Alpha Vantage quote response with enhanced data
const parseQuoteData = (data, symbol) => {
  const quote = data['Global Quote'];
  if (!quote || Object.keys(quote).length === 0) {
    throw new Error('No data found for symbol');
  }
  
  const price = parseFloat(quote['05. price']);
  const change = parseFloat(quote['09. change']);
  const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
  const open = parseFloat(quote['02. open']);
  const high = parseFloat(quote['03. high']);
  const low = parseFloat(quote['04. low']);
  const volume = parseInt(quote['06. volume']);
  const previousClose = parseFloat(quote['08. previous close']);
  
  // Calculate estimated bid
  const spread = Math.max(0.01, price * 0.0002);
  const bidPrice = price - (spread / 2);
  const askPrice = price + (spread / 2);
  
  // Get company info from mapping or use default
  const companyInfo = companyNames[symbol.toUpperCase()] || {
    name: `${symbol.toUpperCase()} Stock`,
    sector: 'Unknown',
    industry: 'Unknown'
  };
  
  // Calculate estimated market cap (price * estimated shares outstanding)
  const estimatedShares = price > 100 ? 1000000000 : 2000000000; // Rough estimate
  const marketCap = Math.floor(price * estimatedShares);
  
  return {
    symbol: symbol.toUpperCase(),
    name: companyInfo.name,
    description: `${companyInfo.name} is a leading company in the ${companyInfo.sector} sector.`,
    sector: companyInfo.sector,
    industry: companyInfo.industry,
    price: price,
    bidPrice: parseFloat(bidPrice.toFixed(2)),
    askPrice: parseFloat(askPrice.toFixed(2)),
    spread: parseFloat(spread.toFixed(2)),
    change: change,
    changePercent: changePercent.toFixed(2) + '%',
    open: open,
    high: high,
    low: low,
    volume: volume,
    previousClose: previousClose,
    marketCap: marketCap,
    pe: (15 + Math.random() * 25).toFixed(2), // Estimated P/E ratio
    dividendYield: (Math.random() * 4).toFixed(2), // Estimated dividend yield
    week52High: high * (1.1 + Math.random() * 0.3),
    week52Low: low * (0.7 + Math.random() * 0.2),
    isPositive: change >= 0,
    lastUpdated: quote['07. latest trading day'],
    tradingHours: {
      isOpen: isMarketOpen(),
      nextOpen: getNextMarketOpen(),
      timezone: 'EST'
    }
  };
};

// Helper function to check if market is open (simplified)
const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours();
  
  // Basic check: Monday-Friday, 9:30 AM - 4:00 PM EST
  return day >= 1 && day <= 5 && hour >= 9 && hour < 16;
};

// Helper function to get next market open time
const getNextMarketOpen = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  tomorrow.setHours(9, 30, 0, 0);
  return tomorrow.toISOString();
};



// Mock stock data for development
const mockStocks = {
  'AAPL': {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 195.89,
    change: 2.45,
    changePercent: '1.27%',
    open: 193.44,
    high: 196.12,
    low: 192.88,
    volume: 45234567,
    isPositive: true
  },
  'GOOGL': {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 142.56,
    change: -0.89,
    changePercent: '-0.62%',
    open: 143.45,
    high: 144.20,
    low: 141.88,
    volume: 28567432,
    isPositive: false
  },
  'MSFT': {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 378.85,
    change: 4.23,
    changePercent: '1.13%',
    open: 374.62,
    high: 380.15,
    low: 373.45,
    volume: 32145678,
    isPositive: true
  },
  'TSLA': {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.42,
    change: -3.67,
    changePercent: '-1.46%',
    open: 252.09,
    high: 253.88,
    low: 247.10,
    volume: 89567234,
    isPositive: false
  },
  'AMZN': {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 175.28,
    change: 1.84,
    changePercent: '1.06%',
    open: 173.44,
    high: 176.92,
    low: 172.85,
    volume: 52341678,
    isPositive: true
  },
  'META': {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 498.37,
    change: 7.82,
    changePercent: '1.59%',
    open: 490.55,
    high: 501.24,
    low: 489.12,
    volume: 18743299,
    isPositive: true
  },
  'NVDA': {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 938.73,
    change: -12.45,
    changePercent: '-1.31%',
    open: 951.18,
    high: 956.84,
    low: 935.22,
    volume: 24657891,
    isPositive: false
  },
  'NFLX': {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    price: 682.44,
    change: 4.67,
    changePercent: '0.69%',
    open: 677.77,
    high: 685.92,
    low: 675.33,
    volume: 8234567,
    isPositive: true
  }
};

// @route   GET /api/stocks/search/:query
// @desc    Search for stocks by symbol or company name
// @access  Public
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const cacheKey = `search_${query.toLowerCase()}`;
    
    // Check cache first
    let cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    let results = [];
    
    // Use built-in company mapping for search
    const allStocks = Object.entries(companyNames).map(([symbol, info]) => ({
      symbol,
      name: info.name,
      type: 'Equity',
      region: 'United States',
      sector: info.sector,
      industry: info.industry
    }));

    results = allStocks.filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );

    // Cache the results
    cache.set(cacheKey, results, 3600);

    res.json({
      success: true,
      data: results,
      cached: false
    });

  } catch (error) {
    console.error('Stock search error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error searching for stocks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/stocks/quote/:symbol
// @desc    Get real-time stock quote
// @access  Public
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `quote_${symbol.toUpperCase()}`;
    
    // Check cache first
    let cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    let result = null;
    
    // Always try Alpha Vantage API first for live data
    if (ALPHA_VANTAGE_API_KEY) {
      try {
        console.log(`Fetching live data for ${symbol} from Alpha Vantage...`);
        const quoteData = await fetchFromAlphaVantage({
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase()
        });
        
        result = parseQuoteData(quoteData, symbol);
        console.log(`Successfully got live data for ${symbol}: $${result.price}`);
      } catch (apiError) {
        console.error(`Alpha Vantage quote failed for ${symbol}:`, apiError.message);
        console.log('Falling back to mock data...');
      }
    } else {
      console.warn('No Alpha Vantage API key found, using mock data');
    }
    
    // Fallback to mock data if API fails or demo key
    if (!result) {
      const stockData = mockStocks[symbol.toUpperCase()];
      
      if (!stockData) {
        return res.status(404).json({
          success: false,
          message: `No data found for symbol ${symbol.toUpperCase()}`
        });
      }

      // Add some randomness to simulate real-time updates
      const updatedPrice = stockData.price + (Math.random() - 0.5) * 2;
      const spread = Math.max(0.01, updatedPrice * 0.0002);
      
      result = {
        ...stockData,
        price: updatedPrice,
        bidPrice: parseFloat((updatedPrice - spread/2).toFixed(2)),
        askPrice: parseFloat((updatedPrice + spread/2).toFixed(2)),
        spread: parseFloat(spread.toFixed(2)),
        tradingHours: {
          isOpen: isMarketOpen(),
          nextOpen: getNextMarketOpen(),
          timezone: 'EST'
        },
        lastUpdated: new Date().toISOString()
      };
    }

    // Cache the results (shorter cache for live updates)
    cache.set(cacheKey, result, 60);

    res.json({
      success: true,
      data: result,
      cached: false
    });

  } catch (error) {
    console.error('Stock quote error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock quote',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/stocks/company/:symbol
// @desc    Get comprehensive company information and stock data
// @access  Public
router.get('/company/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `company_${symbol.toUpperCase()}`;
    
    // Check cache first
    let cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    let result = null;
    
    // Always try Alpha Vantage API first for live company data
    if (ALPHA_VANTAGE_API_KEY) {
      try {
        console.log(`Fetching live company data for ${symbol}...`);
        const quoteData = await fetchFromAlphaVantage({
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase()
        });
        
        const stockData = parseQuoteData(quoteData, symbol);
        
        result = {
          ...stockData,
          analysis: {
            recommendation: stockData.change >= 0 ? 'BUY' : 'HOLD',
            confidence: 'MEDIUM',
            priceTarget: parseFloat((stockData.price * (1 + (Math.random() * 0.2 - 0.1))).toFixed(2)),
            analystRating: Math.floor(Math.random() * 5) + 1
          }
        };
        console.log(`Successfully got live company data for ${symbol}`);
      } catch (apiError) {
        console.error(`Alpha Vantage company data failed for ${symbol}:`, apiError.message);
        console.log('Falling back to mock data...');
      }
    } else {
      console.warn('No Alpha Vantage API key found, using mock data');
    }
    
    // Fallback to enhanced mock data
    if (!result) {
      const stockData = mockStocks[symbol.toUpperCase()];
      
      if (!stockData) {
        return res.status(404).json({
          success: false,
          message: `No company data found for symbol ${symbol.toUpperCase()}`
        });
      }

      const updatedPrice = stockData.price + (Math.random() - 0.5) * 2;
      const spread = Math.max(0.01, updatedPrice * 0.0002);
      
      result = {
        ...stockData,
        price: updatedPrice,
        bidPrice: parseFloat((updatedPrice - spread/2).toFixed(2)),
        askPrice: parseFloat((updatedPrice + spread/2).toFixed(2)),
        spread: parseFloat(spread.toFixed(2)),
        description: `${stockData.name} is a leading technology company.`,
        sector: 'Technology',
        industry: 'Software',
        marketCap: Math.floor(updatedPrice * 1000000000),
        pe: (15 + Math.random() * 20).toFixed(2),
        dividendYield: (Math.random() * 3).toFixed(2),
        week52High: updatedPrice * (1.2 + Math.random() * 0.3),
        week52Low: updatedPrice * (0.7 - Math.random() * 0.2),
        tradingHours: {
          isOpen: isMarketOpen(),
          nextOpen: getNextMarketOpen(),
          timezone: 'EST'
        },
        analysis: {
          recommendation: 'BUY',
          confidence: 'HIGH',
          priceTarget: updatedPrice * 1.15,
          analystRating: 4
        },
        lastUpdated: new Date().toISOString()
      };
    }

    // Cache the results (longer cache for company data)
    cache.set(cacheKey, result, 1800); // 30 minutes

    res.json({
      success: true,
      data: result,
      cached: false
    });

  } catch (error) {
    console.error('Company data error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching company data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/stocks/trending
// @desc    Get trending stocks
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const cacheKey = 'trending_stocks';
    
    // Check cache first
    let cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    const trendingSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];
    let trendingStocks = [];
    
    // Always try to get live data for trending stocks
    if (ALPHA_VANTAGE_API_KEY) {
      try {
        console.log('Fetching live trending stocks data...');
        const promises = trendingSymbols.map(async (symbol) => {
          try {
            const quoteData = await fetchFromAlphaVantage({
              function: 'GLOBAL_QUOTE',
              symbol: symbol
            });
            return parseQuoteData(quoteData, symbol);
          } catch (error) {
            console.error(`Failed to fetch live data for ${symbol}:`, error.message);
            return null;
          }
        });
        
        const results = await Promise.all(promises);
        trendingStocks = results.filter(stock => stock !== null);
        console.log(`Successfully fetched ${trendingStocks.length} live trending stocks`);
      } catch (error) {
        console.error('Alpha Vantage trending failed:', error.message);
        console.log('Falling back to mock data...');
      }
    } else {
      console.warn('No Alpha Vantage API key found for trending stocks');
    }
    
    // Fallback to mock data if API fails or insufficient data
    if (trendingStocks.length < 3) {
      trendingStocks = Object.values(mockStocks).slice(0, 4).map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 4,
        lastUpdated: new Date().toISOString()
      }));
    }

    // Cache the results (shorter cache for more frequent updates)
    cache.set(cacheKey, trendingStocks, 180);

    res.json({
      success: true,
      data: trendingStocks,
      cached: false
    });

  } catch (error) {
    console.error('Trending stocks error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending stocks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/stocks/history/:symbol
// @desc    Get historical stock data
// @access  Public
router.get('/history/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M' } = req.query; // 1D, 1W, 1M, 3M, 6M, 1Y, 5Y
    const cacheKey = `history_${symbol.toUpperCase()}_${period}`;
    
    // Check cache first
    let cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    let result = null;
    
    // Try Alpha Vantage API first
    if (ALPHA_VANTAGE_API_KEY) {
      try {
        console.log(`Fetching historical data for ${symbol} (${period}) from Alpha Vantage...`);
        
        // Determine the function based on period
        let functionType = 'TIME_SERIES_DAILY';
        let outputSize = 'compact';
        
        if (period === '1D' || period === '1W') {
          functionType = 'TIME_SERIES_INTRADAY';
          outputSize = 'full';
        } else if (['1Y', '5Y'].includes(period)) {
          outputSize = 'full';
        }
        
        const historyData = await fetchFromAlphaVantage({
          function: functionType,
          symbol: symbol.toUpperCase(),
          outputsize: outputSize,
          ...(functionType === 'TIME_SERIES_INTRADAY' && { interval: '15min' })
        });
        
        result = parseHistoricalData(historyData, symbol, period);
        console.log(`Successfully got historical data for ${symbol}: ${result.data.length} points`);
      } catch (apiError) {
        console.error(`Alpha Vantage history failed for ${symbol}:`, apiError.message);
        console.log('Falling back to mock data...');
      }
    } else {
      console.warn('No Alpha Vantage API key found, using mock historical data');
    }
    
    // Fallback to mock data if API fails
    if (!result) {
      result = generateMockHistoricalData(symbol, period);
    }

    // Cache the results (longer cache for historical data)
    cache.set(cacheKey, result, 1800); // 30 minutes

    res.json({
      success: true,
      data: result,
      cached: false
    });

  } catch (error) {
    console.error('Historical data error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching historical data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/stocks/compare
// @desc    Compare multiple stocks
// @access  Public
router.post('/compare', async (req, res) => {
  try {
    const { symbols, period = '1M' } = req.body;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of stock symbols'
      });
    }
    
    if (symbols.length > 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 5 stocks can be compared at once'
      });
    }

    const cacheKey = `compare_${symbols.sort().join('_')}_${period}`;
    
    // Check cache first
    let cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json({
        success: true,
        data: cachedResult,
        cached: true
      });
    }

    console.log(`Comparing stocks: ${symbols.join(', ')} for period ${period}`);
    
    const promises = symbols.map(async (symbol) => {
      try {
        // Get current quote
        const quoteResponse = await axios.get(`/api/stocks/quote/${symbol}`);
        const quote = quoteResponse.data.data;
        
        // Get historical data
        const historyResponse = await axios.get(`/api/stocks/history/${symbol}?period=${period}`);
        const history = historyResponse.data.data;
        
        return {
          symbol: symbol.toUpperCase(),
          name: quote.name,
          currentPrice: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          isPositive: quote.isPositive,
          history: history.data,
          performance: calculatePerformance(history.data),
          sector: quote.sector || 'Unknown',
          marketCap: quote.marketCap || 0
        };
      } catch (error) {
        console.error(`Failed to get comparison data for ${symbol}:`, error.message);
        // Return mock data for failed requests
        return generateMockComparisonData(symbol, period);
      }
    });
    
    const results = await Promise.all(promises);
    
    const comparisonData = {
      period,
      symbols,
      stocks: results,
      summary: {
        bestPerformer: results.reduce((best, stock) => 
          stock.performance.totalReturn > (best?.performance.totalReturn || -Infinity) ? stock : best
        ),
        worstPerformer: results.reduce((worst, stock) => 
          stock.performance.totalReturn < (worst?.performance.totalReturn || Infinity) ? stock : worst
        ),
        averageReturn: results.reduce((sum, stock) => sum + stock.performance.totalReturn, 0) / results.length,
        correlationMatrix: calculateCorrelationMatrix(results)
      },
      lastUpdated: new Date().toISOString()
    };

    // Cache the results
    cache.set(cacheKey, comparisonData, 900); // 15 minutes

    res.json({
      success: true,
      data: comparisonData,
      cached: false
    });

  } catch (error) {
    console.error('Stock comparison error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error comparing stocks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to parse Alpha Vantage historical data
const parseHistoricalData = (data, symbol, period) => {
  let timeSeries = null;
  
  if (data['Time Series (Daily)']) {
    timeSeries = data['Time Series (Daily)'];
  } else if (data['Time Series (15min)']) {
    timeSeries = data['Time Series (15min)'];
  } else {
    throw new Error('No historical data found in response');
  }
  
  const entries = Object.entries(timeSeries)
    .map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  
  // Filter based on period
  const filteredData = filterDataByPeriod(entries, period);
  
  return {
    symbol: symbol.toUpperCase(),
    period,
    data: filteredData,
    meta: {
      firstDate: filteredData[0]?.date,
      lastDate: filteredData[filteredData.length - 1]?.date,
      totalPoints: filteredData.length
    }
  };
};

// Helper function to generate mock historical data
const generateMockHistoricalData = (symbol, period) => {
  const baseStock = mockStocks[symbol.toUpperCase()];
  const basePrice = baseStock ? baseStock.price : 100 + Math.random() * 200;
  
  const periodDays = {
    '1D': 1,
    '1W': 7,
    '1M': 30,
    '3M': 90,
    '6M': 180,
    '1Y': 365,
    '5Y': 1825
  };
  
  const days = periodDays[period] || 30;
  const dataPoints = Math.min(days, period === '1D' ? 24 : days); // Hourly for 1D, daily for others
  const data = [];
  
  let currentPrice = basePrice;
  const volatility = 0.02; // 2% daily volatility
  
  for (let i = dataPoints; i >= 0; i--) {
    const date = new Date();
    if (period === '1D') {
      date.setHours(date.getHours() - i);
    } else {
      date.setDate(date.getDate() - i);
    }
    
    // Generate realistic price movement
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    const open = currentPrice;
    currentPrice = Math.max(1, currentPrice + change);
    const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.02);
    const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.02);
    const volume = Math.floor(Math.random() * 50000000) + 1000000;
    
    data.push({
      date: date.toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(currentPrice.toFixed(2)),
      volume
    });
  }
  
  return {
    symbol: symbol.toUpperCase(),
    period,
    data: data.sort((a, b) => new Date(a.date) - new Date(b.date)),
    meta: {
      firstDate: data[0]?.date,
      lastDate: data[data.length - 1]?.date,
      totalPoints: data.length
    }
  };
};

// Helper function to filter data by period
const filterDataByPeriod = (data, period) => {
  const now = new Date();
  const periodMs = {
    '1D': 24 * 60 * 60 * 1000,
    '1W': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
    '3M': 90 * 24 * 60 * 60 * 1000,
    '6M': 180 * 24 * 60 * 60 * 1000,
    '1Y': 365 * 24 * 60 * 60 * 1000,
    '5Y': 5 * 365 * 24 * 60 * 60 * 1000
  };
  
  const cutoffDate = new Date(now.getTime() - periodMs[period]);
  
  return data.filter(point => new Date(point.date) >= cutoffDate);
};

// Helper function to calculate performance metrics
const calculatePerformance = (data) => {
  if (!data || data.length === 0) return {};
  
  const firstPrice = data[0].close;
  const lastPrice = data[data.length - 1].close;
  const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;
  
  // Calculate volatility (standard deviation of daily returns)
  const dailyReturns = [];
  for (let i = 1; i < data.length; i++) {
    const return_ = ((data[i].close - data[i-1].close) / data[i-1].close) * 100;
    dailyReturns.push(return_);
  }
  
  const avgReturn = dailyReturns.reduce((sum, ret) => sum + ret, 0) / dailyReturns.length;
  const variance = dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252); // Annualized volatility
  
  const maxPrice = Math.max(...data.map(d => d.high));
  const minPrice = Math.min(...data.map(d => d.low));
  
  return {
    totalReturn: parseFloat(totalReturn.toFixed(2)),
    volatility: parseFloat(volatility.toFixed(2)),
    maxPrice: parseFloat(maxPrice.toFixed(2)),
    minPrice: parseFloat(minPrice.toFixed(2)),
    priceRange: parseFloat(((maxPrice - minPrice) / minPrice * 100).toFixed(2)),
    sharpeRatio: volatility > 0 ? parseFloat((avgReturn / volatility * Math.sqrt(252)).toFixed(2)) : 0
  };
};

// Helper function to generate mock comparison data
const generateMockComparisonData = (symbol, period) => {
  const mockData = generateMockHistoricalData(symbol, period);
  const baseStock = mockStocks[symbol.toUpperCase()] || {
    name: `${symbol} Corp`,
    price: 100,
    change: 0,
    changePercent: '0%',
    isPositive: true
  };
  
  return {
    symbol: symbol.toUpperCase(),
    name: baseStock.name,
    currentPrice: baseStock.price,
    change: baseStock.change,
    changePercent: baseStock.changePercent,
    isPositive: baseStock.isPositive,
    history: mockData.data,
    performance: calculatePerformance(mockData.data),
    sector: 'Technology',
    marketCap: baseStock.price * 1000000000
  };
};

// Helper function to calculate correlation matrix
const calculateCorrelationMatrix = (stocks) => {
  const matrix = {};
  
  stocks.forEach(stock1 => {
    matrix[stock1.symbol] = {};
    stocks.forEach(stock2 => {
      if (stock1.symbol === stock2.symbol) {
        matrix[stock1.symbol][stock2.symbol] = 1.0;
      } else {
        // Simple correlation calculation based on price movements
        const correlation = 0.3 + Math.random() * 0.4; // Mock correlation between 0.3-0.7
        matrix[stock1.symbol][stock2.symbol] = parseFloat(correlation.toFixed(3));
      }
    });
  });
  
  return matrix;
};

module.exports = router;