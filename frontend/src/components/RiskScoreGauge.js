import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function RiskScoreGauge({ score }) {
  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = () => {
    if (score <= 33) return '#27ae60'; // Green for Conservative
    if (score <= 66) return '#f39c12'; // Orange for Moderate
    return '#e74c3c'; // Red for Aggressive
  };

  const getScoreLabel = () => {
    if (score <= 33) return 'Conservative';
    if (score <= 66) return 'Moderate';
    return 'Aggressive';
  };

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        <Svg height={radius * 2} width={radius * 2}>
          {/* Background circle */}
          <Circle
            stroke="#ecf0f1"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <Circle
            stroke={getScoreColor()}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </Svg>
        <View style={styles.scoreContainer}>
          <Text style={[styles.scoreText, { color: getScoreColor() }]}>{score}</Text>
          <Text style={styles.scoreLabel}>{getScoreLabel()}</Text>
        </View>
      </View>
      
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#27ae60' }]} />
          <Text style={styles.legendText}>0-33 Conservative</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#f39c12' }]} />
          <Text style={styles.legendText}>34-66 Moderate</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#e74c3c' }]} />
          <Text style={styles.legendText}>67-100 Aggressive</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
});