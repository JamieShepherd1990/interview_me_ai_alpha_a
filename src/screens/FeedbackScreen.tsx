import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ConfettiCannon from 'react-native-confetti-cannon';

import { RootState, AppDispatch } from '../store';
import { setFeedback } from '../store/slices/sessionSlice';
import { addSession } from '../store/slices/historySlice';

export default function FeedbackScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { sessionId } = route.params as any;
  const { transcript, role, interviewType, duration } = useSelector((state: RootState) => state.session);
  const [feedback, setFeedbackData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    generateFeedback();
  }, []);

  const generateFeedback = async () => {
    try {
      setLoading(true);
      
      // Create transcript text
      const transcriptText = transcript
        .map(entry => `${entry.speaker === 'user' ? 'Student' : 'Interviewer'}: ${entry.text}`)
        .join('\n');

      // Call backend for AI feedback
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcriptText,
          role,
          interviewType
        })
      });

      if (!response.ok) {
        throw new Error(`Feedback API Error: ${response.status}`);
      }

      const feedbackData = await response.json();
      setFeedbackData(feedbackData);
      dispatch(setFeedback(feedbackData));

      // Show confetti for high scores
      if (feedbackData.score >= 8) {
        setShowConfetti(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

    } catch (error) {
      console.error('Feedback generation error:', error);
      Alert.alert('Error', 'Failed to generate feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndExit = async () => {
    try {
      if (feedback) {
        // Save to history
        dispatch(addSession({
          id: sessionId,
          timestamp: Date.now(),
          interviewType,
          role,
          duration,
          score: feedback.score,
          transcript,
          feedback: {
            strengths: feedback.strengths,
            improvements: feedback.improvements,
            learnings: feedback.learnings
          },
          isSaved: true
        }));

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate('MainTabs', { screen: 'Home' });
      }
    } catch (error) {
      console.error('Save session error:', error);
      Alert.alert('Error', 'Failed to save session');
    }
  };

  const handleDiscard = () => {
    Alert.alert(
      'Discard Session',
      'Are you sure you want to discard this interview session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Discard', 
          style: 'destructive',
          onPress: () => navigation.navigate('MainTabs', { screen: 'Home' })
        }
      ]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return isDark ? 'text-green-400' : 'text-green-600';
    if (score >= 6) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 8) return isDark ? 'bg-green-900' : 'bg-green-100';
    if (score >= 6) return isDark ? 'bg-yellow-900' : 'bg-yellow-100';
    return isDark ? 'bg-red-900' : 'bg-red-100';
  };

  if (loading) {
    return (
      <View className={`flex-1 items-center justify-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        <Text className={`text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Generating your feedback...
        </Text>
      </View>
    );
  }

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {showConfetti && (
        <ConfettiCannon
          count={200}
          origin={{ x: -10, y: 0 }}
          autoStart={true}
          fadeOut={true}
        />
      )}

      <ScrollView className="flex-1">
        {/* Header */}
        <View className={`px-6 py-6 ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
          <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
            Interview Complete!
          </Text>
          <Text className={`text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Here's your performance feedback
          </Text>
        </View>

        {/* Score */}
        {feedback && (
          <View className="px-6 py-4">
            <View className={`p-6 rounded-xl ${getScoreBackground(feedback.score)}`}>
              <Text className={`text-center text-4xl font-bold ${getScoreColor(feedback.score)}`}>
                {feedback.score}/10
              </Text>
              <Text className={`text-center text-lg mt-2 ${getScoreColor(feedback.score)}`}>
                {feedback.score >= 8 ? 'Excellent!' : feedback.score >= 6 ? 'Good Job!' : 'Keep Practicing!'}
              </Text>
            </View>
          </View>
        )}

        {/* Strengths */}
        {feedback && (
          <View className="px-6 py-4">
            <Text className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Strengths
            </Text>
            {feedback.strengths.map((strength: string, index: number) => (
              <View key={index} className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
                <Text className={`${isDark ? 'text-green-300' : 'text-green-700'}`}>
                  • {strength}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Areas for Improvement */}
        {feedback && (
          <View className="px-6 py-4">
            <Text className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Areas for Improvement
            </Text>
            {feedback.improvements.map((improvement: string, index: number) => (
              <View key={index} className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                <Text className={`${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                  • {improvement}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Key Learnings */}
        {feedback && (
          <View className="px-6 py-4">
            <Text className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Key Learnings
            </Text>
            {feedback.learnings.map((learning: string, index: number) => (
              <View key={index} className={`p-3 rounded-lg mb-2 ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <Text className={`${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  • {learning}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View className={`px-6 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={handleDiscard}
            className={`flex-1 py-3 px-4 rounded-lg ${
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            }`}
          >
            <Text className={`text-center font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Discard
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSaveAndExit}
            className={`flex-1 py-3 px-4 rounded-lg ${
              isDark ? 'bg-blue-600' : 'bg-blue-500'
            }`}
          >
            <Text className="text-center font-semibold text-white">
              Save & Exit
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
