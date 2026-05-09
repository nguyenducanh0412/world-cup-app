# Copilot Workspace — Build Steps (No Monorepo)

Đây là 6 prompt steps để GitHub Copilot Workspace Agent xây dựng toàn bộ dự án KickOff.

**Cấu trúc mới — 2 repo độc lập:**
```
mobile/   → React Native app (repo này)
api/      → Fastify backend (repo riêng)
```
Shared types được copy thẳng vào từng repo — không dùng workspace packages.

**Quy tắc:**
- Chạy từng step theo thứ tự — **không bỏ qua**
- Sau mỗi step: review code → commit → mới chạy step tiếp
- Đọc `GITHUB_COPILOT_INSTRUCTIONS.md` trước khi bắt đầu
- Mỗi step là 1 Copilot Workspace session riêng biệt

---

## Step 1 — Khởi tạo 2 project độc lập

```
You are a senior React Native engineer. Read GITHUB_COPILOT_INSTRUCTIONS.md first.

KickOff is a World Cup 2026 match viewer + friend betting rooms app.
Points only — no real money, no payment system.

IMPORTANT: This is NOT a monorepo. We have 2 standalone projects:
  - mobile/ (this repo) — React Native CLI app
  - api/ (separate repo) — Fastify backend

Do NOT create workspaces, do NOT use "workspace:*" dependencies.
All shared types live in src/types/shared.ts in each project independently.

TASK: Initialize both projects

───────────────────────────────────────────
1. api — Fastify + TypeScript
───────────────────────────────────────────
Root package.json: name "api", version "1.0.0"
Dependencies:
  fastify @fastify/cors @fastify/jwt @fastify/sensible
  prisma @prisma/client
  @supabase/supabase-js
  zod dotenv node-cron axios firebase-admin

DevDependencies:
  typescript ts-node-dev @types/node @types/node-cron vitest supertest

tsconfig.json — strict mode, paths alias @ → src/

src/types/shared.ts — Shared types (copy, no package import):

  // Enums as string unions
  export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'
  export type MatchStage = 'GROUP' | 'R16' | 'QF' | 'SF' | 'THIRD_PLACE' | 'FINAL'
  export type ScoringMode = 'EXACT_SCORE' | 'OUTCOME_ONLY'

  // Interfaces
  export interface User { id: string; supabaseId: string; username: string; avatarUrl?: string; createdAt: string }
  export interface Match { id: string; externalId: string; homeTeam: string; awayTeam: string; homeFlagUrl?: string; awayFlagUrl?: string; homeScore?: number; awayScore?: number; scheduledAt: string; status: MatchStatus; stage: MatchStage; groupName?: string; venue?: string; updatedAt: string }
  export interface Room { id: string; name: string; inviteCode: string; creatorId: string; scoringMode: ScoringMode; createdAt: string; memberCount?: number; members?: RoomMember[] }
  export interface RoomMember { id: string; userId: string; roomId: string; joinedAt: string; user?: User }
  export interface Prediction { id: string; userId: string; matchId: string; roomId: string; predictedHome: number; predictedAway: number; pointsEarned?: number; isSettled: boolean; createdAt: string; user?: User; match?: Match }
  export interface LeaderboardEntry { userId: string; username: string; avatarUrl?: string; totalPoints: number; totalPredictions: number; exactScores: number; correctOutcomes: number; rank: number }
  export interface ApiResponse<T> { success: boolean; data: T }
  export interface PaginatedResponse<T> { success: boolean; data: T[]; total: number; page: number; pageSize: number }

src/utils/scoring.ts — Scoring logic (copy, no package import):
  export function calculatePoints(
    predictedHome: number, predictedAway: number,
    actualHome: number, actualAway: number,
    mode: ScoringMode
  ): number
  Logic:
    outcome = sign of (score - score): positive=home win, 0=draw, negative=away win
    EXACT_SCORE: exact match = 3pts, correct outcome only = 1pt, wrong = 0
    OUTCOME_ONLY: correct outcome = 2pts, wrong = 0

src/index.ts — Fastify server:
  - register @fastify/cors (origin: *)
  - register @fastify/sensible
  - register @fastify/jwt (secret from JWT_SECRET env)
  - GET /api/v1/health → { status: 'ok', db: 'ok', time: new Date().toISOString() }
    (check db with prisma.$queryRaw`SELECT 1`)
  - listen on PORT env (default 3000)
  - graceful shutdown on SIGTERM

.env.example:
  DATABASE_URL=
  SUPABASE_URL=
  SUPABASE_SERVICE_KEY=
  SUPABASE_ANON_KEY=
  FOOTBALL_DATA_API_KEY=
  JWT_SECRET=
  PORT=3000
  FIREBASE_SERVICE_ACCOUNT_JSON=

───────────────────────────────────────────
2. mobile — React Native CLI 0.85.3 + TypeScript
───────────────────────────────────────────
Root package.json: name "mobile", version "1.0.0"

IMPORTANT iOS/Android config:
  - This is a standalone React Native project (NOT inside a monorepo)
  - node_modules is at the root of mobile/
  - ios/Podfile must use standard paths (not ../../.. relative paths)

Dependencies:
  react@18.3.1 react-native@0.85.3

  # Navigation
  @react-navigation/native @react-navigation/bottom-tabs
  @react-navigation/native-stack
  react-native-screens react-native-safe-area-context

  # UI system
  tamagui @tamagui/core @tamagui/config @tamagui/animations-react-native
  @tamagui/babel-plugin

  # Animation & gesture
  react-native-reanimated react-native-gesture-handler moti

  # Data fetching & state
  @tanstack/react-query axios zustand

  # Supabase
  @supabase/supabase-js

  # Notifications
  @notifee/react-native @react-native-firebase/app @react-native-firebase/messaging

  # Utils
  react-native-mmkv dayjs react-native-fast-image
  react-native-vector-icons react-native-haptic-feedback
  react-native-share react-native-config

src/types/shared.ts — Same shared types as API (copy verbatim)
src/utils/scoring.ts — Same scoring logic as API (copy verbatim)

tamagui.config.ts:
  Base: @tamagui/config/v3
  Override tokens:
    colors:
      background: '#0D0D0D'
      backgroundStrong: '#000000'
      backgroundSoft: '#1C1C1E'
      card: '#252528'
      border: '#2C2C2E'
      accent: '#E8593C'
      accentLight: '#FF7A5C'
      green: '#30D158'
      yellow: '#FFD60A'
      muted: '#636366'
      mutedLight: '#8E8E93'
      textPrimary: '#FFFFFF'
      textSecondary: '#AEAEB2'
  Dark theme as default

babel.config.js:
  Add @tamagui/babel-plugin pointing to tamagui.config.ts
  Add react-native-reanimated/plugin (must be last)

.env.example:
  API_URL=http://localhost:3000/api/v1
  SUPABASE_URL=
  SUPABASE_ANON_KEY=

ios/Podfile — Standard standalone config (NOT monorepo):
  require Pod::Executable.execute_command(
    'node',
    ['-p',
     'require.resolve(
       "react-native/scripts/react_native_pods.rb",
       {paths: [process.argv[1]]},
     )', __dir__]
  ).strip

  platform :ios, min_ios_version_supported
  prepare_react_native_project!

  linkage = ENV['USE_FRAMEWORKS']
  if linkage != nil
    Pod::UI.puts "Configuring Pod with #{linkage}ally linked Frameworks".green
    use_frameworks! :linkage => linkage.to_sym
  end

  target 'mobile' do
    config = use_native_modules!
    use_react_native!(
      :path => config[:reactNativePath],
      :app_path => "#{Pod::Config.instance.installation_root}/.."
    )
    post_install do |installer|
      react_native_post_install(
        installer,
        config[:reactNativePath],
        :mac_catalyst_enabled => false
      )
    end
  end

android/build.gradle — Add Reanimated + Gesture Handler config
android/app/build.gradle — Standard RN 0.85 config

src/ folder structure (create empty index files):
  components/ui/
  screens/
  navigation/
  hooks/
  stores/
  api/
  utils/
  types/

───────────────────────────────────────────
3. CI/CD
───────────────────────────────────────────
api/.github/workflows/ci.yml:
  Trigger: push + pull_request to main
  Job lint-and-test (ubuntu-latest, node 20):
    - checkout
    - npm ci
    - npm run lint
    - npm run test
    - npm run build
  Job deploy-api (only on push to main, needs lint-and-test):
    - install railway CLI
    - railway up --service api

api/railway.toml:
  [build] command = "npx prisma migrate deploy && npm run build"
  [deploy] startCommand = "node dist/index.js"
             healthcheckPath = "/api/v1/health"

mobile/.github/workflows/ci.yml:
  Job build-mobile (on push to main):
    - setup eas-cli
    - eas build --platform all --profile preview --non-interactive

Generate ALL files completely. Do not skip any file.
```

