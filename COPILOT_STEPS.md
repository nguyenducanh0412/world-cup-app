# Copilot Workspace — Build Steps

Đây là 6 prompt steps để GitHub Copilot Workspace Agent xây dựng toàn bộ dự án KickOff.

**Quy tắc:**
- Chạy từng step theo thứ tự — **không bỏ qua**
- Sau mỗi step: review code → commit → mới chạy step tiếp
- Đọc `GITHUB_COPILOT_INSTRUCTIONS.md` trước khi bắt đầu
- Mỗi step là 1 Copilot Workspace session riêng biệt

---

## Step 1 — Khởi tạo monorepo + React Native CLI

```
You are a senior React Native engineer. Read GITHUB_COPILOT_INSTRUCTIONS.md
first, then initialize the KickOff monorepo.

KickOff is a World Cup 2026 match viewer + friend betting rooms app.
Points only — no real money, no payment system.

TASK: Project setup with React Native CLI (no Expo)

───────────────────────────────────────────
1. ROOT — npm workspaces monorepo
───────────────────────────────────────────
Create root package.json:
{
  "name": "kickoff",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "npm run dev --workspaces --if-present",
    "build": "npm run build --workspaces --if-present",
    "lint": "npm run lint --workspaces --if-present",
    "test": "npm run test --workspaces --if-present"
  }
}

───────────────────────────────────────────
2. packages/shared
───────────────────────────────────────────
packages/shared/package.json: name "@kickoff/shared"
packages/shared/src/index.ts — export all shared types:

  Enums (as string union types):
    MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'
    MatchStage = 'GROUP' | 'R16' | 'QF' | 'SF' | 'THIRD_PLACE' | 'FINAL'
    ScoringMode = 'EXACT_SCORE' | 'OUTCOME_ONLY'

  Interfaces:
    User { id, supabaseId, username, avatarUrl?, createdAt }
    Match { id, externalId, homeTeam, awayTeam, homeFlagUrl?, awayFlagUrl?,
            homeScore?, awayScore?, scheduledAt, status, stage, groupName?,
            venue?, updatedAt }
    Room { id, name, inviteCode, creatorId, scoringMode, createdAt,
           memberCount?, members? }
    RoomMember { id, userId, roomId, joinedAt, user? }
    Prediction { id, userId, matchId, roomId, predictedHome, predictedAway,
                 pointsEarned?, isSettled, createdAt, user?, match? }
    LeaderboardEntry { userId, username, avatarUrl?, totalPoints,
                       totalPredictions, exactScores, correctOutcomes, rank }
    ApiResponse<T> { success: boolean, data: T }
    PaginatedResponse<T> { success: boolean, data: T[], total: number,
                            page: number, pageSize: number }

packages/shared/src/scoring.ts — export:
  calculatePoints(predictedHome, predictedAway, actualHome, actualAway,
                  mode: ScoringMode): number
  Logic:
    EXACT_SCORE: exact match = 3pts, correct outcome = 1pt, wrong = 0
    OUTCOME_ONLY: correct outcome = 2pts, wrong = 0
    (outcome = sign(home - away): positive=home win, 0=draw, negative=away win)

───────────────────────────────────────────
3. apps/api — Fastify + TypeScript
───────────────────────────────────────────
apps/api/package.json: name "@kickoff/api"
Dependencies:
  fastify @fastify/cors @fastify/jwt @fastify/sensible
  prisma @prisma/client
  @supabase/supabase-js
  zod
  dotenv
  node-cron
  axios
  firebase-admin
  @kickoff/shared (workspace:*)

DevDependencies:
  typescript ts-node-dev @types/node @types/node-cron vitest supertest

apps/api/tsconfig.json — strict mode, paths alias @ → src/
apps/api/src/index.ts — Fastify server:
  - register @fastify/cors (origin: *)
  - register @fastify/sensible (for httpErrors)
  - register @fastify/jwt (secret from JWT_SECRET env)
  - GET /api/v1/health → { status: 'ok', db: 'ok', time: new Date().toISOString() }
    (check db with prisma.$queryRaw`SELECT 1`)
  - listen on PORT env (default 3000)
  - graceful shutdown on SIGTERM

apps/api/.env.example with all vars and comments:
  DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_ANON_KEY,
  FOOTBALL_DATA_API_KEY, JWT_SECRET, PORT, FIREBASE_SERVICE_ACCOUNT_JSON

───────────────────────────────────────────
4. apps/mobile — React Native CLI 0.74 + TypeScript
───────────────────────────────────────────
apps/mobile/package.json: name "@kickoff/mobile"
Dependencies:
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

  @kickoff/shared (workspace:*)

apps/mobile/tamagui.config.ts:
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

apps/mobile/babel.config.js:
  Add @tamagui/babel-plugin pointing to tamagui.config.ts
  Add react-native-reanimated/plugin (must be last)

apps/mobile/.env.example:
  API_URL=http://localhost:3000/api/v1
  SUPABASE_URL=
  SUPABASE_ANON_KEY=

apps/mobile/src/ folder structure (create empty index files):
  components/ui/
  screens/
  navigation/
  hooks/
  stores/
  api/
  utils/
  types/

───────────────────────────────────────────
5. CI/CD
───────────────────────────────────────────
.github/workflows/ci.yml:
  Trigger: push + pull_request to main
  Job lint-and-test (ubuntu-latest, node 20):
    - checkout
    - npm ci
    - npm run lint
    - npm run test
    - npm run build
  Job deploy-api (only on push to main, needs lint-and-test):
    - install railway CLI
    - railway up --service kickoff-api
  Job build-mobile (only on push to main, needs lint-and-test):
    - setup eas-cli
    - eas build --platform all --profile preview --non-interactive

apps/api/railway.toml:
  [build] command = "npx prisma migrate deploy && npm run build"
  [deploy] startCommand = "node dist/index.js"
             healthcheckPath = "/api/v1/health"

Generate ALL files completely. Do not skip any file.
Include android/build.gradle changes for Reanimated + Gesture Handler.
Include ios/Podfile changes for the same.
```

