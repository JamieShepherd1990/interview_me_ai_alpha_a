import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'nativewind';

import { InterviewStackParamList } from './types';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import InterviewScreen from '../screens/InterviewScreen';
import FeedbackScreen from '../screens/FeedbackScreen';

const Stack = createStackNavigator<InterviewStackParamList>();

export default function InterviewStackNavigator() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff',
          borderBottomColor: isDark ? '#334155' : '#e2e8f0',
        },
        headerTintColor: isDark ? '#f8fafc' : '#1e293b',
        headerTitleStyle: {
          fontWeight: '600',
        },
        cardStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
        },
      }}
    >
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{
          title: 'Select Interview Type',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen
        name="Interview"
        component={InterviewScreen}
        options={{
          title: 'Interview Session',
          headerLeft: () => null, // Prevent going back during interview
          gestureEnabled: false, // Disable swipe back
        }}
      />
      <Stack.Screen
        name="Feedback"
        component={FeedbackScreen}
        options={{
          title: 'Interview Feedback',
          headerLeft: () => null, // Prevent going back
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}
