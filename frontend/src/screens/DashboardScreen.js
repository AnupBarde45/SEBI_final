import React, { useState, useEffect } from 'react'; // Keep useState, useEffect for potential future local states if needed
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useUser } from '../context/UserContext'; // Import our custom hook for UserContext
import { appId } from '../constants'; // Import appId directly from constants

function DashboardScreen({ navigation }) {
  const { userId, userProgress } = useUser(); // Get userId and userProgress from context

  // We assume userProgress is always available from context after App.js is ready
  // No need for local loading state for userProgress here, as App.js handles it.

  if (!userProgress || !userId) { // Fallback if context somehow isn't fully ready
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading your Dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Dashboard</Text>
      <Text style={styles.subtitle}>Your personalized overview of progress and insights!</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>User Information</Text>
        <Text style={styles.cardText}>User ID: {userId || 'N/A'}</Text>
        <Text style={styles.cardText}>App ID: {appId}</Text> {/* appId is also from constants */}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Learning Progress</Text>
        <Text style={styles.cardText}>Completed Modules: {userProgress.completedModules}</Text>
        <Text style={styles.cardText}>Total Quiz Score: {userProgress.totalQuizScore}</Text>
        {/* Placeholder for a visual progress bar */}
        <View style={styles.progressBarBackground}>
          {/* Assuming a total of 5 modules for the beginner path for this progress bar */}
          <View style={[styles.progressBarFill, { width: `${(userProgress.completedModules / 5) * 100 || 0}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {userProgress.completedModules} / 5 Modules (Beginner Path)
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('LearningModules')}
        >
          <Text style={styles.actionButtonText}>Continue Learning</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('VirtualDemat')}
        >
          <Text style={styles.actionButtonText}>Start Virtual Trading</Text>
        </TouchableOpacity>
      </View>
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
  errorContainer: { // Keep error container for potential local errors
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe0e0',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#cc0000',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8', // Light background
    padding: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#667788',
    marginBottom: 25,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 5,
  },
  progressBarBackground: {
    height: 8,
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginTop: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007bff',
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#667788',
    marginTop: 5,
    textAlign: 'right',
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;