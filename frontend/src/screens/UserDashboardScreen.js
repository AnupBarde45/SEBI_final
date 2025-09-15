import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useUser } from '../context/UserContext';
import UserHeader from '../components/UserHeader';

const BACKEND_URL = 'http://172.28.175.90:3000';

const UserDashboardScreen = ({ navigation }) => {
  const { userId, token, user } = useUser();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    riskProfile: {
      profileType: 'Moderate',
      riskScore: 65,
      profileDescription: {
        description: 'You seek a balance between growth and stability. You can handle moderate volatility for potentially better long-term returns.'
      }
    },
    portfolioScore: 12,
    contestScore: 85,
    totalQuizzes: 3,
    totalTrades: 5
  });

  const getRiskColor = (profileType) => {
    switch (profileType) {
      case 'Very Conservative': return '#6c757d';
      case 'Conservative': return '#28a745';
      case 'Moderate': return '#ffc107';
      case 'Aggressive': return '#fd7e14';
      case 'Very Aggressive': return '#dc3545';
      default: return '#007bff';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UserHeader navigation={navigation} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {user?.name}!</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🎯 Risk Profile</Text>
          {dashboardData.riskProfile ? (
            <View>
              <View style={styles.riskHeader}>
                <Text style={[styles.riskType, { color: getRiskColor(dashboardData.riskProfile.profileType) }]}>
                  {dashboardData.riskProfile.profileType}
                </Text>
                <Text style={styles.riskScore}>Score: {dashboardData.riskProfile.riskScore}/100</Text>
              </View>
              <Text style={styles.riskDescription}>
                {dashboardData.riskProfile.profileDescription?.description}
              </Text>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('Dashboard')}
              >
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={styles.noDataText}>No risk assessment completed</Text>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('RiskQuiz')}
              >
                <Text style={styles.actionButtonText}>Take Risk Assessment</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>💼 Portfolio Performance</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{dashboardData.portfolioScore}%</Text>
            <Text style={styles.scoreLabel}>Portfolio Growth</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData.totalTrades}</Text>
              <Text style={styles.statLabel}>Total Trades</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>₹100,000</Text>
              <Text style={styles.statLabel}>Starting Capital</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('VirtualDemat')}
          >
            <Text style={styles.actionButtonText}>View Portfolio</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Contest Performance</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{dashboardData.contestScore}</Text>
            <Text style={styles.scoreLabel}>Total Quiz Points</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData.totalQuizzes}</Text>
              <Text style={styles.statLabel}>Quizzes Taken</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {dashboardData.totalQuizzes > 0 ? Math.round(dashboardData.contestScore / dashboardData.totalQuizzes) : 0}
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Quiz')}
          >
            <Text style={styles.actionButtonText}>Take Quiz</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Tutorial')}
            >
              <Text style={styles.quickActionText}>📚 Learn</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('StockAnalysis')}
            >
              <Text style={styles.quickActionText}>📈 Analyze</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Leaderboard')}
            >
              <Text style={styles.quickActionText}>🏅 Leaderboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
  scrollContent: {
    padding: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  riskType: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  riskScore: {
    fontSize: 16,
    color: '#666',
  },
  riskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007bff',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noDataText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickActionButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickActionText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
  },
});

export default UserDashboardScreen;