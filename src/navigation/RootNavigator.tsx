import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TabNavigator from './TabNavigator';
import InterviewStackNavigator from './InterviewStackNavigator';
import OnboardingScreen from '../screens/OnboardingScreen';
import { RootStackParamList } from './types';
import { RootState } from '../store';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const microphonePermission = useSelector((state: RootState) => 
    state.settings.microphonePermission
  );

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('hasLaunched', 'true');
      } else {
        setIsFirstLaunch(false);
      }
    } catch (error) {
      console.error('Error checking first launch:', error);
      setIsFirstLaunch(false);
    }
  };

  if (isFirstLaunch === null) {
    // Loading state - could show a splash screen here
    return null;
  }

  const shouldShowOnboarding = isFirstLaunch || !microphonePermission;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={shouldShowOnboarding ? 'Onboarding' : 'Main'}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
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