import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useUser } from '../context/UserContext';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Dynamic quiz data will be fetched from API

function QuizScreen({ navigation }) {
  const { userId, token } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const [questions, setQuestions] = useState([]);
  const [quizSettings, setQuizSettings] = useState({ correct_answer_points: 10, wrong_answer_points: -5 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizData();
  }, []);

  const fetchQuizData = async () => {
    try {
      const [questionsRes, settingsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/config/quiz-questions?limit=10`),
        fetch(`${BACKEND_URL}/api/config/quiz-settings`)
      ]);
      
      const questionsData = await questionsRes.json();
      const settingsData = await settingsRes.json();
      
      setQuestions(questionsData);
      setQuizSettings(settingsData);
    } catch (error) {
      console.error('Failed to load quiz data:', error);
      // Fallback to empty state
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.quizTitle}>Loading Quiz...</Text>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.quizTitle}>No Questions Available</Text>
        <Text>Please contact administrator to add quiz questions.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleOptionSelect = (index) => {
    if (!showFeedback) {
      setSelectedOptionIndex(index);
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOptionIndex === null) {
      Alert.alert("Select an Option", "Please select an answer before submitting.");
      return;
    }
    setShowFeedback(true);
    if (currentQuestion.options[selectedOptionIndex].isCorrect) {
      setScore(prevScore => prevScore + quizSettings.correct_answer_points);
    } else {
      setScore(prevScore => prevScore + quizSettings.wrong_answer_points);
    }
  };

  const handleNextQuestion = async () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      setSelectedOptionIndex(null);
      setShowFeedback(false);
    } else {
      setQuizCompleted(true);
      
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/quiz/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            score,
            totalQuestions: questions.length,
            timeSpent
          })
        });

        if (response.ok) {
          Alert.alert(
            "Quiz Completed!",
            `You scored ${score} points!\nTime taken: ${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}`,
            [
              {
                text: "View Leaderboard", 
                onPress: () => navigation.navigate('Leaderboard')
              },
              {
                text: "OK", 
                onPress: () => navigation.goBack()
              }
            ]
          );
        } else {
          throw new Error('Failed to submit quiz');
        }
      } catch (error) {
        console.error('Error submitting quiz:', error);
        Alert.alert(
          "Quiz Completed!",
          `You scored ${score} points!\n(Score not saved - please check connection)`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.quizTitle}>Financial Literacy Quiz</Text>
      <Text style={styles.questionNumber}>
        Question {currentQuestionIndex + 1} of {questions.length}
      </Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>
        {currentQuestion.options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOptionIndex === index && styles.selectedOption,
              showFeedback && option.isCorrect && styles.correctOption,
              showFeedback && selectedOptionIndex === index && !option.isCorrect && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(index)}
            disabled={showFeedback || quizCompleted}
          >
            <Text style={styles.optionText}>{option.text}</Text>
          </TouchableOpacity>
        ))}

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>
              {currentQuestion.options[selectedOptionIndex].isCorrect ? '✅ Correct!' : '❌ Incorrect!'}
            </Text>
            <Text style={styles.explanationText}>
              {currentQuestion.explanation}
            </Text>
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          {!showFeedback ? (
            <TouchableOpacity
              style={[styles.submitButton, selectedOptionIndex === null ? styles.submitButtonDisabled : {}]}
              onPress={handleSubmitAnswer}
              disabled={selectedOptionIndex === null || quizCompleted}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNextQuestion}
              disabled={quizCompleted}
            >
              <Text style={styles.nextButtonText}>
                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  quizTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 10,
    textAlign: 'center',
  },
  questionNumber: {
    fontSize: 16,
    color: '#667788',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionCard: {
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
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 20,
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
    backgroundColor: '#e6ffe6',
    borderColor: '#4CAF50',
  },
  incorrectOption: {
    backgroundColor: '#ffe6e6',
    borderColor: '#f44336',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  feedbackContainer: {
    marginTop: 15,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  explanationText: {
    fontSize: 14,
    color: '#4a4a4a',
    marginTop: 8,
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f4f8',
    padding: 20,
  },
});

export default QuizScreen;