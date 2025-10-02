import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';

export default function PortfolioScreen({ navigation }) {
  const userId = 'user123';
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
        <Text style={styles.title}>Portfolio Diversification</Text>
        <Text style={styles.subtitle}>Build and optimize your investment portfolio</Text>
        
        <View style={styles.educationalBanner}>
          <Text style={styles.bannerTitle}>📚 What is a Portfolio?</Text>
          <Text style={styles.bannerText}>
            A portfolio is a collection of investments (stocks, bonds, etc.) owned by an individual or institution. Diversification means spreading investments across different assets to reduce risk.
          </Text>
        </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('AssetAllocation', { userId })}
      >
        <Text style={styles.buttonText}>🎯 Asset Allocation Simulator</Text>
        <Text style={styles.buttonDesc}>Mix different assets and see risk/return</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('CorrelationHeatmap', { userId })}
      >
        <Text style={styles.buttonText}>🔥 Correlation Heatmap</Text>
        <Text style={styles.buttonDesc}>See how assets move together</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('EfficientFrontier', { userId })}
      >
        <Text style={styles.buttonText}>📈 Efficient Frontier</Text>
        <Text style={styles.buttonDesc}>Find optimal risk-return balance</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('DiversificationScore', { userId })}
      >
        <Text style={styles.buttonText}>⭐ Diversification Score</Text>
        <Text style={styles.buttonDesc}>Rate your portfolio balance</Text>
      </TouchableOpacity>
    </ScrollView>
    
    <Modal
      visible={showDisclaimer}
      animationType="slide"
      transparent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>💼 Portfolio Learning Center</Text>
          
          <Text style={styles.modalSubtitle}>What You'll Learn:</Text>
          <Text style={styles.modalText}>
            • Asset allocation strategies{"\n"}
            • Risk and return relationships{"\n"}
            • Correlation between investments{"\n"}
            • Portfolio optimization techniques
          </Text>
          
          <View style={styles.disclaimerBox}>
            <Text style={styles.disclaimerTitle}>⚠️ EDUCATIONAL DISCLAIMER</Text>
            <Text style={styles.disclaimerText}>
              This is a learning simulation using virtual money and educational scenarios. All portfolio strategies, allocations, and recommendations are for educational purposes only.
              {"\n\n"}
              • No real money involved{"\n"}
              • Simulated market conditions{"\n"}
              • Not financial advice{"\n"}
              • Consult professionals for real investments
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.continueButton}
            onPress={() => setShowDisclaimer(false)}
          >
            <Text style={styles.continueButtonText}>I Understand - Start Learning</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    height: '100vh',
    maxHeight: '70vh',
    padding: 20,
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
    marginBottom: 30,
    color: '#7f8c8d',
  },
  button: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  buttonDesc: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  educationalBanner: {
    backgroundColor: '#e8f4fd',
    borderColor: '#3498db',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2980b9',
    marginBottom: 8,
  },
  bannerText: {
    fontSize: 14,
    color: '#34495e',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    margin: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2c3e50',
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#34495e',
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    color: '#2c3e50',
  },
  disclaimerBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 2,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 10,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#27ae60',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});