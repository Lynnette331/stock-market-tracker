import React, { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../utils/api';

// Create Stock Context
const StockContext = createContext();

// Initial state
const initialState = {
  watchlists: [],
  currentWatchlist: null,
  searchResults: [],
  stockQuotes: {},
  dashboardData: null,
  trendingStocks: [],
  marketStatus: null,
  loading: false,
  error: null,
  cache: {}
};

// Stock reducer
const stockReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: null
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    case 'SET_WATCHLISTS':
      return {
        ...state,
        watchlists: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_CURRENT_WATCHLIST':
      return {
        ...state,
        currentWatchlist: action.payload
      };
    
    case 'ADD_WATCHLIST':
      return {
        ...state,
        watchlists: [...state.watchlists, action.payload],
        loading: false,
        error: null
      };
    
    case 'UPDATE_WATCHLIST':
      return {
        ...state,
        watchlists: state.watchlists.map(w => 
          w._id === action.payload._id ? action.payload : w
        ),
        currentWatchlist: state.currentWatchlist?._id === action.payload._id 
          ? action.payload 
          : state.currentWatchlist,
        loading: false,
        error: null
      };
    
    case 'DELETE_WATCHLIST':
      return {
        ...state,
        watchlists: state.watchlists.filter(w => w._id !== action.payload),
        currentWatchlist: state.currentWatchlist?._id === action.payload 
          ? null 
          : state.currentWatchlist,
        loading: false,
        error: null
      };
    
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        searchResults: action.payload,
        loading: false,
        error: null
      };
    
    case 'UPDATE_STOCK_QUOTE':
      return {
        ...state,
        stockQuotes: {
          ...state.stockQuotes,
          [action.payload.symbol]: action.payload
        }
      };
    
    case 'UPDATE_MULTIPLE_QUOTES':
      return {
        ...state,
        stockQuotes: {
          ...state.stockQuotes,
          ...action.payload
        }
      };
    
    case 'SET_DASHBOARD_DATA':
      return {
        ...state,
        dashboardData: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_CACHE':
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.payload.key]: {
            data: action.payload.data,
            timestamp: Date.now()
          }
        }
      };
    
    case 'SET_TRENDING_STOCKS':
      return {
        ...state,
        trendingStocks: action.payload,
        loading: false,
        error: null
      };
    
    case 'SET_MARKET_STATUS':
      return {
        ...state,
        marketStatus: action.payload,
        loading: false,
        error: null
      };
    
    case 'CLEAR_ALL':
      return {
        ...initialState
      };
    
    default:
      return state;
  }
};

// Cache duration (5 minutes for quotes, 1 hour for other data)
const CACHE_DURATION = {
  quote: 5 * 60 * 1000, // 5 minutes
  search: 60 * 60 * 1000, // 1 hour
  company: 60 * 60 * 1000 // 1 hour
};

