import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import API_KEYS from '../config/apiKeys';

const GEMINI_API_KEY = API_KEYS.GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default function ChatBot({ stockData, symbol }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `👋 Hey there! I'm your personal Wall Street analyst AI. I've got the live ${symbol} chart loaded and ready to analyze. Ask me about price movements, market psychology, technical patterns, or what this data means for investors! 📈`,
      isBot: true,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const generateContextualPrompt = (question) => {
    const prices = stockData?.c || [];
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices[prices.length - 2];
    const change = currentPrice - previousPrice;
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const volatility = high - low;
    const changePercent = ((change / previousPrice) * 100).toFixed(2);

    const trend = change >= 0 ? 'bullish' : 'bearish';
    const momentum = Math.abs(changePercent) > 2 ? 'strong' : 'moderate';
    const volatilityLevel = volatility > avg * 0.1 ? 'High' : 'Low';

    return `# ROLE & EXPERTISE
You are a world-class financial analyst with 20+ years of Wall Street experience. You specialize in technical analysis, market psychology, and explaining complex financial concepts in simple terms. You're currently analyzing a live stock chart.

# LIVE MARKET DATA
**Stock Symbol:** ${symbol}
**Current Price:** $${currentPrice?.toFixed(2)}
**Previous Price:** $${previousPrice?.toFixed(2)}
**Price Movement:** ${change >= 0 ? '+' : ''}$${change?.toFixed(
      2
    )} (${changePercent}%)
**Day High:** $${high.toFixed(2)}
**Day Low:** $${low.toFixed(2)}
**Average Price:** $${avg.toFixed(2)}
**Volatility:** $${volatility.toFixed(2)} (${volatilityLevel})
**Market Trend:** ${trend.toUpperCase()} with ${momentum} momentum
**Data Points:** ${prices.length} intervals

# USER INQUIRY
"${question}"

# RESPONSE GUIDELINES
- Use the EXACT numbers from the data above
- Explain market psychology behind price movements
- Use emojis strategically for engagement (📈📉💡🎯)
- Keep responses under 150 words but packed with insights
- If investment advice is requested, emphasize this is educational analysis only
- Sound confident but acknowledge market unpredictability
- Use technical terms but explain them simply
- Include specific price levels and percentages

# RESPONSE TONE
Professional yet approachable, like explaining to a smart friend who's learning about stocks. Be enthusiastic about market analysis while staying factual and data-driven.`;
  };

  const cleanMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`(.*?)`/g, '$1')
      .replace(/#{1,6}\s/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^\s*[-*+]\s/gm, '• ')
      .trim();
  };

  const callGeminiAPI = async (question) => {
    try {
      const prompt = generateContextualPrompt(question);

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      const data = await response.json();

      if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        return cleanMarkdown(data.candidates[0].content.parts[0].text);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      return `I'm having trouble connecting right now. But ${symbol} is at $${stockData?.c?.[
        stockData.c.length - 1
      ]?.toFixed(2)}. Try again in a moment!`;
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage = { id: Date.now(), text: inputText, isBot: false };
    setMessages((prev) => [...prev, userMessage]);

    const currentQuestion = inputText;
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await callGeminiAPI(currentQuestion);
      const botMessage = { id: Date.now() + 1, text: aiResponse, isBot: true };
      setMessages((prev) => [...prev, botMessage]);
    } catch {
      const errorMessage = {
        id: Date.now() + 1,
        text: `Sorry, I encountered an error. ${symbol} is at $${stockData?.c?.[
          stockData.c.length - 1
        ]?.toFixed(2)}. Please try again!`,
        isBot: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🤖 Ask About {symbol}</Text>

      <ScrollView style={styles.messagesContainer} ref={scrollViewRef}>
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.message,
              message.isBot ? styles.botMessage : styles.userMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.isBot ? styles.botText : styles.userText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1976d2" />
          <Text style={styles.loadingText}>AI is analyzing the chart...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask me anything about this chart..."
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={sendMessage}
          disabled={isLoading}
        >
          <Text style={styles.sendText}>{isLoading ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickButtons}>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => setInputText('Analyze the current trend and momentum')}
        >
          <Text style={styles.quickButtonText}>Analyze Trend</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() => setInputText("What's driving this price movement?")}
        >
          <Text style={styles.quickButtonText}>Price Driver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickButton}
          onPress={() =>
            setInputText("What's the investment outlook based on this data?")
          }
        >
          <Text style={styles.quickButtonText}>Outlook</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
    maxHeight: 400,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    textAlign: 'center',
    marginBottom: 15,
  },
  messagesContainer: {
    maxHeight: 200,
    marginBottom: 15,
  },
  message: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  botMessage: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 3,
  },
  userMessage: {
    backgroundColor: '#1976d2',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 3,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  botText: {
    color: '#1976d2',
  },
  userText: {
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 80,
  },
  sendButton: {
    backgroundColor: '#1976d2',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendText: {
    color: 'white',
    fontWeight: 'bold',
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickButton: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flex: 1,
    marginHorizontal: 2,
  },
  quickButtonText: {
    color: '#1976d2',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderRadius: 8,
    marginBottom: 10,
  },
  loadingText: {
    marginLeft: 8,
    color: '#1976d2',
    fontSize: 14,
    fontStyle: 'italic',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
});