---

## Step 2 — Database schema + Match API

```
Continue KickOff API (api repo). Read GITHUB_COPILOT_INSTRUCTIONS.md.
Project is a standalone Fastify app — NOT a monorepo.
Import shared types from src/types/shared.ts, scoring from src/utils/scoring.ts.

───────────────────────────────────────────
PART A — Prisma schema
───────────────────────────────────────────
Create prisma/schema.prisma:

datasource db { provider = "postgresql", url = env("DATABASE_URL") }
generator client { provider = "prisma-client-js" }

Models:

User:
  id String @id @default(uuid())
  supabaseId String @unique
  username String @unique
  avatarUrl String?
  expoPushToken String?
  createdAt DateTime @default(now())
  predictions Prediction[]
  memberships RoomMember[]
  createdRooms Room[]

Match:
  id String @id @default(uuid())
  externalId String @unique
  homeTeam String
  awayTeam String
  homeFlagUrl String?
  awayFlagUrl String?
  homeScore Int?
  awayScore Int?
  scheduledAt DateTime
  status MatchStatus @default(SCHEDULED)
  stage MatchStage
  groupName String?
  venue String?
  updatedAt DateTime @updatedAt
  predictions Prediction[]

Room:
  id String @id @default(uuid())
  name String
  inviteCode String @unique
  creatorId String
  creator User @relation(...)
  scoringMode ScoringMode @default(EXACT_SCORE)
  members RoomMember[]
  predictions Prediction[]
  createdAt DateTime @default(now())

RoomMember:
  id String @id @default(uuid())
  userId String
  roomId String
  user User @relation(...)
  room Room @relation(...)
  joinedAt DateTime @default(now())
  @@unique([userId, roomId])

Prediction:
  id String @id @default(uuid())
  userId String
  matchId String
  roomId String
  user User @relation(...)
  match Match @relation(...)
  room Room @relation(...)
  predictedHome Int
  predictedAway Int
  pointsEarned Int?
  isSettled Boolean @default(false)
  createdAt DateTime @default(now())
  @@unique([userId, matchId, roomId])

Enums: MatchStatus, MatchStage, ScoringMode (matching shared types in src/types/shared.ts)

───────────────────────────────────────────
PART B — Seed data
───────────────────────────────────────────
prisma/seed.ts — seed real WC2026 data:
  48 group stage matches with:
  - Correct teams (32 qualified teams)
  - Real scheduled dates: Jun 11 – Jun 30 2026
  - Venues: MetLife (NJ), SoFi (LA), AT&T (Dallas), Levi's (SF),
    Rose Bowl (Pasadena), Arrowhead (KC), Lincoln Financial (Philly),
    Gillette (Boston), BC Place (Vancouver), BMO Field (Toronto),
    Azteca (Mexico City), Estadio Akron (Guadalajara)
  - Correct group assignments (A-L, 4 teams each, 3 matches per group)

Add to package.json scripts:
  "db:migrate": "prisma migrate dev"
  "db:seed": "ts-node prisma/seed.ts"
  "db:studio": "prisma studio"
  "db:reset": "prisma migrate reset"

───────────────────────────────────────────
PART C — Match sync service
───────────────────────────────────────────
src/services/matchSyncService.ts:

  fetchAndSyncMatches():
    GET https://api.football-data.org/v4/competitions/WC/matches
    Header: X-Auth-Token: process.env.FOOTBALL_DATA_API_KEY
    Map API response fields to our Match model
    prisma.match.upsert for each match (key: externalId)
    After upsert: sync updated matches to Supabase live_scores table

  updateLiveScores():
    Query DB for LIVE matches only
    For each: fetch current score from football-data.org
    If score changed: update DB + sync to Supabase
    If status changed to FINISHED: call settlePredictions (import lazily)

  Run on startup:
    fetchAndSyncMatches() once
    node-cron every 6 hours: fetchAndSyncMatches()
    node-cron every 60 seconds: updateLiveScores()
    (updateLiveScores cron only active Jun 11 – Jul 19 2026)

src/services/supabaseSync.ts:
  Initialize Supabase admin client (SUPABASE_SERVICE_KEY)
  syncLiveScore(matchId, homeScore, awayScore, status):
    upsert to "live_scores" table in Supabase
    {match_id, home_score, away_score, status, updated_at}

───────────────────────────────────────────
PART D — Match routes
───────────────────────────────────────────
src/routes/matches.ts (Fastify plugin):

All responses: ApiResponse<T> from src/types/shared.ts
No auth required on any match endpoint
In-memory cache (Map<string, {data, timestamp}>) with 30s TTL

GET /api/v1/matches
  Query params (all optional): status, stage, date (YYYY-MM-DD), search
  Filter by date: matches where scheduledAt is on that date
  Filter by search: homeTeam or awayTeam contains search (case-insensitive)
  Sort: scheduledAt ASC

GET /api/v1/matches/live — Return all LIVE matches, no cache
GET /api/v1/matches/upcoming — Next 10 SCHEDULED matches, cache 30s
GET /api/v1/matches/:id — Single match, 404 if not found

Register plugin in src/index.ts.
Generate all files completely.
```

