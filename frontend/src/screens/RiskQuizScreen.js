import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useUser } from '../context/UserContext';

const BACKEND_URL = 'http://172.28.175.90:3000';

const questions = [
  {
    id: 'age',
    question: 'What is your current age?',
    description: 'Age affects your investment timeline and risk capacity',
    options: [
      { label: '18-25 years (Early Career)', value: 22 },
      { label: '26-35 years (Career Building)', value: 30 },
      { label: '36-45 years (Peak Earning)', value: 40 },
      { label: '46-55 years (Pre-Retirement)', value: 50 },
      { label: '55+ years (Near/In Retirement)', value: 60 }
    ]
  },
  {
    id: 'income',
    question: 'How would you describe your income stability?',
    description: 'Income stability affects your ability to handle investment volatility',
    options: [
      { label: 'Very stable with regular increases', value: 'very_stable' },
      { label: 'Stable but limited growth', value: 'stable' },
      { label: 'Variable but predictable', value: 'variable' },
      { label: 'Irregular and unpredictable', value: 'irregular' }
    ]
  },
  {
    id: 'experience',
    question: 'What is your investment experience?',
    description: 'Experience helps you handle market volatility better',
    options: [
      { label: 'Complete beginner', value: 'beginner' },
      { label: 'Some experience (1-3 years)', value: 'some' },
      { label: 'Moderate experience (3-7 years)', value: 'moderate' },
      { label: 'Experienced investor (7+ years)', value: 'experienced' }
    ]
  },
  {
    id: 'emergencyFund',
    question: 'Do you have an emergency fund?',
    description: 'Emergency funds provide financial security for riskier investments',
    options: [
      { label: 'Yes, 6+ months of expenses saved', value: 'excellent' },
      { label: 'Yes, 3-6 months of expenses saved', value: 'good' },
      { label: 'Yes, 1-3 months of expenses saved', value: 'basic' },
      { label: 'No emergency fund currently', value: 'none' }
    ]
  },
  {
    id: 'horizon',
    question: 'What is your primary investment time horizon?',
    description: 'Longer horizons allow for more risk and potential growth',
    options: [
      { label: 'Less than 2 years', value: 1 },
      { label: '2-5 years', value: 3 },
      { label: '5-10 years', value: 7 },
      { label: '10-20 years', value: 15 },
      { label: 'More than 20 years', value: 25 }
    ]
  },
  {
    id: 'goals',
    question: 'What is your primary investment goal?',
    description: 'Different goals require different risk approaches',
    options: [
      { label: 'Capital preservation', value: 'preservation' },
      { label: 'Steady income generation', value: 'income' },
      { label: 'Balanced growth', value: 'balanced' },
      { label: 'Wealth accumulation', value: 'growth' }
    ]
  },
  {
    id: 'volatilityTolerance',
    question: 'If your investment portfolio lost 25% in 3 months, you would:',
    description: 'This tests your emotional response to market volatility',
    options: [
      { label: 'Panic and sell everything', value: 'very_low' },
      { label: 'Feel uncomfortable and consider selling', value: 'low' },
      { label: 'Feel concerned but hold investments', value: 'medium' },
      { label: 'Stay calm and continue with plan', value: 'high' },
      { label: 'See it as a buying opportunity', value: 'very_high' }
    ]
  },
  {
    id: 'marketKnowledge',
    question: 'How well do you understand market risks?',
    description: 'Knowledge helps in making informed investment decisions',
    options: [
      { label: 'Very limited understanding', value: 'limited' },
      { label: 'Basic understanding of risks', value: 'basic' },
      { label: 'Good understanding of market dynamics', value: 'good' },
      { label: 'Excellent understanding of financial markets', value: 'excellent' }
    ]
  }
];

export default function RiskQuizScreen({ route, navigation }) {
  const { userId, token } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  const handleAnswer = (questionId, answer) => {
    const newResponses = { ...responses, [questionId]: answer };
    setResponses(newResponses);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(responses).length !== questions.length) {
      Alert.alert('Incomplete Quiz', 'Please answer all questions before submitting.');
      return;
    }
    submitQuiz(responses);
  };

  const submitQuiz = async (finalResponses) => {
    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/risk/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          responses: finalResponses
        })
      });

      if (response.ok) {
        navigation.navigate('Dashboard');
      } else {
        throw new Error('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', 'Failed to submit quiz. Please try again.');
    }
    setLoading(false);
  };

  const question = questions[currentQuestion];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <View style={styles.progressBar}>
        <View style={[styles.progress, { width: `${((currentQuestion + 1) / questions.length) * 100}%` }]} />
      </View>
      
      <Text style={styles.questionNumber}>
        Question {currentQuestion + 1} of {questions.length}
      </Text>
      
      <Text style={styles.question}>{question.question}</Text>
      <Text style={styles.description}>{question.description}</Text>
      
      <View style={styles.optionsContainer}>
        {question.options.map((option, index) => {
          const isSelected = responses[question.id] === option.value;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.option, isSelected && styles.selectedOption]}
              onPress={() => handleAnswer(question.id, option.value)}
              disabled={loading}
            >
              <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {currentQuestion === questions.length - 1 && responses[question.id] && (
          <TouchableOpacity 
            style={styles.submitButton}
            onPress={handleSubmitQuiz}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Analyzing Your Profile...' : 'Submit Risk Assessment'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 2,
    marginBottom: 20,
  },
  progress: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 2,
  },
  questionNumber: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 30,
    color: '#2c3e50',
  },
  optionsContainer: {
    minHeight: 200,
  },
  option: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ecf0f1',
  },
  description: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 25,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  optionText: {
    fontSize: 15,
    color: '#2c3e50',
    textAlign: 'left',
    lineHeight: 20,
  },
  selectedOption: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#27ae60',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});