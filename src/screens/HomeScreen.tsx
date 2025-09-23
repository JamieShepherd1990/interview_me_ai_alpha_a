import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '../store';
import { useTheme } from '../theme';
import Database from '../db/database';
import { setSessions } from '../store/slices/historySlice';

const interviewTemplates = [
  {
    id: '1',
    title: 'Software Engineer',
    description: 'Technical and behavioral questions for junior to mid-level positions',
    icon: 'code-working' as keyof typeof Ionicons.glyphMap,
    color: '#3b82f6',
    estimatedTime: '15-20 min',
  },
  {
    id: '2',
    title: 'Data Analyst',
    description: 'Analytics, SQL, and problem-solving focused interview',
    icon: 'analytics' as keyof typeof Ionicons.glyphMap,
    color: '#10b981',
    estimatedTime: '12-18 min',
  },
  {
    id: '3',
    title: 'Product Manager',
    description: 'Strategy, prioritization, and leadership questions',
    icon: 'bulb' as keyof typeof Ionicons.glyphMap,
    color: '#f59e0b',
    estimatedTime: '20-25 min',
  },
  {
    id: '4',
    title: 'UX Designer',
    description: 'Design thinking, user research, and portfolio discussion',
    icon: 'color-palette' as keyof typeof Ionicons.glyphMap,
    color: '#8b5cf6',
    estimatedTime: '15-20 min',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colors, isDark } = useTheme();
  const recentSessions = useSelector((state: RootState) => 
    state.history.sessions.slice(0, 3)
  );
  const settings = useSelector((state: RootState) => state.settings);

  useEffect(() => {
    loadRecentSessions();
  }, []);

  const loadRecentSessions = async () => {
    try {
      const db = Database.getInstance();
      await db.initialize();
      const sessions = await db.getSessions();
      dispatch(setSessions(sessions));
    } catch (error) {
      console.error('Error loading recent sessions:', error);
    }
  };

  const handleStartInterview = async (template: typeof interviewTemplates[0]) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Navigate directly to Interview screen with the selected role
    navigation.navigate('InterviewFlow' as any, {
      screen: 'Interview',
      params: { 
        interviewType: template.id,
        role: template.title
      }
    } as any);
  };

  const handleViewHistory = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Tab navigator will handle this
  };

  const renderWelcomeSection = () => (
    <View style={{
      padding: 20,
      backgroundColor: colors.primary[50],
      borderRadius: 16,
      margin: 16,
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 8,
      }}>
        Welcome back! 👋
      </Text>
      <Text style={{
        fontSize: 16,
        color: colors.text.secondary,
        lineHeight: 24,
      }}>
        Ready to practice your interview skills? Choose a role below to get started with AI-powered mock interviews.
      </Text>
    </View>
  );

  const renderInterviewTemplate = (template: typeof interviewTemplates[0]) => (
    <TouchableOpacity
      key={template.id}
      onPress={() => handleStartInterview(template)}
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: template.color,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: `${template.color}15`,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 16,
        }}>
          <Ionicons
            name={template.icon}
            size={24}
            color={template.color}
          />
        </View>
        
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary,
            marginBottom: 4,
          }}>
            {template.title}
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary,
            marginBottom: 8,
            lineHeight: 20,
          }}>
            {template.description}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="time-outline"
              size={14}
              color={colors.text.secondary}
              style={{ marginRight: 4 }}
            />
            <Text style={{
              fontSize: 12,
              color: colors.text.secondary,
            }}>
              {template.estimatedTime}
            </Text>
          </View>
        </View>
        
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.secondary}
        />
      </View>
    </TouchableOpacity>
  );

  const renderRecentSessions = () => {
    if (recentSessions.length === 0) {
      return (
        <View style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 20,
          margin: 16,
          alignItems: 'center',
        }}>
          <Ionicons
            name="document-text-outline"
            size={48}
            color={colors.text.secondary}
            style={{ marginBottom: 12 }}
          />
          <Text style={{
            fontSize: 16,
            color: colors.text.secondary,
            textAlign: 'center',
          }}>
            No recent interviews yet
          </Text>
          <Text style={{
            fontSize: 14,
            color: colors.text.secondary,
            textAlign: 'center',
            marginTop: 4,
          }}>
            Complete your first interview to see your progress here
          </Text>
        </View>
      );
    }

    return (
      <View style={{ marginHorizontal: 16 }}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}>
          <Text style={{
            fontSize: 18,
            fontWeight: '600',
            color: colors.text.primary,
          }}>
            Recent Sessions
          </Text>
          <TouchableOpacity onPress={handleViewHistory}>
            <Text style={{
              fontSize: 14,
              color: colors.primary[600],
              fontWeight: '500',
            }}>
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        {recentSessions.map((session) => (
          <TouchableOpacity
            key={session.id}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 8,
              padding: 12,
              marginBottom: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.primary[100],
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}>
              <Text style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: colors.primary[600],
              }}>
                {session.score.toFixed(1)}
              </Text>
            </View>
            
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '500',
                color: colors.text.primary,
              }}>
                {session.role}
              </Text>
              <Text style={{
                fontSize: 12,
                color: colors.text.secondary,
              }}>
                {new Date(session.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ 
      flex: 1, 
      backgroundColor: colors.background 
    }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeSection()}
        
        <View style={{ marginTop: 8 }}>
          <Text style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: colors.text.primary,
            marginHorizontal: 16,
            marginBottom: 16,
          }}>
            Choose Interview Type
          </Text>
          {interviewTemplates.map(renderInterviewTemplate)}
        </View>
        
        <View style={{ marginTop: 24 }}>
          {renderRecentSessions()}
        </View>
        
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}