import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function InitialPage({ navigation }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Disclaimer')}
      >
        <Text style={styles.buttonText}>Risk Assessment</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Portfolio')}
      >
        <Text style={styles.buttonText}>Portfolio Diversification</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: '#2563eb' }]}
        onPress={() => navigation.navigate('Tutorial')}
      >
        <Text style={styles.buttonText}>Tutorial</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});