import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';

export default function AssetAllocationScreen() {
  const [allocation, setAllocation] = useState({
    stocks: 40,
    bonds: 30,
    gold: 20,
    crypto: 10
  });

  const [results, setResults] = useState({
    expectedReturn: 0,
    expectedRisk: 0
  });

  useEffect(() => {
    calculateResults();
  }, [allocation]);

  const calculateResults = () => {
    // Simple calculation based on historical averages
    const returns = { stocks: 12, bonds: 5, gold: 8, crypto: 25 };
    const risks = { stocks: 18, bonds: 4, gold: 15, crypto: 60 };
    
    const expectedReturn = Object.keys(allocation).reduce((sum, asset) => {
      return sum + (allocation[asset] / 100) * returns[asset];
    }, 0);
    
    const expectedRisk = Math.sqrt(Object.keys(allocation).reduce((sum, asset) => {
      return sum + Math.pow((allocation[asset] / 100) * risks[asset], 2);
    }, 0));
    
    setResults({ expectedReturn: expectedReturn.toFixed(1), expectedRisk: expectedRisk.toFixed(1) });
  };

  const updateAllocation = (asset, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setAllocation(prev => ({ ...prev, [asset]: numValue }));
  };

  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>Asset Allocation Simulator</Text>
      <Text style={styles.subtitle}>Adjust your portfolio mix</Text>
      
      <View style={styles.allocationContainer}>
        {Object.entries(allocation).map(([asset, value]) => (
          <View key={asset} style={styles.assetRow}>
            <Text style={styles.assetLabel}>{asset.charAt(0).toUpperCase() + asset.slice(1)}</Text>
            <TextInput
              style={styles.input}
              value={value.toString()}
              onChangeText={(text) => updateAllocation(asset, text)}
              keyboardType="numeric"
            />
            <Text style={styles.percent}>%</Text>
          </View>
        ))}
        
        <View style={[styles.totalRow, { backgroundColor: total === 100 ? '#d5f4e6' : '#ffeaa7' }]}>
          <Text style={styles.totalText}>Total: {total}%</Text>
          {total !== 100 && <Text style={styles.warning}>Must equal 100%</Text>}
        </View>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Portfolio Analysis</Text>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Expected Annual Return</Text>
          <Text style={[styles.resultValue, { color: '#27ae60' }]}>{results.expectedReturn}%</Text>
        </View>
        
        <View style={styles.resultCard}>
          <Text style={styles.resultLabel}>Expected Risk (Volatility)</Text>
          <Text style={[styles.resultValue, { color: '#e74c3c' }]}>{results.expectedRisk}%</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: '100vh',
    maxHeight: '70vh',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
  },
  allocationContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  assetLabel: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    width: 60,
    textAlign: 'center',
    marginRight: 5,
  },
  percent: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  totalRow: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  warning: {
    fontSize: 12,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 5,
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  resultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  resultLabel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  resultValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});