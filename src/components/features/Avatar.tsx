import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { VisemeEvent } from '../../lib/schemas';

interface AvatarProps {
  state: 'idle' | 'speaking' | 'listening' | 'thinking';
  visemeStream: VisemeEvent[];
}

export default function Avatar({ state, visemeStream }: AvatarProps) {
  const lottieRef = useRef<LottieView>(null);

  useEffect(() => {
    // Handle different avatar states
    switch (state) {
      case 'idle':
        lottieRef.current?.play(0, 30); // Idle animation
        break;
      case 'speaking':
        lottieRef.current?.play(30, 60); // Speaking animation
        break;
      case 'listening':
        lottieRef.current?.play(60, 90); // Listening animation
        break;
      case 'thinking':
        lottieRef.current?.play(90, 120); // Thinking animation
        break;
    }
  }, [state]);

  useEffect(() => {
    // Handle viseme events for lip-sync
    if (visemeStream.length > 0 && state === 'speaking') {
      const latestViseme = visemeStream[visemeStream.length - 1];
      // Map viseme to Lottie frame/marker
      const frame = mapVisemeToFrame(latestViseme.viseme);
      lottieRef.current?.play(frame, frame + 5);
    }
  }, [visemeStream, state]);

  const mapVisemeToFrame = (viseme: string): number => {
    // Map ElevenLabs visemes to Lottie animation frames
    const visemeMap: { [key: string]: number } = {
      'sil': 0,    // Silence
      'PP': 10,    // P, B, M
      'FF': 20,    // F, V
      'TH': 30,    // Th
      'DD': 40,    // D, T, N
      'kk': 50,    // K, G
      'CH': 60,    // Ch, J
      'SS': 70,    // S, Z
      'nn': 80,    // N, L
      'RR': 90,    // R
      'aa': 100,   // A
      'E': 110,    // E
      'I': 120,    // I
      'O': 130,    // O
      'U': 140,    // U
    };
    return visemeMap[viseme] || 0;
  };

  return (
    <View className="w-48 h-48 items-center justify-center">
      <LottieView
        ref={lottieRef}
        source={require('../../assets/lottie/avatar.json')} // You'll need to add this Lottie file
        style={{ width: 192, height: 192 }}
        loop={false}
        autoPlay={false}
      />
    </View>
  );
}