---

## Step 2 — Database schema + Match API

```
Continue KickOff. Read GITHUB_COPILOT_INSTRUCTIONS.md.
Monorepo is initialized. Now build the database and match endpoints.

───────────────────────────────────────────
PART A — Prisma schema
───────────────────────────────────────────
Create apps/api/prisma/schema.prisma:

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

Enums: MatchStatus, MatchStage, ScoringMode (matching shared types)

───────────────────────────────────────────
PART B — Seed data
───────────────────────────────────────────
apps/api/prisma/seed.ts — seed real WC2026 data:
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
apps/api/src/services/matchSyncService.ts:

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

apps/api/src/services/supabaseSync.ts:
  Initialize Supabase admin client (SUPABASE_SERVICE_KEY)
  syncLiveScore(matchId, homeScore, awayScore, status):
    upsert to "live_scores" table in Supabase
    {match_id, home_score, away_score, status, updated_at}

───────────────────────────────────────────
PART D — Match routes
───────────────────────────────────────────
apps/api/src/routes/matches.ts (Fastify plugin):

All responses: ApiResponse<T> from @kickoff/shared
No auth required on any match endpoint
In-memory cache (Map<string, {data, timestamp}>) with 30s TTL

GET /api/v1/matches
  Query params (all optional): status, stage, date (YYYY-MM-DD), search
  Filter by date: matches where scheduledAt is on that date
  Filter by search: homeTeam or awayTeam contains search (case-insensitive)
  Sort: scheduledAt ASC
  Cache key: JSON.stringify(query)

GET /api/v1/matches/live
  Return all LIVE matches
  No cache (always fresh)

GET /api/v1/matches/upcoming
  Return next 10 SCHEDULED matches (scheduledAt > now, sorted ASC)
  Cache 30s

GET /api/v1/matches/:id
  Return single match by id
  404 if not found

Register plugin in src/index.ts.
Generate all files completely.
```

---

## Step 3 — Room system + Predictions

