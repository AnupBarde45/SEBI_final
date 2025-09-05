import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ActivityIndicator, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import useStockData from '../hooks/useStockData';
import StockChart from '../components/StockChart';
import ChatBot from '../components/ChatBot';

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
];

export default function StockAnalysisScreen() {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeRange, setTimeRange] = useState('1D');
  const { data, loading, error } = useStockData(symbol, timeRange);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (data && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }, 500);
    }
  }, [data]);

  const selectStock = (stockSymbol) => {
    setSymbol(stockSymbol);
  };

  return (
    <ScrollView style={styles.container} ref={scrollViewRef}>
      <Text style={styles.title}>Stock Analysis</Text>
      
      <Text style={styles.subtitle}>Enter Stock Symbol:</Text>
      <TextInput
        style={styles.input}
        value={symbol}
        onChangeText={setSymbol}
        placeholder="e.g., AAPL, GOOGL, MSFT"
        autoCapitalize="characters"
      />
      
      <Text style={styles.subtitle}>Popular Stocks:</Text>
      <View style={styles.stockGrid}>
        {popularStocks.map((stock) => (
          <TouchableOpacity
            key={stock.symbol}
            style={[styles.stockButton, symbol === stock.symbol && styles.selectedStock]}
            onPress={() => selectStock(stock.symbol)}
            activeOpacity={0.8}
          >
            <Text style={[styles.stockSymbol, symbol === stock.symbol && { color: 'white' }]}>
              {stock.symbol}
            </Text>
            <Text style={[styles.stockName, symbol === stock.symbol && { color: 'rgba(255,255,255,0.8)' }]}>
              {stock.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>Loading {symbol} data...</Text>
        </View>
      )}
      
      {data && (
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>{symbol} Stock Price</Text>
          <StockChart 
            data={data} 
            symbol={symbol} 
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          <Text style={styles.dataInfo}>Showing {data.c?.length || 0} data points</Text>
          
          <ChatBot stockData={data} symbol={symbol} />
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>❌ Error fetching {symbol} data</Text>
          <Text style={styles.errorHint}>Try a different stock symbol or check your connection</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#667eea',
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: 'white',
    marginHorizontal: 20,
  },
  input: {
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 25,
    marginHorizontal: 20,
    marginBottom: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  stockGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  stockButton: {
    width: '48%',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedStock: {
    backgroundColor: 'rgba(33, 150, 243, 0.9)',
    transform: [{ scale: 1.02 }],
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  stockName: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    marginTop: 15,
    color: '#666',
    fontSize: 16,
  },
  chartContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#1976d2',
  },
  dataInfo: {
    textAlign: 'center',
    color: '#666',
    marginTop: 15,
    fontSize: 14,
  },
  errorContainer: {
    backgroundColor: 'rgba(255,235,238,0.95)',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 20,
    borderLeftWidth: 5,
    borderLeftColor: '#f44336',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  error: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '600',
  },
  errorHint: {
    color: '#666',
    marginTop: 8,
    fontSize: 14,
  },
});