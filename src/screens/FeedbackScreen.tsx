import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { useTheme } from '../theme';
import { resetSession } from '../store/slices/sessionSlice';
import { addSession } from '../store/slices/historySlice';
import ConfettiCelebration from '../components/features/ConfettiCelebration';
import FeedbackCard from '../components/features/FeedbackCard';
import PDFService from '../services/PDFService';
import Database from '../db/database';

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const session = useSelector((state: RootState) => state.session);
  
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Show confetti for high scores
    if (session.feedback && session.feedback.score >= 8) {
      setTimeout(() => {
        setShowConfetti(true);
      }, 500);
    }
  }, [session.feedback]);

  const handleSaveAndExit = async () => {
    if (!session.feedback) return;
    
    try {
      setIsSaving(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Create interview session object
      const interviewSession = {
        id: `session_${Date.now()}`,
        title: `${session.currentQuestion ? 'Interview' : 'Mock Interview'} - ${new Date().toLocaleDateString()}`,
        role: route.params?.role || 'General',
        startTime: session.startTime || Date.now(),
        duration: session.duration,
        transcript: session.transcript,
        score: session.feedback.score,
        strengths: session.feedback.strengths,
        improvements: session.feedback.improvements,
        learnings: session.feedback.learnings,
        createdAt: Date.now(),
      };

      // Save to database
      const db = Database.getInstance();
      await db.initialize();
      await db.saveSession(interviewSession);

      // Add to Redux store
      dispatch(addSession(interviewSession));

      // Reset session state
      dispatch(resetSession());

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Navigate back to main app
      navigation.navigate('Main' as never);

    } catch (error) {
      console.error('Error saving session:', error);
      Alert.alert('Error', 'Failed to save interview session');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    Alert.alert(
      'Discard Session',
      'Are you sure you want to discard this interview session? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            dispatch(resetSession());
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('Main' as never);
          },
        },
      ]
    );
  };

  const handleExportPDF = async () => {
    if (!session.feedback) return;

    try {
      setIsExporting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const interviewSession = {
        id: `temp_${Date.now()}`,
        title: `Interview Report - ${new Date().toLocaleDateString()}`,
        role: route.params?.role || 'General',
        startTime: session.startTime || Date.now(),
        duration: session.duration,
        transcript: session.transcript,
        score: session.feedback.score,
        strengths: session.feedback.strengths,
        improvements: session.feedback.improvements,
        learnings: session.feedback.learnings,
        createdAt: Date.now(),
      };

      const pdfService = PDFService.getInstance();
      const success = await pdfService.shareSessionReport(interviewSession, {
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
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export PDF report');
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return colors.success;
    if (score >= 7.0) return colors.primary[600];
    if (score >= 5.5) return colors.warning;
    return colors.error;
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 8.5) return 'Excellent! 🎉';
    if (score >= 7.0) return 'Great job! 👏';
    if (score >= 5.5) return 'Good effort! 👍';
    return 'Keep practicing! 💪';
  };

  if (!session.feedback) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.text.secondary}
          />
          <Text style={{
            fontSize: 18,
            color: colors.text.primary,
            textAlign: 'center',
            marginTop: 16,
          }}>
            No feedback available
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary,
            textAlign: 'center',
            marginTop: 8,
          }}>
            Please complete an interview to see your feedback
          </Text>
        </View>
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
          alignItems: 'center',
          backgroundColor: colors.surface,
        }}>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginBottom: 8,
          }}>
            Interview Complete!
          </Text>
          <Text style={{
            fontSize: 16,
            color: colors.text.secondary,
            textAlign: 'center',
          }}>
            Here's your detailed performance analysis
          </Text>
        </View>

        {/* Score Section */}
        <View style={{
          margin: 16,
          padding: 24,
          backgroundColor: colors.surface,
          borderRadius: 16,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}>
          <View style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: getScoreColor(session.feedback.score),
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}>
            <Text style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: '#ffffff',
            }}>
              {session.feedback.score.toFixed(1)}
            </Text>
          </View>
          
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 8,
          }}>
            {getPerformanceLabel(session.feedback.score)}
          </Text>
          
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary,
            textAlign: 'center',
          }}>
            Overall Interview Score
          </Text>

          {/* Quick Stats */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
            marginTop: 20,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.primary[600],
              }}>
                {Math.floor(session.duration / 60)}m
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
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.primary[600],
              }}>
                {session.transcript.split('\n').filter(line => line.startsWith('User:')).length}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary,
              }}>
                Responses
              </Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: colors.success,
              }}>
                {session.feedback.strengths.length}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary,
              }}>
                Strengths
              </Text>
            </View>
          </View>
        </View>

        {/* Feedback Cards */}
        <View style={{ marginHorizontal: 16 }}>
          <FeedbackCard
            title="💪 Strengths"
            items={session.feedback.strengths}
            type="strengths"
          />
          
          <FeedbackCard
            title="🎯 Areas for Improvement"
            items={session.feedback.improvements}
            type="improvements"
          />
          
          <FeedbackCard
            title="📚 Key Learnings"
            items={session.feedback.learnings}
            type="learnings"
          />
        </View>

        {/* Action Buttons */}
        <View style={{
          margin: 16,
          gap: 12,
        }}>
          <TouchableOpacity
            onPress={handleExportPDF}
            disabled={isExporting}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.secondary[100],
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 12,
              opacity: isExporting ? 0.7 : 1,
            }}
          >
            <Ionicons
              name={isExporting ? 'hourglass-outline' : 'document-text-outline'}
              size={20}
              color={colors.text.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: colors.text.primary,
            }}>
              {isExporting ? 'Exporting...' : 'Export PDF Report'}
            </Text>
          </TouchableOpacity>

          <View style={{
            flexDirection: 'row',
            gap: 12,
          }}>
            <TouchableOpacity
              onPress={handleDiscard}
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: colors.text.secondary,
              }}>
                Discard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSaveAndExit}
              disabled={isSaving}
              style={{
                flex: 2,
                backgroundColor: colors.primary[600],
                paddingVertical: 16,
                paddingHorizontal: 24,
                borderRadius: 12,
                alignItems: 'center',
                opacity: isSaving ? 0.7 : 1,
              }}
            >
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#ffffff',
              }}>
                {isSaving ? 'Saving...' : 'Save & Continue'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Confetti Animation */}
      <ConfettiCelebration
        show={showConfetti}
        score={session.feedback.score}
        onComplete={() => setShowConfetti(false)}
      />
    </SafeAreaView>
  );
}