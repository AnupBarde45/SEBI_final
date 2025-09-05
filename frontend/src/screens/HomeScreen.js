import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useUser } from '../context/UserContext';

// Example icons (you'll install a real icon library later, e.g., 'react-native-vector-icons')
const Icon = ({ name }) => <Text style={styles.icon}>{name}</Text>;

function HomeScreen({ navigation }) {
  const { userId, appId } = useUser();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <ScrollView style={styles.outerContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeText}>Hello Future Investor!</Text>
          <Text style={styles.headerSubtitle}>Ready to master the markets?</Text>
          <Text style={styles.userIdText}>Your Session ID: {userId || 'Loading...'}</Text>
          <Text style={styles.appIdText}>App ID: {appId}</Text>
        </View>

        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Icon name="🏠" />
            <Text style={styles.cardTitle}>My Dashboard</Text>
            <Text style={styles.cardDescription}>Overview of your progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('LearningModules')}
          >
            <Icon name="📚" />
            <Text style={styles.cardTitle}>Learn & Grow</Text>
            <Text style={styles.cardDescription}>Interactive lessons & quizzes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('VirtualDemat')}
          >
            <Icon name="📊" />
            <Text style={styles.cardTitle}>Virtual Trading</Text>
            <Text style={styles.cardDescription}>Practice investing risk-free</Text>
          </TouchableOpacity>

          {/* --- NEW: Leaderboard Button --- */}
          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Icon name="🏆" />
            <Text style={styles.cardTitle}>Leaderboard</Text>
            <Text style={styles.cardDescription}>See top investors</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('AIGuru')}
          >
            <Icon name="🧠" />
            <Text style={styles.cardTitle}>SaralNivesh AI Guru</Text>
            <Text style={styles.cardDescription}>Chat, translate & summarize with AI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('FakeNewsDetector')}
          >
            <Icon name="🚨" />
            <Text style={styles.cardTitle}>Fake News Detector</Text>
            <Text style={styles.cardDescription}>Spot misinformation instantly</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('StockAnalysis')}
          >
            <Icon name="📈" />
            <Text style={styles.cardTitle}>Stock Trends</Text>
            <Text style={styles.cardDescription}>Understand market movements</Text>
          </TouchableOpacity>

          {/* --- NEW QUIZ BUTTON --- */}
          <TouchableOpacity
            style={[styles.featureCard, styles.quizCard]}
            onPress={() => navigation.navigate('Quiz')}
          >
            <Icon name="🧠" />
            <Text style={styles.cardTitle}>Take Quiz</Text>
            <Text style={styles.cardDescription}>Test your knowledge</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  headerContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#4a4a4a',
    marginBottom: 15,
    textAlign: 'center',
  },
  userIdText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  appIdText: {
    fontSize: 10,
    color: '#6c757d',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  featureCard: {
    width: '45%',
    margin: 8,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 150,
  },
  quizCard: {
    backgroundColor: '#4CAF50',
  },
  icon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default HomeScreen;