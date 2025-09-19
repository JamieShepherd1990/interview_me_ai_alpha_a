import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function FeedbackScreen() {
  const navigation = useNavigation();
  const session = useSelector((state: RootState) => state.session);

  const handleSaveAndExit = () => {
    // Save session to history
    navigation.navigate('Main' as never);
  };

  const handleDiscard = () => {
    navigation.navigate('Main' as never);
  };

  const feedback = session.feedback || {
    score: 8.5,
    strengths: [
      'Clear communication and professional demeanor',
      'Good use of specific examples in responses',
      'Strong understanding of the role requirements'
    ],
    improvements: [
      'Practice the STAR method for behavioral questions',
      'Prepare more specific examples for common questions',
      'Work on reducing filler words and pauses'
    ],
    learnings: [
      'Interview preparation is key to success',
      'Specific examples make responses more compelling',
      'Practice builds confidence and reduces nervousness'
    ]
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Interview Complete!</Text>
        <Text style={styles.subtitle}>Here's your performance feedback</Text>
      </View>

      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Overall Score</Text>
        <Text style={styles.scoreValue}>{feedback.score}/10</Text>
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreFill, 
              { width: `${(feedback.score / 10) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Strengths</Text>
        {feedback.strengths.map((strength, index) => (
          <View key={index} style={styles.feedbackItem}>
            <Text style={styles.feedbackText}>• {strength}</Text>
          </View>
        ))}
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Areas for Improvement</Text>
        {feedback.improvements.map((improvement, index) => (
          <View key={index} style={styles.feedbackItem}>
            <Text style={styles.feedbackText}>• {improvement}</Text>
          </View>
        ))}
      </View>

      <View style={styles.feedbackSection}>
        <Text style={styles.sectionTitle}>Key Learnings</Text>
        {feedback.learnings.map((learning, index) => (
          <View key={index} style={styles.feedbackItem}>
            <Text style={styles.feedbackText}>• {learning}</Text>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveAndExit}>
          <Text style={styles.saveButtonText}>Save & Exit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.discardButton} onPress={handleDiscard}>
          <Text style={styles.discardButtonText}>Discard</Text>
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
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scoreContainer: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 15,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  feedbackSection: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  feedbackItem: {
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  discardButton: {
    flex: 1,
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  discardButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});