```
Continue KickOff. Read GITHUB_COPILOT_INSTRUCTIONS.md.
Match API is ready. Now build rooms and predictions.

───────────────────────────────────────────
PART A — Auth middleware
───────────────────────────────────────────
apps/api/src/middleware/auth.ts:
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
apps/api/src/services/roomService.ts:

generateInviteCode(): string
  6 chars, uppercase alphanumeric, ensure uniqueness (retry if collision)

createRoom(creatorId, name, scoringMode):
  Generate invite code
  prisma.room.create with data + auto-create first RoomMember (creator)
  Return room with member count

joinRoom(userId, inviteCode):
  Find room by inviteCode (case-insensitive)
  404 if not found
  400 if user already member
  prisma.roomMember.create
  Return updated room

leaveRoom(userId, roomId):
  Verify membership exists, else 404
  Delete RoomMember
  If userId === room.creatorId:
    Find oldest other member → update room.creatorId
    If no other members → delete room

getRoomLeaderboard(roomId):
  Query all settled predictions grouped by userId
  For each user: sum pointsEarned, count total, count exact (pointsEarned=3 in EXACT_SCORE), count correct (pointsEarned>0)
  Join with User for username + avatarUrl
  Sort by totalPoints DESC
  Add rank (1-indexed)
  Return LeaderboardEntry[]

getMyRooms(userId):
  Find all rooms where userId is a member
  For each room: include my rank from leaderboard + unpredicted upcoming match count
  Return enriched array

getRoomDetail(roomId, requestingUserId):
  Verify requestingUserId is member, else 403
  Return room + memberCount + scoringMode

───────────────────────────────────────────
PART C — Prediction service
───────────────────────────────────────────
apps/api/src/services/predictionService.ts:

Import calculatePoints from @kickoff/shared

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
  (caller handles notifications)

getMatchPredictionsInRoom(matchId, roomId, requestingUserId):
  If match.status === 'SCHEDULED':
    Return only predictions where userId === requestingUserId
  Else (LIVE or FINISHED):
    Return all predictions in room with user info
    Include pointsEarned if settled

───────────────────────────────────────────
PART D — Routes
───────────────────────────────────────────
apps/api/src/routes/rooms.ts (all require authenticate):
  POST   /rooms               body: {name, scoringMode}
  GET    /rooms/my
  GET    /rooms/join/:code    (no auth — preview only)
  POST   /rooms/join          body: {inviteCode}
  DELETE /rooms/:id/leave
  GET    /rooms/:id
  GET    /rooms/:id/leaderboard
  GET    /rooms/:id/matches/:matchId/predictions

apps/api/src/routes/predictions.ts (all require authenticate):
  POST /predictions
    body: {matchId, roomId, predictedHome, predictedAway}
    Zod validation: predictedHome/Away are non-negative integers 0–20
  GET  /predictions/my
    query: roomId? matchId? settled? (boolean string)

apps/api/src/routes/users.ts (all require authenticate):
  GET   /users/me
  PATCH /users/me             body: {username?, avatarUrl?}
  GET   /users/check          query: {username} → {available: boolean}
  PUT   /users/push-token     body: {token}

Register all plugins in src/index.ts.
Generate all files completely.
```

---

## Step 4 — Push notifications

