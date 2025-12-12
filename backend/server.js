const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stocks');
const watchlistRoutes = require('./routes/watchlists');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS check for origin:', origin);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? [
          'https://693b9504e2bd450008ff4259--animated-marshmallow-9bff49.netlify.app',
          'https://animated-marshmallow-9bff49.netlify.app',
          'https://stock-market-tracker-frontend.netlify.app',
          'https://stock-market-tracker-frontend-wgz9.onrender.com',
          'https://stock-market-frontend.onrender.com'
        ] 
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173'];
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    // Check if origin is allowed or matches Netlify/Render pattern
    if (allowedOrigins.indexOf(origin) !== -1 || 
        (origin && origin.match(/.*\.netlify\.app$/)) ||
        (origin && origin.match(/.*\.onrender\.com$/))) {
      console.log('CORS: Allowing origin:', origin);
      return callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      return callback(new Error(`CORS policy violation: Origin ${origin} not allowed`), false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Access-Control-Allow-Credentials',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Headers'
  ],
  preflightContinue: false,
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar']
}));

// Handle preflight requests
app.options('*', (req, res) => {
  console.log('Preflight request received for:', req.originalUrl);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
  res.sendStatus(200);
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection
console.log('🔗 Attempting MongoDB connection...');
console.log('📍 MongoDB URI exists:', !!process.env.MONGODB_URI);
console.log('📍 MongoDB URI starts with mongodb:', process.env.MONGODB_URI?.startsWith('mongodb'));

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log('📊 Connection details:', {
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('🔍 Error details:', {
    name: err.name,
    code: err.code,
    codeName: err.codeName,
    message: err.message
  });
});

// MongoDB connection event listeners
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    mongoReadyStates: {
      0: 'disconnected',
      1: 'connected', 
      2: 'connecting',
      3: 'disconnecting'
    },
    currentState: mongoose.connection.readyState
  });
});

// Database test endpoint
app.get('/api/test-db', async (req, res) => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      message: 'Database connection working',
      userCount,
      mongoStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
  } catch (error) {
    console.error('❌ Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message,
      mongoStatus: mongoose.connection.readyState
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/watchlists', watchlistRoutes);
app.use('/api/users', userRoutes);



// Database check route
app.get('/api/db-check', async (req, res) => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    const users = await User.find({}).select('username email firstName lastName createdAt');
    
    res.json({
      status: 'OK',
      database: {
        connected: mongoose.connection.readyState === 1,
        name: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      },
      users: {
        count: userCount,
        list: users
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Database check failed',
      error: error.message
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Stock Market Tracker API!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      stocks: '/api/stocks',
      watchlists: '/api/watchlists',
      users: '/api/users'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 API URL: ${process.env.NODE_ENV === 'production' ? `https://stock-market-backend.onrender.com/api` : `http://localhost:${PORT}/api`}`);
  console.log(`🔗 Health check: ${process.env.NODE_ENV === 'production' ? `https://stock-market-backend.onrender.com/api/health` : `http://localhost:${PORT}/api/health`}`);
  console.log(`📡 CORS origins configured for production`);
  console.log(`💾 MongoDB URI configured: ${process.env.MONGODB_URI ? 'YES' : 'NO'}`);
  console.log(`🔑 JWT Secret configured: ${process.env.JWT_SECRET ? 'YES' : 'NO'}`);
});

module.exports = app;
