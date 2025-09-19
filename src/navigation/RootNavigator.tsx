import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useColorScheme } from 'nativewind';

import { RootStackParamList } from './types';
import TabNavigator from './TabNavigator';
import InterviewStackNavigator from './InterviewStackNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
        },
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="InterviewFlow" 
        component={InterviewStackNavigator}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
