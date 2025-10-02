import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Rect, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const chartWidth = width - 40;
const chartHeight = 200;

export default function InteractiveChartTutorial({ stockData, symbol }) {
  const [currentLesson, setCurrentLesson] = useState(0);

  const lessons = [
    {
      title: "📈 Price Movement Basics",
      description: "The line shows stock price over time. UP = Good, DOWN = Bad",
      highlight: "line",
      annotation: { type: "arrow", x: chartWidth * 0.7, y: chartHeight * 0.3, text: "Price going UP!" }
    },
    {
      title: "📊 Reading the Axes",
      description: "Y-axis = Price ($), X-axis = Time. Higher = More expensive",
      highlight: "axes",
      annotation: { type: "label", x: 20, y: chartHeight * 0.5, text: "Price ($)" }
    },
    {
      title: "📈 Trend Identification",
      description: "Look for overall direction: Uptrend, Downtrend, or Sideways",
      highlight: "trend",
      annotation: { type: "trendline", x1: chartWidth * 0.2, y1: chartHeight * 0.8, x2: chartWidth * 0.8, y2: chartHeight * 0.2 }
    },
    {
      title: "⚡ Volatility Patterns",
      description: "Sharp ups and downs = High risk. Smooth lines = Lower risk",
      highlight: "volatility",
      annotation: { type: "zigzag", x: chartWidth * 0.5, y: chartHeight * 0.4 }
    },
    {
      title: "🎯 Support & Resistance",
      description: "Support = Price bounces UP from here. Resistance = Price struggles to go ABOVE",
      highlight: "levels",
      annotation: { type: "horizontal", y: chartHeight * 0.3, text: "Resistance Level" }
    }
  ];

  const generateSampleChart = () => {
    const points = [];
    const dataPoints = 20;
    
    for (let i = 0; i < dataPoints; i++) {
      const x = (i / (dataPoints - 1)) * chartWidth;
      let y;
      
      // Create different patterns based on lesson
      switch (currentLesson) {
        case 0: // Basic uptrend
          y = chartHeight * 0.8 - (i / dataPoints) * chartHeight * 0.6 + Math.sin(i * 0.5) * 20;
          break;
        case 2: // Clear trend
          y = chartHeight * 0.7 - (i / dataPoints) * chartHeight * 0.4;
          break;
        case 3: // Volatile
          y = chartHeight * 0.5 + Math.sin(i * 0.8) * 60 + Math.cos(i * 1.2) * 30;
          break;
        default:
          y = chartHeight * 0.6 + Math.sin(i * 0.3) * 40;
      }
      
      points.push({ x, y: Math.max(20, Math.min(chartHeight - 20, y)) });
    }
    return points;
  };

  const points = generateSampleChart();
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');

  const renderAnnotation = (annotation) => {
    switch (annotation.type) {
      case 'arrow':
        return (
          <g key="arrow">
            <Path
              d={`M ${annotation.x - 20} ${annotation.y + 20} L ${annotation.x} ${annotation.y} L ${annotation.x - 10} ${annotation.y + 10}`}
              stroke="#FF5722"
              strokeWidth="3"
              fill="none"
            />
            <SvgText
              x={annotation.x - 40}
              y={annotation.y + 40}
              fontSize="14"
              fill="#FF5722"
              fontWeight="bold"
            >
              {annotation.text}
            </SvgText>
          </g>
        );
      
      case 'trendline':
        return (
          <g key="trendline">
            <Line
              x1={annotation.x1}
              y1={annotation.y1}
              x2={annotation.x2}
              y2={annotation.y2}
              stroke="#4CAF50"
              strokeWidth="3"
              strokeDasharray="5,5"
            />
            <SvgText
              x={annotation.x2 - 50}
              y={annotation.y2 - 10}
              fontSize="12"
              fill="#4CAF50"
              fontWeight="bold"
            >
              Uptrend
            </SvgText>
          </g>
        );
      
      case 'horizontal':
        return (
          <g key="horizontal">
            <Line
              x1={0}
              y1={annotation.y}
              x2={chartWidth}
              y2={annotation.y}
              stroke="#FF9800"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
            <Rect
              x={chartWidth * 0.6}
              y={annotation.y - 15}
              width={100}
              height={20}
              fill="#FF9800"
              rx="10"
            />
            <SvgText
              x={chartWidth * 0.6 + 50}
              y={annotation.y - 2}
              fontSize="10"
              fill="white"
              textAnchor="middle"
              fontWeight="bold"
            >
              {annotation.text}
            </SvgText>
          </g>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.lessonTitle}>{lessons[currentLesson].title}</Text>
        <Text style={styles.lessonCounter}>{currentLesson + 1}/{lessons.length}</Text>
      </View>
      
      <View style={styles.chartContainer}>
        <Svg width={chartWidth} height={chartHeight} style={styles.chart}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <Line
              key={`grid-${i}`}
              x1={0}
              y1={(i / 4) * chartHeight}
              x2={chartWidth}
              y2={(i / 4) * chartHeight}
              stroke="#E0E0E0"
              strokeWidth="1"
            />
          ))}
          
          {/* Price line */}
          <Path
            d={pathData}
            stroke="#2196F3"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <Circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#2196F3"
            />
          ))}
          
          {/* Annotations */}
          {lessons[currentLesson].annotation && renderAnnotation(lessons[currentLesson].annotation)}
          
          {/* Axis labels */}
          <SvgText x="10" y="15" fontSize="12" fill="#666">$</SvgText>
          <SvgText x={chartWidth - 30} y={chartHeight - 5} fontSize="12" fill="#666">Time</SvgText>
        </Svg>
      </View>
      
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{lessons[currentLesson].description}</Text>
      </View>
      
      <View style={styles.practiceContainer}>
        <Text style={styles.practiceTitle}>🎯 Quick Practice:</Text>
        {currentLesson === 0 && (
          <Text style={styles.practiceText}>Look at the chart above. Is the overall trend going UP or DOWN?</Text>
        )}
        {currentLesson === 1 && (
          <Text style={styles.practiceText}>What does the Y-axis represent? What about the X-axis?</Text>
        )}
        {currentLesson === 2 && (
          <Text style={styles.practiceText}>Can you see the upward trend line? This means prices are generally rising!</Text>
        )}
        {currentLesson === 3 && (
          <Text style={styles.practiceText}>Notice how the line zigzags? That's volatility - more risk but more opportunity!</Text>
        )}
        {currentLesson === 4 && (
          <Text style={styles.practiceText}>The orange line shows resistance. Price struggles to go above this level.</Text>
        )}
      </View>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentLesson === 0 && styles.navButtonDisabled]}
          onPress={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
          disabled={currentLesson === 0}
        >
          <Text style={styles.navButtonText}>← Previous</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.resetButton}
          onPress={() => setCurrentLesson(0)}
        >
          <Text style={styles.resetButtonText}>🔄</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.navButton, currentLesson === lessons.length - 1 && styles.completedButton]}
          onPress={() => {
            if (currentLesson < lessons.length - 1) {
              setCurrentLesson(currentLesson + 1);
            } else {
              alert('🎉 Tutorial Complete! You now know the basics of reading stock charts!');
            }
          }}
        >
          <Text style={styles.navButtonText}>
            {currentLesson === lessons.length - 1 ? '🎉 Complete!' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  lessonCounter: {
    fontSize: 16,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chartContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  chart: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  descriptionContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  description: {
    fontSize: 16,
    color: '#1565c0',
    lineHeight: 22,
    textAlign: 'center',
  },
  practiceContainer: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 8,
  },
  practiceText: {
    fontSize: 15,
    color: '#e65100',
    lineHeight: 20,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 100,
  },
  navButtonDisabled: {
    backgroundColor: '#ccc',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  navButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#ff9800',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 20,
  },
});