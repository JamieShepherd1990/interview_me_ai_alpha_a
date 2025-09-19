import React, { useEffect, useRef } from 'react';
import { View, Dimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

interface ConfettiCelebrationProps {
  show: boolean;
  onComplete?: () => void;
  score?: number;
}

export default function ConfettiCelebration({ 
  show, 
  onComplete, 
  score = 8 
}: ConfettiCelebrationProps) {
  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (show && score >= 8) {
      triggerCelebration();
    }
  }, [show, score]);

  const triggerCelebration = async () => {
    try {
      // Haptic feedback for celebration
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      
      // Start confetti
      confettiRef.current?.start();
      
      // Additional haptic feedback after a short delay
      setTimeout(async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 500);

      // Auto-complete after animation
      setTimeout(() => {
        onComplete?.();
      }, 3000);

    } catch (error) {
      console.error('Error triggering celebration:', error);
      onComplete?.();
    }
  };

  if (!show || score < 8) {
    return null;
  }

  return (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    >
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: width / 2, y: -10 }}
        fadeOut={true}
        explosionSpeed={350}
        fallSpeed={2500}
        colors={[
          '#3b82f6', // Primary blue
          '#10b981', // Success green
          '#f59e0b', // Warning yellow
          '#ef4444', // Error red
          '#8b5cf6', // Purple
          '#06b6d4', // Cyan
          '#f97316', // Orange
        ]}
        autoStart={false}
        onAnimationEnd={onComplete}
      />
    </View>
  );
}
