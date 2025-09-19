import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

import { INTERVIEW_TEMPLATES } from '../lib/prompts';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleStartInterview = () => {
    navigation.navigate('InterviewFlow', { screen: 'RoleSelection' });
  };

  return (
    <ScrollView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Header */}
      <View className={`px-6 py-8 ${isDark ? 'bg-slate-800' : 'bg-blue-50'}`}>
        <Text className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
          Welcome to Interview Coach
        </Text>
        <Text className={`text-lg ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Practice your interview skills with AI-powered coaching
        </Text>
      </View>

      {/* Start Interview Button */}
      <View className="px-6 py-6">
        <TouchableOpacity
          onPress={handleStartInterview}
          className={`py-4 px-6 rounded-xl ${
            isDark ? 'bg-blue-600' : 'bg-blue-500'
          } shadow-lg`}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="mic" size={24} color="white" />
            <Text className="text-white text-lg font-semibold ml-2">
              Start New Interview
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Interview Templates */}
      <View className="px-6 py-4">
        <Text className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Interview Templates
        </Text>
        {INTERVIEW_TEMPLATES.map((template) => (
          <TouchableOpacity
            key={template.id}
            onPress={() => navigation.navigate('InterviewFlow', { 
              screen: 'RoleSelection',
              params: { templateId: template.id }
            })}
            className={`p-4 rounded-lg mb-3 ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
            } border`}
          >
            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {template.title}
            </Text>
            <Text className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {template.description}
            </Text>
            <View className="flex-row items-center mt-2">
              <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {template.estimatedDuration} min • {template.difficulty}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Sessions */}
      <View className="px-6 py-4">
        <Text className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Recent Sessions
        </Text>
        <View className={`p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
          <Text className={`text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            No recent sessions yet. Start your first interview!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
