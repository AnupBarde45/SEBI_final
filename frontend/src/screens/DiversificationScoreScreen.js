import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput } from 'react-native';

export default function DiversificationScoreScreen() {
  const [allocation, setAllocation] = useState({
    stocks: 50,
    bonds: 30,
    gold: 15,
    crypto: 5
  });

  const calculateDiversificationScore = () => {
    const weights = Object.values(allocation).map(val => val / 100);
    
    // Herfindahl-Hirschman Index (lower is more diversified)
    const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
    
    // Convert to 0-100 scale (higher is better)
    const baseScore = (1 - hhi) * 100 / 0.75; // 0.75 is max possible for 4 assets
    
    // Correlation penalty - penalize highly correlated assets
    const correlations = {
      'stocks-bonds': -0.2,
      'stocks-gold': 0.1,
      'stocks-crypto': 0.3,
      'bonds-gold': -0.1,
      'bonds-crypto': -0.3,
      'gold-crypto': 0.2
    };
    
    let correlationPenalty = 0;
    const assets = Object.keys(allocation);
    for (let i = 0; i < assets.length; i++) {
      for (let j = i + 1; j < assets.length; j++) {
        const key = `${assets[i]}-${assets[j]}`;
        const correlation = correlations[key] || 0;
        const weight1 = allocation[assets[i]] / 100;
        const weight2 = allocation[assets[j]] / 100;
        correlationPenalty += Math.abs(correlation) * weight1 * weight2 * 100;
      }
    }
    
    const finalScore = Math.max(0, Math.min(100, baseScore - correlationPenalty));
    return Math.round(finalScore);
  };

  const score = calculateDiversificationScore();
  
  const getScoreColor = (score) => {
    if (score >= 80) return '#27ae60';
    if (score >= 60) return '#f39c12';
    return '#e74c3c';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  const getSuggestions = (score) => {
    if (score >= 80) return [
      '✅ Great diversification!',
      '✅ Good balance across asset classes',
      '✅ Low correlation between assets'
    ];
    
    if (score >= 60) return [
      '⚠️ Good diversification, but can improve',
      '💡 Consider rebalancing to reduce concentration',
      '💡 Look for assets with lower correlation'
    ];
    
    return [
      '❌ Poor diversification - high risk!',
      '🚨 Too concentrated in few assets',
      '🚨 Consider spreading investments more evenly',
      '💡 Add more uncorrelated asset classes'
    ];
  };

  const updateAllocation = (asset, value) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    setAllocation(prev => ({ ...prev, [asset]: numValue }));
  };

  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>Diversification Score</Text>
      <Text style={styles.subtitle}>Rate your portfolio balance</Text>
      
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Your Diversification Score</Text>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreNumber, { color: getScoreColor(score) }]}>
            {score}
          </Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <Text style={[styles.scoreRating, { color: getScoreColor(score) }]}>
          {getScoreLabel(score)}
        </Text>
      </View>

      <View style={styles.allocationContainer}>
        <Text style={styles.sectionTitle}>Portfolio Allocation</Text>
        {Object.entries(allocation).map(([asset, value]) => (
          <View key={asset} style={styles.assetRow}>
            <Text style={styles.assetLabel}>{asset.charAt(0).toUpperCase() + asset.slice(1)}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { 
                  width: `${value}%`,
                  backgroundColor: getScoreColor(score)
                }]} 
              />
            </View>
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

      <View style={styles.suggestionsContainer}>
        <Text style={styles.sectionTitle}>Analysis & Suggestions</Text>
        {getSuggestions(score).map((suggestion, index) => (
          <Text key={index} style={styles.suggestion}>{suggestion}</Text>
        ))}
      </View>

      <View style={styles.benchmarkContainer}>
        <Text style={styles.sectionTitle}>Diversification Benchmarks</Text>
        
        <View style={styles.benchmarkItem}>
          <Text style={styles.benchmarkLabel}>Conservative (25-25-25-25)</Text>
          <Text style={styles.benchmarkScore}>Score: 100</Text>
        </View>
        
        <View style={styles.benchmarkItem}>
          <Text style={styles.benchmarkLabel}>Balanced (60-30-10-0)</Text>
          <Text style={styles.benchmarkScore}>Score: 75</Text>
        </View>
        
        <View style={styles.benchmarkItem}>
          <Text style={styles.benchmarkLabel}>Growth (80-15-5-0)</Text>
          <Text style={styles.benchmarkScore}>Score: 60</Text>
        </View>
        
        <View style={styles.benchmarkItem}>
          <Text style={styles.benchmarkLabel}>All Stocks (100-0-0-0)</Text>
          <Text style={styles.benchmarkScore}>Score: 20</Text>
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
  scoreContainer: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 15,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: -10,
  },
  scoreRating: {
    fontSize: 18,
    fontWeight: 'bold',
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
    width: 60,
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  progressBar: {
    flex: 1,
    height: 20,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    marginHorizontal: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    width: 50,
    textAlign: 'center',
    marginRight: 5,
  },
  percent: {
    fontSize: 14,
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
  suggestionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
  },
  suggestion: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 20,
  },
  benchmarkContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  benchmarkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  benchmarkLabel: {
    fontSize: 14,
    color: '#2c3e50',
  },
  benchmarkScore: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
});