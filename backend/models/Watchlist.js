const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: [true, 'Stock symbol is required'],
    uppercase: true,   //auto uppercase
    trim: true,
    maxlength: [10, 'Symbol cannot exceed 10 characters']
  },

  currentPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  previousPrice: {
    type: Number,
    default: 0,
    min: 0
  },
  dateAdded: {
    type: Date,
    required: [true, 'Date added is required'],
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    trim: true
  }
}, {
  _id: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for price change percentage
stockSchema.virtual('priceChangePercent').get(function() {
  if (!this.previousPrice || this.previousPrice === 0) return 0;
  return (((this.currentPrice - this.previousPrice) / this.previousPrice) * 100).toFixed(2);
});

// Virtual for price change amount
stockSchema.virtual('priceChange').get(function() {
  if (!this.previousPrice) return 0;
  return (this.currentPrice - this.previousPrice).toFixed(2);
});

const watchlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Watchlist name is required'],
    trim: true,
    maxlength: [100, 'Watchlist name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  stocks: [stockSchema],
  isPublic: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#3B82F6'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total stocks count
watchlistSchema.virtual('totalStocks').get(function() {
  return this.stocks.length;
});

// Virtual for average price change of watched stocks
watchlistSchema.virtual('avgPriceChange').get(function() {
  if (this.stocks.length === 0) return 0;
  const totalChange = this.stocks.reduce((total, stock) => {
    return total + parseFloat(stock.priceChangePercent || 0);
  }, 0);
  return (totalChange / this.stocks.length).toFixed(2);
});

// Instance method to add stock for tracking
watchlistSchema.methods.addStock = function(stockData) {
  const existingStock = this.stocks.find(stock => stock.symbol === stockData.symbol);
  
  if (existingStock) {
    // Update existing stock's current price and notes
    existingStock.previousPrice = existingStock.currentPrice;
    existingStock.currentPrice = stockData.currentPrice || existingStock.currentPrice;
    existingStock.notes = stockData.notes || existingStock.notes;
  } else {
    // Add new stock to watchlist
    this.stocks.push({
      symbol: stockData.symbol,
      currentPrice: stockData.currentPrice || 0,
      previousPrice: stockData.previousPrice || 0,
      dateAdded: new Date(),
      notes: stockData.notes || ''
    });
  }
  
  return this.save();
};

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;