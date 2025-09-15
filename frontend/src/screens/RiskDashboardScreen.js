import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '../context/UserContext';

const BACKEND_URL = 'http://172.28.175.90:3000';

export default function RiskDashboardScreen({ route }) {
  const { userId, token } = useUser();
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const profileResponse = await fetch(`${BACKEND_URL}/api/risk/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const metricsResponse = await fetch(`${BACKEND_URL}/api/risk/metrics/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setProfile(profileData);
      }

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.center}>
        <Text style={styles.noData}>
          No risk profile found. Please take the quiz first.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.profileType}>{profile.profileType} Investor</Text>
        <Text style={styles.description}>
          {profile.profileDescription?.description || 'Risk profile assessment complete'}
        </Text>
        {profile.profileDescription && (
          <View style={styles.allocationContainer}>
            <Text style={styles.allocationTitle}>Recommended Allocation:</Text>
            <Text style={styles.allocationText}>
              {profile.profileDescription.allocation}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreTitle}>Risk Score</Text>
        <Text style={styles.scoreValue}>{profile.riskScore}/100</Text>
      </View>

      {metrics && (
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Portfolio Risk Metrics</Text>
          
          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Volatility</Text>
            <Text style={styles.metricValue}>{metrics.volatility}%</Text>
            <Text style={styles.metricDesc}>Annual price fluctuation</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Beta</Text>
            <Text style={styles.metricValue}>{metrics.beta}</Text>
            <Text style={styles.metricDesc}>Market sensitivity</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Sharpe Ratio</Text>
            <Text style={styles.metricValue}>{metrics.sharpeRatio}</Text>
            <Text style={styles.metricDesc}>Risk-adjusted return</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Expected Return</Text>
            <Text style={styles.metricValue}>{metrics.expectedReturn}%</Text>
            <Text style={styles.metricDesc}>Annual expected return</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricTitle}>Value at Risk (95%)</Text>
            <Text style={styles.metricValue}>₹{metrics.var95}</Text>
            <Text style={styles.metricDesc}>Maximum daily loss</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  header: {
    padding: 16,
    backgroundColor: 'white',
  },
  profileType: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#7f8c8d',
    lineHeight: 22,
  },
  allocationContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  allocationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  allocationText: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '500',
  },
  scoreContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  scoreTitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007bff',
  },
  metricsContainer: {
    padding: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#2c3e50',
  },
  metricCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginVertical: 5,
  },
  metricDesc: {
    fontSize: 12,
    color: '#666',
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});