import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Slider } from 'react-native';
import { riskAPI } from '../services/api';

export default function ScenarioSimulatorScreen({ route }) {
  const { userId } = route.params;
  const [marketChange, setMarketChange] = useState(0);
  const [portfolioChange, setPortfolioChange] = useState(0);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      simulateChange();
    }
  }, [marketChange, profile]);

  const loadProfile = async () => {
    try {
      const response = await riskAPI.getRiskProfile(userId);
      setProfile(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    }
  };

  const simulateChange = async () => {
    if (!profile) return;
    
    try {
      const response = await riskAPI.simulate(userId, marketChange);
      setPortfolioChange(response.data.portfolioChange);
    } catch (error) {
      console.error('Simulation failed:', error);
    }
  };

  const getChangeColor = (change) => {
    if (change > 0) return '#27ae60';
    if (change < 0) return '#e74c3c';
    return '#7f8c8d';
  };

  const getImpactLevel = () => {
    const absChange = Math.abs(portfolioChange);
    if (absChange > 15) return 'High Impact';
    if (absChange > 5) return 'Medium Impact';
    return 'Low Impact';
  };

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>Market Scenario Simulator</Text>
      <Text style={styles.subtitle}>See how market changes affect your portfolio</Text>

      <View style={styles.profileInfo}>
        <Text style={styles.profileText}>Profile: {profile.profileType}</Text>
        <Text style={styles.profileText}>Risk Score: {profile.riskScore}/100</Text>
      </View>

      <View style={styles.simulatorContainer}>
        <Text style={styles.label}>Market Change: {marketChange > 0 ? '+' : ''}{marketChange}%</Text>
        
        <View style={styles.sliderContainer}>
          <Text style={styles.sliderLabel}>Use buttons to simulate market changes:</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.changeButton} onPress={() => setMarketChange(-20)}>
              <Text style={styles.changeButtonText}>-20%</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.changeButton} onPress={() => setMarketChange(-10)}>
              <Text style={styles.changeButtonText}>-10%</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.changeButton} onPress={() => setMarketChange(0)}>
              <Text style={styles.changeButtonText}>0%</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.changeButton} onPress={() => setMarketChange(10)}>
              <Text style={styles.changeButtonText}>+10%</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.changeButton} onPress={() => setMarketChange(20)}>
              <Text style={styles.changeButtonText}>+20%</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Your Portfolio Impact:</Text>
          <Text style={[styles.resultValue, { color: getChangeColor(portfolioChange) }]}>
            {portfolioChange > 0 ? '+' : ''}{portfolioChange}%
          </Text>
          <Text style={styles.impactLevel}>{getImpactLevel()}</Text>
        </View>

        <View style={styles.explanationContainer}>
          <Text style={styles.explanationTitle}>Why this happens:</Text>
          <Text style={styles.explanation}>
            {profile.profileType === 'Aggressive' && 
              'Aggressive portfolios have higher beta, amplifying market movements.'}
            {profile.profileType === 'Moderate' && 
              'Moderate portfolios balance risk, following market trends closely.'}
            {profile.profileType === 'Conservative' && 
              'Conservative portfolios are less sensitive to market volatility.'}
          </Text>
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#2c3e50',
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#7f8c8d',
  },
  profileInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  profileText: {
    fontSize: 16,
    color: '#2c3e50',
    marginBottom: 5,
  },
  simulatorContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#2c3e50',
  },
  sliderContainer: {
    marginBottom: 30,
  },
  sliderLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  changeButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  changeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  impactLevel: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  explanationContainer: {
    backgroundColor: '#ecf0f1',
    padding: 15,
    borderRadius: 8,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#2c3e50',
  },
  explanation: {
    fontSize: 14,
    color: '#7f8c8d',
    lineHeight: 20,
  },
});