```
Continue KickOff. Read GITHUB_COPILOT_INSTRUCTIONS.md.
Rooms and predictions are ready. Now build push notifications.

NOTE: Using Firebase Admin (server) + Notifee/@react-native-firebase (mobile).
No Expo push API. No BullMQ. Use node-cron for scheduling.

───────────────────────────────────────────
PART A — API notification service
───────────────────────────────────────────
apps/api/src/services/notificationService.ts:

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
  Find all users with unsettled predictions on this match (any room)
  For each: sendToUser with:
    title: "⚽ Sắp bắt đầu!"
    body: "{homeTeam} vs {awayTeam} · 30 phút nữa"
    data: { type: 'MATCH_REMINDER', matchId }

notifyPredictionResult(userId, matchName, pointsEarned, newRank?):
  sendToUser with:
    title: pointsEarned > 0 ? "🎯 Dự đoán đúng!" : "😬 Lần sau nhé"
    body: pointsEarned > 0
      ? "{matchName} · +{pointsEarned} điểm"
      : "{matchName} · 0 điểm"
    data: { type: 'BET_RESULT', matchId }

notifyRoomInvite(userId, roomName, inviterUsername, inviteCode):
  sendToUser with:
    title: "👥 {inviterUsername} mời bạn vào phòng"
    body: "Tham gia phòng \"{roomName}\""
    data: { type: 'ROOM_INVITE', inviteCode }

───────────────────────────────────────────
PART B — Notification scheduler
───────────────────────────────────────────
apps/api/src/services/notificationScheduler.ts:

In-memory dedup: Map<string, Set<string>>
  key: matchId, value: Set of userIds already reminded
  Reset entire map daily at midnight (cron '0 0 * * *')

checkMatchReminders():
  Find matches where scheduledAt is between (now + 28min) and (now + 32min)
  AND status === 'SCHEDULED'
  For each match:
    For each user with predictions on it:
      If NOT in dedup map: send reminder + add to dedup

Register cron in src/index.ts:
  cron.schedule('* * * * *', () => notificationScheduler.checkMatchReminders())

───────────────────────────────────────────
PART C — Wire settlement → notifications
───────────────────────────────────────────
Update apps/api/src/services/matchSyncService.ts:
  After calling predictionService.settlePredictions(matchId):
    For each {userId, pointsEarned} returned:
      Call notificationService.notifyPredictionResult(userId, matchName, pointsEarned)

───────────────────────────────────────────
PART D — Mobile notification setup
───────────────────────────────────────────
apps/mobile/src/hooks/useNotifications.ts:
  1. notifee.requestPermission()
  2. messaging().getToken() → get FCM token
  3. PUT /api/v1/users/push-token {token}
  4. messaging().onTokenRefresh → re-register
  5. Foreground handler: notifee.onForegroundEvent
     - Display notification with notifee.displayNotification()
  6. Return { isGranted }

Background handler in apps/mobile/index.js (registerHeadlessTask):
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    await notifee.displayNotification(...)
  })

apps/mobile/src/utils/notificationRouter.ts:
  handleNotificationTap(data: Record<string, string>, navigation):
    type === 'MATCH_REMINDER' → navigation.navigate('MatchDetail', {matchId})
    type === 'BET_RESULT' → navigation.navigate('MatchDetail', {matchId})
    type === 'ROOM_INVITE' → navigation.navigate('JoinRoom', {code: inviteCode})

Notification channels (Android, create on app init):
  'match-reminders': importance HIGH, vibration on
  'bet-results': importance HIGH, vibration on
  'room-activity': importance DEFAULT

Include google-services.json placeholder and GoogleService-Info.plist placeholder
with comment instructions for where to get real files from Firebase Console.

android/build.gradle additions for firebase.
ios/Podfile additions for notifee.

Generate all files completely.
```

---

## Step 5 — Mobile UI components + all screens

