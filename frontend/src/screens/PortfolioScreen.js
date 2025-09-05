import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function PortfolioScreen({ navigation }) {
  const userId = 'user123';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>Portfolio Diversification</Text>
      <Text style={styles.subtitle}>Build and optimize your investment portfolio</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('AssetAllocation', { userId })}
      >
        <Text style={styles.buttonText}>🎯 Asset Allocation Simulator</Text>
        <Text style={styles.buttonDesc}>Mix different assets and see risk/return</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('CorrelationHeatmap', { userId })}
      >
        <Text style={styles.buttonText}>🔥 Correlation Heatmap</Text>
        <Text style={styles.buttonDesc}>See how assets move together</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('EfficientFrontier', { userId })}
      >
        <Text style={styles.buttonText}>📈 Efficient Frontier</Text>
        <Text style={styles.buttonDesc}>Find optimal risk-return balance</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('DiversificationScore', { userId })}
      >
        <Text style={styles.buttonText}>⭐ Diversification Score</Text>
        <Text style={styles.buttonDesc}>Rate your portfolio balance</Text>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
  },
  button: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  buttonDesc: {
    fontSize: 14,
    color: '#7f8c8d',
  },
});