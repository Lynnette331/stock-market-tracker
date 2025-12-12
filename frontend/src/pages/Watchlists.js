import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useStock } from '../context/StockContext';
import LoadingSpinner from '../components/LoadingSpinner';
import StockChart from '../components/StockChart';

const MarketOverviewChart = () => {
  const [marketData, setMarketData] = useState([]);
  const [timeFrame, setTimeFrame] = useState('1D');
  const [selectedMetric, setSelectedMetric] = useState('volume');

  useEffect(() => {
    // Generate realistic candlestick/volume data similar to the image
    const generateMarketData = () => {
      const data = [];
      const today = new Date();
      const hours = timeFrame === '1D' ? 24 : timeFrame === '1W' ? 168 : 720;
      
      let basePrice = 150;
      let baseVolume = 1000000;
      
      for (let i = 0; i < (timeFrame === '1D' ? 48 : timeFrame === '1W' ? 168 : 360); i++) {
        const time = new Date(today.getTime() - (hours - i) * 60 * 60 * 1000);
        
        // Generate realistic price movement
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * volatility * basePrice;
        basePrice += change;
        
        // Generate realistic volume with spikes
        const volumeMultiplier = Math.random() < 0.1 ? Math.random() * 3 + 1 : Math.random() * 0.5 + 0.7;
        const volume = baseVolume * volumeMultiplier;
        
        data.push({
          time: time.toISOString(),
          price: basePrice,
          volume: Math.floor(volume),
          high: basePrice + Math.random() * 2,
          low: basePrice - Math.random() * 2,
          open: basePrice + (Math.random() - 0.5),
          close: basePrice
        });
      }
      
      return data;
    };

    setMarketData(generateMarketData());
  }, [timeFrame]);

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 rounded-2xl overflow-hidden shadow-2xl">
        {/* Chart Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Market Overview</h2>
              <div className="flex items-center space-x-4 text-blue-100">
                <span className="text-sm">S&P 500</span>
                <span className="text-sm">•</span>
                <span className="text-sm">Real-time Data</span>
                <span className="text-sm">•</span>
                <span className="text-green-400 text-sm">+2.45%</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Time Frame Selector */}
              <div className="flex bg-blue-800 rounded-lg p-1">
                {['1D', '1W', '1M'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeFrame(period)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                      timeFrame === period
                        ? 'bg-white text-blue-900'
                        : 'text-blue-200 hover:text-white'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
              
              {/* Metric Selector */}
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="bg-blue-800 text-white border-blue-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="volume">Volume</option>
                <option value="price">Price</option>
                <option value="marketcap">Market Cap</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Chart */}
        <div className="p-6 pt-4">
          <div className="bg-gradient-to-b from-blue-900/50 to-transparent rounded-xl p-4" style={{ height: '200px' }}>
            {/* Simulated Candlestick Chart */}
            <div className="relative w-full h-full flex items-end justify-between px-4">
              {marketData.slice(-50).map((point, index) => {
                const height = Math.max(10, (point.volume / 2000000) * 200);
                const isPositive = point.close > point.open;
                
                return (
                  <div key={index} className="flex flex-col items-center" style={{ width: '2px' }}>
                    {/* Volume Bar */}
                    <div
                      className={`w-1 ${
                        selectedMetric === 'volume' 
                          ? isPositive ? 'bg-green-400' : 'bg-red-400'
                          : 'bg-blue-300'
                      } opacity-70 mb-1`}
                      style={{ height: `${Math.min(height, 180)}px` }}
                    />
                    
                    {/* Price Candlestick */}
                    {selectedMetric === 'price' && (
                      <div className="relative">
                        {/* High-Low Line */}
                        <div
                          className="w-0.5 bg-gray-300 absolute left-1/2 transform -translate-x-1/2"
                          style={{ height: '20px', top: '-10px' }}
                        />
                        {/* Body */}
                        <div
                          className={`w-2 ${
                            isPositive ? 'bg-green-400' : 'bg-red-400'
                          }`}
                          style={{ height: '8px' }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Grid Lines */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full opacity-20">
                {/* Horizontal Lines */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-full border-t border-blue-400"
                    style={{ top: `${(i + 1) * 20}%` }}
                  />
                ))}
                {/* Vertical Lines */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-full border-l border-blue-400"
                    style={{ left: `${(i + 1) * 16.66}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Chart Stats */}
          <div className="flex justify-between items-center mt-4 text-blue-100 text-sm">
            <div className="flex space-x-6">
              <span>High: $4,567.89</span>
              <span>Low: $4,432.10</span>
              <span>Volume: 1.2B</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Market Open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Watchlists = () => {
  const {
    watchlists,
    loading,
    fetchWatchlists,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addStockToWatchlist,
    removeStockFromWatchlist
  } = useStock();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingWatchlist, setEditingWatchlist] = useState(null);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [newWatchlistDescription, setNewWatchlistDescription] = useState('');
  const [addStockSymbol, setAddStockSymbol] = useState('');
  const [addStockQuantity, setAddStockQuantity] = useState('');
  const [addStockPrice, setAddStockPrice] = useState('');
  const [selectedWatchlist, setSelectedWatchlist] = useState(null);
  const [showAddStockModal, setShowAddStockModal] = useState(false);

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  const handleCreateWatchlist = async (e) => {
    e.preventDefault();
    if (!newWatchlistName.trim()) return;

    try {
      await createWatchlist({
        name: newWatchlistName,
        description: newWatchlistDescription
      });
      setNewWatchlistName('');
      setNewWatchlistDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating watchlist:', error);
    }
  };

  const handleUpdateWatchlist = async (e) => {
    e.preventDefault();
    if (!editingWatchlist || !newWatchlistName.trim()) return;

    try {
      await updateWatchlist(editingWatchlist._id, {
        name: newWatchlistName,
        description: newWatchlistDescription
      });
      setEditingWatchlist(null);
      setNewWatchlistName('');
      setNewWatchlistDescription('');
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const handleDeleteWatchlist = async (watchlistId) => {
    if (window.confirm('Are you sure you want to delete this watchlist?')) {
      try {
        await deleteWatchlist(watchlistId);
      } catch (error) {
        console.error('Error deleting watchlist:', error);
      }
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    if (!selectedWatchlist || !addStockSymbol.trim()) return;

    try {
      const stockData = {
        symbol: addStockSymbol.toUpperCase(),
        quantity: parseInt(addStockQuantity) || 1
      };
      
      // Only include purchasePrice if user provided a value > 0
      if (addStockPrice && parseFloat(addStockPrice) > 0) {
        stockData.purchasePrice = parseFloat(addStockPrice);
      } else {
        // Set a minimal purchase price to satisfy backend validation
        stockData.purchasePrice = 0.01;
      }

      await addStockToWatchlist(selectedWatchlist._id, stockData);
      setAddStockSymbol('');
      setAddStockQuantity('');
      setAddStockPrice('');
      setShowAddStockModal(false);
      setSelectedWatchlist(null);
    } catch (error) {
      console.error('Error adding stock:', error);
      alert('Failed to add stock. Please try again.');
    }
  };

  const handleRemoveStock = async (watchlistId, stockId) => {
    if (window.confirm('Are you sure you want to remove this stock?')) {
      try {
        await removeStockFromWatchlist(watchlistId, stockId);
      } catch (error) {
        console.error('Error removing stock:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const startEdit = (watchlist) => {
    setEditingWatchlist(watchlist);
    setNewWatchlistName(watchlist.name);
    setNewWatchlistDescription(watchlist.description || '');
  };

  const cancelEdit = () => {
    setEditingWatchlist(null);
    setNewWatchlistName('');
    setNewWatchlistDescription('');
  };

  const openAddStockModal = (watchlist) => {
    setSelectedWatchlist(watchlist);
    setShowAddStockModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="medium" message="Loading your watchlists..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Watchlists</h1>
              <p className="mt-2 text-gray-600">
                Track your favorite stocks and monitor portfolio performance
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-2 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 15 15">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 4v16m8-8H4" />
              </svg>
              Create Watchlist
            </button>
          </div>
        </div>

        {/* Market Overview Chart */}
        <MarketOverviewChart />

        {/* Watchlists Grid */}
        {watchlists.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No watchlists yet</h3>
            <p className="mt-2 text-gray-600 max-w-sm mx-auto">
              Create your first watchlist to start tracking your favorite stocks and building your portfolio.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Your First Watchlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {watchlists.map((watchlist) => (
              <div key={watchlist._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Watchlist Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {editingWatchlist?._id === watchlist._id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={newWatchlistName}
                            onChange={(e) => setNewWatchlistName(e.target.value)}
                            className="w-full text-lg font-semibold border rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Watchlist name"
                          />
                          <textarea
                            value={newWatchlistDescription}
                            onChange={(e) => setNewWatchlistDescription(e.target.value)}
                            className="w-full text-sm text-gray-600 border rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Description (optional)"
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={handleUpdateWatchlist}
                              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{watchlist.name}</h3>
                          {watchlist.description && (
                            <p className="text-sm text-gray-600">{watchlist.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                    {editingWatchlist?._id !== watchlist._id && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEdit(watchlist)}
                          className="p-2 text-gray-400 hover:text-gray-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteWatchlist(watchlist._id)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Watchlist Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">
                        {watchlist.stocks?.length || 0}
                      </p>
                      <p className="text-xs text-gray-600">Stocks</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(watchlist.totalValue || 0)}
                      </p>
                      <p className="text-xs text-gray-600">Value</p>
                    </div>
                  </div>

                  {/* Gain/Loss */}
                  <div className={`text-center p-3 rounded-lg mb-4 ${
                    (watchlist.totalGainLoss || 0) >= 0 ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <p className="text-sm font-medium">
                      {(watchlist.totalGainLoss || 0) >= 0 ? '+' : ''}{formatCurrency(watchlist.totalGainLoss || 0)}
                    </p>
                    <p className="text-xs opacity-75">Total Gain/Loss</p>
                  </div>

                  {/* Stocks List Preview */}
                  {watchlist.stocks && watchlist.stocks.length > 0 ? (
                    <div className="space-y-2 mb-4">
                      {watchlist.stocks.slice(0, 3).map((stock, index) => (
                        <div key={stock._id || index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">{stock.symbol}</span>
                            <span className="text-xs text-gray-600">×{stock.quantity}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{formatCurrency(stock.currentPrice || stock.purchasePrice || 0)}</p>
                            <p className={`text-xs ${
                              (stock.gainLoss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {(stock.gainLoss || 0) >= 0 ? '+' : ''}{formatCurrency(stock.gainLoss || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {watchlist.stocks.length > 3 && (
                        <p className="text-xs text-gray-600 text-center">
                          +{watchlist.stocks.length - 3} more stocks
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 mb-4">
                      <p className="text-sm text-gray-600">No stocks in this watchlist</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openAddStockModal(watchlist)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                    >
                      Add Stock
                    </button>
                    <Link
                      to={`/portfolio?watchlist=${watchlist._id}`}
                      className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Watchlist Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Watchlist</h3>
                <form onSubmit={handleCreateWatchlist} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Watchlist Name *
                    </label>
                    <input
                      type="text"
                      value={newWatchlistName}
                      onChange={(e) => setNewWatchlistName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Tech Stocks, Dividend Portfolio"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={newWatchlistDescription}
                      onChange={(e) => setNewWatchlistDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief description of this watchlist"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewWatchlistName('');
                        setNewWatchlistDescription('');
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      Create Watchlist
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Stock Modal */}
        {showAddStockModal && selectedWatchlist && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add Stock to "{selectedWatchlist.name}"
                </h3>
                <form onSubmit={handleAddStock} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Symbol *
                    </label>
                    <input
                      type="text"
                      value={addStockSymbol}
                      onChange={(e) => setAddStockSymbol(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., AAPL, GOOGL, MSFT"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity (Optional)
                    </label>
                    <input
                      type="number"
                      value={addStockQuantity}
                      onChange={(e) => setAddStockQuantity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="1"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Price (Optional)
                    </label>
                    <input
                      type="number"
                      value={addStockPrice}
                      onChange={(e) => setAddStockPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter price for tracking"
                      min="0"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to track stock without price reference</p>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddStockModal(false);
                        setSelectedWatchlist(null);
                        setAddStockSymbol('');
                        setAddStockQuantity('');
                        setAddStockPrice('');
                      }}
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

export default Watchlists;