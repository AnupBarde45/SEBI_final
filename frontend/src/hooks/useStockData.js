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
        // Use realistic case study data
        const mockData = generateMockData(symbol, timeRange);
        setData({ 
          c: mockData.prices,
          timestamps: mockData.timestamps,
          caseStudy: mockData.caseStudy
        });
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const generateMockData = (stockSymbol, range) => {
      const dataPoints = {
        '1H': 12,   // 12 points (5-minute intervals)
        '1D': 24,   // 24 points (hourly)
        '1W': 35,   // 35 points (daily for a week + extra)
        '1M': 30    // 30 points (daily for a month)
      }[range] || 24;
      
      const timeInterval = {
        '1H': 5 * 60 * 1000,      // 5 minutes
        '1D': 60 * 60 * 1000,     // 1 hour
        '1W': 24 * 60 * 60 * 1000, // 1 day
        '1M': 24 * 60 * 60 * 1000  // 1 day
      }[range] || 60 * 60 * 1000;
      
      // Real case studies with actual events
      const caseStudies = {
        'AAPL': {
          basePrice: 175,
          event: 'iPhone 15 Launch Week (Sept 2023)',
          scenario: 'launch_success',
          startDate: '2023-09-12'
        },
        'GOOGL': {
          basePrice: 125,
          event: 'AI Bard vs ChatGPT Competition (Feb 2023)',
          scenario: 'ai_competition',
          startDate: '2023-02-06'
        },
        'MSFT': {
          basePrice: 340,
          event: 'ChatGPT Integration Announcement (Jan 2023)',
          scenario: 'ai_boom',
          startDate: '2023-01-23'
        },
        'TSLA': {
          basePrice: 240,
          event: 'Elon Musk Twitter Acquisition Impact (Oct 2022)',
          scenario: 'ceo_distraction',
          startDate: '2022-10-27'
        },
        'AMZN': {
          basePrice: 95,
          event: 'Holiday Shopping Season (Nov 2023)',
          scenario: 'seasonal_boost',
          startDate: '2023-11-20'
        },
        'NVDA': {
          basePrice: 420,
          event: 'AI Chip Demand Surge (May 2023)',
          scenario: 'ai_hardware_boom',
          startDate: '2023-05-24'
        }
      };
      
      const study = caseStudies[stockSymbol] || caseStudies['AAPL'];
      const prices = [];
      const timestamps = [];
      let currentPrice = study.basePrice;
      
      // Generate realistic price movements based on actual scenarios
      for (let i = 0; i < dataPoints; i++) {
        let change = 0;
        
        switch (study.scenario) {
          case 'launch_success':
            // iPhone launch: initial excitement, then stabilization
            if (i < 5) change = Math.random() * 8 - 2; // Big gains early
            else if (i < 15) change = Math.random() * 4 - 2; // Moderate movement
            else change = Math.random() * 2 - 1; // Stabilization
            break;
            
          case 'ai_competition':
            // Google AI: volatile due to competition
            change = (Math.random() - 0.5) * 12; // High volatility
            break;
            
          case 'ai_boom':
            // Microsoft AI: steady upward trend
            change = Math.random() * 6 - 1; // Mostly positive
            break;
            
          case 'ceo_distraction':
            // Tesla CEO issues: declining trend
            change = Math.random() * 4 - 6; // Mostly negative
            break;
            
          case 'seasonal_boost':
            // Amazon holiday: gradual increase
            change = Math.random() * 5 - 1.5; // Gradual upward
            break;
            
          case 'ai_hardware_boom':
            // NVIDIA AI chips: explosive growth
            if (i < 10) change = Math.random() * 15 - 2; // Massive gains
            else change = Math.random() * 8 - 3; // Continued growth
            break;
            
          default:
            change = (Math.random() - 0.5) * 4;
        }
        
        currentPrice += change;
        currentPrice = Math.max(currentPrice, study.basePrice * 0.7); // Floor price
        prices.push(currentPrice);
        
        // Generate realistic timestamps based on range
        const startDate = new Date(study.startDate);
        const timestamp = new Date(startDate.getTime() + (i * timeInterval));
        timestamps.push(timestamp);
      }
      
      return { prices, timestamps, caseStudy: study };
    };

    if (symbol) {
      getStockData();
    }
  }, [symbol, timeRange]);

  return { data, loading, error };
}