---

## Step 3 — Room system + Predictions

```
Continue KickOff API (api repo). Read GITHUB_COPILOT_INSTRUCTIONS.md.
Standalone Fastify app — NOT monorepo.
Import shared types from src/types/shared.ts, scoring from src/utils/scoring.ts.
Match API is ready. Now build rooms and predictions.

───────────────────────────────────────────
PART A — Auth middleware
───────────────────────────────────────────
src/middleware/auth.ts:
  FastifyPreHandlerHookHandler
  1. Extract Bearer token from Authorization header
  2. Verify with Supabase: GET SUPABASE_URL/auth/v1/user (pass token)
  3. Get supabaseId from response
  4. Upsert User in DB (create if first login, update nothing if exists)
  5. Attach request.userId = user.id (our DB UUID, not Supabase UUID)
  6. On any error: throw fastify.httpErrors.unauthorized()

Extend FastifyRequest type to include userId: string

───────────────────────────────────────────
PART B — Room service
───────────────────────────────────────────
src/services/roomService.ts:

generateInviteCode(): 6 chars uppercase alphanumeric, unique (retry on collision)

createRoom(creatorId, name, scoringMode):
  Generate invite code
  prisma.room.create + auto-create first RoomMember (creator)
  Return room with member count

joinRoom(userId, inviteCode):
  Find room by inviteCode (case-insensitive), 404 if not found
  400 if user already member
  prisma.roomMember.create, return updated room

leaveRoom(userId, roomId):
  Verify membership, else 404
  Delete RoomMember
  If userId === room.creatorId:
    Find oldest other member → update room.creatorId
    If no other members → delete room

getRoomLeaderboard(roomId): Return LeaderboardEntry[] sorted by totalPoints DESC
getMyRooms(userId): Rooms where userId is member + my rank + unpredicted count
getRoomDetail(roomId, requestingUserId): Verify member (403 if not), return room details

───────────────────────────────────────────
PART C — Prediction service
───────────────────────────────────────────
src/services/predictionService.ts:

Import calculatePoints from src/utils/scoring.ts

placePrediction(userId, matchId, roomId, predictedHome, predictedAway):
  Fetch match — 404 if not found
  If match.status !== 'SCHEDULED': throw 400 'Match has already started'
  If match.scheduledAt <= now: throw 400 'Prediction deadline has passed'
  Verify userId is RoomMember of roomId — 403 if not
  prisma.prediction.upsert (@@unique userId+matchId+roomId)
  Return prediction

settlePredictions(matchId):
  Fetch match — must be FINISHED with actual scores
  Fetch all unsettled predictions for this match
  For each:
    Get room.scoringMode
    points = calculatePoints(pred.predictedHome, pred.predictedAway,
                              match.homeScore, match.awayScore, scoringMode)
    Update prediction: isSettled=true, pointsEarned=points
  Return array of {userId, roomId, pointsEarned}

getMatchPredictionsInRoom(matchId, roomId, requestingUserId):
  If SCHEDULED: return only requestingUserId's prediction
  Else: return all predictions with user info + pointsEarned if settled

───────────────────────────────────────────
PART D — Routes
───────────────────────────────────────────
src/routes/rooms.ts (all require authenticate):
  POST   /rooms               body: {name, scoringMode}
  GET    /rooms/my
  GET    /rooms/join/:code    (no auth — preview only)
  POST   /rooms/join          body: {inviteCode}
  DELETE /rooms/:id/leave
  GET    /rooms/:id
  GET    /rooms/:id/leaderboard
  GET    /rooms/:id/matches/:matchId/predictions

src/routes/predictions.ts (all require authenticate):
  POST /predictions   body: {matchId, roomId, predictedHome, predictedAway}
  GET  /predictions/my  query: roomId? matchId? settled?

src/routes/users.ts (all require authenticate):
  GET   /users/me
  PATCH /users/me     body: {username?, avatarUrl?}
  GET   /users/check  query: {username} → {available: boolean}
  PUT   /users/push-token  body: {token}

Register all plugins in src/index.ts.
Generate all files completely.
```

