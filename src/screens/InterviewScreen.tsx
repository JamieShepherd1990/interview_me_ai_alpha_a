import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { RootState } from '../store';
import { startSession, endSession, updateTranscript, setListening, setSpeaking, appendTranscript, updateVisemeStream } from '../store/slices/sessionSlice';
import Avatar from '../components/features/Avatar';
import STTService from '../services/STTService';
import TTSService from '../services/TTSService';

export default function InterviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const session = useSelector((state: RootState) => state.session);
  
  // Get role from route parameters
  const selectedRole = (route.params as any)?.role || 'Software Engineer';
  const interviewType = (route.params as any)?.interviewType || '1';
  
  const [timer, setTimer] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Array<{type: string, text: string, timestamp: number}>>([]);

  // Initialize voice recognition
  useEffect(() => {
    initializeVoice();
    requestPermissions();
    
    return () => {
      // Cleanup services
      const sttService = STTService.getInstance();
      const ttsService = TTSService.getInstance();
      sttService.destroy();
      ttsService.destroy();
    };
  }, []);

  const initializeVoice = () => {
    const sttService = STTService.getInstance();
    const ttsService = TTSService.getInstance();
    
    sttService.setDispatch(dispatch);
    sttService.setSelectedRole(selectedRole);
    
    // Set up viseme callback for avatar
    ttsService.setVisemeCallback((visemes) => {
      console.log('Viseme events:', visemes);
      dispatch(updateVisemeStream(visemes));
    });
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Microphone Permission Required',
          'InterviewCoach AI needs microphone access to conduct voice-based interviews. Please enable microphone permissions in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => {
              // You could open settings here if needed
              console.log('User should go to Settings to enable microphone');
            }}
          ]
        );
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      Alert.alert('Permission Error', 'Failed to request microphone permission');
    }
  };

  // Voice handlers are now handled by STTService

  const generateAIResponse = async (userInput: string) => {
    try {
      dispatch(setSpeaking(true));
      
      // Call backend API for real AI response
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://interviewme-lilac.vercel.app';
      console.log('Calling API:', `${apiUrl}/api/chat`);
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-vercel-protection-bypass': process.env.EXPO_PUBLIC_VERCEL_BYPASS_TOKEN || '6ZOXLEs9hp1hPovTicTHrbJcW0yRENmt'
        },
        body: JSON.stringify({
          message: userInput,
          transcript: session.transcript,
          role: 'Software Engineer', // Get from route params
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.response;
        
        // Add AI response to conversation
        setConversationHistory(prev => [...prev, {
          type: 'ai',
          text: aiResponse,
          timestamp: Date.now()
        }]);
        
        // Speak the AI response
        await speakText(aiResponse);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      dispatch(setSpeaking(false));
    }
  };

  const speakText = async (text: string) => {
    try {
      await Speech.speak(text, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.85,
        onDone: () => {
          dispatch(setSpeaking(false));
          // Automatically start listening for next response
          setTimeout(() => {
            startVoiceRecognition();
          }, 1000);
        },
        onError: (error: Error) => {
          console.error('Speech error:', error);
          dispatch(setSpeaking(false));
        },
      });
    } catch (error) {
      console.error('Error speaking text:', error);
      dispatch(setSpeaking(false));
    }
  };

  const startVoiceRecognition = async () => {
    try {
      if (!hasPermission) {
        Alert.alert(
          'Permission Required',
          'Microphone access is required for voice interviews. Please enable microphone permissions in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Request Permission', onPress: requestPermissions }
          ]
        );
        return;
      }
      
      const sttService = STTService.getInstance();
      const success = await sttService.startListening();
      
      if (success) {
        setIsRecording(true);
        dispatch(setListening(true));
        console.log('Voice recognition started successfully');
      } else {
        Alert.alert(
          'Voice Recognition Error', 
          'Failed to start voice recognition. Please check your microphone and try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      Alert.alert(
        'Voice Recognition Error', 
        'An unexpected error occurred. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopVoiceRecognition = async () => {
    try {
      const sttService = STTService.getInstance();
      const success = await sttService.stopListening();
      
      if (success) {
        setIsRecording(false);
        dispatch(setListening(false));
        console.log('Voice recognition stopped successfully');
      }
    } catch (error) {
      console.error('Error stopping voice recognition:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (session.status === 'active') {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartInterview = () => {
    // Reset all state for fresh interview
    dispatch(startSession({ question: "Tell me about yourself and your experience." }));
    setTimer(0);
    setIsRecording(false);
    setCurrentResponse('');
    setConversationHistory([]);
    dispatch(updateTranscript(''));
    dispatch(setListening(false));
    dispatch(setSpeaking(false));
    dispatch(updateVisemeStream([]));
    
    // Stop any existing voice recognition
    const sttService = STTService.getInstance();
    sttService.stopListening();
    
    console.log('Interview started - all state reset');
  };

  const handleEndInterview = () => {
    Alert.alert(
      'End Interview',
      'Are you sure you want to end this interview session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'End', 
          style: 'destructive',
          onPress: () => {
            dispatch(endSession());
            navigation.navigate('Feedback' as any, { sessionId: 'temp-id' } as any);
          }
        }
      ]
    );
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      dispatch(setListening(false));
    } else {
      setIsRecording(true);
      dispatch(setListening(true));
    }
  };

  if (session.status === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Ready to Start?</Text>
          <Text style={styles.subtitle}>Your AI interview coach is ready</Text>
          
          <TouchableOpacity style={styles.startButton} onPress={handleStartInterview}>
            <Text style={styles.buttonText}>Start Interview</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.timer}>{formatTime(timer)}</Text>
        <Text style={styles.status}>
          {session.isSpeaking ? '🎤 AI Speaking' : session.isListening ? '🎙️ Listening' : '⏸️ Ready'}
        </Text>
      </View>

      <View style={styles.avatarContainer}>
        <Avatar 
          state={session.isSpeaking ? 'speaking' : session.isListening ? 'listening' : 'idle'}
          visemeStream={session.visemeStream || []}
        />
        <Text style={styles.avatarLabel}>AI Interview Coach</Text>
        <Text style={styles.roleLabel}>Role: {selectedRole}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>
          {hasPermission ? '✅ Microphone Ready' : '❌ Microphone Permission Required'}
        </Text>
        <Text style={styles.permissionText}>
          Real-time voice conversation active
        </Text>
      </View>

      <View style={styles.transcriptContainer}>
        <Text style={styles.transcriptTitle}>Live Transcript</Text>
        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptText}>
            {session.transcript || 'Start speaking to see your transcript here...'}
          </Text>
        </View>
      </View>

      {conversationHistory.length > 0 && (
        <View style={styles.conversationContainer}>
          <Text style={styles.conversationTitle}>Conversation History</Text>
          <ScrollView style={styles.conversationScroll} nestedScrollEnabled>
            {conversationHistory.slice(-3).map((item, index) => (
              <View key={index} style={styles.conversationItem}>
                <Text style={styles.conversationLabel}>
                  {item.type === 'ai' ? '🤖 AI:' : '👤 You:'}
                </Text>
                <Text style={styles.conversationText}>{item.text}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.voiceButton,
            session.isListening ? styles.listeningButton : styles.recordingButton
          ]}
          onPress={session.isListening ? stopVoiceRecognition : startVoiceRecognition}
        >
          <Text style={styles.controlButtonText}>
            {session.isListening ? 'Stop Listening' : 'Start Listening'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.endButton} onPress={handleEndInterview}>
          <Text style={styles.endButtonText}>End Interview</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  timer: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  status: {
    fontSize: 16,
    color: '#666',
  },
  avatarContainer: {
    alignItems: 'center',
    padding: 40,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 48,
  },
  avatarLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  roleLabel: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 4,
  },
  transcriptContainer: {
    flex: 1,
    padding: 20,
  },
  transcriptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  transcriptBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transcriptText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  controls: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  controlButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#FF3B30',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  endButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  endButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  permissionText: {
    fontSize: 12,
    color: '#666',
  },
  conversationContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  conversationScroll: {
    maxHeight: 150,
  },
  conversationItem: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  conversationLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  conversationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 18,
  },
  voiceButton: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  listeningButton: {
    backgroundColor: '#FF3B30',
  },
});