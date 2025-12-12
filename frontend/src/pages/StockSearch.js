import React, { useState, useEffect, useCallback } from 'react';
import { useStock } from '../context/StockContext';
import LoadingSpinner from '../components/LoadingSpinner';

const StockSearch = () => {
  const {
    watchlists,
    searchResults,
    loading,
    searchStocks,
    addStockToWatchlist,
    fetchWatchlists
  } = useStock();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('symbol'); // 'symbol' or 'company'
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedWatchlist, setSelectedWatchlist] = useState('');
  const [stockQuantity, setStockQuantity] = useState('1');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);


  // Popular stocks for suggestions
  const popularStocks = [
    'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX',
    'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'SPOT', 'UBER',
    'JPM', 'BAC', 'WFC', 'GS', 'MS', 'BRK.B', 'V', 'MA'
  ];

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const handleSearch = useCallback(async (query = searchQuery) => {
    if (!query.trim()) return;
    
    setSearchPerformed(true);
    await searchStocks(query, searchType);
  }, [searchQuery, searchType, searchStocks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setPurchasePrice(stock.price?.toString() || '');
  };

  const handleAddToWatchlist = async (e) => {
    e.preventDefault();
    if (!selectedStock || !selectedWatchlist) return;

    try {
      const stockData = {
        symbol: selectedStock.symbol,
        quantity: parseInt(stockQuantity) || 1
      };
      
      // Only include purchasePrice if user provided a value or stock has a price
      if (purchasePrice && parseFloat(purchasePrice) > 0) {
        stockData.purchasePrice = parseFloat(purchasePrice);
      } else if (selectedStock.price && selectedStock.price > 0) {
        stockData.purchasePrice = selectedStock.price;
      }

      await addStockToWatchlist(selectedWatchlist, stockData);

      // Reset form
      setShowAddModal(false);
      setSelectedStock(null);
      setSelectedWatchlist('');
      setStockQuantity('1');
      setPurchasePrice('');
      
      alert('Stock added to watchlist successfully!');
    } catch (error) {
      console.error('Error adding stock to watchlist:', error);
      alert('Error adding stock to watchlist. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (value) => {
    // Handle both string percentages (e.g., "2.50%") and raw numbers
    if (typeof value === 'string') {
      // If it already contains '%', just add the '+' sign if positive
      if (value.includes('%')) {
        const numValue = parseFloat(value.replace('%', ''));
        return `${numValue >= 0 ? '+' : ''}${value}`;
      }
      // If it's a string number, convert to float
      value = parseFloat(value);
    }
    
    // Handle numbers
    if (typeof value === 'number' && !isNaN(value)) {
      return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
    }
    
    // Fallback for invalid values
    return '0.00%';
  };

  const handleQuickSearch = (symbol) => {
    setSearchQuery(symbol);
    setSearchType('symbol');
    handleSearch(symbol);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Stock Search</h1>
          <p className="mt-2 text-gray-600">
            Search for stocks and add them to your watchlists
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Query
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter stock symbol (e.g., AAPL) or company name"
                />
                <button
                  type="submit"
                  disabled={loading || !searchQuery.trim()}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm"
                >
                  {loading ? (
                    <LoadingSpinner size="small" message="" />
                  ) : (
                    <>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search
                    </>
                  )}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="symbol">Symbol</option>
                  <option value="company">Company Name</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Popular Stocks */}
        {!searchPerformed && (
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Popular Stocks</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {popularStocks.map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => handleQuickSearch(symbol)}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="medium" message="Searching stocks..." />
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Search Results ({searchResults.length})
              </h2>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchPerformed(false);
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear search
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((stock, index) => (
                <div key={stock.symbol || index} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">
                            {stock.symbol?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{stock.symbol || 'N/A'}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{stock.name || 'Company name not available'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Price</span>
                        <span className="text-xl font-bold text-gray-900">
                          {stock.price ? formatCurrency(stock.price) : 'N/A'}
                        </span>
                      </div>
                      
                      {/* Bid/Ask Prices */}
                      {stock.bidPrice && stock.askPrice && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Bid (Sell)</p>
                            <p className="text-sm font-semibold text-red-600">
                              {formatCurrency(stock.bidPrice)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-gray-500">Ask (Buy)</p>
                            <p className="text-sm font-semibold text-green-600">
                              {formatCurrency(stock.askPrice)}
                            </p>
                          </div>
                          {stock.spread && (
                            <div className="col-span-2 text-center">
                              <p className="text-xs text-gray-500">
                                Spread: {formatCurrency(stock.spread)}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {stock.change !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Daily Change</span>
                          <div className="text-right">
                            <span className={`text-sm font-medium ${
                              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stock.change >= 0 ? '+' : ''}{formatCurrency(stock.change)}
                            </span>
                            {stock.changePercent !== undefined && (
                              <p className={`text-xs ${
                                stock.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {formatPercent(stock.changePercent)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Trading Status */}
                      {stock.tradingHours && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Market Status</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            stock.tradingHours.isOpen 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {stock.tradingHours.isOpen ? 'OPEN' : 'CLOSED'}
                          </span>
                        </div>
                      )}

                      {/* Company Info */}
                      {stock.sector && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Sector</span>
                          <span className="text-sm font-medium text-gray-900">
                            {stock.sector}
                          </span>
                        </div>
                      )}

                      {stock.marketCap && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Market Cap</span>
                          <span className="text-sm font-medium text-gray-900">
                            {typeof stock.marketCap === 'number' 
                              ? `$${(stock.marketCap / 1000000000).toFixed(1)}B`
                              : stock.marketCap}
                          </span>
                        </div>
                      )}

                      {stock.volume && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Volume</span>
                          <span className="text-sm font-medium text-gray-900">
                            {stock.volume.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {stock.pe && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">P/E Ratio</span>
                          <span className="text-sm font-medium text-gray-900">
                            {stock.pe}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          handleStockSelect(stock);
                          setShowAddModal(true);
                        }}
                        disabled={watchlists.length === 0}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                      >
                        Add to Watchlist
                      </button>
                      <button
                        onClick={() => handleStockSelect(stock)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 text-sm font-medium"
                      >
                        Details
                      </button>
                    </div>

                    {watchlists.length === 0 && (
                      <p className="mt-2 text-xs text-gray-500 text-center">
                        Create a watchlist first to add stocks
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchPerformed ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
            <p className="mt-2 text-gray-600">
              Try searching with a different symbol or company name.
            </p>
          </div>
        ) : null}

        {/* Selected Stock Details Modal */}
        {selectedStock && !showAddModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Stock Details</h3>
                  <button
                    onClick={() => setSelectedStock(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {selectedStock.symbol?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{selectedStock.symbol}</h4>
                      <p className="text-sm text-gray-600">{selectedStock.name}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current Price:</span>
                      <span className="font-semibold">{selectedStock.price ? formatCurrency(selectedStock.price) : 'N/A'}</span>
                    </div>
                    {selectedStock.change !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily Change:</span>
                        <span className={`font-semibold ${
                          selectedStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {selectedStock.change >= 0 ? '+' : ''}{formatCurrency(selectedStock.change)}
                          {selectedStock.changePercent !== undefined && 
                            ` (${formatPercent(selectedStock.changePercent)})`
                          }
                        </span>
                      </div>
                    )}
                    {selectedStock.marketCap && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Market Cap:</span>
                        <span className="font-semibold">{selectedStock.marketCap}</span>
                      </div>
                    )}
                    {selectedStock.volume && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Volume:</span>
                        <span className="font-semibold">{selectedStock.volume.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => {
                        setShowAddModal(true);
                      }}
                      disabled={watchlists.length === 0}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Watchlist
                    </button>
                    <button
                      onClick={() => setSelectedStock(null)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add to Watchlist Modal */}
        {showAddModal && selectedStock && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add to Watchlist</h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {selectedStock.symbol?.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedStock.symbol}</p>
                      <p className="text-sm text-gray-600">
                        {selectedStock.price ? formatCurrency(selectedStock.price) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAddToWatchlist} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Watchlist *
                    </label>
                    <select
                      value={selectedWatchlist}
                      onChange={(e) => setSelectedWatchlist(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Choose a watchlist</option>
                      {watchlists.map((watchlist) => (
                        <option key={watchlist._id} value={watchlist._id}>
                          {watchlist.name} ({watchlist.stocks?.length || 0} stocks)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Price (Optional)
                    </label>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      placeholder={`Current: ${selectedStock.price ? formatCurrency(selectedStock.price) : 'N/A'}`}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Add Stock
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockSearch;