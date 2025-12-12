# Stock Market Tracker

A full-stack web application for tracking stock prices, managing watchlists, and visualizing portfolio performance with real-time data.

## 🚀 Features

- **Real-time Stock Data** - Live price updates from Alpha Vantage API
- **Interactive Charts** - Visual price history and performance tracking
- **Personal Watchlists** - Save and organize your favorite stocks
- **Portfolio Management** - Track your investments and gains/losses
- **Responsive Design** - Works seamlessly on desktop and mobile
- **User Authentication** - Secure user accounts with JWT tokens

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern hooks and functional components
- **Chart.js** - Interactive data visualization
- **CSS3** - Responsive design with Grid and Flexbox
- **Axios** - HTTP client for API requests

### Backend
- **Node.js & Express** - RESTful API server
- **MongoDB & Mongoose** - Database and ODM
- **JWT** - Authentication and authorization
- **Alpha Vantage API** - Real-time stock market data
- **bcryptjs** - Password hashing

### Deployment
- **Frontend**: Vercel/Netlify
- **Backend**: Railway/Render
- **Database**: MongoDB Atlas

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Alpha Vantage API key (free at alphavantage.co)

### Quick Start

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd stock-market-tracker
```

2. **Install all dependencies**
```bash
npm run install-all
```

3. **Environment Setup**

Create `.env` files in both frontend and backend directories:

**Backend `.env`:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
```

**Frontend `.env`:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. **Start the application**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🏗 Project Structure

```
stock-market-tracker/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   ├── context/         # React context providers
│   │   ├── styles/          # CSS stylesheets
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                  # Express API server
│   ├── models/              # MongoDB models
│   ├── routes/              # API route handlers
│   ├── middleware/          # Custom middleware
│   ├── controllers/         # Route controllers
│   ├── services/            # Business logic
│   ├── config/              # Configuration files
│   └── package.json
├── package.json             # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)

### Stocks
- `GET /api/stocks/search/:symbol` - Search for stock by symbol
- `GET /api/stocks/quote/:symbol` - Get current stock quote
- `GET /api/stocks/history/:symbol` - Get historical price data

### Watchlists
- `GET /api/watchlists` - Get user's watchlists (protected)
- `POST /api/watchlists` - Create new watchlist (protected)
- `PUT /api/watchlists/:id` - Update watchlist (protected)
- `DELETE /api/watchlists/:id` - Delete watchlist (protected)

## 📱 Components

### Frontend Components
1. **Dashboard** - Overview of watchlists and trending stocks
2. **StockSearch** - Search and add stocks to watchlists
3. **Watchlist** - Display and manage saved stocks
4. **StockChart** - Interactive price charts
5. **Portfolio** - Track investment performance

## 🎯 Advanced Features

- **External API Integration**: Alpha Vantage for real-time stock data
- **Data Visualization**: Interactive charts with Chart.js
- **Authentication**: Secure JWT-based user system
- **Real-time Updates**: Live price updates every 30 seconds
- **Error Handling**: Comprehensive error management
- **Responsive Design**: Mobile-first approach

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
# Deploy dist folder to Vercel
```

### Backend (Railway)
```bash
cd backend
# Push to Railway with environment variables configured
```

## 🔐 Environment Variables

Make sure to set these environment variables in production:

- `NODE_ENV=production`
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `ALPHA_VANTAGE_API_KEY` - Stock data API key
- `PORT` - Server port (usually set by hosting provider)

## 🧪 Testing

```bash
# Run backend tests
cd backend && npm test

# Run frontend tests
cd frontend && npm test
```

## 📊 Features Demonstration

1. **User Registration/Login** - Secure authentication system
2. **Stock Search** - Real-time stock symbol lookup
3. **Watchlist Management** - Add, remove, organize stocks
4. **Interactive Charts** - Price history visualization
5. **Portfolio Tracking** - Investment performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Alpha Vantage for providing free stock market data
- Chart.js for excellent charting capabilities
- MongoDB for reliable database service

---

**Live Demo**: [Your Deployment URL Here]

**Author**: Your Name  
**Contact**: your.email@example.com