---

## Step 4 — Push notifications

```
Continue KickOff API (api repo). Read GITHUB_COPILOT_INSTRUCTIONS.md.
Standalone Fastify app — NOT monorepo.
Rooms and predictions are ready. Now build push notifications.

NOTE: Using Firebase Admin (server) + Notifee/@react-native-firebase (mobile).
No Expo push API. No BullMQ. Use node-cron for scheduling.

───────────────────────────────────────────
PART A — API notification service
───────────────────────────────────────────
src/services/notificationService.ts:

Initialize Firebase Admin:
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })

sendToUser(userId, {title, body, data}):
  Fetch user.expoPushToken from DB
  If no token: return (silently skip)
  Send via FCM: admin.messaging().send({
    token: user.expoPushToken,
    notification: { title, body },
    data: data (all values must be strings),
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } }
  })

notifyMatchReminder(matchId):
  title: "⚽ Sắp bắt đầu!"
  body: "{homeTeam} vs {awayTeam} · 30 phút nữa"
  data: { type: 'MATCH_REMINDER', matchId }

notifyPredictionResult(userId, matchName, pointsEarned):
  title: pointsEarned > 0 ? "🎯 Dự đoán đúng!" : "😬 Lần sau nhé"
  body: pointsEarned > 0 ? "{matchName} · +{pointsEarned} điểm" : "{matchName} · 0 điểm"
  data: { type: 'BET_RESULT', matchId }

notifyRoomInvite(userId, roomName, inviterUsername, inviteCode):
  title: "👥 {inviterUsername} mời bạn vào phòng"
  body: "Tham gia phòng \"{roomName}\""
  data: { type: 'ROOM_INVITE', inviteCode }

───────────────────────────────────────────
PART B — Notification scheduler
───────────────────────────────────────────
src/services/notificationScheduler.ts:

In-memory dedup: Map<string, Set<string>> (key: matchId, value: Set of userIds)
Reset daily at midnight (cron '0 0 * * *')

checkMatchReminders():
  Find matches where scheduledAt between (now + 28min) and (now + 32min) AND status === 'SCHEDULED'
  For each match + user with predictions: send reminder if not in dedup

Register cron in src/index.ts: cron.schedule('* * * * *', checkMatchReminders)

───────────────────────────────────────────
PART C — Wire settlement → notifications
───────────────────────────────────────────
Update src/services/matchSyncService.ts:
  After predictionService.settlePredictions(matchId):
    For each {userId, pointsEarned}: call notifyPredictionResult()

───────────────────────────────────────────
PART D — Mobile notification setup (mobile repo)
───────────────────────────────────────────
src/hooks/useNotifications.ts:
  1. notifee.requestPermission()
  2. messaging().getToken() → get FCM token
  3. PUT /api/v1/users/push-token {token}
  4. messaging().onTokenRefresh → re-register
  5. Foreground: notifee.onForegroundEvent → displayNotification()
  Return { isGranted }

Background handler in index.js:
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await notifee.displayNotification(...)
  })

src/utils/notificationRouter.ts:
  handleNotificationTap(data, navigation):
    MATCH_REMINDER → navigate('MatchDetail', {matchId})
    BET_RESULT → navigate('MatchDetail', {matchId})
    ROOM_INVITE → navigate('JoinRoom', {code: inviteCode})

Notification channels (Android, create on app init):
  'match-reminders': importance HIGH, vibration on
  'bet-results': importance HIGH, vibration on
  'room-activity': importance DEFAULT

Include google-services.json placeholder and GoogleService-Info.plist placeholder
with comment instructions for where to get real files from Firebase Console.

android/build.gradle additions for firebase.
ios/Podfile — keep standard standalone config (do NOT change to monorepo paths).

Generate all files completely.
```

