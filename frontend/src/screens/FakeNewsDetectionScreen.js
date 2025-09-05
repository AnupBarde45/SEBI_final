import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, Platform, Animated, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: screenWidth } = Dimensions.get('window');

const GEMINI_API_KEY = 'xxxxxx';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const AnimatedPieChart = ({ score, size = 120 }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = size / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [score]);
  
  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });
  
  const color = score > 70 ? '#e74c3c' : score > 50 ? '#f39c12' : '#27ae60';
  const label = score > 70 ? 'FAKE' : score > 50 ? 'QUESTIONABLE' : 'RELIABLE';
  
  return (
    <View style={styles.pieChartContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ecf0f1"
          strokeWidth="8"
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.pieChartCenter}>
        <Text style={[styles.scoreText, { color }]}>{score}%</Text>
        <Text style={[styles.labelText, { color }]}>{label}</Text>
      </View>
    </View>
  );
};

const UploadAnimation = ({ visible, type = 'text' }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  
  const getAnimationConfig = () => {
    switch (type) {
      case 'image': return { emoji: '📷', text: 'Processing image...', color: '#e74c3c' };
      case 'document': return { emoji: '📄', text: 'Reading document...', color: '#f39c12' };
      case 'video': return { emoji: '🎥', text: 'Analyzing video...', color: '#9b59b6' };
      case 'audio': return { emoji: '🎵', text: 'Processing audio...', color: '#1abc9c' };
      default: return { emoji: '🔍', text: 'Analyzing text...', color: '#3498db' };
    }
  };
  
  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: type === 'video' ? 1500 : 2000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: type === 'audio' ? 1.3 : 1.2,
              duration: type === 'document' ? 800 : 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: type === 'document' ? 800 : 1000,
              useNativeDriver: true,
            }),
          ]),
          type === 'audio' ? Animated.loop(
            Animated.sequence([
              Animated.timing(bounceAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(bounceAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }),
            ])
          ) : Animated.timing(bounceAnim, { toValue: 0, duration: 0, useNativeDriver: true })
        ])
      ).start();
    }
  }, [visible, type]);
  
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  const bounce = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  
  if (!visible) return null;
  
  const config = getAnimationConfig();
  
  return (
    <View style={styles.uploadOverlay}>
      <Animated.View style={[
        styles.uploadAnimation,
        { backgroundColor: config.color },
        {
          transform: [
            { rotate: type === 'document' ? '0deg' : rotate },
            { scale: scaleAnim },
            { translateY: bounce }
          ]
        }
      ]}>
        <Text style={styles.uploadEmoji}>{config.emoji}</Text>
      </Animated.View>
      <Text style={styles.uploadText}>{config.text}</Text>
    </View>
  );
};

export default function FakeNewsDetectionScreen() {
  const [inputText, setInputText] = useState('');
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showUploadAnimation, setShowUploadAnimation] = useState(false);
  const [animationType, setAnimationType] = useState('text');

  const generateFakeNewsPrompt = (content, type = 'text') => {
    return `You are analyzing content for misinformation. Be balanced and fair.

Content: "${content}"

Scoring:
15-25: RELIABLE (well-written, plausible content)
30-50: QUESTIONABLE (needs verification)
70+: FAKE (obvious lies, impossible claims)

DO NOT automatically mark content as fake just because you can't verify it online. Many real events may not be in your training data.

Consider:
- Is the writing style professional?
- Are the claims plausible?
- Does it contain obvious impossibilities?
- Is it clearly satirical or fictional?

FAKE NEWS DETECTION SCORE: X/100

Rating: [RELIABLE/QUESTIONABLE/FAKE]

Analysis:
• Content assessment: [brief evaluation]
• Key factors: [main considerations]
• Recommendation: [suggested action]`;
  };

  const cleanMarkdown = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/`(.*?)`/g, '$1')      // Remove `code`
      .replace(/#{1,6}\s/g, '')       // Remove # headers
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove [links](url)
      .replace(/^\s*[-*+]\s/gm, '• ') // Convert - to •
      .trim();
  };

  const analyzeWithGemini = async (content, type) => {
    try {
      const prompt = generateFakeNewsPrompt(content, type);
      
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const rawText = data.candidates[0].content.parts[0].text;
        return cleanMarkdown(rawText);
      } else {
        throw new Error('Invalid API response');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      return 'Error analyzing content. Please try again.';
    }
  };

  const extractFakeScore = (analysis) => {
    const scoreMatch = analysis.match(/FAKE NEWS DETECTION SCORE:\s*(\d+)/i);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1]);
      // Cap scores to prevent over-flagging
      if (score > 80) return 75;
      if (score < 15) return 20;
      return score;
    }
    return 25; // Default to reliable
  };

  const analyzeText = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    setAnimationType('text');
    setShowUploadAnimation(true);
    
    try {
      const analysis = await analyzeWithGemini(inputText, 'text');
      const fakeScore = extractFakeScore(analysis);
      
      const newResult = {
        id: Date.now(),
        type: 'Text Analysis',
        content: inputText.substring(0, 100) + '...',
        analysis: analysis,
        fakeScore: fakeScore,
        timestamp: new Date().toLocaleString()
      };
      setResults(prev => [newResult, ...prev]);
      setInputText('');
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
      setShowUploadAnimation(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Fake News Detection</Text>
      <Text style={styles.subtitle}>AI-Powered Misinformation Detector</Text>
      
      {/* Text Input */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>📝 Text Analysis</Text>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Paste news article, social media post, or any text content here..."
          multiline
          numberOfLines={6}
        />
        <TouchableOpacity 
          style={[styles.analyzeButton, isAnalyzing && styles.disabledButton]} 
          onPress={analyzeText}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>🔍 Analyze Text</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Upload Animation Overlay */}
      <UploadAnimation visible={showUploadAnimation} type={animationType} />
      
      {/* Results */}
      <View style={styles.resultsSection}>
        <Text style={styles.sectionTitle}>📊 Analysis Results</Text>
        {results.length === 0 ? (
          <Text style={styles.noResults}>No analysis results yet. Try analyzing some content above!</Text>
        ) : (
          results.map(result => (
            <View key={result.id} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View>
                  <Text style={styles.resultType}>{result.type}</Text>
                  <Text style={styles.resultTime}>{result.timestamp}</Text>
                </View>
                {result.fakeScore !== undefined && (
                  <AnimatedPieChart score={result.fakeScore} size={80} />
                )}
              </View>
              <Text style={styles.resultContent}>{result.content}</Text>
              <ScrollView style={styles.analysisContainer} nestedScrollEnabled>
                <Text style={styles.analysisText}>{result.analysis}</Text>
              </ScrollView>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 15,
    minHeight: 120,
  },
  analyzeButton: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsSection: {
    marginBottom: 30,
  },
  noResults: {
    textAlign: 'center',
    color: '#7f8c8d',
    fontStyle: 'italic',
    padding: 20,
  },
  resultCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  resultTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  resultContent: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  analysisContainer: {
    maxHeight: 300,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 15,
  },
  analysisText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  pieChartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  uploadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  uploadAnimation: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  uploadEmoji: {
    fontSize: 40,
  },
  uploadText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});