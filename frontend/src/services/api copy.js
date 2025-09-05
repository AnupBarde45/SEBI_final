import axios from 'axios';

// Example using Finnhub API - replace with your own API and endpoint
const API_KEY = '1U5ZNA1WI1HT1KFA';
const BASE_URL = 'https://www.alphavantage.co/query';

export const fetchStockCandles = async (symbol, interval = '1min') => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval,
        apikey: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching stock data:', error);
    throw error;
  }
};

// Additional API calls for company info, quotes etc. can be added here.
