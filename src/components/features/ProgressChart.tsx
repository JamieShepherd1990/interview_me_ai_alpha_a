import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis, VictoryTheme, VictoryScatter } from 'victory';
import { useTheme } from '../../theme';

const { width } = Dimensions.get('window');

interface ProgressDataPoint {
  x: number; // Session number or date
  y: number; // Score (0-10)
  label?: string;
}

interface ProgressChartProps {
  data: ProgressDataPoint[];
  title?: string;
  showTrend?: boolean;
  chartType?: 'line' | 'area';
}

export default function ProgressChart({ 
  data, 
  title = "Interview Progress", 
  showTrend = true,
  chartType = 'area'
}: ProgressChartProps) {
  const { colors, isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <View style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 20,
        margin: 16,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 200,
      }}>
        <Text style={{
          color: colors.text.secondary,
          fontSize: 16,
        }}>
          No progress data available yet
        </Text>
        <Text style={{
          color: colors.text.secondary,
          fontSize: 14,
          marginTop: 8,
          textAlign: 'center',
        }}>
          Complete your first interview to see your progress here
        </Text>
      </View>
    );
  }

  const chartWidth = width - 64;
  const chartHeight = 200;

  // Calculate trend line data
  const trendData = showTrend ? calculateTrendLine(data) : [];

  // Get min/max for better scaling
  const scores = data.map(d => d.y);
  const minScore = Math.max(0, Math.min(...scores) - 1);
  const maxScore = Math.min(10, Math.max(...scores) + 1);

  const chartTheme = {
    ...VictoryTheme.material,
    axis: {
      style: {
        axis: { stroke: colors.border },
        grid: { stroke: colors.border, strokeOpacity: 0.3 },
        ticks: { stroke: colors.border },
        tickLabels: { 
          fill: colors.text.secondary, 
          fontSize: 12,
          fontFamily: 'System'
        },
      },
    },
  };

  return (
    <View style={{
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      margin: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 16,
        textAlign: 'center',
      }}>
        {title}
      </Text>

      <VictoryChart
        theme={chartTheme}
        width={chartWidth}
        height={chartHeight}
        padding={{ left: 50, top: 20, right: 20, bottom: 50 }}
        domain={{ y: [minScore, maxScore] }}
      >
        <VictoryAxis 
          dependentAxis
          tickFormat={(t) => `${t}`}
          style={{
            grid: { stroke: colors.border, strokeOpacity: 0.3 },
            axis: { stroke: colors.border },
            tickLabels: { fill: colors.text.secondary, fontSize: 12 },
          }}
        />
        <VictoryAxis 
          tickFormat={(t) => `#${t}`}
          style={{
            grid: { stroke: colors.border, strokeOpacity: 0.3 },
            axis: { stroke: colors.border },
            tickLabels: { fill: colors.text.secondary, fontSize: 12 },
          }}
        />

        {chartType === 'area' ? (
          <VictoryArea
            data={data}
            style={{
              data: { 
                fill: colors.primary[500], 
                fillOpacity: 0.3,
                stroke: colors.primary[600],
                strokeWidth: 2,
              }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
        ) : (
          <VictoryLine
            data={data}
            style={{
              data: { 
                stroke: colors.primary[600],
                strokeWidth: 3,
              }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
        )}

        {/* Data points */}
        <VictoryScatter
          data={data}
          size={4}
          style={{
            data: { 
              fill: colors.primary[600],
              stroke: colors.background,
              strokeWidth: 2,
            }
          }}
          animate={{
            duration: 1000,
            onLoad: { duration: 500 }
          }}
        />

        {/* Trend line */}
        {showTrend && trendData.length > 0 && (
          <VictoryLine
            data={trendData}
            style={{
              data: { 
                stroke: colors.success,
                strokeWidth: 2,
                strokeDasharray: '5,5',
              }
            }}
            animate={{
              duration: 1200,
              onLoad: { duration: 700 }
            }}
          />
        )}
      </VictoryChart>

      {/* Legend */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        flexWrap: 'wrap',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
          <View style={{
            width: 12,
            height: 3,
            backgroundColor: colors.primary[600],
            marginRight: 4,
          }} />
          <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
            Score
          </Text>
        </View>
        
        {showTrend && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 }}>
            <View style={{
              width: 12,
              height: 2,
              backgroundColor: colors.success,
              marginRight: 4,
              borderStyle: 'dashed',
              borderWidth: 1,
              borderColor: colors.success,
            }} />
            <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
              Trend
            </Text>
          </View>
        )}
      </View>

      {/* Summary stats */}
      {data.length > 1 && (
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
              Latest
            </Text>
            <Text style={{ 
              color: colors.text.primary, 
              fontSize: 16, 
              fontWeight: 'bold' 
            }}>
              {data[data.length - 1].y.toFixed(1)}
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
              Average
            </Text>
            <Text style={{ 
              color: colors.text.primary, 
              fontSize: 16, 
              fontWeight: 'bold' 
            }}>
              {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)}
            </Text>
          </View>
          
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: colors.text.secondary, fontSize: 12 }}>
              Best
            </Text>
            <Text style={{ 
              color: colors.success, 
              fontSize: 16, 
              fontWeight: 'bold' 
            }}>
              {Math.max(...scores).toFixed(1)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function calculateTrendLine(data: ProgressDataPoint[]): ProgressDataPoint[] {
  if (data.length < 2) return [];

  // Simple linear regression
  const n = data.length;
  const sumX = data.reduce((sum, d) => sum + d.x, 0);
  const sumY = data.reduce((sum, d) => sum + d.y, 0);
  const sumXY = data.reduce((sum, d) => sum + (d.x * d.y), 0);
  const sumXX = data.reduce((sum, d) => sum + (d.x * d.x), 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Generate trend line points
  const minX = Math.min(...data.map(d => d.x));
  const maxX = Math.max(...data.map(d => d.x));

  return [
    { x: minX, y: slope * minX + intercept },
    { x: maxX, y: slope * maxX + intercept },
  ];
}
