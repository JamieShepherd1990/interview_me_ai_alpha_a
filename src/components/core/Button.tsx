import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  icon,
  className = ''
}: ButtonProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const getVariantStyles = () => {
    if (disabled) {
      return isDark ? 'bg-slate-600' : 'bg-slate-300';
    }
    
    switch (variant) {
      case 'primary':
        return isDark ? 'bg-blue-600' : 'bg-blue-500';
      case 'secondary':
        return isDark ? 'bg-slate-700' : 'bg-slate-200';
      case 'danger':
        return isDark ? 'bg-red-600' : 'bg-red-500';
      default:
        return isDark ? 'bg-blue-600' : 'bg-blue-500';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return 'py-2 px-4';
      case 'large':
        return 'py-4 px-8';
      default:
        return 'py-3 px-6';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        { borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
        className
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        {icon && (
          <Ionicons 
            name={icon} 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
            color="white" 
            style={{ marginRight: 8 }}
          />
        )}
        <Text style={{ fontWeight: '600', color: 'white', fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16 }}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
