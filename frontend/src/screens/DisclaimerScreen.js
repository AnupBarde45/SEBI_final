import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';

export default function DisclaimerScreen({ navigation, route }) {
  const [hasAccepted, setHasAccepted] = useState(false);
  const nextScreen = route.params?.nextScreen || 'RiskQuiz';

  const handleProceed = () => {
    if (!hasAccepted) {
      Alert.alert('Acknowledgment Required', 'Please confirm that you have read and understood the information above.');
      return;
    }
    navigation.navigate(nextScreen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Investment Risk Assessment</Text>
      </View>
      <Text style={styles.subHeader}>Important Information</Text>
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>📊 What is Risk Assessment?</Text>
          <Text style={styles.text}>
            Risk assessment is the process of evaluating how much uncertainty and potential loss you can handle in your investments. It helps determine the right balance between risk and return for your financial goals.
          </Text>

          <Text style={styles.sectionTitle}>🎯 Why Does This Matter?</Text>
          <Text style={styles.text}>
            • <Text style={styles.bold}>Prevents Emotional Decisions:</Text> Knowing your risk tolerance helps you stay calm during market volatility{'\n'}
            • <Text style={styles.bold}>Optimizes Returns:</Text> Match your investments to your comfort level for better long-term results{'\n'}
            • <Text style={styles.bold}>Reduces Stress:</Text> Invest within your comfort zone to sleep better at night{'\n'}
            • <Text style={styles.bold}>Achieves Goals:</Text> Align your investment strategy with your life objectives
          </Text>

          <Text style={styles.sectionTitle}>⚠️ Key Risk Factors We Evaluate</Text>
          
          <Text style={styles.subSectionTitle}>1. Age & Time Horizon</Text>
          <Text style={styles.text}>
            Younger investors typically can take more risk because they have more time to recover from market downturns. As you approach retirement, preserving capital becomes more important than growth.
          </Text>

          <Text style={styles.subSectionTitle}>2. Income Stability</Text>
          <Text style={styles.text}>
            Stable income allows for higher risk tolerance since you have consistent cash flow. Variable or irregular income requires more conservative approaches to maintain financial security.
          </Text>

          <Text style={styles.subSectionTitle}>3. Investment Experience</Text>
          <Text style={styles.text}>
            Experience with market volatility helps you understand and handle investment risks better. New investors often benefit from starting with moderate risk levels.
          </Text>

          <Text style={styles.subSectionTitle}>4. Financial Goals</Text>
          <Text style={styles.text}>
            Short-term goals (buying a house in 2 years) require low-risk investments. Long-term goals (retirement in 20 years) can accommodate higher risk for potentially better returns.
          </Text>

          <Text style={styles.subSectionTitle}>5. Emergency Fund Status</Text>
          <Text style={styles.text}>
            Having 3-6 months of expenses saved allows you to take more investment risk since you won't need to sell investments during emergencies.
          </Text>

          <Text style={styles.sectionTitle}>📈 Risk Categories Explained</Text>
          
          <View style={styles.riskCard}>
            <Text style={[styles.riskTitle, { color: '#27ae60' }]}>Conservative (Low Risk)</Text>
            <Text style={styles.riskDesc}>• Expected Return: 4-6% annually</Text>
            <Text style={styles.riskDesc}>• Volatility: Low (5-10% swings)</Text>
            <Text style={styles.riskDesc}>• Best For: Near retirement, need money soon</Text>
            <Text style={styles.riskDesc}>• Typical Portfolio: 70% bonds, 30% stocks</Text>
          </View>

          <View style={styles.riskCard}>
            <Text style={[styles.riskTitle, { color: '#f39c12' }]}>Moderate (Medium Risk)</Text>
            <Text style={styles.riskDesc}>• Expected Return: 6-8% annually</Text>
            <Text style={styles.riskDesc}>• Volatility: Medium (10-20% swings)</Text>
            <Text style={styles.riskDesc}>• Best For: Balanced approach, 5-15 year goals</Text>
            <Text style={styles.riskDesc}>• Typical Portfolio: 50% stocks, 50% bonds</Text>
          </View>

          <View style={styles.riskCard}>
            <Text style={[styles.riskTitle, { color: '#e74c3c' }]}>Aggressive (High Risk)</Text>
            <Text style={styles.riskDesc}>• Expected Return: 8-12% annually</Text>
            <Text style={styles.riskDesc}>• Volatility: High (20-40% swings)</Text>
            <Text style={styles.riskDesc}>• Best For: Young investors, long-term goals</Text>
            <Text style={styles.riskDesc}>• Typical Portfolio: 90% stocks, 10% bonds</Text>
          </View>

          <Text style={styles.sectionTitle}>🔍 What You'll Learn</Text>
          <Text style={styles.text}>
            • Your personal risk tolerance score (0-100){'\n'}
            • Recommended investment allocation{'\n'}
            • How market changes affect your portfolio{'\n'}
            • Key risk metrics (Volatility, Beta, Sharpe Ratio, VaR){'\n'}
            • Scenario analysis for different market conditions
          </Text>

          <Text style={styles.sectionTitle}>⚖️ Important Disclaimers</Text>
          <Text style={styles.disclaimerText}>
            • This assessment is for educational purposes only{'\n'}
            • Results are estimates based on sample data{'\n'}
            • Past performance does not guarantee future results{'\n'}
            • All investments carry risk of loss{'\n'}
            • Consider consulting a financial advisor for personalized advice{'\n'}
            • Market conditions can change rapidly{'\n'}
            • Your risk tolerance may change over time
          </Text>

          <Text style={styles.sectionTitle}>🚀 Ready to Begin?</Text>
          <Text style={styles.text}>
            The assessment takes about 5 minutes and will provide you with valuable insights into your investment personality. You'll receive a detailed risk profile with actionable recommendations.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <View style={styles.checkboxContainer}>
          <View style={styles.checkboxRow}>
            <TouchableOpacity 
              style={styles.checkbox}
              onPress={() => setHasAccepted(!hasAccepted)}
            >
              <Text style={styles.checkboxText}>{hasAccepted ? '✓' : ''}</Text>
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              I have read and understood the information provided above regarding investment risk assessment and its implications.
            </Text>
            <TouchableOpacity 
              style={[styles.sideButton, { opacity: hasAccepted ? 1 : 0.3 }]}
              onPress={handleProceed}
              disabled={!hasAccepted}
            >
              <Text style={styles.sideButtonText}>Enter System</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
  },
  backArrow: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    padding: 20,
    color: 'white',
  },
  subHeader: {
    fontSize: 16,
    textAlign: 'center',
    paddingBottom: 10,
    backgroundColor: '#2c3e50',
    color: '#ecf0f1',
  },
  scrollView: {
    flex: 1,
    maxHeight: '70vh',
  },

  content: {
    padding: 20,
    minHeight: 1500,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginTop: 15,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2c3e50',
    marginBottom: 15,
  },
  bold: {
    fontWeight: 'bold',
  },
  riskCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  riskDesc: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  disclaimerText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#e74c3c',
    fontStyle: 'italic',
    marginBottom: 15,
  },
  bottomContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  checkboxContainer: {
    padding: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  checkboxText: {
    color: '#3498db',
    fontWeight: 'bold',
    fontSize: 16,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  sideButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  sideButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});