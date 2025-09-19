import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './TabNavigator';
import InterviewStackNavigator from './InterviewStackNavigator';
import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen 
        name="InterviewFlow" 
        component={InterviewStackNavigator}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}