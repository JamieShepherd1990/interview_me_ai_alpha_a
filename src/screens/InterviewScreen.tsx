import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { RootState, AppDispatch } from '../store';
import { 
  startSession, 
  endSession, 
  updateTimer, 
  setSpeaking, 
  setThinking,
  addTranscriptEntry 
} from '../store/slices/sessionSlice';
import { STTService } from '../services/STTService';
import { TTSService } from '../services/TTSService';
import Avatar from '../components/features/Avatar';

export default function InterviewScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { sessionId, interviewType, role } = route.params as any;
  const { status, timer, transcript, isRecording, isSpeaking, isThinking } = useSelector(
    (state: RootState) => state.session
  );

  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const sttService = useRef(STTService.getInstance());
  const ttsService = useRef(TTSService.getInstance());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeSession();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      sttService.current.destroy();
      ttsService.current.destroy();
    };
  }, []);

  const initializeSession = async () => {
    try {
      // Start the session
      dispatch(startSession({ sessionId, interviewType, role }));
      
      // Initialize services
      await ttsService.current.initialize();
      sttService.current.setDispatch(dispatch);
      
      // Start the interview
      await startInterview();
      
      // Start timer
      startTimer();
    } catch (error) {
      console.error('Session initialization error:', error);
      Alert.alert('Error', 'Failed to start interview session');
    }
  };

  const startInterview = async () => {
    try {
      // Generate initial question using AI
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are InterviewCoach AI. Start a ${interviewType} interview for a ${role} position. Ask the first question.`
            }
          ]
        })
      });

      const data = await response.json();
      const question = data.message;
      
      setCurrentQuestion(question);
      dispatch(addTranscriptEntry({
        timestamp: Date.now(),
        speaker: 'ai',
        text: question
      }));

      // Speak the question
      dispatch(setSpeaking(true));
      await ttsService.current.speak(question);
      dispatch(setSpeaking(false));

      // Start listening for user response
      await sttService.current.startListening();
    } catch (error) {
      console.error('Interview start error:', error);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      dispatch(updateTimer(timer - 1));
    }, 1000);
  };

  const handleEndSession = async () => {
    try {
      await sttService.current.stopListening();
      await ttsService.current.stop();
      dispatch(endSession());
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate('InterviewFlow', { screen: 'Feedback', params: { sessionId } });
    } catch (error) {
      console.error('End session error:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header with Timer */}
      <View className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <View className="flex-row items-center justify-between">
          <Text className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {role} Interview
          </Text>
          <View className="flex-row items-center">
            <Ionicons 
              name="time-outline" 
              size={20} 
              color={isDark ? '#f8fafc' : '#1e293b'} 
            />
            <Text className={`ml-2 font-mono text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {formatTime(timer)}
            </Text>
          </View>
        </View>
      </View>

      {/* Avatar Section */}
      <View className="flex-1 items-center justify-center px-6">
        <Avatar 
          state={isSpeaking ? 'speaking' : isThinking ? 'thinking' : 'listening'}
          visemeStream={[]}
        />
        
        {currentQuestion && (
          <View className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
            <Text className={`text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {currentQuestion}
            </Text>
          </View>
        )}
      </View>

      {/* Transcript */}
      <View className={`px-6 py-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Conversation
        </Text>
        <ScrollView className="max-h-32">
          {transcript.map((entry, index) => (
            <View key={index} className={`mb-2 p-2 rounded ${
              entry.speaker === 'user' 
                ? (isDark ? 'bg-blue-900' : 'bg-blue-100') 
                : (isDark ? 'bg-slate-700' : 'bg-slate-200')
            }`}>
              <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {entry.speaker === 'user' ? 'You' : 'AI Coach'}
              </Text>
              <Text className={`${isDark ? 'text-white' : 'text-slate-900'}`}>
                {entry.text}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Controls */}
      <View className="px-6 py-4">
        <TouchableOpacity
          onPress={handleEndSession}
          className={`py-3 px-6 rounded-lg ${
            isDark ? 'bg-red-600' : 'bg-red-500'
          } shadow-lg`}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="stop" size={20} color="white" />
            <Text className="text-white font-semibold ml-2">
              End Interview
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
