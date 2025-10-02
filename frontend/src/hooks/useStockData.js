import { useState, useEffect } from 'react';

export default function useStockData(symbol, timeRange = '1D') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStockData = async () => {
      setLoading(true);
      setError(null);
      try {
        const intervalMap = {
          '1H': '5min',
          '1D': 'daily',
          '1W': 'daily',
          '1M': 'daily'
        };
        
        const interval = intervalMap[timeRange] || 'daily';
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/stock/${symbol}?interval=${interval}`);
        const alphaData = await response.json();
        
        const processedData = processAlphaVantageData(alphaData, timeRange);
        setData(processedData);
        
        const generateFallbackData = (range) => {
          const maxPoints = { '1H': 12, '1D': 24, '1W': 7, '1M': 30 }[range] || 24;
          const prices = [];
          const timestamps = [];
          const basePrice = 150 + Math.random() * 100;
          
          for (let i = 0; i < maxPoints; i++) {
            const date = new Date();
            date.setHours(date.getHours() - (maxPoints - i));
            timestamps.push(date);
            const volatility = 0.02;
            const change = (Math.random() - 0.5) * volatility;
            const price = i === 0 ? basePrice : prices[i - 1] * (1 + change);
            prices.push(Math.max(1, price));
          }
          
          return {
            c: prices, timestamps, symbol, isRealData: false,
            lastRefreshed: new Date().toISOString(), timeZone: 'US/Eastern',
            dataSource: 'Simulated Data (Network Error)', timeRange: range,
            totalPoints: prices.length, dateRange: { start: timestamps[0], end: timestamps[timestamps.length - 1] }
          };
        };
      } catch (err) {
        console.error('API Error, using fallback:', err);
        const fallbackData = generateFallbackData(timeRange);
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    const generateFallbackData = (range) => {
      const maxPoints = { '1H': 12, '1D': 24, '1W': 7, '1M': 30 }[range] || 24;
      const prices = [];
      const timestamps = [];
      const basePrice = 150 + Math.random() * 100;
      
      for (let i = 0; i < maxPoints; i++) {
        const date = new Date();
        date.setHours(date.getHours() - (maxPoints - i));
        timestamps.push(date);
        const volatility = 0.02;
        const change = (Math.random() - 0.5) * volatility;
        const price = i === 0 ? basePrice : prices[i - 1] * (1 + change);
        prices.push(Math.max(1, price));
      }
      
      return {
        c: prices, timestamps, symbol, isRealData: false,
        lastRefreshed: new Date().toISOString(), timeZone: 'US/Eastern',
        dataSource: 'Simulated Data (API Rate Limited)', timeRange: range,
        totalPoints: prices.length, dateRange: { start: timestamps[0], end: timestamps[timestamps.length - 1] }
      };
    };

    const processAlphaVantageData = (alphaData, range) => {
      // Check for API rate limit or errors
      if (!alphaData || alphaData['Error Message'] || alphaData['Note'] || alphaData['Information']) {
        console.log('Alpha Vantage API limited, using fallback data');
        return generateFallbackData(range);
      }
      
      let timeSeries;
      if (alphaData['Time Series (5min)']) timeSeries = alphaData['Time Series (5min)'];
      else if (alphaData['Time Series (Daily)']) timeSeries = alphaData['Time Series (Daily)'];
      else if (alphaData['Weekly Time Series']) timeSeries = alphaData['Weekly Time Series'];
      else if (alphaData['Monthly Time Series']) timeSeries = alphaData['Monthly Time Series'];
      else {
        console.log('No time series found, using fallback');
        return generateFallbackData(range);
      }
      
      const dates = Object.keys(timeSeries).sort();
      const maxPoints = {
        '1H': 12,
        '1D': 24,
        '1W': 7,
        '1M': 30
      }[range] || 24;
      
      const recentDates = dates.slice(-maxPoints);
      const prices = [];
      const timestamps = [];
      
      recentDates.forEach(date => {
        const dayData = timeSeries[date];
        prices.push(parseFloat(dayData['4. close']));
        timestamps.push(new Date(date));
      });
      
      const metaData = alphaData['Meta Data'];
      const isRealData = !!metaData;
      const lastRefreshed = metaData ? metaData['3. Last Refreshed'] : null;
      const timeZone = metaData ? metaData['5. Time Zone'] : 'Unknown';
      
      return {
        c: prices,
        timestamps: timestamps,
        symbol: metaData ? metaData['2. Symbol'] : symbol,
        isRealData: isRealData,
        lastRefreshed: lastRefreshed,
        timeZone: timeZone,
        dataSource: 'Alpha Vantage (Real Market Data)',
        timeRange: range,
        totalPoints: prices.length,
        dateRange: {
          start: timestamps[0],
          end: timestamps[timestamps.length - 1]
        }
      };
    };

    if (symbol) {
      getStockData();
    }
  }, [symbol, timeRange]);

  return { data, loading, error };
}