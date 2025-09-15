import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from './src/context/UserContext';
import LoginScreen from './src/screens/LoginScreen';
import InitialPage from './src/screens/InitialPage';
import DisclaimerScreen from './src/screens/DisclaimerScreen';
import HomeScreen from './src/screens/HomeScreen';
import RiskQuizScreen from './src/screens/RiskQuizScreen';
import RiskDashboardScreen from './src/screens/RiskDashboardScreen';
import ScenarioSimulatorScreen from './src/screens/ScenarioSimulatorScreen';
import BadgesScreen from './src/screens/BadgesScreen';
import EducationScreen from './src/screens/EducationScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import AssetAllocationScreen from './src/screens/AssetAllocationScreen';
import CorrelationHeatmapScreen from './src/screens/CorrelationHeatmapScreen';
import EfficientFrontierScreen from './src/screens/EfficientFrontierScreen';
import DiversificationScoreScreen from './src/screens/DiversificationScoreScreen';
import TutorialScreen from './src/screens/TutorialScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import FakeNewsDetectionScreen from './src/screens/FakeNewsDetectionScreen';
import VirtualDematScreen from './src/screens/VirtualDematScreen';
import QuizScreen from './src/screens/QuizScreen';
import RiskAssessmentHomeScreen from './src/screens/RiskAssessmentHomeScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import UserDashboardScreen from './src/screens/UserDashboardScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AboutScreen from './src/screens/AboutScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('userToken');
      const savedUser = await AsyncStorage.getItem('userData');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await AsyncStorage.setItem('userToken', userToken);
    await AsyncStorage.setItem('userData', JSON.stringify(userData));
  };

  const handleLogout = async () => {
    const currentUserId = user?.id ? String(user.id) : null;
    if (currentUserId) {
      await AsyncStorage.removeItem(`saralnivesh_virtual_portfolio_${currentUserId}`);
    }
    
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    await AsyncStorage.removeItem('saralnivesh_virtual_portfolio');
    
    setUser(null);
    setToken(null);
  };

  const userContextValue = {
    userId: user?.id ? String(user.id) : 'guest',
    user,
    token,
    appId: 'saralnivesh_v1.0',
    logout: handleLogout
  };

  if (loading) {
    return null;
  }

  return (
    <UserContext.Provider value={userContextValue}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={user ? "Home" : "Login"}>
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
          <Stack.Screen name="InitialPage" component={InitialPage} options={{ headerShown: false }} />
          <Stack.Screen name="Disclaimer" component={DisclaimerScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserDashboard" component={UserDashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
          <Stack.Screen name="RiskQuiz" component={RiskQuizScreen} options={{ title: 'Risk Profile Quiz' }} />
          <Stack.Screen name="Dashboard" component={RiskDashboardScreen} options={{ title: 'Risk Dashboard' }} />
          <Stack.Screen name="Simulator" component={ScenarioSimulatorScreen} options={{ title: 'Scenario Simulator' }} />
          <Stack.Screen name="Badges" component={BadgesScreen} options={{ title: 'Your Badges' }} />
          <Stack.Screen name="Education" component={EducationScreen} options={{ title: 'Risk Education' }} />
          <Stack.Screen name="Portfolio" component={PortfolioScreen} options={{ title: 'Portfolio Diversification' }} />
          <Stack.Screen name="AssetAllocation" component={AssetAllocationScreen} options={{ title: 'Asset Allocation' }} />
          <Stack.Screen name="CorrelationHeatmap" component={CorrelationHeatmapScreen} options={{ title: 'Correlation Heatmap' }} />
          <Stack.Screen name="EfficientFrontier" component={EfficientFrontierScreen} options={{ title: 'Efficient Frontier' }} />
          <Stack.Screen name="DiversificationScore" component={DiversificationScoreScreen} options={{ title: 'Diversification Score' }} />
          <Stack.Screen name="Tutorial" component={TutorialScreen} options={{ title: 'SEBI Learning Tutorial' }} />
          <Stack.Screen name="StockAnalysis" component={AnalysisScreen} options={{ title: 'Stock Analysis' }} />
          <Stack.Screen name="FakeNewsDetection" component={FakeNewsDetectionScreen} options={{ title: 'Fake News Detection' }} />
          <Stack.Screen name="VirtualDemat" component={VirtualDematScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
          <Stack.Screen name="RiskAssessmentHome" component={RiskAssessmentHomeScreen} options={{ title: 'Risk Assessment' }} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Leaderboard' }} />
          <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'SEBI Chatbot' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  );
}