import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';

export default function EfficientFrontierScreen() {
  const [allocation, setAllocation] = useState({
    stocks: 60,
    bonds: 25,
    gold: 10,
    crypto: 5
  });

  // Efficient frontier points (pre-calculated optimal portfolios)
  const efficientPortfolios = [
    { risk: 4, return: 5, label: 'Conservative' },
    { risk: 8, return: 7, label: 'Moderate' },
    { risk: 12, return: 9, label: 'Balanced' },
    { risk: 18, return: 12, label: 'Growth' },
    { risk: 25, return: 15, label: 'Aggressive' }
  ];

  const calculatePortfolio = () => {
    const returns = { stocks: 12, bonds: 5, gold: 8, crypto: 25 };
    const risks = { stocks: 18, bonds: 4, gold: 15, crypto: 60 };
    
    const expectedReturn = Object.keys(allocation).reduce((sum, asset) => {
      return sum + (allocation[asset] / 100) * returns[asset];
    }, 0);
    
    const expectedRisk = Math.sqrt(Object.keys(allocation).reduce((sum, asset) => {
      return sum + Math.pow((allocation[asset] / 100) * risks[asset], 2);
    }, 0));
    
    return { risk: expectedRisk, return: expectedReturn };
  };

  const userPortfolio = calculatePortfolio();
  
  const findClosestEfficient = () => {
    let closest = efficientPortfolios[0];
    let minDistance = Infinity;
    
    efficientPortfolios.forEach(portfolio => {
      const distance = Math.sqrt(
        Math.pow(portfolio.risk - userPortfolio.risk, 2) + 
        Math.pow(portfolio.return - userPortfolio.return, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = portfolio;
      }
    });
    
    return { portfolio: closest, distance: minDistance };
  };

  const { portfolio: closestEfficient, distance } = findClosestEfficient();
  const efficiency = Math.max(0, 100 - (distance * 10));

  const updateAllocation = (asset, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setAllocation(prev => ({ ...prev, [asset]: numValue }));
  };

  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>Efficient Frontier</Text>
      <Text style={styles.subtitle}>Find optimal risk-return balance</Text>
      
      <View style={styles.allocationContainer}>
        <Text style={styles.sectionTitle}>Your Portfolio</Text>
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
        </View>
      </View>

      <View style={styles.analysisContainer}>
        <Text style={styles.sectionTitle}>Portfolio Analysis</Text>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Your Portfolio:</Text>
          <Text style={styles.resultValue}>
            {userPortfolio.return.toFixed(1)}% return, {userPortfolio.risk.toFixed(1)}% risk
          </Text>
        </View>
        
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Closest Efficient:</Text>
          <Text style={styles.resultValue}>
            {closestEfficient.label} ({closestEfficient.return}% return, {closestEfficient.risk}% risk)
          </Text>
        </View>
        
        <View style={styles.efficiencyContainer}>
          <Text style={styles.efficiencyLabel}>Efficiency Score:</Text>
          <Text style={[styles.efficiencyScore, { 
            color: efficiency >= 80 ? '#27ae60' : efficiency >= 60 ? '#f39c12' : '#e74c3c' 
          }]}>
            {efficiency.toFixed(0)}/100
          </Text>
        </View>
        
        <Text style={styles.recommendation}>
          {efficiency >= 80 ? '✅ Great! Your portfolio is near the efficient frontier.' :
           efficiency >= 60 ? '⚠️ Good, but could be optimized for better risk-return balance.' :
           '❌ Consider rebalancing - you can get better returns for the same risk.'}
        </Text>
      </View>

      <View style={styles.frontierContainer}>
        <Text style={styles.sectionTitle}>Efficient Frontier Points</Text>
        {efficientPortfolios.map((portfolio, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.frontierPoint, {
              backgroundColor: portfolio.label === closestEfficient.label ? '#3498db' : 'white'
            }]}
          >
            <Text style={[styles.frontierLabel, {
              color: portfolio.label === closestEfficient.label ? 'white' : '#2c3e50'
            }]}>
              {portfolio.label}
            </Text>
            <Text style={[styles.frontierStats, {
              color: portfolio.label === closestEfficient.label ? 'white' : '#7f8c8d'
            }]}>
              {portfolio.return}% return, {portfolio.risk}% risk
            </Text>
          </TouchableOpacity>
        ))}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
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
  analysisContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  resultRow: {
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 2,
  },
  resultValue: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  efficiencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  efficiencyLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: 'bold',
    marginRight: 10,
  },
  efficiencyScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  recommendation: {
    fontSize: 14,
    color: '#2c3e50',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  frontierContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  frontierPoint: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  frontierLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  frontierStats: {
    fontSize: 14,
  },
});