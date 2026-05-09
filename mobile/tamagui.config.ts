import { config as defaultConfig } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

const customConfig = createTamagui({
  ...defaultConfig,
  tokens: {
    ...defaultConfig.tokens,
    color: {
      ...defaultConfig.tokens.color,
      // Custom color tokens for KickOff
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
  themes: {
    ...defaultConfig.themes,
    // Dark theme as default
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
})

export type AppConfig = typeof customConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default customConfig
