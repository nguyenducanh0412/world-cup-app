# KickOff — World Cup 2026 Prediction App

A React Native mobile app with Node.js backend for predicting World Cup 2026 match results and competing with friends.

## Project Structure

```
kickoff/
├── apps/
│   ├── mobile/          # React Native 0.74 CLI app
│   └── api/             # Node.js + Fastify + Prisma API
├── packages/
│   └── shared/          # Shared TypeScript types and logic
└── package.json         # Root workspace config
```

## Tech Stack

### Mobile
- React Native 0.74 CLI (no Expo)
- TypeScript
- Tamagui UI
- React Navigation v7
- React Query
- Zustand
- Reanimated 3 + Moti
- Supabase client

### API
- Node.js + Fastify
- Prisma + PostgreSQL
- Supabase Auth
- football-data.org API
- Firebase Cloud Messaging

### Shared
- TypeScript types
- Scoring logic

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Supabase account
- football-data.org API key
- React Native development environment (Android Studio / Xcode)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
# API
cp apps/api/.env.example apps/api/.env
# Fill in your values

# Mobile
cp apps/mobile/.env.example apps/mobile/.env
# Fill in your values
```

3. Setup database:
```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

4. Install iOS dependencies (macOS only):
```bash
cd apps/mobile/ios
pod install
```

### Development

Start the API server:
```bash
cd apps/api
npm run dev
```

Start the mobile app:
```bash
cd apps/mobile

# iOS
npm run ios

# Android
npm run android
```

## Manual Setup Required

After scaffolding, you need to:

1. **iOS**: Run `pod install` in `apps/mobile/ios`
2. **Environment Variables**: Fill in `.env` files with actual values
3. **Database**: Set up PostgreSQL and run migrations
4. **Supabase**: Create project and configure auth
5. **Firebase**: Set up project for push notifications
6. **football-data.org**: Get API key

## License

MIT
