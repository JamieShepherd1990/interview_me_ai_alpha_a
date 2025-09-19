import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import InterviewScreen from '../screens/InterviewScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import { InterviewStackParamList } from './types';

const Stack = createStackNavigator<InterviewStackParamList>();

export default function InterviewStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="RoleSelection" 
        component={RoleSelectionScreen}
        options={{ title: 'Select Role' }}
      />
      <Stack.Screen 
        name="Interview" 
        component={InterviewScreen}
        options={{ title: 'Interview' }}
      />
      <Stack.Screen 
        name="Feedback" 
        component={FeedbackScreen}
        options={{ title: 'Feedback' }}
      />
    </Stack.Navigator>
  );
}