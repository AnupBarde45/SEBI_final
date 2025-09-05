import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { riskAPI } from '../services/api';

const badgeInfo = {
  'Risk Explorer': {
    icon: '🎯',
    description: 'Completed the Risk Profile Quiz',
    color: '#3498db'
  },
  'Risk Forecaster': {
    icon: '🔮',
    description: 'Used the Scenario Simulator',
    color: '#9b59b6'
  },
  'Risk Analyst': {
    icon: '📊',
    description: 'Viewed Risk Dashboard multiple times',
    color: '#e67e22'
  }
};

export default function BadgesScreen({ route }) {
  const { userId } = route.params;
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const response = await riskAPI.getBadges(userId);
      setBadges(response.data);
    } catch (error) {
      console.error('Failed to load badges:', error);
    }
    setLoading(false);
  };

  const renderBadge = ({ item }) => {
    const info = badgeInfo[item.badgeType];
    return (
      <View style={[styles.badgeCard, { borderLeftColor: info.color }]}>
        <Text style={styles.badgeIcon}>{info.icon}</Text>
        <View style={styles.badgeContent}>
          <Text style={styles.badgeTitle}>{item.badgeType}</Text>
          <Text style={styles.badgeDescription}>{info.description}</Text>
          <Text style={styles.badgeDate}>
            Earned: {new Date(item.earnedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading badges...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <Text style={styles.title}>Your Achievement Badges</Text>
      
      {badges.length === 0 ? (
        <View style={styles.noBadges}>
          <Text style={styles.noBadgesText}>No badges earned yet!</Text>
          <Text style={styles.noBadgesSubtext}>
            Complete activities to earn badges and track your progress.
          </Text>
        </View>
      ) : (
        <FlatList
          data={badges}
          renderItem={renderBadge}
          keyExtractor={(item, index) => `${item.badgeType}-${index}`}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <View style={styles.availableBadges}>
        <Text style={styles.availableTitle}>Available Badges:</Text>
        {Object.entries(badgeInfo).map(([badgeType, info]) => (
          <View key={badgeType} style={styles.availableBadge}>
            <Text style={styles.availableIcon}>{info.icon}</Text>
            <Text style={styles.availableName}>{badgeType}</Text>
            <Text style={styles.availableDesc}>{info.description}</Text>
          </View>
        ))}
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
    marginBottom: 30,
    color: '#2c3e50',
    padding: 20,
  },
  badgeCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  badgeIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  badgeDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  noBadges: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noBadgesText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7f8c8d',
    marginBottom: 10,
  },
  noBadgesSubtext: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
  availableBadges: {
    marginTop: 30,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
  },
  availableTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#2c3e50',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availableIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  availableName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginRight: 10,
  },
  availableDesc: {
    fontSize: 12,
    color: '#7f8c8d',
    flex: 1,
  },
});