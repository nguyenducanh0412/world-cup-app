import { config } from '@tamagui/config/v3'
import { createTamagui } from 'tamagui'

const appConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    dark: {
      ...config.themes.dark,
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
  defaultTheme: 'dark',
})

export type AppConfig = typeof appConfig

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default appConfig
