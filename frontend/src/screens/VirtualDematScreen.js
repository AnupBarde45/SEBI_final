import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import { PieChart } from 'react-native-chart-kit'; // Import PieChart

import VIRTUAL_TRADING_INSIGHTS from '../data/virtualTradingInsights.json';


// --- Mock Backend URL ---
const BACKEND_URL = 'http://192.168.31.96:3001'; // Using your confirmed IP

// --- Local Storage Key for Virtual Portfolio ---
const VIRTUAL_PORTFOLIO_STORAGE_KEY = 'saralnivesh_virtual_portfolio';

const screenWidth = Dimensions.get('window').width; // Get screen width for chart responsiveness

function VirtualDematScreen({ navigation }) {
  const { userId } = useUser();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchSymbol, setSearchSymbol] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [currentHoldingsPrices, setCurrentHoldingsPrices] = useState({});
  const [showTradeImpact, setShowTradeImpact] = useState(false); // New state for trade impact animation
  const [tradeImpactMessage, setTradeImpactMessage] = useState(''); // Message for trade impact

  // --- Load Portfolio on Component Mount ---
  useEffect(() => {
    async function loadPortfolio() {
      try {
        setLoading(true);
        const storedPortfolio = await AsyncStorage.getItem(VIRTUAL_PORTFOLIO_STORAGE_KEY);
        let initialPortfolio;
        if (storedPortfolio) {
          initialPortfolio = JSON.parse(storedPortfolio);
        } else {
          const response = await fetch(`${BACKEND_URL}/api/virtual-trade/initial-balance`);
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch initial balance.');
          }
          const data = await response.json();
          initialPortfolio = { balance: data.initialBalance, holdings: {} };
          await AsyncStorage.setItem(VIRTUAL_PORTFOLIO_STORAGE_KEY, JSON.stringify(initialPortfolio));
        }
        setPortfolio(initialPortfolio);
      } catch (err) {
        console.error("VIRTUAL_DEMAT_ERROR: Failed to load portfolio:", err);
        setError(err.message || "Failed to load your virtual portfolio.");
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  // --- Save Portfolio Whenever It Changes ---
  useEffect(() => {
    if (portfolio) {
      AsyncStorage.setItem(VIRTUAL_PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio))
        .then(() => console.log("VIRTUAL_DEMAT: Portfolio saved locally."))
        .catch(err => console.error("VIRTUAL_DEMAT_ERROR: Failed to save portfolio:", err));
    }
  }, [portfolio]);

  // --- Fetch Stock Price for Trading ---
  const fetchStockPrice = useCallback(async (symbol) => {
    if (!symbol) return;
    setPriceLoading(true);
    setError('');
    setCurrentPrice(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/virtual-trade/price/${symbol}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stock price.');
      }
      const data = await response.json();
      setCurrentPrice(data.price);
    } catch (err) {
      console.error("VIRTUAL_DEMAT_ERROR: Failed to fetch price:", err);
      setError(err.message || "Could not fetch stock price.");
    } finally {
      setPriceLoading(false);
    }
  }, []);

  // --- Fetch Latest Prices for All Holdings (for P&L calculation) ---
  const fetchHoldingsPrices = useCallback(async () => {
    if (!portfolio || !portfolio.holdings || Object.keys(portfolio.holdings).length === 0) return;

    const symbols = Object.keys(portfolio.holdings);
    const newPrices = {};
    for (const symbol of symbols) {
      try {
        const response = await fetch(`${BACKEND_URL}/api/virtual-trade/price/${symbol}`);
        if (response.ok) {
          const data = await response.json();
          newPrices[symbol] = data.price;
        } else {
          console.warn(`VIRTUAL_DEMAT_WARN: Could not fetch latest price for ${symbol}`);
          newPrices[symbol] = portfolio.holdings[symbol].averagePrice; // Fallback to avg price
        }
      } catch (err) {
        console.error(`VIRTUAL_DEMAT_ERROR: Error fetching price for P&L of ${symbol}:`, err.message);
        newPrices[symbol] = portfolio.holdings[symbol].averagePrice; // Fallback to avg price
      }
    }
    setCurrentHoldingsPrices(newPrices);
  }, [portfolio]);

  // Fetch holdings prices periodically or on focus
  useEffect(() => {
    fetchHoldingsPrices();
    const interval = setInterval(fetchHoldingsPrices, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, [fetchHoldingsPrices]);


  // --- Get Guru Insight ---
  const getGuruInsight = useCallback((tradeType, newHoldings) => {
    let insight = VIRTUAL_TRADING_INSIGHTS.find(i => i.type === tradeType && i.condition === 'generic');

    if (tradeType === 'BUY') {
      // Check for diversification condition (simple check: if only 1 holding after buy)
      if (Object.keys(newHoldings).length === 1 && Object.values(newHoldings)[0].quantity > 0) {
        insight = VIRTUAL_TRADING_INSIGHTS.find(i => i.type === 'BUY' && i.condition === 'not_diversified') || insight;
      }
    } else if (tradeType === 'SELL') {
      // Simple check for stop-loss idea (always suggest after a sell for now)
      insight = VIRTUAL_TRADING_INSIGHTS.find(i => i.type === 'SELL' && i.condition === 'no_stoploss_set') || insight;
    }
    // Add more complex conditions here later

    return insight ? insight.message : "Good trade! Keep learning and refining your strategy.";
  }, []);


  // --- Execute Trade (BUY/SELL) ---
  const executeTrade = useCallback(async (type) => {
    if (!searchSymbol || !tradeQuantity || currentPrice === null) {
      Alert.alert("Missing Info", "Please search for a stock and enter a quantity.");
      return;
    }
    const quantity = parseInt(tradeQuantity, 10);
    if (isNaN(quantity) || quantity <= 0) {
      Alert.alert("Invalid Quantity", "Please enter a valid positive number for quantity.");
      return;
    }

    setTradeLoading(true);
    setError('');
    try {
      const response = await fetch(`${BACKEND_URL}/api/virtual-trade/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          symbol: searchSymbol,
          quantity: quantity,
          type: type,
          currentPortfolio: portfolio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Trade failed.');
      }

      const data = await response.json();
      setPortfolio({
        balance: data.newBalance,
        holdings: data.newHoldings,
      });

      // --- Visualized Impact & Guru Insights ---
      const insightMessage = getGuruInsight(type, data.newHoldings);
      setTradeImpactMessage(`${type} ${quantity} shares of ${searchSymbol} at ₹${data.tradeDetails.price.toFixed(2)}`);
      setShowTradeImpact(true);

      setTimeout(() => {
        setShowTradeImpact(false);
        Alert.alert("Trade Successful!", `${tradeImpactMessage}\n\n${insightMessage}`);
      }, 2000); // Show impact for 2 seconds before alert

      setTradeQuantity('');
      fetchHoldingsPrices();
    } catch (err) {
      console.error("VIRTUAL_DEMAT_ERROR: Trade failed:", err);
      setError(err.message || "An unexpected error occurred during trade.");
      Alert.alert("Trade Failed", err.message || "An unexpected error occurred.");
    } finally {
      setTradeLoading(false);
    }
  }, [userId, searchSymbol, tradeQuantity, currentPrice, portfolio, fetchHoldingsPrices, getGuruInsight, tradeImpactMessage]);


  if (loading || !portfolio) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading Virtual Demat Account...</Text>
      </View>
    );
  }

  // --- Calculate Portfolio Values ---
  let totalHoldingsCurrentValue = 0;
  let totalHoldingsInvestedValue = 0;
  const portfolioAllocationData = [];
  const chartColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8', '#6610f2', '#fd7e14', '#e83e8c', '#6f42c1']; // More chart colors

  const holdingsArray = portfolio.holdings ? Object.keys(portfolio.holdings).map(symbol => ({ symbol, ...portfolio.holdings[symbol] })) : [];

  holdingsArray.forEach((holdingItem, index) => {
    const holding = holdingItem;
    const latestPrice = currentHoldingsPrices[holding.symbol] || holding.averagePrice;
    const currentValue = holding.quantity * latestPrice;
    totalHoldingsCurrentValue += currentValue;
    totalHoldingsInvestedValue += holding.quantity * holding.averagePrice;

    if (currentValue > 0) { // Only add to chart if value is positive
      portfolioAllocationData.push({
        name: holding.symbol,
        population: currentValue,
        color: chartColors[index % chartColors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      });
    }
  });

  // Add cash to portfolio allocation if it's significant
  if (portfolio.balance > 0) {
    portfolioAllocationData.push({
      name: 'Cash',
      population: portfolio.balance,
      color: '#adb5bd',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    });
  }

  const totalHoldingsPnL = totalHoldingsCurrentValue - totalHoldingsInvestedValue;
  const totalPortfolioValue = portfolio.balance + totalHoldingsCurrentValue;


  const renderHoldingItem = ({ item }) => {
    if (!item || typeof item.quantity === 'undefined' || item.quantity === null || typeof item.averagePrice === 'undefined' || item.averagePrice === null) {
      console.warn("VIRTUAL_DEMAT_WARN: Skipping holding item due to missing essential properties:", item);
      return null;
    }

    const latestPrice = currentHoldingsPrices[item.symbol] || item.averagePrice;
    const currentValue = item.quantity * latestPrice;
    const investedValue = item.quantity * item.averagePrice;
    const pnl = currentValue - investedValue;
    const pnlPercentage = investedValue > 0 ? (pnl / investedValue) * 100 : 0;

    const pnlColor = pnl > 0 ? '#28a745' : pnl < 0 ? '#dc3545' : '#6c757d';

    return (
      <View style={styles.holdingCard}>
        <View style={styles.holdingRow}>
          <Text style={styles.holdingSymbol}>{item.symbol}</Text>
          <Text style={styles.holdingQty}>Qty: {item.quantity}</Text>
        </View>
        <View style={styles.holdingRow}>
          <Text style={styles.holdingDetail}>Avg Price: ₹{item.averagePrice.toFixed(2)}</Text>
          <Text style={styles.holdingDetail}>Current Price: ₹{latestPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.holdingRow}>
          <Text style={styles.holdingDetail}>Invested: ₹{investedValue.toFixed(2)}</Text>
          <Text style={styles.holdingDetail}>Current Value: ₹{currentValue.toFixed(2)}</Text>
        </View>
        <View style={styles.pnlRow}>
          <Text style={styles.pnlLabel}>P&L:</Text>
          <Text style={[styles.pnlValue, { color: pnlColor }]}>
            ₹{pnl.toFixed(2)} ({pnlPercentage.toFixed(2)}%)
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Virtual Trading Account</Text>
        <Text style={styles.headerSubtitle}>Practice trading with virtual money!</Text>

        {error && <Text style={styles.errorText}>Error: {error}</Text>}

        {/* --- Account Summary --- */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Account Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Virtual Balance:</Text>
            <Text style={styles.summaryValue}>₹{portfolio.balance.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Invested Value:</Text>
            <Text style={styles.summaryValue}>₹{totalHoldingsInvestedValue.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Holdings Current Value:</Text>
            <Text style={styles.summaryValue}>₹{totalHoldingsCurrentValue.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total P&L:</Text>
            <Text style={[styles.summaryValue, { color: totalHoldingsPnL > 0 ? '#28a745' : totalHoldingsPnL < 0 ? '#dc3545' : '#6c757d' }]}>
              ₹{totalHoldingsPnL.toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Portfolio Value:</Text>
            <Text style={styles.summaryValue}>₹{totalPortfolioValue.toFixed(2)}</Text>
          </View>
        </View>

        {/* --- Portfolio Allocation Chart --- */}
        {portfolioAllocationData.length > 0 && totalPortfolioValue > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardHeader}>Portfolio Allocation</Text>
            <PieChart
              data={portfolioAllocationData}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              hasLegend={false}
            />
            <View style={styles.legendContainer}>
              {portfolioAllocationData.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                  <View style={[styles.legendColorBox, { backgroundColor: item.color }]} />
                  <Text style={styles.legendText}>{item.name} ({((item.population / totalPortfolioValue) * 100).toFixed(1)}%)</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* --- Stock Search & Trade --- */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Trade Stocks</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter Stock Symbol (e.g., RELIANCE.NS)"
            placeholderTextColor="#6c757d"
            value={searchSymbol}
            onChangeText={setSearchSymbol}
            autoCapitalize="characters"
            onSubmitEditing={() => fetchStockPrice(searchSymbol)}
            returnKeyType="search"
            editable={!priceLoading && !tradeLoading}
          />
          <TouchableOpacity
            style={[styles.fetchPriceButton, priceLoading ? styles.fetchPriceButtonDisabled : {}]}
            onPress={() => fetchStockPrice(searchSymbol)}
            disabled={!searchSymbol || priceLoading || tradeLoading}
          >
            {priceLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.fetchPriceButtonText}>Get Price</Text>
            )}
          </TouchableOpacity>

          {currentPrice !== null && (
            <View style={styles.priceDisplay}>
              <Text style={styles.priceText}>Current Price for {searchSymbol}:</Text>
              <Text style={styles.priceValue}>₹{currentPrice.toFixed(2)}</Text>
            </View>
          )}

          {currentPrice !== null && (
            <View style={styles.tradeInputGroup}>
              <TextInput
                style={styles.tradeQuantityInput}
                placeholder="Quantity"
                placeholderTextColor="#6c757d"
                keyboardType="numeric"
                value={tradeQuantity}
                onChangeText={setTradeQuantity}
                editable={!tradeLoading}
              />
              <TouchableOpacity
                style={[styles.tradeButton, styles.buyButton, tradeLoading || !tradeQuantity || parseInt(tradeQuantity, 10) <= 0 ? styles.tradeButtonDisabled : {}]}
                onPress={() => executeTrade('BUY')}
                disabled={tradeLoading || !tradeQuantity || parseInt(tradeQuantity, 10) <= 0}
              >
                <Text style={styles.tradeButtonText}>BUY</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tradeButton, styles.sellButton, tradeLoading || !tradeQuantity || parseInt(tradeQuantity, 10) <= 0 ? styles.tradeButtonDisabled : {}]}
                onPress={() => executeTrade('SELL')}
                disabled={tradeLoading || !tradeQuantity || parseInt(tradeQuantity, 10) <= 0}
              >
                <Text style={styles.tradeButtonText}>SELL</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* --- Current Holdings --- */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Your Holdings</Text>
          {holdingsArray.length > 0 ? (
            <FlatList
              data={holdingsArray}
              renderItem={renderHoldingItem}
              keyExtractor={(item) => item.symbol}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noHoldingsText}>No current holdings. Start trading!</Text>
          )}
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* --- Trade Impact Overlay --- */}
      {showTradeImpact && (
        <View style={styles.tradeImpactOverlay}>
          <Text style={styles.tradeImpactText}>🎉 {tradeImpactMessage}</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#334155',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: Platform.OS === 'android' ? 20 : 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#667788',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#4a5568',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#343a40',
    backgroundColor: '#f8f9fa',
    marginBottom: 10,
    width: '100%',
  },
  fetchPriceButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  fetchPriceButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  fetchPriceButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  priceDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  priceText: {
    fontSize: 16,
    color: '#007bff',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
  },
  tradeInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tradeQuantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#343a40',
    backgroundColor: '#f8f9fa',
    marginRight: 10,
  },
  tradeButton: {
    flex: 0.5,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButton: {
    backgroundColor: '#28a745', // Green for BUY
    marginRight: 5,
  },
  sellButton: {
    backgroundColor: '#dc3545', // Red for SELL
    marginLeft: 5,
  },
  tradeButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  tradeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  holdingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  holdingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  holdingSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  holdingQty: {
    fontSize: 14,
    color: '#666',
  },
  holdingDetail: {
    fontSize: 13,
    color: '#666',
  },
  pnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  pnlLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  pnlValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  noHoldingsText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    paddingVertical: 10,
  },
  // --- Chart specific styles ---
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#4a5568',
  },
  // --- NEW: Trade Impact Overlay Styles ---
  tradeImpactOverlay: {
    position: 'absolute',
    bottom: 100, // Position above the input area
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 123, 255, 0.9)', // Semi-transparent blue
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000, // Ensure it's on top
  },
  tradeImpactText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default VirtualDematScreen;