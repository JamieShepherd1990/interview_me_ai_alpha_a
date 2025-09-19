import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

import { RootState, AppDispatch } from '../store';
import { setSessions, setSearchQuery, setSortBy, setSortOrder } from '../store/slices/historySlice';

export default function HistoryScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { sessions, searchQuery, sortBy, sortOrder } = useSelector((state: RootState) => state.history);
  const [localSearchQuery, setLocalSearchQuery] = useState('');

  useEffect(() => {
    // Load sessions from storage (implement with SQLite later)
    // For now, use mock data
    const mockSessions = [
      {
        id: 'session_1',
        timestamp: Date.now() - 86400000, // 1 day ago
        interviewType: 'behavioral',
        role: 'Software Engineer',
        duration: 900,
        score: 8.5,
        transcript: [],
        feedback: {
          strengths: ['Clear communication', 'Good examples', 'Confident delivery'],
          improvements: ['More specific details', 'Better structure'],
          learnings: ['Practice STAR method', 'Prepare more examples']
        },
        isSaved: true
      }
    ];
    dispatch(setSessions(mockSessions));
  }, []);

  const handleSearch = (query: string) => {
    setLocalSearchQuery(query);
    dispatch(setSearchQuery(query));
  };

  const handleSort = (newSortBy: 'date' | 'score' | 'duration') => {
    if (sortBy === newSortBy) {
      dispatch(setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'));
    } else {
      dispatch(setSortBy(newSortBy));
      dispatch(setSortOrder('desc'));
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return isDark ? 'text-green-400' : 'text-green-600';
    if (score >= 6) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredSessions = sessions.filter(session => 
    session.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.interviewType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
      {/* Search Bar */}
      <View className={`px-6 py-4 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
        <View className={`flex-row items-center px-4 py-3 rounded-lg ${
          isDark ? 'bg-slate-800' : 'bg-slate-100'
        }`}>
          <Ionicons 
            name="search" 
            size={20} 
            color={isDark ? '#94a3b8' : '#64748b'} 
          />
          <TextInput
            value={localSearchQuery}
            onChangeText={handleSearch}
            placeholder="Search sessions..."
            placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
            className={`flex-1 ml-3 text-base ${isDark ? 'text-white' : 'text-slate-900'}`}
          />
        </View>
      </View>

      {/* Sort Options */}
      <View className="px-6 py-3">
        <View className="flex-row space-x-2">
          {[
            { key: 'date', label: 'Date' },
            { key: 'score', label: 'Score' },
            { key: 'duration', label: 'Duration' }
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => handleSort(key as any)}
              className={`px-3 py-2 rounded-lg ${
                sortBy === key
                  ? (isDark ? 'bg-blue-600' : 'bg-blue-500')
                  : (isDark ? 'bg-slate-700' : 'bg-slate-200')
              }`}
            >
              <View className="flex-row items-center">
                <Text className={`text-sm font-medium ${
                  sortBy === key ? 'text-white' : (isDark ? 'text-slate-300' : 'text-slate-700')
                }`}>
                  {label}
                </Text>
                {sortBy === key && (
                  <Ionicons 
                    name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color="white" 
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Sessions List */}
      <ScrollView className="flex-1">
        {filteredSessions.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Ionicons 
              name="time-outline" 
              size={64} 
              color={isDark ? '#64748b' : '#94a3b8'} 
            />
            <Text className={`text-lg font-semibold mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              No sessions found
            </Text>
            <Text className={`text-center mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {searchQuery ? 'Try adjusting your search terms' : 'Start your first interview to see your history here'}
            </Text>
          </View>
        ) : (
          <View className="px-6 py-4">
            {filteredSessions.map((session) => (
              <TouchableOpacity
                key={session.id}
                onPress={() => navigation.navigate('SessionDetail', { sessionId: session.id })}
                className={`p-4 rounded-lg mb-3 ${
                  isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                } border`}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {session.role}
                    </Text>
                    <Text className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {session.interviewType} • {formatDuration(session.duration)}
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {formatDate(session.timestamp)}
                    </Text>
                  </View>
                  
                  <View className="items-end">
                    <Text className={`text-2xl font-bold ${getScoreColor(session.score || 0)}`}>
                      {session.score?.toFixed(1) || 'N/A'}
                    </Text>
                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      /10
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