---

## Step 5 — Mobile UI components + all screens

```
Continue KickOff Mobile (mobile repo). Read GITHUB_COPILOT_INSTRUCTIONS.md.
Standalone React Native 0.85.3 app — NOT monorepo.
Import shared types from src/types/shared.ts, scoring from src/utils/scoring.ts.
API and notifications are ready. Now build the complete mobile app UI.

RULE: Never use React Native's View/Text directly.
Always use Tamagui: XStack, YStack, Text, Card, etc.
Never hardcode colors — always use Tamagui tokens ($accent, $card, etc.)

───────────────────────────────────────────
PART A — Navigation setup
───────────────────────────────────────────
src/navigation/types.ts:
  RootStackParamList:
    Login, Onboarding, MainTabs, MatchDetail: {matchId}, RoomDetail: {roomId},
    CreateRoom, JoinRoom: {code?}
  TabParamList:
    Home, Schedule, Rooms, Profile

src/navigation/RootNavigator.tsx:
  Check authStore.user → show Auth stack or Main stack
  Auth stack: Login → Onboarding (cards)
  Main stack: MainTabs + MatchDetail (modal) + RoomDetail + CreateRoom (modal) + JoinRoom (modal)

src/navigation/MainTabs.tsx:
  Custom TabBar: $backgroundSoft bg, top border 0.5px $border
  Active: icon + label $accent. Inactive: $muted
  Rooms tab: badge if unpredictedCount > 0
  Icons: react-native-vector-icons Feather

src/navigation/NavigationService.ts:
  navigationRef = createNavigationContainerRef()
  navigate(name, params) — usable outside React components

───────────────────────────────────────────
PART B — Zustand stores
───────────────────────────────────────────
src/stores/authStore.ts:
  { user, session, isLoading }, signIn(), signOut(), setUser(), setSession()
  Persist via react-native-mmkv

src/stores/matchStore.ts:
  { matches, liveMatches }, setMatches(), setLiveMatches()
  updateLiveScore(matchId, homeScore, awayScore, status)

src/stores/roomStore.ts:
  { rooms, unpredictedCount }, setRooms(), setUnpredictedCount()

───────────────────────────────────────────
PART C — API client
───────────────────────────────────────────
src/api/client.ts:
  axios instance with baseURL from Config.API_URL (react-native-config)
  Request interceptor: Authorization header from authStore session
  Response interceptor: 401 → authStore.signOut()

src/api/matches.ts: getLive(), getUpcoming(), getAll(params), getById(id)
src/api/rooms.ts: getMy(), create(data), joinByCode(code), join(inviteCode),
                  leave(roomId), getDetail(roomId), getLeaderboard(roomId),
                  getMatchPredictions(roomId, matchId)
src/api/predictions.ts: place(data), getMy(params)
src/api/users.ts: getMe(), updateMe(data), checkUsername(username), savePushToken(token)

───────────────────────────────────────────
PART D — UI Components
───────────────────────────────────────────
Create all in src/components/ui/:

Badge.tsx — variant: 'live'|'scheduled'|'finished'|'won'|'lost'|'draw'
  LIVE: $red bg, pulsing Moti dot. WON: $green. LOST: red tint. DRAW: $yellow. SCHEDULED: $accent border

MatchCard.tsx — variant: 'full'|'compact'
  Full: flag (FastImage 28x28) + team | score or time | flag + team. Tap: spring scale 0.97→1.0
  Compact: condensed, time prominent, score if live/finished
  Card: $card bg, borderRadius 14, padding 12

PredictionInput.tsx — Two columns (Home/Away): minus button, 48px bold number, plus button
  Range 0–20, haptic on press, full-width $accent submit button
  Disabled (match started): muted bg, "Trận đã bắt đầu"

LeaderboardRow.tsx — Rank (gold/silver/bronze/#mutedLight), Avatar, totalPoints, correctOutcomes/exactScores
  isCurrentUser: $accent left border, $backgroundSoft bg

CountdownTimer.tsx — dayjs diff, update every second
  "2h 30m" or "45m 20s" or "Em breve" (<30s). Red + seconds when <5 min
  Reanimated smooth value change

RoomCard.tsx — name, member count, rank badge, "N para prever" dot, chevron, tap animation

Avatar.tsx — FastImage if uri, else initials circle (deterministic color from name hash)
  Sizes: sm(32) md(44) lg(80)

ScreenHeader.tsx — title 28px bold, subtitle 14px muted, optional rightAction
EmptyState.tsx — Feather icon 48px, title, subtitle, optional $accent button
StatGrid.tsx — 2-column grid: label 12px muted, value 24px bold. highlight → $accent

───────────────────────────────────────────
PART E — All screens
───────────────────────────────────────────

screens/LoginScreen.tsx:
  Full dark bg. ⚽ + "KickOff" 32px bold + "World Cup 2026" muted
  "Continuar com Google" (white bg, Google G icon) + "Continuar com Email" outline
  Supabase signInWithOAuth('google') or signInWithOtp(email)
  Email flow: input → send magic link → "Verifique seu email" state

screens/OnboardingScreen.tsx:
  "Escolha seu nome de usuário" heading, Tamagui Input large
  Debounced 500ms: GET /users/check → ✓ green or ✗ red inline
  "Vamos lá!" disabled until valid. PATCH /users/me → navigate MainTabs

screens/HomeScreen.tsx:
  React Query: getLive(), getUpcoming(), roomStore.rooms
  Supabase Realtime 'live_scores' → matchStore.updateLiveScore()
  LIVE section: large card (160px), 22px bold teams, 40px bold score, LIVE badge pulsing
  UPCOMING: horizontal FlatList, MatchCard compact, CountdownTimer
  MY ROOMS: 3 RoomCards max + "Ver tudo →"
  EmptyState if no rooms: "Crie ou entre em uma sala"

screens/ScheduleScreen.tsx:
  Segmented pills: All / Grupos / R16 / QF·SF / Final
  SectionList grouped by date (sticky headers)
  Pull to refresh. Search bar (client-side filter by team name)

screens/MatchDetailScreen.tsx:
  Hero: flags 80x80, team names, score 48px or time
  Status Badge + venue + stage
  MY PREDICTION: PredictionInput (SCHEDULED) or prediction card + points animation (LIVE/FINISHED)
  Room selector: scrollable chips for room selection
  ALL PREDICTIONS (LIVE/FINISHED only): collapsible sections per room (Moti animate height)

screens/RoomsScreen.tsx:
  Header + "Criar sala" ($accent) + "Entrar" (outline) buttons
  FlatList of RoomCard
  Swipe left (Gesture Handler + Reanimated): red "Sair" action
  EmptyState if no rooms

screens/RoomDetailScreen.tsx:
  Room name, invite code pill (tap to copy + haptic + "Copiado!" toast)
  Share button: react-native-share with deep link "kickoff://room/join/CODE"
  Custom tab pills: Classificação / Próximas / Histórico
  Reanimated animated underline on tab switch
  LEADERBOARD: FlatList LeaderboardRow, current user highlighted
  UPCOMING: MatchCard + prediction badge + "Prever →" chip
  HISTORY: FINISHED matches + WON/LOST/DRAW badge + points

screens/CreateRoomScreen.tsx:
  Modal. "Criar sala" heading. Room name input (max 30 chars, char counter)
  Scoring mode: two cards side by side ("Placar Exato" / "Resultado")
  Selected: $accent border + checkmark. Create → mutation → navigate RoomDetail

screens/JoinRoomScreen.tsx:
  "Entrar em uma sala". 6 character boxes (auto-focus next, auto-uppercase)
  On complete: GET /rooms/join/:code → room preview (Moti slide up)
  "Entrar" button active only when preview loaded. joinRoom → navigate RoomDetail

screens/ProfileScreen.tsx:
  Avatar 80px + username 24px bold + "Membro desde {date}" muted
  StatGrid: Total Pontos, Salas, Previsões, Acertos Exatos
  "Melhor sala" card: room name + my rank
  Notification toggle: Tamagui Switch
  App version row. "Sair" button: $red text, Alert.alert confirmation before signOut()

Generate ALL files completely. Every screen must compile without errors.
```