```
Continue KickOff. Read GITHUB_COPILOT_INSTRUCTIONS.md.
API and notifications are ready. Now build the complete mobile app UI.

RULE: Never use React Native's View/Text directly.
Always use Tamagui: XStack, YStack, Text, Card, etc.
Never hardcode colors — always use Tamagui tokens ($accent, $card, etc.)

───────────────────────────────────────────
PART A — Navigation setup
───────────────────────────────────────────
apps/mobile/src/navigation/types.ts:
  RootStackParamList:
    Login: undefined
    Onboarding: undefined
    MainTabs: undefined
    MatchDetail: { matchId: string }
    RoomDetail: { roomId: string }
    CreateRoom: undefined
    JoinRoom: { code?: string }

  TabParamList:
    Home: undefined
    Schedule: undefined
    Rooms: undefined
    Profile: undefined

apps/mobile/src/navigation/RootNavigator.tsx:
  Check authStore.user → show Auth stack or Main stack
  Auth stack: Login → Onboarding (both as cards)
  Main stack: MainTabs as root, then modal screens on top
    MatchDetail: slide from bottom (modal)
    RoomDetail: push
    CreateRoom: slide from bottom (modal)
    JoinRoom: slide from bottom (modal)

apps/mobile/src/navigation/MainTabs.tsx:
  Bottom tab navigator
  Custom TabBar component:
    Background: $backgroundSoft with top border 0.5px $border
    Active: icon + label in $accent
    Inactive: icon + label in $muted
    Rooms tab: badge (number) if unpredictedCount > 0
    Safe area inset at bottom
  Tabs: Home (home icon), Schedule (calendar), Rooms (users), Profile (user)
  Icons: react-native-vector-icons Feather set

apps/mobile/src/navigation/NavigationService.ts:
  navigationRef = createNavigationContainerRef()
  navigate(name, params) — usable outside React components
  Use this in notification tap handler

───────────────────────────────────────────
PART B — Zustand stores
───────────────────────────────────────────
apps/mobile/src/stores/authStore.ts:
  { user: User|null, session: Session|null, isLoading: boolean }
  signIn(), signOut(), setUser(), setSession()
  Persist user + session via react-native-mmkv

apps/mobile/src/stores/matchStore.ts:
  { matches: Match[], liveMatches: Match[] }
  setMatches(), setLiveMatches()
  updateLiveScore(matchId, homeScore, awayScore, status)

apps/mobile/src/stores/roomStore.ts:
  { rooms: Room[], unpredictedCount: number }
  setRooms(), setUnpredictedCount()

───────────────────────────────────────────
PART C — API client
───────────────────────────────────────────
apps/mobile/src/api/client.ts:
  axios instance with baseURL from Config.API_URL (react-native-config)
  Request interceptor: get session from authStore → set Authorization header
  Response interceptor: 401 → authStore.signOut()

apps/mobile/src/api/matches.ts: getLive(), getUpcoming(), getAll(params), getById(id)
apps/mobile/src/api/rooms.ts: getMy(), create(data), joinByCode(code), join(inviteCode),
                               leave(roomId), getDetail(roomId), getLeaderboard(roomId),
                               getMatchPredictions(roomId, matchId)
apps/mobile/src/api/predictions.ts: place(data), getMy(params)
apps/mobile/src/api/users.ts: getMe(), updateMe(data), checkUsername(username), savePushToken(token)

───────────────────────────────────────────
PART D — UI Components
───────────────────────────────────────────
Create all in apps/mobile/src/components/ui/:

Badge.tsx — Props: label, variant: 'live'|'scheduled'|'finished'|'won'|'lost'|'draw'
  LIVE: $red bg, white text, Moti animated pulsing dot (opacity 1↔0.3, 800ms loop)
  WON: $green bg, white text, ✓
  LOST: red tint bg, muted text
  DRAW: $yellow bg, dark text
  SCHEDULED: transparent, $accent border, $accent text

MatchCard.tsx — Props: match: Match, myPrediction?: Prediction, onPress, variant?: 'full'|'compact'
  Full variant (schedule screen):
    XStack: flag (FastImage 28x28) + team name | score or time | flag + team name
    Bottom: stage/group label + my prediction badge
    Tap: Reanimated spring scale 0.97→1.0 then onPress
  Compact variant (home screen horizontal):
    Condensed, time prominent, score if live/finished
  Card bg: $card, borderRadius 14, padding 12

PredictionInput.tsx — Props: onSubmit(home,away), disabled, existing?: Prediction
  Two columns, each: label (Home/Away), minus button, large number (48px bold), plus button
  Validate: 0–20 range
  haptic on each button press (impactLight)
  Submit: full width, $accent bg, "Confirmar aposta" text
  Disabled state (match started): muted bg, "Trận đã bắt đầu" text

LeaderboardRow.tsx — Props: entry: LeaderboardEntry, isCurrentUser, rank
  Rank: 28px number, gold (#FFD700) if rank=1, silver if 2, bronze if 3, else $mutedLight
  Avatar: Avatar component
  Right: totalPoints large, correctOutcomes/exactScores small below
  isCurrentUser: $accent left border (2px), $backgroundSoft bg

CountdownTimer.tsx — Props: scheduledAt: string
  dayjs diff to now, update every second with setInterval (cleanup on unmount)
  Display: "2h 30m" or "45m 20s" when < 1h or "Em breve" when < 30s
  Red color + seconds visible when < 5 minutes
  Animated number: Reanimated interpolate for smooth value change

RoomCard.tsx — Props: room, myRank?, myPoints?, unpredictedCount, onPress
  Room name (bold), member count muted
  Badge: "#1 · 24 pts" in $accent
  Orange dot + "3 para prever" if unpredictedCount > 0
  Chevron right, tap animation

Avatar.tsx — Props: uri?, name, size: 'sm'(32)|'md'(44)|'lg'(80)
  FastImage if uri, else circle with initials (first 2 chars of name)
  Background color: deterministic from name (hash → pick from 6 colors)

ScreenHeader.tsx — Props: title, subtitle?, rightAction?: ReactNode
  title: 28px bold, $textPrimary
  subtitle: 14px, $textSecondary
  Used inside scroll content, not as navigation header

EmptyState.tsx — Props: icon, title, subtitle, actionLabel?, onAction?
  Centered, Feather icon 48px muted, texts, optional $accent button

StatGrid.tsx — Props: stats: {label, value, highlight?}[]
  2-column grid, each cell: label 12px muted top, value 24px bold bottom
  highlight=true: value in $accent color

───────────────────────────────────────────
PART E — All screens
───────────────────────────────────────────

screens/LoginScreen.tsx:
  Full dark bg ($background)
  Large ⚽ emoji + "KickOff" wordmark (32px bold)
  "World Cup 2026" subtitle muted
  "Continuar com Google" button (white bg, Google "G" icon, dark text, full width)
  "Continuar com Email" outline button
  Supabase signInWithOAuth('google') or signInWithOtp(email)
  Email flow: show email input → send magic link → "Verifique seu email" state

screens/OnboardingScreen.tsx:
  "Escolha seu nome de usuário" heading
  Tamagui Input (styled, large)
  Debounced 500ms: GET /users/check → show ✓ green or ✗ red inline
  "Vamos lá!" button disabled until username valid
  PATCH /users/me then navigate to MainTabs

screens/HomeScreen.tsx:
  React Query: getLive(), getUpcoming(), roomStore.rooms
  Supabase Realtime subscription to 'live_scores' channel →
    on change: matchStore.updateLiveScore() → card re-renders
  LIVE section: if liveMatches.length > 0:
    Large card (160px height, $card bg)
    Teams 22px bold, score 40px bold center, LIVE badge pulsing
    My prediction for this match (if any) shown below score
  UPCOMING: horizontal FlatList, MatchCard compact, CountdownTimer
  MY ROOMS: 3 RoomCards max, "Ver tudo →" TextButton
  EmptyState if no rooms: "Crie ou entre em uma sala"

screens/ScheduleScreen.tsx:
  Segmented pills (custom, not native): All / Grupos / R16 / QF·SF / Final
  Selected pill: $accent bg, white text. Others: transparent, $muted border
  React Query: getAll({stage: selectedStage}) refetch on stage change
  SectionList grouped by date:
    Section header sticky: "Qui, 12 Jun" in $backgroundSoft
    MatchCard full variant
  Pull to refresh
  Search bar at top (TextInput styled): filter client-side by team name

screens/MatchDetailScreen.tsx:
  Route param: matchId
  React Query: getById(matchId), getMy({matchId})
  Hero: two FastImage flags 80x80, team names, score 48px or scheduled time
  Status Badge + venue + stage (muted small text)
  MY PREDICTION section:
    If SCHEDULED + no prediction: PredictionInput
      Room selector: XStack scrollable chips of my rooms
      On submit: mutation placePrediction → haptic success → optimistic update
    If SCHEDULED + has prediction: show pick tile + "Editar" button
    If LIVE or FINISHED: prediction card + pointsEarned with counting animation
      (Reanimated: interpolate 0→N over 1000ms on mount)
  ALL PREDICTIONS (only LIVE or FINISHED):
    React Query: getMatchPredictions(roomId, matchId) for each of my rooms
    Each room as collapsible section (Moti animate height)
    Each row: LeaderboardRow style but with prediction shown

screens/RoomsScreen.tsx:
  React Query: getMy() → also update roomStore
  Header + two buttons row: "Criar sala" ($accent) + "Entrar" (outline)
  FlatList of RoomCard
  Swipe left (Gesture Handler + Reanimated): reveal red "Sair" action
    On swipe confirm: mutation leaveRoom → remove from list with Moti exit animation
  EmptyState if no rooms

screens/RoomDetailScreen.tsx:
  Route param: roomId
  React Query: getDetail(roomId), getLeaderboard(roomId), getMy()
  Header: room name, invite code pill (tap to copy → Clipboard + haptic impactMedium + "Copiado!" toast)
  Share button top right: react-native-share with deep link "kickoff://room/join/CODE"

  Custom tab pills: Classificação / Próximas / Histórico
  Tab switch: Reanimated SharedValue for animated underline

  LEADERBOARD tab:
    FlatList of LeaderboardRow
    Current user row: highlighted, scrollIntoView if off-screen

  UPCOMING tab:
    SCHEDULED matches in this context: show MatchCard + my prediction badge
    Matches not yet predicted: show "Prever →" chip in $accent

  HISTORY tab:
    FINISHED matches: MatchCard + prediction result chip (WON/LOST/DRAW badge + points)
    Filter pills: Todos / Acertei / Errei

screens/CreateRoomScreen.tsx:
  Modal presentation (bottom sheet feel via translateY animation on mount)
  "Criar sala" heading
  Input: room name (required, max 30 chars, char counter)
  Scoring mode: two cards side by side
    "Placar Exato": exact=3pts, outcome=1pt
    "Resultado": correct outcome=2pts
    Selected: $accent border + checkmark icon
  Create button → mutation createRoom → navigate to RoomDetail (replace)

screens/JoinRoomScreen.tsx:
  Route param: code? (prefilled from deep link)
  "Entrar em uma sala" heading
  6 individual character boxes (6x TextInput each max 1 char, auto-focus next)
    Monospace font, large, $card bg, $accent border when focused
    Auto-uppercase
  On complete code (6 chars): GET /rooms/join/:code → show room preview
    Room preview: Moti slide up, RoomCard style, member count, creator name
  "Entrar" button (active only when preview loaded)
  Mutation joinRoom → navigate to RoomDetail

screens/ProfileScreen.tsx:
  Avatar 80px + username 24px bold + "Membro desde {date}" muted
  StatGrid: Total Pontos, Salas, Previsões, Acertos Exatos
  "Melhor sala" card: room name + my rank
  Notification toggle: Switch styled with Tamagui theming
  App version row: muted small
  Sair button: $red text, Alert.alert confirmation before signOut()

Generate ALL files completely. Every screen must compile without errors.
```

