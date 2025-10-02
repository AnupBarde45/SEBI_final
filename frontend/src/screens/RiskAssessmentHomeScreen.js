import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useUser } from '../context/UserContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function RiskAssessmentHomeScreen({ navigation }) {
  const { userId } = useUser();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Risk Assessment Module</Text>
      <Text style={styles.subtitle}>Discover your investment risk profile</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('RiskQuiz')}
      >
        <Text style={styles.buttonText}>Take Risk Quiz</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <Text style={styles.buttonText}>View Dashboard</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Simulator')}
      >
        <Text style={styles.buttonText}>Scenario Simulator</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Badges')}
      >
        <Text style={styles.buttonText}>My Badges</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#9b59b6' }]}
        onPress={() => navigation.navigate('Education')}
      >
        <Text style={styles.buttonText}>Learn About Risk</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    color: '#7f8c8d',
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});