---

## Step 6 — Realtime wiring + deep links + final CI/CD

```
Continue KickOff. Read GITHUB_COPILOT_INSTRUCTIONS.md.
Two standalone repos: api and mobile (NOT monorepo).
All screens are built. Wire everything together and finalize deployment.

───────────────────────────────────────────
PART A — Supabase live_scores table
───────────────────────────────────────────
Create SQL migration file api/prisma/migrations/supabase_live_scores.sql:
  CREATE TABLE IF NOT EXISTS live_scores (
    match_id TEXT PRIMARY KEY,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER PUBLICATION supabase_realtime ADD TABLE live_scores;

Include instructions comment: run this in Supabase SQL editor,
then enable Realtime on live_scores table in Supabase dashboard.

───────────────────────────────────────────
PART B — Mobile Realtime hook
───────────────────────────────────────────
mobile/src/hooks/useLiveScore.ts:
  Props: matchId?: string
  Subscribe to supabase channel 'live_scores'
    .on('postgres_changes', { event: '*', schema: 'public', table: 'live_scores',
      filter: matchId ? `match_id=eq.${matchId}` : undefined },
      payload => matchStore.updateLiveScore(...))
  Unsubscribe on unmount
  Return { homeScore, awayScore, status } for matchId if given

Use useLiveScore in:
  HomeScreen: useLiveScore() — updates all live match cards
  MatchDetailScreen: useLiveScore(matchId) — updates hero score

───────────────────────────────────────────
PART C — Deep links
───────────────────────────────────────────
mobile/android/app/src/main/AndroidManifest.xml:
  Add intent-filter: scheme "kickoff", host "room"

mobile/ios/KickOffMobile/Info.plist:
  Add CFBundleURLSchemes: ["kickoff"]

mobile/src/navigation/RootNavigator.tsx — handle incoming link:
  useEffect: Linking.getInitialURL() + Linking.addEventListener
  Parse: kickoff://room/join/:code → navigate JoinRoom {code}

Share in RoomDetailScreen:
  const url = `kickoff://room/join/${room.inviteCode}`
  Share.share({ message: `Entre na minha sala "${room.name}" no KickOff! ${url}` })