---

## Step 6 — Realtime wiring + deep links + final CI/CD

```
Continue KickOff. Read GITHUB_COPILOT_INSTRUCTIONS.md.
All screens are built. Wire everything together and finalize deployment.

───────────────────────────────────────────
PART A — Supabase live_scores table
───────────────────────────────────────────
Create SQL migration file apps/api/prisma/migrations/supabase_live_scores.sql:
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
apps/mobile/src/hooks/useLiveScore.ts:
  Props: matchId?: string (if given: subscribe to single match, else all live)
  Initialize Supabase client with SUPABASE_URL + SUPABASE_ANON_KEY
  Subscribe to supabase channel 'live_scores'
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'live_scores',
      filter: matchId ? `match_id=eq.${matchId}` : undefined
    }, payload => {
      matchStore.updateLiveScore(payload.new.match_id,
                                  payload.new.home_score,
                                  payload.new.away_score,
                                  payload.new.status)
    })
  Unsubscribe on unmount
  Return { homeScore, awayScore, status } for the matchId if given

Use useLiveScore in:
  HomeScreen: useLiveScore() (no matchId) → updates all live match cards
  MatchDetailScreen: useLiveScore(matchId) → updates hero score

───────────────────────────────────────────
PART C — Deep links
───────────────────────────────────────────
apps/mobile/android/app/src/main/AndroidManifest.xml:
  Add intent-filter for scheme "kickoff", host "room"
  <data android:scheme="kickoff" android:host="room" />

apps/mobile/ios/KickOff/Info.plist:
  Add CFBundleURLSchemes: ["kickoff"]

apps/mobile/src/navigation/RootNavigator.tsx — handle incoming link:
  useEffect: Linking.getInitialURL() + Linking.addEventListener
  Parse URL: kickoff://room/join/:code → navigate to JoinRoom {code}

Share button in RoomDetailScreen:
  const url = `kickoff://room/join/${room.inviteCode}`
  Share.share({ message: `Entre na minha sala "${room.name}" no KickOff! ${url}` })

