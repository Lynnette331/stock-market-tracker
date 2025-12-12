import React, { useState, useEffect, useCallback } from 'react';
import { useStock } from '../context/StockContext';
import StockChart from '../components/StockChart';
import LoadingSpinner from '../components/LoadingSpinner';

const StockComparison = () => {
  const { searchStocks, compareStocks, loading } = useStock();
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [comparisonData, setComparisonData] = useState(null);
  const [period, setPeriod] = useState('1M');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Predefined popular stocks for quick selection
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corporation' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation' },
    { symbol: 'NFLX', name: 'Netflix Inc.' }
  ];

  const periodOptions = [
    { value: '1D', label: '1 Day' },
    { value: '1W', label: '1 Week' },
    { value: '1M', label: '1 Month' },
    { value: '3M', label: '3 Months' },
    { value: '6M', label: '6 Months' },
    { value: '1Y', label: '1 Year' },
    { value: '5Y', label: '5 Years' }
  ];

  // Search for stocks
  const handleSearch = async (query) => {
    if (query.length < 1) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const results = await searchStocks(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    }
  };

  // Add stock to comparison
  const addStock = (stock) => {
    if (selectedStocks.length >= 5) {
      alert('Maximum 5 stocks can be compared at once');
      return;
    }

    if (selectedStocks.find(s => s.symbol === stock.symbol)) {
      alert('Stock is already added to comparison');
      return;
    }

    setSelectedStocks(prev => [...prev, stock]);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Remove stock from comparison
  const removeStock = (symbol) => {
    setSelectedStocks(prev => prev.filter(s => s.symbol !== symbol));
  };

  // Compare selected stocks
  const handleCompare = useCallback(async () => {
    if (selectedStocks.length < 2) {
      alert('Please select at least 2 stocks to compare');
      return;
    }

    try {
      const symbols = selectedStocks.map(s => s.symbol);
      const data = await compareStocks(symbols, period);
      setComparisonData(data);
    } catch (error) {
      console.error('Comparison error:', error);
      alert('Failed to load comparison data');
    }
  }, [selectedStocks, period, compareStocks]);

  // Auto-compare when stocks or period changes
  useEffect(() => {
    if (selectedStocks.length >= 2) {
      handleCompare();
    }
  }, [selectedStocks, period, handleCompare]);

  const getPerformanceColor = (value) => {
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getPerformanceBgColor = (value) => {
    return value >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Stock Comparison</h1>
        <p className="text-gray-600">Compare up to 5 stocks side by side with interactive charts and performance metrics</p>
      </div>

      {/* Stock Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Stocks to Compare</h2>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search for stocks by symbol or company name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {searchResults.map((stock, index) => (
                <button
                  key={index}
                  onClick={() => addStock(stock)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium text-gray-900">{stock.symbol}</span>
                    <span className="text-gray-500 ml-2">{stock.name}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">{stock.sector}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Popular Stocks */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Popular Stocks:</h3>
          <div className="flex flex-wrap gap-2">
            {popularStocks.map((stock) => (
              <button
                key={stock.symbol}
                onClick={() => addStock(stock)}
                disabled={selectedStocks.find(s => s.symbol === stock.symbol)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {stock.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Stocks */}
        {selectedStocks.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Stocks ({selectedStocks.length}/5):</h3>
            <div className="flex flex-wrap gap-2">
              {selectedStocks.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center bg-blue-50 border border-blue-200 rounded-full px-3 py-1"
                >
                  <span className="text-sm font-medium text-blue-900">{stock.symbol}</span>
                  <button
                    onClick={() => removeStock(stock.symbol)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Period Selection */}
      {selectedStocks.length >= 2 && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Time Period</h3>
          <div className="flex flex-wrap gap-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* Comparison Results */}
      {comparisonData && !loading && (
        <>
          {/* Chart */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <StockChart
              data={comparisonData.stocks}
              comparison={true}
              height={350}
              title={`Stock Comparison - ${period}`}
              period={period}
            />
          </div>

          {/* Performance Summary */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
            
            {/* Best/Worst Performers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Best Performer</h4>
                <div className="text-2xl font-bold text-green-600">
                  {comparisonData.summary.bestPerformer?.symbol}
                </div>
                <div className="text-sm text-green-700">
                  +{comparisonData.summary.bestPerformer?.performance.totalReturn}%
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Worst Performer</h4>
                <div className="text-2xl font-bold text-red-600">
                  {comparisonData.summary.worstPerformer?.symbol}
                </div>
                <div className="text-sm text-red-700">
                  {comparisonData.summary.worstPerformer?.performance.totalReturn}%
                </div>
              </div>
            </div>

            {/* Performance Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Return
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volatility
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sharpe Ratio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sector
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {comparisonData.stocks.map((stock, index) => (
                    <tr key={stock.symbol} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${stock.currentPrice.toFixed(2)}</div>
                        <div className={`text-sm ${getPerformanceColor(stock.change)}`}>
                          {stock.changePercent}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPerformanceBgColor(stock.performance.totalReturn)}`}>
                          {stock.performance.totalReturn >= 0 ? '+' : ''}{stock.performance.totalReturn}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stock.performance.volatility.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {stock.performance.sharpeRatio.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stock.sector}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {comparisonData.summary.averageReturn.toFixed(2)}%
                </div>
                <div className="text-sm text-gray-600">Average Return</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {comparisonData.stocks.length}
                </div>
                <div className="text-sm text-gray-600">Stocks Compared</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {period}
                </div>
                <div className="text-sm text-gray-600">Time Period</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {selectedStocks.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Start Comparing Stocks</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            Search and select at least 2 stocks above to begin comparing their performance with interactive charts and detailed metrics.
          </p>
        </div>
      )}
      
      {selectedStocks.length === 1 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <svg className="mx-auto h-16 w-16 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">Add One More Stock</h3>
          <p className="mt-2 text-gray-500 max-w-md mx-auto">
            You have selected {selectedStocks[0].symbol}. Add at least one more stock to start the comparison.
          </p>
        </div>
      )}
    </div>
  );
};

export default StockComparison;