───────────────────────────────────────────
PART D — Tests
───────────────────────────────────────────
api/src/__tests__/services/predictionService.test.ts:
  EXACT_SCORE: exact match → 3pts, correct outcome → 1pt, wrong → 0pt
  OUTCOME_ONLY: correct → 2pts, wrong → 0pt
  Draw prediction correct → 1pt (EXACT) / 2pt (OUTCOME_ONLY)
  Marks all predictions isSettled=true

api/src/__tests__/routes/matches.test.ts:
  GET /api/v1/matches with status filter
  GET /api/v1/matches/live returns only LIVE
  GET /api/v1/health returns 200

mobile/src/__tests__/scoring.test.ts:
  Import calculatePoints from src/utils/scoring.ts
  Test all 6 scoring scenarios

───────────────────────────────────────────
PART E — Final CI/CD
───────────────────────────────────────────
api/.github/workflows/ci.yml (final complete version):
  name: CI/CD
  on: push/pull_request to main
  jobs:
    lint-and-test (ubuntu-latest, node 20):
      services: postgres:16 (POSTGRES_PASSWORD=test, port 5432)
      env: DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, FOOTBALL_DATA_API_KEY, JWT_SECRET
      steps: checkout → npm ci → prisma migrate deploy → lint → test → build
    deploy-api (on push to main, needs lint-and-test):
      npm install -g @railway/cli → railway up --service api
      env: RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

