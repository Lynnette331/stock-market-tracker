# Single API Configuration

## Overview
The stock market application now uses **only one API function** from Alpha Vantage: `GLOBAL_QUOTE`

## What Changed
- **Before**: Used 3 different Alpha Vantage functions (GLOBAL_QUOTE, SYMBOL_SEARCH, OVERVIEW)
- **After**: Uses only GLOBAL_QUOTE function with enhanced built-in data

## Benefits
1. **Reduced API calls**: Fewer requests to Alpha Vantage
2. **Lower costs**: Less API usage means lower costs
3. **Faster responses**: Single API call instead of multiple parallel calls
4. **Simplified code**: Easier to maintain and debug
5. **Better reliability**: Less dependent on multiple API endpoints

## How It Works

### Stock Search
- Uses built-in company mapping for popular stocks (AAPL, GOOGL, MSFT, etc.)
- No external API calls for search functionality
- Instant search results

### Stock Data
- Single `GLOBAL_QUOTE` API call provides: price, change, volume, high/low
- Enhanced with calculated fields: bid/ask prices, estimated market cap, P/E ratio
- Built-in company information (name, sector, industry)

### Company Information
- Pre-mapped data for major stocks
- Estimated financial metrics
- No separate OVERVIEW API calls needed

## API Usage Optimization
- Only calls Alpha Vantage when getting real-time stock quotes
- All other data (search, company info) is handled locally
- Maintains full functionality with minimal API usage

## Supported Stocks
Currently includes built-in data for:
- AAPL (Apple Inc.)
- GOOGL (Alphabet Inc.)
- MSFT (Microsoft Corporation)
- TSLA (Tesla Inc.)
- AMZN (Amazon.com Inc.)
- META (Meta Platforms Inc.)
- NVDA (NVIDIA Corporation)
- NFLX (Netflix Inc.)
- AMD (Advanced Micro Devices Inc.)
- INTC (Intel Corporation)

## Adding New Stocks
To add support for new stocks, update the `companyNames` object in `/backend/routes/stocks.js`

```javascript
const companyNames = {
  'NEWSTOCK': { 
    name: 'New Company Inc.', 
    sector: 'Technology', 
    industry: 'Software' 
  },
  // ... existing stocks
};
```