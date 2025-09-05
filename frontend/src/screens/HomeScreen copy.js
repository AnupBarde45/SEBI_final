import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stock Graph Teacher - Home</Text>
      <Button title="Go to Analysis" onPress={() => navigation.navigate('Analysis')} />
      <View style={{ marginTop: 20 }}>
        <Button title="Fake News Detection" onPress={() => navigation.navigate('FakeNews')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20 },
});
