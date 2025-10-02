import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function StockChatBot({ stockData, symbol, timeRange, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hi! I can help you analyze the ${symbol} chart. Ask me about trends, patterns, or what the data means!`,
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const generateStockContext = () => {
    if (!stockData || !stockData.c) return '';
    
    const prices = stockData.c;
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];
    const firstPrice = prices[0];
    
    const change = currentPrice - previousPrice;
    const changePercent = ((change / previousPrice) * 100).toFixed(2);
    const totalChange = currentPrice - firstPrice;
    const totalChangePercent = ((totalChange / firstPrice) * 100).toFixed(2);
    
    const dataStatus = stockData.isRealData ? 'REAL MARKET DATA' : 'DEMO/SIMULATED DATA';
    const timeline = stockData.dateRange && stockData.dateRange.start && stockData.dateRange.end ? 
      `${new Date(stockData.dateRange.start).toLocaleDateString()} to ${new Date(stockData.dateRange.end).toLocaleDateString()}` : 
      'Timeline unavailable';
    
    return `Stock: ${symbol}
Data Type: ${dataStatus}
Source: ${stockData.dataSource || 'Unknown'}
Timeline: ${timeline}
Current Price: $${currentPrice?.toFixed(2)}
Previous Price: $${previousPrice?.toFixed(2)}
Change: $${change?.toFixed(2)} (${changePercent}%)
Total Change (${timeRange}): $${totalChange?.toFixed(2)} (${totalChangePercent}%)
Data Points: ${prices.length}
Time Range: ${timeRange}
Last Updated: ${stockData.lastRefreshed ? new Date(stockData.lastRefreshed).toLocaleString() : 'Unknown'}`;
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const stockContext = generateStockContext();
      const prompt = `You are a stock market analyst. Analyze this stock chart data and answer the user's question.

Stock: ${symbol}
Time Range: ${timeRange}
Stock Context: ${stockContext}

User Question: ${inputText}

Provide a clear, educational analysis focusing on trends, patterns, and what the data means for investors. Keep it concise and actionable.`;

      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      console.log('API Key exists:', !!apiKey);
      console.log('API Key length:', apiKey?.length);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      console.log('Full API response:', JSON.stringify(data, null, 2));
      console.log('Response status:', response.status);
      
      if (data.error) {
        throw new Error(data.error.message || 'API Error');
      }
      
      const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not analyze the chart right now.';
      
      const botMessage = {
        id: Date.now() + 1,
        text: answer,
        isBot: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: `Error: ${error.message}. Please try again.`,
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    'What does this trend mean?',
    'Is this a good time to buy?',
    'Explain the price movement',
    'What are the key patterns?'
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📈 {symbol} Chart Analysis</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.messagesContainer}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageContainer,
              message.isBot ? styles.botMessage : styles.userMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              message.isBot ? styles.botMessageText : styles.userMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        
        {loading && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <Text style={styles.botMessageText}>🤔 Analyzing the chart...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.quickQuestionsContainer}>
        <Text style={styles.quickQuestionsTitle}>Quick Questions:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickQuestions.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickQuestionButton}
              onPress={() => setInputText(question)}
            >
              <Text style={styles.quickQuestionText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about the chart..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!inputText.trim() || loading) && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4CAF50',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
    maxWidth: '80%',
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderRadius: 15,
    borderBottomLeftRadius: 5,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    borderBottomRightRadius: 5,
    padding: 12,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  botMessageText: {
    color: '#333',
  },
  userMessageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  quickQuestionsContainer: {
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  quickQuestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  quickQuestionButton: {
    backgroundColor: '#e8f5e8',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  quickQuestionText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});