───────────────────────────────────────────
PART D — Settlement complete flow test
───────────────────────────────────────────
Create apps/api/src/__tests__/services/predictionService.test.ts:
  Test cases for settlePredictions:
    - EXACT_SCORE mode: exact match → 3 pts
    - EXACT_SCORE mode: correct outcome only → 1 pt
    - EXACT_SCORE mode: wrong → 0 pts
    - OUTCOME_ONLY mode: correct → 2 pts
    - OUTCOME_ONLY mode: wrong → 0 pts
    - Draw prediction correct → 1 pt (EXACT_SCORE) / 2 pt (OUTCOME_ONLY)
    - Marks all predictions as isSettled=true

Create apps/api/src/__tests__/routes/matches.test.ts:
  Test GET /api/v1/matches with status filter
  Test GET /api/v1/matches/live returns only LIVE
  Test GET /api/v1/health returns 200

Create apps/mobile/src/__tests__/scoring.test.ts:
  Import calculatePoints from @kickoff/shared
  Test all 6 scoring scenarios above

───────────────────────────────────────────
PART E — Final CI/CD and deployment files
───────────────────────────────────────────
.github/workflows/ci.yml (final complete version):
  name: CI/CD
  on:
    push: [main]
    pull_request: [main]

  jobs:
    lint-and-test:
      runs-on: ubuntu-latest
      services:
        postgres: image postgres:16, env POSTGRES_PASSWORD=test, ports 5432
      env:
        DATABASE_URL: postgresql://postgres:test@localhost:5432/kickoff_test
        SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
        SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
        FOOTBALL_DATA_API_KEY: ${{ secrets.FOOTBALL_DATA_API_KEY }}
        JWT_SECRET: test-secret-min-32-characters-here
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4 with node-version 20
        - run: npm ci
        - run: cd apps/api && npx prisma migrate deploy
        - run: npm run lint
        - run: npm run test
        - run: npm run build

    deploy-api:
      needs: lint-and-test
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4 with node-version 20
        - run: npm install -g @railway/cli
        - run: railway up --service kickoff-api
          env: RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

    build-mobile:
      needs: lint-and-test
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: actions/setup-node@v4 with node-version 20
        - run: npm install -g eas-cli
        - run: cd apps/mobile && eas build --platform all --profile preview --non-interactive
          env: EXPO_TOKEN: ${{ secrets.EXPO_TOKEN }}

