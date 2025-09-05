import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function CorrelationHeatmapScreen() {
  const assets = ['Stocks', 'Bonds', 'Gold', 'Crypto'];
  
  // Correlation matrix (simplified real-world data)
  const correlations = {
    'Stocks-Stocks': 1.0,
    'Stocks-Bonds': -0.2,
    'Stocks-Gold': 0.1,
    'Stocks-Crypto': 0.3,
    'Bonds-Stocks': -0.2,
    'Bonds-Bonds': 1.0,
    'Bonds-Gold': -0.1,
    'Bonds-Crypto': -0.3,
    'Gold-Stocks': 0.1,
    'Gold-Bonds': -0.1,
    'Gold-Gold': 1.0,
    'Gold-Crypto': 0.2,
    'Crypto-Stocks': 0.3,
    'Crypto-Bonds': -0.3,
    'Crypto-Gold': 0.2,
    'Crypto-Crypto': 1.0
  };

  const getColor = (correlation) => {
    if (correlation >= 0.7) return '#e74c3c'; // High positive - red
    if (correlation >= 0.3) return '#f39c12'; // Medium positive - orange
    if (correlation >= -0.3) return '#f1c40f'; // Low correlation - yellow
    if (correlation >= -0.7) return '#2ecc71'; // Medium negative - green
    return '#27ae60'; // High negative - dark green
  };

  const getDescription = (correlation) => {
    if (correlation >= 0.7) return 'Move together strongly';
    if (correlation >= 0.3) return 'Move together moderately';
    if (correlation >= -0.3) return 'Little relationship';
    if (correlation >= -0.7) return 'Move opposite moderately';
    return 'Move opposite strongly';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>Correlation Heatmap</Text>
      <Text style={styles.subtitle}>How assets move together</Text>
      
      <View style={styles.heatmapContainer}>
        <View style={styles.headerRow}>
          <View style={styles.cornerCell} />
          {assets.map(asset => (
            <Text key={asset} style={styles.headerCell}>{asset}</Text>
          ))}
        </View>
        
        {assets.map(rowAsset => (
          <View key={rowAsset} style={styles.dataRow}>
            <Text style={styles.rowHeader}>{rowAsset}</Text>
            {assets.map(colAsset => {
              const correlation = correlations[`${rowAsset}-${colAsset}`];
              return (
                <View 
                  key={colAsset}
                  style={[styles.cell, { backgroundColor: getColor(correlation) }]}
                >
                  <Text style={styles.cellText}>{correlation.toFixed(1)}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legendTitle}>Legend</Text>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
          <Text style={styles.legendText}>+0.7 to +1.0: Move together strongly (Bad for diversification)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f39c12' }]} />
          <Text style={styles.legendText}>+0.3 to +0.7: Move together moderately</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f1c40f' }]} />
          <Text style={styles.legendText}>-0.3 to +0.3: Little relationship (Good for diversification)</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#2ecc71' }]} />
          <Text style={styles.legendText}>-0.7 to -0.3: Move opposite moderately</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#27ae60' }]} />
          <Text style={styles.legendText}>-1.0 to -0.7: Move opposite strongly (Best for diversification)</Text>
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
  heatmapContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  cornerCell: {
    width: 60,
    height: 40,
  },
  headerCell: {
    width: 60,
    height: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlignVertical: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  rowHeader: {
    width: 60,
    height: 40,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlignVertical: 'center',
  },
  cell: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
    borderRadius: 4,
  },
  cellText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  legendContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 10,
  },
  legendText: {
    fontSize: 12,
    color: '#2c3e50',
    flex: 1,
  },
});