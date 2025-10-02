import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';
import InteractiveChartTutorial from './InteractiveChartTutorial';

const tutorialSteps = [
  {
    id: 1,
    title: "📈 Understanding Price Movement",
    content: "The line shows how stock price changes over time. When the line goes UP, the stock price is increasing. When it goes DOWN, the price is falling.",
    highlight: "price_line",
    tip: "Green = Good (Price Up), Red = Bad (Price Down)"
  },
  {
    id: 2,
    title: "📊 Reading the Y-Axis (Price)",
    content: "The vertical line (Y-axis) shows the stock price in dollars. Higher on the chart = Higher price. Lower on the chart = Lower price.",
    highlight: "y_axis",
    tip: "Always check the price range to understand how much the stock moved"
  },
  {
    id: 3,
    title: "📅 Reading the X-Axis (Time)",
    content: "The horizontal line (X-axis) shows time. Left side = Past, Right side = Recent. The chart shows how price changed over your selected time period.",
    highlight: "x_axis",
    tip: "Different time ranges show different patterns - daily vs monthly views"
  },
  {
    id: 4,
    title: "📈 Identifying Trends",
    content: "UPTREND: Price generally moving up over time. DOWNTREND: Price generally moving down. SIDEWAYS: Price staying roughly the same.",
    highlight: "trend",
    tip: "Look at the overall direction, not just daily ups and downs"
  },
  {
    id: 5,
    title: "⚡ Understanding Volatility",
    content: "VOLATILE: Price jumps up and down a lot (risky). STABLE: Price moves smoothly (less risky). Sharp spikes mean big news or events.",
    highlight: "volatility",
    tip: "More zigzag lines = more risk, but also more opportunity"
  },
  {
    id: 6,
    title: "🎯 Support and Resistance",
    content: "SUPPORT: Price level where stock tends to bounce back up. RESISTANCE: Price level where stock struggles to go higher.",
    highlight: "levels",
    tip: "These invisible lines help predict where price might go next"
  },
  {
    id: 7,
    title: "📊 Volume (Trading Activity)",
    content: "High volume = Many people buying/selling. Low volume = Less interest. Big price moves with high volume are more reliable.",
    highlight: "volume",
    tip: "Volume confirms if a price move is real or just temporary"
  },
  {
    id: 8,
    title: "🚀 Making Investment Decisions",
    content: "BUY signals: Uptrend + breaking resistance + high volume. SELL signals: Downtrend + breaking support + high volume. HOLD: Sideways trend.",
    highlight: "decision",
    tip: "Never invest based on charts alone - always research the company too!"
  }
];

