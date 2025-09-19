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
      const latestViseme = visemeStream[visemeStream.length - 1];
      // Map viseme to specific animation frame for lip-sync
      const frame = mapVisemeToFrame(latestViseme.phoneme);
      animationRef.current.play(frame, frame + 5);
    }
  }, [visemeStream]);

  const mapVisemeToFrame = (phoneme: string): number => {
    // Map phonemes to animation frames for lip-sync
    const phonemeMap: { [key: string]: number } = {
      'sil': 0,
      'ah': 10,
      'eh': 15,
      'oh': 20,
      'oo': 25,
      'ee': 30,
      'mm': 35,
      'ff': 40,
      'ss': 45,
      'th': 50,
    };
    return phonemeMap[phoneme] || 0;
  };

  const getAnimationSource = () => {
    // For now, we'll use a placeholder
    // In a real implementation, you'd have different Lottie files for each state
    return require('../../assets/animations/avatar-idle.json');
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