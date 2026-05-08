import { createTamagui } from 'tamagui';
import { config as defaultConfig } from '@tamagui/config/v3';

const config = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    dark: {
      ...defaultConfig.themes.dark,
      background: '#0D0D0D',
      backgroundStrong: '#000000',
      backgroundSoft: '#1C1C1E',
      card: '#252528',
      border: '#2C2C2E',
      accent: '#E8593C',
      accentLight: '#FF7A5C',
      green: '#30D158',
      yellow: '#FFD60A',
      muted: '#636366',
      mutedLight: '#8E8E93',
      textPrimary: '#FFFFFF',
      textSecondary: '#AEAEB2',
    },
  },
  tokens: {
    ...defaultConfig.tokens,
    color: {
      ...defaultConfig.tokens.color,
      background: '#0D0D0D',
      backgroundStrong: '#000000',
      backgroundSoft: '#1C1C1E',
      card: '#252528',
      border: '#2C2C2E',
      accent: '#E8593C',
      accentLight: '#FF7A5C',
      green: '#30D158',
      yellow: '#FFD60A',
      muted: '#636366',
      mutedLight: '#8E8E93',
      textPrimary: '#FFFFFF',
      textSecondary: '#AEAEB2',
    },
  },
});

export type AppConfig = typeof config;

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
