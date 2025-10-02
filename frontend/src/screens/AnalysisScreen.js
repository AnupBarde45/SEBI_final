import React, { useState } from 'react';
import { View, Text, ActivityIndicator, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import useStockData from '../hooks/useStockData';
import StockChart from '../components/StockChart';
import StockChatBot from '../components/StockChatBot';
import ChartReadingGuide from '../components/ChartReadingGuide';

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
];

export default function AnalysisScreen() {
  const [symbol, setSymbol] = useState('AAPL');
  const [timeRange, setTimeRange] = useState('1D');
  const [showChatBot, setShowChatBot] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { data, loading, error } = useStockData(symbol, timeRange);

  const selectStock = (stockSymbol) => {
    setSymbol(stockSymbol);
  };

  return (
    <ScrollView style={styles.container}>
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
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{symbol} Stock Price</Text>
            <View style={styles.dataSourceContainer}>
              <Text style={[styles.dataSourceBadge, data.isRealData ? styles.realDataBadge : styles.simulatedDataBadge]}>
                {data.isRealData ? '📊 HISTORICAL DATA' : '⚠️ DEMO DATA'}
              </Text>
              <Text style={styles.dataSourceText}>
                Source: {data.dataSource || 'Unknown'}
              </Text>
              {data.lastRefreshed && (
                <Text style={styles.lastUpdated}>
                  Last Updated: {new Date(data.lastRefreshed).toLocaleString()}
                </Text>
              )}
              <View style={styles.disclaimerContainer}>
                <Text style={styles.disclaimerText}>
                  ⚠️ EDUCATIONAL USE ONLY: {data.isRealData ? 'Real historical market data used for learning chart analysis. ' : 'Simulated data for demonstration. '}Not financial advice. Do not use for actual trading decisions.
                </Text>
              </View>
            </View>
          </View>
          
          <View style={styles.timelineInfo}>
            <Text style={styles.timelineTitle}>📅 Timeline Information</Text>
            <Text style={styles.timelineText}>
              Period: {data.timeRange} • Points: {data.totalPoints} • 
              {data.dateRange && data.dateRange.start && data.dateRange.end ? 
                `${new Date(data.dateRange.start).toLocaleDateString()} to ${new Date(data.dateRange.end).toLocaleDateString()}` :
                'Date range unavailable'
              }
            </Text>
            {data.timeZone && data.timeZone !== 'Unknown' && (
              <Text style={styles.timezoneText}>Timezone: {data.timeZone}</Text>
            )}
          </View>
          
          <StockChart 
            data={data} 
            symbol={symbol} 
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.tutorialButton}
              onPress={() => setShowTutorial(true)}
            >
              <Text style={styles.buttonIcon}>📚</Text>
              <Text style={styles.buttonText}>Learn to Read Charts</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.chatBotButton}
              onPress={() => setShowChatBot(true)}
            >
              <Text style={styles.buttonIcon}>🤖</Text>
              <Text style={styles.buttonText}>Ask AI about Chart</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>❌ Error fetching {symbol} data</Text>
          <Text style={styles.errorHint}>Try a different stock symbol or check your connection</Text>
        </View>
      )}
      
      <Modal
        visible={showChatBot}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <StockChatBot 
          stockData={data}
          symbol={symbol}
          timeRange={timeRange}
          onClose={() => setShowChatBot(false)}
        />
      </Modal>
      
      <ChartReadingGuide
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
        stockData={data}
        symbol={symbol}
      />
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
  chartHeader: {
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#1976d2',
  },
  dataSourceContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  dataSourceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  realDataBadge: {
    backgroundColor: '#4CAF50',
    color: 'white',
  },
  simulatedDataBadge: {
    backgroundColor: '#FF9800',
    color: 'white',
  },
  dataSourceText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  lastUpdated: {
    fontSize: 11,
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
  },
  disclaimerContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#856404',
    textAlign: 'center',
    fontWeight: '500',
  },
  timelineInfo: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 5,
  },
  timelineText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  timezoneText: {
    fontSize: 12,
    color: '#666',
    marginTop: 3,
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
  buttonContainer: {
    marginTop: 15,
    gap: 10,
  },
  tutorialButton: {
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chatBotButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});