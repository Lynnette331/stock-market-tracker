# Alpha Vantage API Setup Instructions

## Getting Your Free API Key

1. **Visit Alpha Vantage**: Go to https://www.alphavantage.co/support/#api-key
2. **Sign up for free**: Click "GET YOUR FREE API KEY TODAY"
3. **Fill out the form**: Provide your email and basic information
4. **Get your API key**: You'll receive a free API key via email

## Updating Your Environment

1. **Open your `.env` file** in the backend folder
2. **Replace the demo key** with your actual API key:
   ```
   ALPHA_VANTAGE_API_KEY=YOUR_ACTUAL_API_KEY_HERE
   ```
3. **Save the file** and restart your backend server

## API Limits

- **Free tier**: 5 API requests per minute, 500 requests per day
- **Rate limiting**: The app includes caching to minimize API calls
- **Fallback**: If API fails or limits are hit, mock data will be used

## Testing the Integration

1. **Start your backend server**: `npm start` in the backend folder
2. **Test endpoints**:
   - Search: `GET /api/stocks/search/apple`
   - Quote: `GET /api/stocks/quote/AAPL`
   - Trending: `GET /api/stocks/trending`

## Features Now Available

✅ **Live Stock Search**: Real company and symbol search
✅ **Real-time Quotes**: Current stock prices with live data
✅ **Trending Stocks**: Live data for popular stocks
✅ **Smart Fallback**: Automatic fallback to mock data if API fails
✅ **Caching**: Reduces API calls and improves performance

## Troubleshooting

- **API calls failing**: Check your API key is correct
- **Rate limit exceeded**: Wait a few minutes or use demo key for testing
- **No data returned**: Some symbols may not be available in Alpha Vantage