// Stock Provider Component
export const StockProvider = ({ children }) => {
  const [state, dispatch] = useReducer(stockReducer, initialState);

  // Helper function to check cache
  const getCachedData = useCallback((key, duration = CACHE_DURATION.quote) => {
    const cached = state.cache[key];
    if (cached && Date.now() - cached.timestamp < duration) {
      return cached.data;
    }
    return null;
  }, [state.cache]);

  // Helper function to set cache
  const setCachedData = useCallback((key, data) => {
    dispatch({
      type: 'SET_CACHE',
      payload: { key, data }
    });
  }, []);

  // Fetch watchlists
  const fetchWatchlists = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.get('/watchlists');
      dispatch({
        type: 'SET_WATCHLISTS',
        payload: response.data.data.watchlists
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch watchlists'
      });
    }
  }, []);

  // Create watchlist
  const createWatchlist = useCallback(async (watchlistData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.post('/watchlists', watchlistData);
      dispatch({
        type: 'ADD_WATCHLIST',
        payload: response.data.data.watchlist
      });
      return { success: true, data: response.data.data.watchlist };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create watchlist';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update watchlist
  const updateWatchlist = useCallback(async (id, updateData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.put(`/watchlists/${id}`, updateData);
      dispatch({
        type: 'UPDATE_WATCHLIST',
        payload: response.data.data.watchlist
      });
      return { success: true, data: response.data.data.watchlist };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update watchlist';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Delete watchlist
  const deleteWatchlist = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await api.delete(`/watchlists/${id}`);
      dispatch({
        type: 'DELETE_WATCHLIST',
        payload: id
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete watchlist';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Add stock to watchlist
  const addStockToWatchlist = useCallback(async (watchlistId, stockData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.post(`/watchlists/${watchlistId}/stocks`, stockData);
      dispatch({
        type: 'UPDATE_WATCHLIST',
        payload: response.data.data.watchlist
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add stock';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Remove stock from watchlist
  const removeStockFromWatchlist = useCallback(async (watchlistId, symbol) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.delete(`/watchlists/${watchlistId}/stocks/${symbol}`);
      dispatch({
        type: 'UPDATE_WATCHLIST',
        payload: response.data.data.watchlist
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to remove stock';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, []);

  // Search stocks with enhanced data
  const searchStocks = useCallback(async (query) => {
    const cacheKey = `search_${query}`;
    const cached = getCachedData(cacheKey, CACHE_DURATION.search);
    
    if (cached) {
      dispatch({
        type: 'SET_SEARCH_RESULTS',
        payload: cached
      });
      return { success: true, data: cached };
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.get(`/stocks/search/${encodeURIComponent(query)}`);
      let results = response.data.data;
      
      // Enhance search results with quote data for better display
      if (results && results.length > 0) {
        const enhancedResults = await Promise.allSettled(
          results.slice(0, 6).map(async (stock) => {
            try {
              const quoteResponse = await api.get(`/stocks/quote/${stock.symbol}`);
              return {
                ...stock,
                ...quoteResponse.data.data
              };
            } catch (error) {
              return stock; // Return original if quote fails
            }
          })
        );
        
        results = enhancedResults
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);
      }
      
      setCachedData(cacheKey, results);
      dispatch({
        type: 'SET_SEARCH_RESULTS',
        payload: results
      });
      return { success: true, data: results };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to search stocks';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, [getCachedData, setCachedData]);

  // Get stock quote
  const getStockQuote = useCallback(async (symbol) => {
    const cacheKey = `quote_${symbol}`;
    const cached = getCachedData(cacheKey, CACHE_DURATION.quote);
    
    if (cached) {
      dispatch({
        type: 'UPDATE_STOCK_QUOTE',
        payload: cached
      });
      return { success: true, data: cached };
    }
    
    try {
      const response = await api.get(`/stocks/quote/${symbol}`);
      const quote = response.data.data;
      
      setCachedData(cacheKey, quote);
      dispatch({
        type: 'UPDATE_STOCK_QUOTE',
        payload: quote
      });
      return { success: true, data: quote };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch stock quote';
      return { success: false, error: errorMessage };
    }
  }, [getCachedData, setCachedData]);

  // Get multiple stock quotes
  const getMultipleQuotes = useCallback(async (symbols) => {
    const quotes = {};
    const promises = symbols.map(async (symbol) => {
      const result = await getStockQuote(symbol);
      if (result.success) {
        quotes[symbol] = result.data;
      }
    });
    
    await Promise.all(promises);
    dispatch({
      type: 'UPDATE_MULTIPLE_QUOTES',
      payload: quotes
    });
    
    return quotes;
  }, [getStockQuote]);

  // Get comprehensive company data
  const getCompanyData = useCallback(async (symbol) => {
    const cacheKey = `company_${symbol}`;
    const cached = getCachedData(cacheKey, CACHE_DURATION.company);
    
    if (cached) {
      return { success: true, data: cached };
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.get(`/stocks/company/${encodeURIComponent(symbol)}`);
      const companyData = response.data.data;
      
      setCachedData(cacheKey, companyData);
      
      return { success: true, data: companyData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch company data';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, [getCachedData, setCachedData]);

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.get('/users/dashboard');
      dispatch({
        type: 'SET_DASHBOARD_DATA',
        payload: response.data.data
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch dashboard data'
      });
    }
  }, []);

  // Fetch trending stocks
  const fetchTrendingStocks = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock trending stocks data for now
      const mockTrendingStocks = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 195.89, change: 2.45, changePercent: 1.27 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63, change: -15.20, changePercent: -0.53 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 5.12, changePercent: 1.37 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -3.25, changePercent: -1.29 },
        { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 456.78, change: 12.34, changePercent: 2.78 }
      ];
      
      dispatch({
        type: 'SET_TRENDING_STOCKS',
        payload: mockTrendingStocks
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch trending stocks'
      });
    }
  }, []);

  // Fetch market status
  const fetchMarketStatus = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Mock market status data for now
      const now = new Date();
      const hour = now.getHours();
      const isWeekday = now.getDay() >= 1 && now.getDay() <= 5;
      const isMarketHours = hour >= 9 && hour < 16; // 9 AM to 4 PM
      
      const mockMarketStatus = {
        isOpen: isWeekday && isMarketHours,
        nextOpen: isWeekday && !isMarketHours ? 'Tomorrow at 9:00 AM' : 'Monday at 9:00 AM',
        timezone: 'EST'
      };
      
      dispatch({
        type: 'SET_MARKET_STATUS',
        payload: mockMarketStatus
      });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.message || 'Failed to fetch market status'
      });
    }
  }, []);

  // Get historical stock data
  const getStockHistory = useCallback(async (symbol, period = '1M') => {
    const cacheKey = `history_${symbol}_${period}`;
    const cached = getCachedData(cacheKey, CACHE_DURATION.company);
    
    if (cached) {
      return { success: true, data: cached };
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.get(`/stocks/history/${encodeURIComponent(symbol)}?period=${period}`);
      const historyData = response.data.data;
      
      setCachedData(cacheKey, historyData);
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return { success: true, data: historyData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch stock history';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }, [getCachedData, setCachedData]);

  // Compare multiple stocks
  const compareStocks = useCallback(async (symbols, period = '1M') => {
    if (!symbols || symbols.length < 2) {
      throw new Error('At least 2 stocks are required for comparison');
    }

    const cacheKey = `compare_${symbols.sort().join('_')}_${period}`;
    const cached = getCachedData(cacheKey, CACHE_DURATION.quote);
    
    if (cached) {
      return cached;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      const response = await api.post('/stocks/compare', {
        symbols,
        period
      });
      
      const comparisonData = response.data.data;
      
      setCachedData(cacheKey, comparisonData);
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return comparisonData;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to compare stocks';
      dispatch({
        type: 'SET_ERROR',
        payload: errorMessage
      });
      throw new Error(errorMessage);
    }
  }, [getCachedData, setCachedData]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Clear all stock data (for logout)
  const clearStockData = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  const value = {
    ...state,
    fetchWatchlists,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addStockToWatchlist,
    removeStockFromWatchlist,
    searchStocks,
    getStockQuote,
    getMultipleQuotes,
    getCompanyData,
    getStockHistory,
    compareStocks,
    fetchDashboardData,

    fetchTrendingStocks,
    fetchMarketStatus,
    clearError,
    clearStockData
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
};

// Custom hook to use stock context
export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};

export default StockContext;