apps/mobile/eas.json:
  {
    "cli": { "version": ">= 10.0.0" },
    "build": {
      "development": {
        "developmentClient": true,
        "distribution": "internal"
      },
      "preview": {
        "distribution": "internal",
        "android": { "buildType": "apk" }
      },
      "production": {
        "autoIncrement": true
      }
    }
  }

Required GitHub Secrets (add instructions as comment in ci.yml):
  RAILWAY_TOKEN      — from Railway dashboard → Account Settings → Tokens
  SUPABASE_URL       — from Supabase project Settings → API
  SUPABASE_SERVICE_KEY — from Supabase project Settings → API → service_role key
  FOOTBALL_DATA_API_KEY — from football-data.org dashboard
  EXPO_TOKEN         — from expo.dev → Account Settings → Access Tokens
  FIREBASE_SERVICE_ACCOUNT_JSON — from Firebase Console → Project Settings → Service accounts

Generate ALL files completely. This is the final step — ensure everything connects end to end.
```

---

## Checklist sau khi hoàn thành tất cả steps

Sau Step 6, verify các điểm sau trước khi merge vào main:

**API:**
- [ ] `GET /api/v1/health` trả về 200
- [ ] `GET /api/v1/matches` trả về matches từ DB
- [ ] Prisma migrations chạy thành công
- [ ] Seed data có đủ 48 trận

**Mobile:**
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
