import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { VisemeEvent } from '../../lib/schemas';

interface AvatarProps {
  state: 'idle' | 'speaking' | 'listening' | 'thinking';
  visemeStream?: VisemeEvent[];
}

export default function Avatar({ state, visemeStream = [] }: AvatarProps) {
  const animationRef = useRef<LottieView>(null);

  useEffect(() => {
    if (animationRef.current) {
      switch (state) {
        case 'idle':
          animationRef.current.play(0, 30); // Play idle animation
          break;
        case 'speaking':
          animationRef.current.play(30, 60); // Play speaking animation
          break;
        case 'listening':
          animationRef.current.play(60, 90); // Play listening animation
          break;
        case 'thinking':
          animationRef.current.play(90, 120); // Play thinking animation
          break;
      }
    }
  }, [state]);

  // Handle viseme events for lip-sync
  useEffect(() => {
    if (visemeStream.length > 0 && animationRef.current) {
      // Process all viseme events for smooth lip-sync
      visemeStream.forEach((viseme, index) => {
        setTimeout(() => {
          if (animationRef.current) {
            const frame = mapVisemeToFrame(viseme.phoneme);
            animationRef.current.play(frame, frame + 3);
          }
        }, viseme.timestamp - Date.now());
      });
    }
  }, [visemeStream]);

  const mapVisemeToFrame = (phoneme: string): number => {
    // Map phonemes to animation frames for lip-sync
    const phonemeMap: { [key: string]: number } = {
      'sil': 0,    // Silence - closed mouth
      'ah': 10,    // Open mouth - 'ah' sound
      'eh': 15,    // Slightly open - 'eh' sound
      'oh': 20,    // Round mouth - 'oh' sound
      'oo': 25,    // Very round - 'oo' sound
      'ee': 30,    // Smile - 'ee' sound
      'mm': 35,    // Closed lips - 'mm' sound
      'ff': 40,    // Lower lip to teeth - 'ff' sound
      'ss': 45,    // Narrow opening - 'ss' sound
      'th': 50,    // Tongue between teeth - 'th' sound
    };
    return phonemeMap[phoneme] || 10; // Default to 'ah' if not found
  };

  const getAnimationSource = () => {
    try {
      // Use the available Lottie animation file
      return require('../../assets/animations/avatar-idle.json');
    } catch (error) {
      console.error('Error loading avatar animation:', error);
      // Return a fallback or null
      return null;
    }
  };

  return (
    <View style={styles.container}>
      <LottieView
        ref={animationRef}
        source={getAnimationSource()}
        style={styles.animation}
        loop={state === 'idle'}
        autoPlay={false}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});