import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';

// --- Mock Backend URL (REPLACE with your actual backend URL later!) ---
// IMPORTANT: Change this to your backend's IP address if running on device!
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';


function FakeNewsDetectorScreen({ navigation }) {
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { credibilityScore: 'High Risk', explanation: '...' }
  const [error, setError] = useState('');

  const handleAnalyzeMessage = async () => {
    if (!messageText.trim()) {
      Alert.alert("Input Required", "Please paste a message to analyze.");
      return;
    }

    setLoading(true);
    setResult(null);
    setError('');

    try {
      // --- API Call to Backend (we'll build this backend endpoint later!) ---
      const response = await fetch(`${BACKEND_URL}/api/detect-fake-news`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageText: messageText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze message.');
      }

      const data = await response.json();
      setResult(data);

    } catch (err) {
      console.error("FAKE_NEWS_ERROR:", err);
      setError(err.message || "An unexpected error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get color for credibility score
  const getScoreColor = (score) => {
    switch (score) {
      case 'High Risk': return '#dc3545'; // Red
      case 'Suspicious': return '#ffc107'; // Yellow/Orange
      case 'Legitimate': return '#28a745'; // Green
      default: return '#6c757d'; // Gray
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.headerTitle}>Fake News Detector</Text>
        <Text style={styles.headerSubtitle}>Paste a message to check its credibility and spot misinformation.</Text>

        {error && <Text style={styles.errorText}>Error: {error}</Text>}

        <View style={styles.card}>
          <Text style={styles.cardHeader}>Paste Message Here</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., 'Invest in XYZ stock, guaranteed 200% returns in a week!'"
            placeholderTextColor="#6c757d"
            multiline
            numberOfLines={6}
            value={messageText}
            onChangeText={setMessageText}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.analyzeButton, loading || !messageText.trim() ? styles.analyzeButtonDisabled : {}]}
            onPress={handleAnalyzeMessage}
            disabled={loading || !messageText.trim()}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.analyzeButtonText}>Analyze Message</Text>
            )}
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.cardHeader}>Analysis Result</Text>
            <View style={styles.scoreDisplay}>
              <Text style={styles.scoreLabel}>Credibility Score:</Text>
              <Text style={[styles.scoreValue, { color: getScoreColor(result.credibilityScore) }]}>
                {result.credibilityScore}
              </Text>
            </View>
            <Text style={styles.explanationHeader}>Explanation:</Text>
            <Text style={styles.explanationText}>{result.explanation}</Text>
          </View>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    padding: 15,
    paddingBottom: Platform.OS === 'android' ? 20 : 10,
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
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    fontWeight: 'bold',
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
  textInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#343a40',
    backgroundColor: '#f8f9fa',
    marginBottom: 15,
    minHeight: 100, // Larger input area for messages
    textAlignVertical: 'top', // Aligns text to the top for multiline input
  },
  analyzeButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  analyzeButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  scoreDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
  },
  scoreLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  explanationHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 15,
    marginBottom: 5,
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4a5568',
  },
});

export default FakeNewsDetectorScreen;