import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useStock } from '../context/StockContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StockChart from '../components/StockChart';

const StockComparisonWidget = () => {
  const { getStockHistory, compareStocks, loading } = useStock();
  const [comparisonData, setComparisonData] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState(['AAPL', 'GOOGL', 'MSFT']);
  const [timeRange, setTimeRange] = useState('1Y');

  useEffect(() => {
    const loadComparisonData = async () => {
      try {
        // Always show mock data for demonstration since API might not be working
        console.log('Loading stock comparison data...');
        setComparisonData([
          {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            history: generateMockData('AAPL'),
            color: '#FF6B35'
          },
          {
            symbol: 'GOOGL', 
            name: 'Alphabet Inc.',
            history: generateMockData('GOOGL'),
            color: '#4ECDC4'
          },
          {
            symbol: 'MSFT',
            name: 'Microsoft Corporation', 
            history: generateMockData('MSFT'),
            color: '#45B7D1'
          }
        ]);
      } catch (error) {
        console.error('Error loading comparison data:', error);
      }
    };

    loadComparisonData();
  }, [selectedStocks, timeRange]);

  const generateMockData = (symbol) => {
    const data = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    
    let baseValue = Math.random() * 10 - 5; // Random starting percentage between -5% and 5%
    
    for (let i = 0; i < 250; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Add some realistic stock movement
      const change = (Math.random() - 0.5) * 2; // Random change between -1% and 1%
      baseValue += change;
      
      // Add some trend based on symbol
      if (symbol === 'AAPL') baseValue += 0.02; // Apple trending up
      if (symbol === 'GOOGL') baseValue -= 0.01; // Google slight decline
      if (symbol === 'MSFT') baseValue += 0.015; // Microsoft moderate growth
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: baseValue
      });
    }
    
    return data;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Stock Performance Comparison</h2>
            <p className="text-sm text-gray-600 mt-1">Compare multiple stocks over time</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="1M">1 Month</option>
              <option value="3M">3 Months</option>
              <option value="6M">6 Months</option>
              <option value="1Y">1 Year</option>
              <option value="2Y">2 Years</option>
            </select>
            
            <Link 
              to="/comparison" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              Customize
            </Link>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center space-x-6 mt-4">
          {comparisonData.map((stock) => (
            <div key={stock.symbol} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: stock.color }}
              ></div>
              <span className="text-sm font-medium text-gray-700">{stock.symbol}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : comparisonData.length > 0 ? (
          <div className="h-48">
            <StockChart
              data={comparisonData}
              type="comparison"
              height={180}
              showLegend={false}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No comparison data</h3>
            <p className="mt-2 text-gray-600">Unable to load stock comparison data</p>
          </div>
        )}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    watchlists, 
    trendingStocks, 
    marketStatus, 
    loading,
    fetchWatchlists,
    fetchTrendingStocks,
    fetchMarketStatus
  } = useStock();

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [totalStocks, setTotalStocks] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        await Promise.all([
          fetchWatchlists(),
          fetchTrendingStocks(),
          fetchMarketStatus()
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [fetchWatchlists, fetchTrendingStocks, fetchMarketStatus]);

  useEffect(() => {
    if (watchlists && watchlists.length > 0) {
      let totalValue = 0;
      let totalChange = 0;
      let stockCount = 0;

      watchlists.forEach(watchlist => {
        totalValue += watchlist.totalValue || 0;
        totalChange += watchlist.totalGainLoss || 0;
        stockCount += watchlist.stocks?.length || 0;
      });

      setPortfolioValue(totalValue);
      setPortfolioChange(totalChange);
      setTotalStocks(stockCount);
    } else {
      // Set default values when no watchlists
      setPortfolioValue(0);
      setPortfolioChange(0);
      setTotalStocks(0);
    }
  }, [watchlists]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value) => {
    if (portfolioValue === 0) return '0.00%';
    const percentage = (value / portfolioValue) * 100;
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  const getMarketStatusColor = () => {
    if (!marketStatus) return 'text-gray-500';
    return marketStatus.isOpen ? 'text-green-600' : 'text-orange-600';
  };

  const getMarketStatusText = () => {
    if (!marketStatus) return 'Loading...';
    return marketStatus.isOpen ? 'Market Open' : 'Market Closed';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="medium" message="Loading your dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="mt-2 text-gray-600">
            Here's your portfolio overview and market insights
          </p>
        </div>

        {/* Market Status */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-4 inline-block">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                marketStatus?.isOpen ? 'bg-green-500' : 'bg-orange-500'
              }`}></div>
              <span className={`font-medium ${getMarketStatusColor()}`}>
                {getMarketStatusText()}
              </span>
              {marketStatus?.nextClose && (
                <span className="text-gray-500 text-sm">
                  • Closes at {marketStatus.nextClose}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(portfolioValue)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Gain/Loss</p>
                <p className={`text-2xl font-bold ${
                  portfolioChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(portfolioChange)}
                </p>
                <p className={`text-sm ${
                  portfolioChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercent(portfolioChange)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${
                portfolioChange >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  portfolioChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={portfolioChange >= 0 ? 
                      "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : 
                      "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    } 
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Stocks</p>
                <p className="text-2xl font-bold text-gray-900">{totalStocks}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Watchlists</p>
                <p className="text-2xl font-bold text-gray-900">{watchlists ? watchlists.length : 0}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Comparison Chart */}
        <div className="mb-8">
          <StockComparisonWidget />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Watchlists */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Recent Watchlists</h2>
                <Link 
                  to="/watchlists" 
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  View all →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {!watchlists || watchlists.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No watchlists yet</h3>
                  <p className="mt-2 text-gray-600">Get started by creating your first watchlist</p>
                  <Link 
                    to="/watchlists" 
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Create Watchlist
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {watchlists && watchlists.slice(0, 3).map((watchlist) => (
                    <div key={watchlist._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div>
                        <h3 className="font-medium text-gray-900">{watchlist.name}</h3>
                        <p className="text-sm text-gray-600">
                          {watchlist.stocks?.length || 0} stocks • {formatCurrency(watchlist.totalValue || 0)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          (watchlist.totalGainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(watchlist.totalGainLoss || 0) >= 0 ? '+' : ''}{formatCurrency(watchlist.totalGainLoss || 0)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Trending Stocks */}
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Trending Stocks</h2>
                <Link 
                  to="/search" 
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Search stocks →
                </Link>
              </div>
            </div>
            <div className="p-6">
              {!trendingStocks || trendingStocks.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No trending data</h3>
                  <p className="mt-2 text-gray-600">Market data will appear here when available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trendingStocks && trendingStocks.slice(0, 5).map((stock, index) => (
                    <div key={stock.symbol || index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {stock.symbol?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{stock.symbol || 'Unknown'}</p>
                          <p className="text-sm text-gray-600">{stock.name || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(stock.price || 0)}
                        </p>
                        <p className={`text-sm ${
                          (stock.change || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(stock.change || 0) >= 0 ? '+' : ''}{stock.changePercent || '0.00'}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/search" 
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">Search Stocks</p>
              </div>
            </Link>

            <Link 
              to="/watchlists" 
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">Add Watchlist</p>
              </div>
            </Link>

            <Link 
              to="/compare" 
              className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-medium text-gray-900">Compare Stocks</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;