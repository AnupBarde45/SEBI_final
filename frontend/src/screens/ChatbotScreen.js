import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function ChatbotScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your SEBI assistant. Ask me anything about SEBI regulations, investments, or financial markets.", isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });

      const data = await response.json();
      const botMessage = { 
        id: Date.now() + 1, 
        text: data.answer || data.error || 'Sorry, I could not process your request.', 
        isBot: true,
        confidence: data.confidence,
        sources: data.sources
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { id: Date.now() + 1, text: 'Sorry, I am currently unavailable. Please try again later.', isBot: true };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 180 : 80}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🤖 SEBI AI Assistant</Text>
        <Text style={styles.headerSubtitle}>Ask me anything about regulations & investments</Text>
      </View>
      
      <ScrollView 
        style={styles.messagesContainer} 
        contentContainerStyle={styles.messagesContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageContainer, message.isBot ? styles.botMessage : styles.userMessage]}>
            <Text style={[styles.messageText, message.isBot ? styles.botText : styles.userText]}>
              {message.text}
            </Text>
            {message.isBot && message.confidence && (
              <Text style={styles.confidenceText}>
                Confidence: {(message.confidence * 100).toFixed(1)}%
              </Text>
            )}
            {message.isBot && message.sources && message.sources.length > 0 && (
              <Text style={styles.sourcesText}>
                Sources: {message.sources.map(s => s.source).join(', ')}
              </Text>
            )}
          </View>
        ))}
        {loading && (
          <View style={[styles.messageContainer, styles.botMessage]}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={styles.loadingText}>Researching Deep for the best and compliant answer</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about SEBI regulations..."
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.sendButton, loading && styles.sendButtonDisabled]} 
            onPress={sendMessage} 
            disabled={loading || !inputText.trim()}
          >
            <Text style={styles.sendButtonText}>{loading ? '⏳' : '▶'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#4f46e5',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    maxWidth: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  botMessage: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userMessage: {
    backgroundColor: '#4f46e5',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  botText: {
    color: '#333',
  },
  userText: {
    color: '#fff',
  },
  loadingText: {
    color: '#64748b',
    fontStyle: 'italic',
    marginLeft: 10,
    fontSize: 14,
  },
  inputContainer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: Platform.OS === 'ios' ? 35 : 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 8,
    paddingHorizontal: 5,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    backgroundColor: '#4f46e5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0.1,
  },
  sendButtonText: {
    fontSize: 18,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
  },
  sourcesText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

