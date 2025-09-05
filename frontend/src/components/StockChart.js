import React, { useState } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function StockChart({ data, symbol, timeRange = '1D', onTimeRangeChange }) {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hoverData, setHoverData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  
  if (!data || !data.c) {
    return <Text style={styles.noData}>No chart data available for {symbol}</Text>;
  }

  const prices = data.c;
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[prices.length - 2];
  const change = currentPrice - previousPrice;
  const changePercent = ((change / previousPrice) * 100).toFixed(2);
  
  const timestamps = data.timestamps || [];
  const formatTime = (timestamp, index) => {
    if (timestamp) {
      const date = new Date(timestamp);
      return index % 5 === 0 ? `${date.getHours()}:00` : '';
    }
    return index % 5 === 0 ? `${index + 1}h` : '';
  };
  
  const chartData = {
    labels: prices.map((_, index) => formatTime(timestamps[index], index)),
    datasets: [{ 
      data: prices,
      color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      strokeWidth: 3
    }],
  };

  return (
    <View style={styles.container}>
      {/* Price Summary */}
      <View style={styles.priceHeader}>
        <Text style={styles.currentPrice}>${currentPrice?.toFixed(2)}</Text>
        <Text style={[styles.priceChange, change >= 0 ? styles.positive : styles.negative]}>
          {change >= 0 ? '+' : ''}${change?.toFixed(2)} ({changePercent}%)
        </Text>
      </View>
      
      <LineChart
        data={chartData}
        width={screenWidth - 20}
        height={300}
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: '#667eea',
          backgroundGradientTo: '#764ba2',
          backgroundGradientFromOpacity: 0.1,
          backgroundGradientToOpacity: 0.1,
          color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
          strokeWidth: 2,
          barPercentage: 0.5,
          useShadowColorFromDataset: false,
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#667eea',
            fill: '#ffffff',
          },
          decimalPlaces: 2,
        }}
        onDataPointClick={(clickData) => {
          const pointData = {
            value: clickData.value,
            index: clickData.index,
            x: clickData.x,
            y: clickData.y
          };
          setSelectedPoint(pointData);
          setHoverData(pointData);
          setTooltipPosition({ x: clickData.x, y: clickData.y });
        }}
        bezier
        style={{
          borderRadius: 16,
          marginVertical: 8,
          alignSelf: 'center',
        }}
      />
      
      {/* Interactive Price Display */}
      <View style={styles.interactiveDisplay}>
        <Text style={styles.instructionText}>👆 Tap any point on the chart to see details</Text>
        {selectedPoint && (
          <View style={styles.selectedInfo}>
            <View style={styles.priceRow}>
              <Text style={styles.selectedLabel}>Price:</Text>
              <Text style={styles.selectedPrice}>${selectedPoint.value.toFixed(2)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.selectedLabel}>Time:</Text>
              <Text style={styles.selectedTime}>
                {data.timestamps && data.timestamps[selectedPoint.index] ? 
                  new Date(data.timestamps[selectedPoint.index]).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  `Hour ${selectedPoint.index + 1}`
                }
              </Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Chart Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>High</Text>
          <Text style={styles.statValue}>${Math.max(...prices).toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Low</Text>
          <Text style={styles.statValue}>${Math.min(...prices).toFixed(2)}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Avg</Text>
          <Text style={styles.statValue}>${(prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    position: 'relative',
  },
  noData: {
    textAlign: 'center',
    padding: 30,
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 5,
    paddingVertical: 15,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1976d2',
  },
  priceChange: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  positive: {
    color: '#ffffff',
    backgroundColor: '#4caf50',
  },
  negative: {
    color: '#ffffff',
    backgroundColor: '#f44336',
  },
  interactiveDisplay: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  instructionText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  selectedInfo: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  selectedTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 2,
    borderTopColor: 'rgba(102, 126, 234, 0.2)',
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(102, 126, 234, 0.05)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
});