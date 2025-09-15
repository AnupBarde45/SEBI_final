import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, ScrollView, Animated, PanGestureHandler, PinchGestureHandler, State } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

export default function StockChart({ data, symbol, timeRange = '1D', onTimeRangeChange }) {
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [hoverData, setHoverData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [chartType, setChartType] = useState('line');
  const [showIndicators, setShowIndicators] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState('MA');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panX, setPanX] = useState(0);
  
  const timeRanges = [
    { key: '1D', label: '1 Day', description: 'Hourly data' },
    { key: '1W', label: '1 Week', description: 'Daily data' },
    { key: '1M', label: '1 Month', description: 'Daily data' },
    { key: '3M', label: '3 Months', description: 'Weekly data' },
    { key: '1Y', label: '1 Year', description: 'Monthly data' }
  ];
  const chartTypes = ['line', 'area', 'candlestick'];
  const indicators = ['MA', 'RSI', 'MACD', 'Volume'];
  
  if (!data || !data.c) {
    return <Text style={styles.noData}>No chart data available for {symbol}</Text>;
  }

  const prices = data.c;
  const currentPrice = prices[prices.length - 1];
  const previousPrice = prices[prices.length - 2];
  const change = currentPrice - previousPrice;
  const changePercent = ((change / previousPrice) * 100).toFixed(2);
  
  const timestamps = data.timestamps || [];
  
  // Intelligent time formatting based on time range
  const formatTime = (timestamp, index) => {
    if (timestamp) {
      const date = new Date(timestamp);
      
      switch (timeRange) {
        case '1D':
          // For 1 day, show hours
          return index % 3 === 0 ? `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}` : '';
        case '1W':
          // For 1 week, show days
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          return index % 2 === 0 ? dayNames[date.getDay()] : '';
        case '1M':
          // For 1 month, show dates
          return index % 5 === 0 ? `${date.getDate()}/${date.getMonth() + 1}` : '';
        case '3M':
          // For 3 months, show month and date
          return index % 7 === 0 ? `${date.getDate()}/${date.getMonth() + 1}` : '';
        case '1Y':
          // For 1 year, show months
          const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return index % 10 === 0 ? monthNames[date.getMonth()] : '';
        default:
          return index % 5 === 0 ? `${date.getHours()}:00` : '';
      }
    }
    
    // Fallback for when no timestamps available
    switch (timeRange) {
      case '1D':
        return index % 3 === 0 ? `H${Math.floor(index / 3) + 1}` : '';
      case '1W':
        return index % 2 === 0 ? `Day ${Math.floor(index / 2) + 1}` : '';
      case '1M':
        return index % 5 === 0 ? `Day ${Math.floor(index / 5) + 1}` : '';
      case '3M':
        return index % 7 === 0 ? `Week ${Math.floor(index / 7) + 1}` : '';
      case '1Y':
        return index % 10 === 0 ? `Month ${Math.floor(index / 10) + 1}` : '';
      default:
        return index % 5 === 0 ? `Point ${index + 1}` : '';
    }
  };

  // Calculate technical indicators
  const calculateMA = (period) => {
    const ma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      ma.push(sum / period);
    }
    return ma;
  };

  const calculateRSI = (period = 14) => {
    const rsi = [];
    const gains = [];
    const losses = [];
    
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      rsi.push(rsiValue);
    }
    
    return rsi;
  };

  const ma20 = calculateMA(20);
  const rsi = calculateRSI(14);
  
  const chartData = {
    labels: prices.map((_, index) => formatTime(timestamps[index], index)),
    datasets: [
      { 
        data: prices,
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
        strokeWidth: 3
      },
      ...(showIndicators && selectedIndicator === 'MA' ? [{
        data: [...Array(19).fill(null), ...ma20],
        color: (opacity = 1) => `rgba(255, 152, 0, ${opacity})`,
        strokeWidth: 2
      }] : []),
      ...(showIndicators && selectedIndicator === 'RSI' ? [{
        data: [...Array(13).fill(null), ...rsi],
        color: (opacity = 1) => `rgba(156, 39, 176, ${opacity})`,
        strokeWidth: 2
      }] : [])
    ],
  };

  return (
    <View style={styles.container}>
      {/* User Guidance */}
      <View style={styles.guidanceContainer}>
        <Text style={styles.guidanceTitle}>📊 How to Read This Chart</Text>
        <Text style={styles.guidanceText}>
          • <Text style={styles.boldText}>X-axis (bottom):</Text> Time period - {timeRanges.find(r => r.key === timeRange)?.description || 'Data points'}
        </Text>
        <Text style={styles.guidanceText}>
          • <Text style={styles.boldText}>Y-axis (left):</Text> Stock price in dollars ($)
        </Text>
        <Text style={styles.guidanceText}>
          • <Text style={styles.boldText}>Tap any point:</Text> See detailed price information
        </Text>
      </View>

      {/* Interactive Controls */}
      <View style={styles.controlsContainer}>
        {/* Time Range Selector */}
        <View style={styles.selectorSection}>
          <Text style={styles.selectorTitle}>📅 Select Time Period</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeRangeContainer}>
            {timeRanges.map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[styles.timeRangeButton, timeRange === range.key && styles.activeTimeRange]}
                onPress={() => onTimeRangeChange && onTimeRangeChange(range.key)}
              >
                <Text style={[styles.timeRangeText, timeRange === range.key && styles.activeTimeRangeText]}>
                  {range.label}
                </Text>
                <Text style={[styles.timeRangeDescription, timeRange === range.key && styles.activeTimeRangeDescription]}>
                  {range.description}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chart Type Selector */}
        <View style={styles.selectorSection}>
          <Text style={styles.selectorTitle}>📈 Chart Style</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chartTypeContainer}>
            {chartTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.chartTypeButton, chartType === type && styles.activeChartType]}
                onPress={() => setChartType(type)}
              >
                <Text style={[styles.chartTypeText, chartType === type && styles.activeChartTypeText]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
                <Text style={[styles.chartTypeDescription, chartType === type && styles.activeChartTypeDescription]}>
                  {type === 'line' ? 'Simple line' : type === 'area' ? 'Filled area' : 'Candlesticks'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Technical Indicators Toggle */}
        <View style={styles.selectorSection}>
          <TouchableOpacity
            style={[styles.indicatorToggle, showIndicators && styles.activeIndicatorToggle]}
            onPress={() => setShowIndicators(!showIndicators)}
          >
            <Text style={[styles.indicatorToggleText, showIndicators && styles.activeIndicatorToggleText]}>
              📊 Technical Analysis Tools
            </Text>
            <Text style={[styles.indicatorToggleDescription, showIndicators && styles.activeIndicatorToggleDescription]}>
              {showIndicators ? 'Hide advanced tools' : 'Show advanced tools'}
            </Text>
          </TouchableOpacity>
          
          {showIndicators && (
            <View style={styles.indicatorsSection}>
              <Text style={styles.indicatorsHelpText}>
                💡 These tools help predict price movements
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indicatorButtons}>
                {indicators.map((indicator) => (
                  <TouchableOpacity
                    key={indicator}
                    style={[styles.indicatorButton, selectedIndicator === indicator && styles.activeIndicatorButton]}
                    onPress={() => setSelectedIndicator(indicator)}
                  >
                    <Text style={[styles.indicatorButtonText, selectedIndicator === indicator && styles.activeIndicatorButtonText]}>
                      {indicator}
                    </Text>
                    <Text style={[styles.indicatorButtonDescription, selectedIndicator === indicator && styles.activeIndicatorButtonDescription]}>
                      {indicator === 'MA' ? 'Moving Avg' : indicator === 'RSI' ? 'Momentum' : indicator === 'MACD' ? 'Trend' : 'Volume'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Price Summary */}
      <View style={styles.priceHeader}>
        <Text style={styles.currentPrice}>${currentPrice?.toFixed(2)}</Text>
        <Text style={[styles.priceChange, change >= 0 ? styles.positive : styles.negative]}>
          {change >= 0 ? '+' : ''}${change?.toFixed(2)} ({changePercent}%)
        </Text>
      </View>
      
      <View style={styles.chartWrapper}>
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
              r: selectedPoint ? '6' : '4',
              strokeWidth: '2',
              stroke: '#667eea',
              fill: '#ffffff',
            },
            decimalPlaces: 2,
            propsForBackgroundLines: {
              strokeDasharray: '5,5',
              stroke: 'rgba(102, 126, 234, 0.2)',
            },
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
        
        {/* Enhanced Tooltip */}
        {selectedPoint && (
          <View style={[styles.enhancedTooltip, { left: tooltipPosition.x - 60, top: tooltipPosition.y - 80 }]}>
            <View style={styles.tooltipHeader}>
              <Text style={styles.tooltipSymbol}>{symbol}</Text>
              <Text style={styles.tooltipTime}>
                {data.timestamps && data.timestamps[selectedPoint.index] ? 
                  new Date(data.timestamps[selectedPoint.index]).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 
                  `Point ${selectedPoint.index + 1}`
                }
              </Text>
            </View>
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipPrice}>${selectedPoint.value.toFixed(2)}</Text>
              {showIndicators && selectedIndicator === 'MA' && ma20[selectedPoint.index - 19] && (
                <Text style={styles.tooltipIndicator}>MA20: ${ma20[selectedPoint.index - 19].toFixed(2)}</Text>
              )}
              {showIndicators && selectedIndicator === 'RSI' && rsi[selectedPoint.index - 13] && (
                <Text style={styles.tooltipIndicator}>RSI: {rsi[selectedPoint.index - 13].toFixed(1)}</Text>
              )}
            </View>
          </View>
        )}
      </View>
      
      {/* Interactive Price Display */}
      <View style={styles.interactiveDisplay}>
        <Text style={styles.instructionText}>
          👆 <Text style={styles.boldText}>Tap any point</Text> on the chart to see detailed price information
        </Text>
        <Text style={styles.instructionSubtext}>
          This shows you the exact price at that specific time
        </Text>
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
  guidanceContainer: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    marginHorizontal: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  guidanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  guidanceText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#1976d2',
  },
  controlsContainer: {
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  selectorSection: {
    marginBottom: 15,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginLeft: 5,
  },
  timeRangeContainer: {
    marginBottom: 10,
  },
  timeRangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    minWidth: 80,
    alignItems: 'center',
  },
  activeTimeRange: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginBottom: 2,
  },
  activeTimeRangeText: {
    color: 'white',
  },
  timeRangeDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  activeTimeRangeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chartTypeContainer: {
    marginBottom: 10,
  },
  chartTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 152, 0, 0.3)',
    minWidth: 80,
    alignItems: 'center',
  },
  activeChartType: {
    backgroundColor: '#ff9800',
    borderColor: '#ff9800',
  },
  chartTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff9800',
    marginBottom: 2,
  },
  activeChartTypeText: {
    color: 'white',
  },
  chartTypeDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  activeChartTypeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  indicatorsContainer: {
    marginBottom: 10,
  },
  indicatorToggle: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.3)',
    alignSelf: 'flex-start',
    marginBottom: 8,
    alignItems: 'center',
  },
  activeIndicatorToggle: {
    backgroundColor: '#9c27b0',
    borderColor: '#9c27b0',
  },
  indicatorToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9c27b0',
    marginBottom: 2,
  },
  activeIndicatorToggleText: {
    color: 'white',
  },
  indicatorToggleDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  activeIndicatorToggleDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  indicatorsSection: {
    marginTop: 8,
  },
  indicatorsHelpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
    marginLeft: 5,
  },
  indicatorButtons: {
    marginTop: 5,
  },
  indicatorButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 6,
    backgroundColor: 'rgba(156, 39, 176, 0.1)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(156, 39, 176, 0.3)',
    minWidth: 60,
    alignItems: 'center',
  },
  activeIndicatorButton: {
    backgroundColor: '#9c27b0',
    borderColor: '#9c27b0',
  },
  indicatorButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9c27b0',
    marginBottom: 2,
  },
  activeIndicatorButtonText: {
    color: 'white',
  },
  indicatorButtonDescription: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
  activeIndicatorButtonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  chartWrapper: {
    position: 'relative',
  },
  enhancedTooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 12,
    padding: 12,
    minWidth: 120,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  tooltipHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 6,
    marginBottom: 6,
  },
  tooltipSymbol: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tooltipTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
  },
  tooltipContent: {
    alignItems: 'center',
  },
  tooltipPrice: {
    color: '#4caf50',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tooltipIndicator: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
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
    marginBottom: 5,
    fontStyle: 'italic',
  },
  instructionSubtext: {
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
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