import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, ActivityIndicator } from 'react-native';
import tutorialSteps from '../services/tutorialContent';
import useStockData from '../hooks/useStockData';
import StockChart from '../components/StockChart';

export default function TutorialScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const step = tutorialSteps[currentStep];

  // Example annotations for support/resistance step
  const annotationsExample = [
    { index: 5, label: 'Support Level', yPosition: 80 },
    { index: 15, label: 'Resistance Level', yPosition: 140 },
  ];

  // Use the stock symbol from tutorial step if present
  const { data, loading, error } = useStockData(step.exampleSymbol);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step.title}</Text>
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.content}>{step.content}</Text>

        {step.exampleSymbol && (
          <View style={styles.chartContainer}>
            {loading && <ActivityIndicator size="large" />}
            {error && <Text style={styles.error}>Error loading chart</Text>}
            {data && (
              <StockChart
                data={data}
                annotations={currentStep === 4 ? annotationsExample : []} // Show annotations on step 4 (support/resistance)
              />
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button title="Previous" onPress={prevStep} disabled={currentStep === 0} />
        <Button title="Next" onPress={nextStep} disabled={currentStep === tutorialSteps.length - 1} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 15 },
  contentContainer: { flex: 1, marginBottom: 20 },
  content: { fontSize: 16, lineHeight: 24, marginBottom: 20 },
  chartContainer: { height: 250, justifyContent: 'center', alignItems: 'center' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  error: { color: 'red' },
});