export default function GraphTutorial({ visible, onClose, stockData, symbol }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetTutorial = () => {
    setCurrentStep(0);
    setShowQuiz(false);
  };

  const QuizComponent = () => {
    const [quizStep, setQuizStep] = useState(0);
    const [score, setScore] = useState(0);
    
    const quizQuestions = [
      {
        question: "If a stock chart line is going UP, what does it mean?",
        options: ["Price is falling", "Price is rising", "Nothing", "Company is bad"],
        correct: 1
      },
      {
        question: "What does the Y-axis (vertical line) represent?",
        options: ["Time", "Stock price", "Volume", "Company name"],
        correct: 1
      },
      {
        question: "What is an UPTREND?",
        options: ["Price going down", "Price staying same", "Price generally going up", "High volume"],
        correct: 2
      },
      {
        question: "High volatility means:",
        options: ["Price is stable", "Price jumps up and down a lot", "Good investment", "Low risk"],
        correct: 1
      }
    ];

    const handleAnswer = (selectedIndex) => {
      if (selectedIndex === quizQuestions[quizStep].correct) {
        setScore(score + 1);
      }
      
      if (quizStep < quizQuestions.length - 1) {
        setQuizStep(quizStep + 1);
      } else {
        // Quiz completed
        setTimeout(() => {
          alert(`Quiz Complete! You scored ${score + (selectedIndex === quizQuestions[quizStep].correct ? 1 : 0)}/${quizQuestions.length}`);
          onClose();
        }, 500);
      }
    };

    return (
      <View style={styles.quizContainer}>
        <Text style={styles.quizTitle}>📝 Quick Quiz - Question {quizStep + 1}/{quizQuestions.length}</Text>
        <Text style={styles.quizQuestion}>{quizQuestions[quizStep].question}</Text>
        
        {quizQuestions[quizStep].options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quizOption}
            onPress={() => handleAnswer(index)}
          >
            <Text style={styles.quizOptionText}>{option}</Text>
          </TouchableOpacity>
        ))}
        
        <Text style={styles.quizScore}>Current Score: {score}/{quizStep}</Text>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📚 Chart Reading Tutorial</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {showQuiz ? (
          <QuizComponent />
        ) : currentStep < 5 ? (
          <ScrollView style={styles.content}>
            <InteractiveChartTutorial stockData={stockData} symbol={symbol} />
          </ScrollView>
        ) : (
          <ScrollView style={styles.content}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Step {currentStep + 1} of {tutorialSteps.length}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }
                  ]} 
                />
              </View>
            </View>

            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>{tutorialSteps[currentStep].title}</Text>
              <Text style={styles.stepContent}>{tutorialSteps[currentStep].content}</Text>
              
              <View style={styles.tipContainer}>
                <Text style={styles.tipTitle}>💡 Pro Tip:</Text>
                <Text style={styles.tipText}>{tutorialSteps[currentStep].tip}</Text>
              </View>

              {/* Interactive Examples */}
              {currentStep === 0 && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleTitle}>Example:</Text>
                  <View style={styles.exampleChart}>
                    <Text style={styles.exampleText}>📈 Line going up = Stock price $50 → $60 (GOOD!)</Text>
                    <Text style={styles.exampleText}>📉 Line going down = Stock price $60 → $50 (BAD!)</Text>
                  </View>
                </View>
              )}

              {currentStep === 3 && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleTitle}>Trend Examples:</Text>
                  <Text style={styles.trendExample}>📈 UPTREND: //// (Buy signal)</Text>
                  <Text style={styles.trendExample}>📉 DOWNTREND: \\\\\\\\ (Sell signal)</Text>
                  <Text style={styles.trendExample}>➡️ SIDEWAYS: ---- (Wait signal)</Text>
                </View>
              )}

              {currentStep === 7 && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleTitle}>Decision Framework:</Text>
                  <Text style={styles.decisionText}>✅ BUY: Uptrend + Good news + High volume</Text>
                  <Text style={styles.decisionText}>❌ SELL: Downtrend + Bad news + High volume</Text>
                  <Text style={styles.decisionText}>⏸️ HOLD: Sideways + Uncertain news</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}

        {!showQuiz && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity
              style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
              onPress={prevStep}
              disabled={currentStep === 0}
            >
              <Text style={styles.navButtonText}>← Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={resetTutorial}>
              <Text style={styles.resetButtonText}>🔄 Restart</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.navButton} onPress={nextStep}>
              <Text style={styles.navButtonText}>
                {currentStep === tutorialSteps.length - 1 ? 'Take Quiz 📝' : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4CAF50',
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressContainer: {
    marginBottom: 25,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  stepContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  stepContent: {
    fontSize: 18,
    lineHeight: 26,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  tipContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  tipText: {
    fontSize: 15,
    color: '#856404',
    lineHeight: 20,
  },
  exampleContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  exampleChart: {
    alignItems: 'center',
  },
  exampleText: {
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  trendExample: {
    fontSize: 18,
    color: '#2e7d32',
    marginBottom: 8,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  decisionText: {
    fontSize: 16,
    color: '#2e7d32',
    marginBottom: 8,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
  },
  resetButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  quizContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  quizTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  quizQuestion: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 28,
  },
  quizOption: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  quizOptionText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  quizScore: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
});