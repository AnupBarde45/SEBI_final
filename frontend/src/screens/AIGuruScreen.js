import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '../context/UserContext';
import { Audio } from 'expo-av';

// --- Supported Languages and TTS Voices ---
const SUPPORTED_LANGUAGES = [
  { label: 'English', value: 'en-US', voice: 'Aria' },
  { label: 'Hindi', value: 'hi-IN', voice: 'Kore' },
  { label: 'Marathi', value: 'mr-IN', voice: 'Puck' },
  { label: 'Bengali', value: 'bn-BD', voice: 'Zephyr' },
  { label: 'Tamil', value: 'ta-IN', voice: 'Leda' },
  { label: 'Telugu', value: 'te-IN', voice: 'Orus' },
  { label: 'Gujarati', value: 'gu-IN', voice: 'Charon' },
  // Add more languages as needed
];

// --- Mock Backend URL (REPLACE with your actual backend URL later!) ---
// IMPORTANT: Change this to your backend's IP address if running on device!
// Example: const BACKEND_URL = 'http://192.168.31.96'; (replace X with your laptop's local IP)
const BACKEND_URL = 'http://192.168.31.96:3001';

const { height } = Dimensions.get('window'); // Get screen height for responsive styling

function AIGuruScreen({ navigation }) {
  const { userId } = useUser();
  const scrollViewRef = useRef();

  const [chatHistory, setChatHistory] = useState([]);
  const [currentInput, setCurrentInput] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0].value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('chat'); // 'chat' or 'content'

  const selectedVoice = SUPPORTED_LANGUAGES.find(lang => lang.value === selectedLanguage)?.voice || 'Aria';

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [chatHistory]);

  // --- Audio Playback Function ---
  const playAudio = useCallback(async (audioUrl) => {
    if (!audioUrl) {
      Alert.alert("No Audio", "No audio available to play.");
      return;
    }
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      await sound.playAsync();
      // For hackathon, simple play is fine. In a full app, manage sound objects to prevent multiple plays.
    } catch (e) {
      console.error("AUDIO_PLAYBACK_ERROR:", e);
      Alert.alert("Audio Error", "Could not play audio. Please try again.");
    }
  }, []);


  const handleSendChat = async () => {
    if (!currentInput.trim()) return;

    const userMessage = currentInput.trim();
    const newChatHistory = [...chatHistory, { type: 'user', text: userMessage, timestamp: Date.now() }];
    setChatHistory(newChatHistory);
    setCurrentInput('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-guru`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: userMessage,
          targetLanguage: selectedLanguage,
          voiceName: selectedVoice,
          chatHistory: newChatHistory.filter(msg => msg.type === 'user' || msg.type === 'ai').map(msg => ({ role: msg.type === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] })),
          mode: 'chat',
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response.');
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, { type: 'ai', text: data.aiResponse, audioUrl: data.audioUrl, timestamp: Date.now() }]);

    } catch (err) {
      console.error("AI_GURU_CHAT_ERROR:", err);
      setError(err.message || "An unexpected error occurred during chat.");
      setChatHistory(prev => [...prev, { type: 'error', text: `Error: ${err.message}`, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessContent = async () => {
    if (!inputUrl.trim() && !currentInput.trim()) {
      Alert.alert("Input Required", "Please enter some text or a URL to process.");
      return;
    }

    const contentToProcess = inputUrl.trim() || currentInput.trim();
    const newChatHistory = [...chatHistory, { type: 'user', text: `Process content: ${contentToProcess}`, timestamp: Date.now() }];
    setChatHistory(newChatHistory);
    setCurrentInput('');
    setInputUrl('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${BACKEND_URL}/api/ai-guru`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputUrl.trim(),
          text: currentInput.trim(),
          targetLanguage: selectedLanguage,
          voiceName: selectedVoice,
          mode: 'content',
          userId: userId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process content.');
      }

      const data = await response.json();
      setChatHistory(prev => [...prev, { type: 'ai', text: data.aiResponse, audioUrl: data.audioUrl, timestamp: Date.now() }]);

    } catch (err) {
      console.error("AI_GURU_CONTENT_ERROR:", err);
      setError(err.message || "An unexpected error occurred during content processing.");
      setChatHistory(prev => [...prev, { type: 'error', text: `Error: ${err.message}`, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const renderChatMessage = (message, index) => (
    <View key={index} style={[styles.messageBubble, message.type === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={[styles.messageText, message.type === 'user' ? styles.userBubbleText : styles.aiBubbleText]}>{message.text}</Text>
      {message.audioUrl && (
        <TouchableOpacity style={styles.playAudioMiniButton} onPress={() => playAudio(message.audioUrl)}>
          <Text style={styles.playAudioMiniButtonText}>▶️</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.fullScreenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20} // Adjusted for Android to lift more
    >
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>SaralNivesh AI Guru</Text>
        <Text style={styles.headerSubtitle}>Your smart assistant for financial learning</Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'chat' && styles.toggleButtonActive]}
            onPress={() => setMode('chat')}
          >
            <Text style={[styles.toggleButtonText, mode === 'chat' && styles.toggleButtonTextActive]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, mode === 'content' && styles.toggleButtonActive]}
            onPress={() => setMode('content')}
          >
            <Text style={[styles.toggleButtonText, mode === 'content' && styles.toggleButtonTextActive]}>Process Content</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.languagePickerWrapper}>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
            style={styles.picker}
            dropdownIconColor="#007bff"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
            ))}
          </Picker>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.chatArea}
        contentContainerStyle={styles.chatContentContainer}
      >
        {chatHistory.map(renderChatMessage)}
        {loading && (
          <View style={styles.loadingBubble}>
            <ActivityIndicator size="small" color="#007bff" />
            <Text style={styles.loadingTextBubble}>AI Guru is thinking...</Text>
          </View>
        )}
        {error && <Text style={styles.errorText}>Error: {error}</Text>}
      </ScrollView>

      <View style={styles.inputArea}>
        {mode === 'chat' ? (
          <>
            <TextInput
              style={styles.textInput}
              placeholder={`Ask me anything in ${SUPPORTED_LANGUAGES.find(l => l.value === selectedLanguage)?.label}...`}
              value={currentInput}
              onChangeText={setCurrentInput}
              onSubmitEditing={handleSendChat}
              returnKeyType="send"
              editable={!loading}
              placeholderTextColor="#6c757d"
            />
            <TouchableOpacity
              style={[styles.sendButton, loading || !currentInput.trim() ? styles.sendButtonDisabled : {}]}
              onPress={handleSendChat}
              disabled={loading || !currentInput.trim()}
            >
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.contentInputGroup}>
            <TextInput
              style={styles.textInput}
              placeholder="Paste URL (e.g., SEBI circular) or text..."
              value={inputUrl || currentInput}
              onChangeText={text => {
                setInputUrl(text.startsWith('http') ? text : '');
                setCurrentInput(text.startsWith('http') ? '' : text);
              }}
              autoCapitalize="none"
              editable={!loading}
              placeholderTextColor="#6c757d"
            />
            <TouchableOpacity
              style={[styles.processContentButton, loading || (!inputUrl.trim() && !currentInput.trim()) ? styles.processContentButtonDisabled : {}]}
              onPress={handleProcessContent}
              disabled={loading || (!inputUrl.trim() && !currentInput.trim())}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.processContentButtonText}>Process</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  headerContainer: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e0e0',
    textAlign: 'center',
  },
  controlsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    padding: 15,
  },
  modeToggle: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    padding: 4,
    marginBottom: 15,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007bff',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#495057',
  },
  toggleButtonTextActive: {
    color: '#ffffff',
  },
  languagePickerWrapper: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ced4da',
    overflow: 'hidden',
    height: 60, // Increased height for the picker wrapper
    justifyContent: 'center',
    marginBottom: 10,
  },
  picker: {
    height: 60, // Match wrapper height
    width: '100%',
    color: '#343a40',
  },
  pickerItem: {
    fontSize: 14,
  },
  chatArea: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  chatContentContainer: {
    paddingBottom: 10,
  },
  messageBubble: {
    maxWidth: '85%',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 15,
    flexShrink: 1,
  },
  userBubbleText: {
    color: '#ffffff',
  },
  aiBubbleText: {
    color: '#343a40',
  },
  playAudioMiniButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: '#28a745',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAudioMiniButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#ffffff',
    padding: 10,
    borderRadius: 18,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 5,
  },
  loadingTextBubble: {
    marginLeft: 10,
    fontSize: 15,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  errorText: {
    color: '#dc3545',
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
    paddingBottom: Platform.OS === 'android' ? 25 : 10, // Increased padding for Android to lift above system buttons
    // Added marginBottom for extra lift from the very bottom of the screen
    // marginBottom: Platform.OS === 'android' ? 0 : 0, // No static margin bottom with KAV
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    fontSize: 16,
    marginRight: 10,
    backgroundColor: '#f8f9fa',
    color: '#343a40',
    minHeight: 48,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    height: 48,
  },
  sendButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentInputGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  processContentButton: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    minWidth: 90,
    height: 48,
  },
  processContentButtonDisabled: {
    backgroundColor: '#adb5bd',
  },
  processContentButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AIGuruScreen;