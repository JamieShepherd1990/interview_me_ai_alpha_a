import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { useTheme } from '../theme';
import { setSessions, deleteSession } from '../store/slices/historySlice';
import ProgressChart from '../components/features/ProgressChart';
import PDFService from '../services/PDFService';
import Database from '../db/database';

export default function HistoryScreen() {
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const sessions = useSelector((state: RootState) => state.history.sessions);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const db = Database.getInstance();
      await db.initialize();
      const allSessions = await db.getAllSessions();
      dispatch(setSessions(allSessions));
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      Alert.alert(
        'Delete Session',
        'Are you sure you want to delete this interview session? This action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              const db = Database.getInstance();
              await db.deleteSession(sessionId);
              dispatch(deleteSession(sessionId));
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting session:', error);
      Alert.alert('Error', 'Failed to delete session');
    }
  };

  const handleExportSession = async (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      setIsExporting(sessionId);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const pdfService = PDFService.getInstance();
      const success = await pdfService.shareSessionReport(session, {
        includeTranscript: true,
        includeFeedback: true,
        format: 'detailed',
      });

      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('Error', 'Failed to export PDF report');
      }
    } catch (error) {
      console.error('Error exporting session:', error);
      Alert.alert('Error', 'Failed to export PDF report');
    } finally {
      setIsExporting(null);
    }
  };

  const filteredSessions = sessions.filter(session =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = sessions
    .slice(-10) // Last 10 sessions
    .map((session, index) => ({
      x: index + 1,
      y: session.score,
      label: session.role,
    }));

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return colors.success;
    if (score >= 7.0) return colors.primary[600];
    if (score >= 5.5) return colors.warning;
    return colors.error;
  };

  const renderEmptyState = () => (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    }}>
      <Ionicons
        name="document-text-outline"
        size={80}
        color={colors.text.secondary}
        style={{ marginBottom: 20 }}
      />
      <Text style={{
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
        textAlign: 'center',
      }}>
        No Interview History
      </Text>
      <Text style={{
        fontSize: 16,
        color: colors.text.secondary,
        textAlign: 'center',
        lineHeight: 24,
      }}>
        Complete your first interview to start tracking your progress and see detailed analytics here.
      </Text>
    </View>
  );

  const renderSessionItem = (session: any) => (
    <View
      key={session.id}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 4,
          }}>
            {session.role}
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary,
            marginBottom: 8,
          }}>
            {new Date(session.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        
        <View style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: getScoreColor(session.score),
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: '#ffffff',
          }}>
            {session.score.toFixed(1)}
          </Text>
        </View>
      </View>

      {/* Session Stats */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.text.primary,
          }}>
            {Math.floor(session.duration / 60)}m {session.duration % 60}s
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.text.secondary,
          }}>
            Duration
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.success,
          }}>
            {session.strengths.length}
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.text.secondary,
          }}>
            Strengths
          </Text>
        </View>
        
        <View style={{ alignItems: 'center' }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            color: colors.warning,
          }}>
            {session.improvements.length}
          </Text>
          <Text style={{
            fontSize: 12,
            color: colors.text.secondary,
          }}>
            Areas to Improve
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={{
        flexDirection: 'row',
        gap: 8,
      }}>
        <TouchableOpacity
          onPress={() => setSelectedSession(selectedSession === session.id ? null : session.id)}
          style={{
            flex: 1,
            backgroundColor: colors.primary[50],
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name={selectedSession === session.id ? 'eye-off-outline' : 'eye-outline'}
            size={16}
            color={colors.primary[600]}
            style={{ marginRight: 6 }}
          />
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: colors.primary[600],
          }}>
            {selectedSession === session.id ? 'Hide' : 'View'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleExportSession(session.id)}
          disabled={isExporting === session.id}
          style={{
            backgroundColor: colors.secondary[100],
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            opacity: isExporting === session.id ? 0.7 : 1,
          }}
        >
          <Ionicons
            name={isExporting === session.id ? 'hourglass-outline' : 'download-outline'}
            size={16}
            color={colors.text.primary}
            style={{ marginRight: 6 }}
          />
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: colors.text.primary,
          }}>
            PDF
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleDeleteSession(session.id)}
          style={{
            backgroundColor: `${colors.error}15`,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 8,
          }}
        >
          <Ionicons
            name="trash-outline"
            size={16}
            color={colors.error}
          />
        </TouchableOpacity>
      </View>

      {/* Expanded Details */}
      {selectedSession === session.id && (
        <View style={{
          marginTop: 16,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}>
          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.success,
              marginBottom: 6,
            }}>
              💪 Strengths:
            </Text>
            {session.strengths.map((strength: string, index: number) => (
              <Text key={index} style={{
                fontSize: 13,
                color: colors.text.secondary,
                marginLeft: 8,
                marginBottom: 2,
              }}>
                • {strength}
              </Text>
            ))}
          </View>

          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.warning,
              marginBottom: 6,
            }}>
              🎯 Areas for Improvement:
            </Text>
            {session.improvements.map((improvement: string, index: number) => (
              <Text key={index} style={{
                fontSize: 13,
                color: colors.text.secondary,
                marginLeft: 8,
                marginBottom: 2,
              }}>
                • {improvement}
              </Text>
            ))}
          </View>

          <View>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: colors.primary[600],
              marginBottom: 6,
            }}>
              📚 Key Learnings:
            </Text>
            {session.learnings.map((learning: string, index: number) => (
              <Text key={index} style={{
                fontSize: 13,
                color: colors.text.secondary,
                marginLeft: 8,
                marginBottom: 2,
              }}>
                • {learning}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        {renderEmptyState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View style={{
          padding: 20,
          backgroundColor: colors.surface,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: 8,
          }}>
            Interview History
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.text.secondary,
          }}>
            Track your progress and review past performances
          </Text>
        </View>

        {/* Progress Chart */}
        {chartData.length > 1 && (
          <ProgressChart
            data={chartData}
            title="Your Progress Over Time"
            showTrend={true}
            chartType="area"
          />
        )}

        {/* Search Bar */}
        <View style={{
          marginHorizontal: 16,
          marginVertical: 16,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colors.surface,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            <Ionicons
              name="search-outline"
              size={20}
              color={colors.text.secondary}
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Search interviews..."
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                flex: 1,
                fontSize: 16,
                color: colors.text.primary,
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={{ marginLeft: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sessions List */}
        <View style={{ marginHorizontal: 16 }}>
          {filteredSessions.length === 0 ? (
            <View style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 20,
              alignItems: 'center',
            }}>
              <Ionicons
                name="search-outline"
                size={48}
                color={colors.text.secondary}
                style={{ marginBottom: 12 }}
              />
              <Text style={{
                fontSize: 16,
                color: colors.text.secondary,
                textAlign: 'center',
              }}>
                No interviews found matching "{searchQuery}"
              </Text>
            </View>
          ) : (
            filteredSessions.map(renderSessionItem)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}