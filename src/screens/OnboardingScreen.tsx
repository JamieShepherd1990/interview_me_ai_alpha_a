import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { Audio } from 'expo-av';
import HapticsService from '../services/HapticsService';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { setMicrophonePermission } from '../store/slices/settingsSlice';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  action?: () => Promise<void>;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to InterviewCoach AI',
    description: 'Your personal AI-powered interview coach. Practice with confidence and get real-time feedback.',
    icon: 'school-outline',
  },
  {
    id: '2',
    title: 'Voice-Based Interviews',
    description: 'Experience natural conversations with our AI interviewer. Just speak naturally - we handle the rest.',
    icon: 'mic-outline',
  },
  {
    id: '3',
    title: 'Detailed Feedback',
    description: 'Get comprehensive analysis of your performance with actionable insights to improve.',
    icon: 'analytics-outline',
  },
  {
    id: '4',
    title: 'Microphone Permission',
    description: 'We need access to your microphone to conduct voice-based interviews.',
    icon: 'mic-circle-outline',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const requestMicrophonePermission = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      
      setPermissionGranted(granted);
      dispatch(setMicrophonePermission(granted));
      
      if (granted) {
        const haptics = HapticsService.getInstance();
        await haptics.notificationAsync('Success');
      } else {
        Alert.alert(
          'Permission Required',
          'Microphone access is essential for voice interviews. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      Alert.alert('Error', 'Failed to request microphone permission');
    }
  };

  const handleNext = async () => {
    const haptics = HapticsService.getInstance();
    await haptics.impactAsync('Light');
    
    if (currentSlide === slides.length - 1) {
      if (!permissionGranted) {
        await requestMicrophonePermission();
        return;
      }
      // Navigate to main app
      navigation.navigate('Main' as any);
      return;
    }

    const nextSlide = currentSlide + 1;
    setCurrentSlide(nextSlide);
    
    scrollViewRef.current?.scrollTo({
      x: nextSlide * width,
      animated: true,
    });
  };

  const handleSkip = async () => {
    const haptics = HapticsService.getInstance();
    await haptics.impactAsync('Light');
    navigation.navigate('Main' as never);
  };

  const renderSlide = (slide: OnboardingSlide, index: number) => (
    <View
      key={slide.id}
      style={{
        width,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: colors.background,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: colors.primary[100],
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 40,
        }}
      >
        <Ionicons
          name={slide.icon}
          size={60}
          color={colors.primary[600]}
        />
      </View>
      
      <Text
        style={{
          fontSize: 28,
          fontWeight: 'bold',
          color: colors.text.primary,
          textAlign: 'center',
          marginBottom: 16,
        }}
      >
        {slide.title}
      </Text>
      
      <Text
        style={{
          fontSize: 16,
          color: colors.text.secondary,
          textAlign: 'center',
          lineHeight: 24,
          marginBottom: 40,
        }}
      >
        {slide.description}
      </Text>

      {index === slides.length - 1 && (
        <TouchableOpacity
          onPress={requestMicrophonePermission}
          style={{
            backgroundColor: permissionGranted ? colors.success : colors.primary[600],
            paddingHorizontal: 32,
            paddingVertical: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name={permissionGranted ? 'checkmark-circle' : 'mic'}
              size={20}
              color="#ffffff"
              style={{ marginRight: 8 }}
            />
            <Text
              style={{
                color: '#ffffff',
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              {permissionGranted ? 'Permission Granted' : 'Enable Microphone'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={{ flex: 1 }}
      >
        {slides.map(renderSlide)}
      </ScrollView>

      {/* Indicators */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 20,
        }}
      >
        {slides.map((_, index) => (
          <View
            key={index}
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor:
                index === currentSlide ? colors.primary[600] : colors.border,
              marginHorizontal: 4,
            }}
          />
        ))}
      </View>

      {/* Navigation */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingBottom: 40,
        }}
      >
        <TouchableOpacity onPress={handleSkip}>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: 16,
              fontWeight: '500',
            }}
          >
            Skip
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: colors.primary[600],
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 25,
            minWidth: 100,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#ffffff',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            {currentSlide === slides.length - 1
              ? permissionGranted
                ? 'Get Started'
                : 'Next'
              : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
