import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // For language selection

// --- Supported Languages and TTS Voices (for hackathon demo) ---
// These reflect common Indian vernacular languages and available Gemini TTS voices
const SUPPORTED_LANGUAGES = [
  { label: 'English', value: 'en-US', voice: 'Aria' }, // Default English voice
  { label: 'Hindi', value: 'hi-IN', voice: 'Kore' },
  { label: 'Marathi', value: 'mr-IN', voice: 'Puck' },
  { label: 'Bengali', value: 'bn-BD', voice: 'Zephyr' },
  { label: 'Tamil', value: 'ta-IN', voice: 'Leda' },
  { label: 'Telugu', value: 'te-IN', voice: 'Orus' },
  { label: 'Gujarati', value: 'gu-IN', voice: 'Charon' },
  // Add more languages as needed
];

function MultilingualHubScreen({ navigation }) {
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0].value); // Default to English
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedVoice = SUPPORTED_LANGUAGES.find(lang => lang.value === selectedLanguage)?.voice || 'Aria';

  const handleProcessContent = async () => {
    if (!inputText && !inputUrl) {
      Alert.alert("Input Required", "Please enter some text or a URL to process.");
      return;
    }
    if (!selectedLanguage) {
      Alert.alert("Language Required", "Please select a target language.");
      return;
    }

    setLoading(true);
    setError('');
    setTranslatedSummary('');
    setAudioUrl('');

    try {
      // --- API Call to Backend (we'll build this backend endpoint later!) ---
      // For now, this is a placeholder. Your backend will connect to Gemini API.
      const response = await fetch('YOUR_BACKEND_URL/api/translate-summarize-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          url: inputUrl,
          targetLanguage: selectedLanguage,
          voiceName: selectedVoice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process content.');
      }

      const data = await response.json();
      setTranslatedSummary(data.translatedSummary);
      setAudioUrl(data.audioUrl); // This will be a Blob URL or base64 data

    } catch (err) {
      console.error("MULTILINGUAL_HUB_ERROR:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (audioUrl) {
      // In a real app, you'd use a library like `expo-av` to play audio.
      // For now, we'll just log it or use a simple HTML audio tag in a WebView if needed.
      Alert.alert("Play Audio", `Playing audio from: ${audioUrl}`);
      console.log("Attempting to play audio from:", audioUrl);
      // Example: You can use a simple Audio object in web (for testing in browser)
      // const audio = new Audio(audioUrl);
      // audio.play();
    } else {
      Alert.alert("No Audio", "No audio available to play.");
    }
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Text style={styles.headerTitle}>Multilingual Learning Hub</Text>
      <Text style={styles.headerSubtitle}>Translate, summarize, and listen to financial content in your language!</Text>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Input Content</Text>
        <TextInput
          style={styles.input}
          placeholder="Paste text here..."
          multiline
          numberOfLines={4}
          value={inputText}
          onChangeText={setInputText}
        />
        <Text style={styles.orText}>OR</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter a URL (e.g., SEBI circular)..."
          value={inputUrl}
          onChangeText={setInputUrl}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeader}>Select Language</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedLanguage}
            onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
            ))}
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={styles.processButton}
        onPress={handleProcessContent}
        disabled={loading || (!inputText && !inputUrl)}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.processButtonText}>Process Content</Text>
        )}
      </TouchableOpacity>

      {error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : translatedSummary ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultHeader}>Translated & Summarized Content</Text>
          <Text style={styles.resultText}>{translatedSummary}</Text>
          {audioUrl ? (
            <TouchableOpacity style={styles.playAudioButton} onPress={handlePlayAudio}>
              <Text style={styles.playAudioButtonText}>▶️ Play Audio</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noAudioText}>No audio available.</Text>
          )}
        </View>
      ) : null}

      <View style={{ height: 50 }} />
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
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#667788',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
  },
  cardHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
    width: '100%',
    backgroundColor: '#fdfdfd',
  },
  orText: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    backgroundColor: '#fdfdfd',
    overflow: 'hidden', // Ensures picker content stays within bounds
  },
  picker: {
    height: 50,
    width: '100%',
    color: '#333',
  },
  pickerItem: {
    fontSize: 16,
  },
  processButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  processButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 18,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
  },
  resultHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#334155',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  resultText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4a5568',
    marginBottom: 15,
  },
  playAudioButton: {
    backgroundColor: '#28a745', // Green for play button
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  playAudioButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noAudioText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
});

export default MultilingualHubScreen;