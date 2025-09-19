import React from 'react';
import { View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackCardProps {
  title: string;
  items: string[];
  type: 'strengths' | 'improvements' | 'learnings';
  className?: string;
}

export default function FeedbackCard({ title, items, type, className = '' }: FeedbackCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getTypeStyles = () => {
    switch (type) {
      case 'strengths':
        return {
          container: isDark ? 'bg-green-900' : 'bg-green-100',
          text: isDark ? 'text-green-300' : 'text-green-700',
          icon: 'checkmark-circle' as const,
          iconColor: isDark ? '#10b981' : '#059669'
        };
      case 'improvements':
        return {
          container: isDark ? 'bg-yellow-900' : 'bg-yellow-100',
          text: isDark ? 'text-yellow-300' : 'text-yellow-700',
          icon: 'trending-up' as const,
          iconColor: isDark ? '#f59e0b' : '#d97706'
        };
      case 'learnings':
        return {
          container: isDark ? 'bg-blue-900' : 'bg-blue-100',
          text: isDark ? 'text-blue-300' : 'text-blue-700',
          icon: 'bulb' as const,
          iconColor: isDark ? '#3b82f6' : '#2563eb'
        };
      default:
        return {
          container: isDark ? 'bg-slate-800' : 'bg-slate-100',
          text: isDark ? 'text-slate-300' : 'text-slate-700',
          icon: 'information-circle' as const,
          iconColor: isDark ? '#64748b' : '#475569'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <View className={`p-4 rounded-lg ${styles.container} ${className}`}>
      <View className="flex-row items-center mb-3">
        <Ionicons 
          name={styles.icon} 
          size={20} 
          color={styles.iconColor} 
        />
        <Text className={`ml-2 text-lg font-semibold ${styles.text}`}>
          {title}
        </Text>
      </View>
      
      {items.map((item, index) => (
        <View key={index} className="flex-row items-start mb-2">
          <Text className={`text-sm mr-2 ${styles.text}`}>•</Text>
          <Text className={`flex-1 text-sm ${styles.text}`}>
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}
