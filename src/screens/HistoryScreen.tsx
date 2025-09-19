import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function HistoryScreen() {
  const sessions = useSelector((state: RootState) => state.history.sessions);

  const mockSessions = [
    {
      id: '1',
      title: 'Software Engineer Interview',
      role: 'Junior Software Engineer',
      score: 8.5,
      duration: 15,
      createdAt: Date.now() - 86400000, // 1 day ago
    },
    {
      id: '2',
      title: 'Data Analyst Interview',
      role: 'Data Analyst',
      score: 7.2,
      duration: 12,
      createdAt: Date.now() - 172800000, // 2 days ago
    },
    {
      id: '3',
      title: 'Product Manager Interview',
      role: 'Product Manager',
      score: 9.1,
      duration: 18,
      createdAt: Date.now() - 259200000, // 3 days ago
    },
  ];

  const displaySessions = sessions.length > 0 ? sessions : mockSessions;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    return `${minutes} min`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return '#34C759';
    if (score >= 6) return '#FF9500';
    return '#FF3B30';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Interview History</Text>
        <Text style={styles.subtitle}>Track your progress over time</Text>
      </View>

      {displaySessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No interviews yet</Text>
          <Text style={styles.emptySubtitle}>
            Start your first interview to see your history here
          </Text>
        </View>
      ) : (
        <View style={styles.sessionsList}>
          {displaySessions.map((session) => (
            <TouchableOpacity key={session.id} style={styles.sessionCard}>
              <View style={styles.sessionHeader}>
                <Text style={styles.sessionTitle}>{session.title}</Text>
                <Text style={styles.sessionDate}>{formatDate(session.createdAt)}</Text>
              </View>
              
              <View style={styles.sessionDetails}>
                <Text style={styles.sessionRole}>{session.role}</Text>
                <Text style={styles.sessionDuration}>{formatDuration(session.duration)}</Text>
              </View>
              
              <View style={styles.sessionScore}>
                <Text style={styles.scoreLabel}>Score</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(session.score) }]}>
                  {session.score}/10
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sessionsList: {
    padding: 20,
  },
  sessionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    color: '#666',
  },
  sessionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sessionRole: {
    fontSize: 14,
    color: '#666',
  },
  sessionDuration: {
    fontSize: 14,
    color: '#666',
  },
  sessionScore: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});