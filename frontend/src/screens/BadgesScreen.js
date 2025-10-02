import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '../context/UserContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Dynamic badge info will be fetched from API

export default function BadgesScreen({ route }) {
  const { userId, token } = useUser();
  const [badges, setBadges] = useState([]);
  const [badgeTypes, setBadgeTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await loadBadgeTypes();
    await loadBadges();
  };

  const loadBadgeTypes = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/badge-types`);
      const types = await response.json();
      setBadgeTypes(types);
      return types;
    } catch (error) {
      console.error('Failed to load badge types:', error);
      return [];
    }
  };

  const loadBadges = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/risk/profile/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.riskScore) {
          const badge = getRiskBadge(data.riskScore);
          if (badge !== 'Unknown Badge') {
            setBadges([{ badgeType: badge, earnedAt: data.createdAt, riskScore: data.riskScore }]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load badges:', error);
    }
    setLoading(false);
  };
  
  const getRiskBadge = (score) => {
    const badge = badgeTypes.find(b => score >= b.min_value && score <= b.max_value);
    return badge ? badge.badge_name : 'Unknown Badge';
  };

  const getIconEmoji = (iconText) => {
    const icons = {
      'SHIELD': '🛡️',
      'SCALE': '⚖️', 
      'ROCKET': '🚀',
      'DIAMOND': '💎'
    };
    return icons[iconText] || iconText;
  };

  const renderBadge = ({ item }) => {
    const info = badgeTypes.find(b => b.badge_name === item.badgeType);
    if (!info) return null;
    
    return (
      <View style={[styles.badgeCard, { borderLeftColor: info.badge_color }]}>
        <Text style={styles.badgeIcon}>{getIconEmoji(info.badge_icon)}</Text>
        <View style={styles.badgeContent}>
          <Text style={styles.badgeTitle}>{item.badgeType}</Text>
          <Text style={styles.badgeDescription}>{info.description}</Text>
          <Text style={styles.badgeDate}>
            Risk Score: {item.riskScore} | Earned: {new Date(item.earnedAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading badges...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Achievement Badges</Text>
      
      {badges.length === 0 ? (
        <View style={styles.noBadges}>
          <Text style={styles.noBadgesText}>No badges earned yet!</Text>
          <Text style={styles.noBadgesSubtext}>
            Complete the Risk Assessment Quiz to earn your investor badge based on your risk score.
          </Text>
        </View>
      ) : (
        badges.map((item, index) => (
          <View key={index}>
            {renderBadge({ item, index })}
          </View>
        ))
      )}
      
      <View style={styles.availableBadges}>
        <Text style={styles.availableTitle}>Available Badges:</Text>
        {badgeTypes.map((badge) => (
          <View key={badge.id} style={styles.availableBadge}>
            <Text style={styles.availableIcon}>{getIconEmoji(badge.badge_icon)}</Text>
            <Text style={styles.availableName}>{badge.badge_name}</Text>
            <Text style={styles.availableDesc}>{badge.description}</Text>
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingVertical: 50,
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
    marginHorizontal: 20,
    marginBottom: 20,
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