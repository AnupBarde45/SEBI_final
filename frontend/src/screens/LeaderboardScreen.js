import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useUser } from '../context/UserContext'; // To get userId and userProgress

// --- Mock Data for Leaderboard (for hackathon demo) ---
const MOCK_LEADERBOARD_DATA = [
  { id: 'user-top-1', name: 'ProInvestorX', score: 1200, virtualProfit: 50000 },
  { id: 'user-top-2', name: 'MarketMaestro', score: 1150, virtualProfit: 45000 },
  { id: 'user-top-3', name: 'SmartTrader', score: 1100, virtualProfit: 40000 },
  { id: 'user-top-4', name: 'FinanceGuru', score: 1050, virtualProfit: 38000 },
  { id: 'user-top-5', name: 'WealthBuilder', score: 1000, virtualProfit: 35000 },
  { id: 'user-top-6', name: 'EquityExpert', score: 950, virtualProfit: 30000 },
  { id: 'user-top-7', name: 'GrowthSeeker', score: 900, virtualProfit: 28000 },
  { id: 'user-top-8', name: 'ValueHunter', score: 850, virtualProfit: 25000 },
  // Your user will be inserted into this list dynamically
];

function LeaderboardScreen({ navigation }) {
  const { userId, userProgress } = useUser();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Simulate fetching leaderboard data
    let combinedLeaderboard = [...MOCK_LEADERBOARD_DATA];

    // Add/Update current user's progress to the leaderboard
    if (userId && userProgress) {
      const currentUserScore = (userProgress.totalQuizScore || 0) + (userProgress.completedModules * 50); // Example scoring
      const currentUserVirtualProfit = 0; // For now, virtual profit is not tracked in userProgress
      const currentUserEntry = {
        id: userId,
        name: `You (${userId.substring(0, 8)}...)`, // Shorten ID for display
        score: currentUserScore,
        virtualProfit: currentUserVirtualProfit,
      };

      const existingUserIndex = combinedLeaderboard.findIndex(entry => entry.id === userId);
      if (existingUserIndex !== -1) {
        combinedLeaderboard[existingUserIndex] = currentUserEntry; // Update existing
      } else {
        combinedLeaderboard.push(currentUserEntry); // Add new
      }
    }

    // Sort the leaderboard by score (descending)
    combinedLeaderboard.sort((a, b) => b.score - a.score);

    setLeaderboard(combinedLeaderboard);
    setLoading(false);
  }, [userId, userProgress]); // Recalculate if user's data changes

  const renderLeaderboardItem = ({ item, index }) => {
    const isCurrentUser = item.id === userId;
    return (
      <View style={[styles.leaderboardItem, isCurrentUser && styles.currentUserItem]}>
        <Text style={styles.rankText}>{index + 1}.</Text>
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.scoreText}>Score: {item.score}</Text>
        {/* <Text style={styles.profitText}>Profit: ₹{item.virtualProfit.toFixed(0)}</Text> */}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading Leaderboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Global Leaderboard</Text>
      <Text style={styles.headerSubtitle}>See how you rank among other SaralNivesh investors!</Text>

      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 15,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#667788',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentUserItem: {
    backgroundColor: '#e0f7fa', // Highlight color for current user
    borderColor: '#007bff',
    borderWidth: 2,
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    width: 40, // Fixed width for rank
  },
  nameText: {
    flex: 1, // Takes up available space
    fontSize: 16,
    color: '#334155',
    fontWeight: '500',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745', // Green for score
    marginLeft: 10,
  },
  profitText: {
    fontSize: 14,
    color: '#667788',
    marginLeft: 10,
  },
});

export default LeaderboardScreen;