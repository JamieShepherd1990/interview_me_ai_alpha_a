import { useColorScheme } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { colors, ColorScheme } from './colors';

export const useTheme = () => {
  const systemColorScheme = useColorScheme();
  const themePreference = useSelector((state: RootState) => state.settings.theme);
  
  const getColorScheme = (): ColorScheme => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themePreference;
  };

  const colorScheme = getColorScheme();
  const themeColors = colors[colorScheme];

  return {
    colors: themeColors,
    isDark: colorScheme === 'dark',
    colorScheme,
  };
};

export * from './colors';