mobile/.github/workflows/ci.yml (final):
  build-mobile (on push to main):
    npm install -g eas-cli
    eas build --platform all --profile preview --non-interactive
    env: EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

mobile/eas.json:
  {
    "cli": { "version": ">= 10.0.0" },
    "build": {
      "development": { "developmentClient": true, "distribution": "internal" },
      "preview": { "distribution": "internal", "android": { "buildType": "apk" } },
      "production": { "autoIncrement": true }
    }
  }

Required GitHub Secrets (api repo):
  RAILWAY_TOKEN         — Railway dashboard → Account Settings → Tokens
  SUPABASE_URL          — Supabase project Settings → API
  SUPABASE_SERVICE_KEY  — Supabase project Settings → API → service_role key
  FOOTBALL_DATA_API_KEY — football-data.org dashboard
  FIREBASE_SERVICE_ACCOUNT_JSON — Firebase Console → Project Settings → Service accounts

Required GitHub Secrets (mobile repo):
  EXPO_TOKEN — expo.dev → Account Settings → Access Tokens

Generate ALL files completely. This is the final step — ensure everything connects end to end.
```

---

## Checklist sau khi hoàn thành tất cả steps

Sau Step 6, verify các điểm sau trước khi merge vào main:

**API (api):**
- [ ] `GET /api/v1/health` trả về 200
- [ ] `GET /api/v1/matches` trả về matches từ DB
- [ ] Prisma migrations chạy thành công
- [ ] Seed data có đủ 48 trận

**Mobile (mobile):**
- [ ] `pod install` chạy không lỗi (standalone, không phải monorepo)
- [ ] App build thành công trên iOS và Android
- [ ] Login flow hoạt động (Google OAuth)
- [ ] Onboarding đặt được username
- [ ] Bottom tabs navigate đúng
- [ ] MatchCard hiển thị đúng với mock data

**Integration:**
- [ ] Prediction đặt được từ mobile → lưu vào DB
- [ ] Invite code copy + paste vào JoinRoom → join được room
- [ ] Deep link `kickoff://room/join/ABCD12` mở đúng màn hình
- [ ] Supabase Realtime: score update trên API → cập nhật trên mobile

**CI:**
- [ ] Tất cả tests pass
- [ ] Lint không có lỗi
- [ ] Build thành công trước khi merge