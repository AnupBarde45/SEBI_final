import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useUser } from '../context/UserContext';
import UserHeader from '../components/UserHeader';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const UserDashboardScreen = ({ navigation }) => {
  const { userId, token, user } = useUser();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching dashboard data for userId:', userId);
      console.log('🔍 Using token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`${BACKEND_URL}/api/dashboard/dashboard/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dashboard data received:', data);
        setDashboardData(data.data);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch dashboard data:', response.status, errorText);
      }
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!dashboardData) {
    return (
      <View style={styles.container}>
        <UserHeader navigation={navigation} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load dashboard data</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDashboardData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UserHeader navigation={navigation} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>My Dashboard</Text>
        <Text style={styles.subtitle}>Welcome back, {dashboardData.user?.name}!</Text>

        {/* Motivational Message */}
        {dashboardData.motivationalMessage && (
          <View style={styles.motivationCard}>
            <Text style={styles.motivationIcon}>💡</Text>
            <Text style={styles.motivationText}>{dashboardData.motivationalMessage}</Text>
          </View>
        )}

        {/* Player Ranking */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Player Ranking</Text>
          <View style={styles.rankingContainer}>
            <Text style={styles.rankingValue}>#{dashboardData.ranking?.currentRank || 'N/A'}</Text>
            <Text style={styles.rankingLabel}>Out of {dashboardData.ranking?.totalUsers || 0} players</Text>
            <Text style={styles.percentileText}>
              Top {dashboardData.ranking?.percentile || 0}%
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.actionButtonText}>View Leaderboard</Text>
          </TouchableOpacity>
        </View>


        {/* Achievements */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏆 Achievements</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreValue}>{dashboardData.achievements?.totalQuizzes || 0}</Text>
            <Text style={styles.scoreLabel}>Quizzes Completed</Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData.achievements?.totalTrades || 0}</Text>
              <Text style={styles.statLabel}>Total Trades</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboardData.achievements?.badges?.length || 0}</Text>
              <Text style={styles.statLabel}>Badges Earned</Text>
            </View>
          </View>
          <View style={styles.badgesContainer}>
            {dashboardData.achievements?.badges && Array.isArray(dashboardData.achievements.badges) 
              ? dashboardData.achievements.badges.slice(0, 3).map((badge, index) => (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge.badgeType || 'Badge'}</Text>
                  </View>
                ))
              : <Text style={styles.noDataText}>No badges earned yet</Text>
            }
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
  // New styles for additional components
  rankingContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  rankingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffd700',
  },
  rankingLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  percentileText: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
  },
  performanceMetrics: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  metricText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  badge: {
    backgroundColor: '#007bff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  noDataText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  motivationCard: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  motivationIcon: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  motivationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    fontStyle: 'italic',
  },
});

export default UserDashboardScreen;