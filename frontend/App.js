import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
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
import StockAnalysisScreen from './src/screens/StockAnalysisScreen';
import FakeNewsDetectionScreen from './src/screens/FakeNewsDetectionScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="InitialPage">
        <Stack.Screen name="InitialPage" component={InitialPage} options={{ headerShown: false }} />
        <Stack.Screen name="Disclaimer" component={DisclaimerScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Risk Assessment' }} />
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
        <Stack.Screen name="StockAnalysis" component={StockAnalysisScreen} options={{ title: 'Stock Analysis' }} />
        <Stack.Screen name="FakeNewsDetection" component={FakeNewsDetectionScreen} options={{ title: 'Fake News Detection' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
