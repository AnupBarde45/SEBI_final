import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../context/UserContext';
import UserHeader from '../components/UserHeader';

const Icon = ({ name }) => <Text style={styles.icon}>{name}</Text>;

function HomeScreen() {
  const navigation = useNavigation();
  const { userId, appId } = useUser();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="dark-content" backgroundColor="#f0f4f8" />
      <UserHeader navigation={navigation} />
      
      <ScrollView style={styles.outerContainer} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.welcomeText}>Hello Future Investor!</Text>
          <Text style={styles.headerSubtitle}>Ready to master the markets?</Text>
          <Text style={styles.userIdText}>Your Session ID: {userId || 'Loading...'}</Text>
          <Text style={styles.appIdText}>App ID: {appId}</Text>
        </View>

        <View style={styles.featureGrid}>
          <TouchableOpacity
            style={[styles.featureCard, styles.dashboardCard]}
            onPress={() => navigation.navigate('UserDashboard')}
          >
            <Icon name="📊" />
            <Text style={[styles.cardTitle, styles.dashboardTitle]}>My Dashboard</Text>
            <Text style={[styles.cardDescription, styles.dashboardDescription]}>View your complete progress</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Disclaimer', { nextScreen: 'RiskAssessmentHome' })}
          >
            <Icon name="⚖️" />
            <Text style={styles.cardTitle}>Risk Assessment</Text>
            <Text style={styles.cardDescription}>Evaluate your risk profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Portfolio')}
          >
            <Icon name="📈" />
            <Text style={styles.cardTitle}>Portfolio Diversification</Text>
            <Text style={styles.cardDescription}>Optimize your investments</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('Tutorial')}
          >
            <Icon name="📚" />
            <Text style={styles.cardTitle}>Learn & Grow</Text>
            <Text style={styles.cardDescription}>Interactive lessons & quizzes</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.featureCard}
            onPress={() => navigation.navigate('VirtualDemat')}
          >
            <Icon name="💼" />
            <Text style={styles.cardTitle}>Virtual Trading</Text>
            <Text style={styles.cardDescription}>Practice investing risk-free</Text>
          </TouchableOpacity>

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
            onPress={() => navigation.navigate('StockAnalysis')}
          >
            <Icon name="📊" />
            <Text style={styles.cardTitle}>Stock Trends</Text>
            <Text style={styles.cardDescription}>Understand market movements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.featureCard, styles.quizCard]}
            onPress={() => navigation.navigate('Quiz')}
          >
            <Icon name="🧠" />
            <Text style={[styles.cardTitle, styles.quizTitle]}>Take Quiz</Text>
            <Text style={[styles.cardDescription, styles.quizDescription]}>Test your knowledge</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.featureCard, styles.chatbotCard]}
            onPress={() => navigation.navigate('Chatbot')}
          >
            <Icon name="🤖" />
            <Text style={[styles.cardTitle, styles.chatbotTitle]}>SEBI Chatbot</Text>
            <Text style={[styles.cardDescription, styles.chatbotDescription]}>Ask SEBI regulations</Text>
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
    paddingTop: 100,
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
  dashboardCard: {
    backgroundColor: '#007bff',
    width: '95%',
  },
  quizCard: {
    backgroundColor: '#4CAF50',
  },
  chatbotCard: {
    backgroundColor: '#FF9800',
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
  dashboardTitle: {
    color: '#fff',
    fontSize: 20,
  },
  quizTitle: {
    color: '#fff',
  },
  chatbotTitle: {
    color: '#fff',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  dashboardDescription: {
    color: '#e6f3ff',
  },
  quizDescription: {
    color: '#e8f5e8',
  },
  chatbotDescription: {
    color: '#fff3e0',
  },
});

export default HomeScreen;