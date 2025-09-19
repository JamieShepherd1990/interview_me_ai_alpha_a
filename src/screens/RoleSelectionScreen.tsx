import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { INTERVIEW_TEMPLATES } from '../lib/prompts';

export default function RoleSelectionScreen() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleStartInterview = async () => {
    if (!selectedTemplate) {
      Alert.alert('Selection Required', 'Please select an interview type to continue.');
      return;
    }

    try {
      const template = INTERVIEW_TEMPLATES.find(t => t.id === selectedTemplate);
      if (!template) return;

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      navigation.navigate('InterviewFlow', {
        screen: 'Interview',
        params: {
          sessionId,
          interviewType: template.category,
          role: template.title.split(' ')[template.title.split(' ').length - 1] // Extract role from title
        }
      });
    } catch (error) {
      console.error('Start interview error:', error);
      Alert.alert('Error', 'Failed to start interview session');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'entry': return isDark ? 'bg-green-900' : 'bg-green-100';
      case 'mid': return isDark ? 'bg-yellow-900' : 'bg-yellow-100';
      case 'senior': return isDark ? 'bg-red-900' : 'bg-red-100';
      default: return isDark ? 'bg-slate-800' : 'bg-slate-100';
    }
  };

  const getDifficultyTextColor = (difficulty: string) => {
    switch (difficulty) {
      case 'entry': return isDark ? 'text-green-300' : 'text-green-700';
      case 'mid': return isDark ? 'text-yellow-300' : 'text-yellow-700';
      case 'senior': return isDark ? 'text-red-300' : 'text-red-700';
      default: return isDark ? 'text-slate-300' : 'text-slate-700';
    }
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header */}
      <View className={`px-6 py-6 ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
        <Text className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
          Choose Your Interview
        </Text>
        <Text className={`text-base ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Select the type of interview you'd like to practice
        </Text>
      </View>

      {/* Interview Templates */}
      <View className="px-6 py-4">
        {INTERVIEW_TEMPLATES.map((template) => (
          <TouchableOpacity
            key={template.id}
            onPress={() => setSelectedTemplate(template.id)}
            className={`p-4 rounded-lg mb-3 border-2 ${
              selectedTemplate === template.id
                ? (isDark ? 'border-blue-500 bg-blue-900' : 'border-blue-500 bg-blue-50')
                : (isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-white')
            }`}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {template.title}
                </Text>
                <Text className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {template.description}
                </Text>
                
                <View className="flex-row items-center mt-3">
                  <View className={`px-2 py-1 rounded ${getDifficultyColor(template.difficulty)}`}>
                    <Text className={`text-xs font-medium ${getDifficultyTextColor(template.difficulty)}`}>
                      {template.difficulty.toUpperCase()}
                    </Text>
                  </View>
                  <Text className={`ml-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {template.estimatedDuration} minutes
                  </Text>
                </View>
              </View>
              
              {selectedTemplate === template.id && (
                <Ionicons name="checkmark-circle" size={24} color={isDark ? '#3b82f6' : '#2563eb'} />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Start Button */}
      <View className="px-6 py-6">
        <TouchableOpacity
          onPress={handleStartInterview}
          disabled={!selectedTemplate}
          className={`py-4 px-6 rounded-xl ${
            selectedTemplate
              ? (isDark ? 'bg-blue-600' : 'bg-blue-500')
              : (isDark ? 'bg-slate-600' : 'bg-slate-300')
          } shadow-lg`}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="play" size={24} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Start Interview
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
