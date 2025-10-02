import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal } from 'react-native';

export default function ChartReadingGuide({ visible, onClose, stockData, symbol }) {
  const [currentStep, setCurrentStep] = useState(0);

  const analyzeStockData = () => {
    if (!stockData || !stockData.c) return null;
    
    const prices = stockData.c;
    const currentPrice = prices[prices.length - 1];
    const firstPrice = prices[0];
    const highestPrice = Math.max(...prices);
    const lowestPrice = Math.min(...prices);
    
    const totalChange = currentPrice - firstPrice;
    const totalChangePercent = ((totalChange / firstPrice) * 100).toFixed(2);
    
    // Calculate volatility (standard deviation)
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - avgPrice, 2), 0) / prices.length;
    const volatility = Math.sqrt(variance);
    const volatilityPercent = ((volatility / avgPrice) * 100).toFixed(2);
    
    // Determine trend
    const firstHalf = prices.slice(0, Math.floor(prices.length / 2));
    const secondHalf = prices.slice(Math.floor(prices.length / 2));
    const firstHalfAvg = firstHalf.reduce((sum, price) => sum + price, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, price) => sum + price, 0) / secondHalf.length;
    
    let trend = 'SIDEWAYS';
    if (secondHalfAvg > firstHalfAvg * 1.02) trend = 'UPTREND';
    else if (secondHalfAvg < firstHalfAvg * 0.98) trend = 'DOWNTREND';
    
    return {
      currentPrice: currentPrice.toFixed(2),
      firstPrice: firstPrice.toFixed(2),
      highestPrice: highestPrice.toFixed(2),
      lowestPrice: lowestPrice.toFixed(2),
      totalChange: totalChange.toFixed(2),
      totalChangePercent,
      volatilityPercent,
      trend,
      dataPoints: prices.length
    };
  };

  const analysis = analyzeStockData();

  const lessons = [
    {
      title: "📊 What Am I Looking At?",
      content: analysis ? `You're looking at ${symbol} stock chart with ${analysis.dataPoints} data points. The line shows how the stock price moved over time.` : "This is a stock price chart showing how the price changes over time.",
      example: analysis ? `Current Price: $${analysis.currentPrice}\nStarting Price: $${analysis.firstPrice}\nHighest: $${analysis.highestPrice}\nLowest: $${analysis.lowestPrice}` : "Price data will show here when available",
      tip: "The line going UP means the stock price increased. Line going DOWN means price decreased."
    },
    {
      title: "📈 Reading Price Movement",
      content: analysis ? `${symbol} has ${analysis.totalChangePercent > 0 ? 'GAINED' : 'LOST'} ${Math.abs(analysis.totalChangePercent)}% during this period.` : "Price movement shows gains or losses over time.",
      example: analysis ? `Total Change: $${analysis.totalChange} (${analysis.totalChangePercent}%)\n\n${analysis.totalChangePercent > 0 ? '✅ POSITIVE: Stock went UP' : '❌ NEGATIVE: Stock went DOWN'}` : "Change calculation will appear here",
      tip: analysis && analysis.totalChangePercent > 0 ? "Green/positive numbers = Good for investors!" : "Red/negative numbers = Loss for investors"
    },
    {
      title: "📊 Understanding Trends",
      content: analysis ? `${symbol} is currently in a ${analysis.trend}. This tells us the general direction of the stock.` : "Trends show the overall direction of stock movement.",
      example: analysis ? `Trend: ${analysis.trend}\n\n${analysis.trend === 'UPTREND' ? '📈 Generally moving UP - Bullish' : analysis.trend === 'DOWNTREND' ? '📉 Generally moving DOWN - Bearish' : '➡️ Moving SIDEWAYS - Neutral'}` : "Trend analysis will appear here",
      tip: "Don't focus on daily ups and downs. Look at the BIG PICTURE direction!"
    },
    {
      title: "⚡ Risk Level (Volatility)",
      content: analysis ? `${symbol} has ${analysis.volatilityPercent}% volatility. ${parseFloat(analysis.volatilityPercent) > 5 ? 'HIGH RISK' : parseFloat(analysis.volatilityPercent) > 2 ? 'MEDIUM RISK' : 'LOW RISK'} stock.` : "Volatility measures how much the price jumps around.",
      example: analysis ? `Volatility: ${analysis.volatilityPercent}%\n\n${parseFloat(analysis.volatilityPercent) > 5 ? '🔴 HIGH: Price jumps a lot (Risky but more profit potential)' : parseFloat(analysis.volatilityPercent) > 2 ? '🟡 MEDIUM: Moderate price swings' : '🟢 LOW: Stable price movement (Safer)'}` : "Risk analysis will appear here",
      tip: "Higher volatility = More risk BUT also more opportunity for profit!"
    },
    {
      title: "🎯 Making Investment Decisions",
      content: "Now you can make informed decisions based on what you learned!",
      example: analysis ? `Based on ${symbol} analysis:\n\nTrend: ${analysis.trend}\nRisk: ${parseFloat(analysis.volatilityPercent) > 5 ? 'HIGH' : parseFloat(analysis.volatilityPercent) > 2 ? 'MEDIUM' : 'LOW'}\nPerformance: ${analysis.totalChangePercent}%\n\n${analysis.trend === 'UPTREND' && analysis.totalChangePercent > 0 ? '💡 SUGGESTION: Might be good time to consider buying' : analysis.trend === 'DOWNTREND' && analysis.totalChangePercent < 0 ? '⚠️ CAUTION: Consider waiting or selling' : '🤔 NEUTRAL: Do more research before deciding'}` : "Investment suggestions will appear here",
      tip: "NEVER invest based on charts alone! Always research the company, news, and your financial situation."
    }
  ];

  const nextStep = () => {
    if (currentStep < lessons.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      alert('🎉 Congratulations! You now understand the basics of reading stock charts!');
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>📚 Learn to Read {symbol} Chart</Text>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>Lesson {currentStep + 1} of {lessons.length}</Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / lessons.length) * 100}%` }
                ]} 
              />
            </View>
          </View>

          <View style={styles.lessonContainer}>
            <Text style={styles.lessonTitle}>{lessons[currentStep].title}</Text>
            <Text style={styles.lessonContent}>{lessons[currentStep].content}</Text>
            
            <View style={styles.exampleContainer}>
              <Text style={styles.exampleTitle}>📊 Real Data from {symbol}:</Text>
              <Text style={styles.exampleText}>{lessons[currentStep].example}</Text>
            </View>

            <View style={styles.tipContainer}>
              <Text style={styles.tipTitle}>💡 Key Takeaway:</Text>
              <Text style={styles.tipText}>{lessons[currentStep].tip}</Text>
            </View>

            {/* Interactive elements for each lesson */}
            {currentStep === 1 && analysis && (
              <View style={styles.interactiveContainer}>
                <Text style={styles.interactiveTitle}>🎯 Quick Check:</Text>
                <Text style={styles.interactiveText}>
                  Is ${analysis.totalChangePercent}% a gain or loss?
                </Text>
                <View style={styles.answerContainer}>
                  <Text style={[styles.answer, parseFloat(analysis.totalChangePercent) > 0 ? styles.correctAnswer : styles.wrongAnswer]}>
                    {parseFloat(analysis.totalChangePercent) > 0 ? '✅ GAIN (Good!)' : '❌ LOSS (Bad)'}
                  </Text>
                </View>
              </View>
            )}

            {currentStep === 2 && analysis && (
              <View style={styles.interactiveContainer}>
                <Text style={styles.interactiveTitle}>🎯 Trend Practice:</Text>
                <Text style={styles.interactiveText}>What does {analysis.trend} mean for investors?</Text>
                <View style={styles.answerContainer}>
                  <Text style={styles.answer}>
                    {analysis.trend === 'UPTREND' ? '📈 Stock generally going UP - Positive signal' : 
                     analysis.trend === 'DOWNTREND' ? '📉 Stock generally going DOWN - Negative signal' : 
                     '➡️ Stock moving SIDEWAYS - Wait and watch'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.navigationContainer}>
          <TouchableOpacity
            style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
            onPress={prevStep}
            disabled={currentStep === 0}
          >
            <Text style={styles.navButtonText}>← Previous</Text>
          </TouchableOpacity>

          <Text style={styles.stepIndicator}>{currentStep + 1}/{lessons.length}</Text>

          <TouchableOpacity 
            style={[styles.navButton, currentStep === lessons.length - 1 && styles.completeButton]} 
            onPress={nextStep}
          >
            <Text style={styles.navButtonText}>
              {currentStep === lessons.length - 1 ? '🎉 Complete!' : 'Next →'}
            </Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 5,
  },
  lessonContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  lessonContent: {
    fontSize: 18,
    lineHeight: 26,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  exampleContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 16,
    color: '#1565c0',
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  tipContainer: {
    backgroundColor: '#fff3cd',
    borderRadius: 12,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 15,
    color: '#856404',
    lineHeight: 20,
  },
  interactiveContainer: {
    backgroundColor: '#f3e5f5',
    borderRadius: 12,
    padding: 18,
    borderLeftWidth: 4,
    borderLeftColor: '#9c27b0',
  },
  interactiveTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7b1fa2',
    marginBottom: 10,
  },
  interactiveText: {
    fontSize: 16,
    color: '#7b1fa2',
    marginBottom: 12,
  },
  answerContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  answer: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctAnswer: {
    color: '#4CAF50',
  },
  wrongAnswer: {
    color: '#f44336',
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
  completeButton: {
    backgroundColor: '#FF9800',
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  stepIndicator: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});