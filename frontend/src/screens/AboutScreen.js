import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import UserHeader from '../components/UserHeader';

const AboutScreen = ({ navigation }) => {
  const openLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <UserHeader navigation={navigation} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>About SaralNivesh</Text>
        
        <View style={styles.logoSection}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>SN</Text>
          </View>
          <Text style={styles.appName}>SaralNivesh</Text>
          <Text style={styles.tagline}>SEBI Education & Risk Assessment Platform</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.description}>
            SaralNivesh empowers retail investors with SEBI-compliant learning, tutorials, 
            risk profiling, portfolio analysis, and chatbot assistance. We make financial 
            education accessible and engaging for everyone.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featureList}>
            <Text style={styles.feature}>📊 Risk Assessment & Profiling</Text>
            <Text style={styles.feature}>💼 Virtual Portfolio Management</Text>
            <Text style={styles.feature}>🎓 Interactive Learning Modules</Text>
            <Text style={styles.feature}>🤖 SEBI Regulation Chatbot</Text>
            <Text style={styles.feature}>📈 Stock Market Analysis</Text>
            <Text style={styles.feature}>🏆 Gamified Learning Experience</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technology Stack</Text>
          <Text style={styles.description}>
            Built with React Native, Node.js, PostgreSQL, and powered by AI for 
            personalized learning experiences and intelligent risk assessment.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => openLink('mailto:support@saralnivesh.com')}
          >
            <Text style={styles.contactLabel}>📧 Email Support</Text>
            <Text style={styles.contactValue}>support@saralnivesh.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => openLink('https://saralnivesh.com')}
          >
            <Text style={styles.contactLabel}>🌐 Website</Text>
            <Text style={styles.contactValue}>www.saralnivesh.com</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.contactItem}
            onPress={() => openLink('tel:+911234567890')}
          >
            <Text style={styles.contactLabel}>📞 Phone</Text>
            <Text style={styles.contactValue}>+91 12345 67890</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <Text style={styles.legalText}>
            SaralNivesh is committed to SEBI compliance and follows all regulatory 
            guidelines for financial education platforms. This app is for educational 
            purposes only and does not constitute financial advice.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2024 SaralNivesh. All rights reserved.</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 30,
    textAlign: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  logoText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  featureList: {
    marginTop: 10,
  },
  feature: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    paddingLeft: 10,
  },
  contactItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#007bff',
  },
  legalText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  version: {
    fontSize: 12,
    color: '#999',
  },
});

export default AboutScreen;