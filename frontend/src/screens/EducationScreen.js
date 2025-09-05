import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function EducationScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>Investment Risk Education</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Understanding Risk vs Return</Text>
        <Text style={styles.text}>
          Higher potential returns typically come with higher risk. The key is finding the right balance for your situation.
        </Text>
        
        <View style={styles.exampleBox}>
          <Text style={styles.exampleTitle}>Example:</Text>
          <Text style={styles.exampleText}>
            • Government Bonds: 3-4% return, Very Low Risk{'\n'}
            • Balanced Mutual Funds: 6-8% return, Medium Risk{'\n'}
            • Growth Stocks: 10-15% return, High Risk
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Key Risk Metrics Explained</Text>
        
        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Volatility</Text>
          <Text style={styles.metricDesc}>
            Measures how much your investment value fluctuates. Higher volatility means bigger swings up and down.
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Beta</Text>
          <Text style={styles.metricDesc}>
            Compares your portfolio's movement to the overall market. Beta greater than 1 means more volatile than market.
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Sharpe Ratio</Text>
          <Text style={styles.metricDesc}>
            Measures return per unit of risk. Higher is better - you get more return for the risk you take.
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricTitle}>Value at Risk (VaR)</Text>
          <Text style={styles.metricDesc}>
            Estimates the maximum loss you might face in a day with 95% confidence. Helps plan for worst-case scenarios.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Risk Management Tips</Text>
        <Text style={styles.text}>
          • Diversify across different asset classes{'\n'}
          • Don't invest money you need within 2 years{'\n'}
          • Review and rebalance your portfolio regularly{'\n'}
          • Stay calm during market volatility{'\n'}
          • Consider your age and goals when choosing risk level
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Back to Dashboard</Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    backgroundColor: '#2c3e50',
    color: 'white',
  },
  section: {
    margin: 20,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2c3e50',
  },
  exampleBox: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 13,
    color: '#34495e',
    lineHeight: 20,
  },
  metricCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  metricDesc: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: '#3498db',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});