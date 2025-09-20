import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Audio } from 'expo-av';
import { RootState } from '../../store';
import { setListening, setSpeaking } from '../../store/slices/sessionSlice';
import STTService from '../../services/STTService';
import TTSService from '../../services/TTSService';

export default function VoiceHandler() {
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.session);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Initialize services
    const sttService = STTService.getInstance();
    const ttsService = TTSService.getInstance();
    
    sttService.setDispatch(dispatch);
    
    // Set up viseme callback for avatar
    ttsService.setVisemeCallback((visemes) => {
      // Handle viseme events for lip-sync
      console.log('Viseme events:', visemes);
    });

    return () => {
      sttService.destroy();
      ttsService.destroy();
    };
  }, [dispatch]);

  const requestMicrophonePermission = async () => {
    try {
      // Request microphone permission
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      return false;
    }
  };

  const handleStartRecording = async () => {
    if (!hasPermission) {
      const granted = await requestMicrophonePermission();
      if (!granted) {
        alert('Microphone permission is required for voice interviews');
        return;
      }
    }

    const sttService = STTService.getInstance();
    const success = await sttService.startListening();
    
    if (success) {
      setIsRecording(true);
      dispatch(setListening(true));
    } else {
      alert('Failed to start voice recognition');
    }
  };

  const handleStopRecording = async () => {
    const sttService = STTService.getInstance();
    const success = await sttService.stopListening();
    
    if (success) {
      setIsRecording(false);
      dispatch(setListening(false));
    }
  };

  const handlePlayResponse = async (text: string) => {
    try {
      dispatch(setSpeaking(true));
      
      // In a real implementation, you'd call the TTS API here
      // For now, we'll just simulate the response
      setTimeout(() => {
        dispatch(setSpeaking(false));
      }, 2000);
    } catch (error) {
      console.error('Error playing response:', error);
      dispatch(setSpeaking(false));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {session.isListening ? '🎙️ Listening...' : '⏸️ Not Listening'}
        </Text>
        <Text style={styles.permissionText}>
          {hasPermission ? 'Microphone access granted' : 'Microphone permission required'}
        </Text>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            isRecording ? styles.recordingButton : styles.silentButton
          ]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
        >
          <Text style={styles.controlButtonText}>
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  permissionText: {
    fontSize: 14,
    color: '#666',
  },
  controls: {
    alignItems: 'center',
  },
  controlButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  silentButton: {
    backgroundColor: '#34C759',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
