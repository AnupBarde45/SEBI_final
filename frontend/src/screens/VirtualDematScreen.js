import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../context/UserContext';
import { PieChart } from 'react-native-chart-kit';
import UserHeader from '../components/UserHeader';

import VIRTUAL_TRADING_INSIGHTS from '../data/virtualTradingInsights.json';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const VIRTUAL_PORTFOLIO_STORAGE_KEY = 'saralnivesh_virtual_portfolio';
const screenWidth = Dimensions.get('window').width;

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
  const [showTradeImpact, setShowTradeImpact] = useState(false);
  const [tradeImpactMessage, setTradeImpactMessage] = useState('');

  useEffect(() => {
    async function loadPortfolio() {
      try {
        setLoading(true);
        const storedPortfolio = await AsyncStorage.getItem(VIRTUAL_PORTFOLIO_STORAGE_KEY);
        let initialPortfolio;
        if (storedPortfolio) {
          initialPortfolio = JSON.parse(storedPortfolio);
        } else {
          initialPortfolio = { balance: 100000, holdings: {} };
          await AsyncStorage.setItem(VIRTUAL_PORTFOLIO_STORAGE_KEY, JSON.stringify(initialPortfolio));
        }
        setPortfolio(initialPortfolio);
      } catch (err) {
        console.error("VIRTUAL_DEMAT_ERROR: Failed to load portfolio:", err);
        setError(err.message || "Failed to load your virtual portfolio.");
        setPortfolio({ balance: 100000, holdings: {} });
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  useEffect(() => {
    if (portfolio) {
      AsyncStorage.setItem(VIRTUAL_PORTFOLIO_STORAGE_KEY, JSON.stringify(portfolio))
        .then(() => console.log("VIRTUAL_DEMAT: Portfolio saved locally."))
        .catch(err => console.error("VIRTUAL_DEMAT_ERROR: Failed to save portfolio:", err));
    }
  }, [portfolio]);

  const fetchStockPrice = useCallback(async (symbol) => {
    if (!symbol) return;
    setPriceLoading(true);
    setError('');
    setCurrentPrice(null);
    try {
      const mockPrice = Math.random() * 1000 + 500;
      setCurrentPrice(mockPrice);
    } catch (err) {
      console.error("VIRTUAL_DEMAT_ERROR: Failed to fetch price:", err);
      setError(err.message || "Could not fetch stock price.");
    } finally {
      setPriceLoading(false);
    }
  }, []);

  const fetchHoldingsPrices = useCallback(async () => {
    if (!portfolio || !portfolio.holdings || Object.keys(portfolio.holdings).length === 0) return;

    const symbols = Object.keys(portfolio.holdings);
    const newPrices = {};
    for (const symbol of symbols) {
      try {
        const mockPrice = Math.random() * 1000 + 500;
        newPrices[symbol] = mockPrice;
      } catch (err) {
        console.error(`VIRTUAL_DEMAT_ERROR: Error fetching price for P&L of ${symbol}:`, err.message);
        newPrices[symbol] = portfolio.holdings[symbol].averagePrice;
      }
    }
    setCurrentHoldingsPrices(newPrices);
  }, [portfolio]);

  useEffect(() => {
    fetchHoldingsPrices();
    const interval = setInterval(fetchHoldingsPrices, 60000);
    return () => clearInterval(interval);
  }, [fetchHoldingsPrices]);

  const getGuruInsight = useCallback(async (tradeType, newHoldings, quantity, tradeValue) => {
    try {
      const [tipsResponse, rulesResponse] = await Promise.all([
        fetch(`${BACKEND_URL}/api/admin/trading-tips`),
        fetch(`${BACKEND_URL}/api/admin/trading-rules`)
      ]);
      
      const tips = await tipsResponse.json();
      const rules = await rulesResponse.json();
      
      // Check trading rules first (higher priority)
      const portfolioCount = Object.keys(newHoldings).length;
      
      for (const rule of rules) {
        let shouldTrigger = false;
        
        if (rule.rule_type === 'quantity') {
          shouldTrigger = evaluateCondition(quantity, rule.comparison_operator, rule.threshold_value);
        } else if (rule.rule_type === 'value') {
          shouldTrigger = evaluateCondition(tradeValue, rule.comparison_operator, rule.threshold_value);
        } else if (rule.rule_type === 'portfolio_count') {
          shouldTrigger = evaluateCondition(portfolioCount, rule.comparison_operator, rule.threshold_value);
        }
        
        if (shouldTrigger) {
          return rule.trigger_message;
        }
      }
      
      // Fallback to regular tips
      let insight = tips.find(i => i.trade_action.toLowerCase() === tradeType.toLowerCase() && i.scenario_type === 'general');

      if (tradeType === 'BUY') {
        if (Object.keys(newHoldings).length === 1 && Object.values(newHoldings)[0].quantity > 0) {
          insight = tips.find(i => i.trade_action.toLowerCase() === 'buy' && i.scenario_type === 'profit') || insight;
        }
      } else if (tradeType === 'SELL') {
        insight = tips.find(i => i.trade_action.toLowerCase() === 'sell' && i.scenario_type === 'loss') || insight;
      }

      return insight ? insight.tip_message : "Good trade! Keep learning and refining your strategy.";
    } catch (error) {
      console.error('Failed to fetch trading insights:', error);
      return "Good trade! Keep learning and refining your strategy.";
    }
  }, []);
  
  const evaluateCondition = (value, operator, threshold) => {
    switch (operator) {
      case '>': return value > threshold;
      case '<': return value < threshold;
      case '>=': return value >= threshold;
      case '<=': return value <= threshold;
      case '=': return value === threshold;
      default: return false;
    }
  };

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
      const tradeValue = currentPrice * quantity;
      let newBalance = portfolio.balance;
      let newHoldings = { ...portfolio.holdings };

      if (type === 'BUY') {
        if (newBalance < tradeValue) {
          throw new Error(`Insufficient balance. Need ₹${tradeValue.toFixed(2)}, have ₹${newBalance.toFixed(2)}.`);
        }
        newBalance -= tradeValue;
        newHoldings[searchSymbol] = newHoldings[searchSymbol] || { quantity: 0, averagePrice: 0 };

        const existingTotalValue = newHoldings[searchSymbol].quantity * newHoldings[searchSymbol].averagePrice;
        const newTotalValue = existingTotalValue + tradeValue;
        const newTotalQuantity = newHoldings[searchSymbol].quantity + quantity;

        newHoldings[searchSymbol].quantity = newTotalQuantity;
        newHoldings[searchSymbol].averagePrice = newTotalQuantity > 0 ? newTotalValue / newTotalQuantity : 0;
      } else if (type === 'SELL') {
        if (!newHoldings[searchSymbol] || newHoldings[searchSymbol].quantity < quantity) {
          throw new Error(`Insufficient shares of ${searchSymbol} to sell. Have ${newHoldings[searchSymbol]?.quantity || 0}.`);
        }
        newBalance += tradeValue;
        newHoldings[searchSymbol].quantity -= quantity;

        if (newHoldings[searchSymbol].quantity === 0) {
          delete newHoldings[searchSymbol];
        }
      }

      setPortfolio({
        balance: parseFloat(newBalance.toFixed(2)),
        holdings: newHoldings,
      });

      const insightMessage = await getGuruInsight(type, newHoldings, quantity, tradeValue);
      setTradeImpactMessage(`${type} ${quantity} shares of ${searchSymbol} at ₹${currentPrice.toFixed(2)}`);
      setShowTradeImpact(true);

      setTimeout(() => {
        setShowTradeImpact(false);
        Alert.alert("Trade Successful!", `${tradeImpactMessage}\n\n${insightMessage}`);
      }, 2000);

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

  let totalHoldingsCurrentValue = 0;
  let totalHoldingsInvestedValue = 0;
  const portfolioAllocationData = [];
  const chartColors = ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8', '#6610f2', '#fd7e14', '#e83e8c', '#6f42c1'];

  const holdingsArray = portfolio.holdings ? Object.keys(portfolio.holdings).map(symbol => ({ symbol, ...portfolio.holdings[symbol] })) : [];

  holdingsArray.forEach((holdingItem, index) => {
    const holding = holdingItem;
    const latestPrice = currentHoldingsPrices[holding.symbol] || holding.averagePrice;
    const currentValue = holding.quantity * latestPrice;
    totalHoldingsCurrentValue += currentValue;
    totalHoldingsInvestedValue += holding.quantity * holding.averagePrice;

    if (currentValue > 0) {
      portfolioAllocationData.push({
        name: holding.symbol,
        population: currentValue,
        color: chartColors[index % chartColors.length],
        legendFontColor: '#7F7F7F',
        legendFontSize: 12,
      });
    }
  });

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
    <View style={styles.container}>
      <UserHeader navigation={navigation} />
      
      <KeyboardAvoidingView
        style={styles.fullScreenContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.headerTitle}>Virtual Trading Account</Text>
          <Text style={styles.headerSubtitle}>Practice trading with virtual money!</Text>

          {error && <Text style={styles.errorText}>Error: {error}</Text>}

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

        {showTradeImpact && (
          <View style={styles.tradeImpactOverlay}>
            <Text style={styles.tradeImpactText}>🎉 {tradeImpactMessage}</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
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
    paddingTop: 100,
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
    backgroundColor: '#28a745',
    marginRight: 5,
  },
  sellButton: {
    backgroundColor: '#dc3545',
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
  tradeImpactOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 123, 255, 0.9)',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 1000,
  },
  tradeImpactText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default VirtualDematScreen;