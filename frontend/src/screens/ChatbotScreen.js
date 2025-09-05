import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

function ChatbotScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Chatbot</Text>
      <Text style={styles.subtitle}>Your personal investment guide is here to help!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0f7fa',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007bff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4a4a4a',
  },
});

export default ChatbotScreen;