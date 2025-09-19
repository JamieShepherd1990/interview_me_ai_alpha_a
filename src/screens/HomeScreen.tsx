import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const interviewTemplates = [
  { id: '1', title: 'Software Engineer', role: 'Junior Software Engineer', duration: '15 min' },
  { id: '2', title: 'Data Analyst', role: 'Data Analyst', duration: '15 min' },
  { id: '3', title: 'Product Manager', role: 'Product Manager', duration: '20 min' },
  { id: '4', title: 'Marketing Specialist', role: 'Marketing Specialist', duration: '15 min' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const recentSessions = useSelector((state: RootState) => state.history.sessions.slice(0, 3));

  const handleStartInterview = (type: string) => {
    // Navigate to interview screen with selected type
    navigation.navigate('Interview' as never, { interviewType: type } as never);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to InterviewCoach</Text>
        <Text style={styles.subtitle}>Practice with AI-powered mock interviews</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Start New Interview</Text>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => navigation.navigate('InterviewFlow' as never, { screen: 'RoleSelection' } as never)}
        >
          <Text style={styles.buttonText}>Choose Your Role</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Interview Templates</Text>
        {interviewTemplates.map((template) => (
          <TouchableOpacity 
            key={template.id}
            style={styles.templateCard}
            onPress={() => handleStartInterview(template.role)}
          >
            <View style={styles.templateContent}>
              <Text style={styles.templateTitle}>{template.title}</Text>
              <Text style={styles.templateRole}>{template.role}</Text>
              <Text style={styles.templateDuration}>{template.duration}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {recentSessions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Sessions</Text>
          {recentSessions.map((session) => (
            <TouchableOpacity 
              key={session.id}
              style={styles.sessionCard}
              onPress={() => navigation.navigate('Interview' as never, { sessionId: session.id } as never)}
            >
              <View style={styles.sessionContent}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionScore}>Score: {session.score}/10</Text>
                <Text style={styles.sessionDate}>
                  {new Date(session.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  primaryButton: {
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
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  templateCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  templateContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  templateRole: {
    fontSize: 14,
    color: '#666',
  },
  templateDuration: {
    fontSize: 12,
    color: '#999',
  },
  sessionCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sessionScore: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  sessionDate: {
    fontSize: 12,
    color: '#999',
  },
});