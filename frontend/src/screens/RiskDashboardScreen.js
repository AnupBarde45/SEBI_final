import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { riskAPI } from '../services/api';
import RiskScoreGauge from '../components/RiskScoreGauge';
import MetricCard from '../components/MetricCard';

export default function RiskDashboardScreen({ route }) {
  const { userId } = route.params;
  const [profile, setProfile] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, metricsRes] = await Promise.all([
        riskAPI.getRiskProfile(userId),
        riskAPI.getMetrics(userId),
      ]);

      setProfile(profileRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={true}
    >
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.profileType}>{profile.profileType} Investor</Text>
        <Text style={styles.description}>
          {profile.profileDescription?.description ||
            'Risk profile assessment complete'}
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

      {/* Risk Score Gauge */}
      <View style={styles.gaugeWrapper}>
        <RiskScoreGauge score={profile.riskScore} />
      </View>

      {/* Metrics Section */}
      {metrics && (
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Portfolio Risk Metrics</Text>

          <MetricCard
            title="Volatility"
            value={`${metrics.volatility}%`}
            description="Annual price fluctuation"
            color={
              metrics.volatility > 20
                ? '#e74c3c'
                : metrics.volatility > 15
                ? '#f39c12'
                : '#27ae60'
            }
          />

          <MetricCard
            title="Beta"
            value={metrics.beta}
            description="Market sensitivity"
            color={
              metrics.beta > 1.2
                ? '#e74c3c'
                : metrics.beta > 0.8
                ? '#f39c12'
                : '#27ae60'
            }
          />

          <MetricCard
            title="Sharpe Ratio"
            value={metrics.sharpeRatio}
            description="Risk-adjusted return"
            color={
              metrics.sharpeRatio > 1
                ? '#27ae60'
                : metrics.sharpeRatio > 0.5
                ? '#f39c12'
                : '#e74c3c'
            }
          />

          <MetricCard
            title="Expected Return"
            value={`${metrics.expectedReturn}%`}
            description="Annual expected return"
            color={
              metrics.expectedReturn > 8
                ? '#27ae60'
                : metrics.expectedReturn > 5
                ? '#f39c12'
                : '#e74c3c'
            }
          />

          <MetricCard
            title="Value at Risk (95%)"
            value={`₹${metrics.var95}`}
            description="Maximum daily loss"
            color="#e74c3c"
          />

          {metrics.maxDrawdown && (
            <MetricCard
              title="Max Drawdown"
              value={`${metrics.maxDrawdown}%`}
              description="Worst case scenario loss"
              color="#e74c3c"
            />
          )}
        </View>
      )}
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
  contentContainer: {
    paddingBottom: 20, // only bottom padding
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
  gaugeWrapper: {
    marginTop: 16, // small gap under header
    alignItems: 'center',
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
