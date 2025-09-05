import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useUser } from '../context/UserContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { USER_PROGRESS_STORAGE_KEY } from '../constants';

function CaseStudyScreen({ route, navigation }) {
  const { caseStudyData, moduleId } = route.params; // Get caseStudyData and original moduleId
  const { userProgress, setUserProgress } = useUser();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [loadingProgressUpdate, setLoadingProgressUpdate] = useState(false);

  const handleOptionSelect = (index) => {
    if (!showOutcome) {
      setSelectedOptionIndex(index);
    }
  };

  const handleRevealOutcome = () => {
    if (selectedOptionIndex === null) {
      Alert.alert("Select an Option", "Please select an action before revealing the outcome.");
      return;
    }
    setShowOutcome(true);
  };

  const handleFinishCaseStudy = async () => {
    setLoadingProgressUpdate(true);
    try {
      // You might award points for completing the case study here if desired
      // For now, completion is implicitly handled by navigation.
      Alert.alert(
        "Case Study Completed!",
        `You've completed "${caseStudyData.title}"!`,
        [{ text: "OK", onPress: () => {
          // After case study, navigate back to the module list
          navigation.popToTop(); // Go back to the very first screen (Home)
          navigation.navigate('LearningModules'); // Then navigate to Learning Modules list
        }}]
      );
    } catch (err) {
      console.error("CASE_STUDY_ERROR: Failed to finish case study:", err);
      Alert.alert("Error", "An error occurred while finishing the case study.");
    } finally {
      setLoadingProgressUpdate(false);
    }
  };

  const selectedOutcome = selectedOptionIndex !== null ? caseStudyData.options[selectedOptionIndex].outcome : '';
  const isCorrectChoice = selectedOptionIndex !== null && selectedOptionIndex === caseStudyData.correctOptionIndex;


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.caseStudyTitle}>{caseStudyData.title}</Text>
      <Text style={styles.scenarioText}>{caseStudyData.scenario}</Text>

      <View style={styles.optionsContainer}>
        {caseStudyData.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOptionIndex === index && styles.selectedOption,
              showOutcome && index === caseStudyData.correctOptionIndex && styles.correctOption,
              showOutcome && selectedOptionIndex === index && selectedOptionIndex !== caseStudyData.correctOptionIndex && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(index)}
            disabled={showOutcome || loadingProgressUpdate}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {!showOutcome ? (
        <TouchableOpacity
          style={[styles.revealButton, selectedOptionIndex === null ? styles.revealButtonDisabled : {}]}
          onPress={handleRevealOutcome}
          disabled={selectedOptionIndex === null || loadingProgressUpdate}
        >
          {loadingProgressUpdate ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.revealButtonText}>Reveal Outcome</Text>}
        </TouchableOpacity>
      ) : (
        <View style={styles.outcomeContainer}>
          <Text style={styles.outcomeHeader}>Outcome:</Text>
          <Text style={[styles.outcomeText, isCorrectChoice ? styles.correctOutcomeText : styles.incorrectOutcomeText]}>
            {selectedOutcome}
          </Text>
          <TouchableOpacity
            style={[styles.finishButton, loadingProgressUpdate ? styles.finishButtonDisabled : {}]}
            onPress={handleFinishCaseStudy}
            disabled={loadingProgressUpdate}
          >
            {loadingProgressUpdate ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.finishButtonText}>Finish Case Study</Text>}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 15,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  caseStudyTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 15,
    textAlign: 'center',
  },
  scenarioText: {
    fontSize: 18,
    color: '#334155',
    marginBottom: 25,
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 400,
    marginTop: 10,
  },
  optionButton: {
    backgroundColor: '#e0f7fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#b3e0ff',
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#cce5ff',
  },
  correctOption: {
    backgroundColor: '#e6ffe6', // Light green
    borderColor: '#4CAF50', // Green border
  },
  incorrectOption: {
    backgroundColor: '#ffe6e6', // Light red
    borderColor: '#f44336', // Red border
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  revealButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  revealButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  revealButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outcomeContainer: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outcomeHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
  },
  outcomeText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4a5568',
    marginBottom: 20,
  },
  correctOutcomeText: {
    color: '#28a745', // Green for correct outcome
    fontWeight: 'bold',
  },
  incorrectOutcomeText: {
    color: '#dc3545', // Red for incorrect outcome
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  finishButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  finishButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CaseStudyScreen;