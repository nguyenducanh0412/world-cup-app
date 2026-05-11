# KickOff Mobile

React Native mobile application for World Cup 2026 match viewing and friend betting.

## Tech Stack

- **React Native** 0.85.3 (CLI, not Expo)
- **React** 19.2.3
- **TypeScript** 5.8.3
- **Tamagui** - UI design system with dark theme
- **React Navigation** v7 - Routing
- **Reanimated** 3 + **Moti** - Animations
- **React Query** - Server state management
- **Zustand** - Client state management
- **Supabase** - Auth + Realtime
- **Notifee** + **Firebase** - Push notifications

## Prerequisites

- Node.js 22.11.0+
- npm 10+
- Xcode (iOS development)
- Android Studio (Android development)
- Ruby + CocoaPods (iOS)

## Setup

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

> **Note:** The `--legacy-peer-deps` flag is required for React 19 compatibility with some packages.

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in your values in `.env`:
- `API_URL` - Backend API URL
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key

### 3. iOS Setup

```bash
cd ios
pod install
cd ..
npm run ios
```

### 4. Android Setup

```bash
npm run android
```

## Project Structure

```
src/
├── api/              # API client and functions
├── components/ui/    # Reusable UI components
├── hooks/            # Custom React hooks
├── navigation/       # React Navigation setup
├── screens/          # Screen components
├── stores/           # Zustand stores
├── types/            # TypeScript types
│   └── shared.ts     # Shared types with API
└── utils/            # Utility functions
    └── scoring.ts    # Scoring logic
```

## Development

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Lint
npm run lint

# Test
npm run test
```

## Key Features

- 🎨 **Dark Theme** - Custom Tamagui theme with World Cup colors
- ⚡ **Realtime Updates** - Live scores via Supabase Realtime
- 🔔 **Push Notifications** - Match reminders and results
- 🎯 **TypeScript** - Full type safety with strict mode
- 📱 **Native Animations** - Smooth 60fps animations with Reanimated

## Important Notes

- This is a **standalone** React Native project (not a monorepo)
- Shared types are copied from `api/src/types/shared.ts` - keep in sync manually
- Use Tamagui components instead of React Native core components
- All API calls go through React Query - no direct fetch in useEffect
- Use `--legacy-peer-deps` when installing new packages

## Contributing

See [GITHUB_COPILOT_INSTRUCTIONS.md](../GITHUB_COPILOT_INSTRUCTIONS.md) for coding conventions.
