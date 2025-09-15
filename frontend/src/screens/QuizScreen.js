import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useUser } from '../context/UserContext';

const BACKEND_URL = 'http://172.28.175.90:3000';

const QUIZ_DATA = {
  id: 'comprehensive_quiz_beginner',
  title: 'Financial Literacy Quiz',
  questions: [
    {
      question: "What is the primary purpose of a budget in personal finance?",
      options: [
        { text: "To identify new ways to spend money.", isCorrect: false },
        { text: "To track, plan, and control the inflow and outflow of your income.", isCorrect: true },
        { text: "To quickly multiply your money through high-risk investments.", isCorrect: false },
        { text: "To avoid paying taxes on your earnings.", isCorrect: false },
      ],
      explanation: "A budget is a financial plan that helps you manage your money by tracking income and expenses, ensuring you save for your goals and avoid overspending."
    },
    {
      question: "Which of the following best describes 'inflation'?",
      options: [
        { text: "A decrease in the general price level of goods and services.", isCorrect: false },
        { text: "An increase in the purchasing power of money.", isCorrect: false },
        { text: "A sustained increase in the general price level of goods and services, reducing purchasing power.", isCorrect: true },
        { text: "A sudden drop in stock market prices.", isCorrect: false },
      ],
      explanation: "Inflation erodes the value of money over time, meaning you can buy less with the same amount of money in the future. Investments need to outpace inflation to grow real wealth."
    },
    {
      question: "What is the 'Rule of 72' primarily used to estimate?",
      options: [
        { text: "The number of years to pay off a loan.", isCorrect: false },
        { text: "The time it takes for an investment to double in value.", isCorrect: true },
        { text: "The ideal age to start investing.", isCorrect: false },
        { text: "The amount of interest earned in a single year.", isCorrect: false },
      ],
      explanation: "The Rule of 72 is a quick mental math shortcut to estimate the number of years it takes for an investment to double, by dividing 72 by the annual interest rate."
    },
    {
      question: "What is the primary role of SEBI (Securities and Exchange Board of India)?",
      options: [
        { text: "To manage all public sector banks in India.", isCorrect: false },
        { text: "To protect the interests of investors and regulate the Indian securities market.", isCorrect: true },
        { text: "To issue new currency notes and control inflation.", isCorrect: false },
        { text: "To provide direct loans to companies for expansion.", isCorrect: false },
      ],
      explanation: "SEBI is the apex regulator for the Indian securities market, mandated to protect investors, promote market development, and regulate market participants and activities to ensure fairness and transparency."
    },
    {
      question: "What is a 'Demat account' primarily used for?",
      options: [
        { text: "Holding physical share certificates securely.", isCorrect: false },
        { text: "Making cash deposits and withdrawals at ATMs.", isCorrect: false },
        { text: "Holding shares and other securities in electronic form.", isCorrect: true },
        { text: "Trading in foreign currency.", isCorrect: false },
      ],
      explanation: "A Demat (dematerialized) account allows investors to hold securities like shares, bonds, and mutual fund units in an electronic format, eliminating the need for physical certificates and facilitating online trading."
    }
  ]
};

function QuizScreen({ navigation }) {
  const { userId, token } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime] = useState(Date.now());

  const currentQuestion = QUIZ_DATA.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === QUIZ_DATA.questions.length - 1;

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
      setScore(prevScore => prevScore + 1);
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
            totalQuestions: QUIZ_DATA.questions.length,
            timeSpent
          })
        });

        if (response.ok) {
          Alert.alert(
            "Quiz Completed!",
            `You scored ${score} out of ${QUIZ_DATA.questions.length}!\nTime taken: ${Math.floor(timeSpent / 60)}:${(timeSpent % 60).toString().padStart(2, '0')}`,
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
          `You scored ${score} out of ${QUIZ_DATA.questions.length}!\n(Score not saved - please check connection)`,
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.quizTitle}>{QUIZ_DATA.title}</Text>
      <Text style={styles.questionNumber}>
        Question {currentQuestionIndex + 1} of {QUIZ_DATA.questions.length}
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
});

export default QuizScreen;