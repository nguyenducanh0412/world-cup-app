# GitHub Copilot Workspace — Instructions & Conventions

Tài liệu này dành cho **GitHub Copilot Workspace Agent** làm việc trong dự án KickOff.
Đọc toàn bộ file này trước khi bắt đầu bất kỳ task nào.

---

## Tổng quan dự án

**KickOff** là ứng dụng React Native (CLI, không Expo) cho phép người dùng:
1. Xem lịch thi đấu + tỉ số realtime World Cup 2026
2. Tạo phòng riêng mời bạn bè
3. Dự đoán tỉ số trước khi trận bắt đầu
4. Cạnh tranh điểm số — không có tiền mặt, chỉ vui

**Cấu trúc — 2 repo độc lập (KHÔNG phải monorepo):**
```
kickoff-mobile/   → React Native 0.85.3 CLI + TypeScript  (repo này hoặc repo riêng)
kickoff-api/      → Node.js + Fastify + Prisma             (repo này hoặc repo riêng)
```

**QUAN TRỌNG — Shared types:**
- KHÔNG có `packages/shared` hay workspace packages
- Shared types được copy vào `src/types/shared.ts` trong mỗi repo
- Scoring logic được copy vào `src/utils/scoring.ts` trong mỗi repo
- Không dùng `workspace:*` hay `@kickoff/shared` — đây không phải monorepo

---

## Nguyên tắc bắt buộc

### Chung
- Luôn dùng **TypeScript strict mode** — không dùng `any`, không `@ts-ignore`
- Import shared types từ `src/types/shared.ts` trong cùng repo, không tự định nghĩa lại
- Mọi API response phải wrap trong `ApiResponse<T>` từ `src/types/shared.ts`
- Không commit secrets — dùng `.env` và `.env.example`
- Mỗi function phải có JSDoc tóm tắt mục đích nếu logic không trivial

### Git
- Branch: `feat/`, `fix/`, `chore/` prefix
- Commit message: `feat(mobile): add leaderboard animation` (conventional commits)
- Không push thẳng vào `main` — luôn qua PR
- PR phải pass CI (lint + test) trước khi merge

---

## Mobile (kickoff-mobile) — Conventions

### UI — Tamagui bắt buộc
```tsx
// ✅ ĐÚNG — dùng Tamagui primitives
import { XStack, YStack, Text, Card } from 'tamagui'

// ❌ SAI — không dùng React Native core trực tiếp trong screens/components
import { View, Text } from 'react-native'
```

Token màu sắc từ `tamagui.config.ts` — không hardcode hex:
```tsx
// ✅
<Text color="$accent" fontSize="$6" fontWeight="700" />

// ❌
<Text style={{ color: '#E8593C', fontSize: 22, fontWeight: '700' }} />
```

### Animation
- Dùng **Moti** cho entrance/exit animations đơn giản
- Dùng **Reanimated 3** cho gesture-driven hoặc performance-critical animations
- Không dùng `Animated` từ React Native core

```tsx
// Entrance animation đúng cách
import { MotiView } from 'moti'
<MotiView from={{ opacity: 0, translateY: 8 }} animate={{ opacity: 1, translateY: 0}} />

// Tap feedback
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
```

### Navigation
- Dùng React Navigation v7 typed hooks
- Luôn type params với `RootStackParamList`

```tsx
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RootStackParamList } from '@/navigation/types'

const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
```

### Data fetching
- Tất cả server state qua **React Query** — không fetch trong useEffect trực tiếp
- Query keys phải là arrays có cấu trúc: `['matches', { status: 'LIVE' }]`
- Mutations phải có `onSuccess` + `onError` handlers
- Optimistic updates cho prediction placement

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['matches', 'live'],
  queryFn: () => api.matches.getLive(),
  refetchInterval: 30_000,
})
```

### State management
- **Zustand** chỉ cho global client state (auth, rooms, live scores)
- Local UI state (modal open, tab index) dùng `useState`
- Không put server data vào Zustand — đó là việc của React Query

### Haptic feedback
Dùng `react-native-haptic-feedback` cho:
- Bet submission → `HapticFeedback.trigger('notificationSuccess')`
- Copy invite code → `HapticFeedback.trigger('impactMedium')`
- Error → `HapticFeedback.trigger('notificationError')`

### iOS / Android config
- `ios/Podfile` dùng cấu hình **standalone** (KHÔNG phải monorepo paths)
- `node_modules` nằm ở root của `kickoff-mobile/` — không cần `../../../`
- Podfile chuẩn:

```ruby
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

target 'kickoff-mobile' do
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
```

### File naming
```
screens/         PascalCase    HomeScreen.tsx
components/ui/   PascalCase    MatchCard.tsx
hooks/           camelCase     useLiveScore.ts
stores/          camelCase     authStore.ts
utils/           camelCase     scoring.ts
types/           camelCase     shared.ts
```

---

## API (kickoff-api) — Conventions

### Route structure
Mỗi domain = 1 Fastify plugin file trong `src/routes/`:

```ts
// src/routes/matches.ts
import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'

const matchesPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.get('/matches', {
    schema: {
      querystring: z.object({ status: z.enum(['SCHEDULED','LIVE','FINISHED']).optional() })
    }
  }, async (request, reply) => {
    // handler
  })
}

export default matchesPlugin
```

Register trong `src/index.ts`:
```ts
fastify.register(matchesPlugin, { prefix: '/api/v1' })
```

### Auth middleware
Routes cần auth phải dùng `preHandler`:
```ts
fastify.get('/rooms/my', { preHandler: [authenticate] }, handler)
```

`authenticate` middleware trong `src/middleware/auth.ts`:
- Verify Supabase JWT từ `Authorization: Bearer <token>`
- Attach `request.userId` (string, Supabase UUID)
- Auto-create `User` record trong DB nếu chưa tồn tại (first login)

### Service layer
Business logic **không** được đặt trong route handlers — luôn delegate sang service:

```ts
// ✅ Route handler gọn
fastify.post('/rooms', { preHandler: [authenticate] }, async (req, reply) => {
  const room = await roomService.createRoom(req.userId, req.body)
  return reply.code(201).send({ success: true, data: room })
})

// ❌ Logic trong handler
fastify.post('/rooms', async (req, reply) => {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase()
  const room = await prisma.room.create({ data: { ...req.body, inviteCode: code } })
  await prisma.roomMember.create({ data: { userId: req.userId, roomId: room.id } })
  // ... không làm thế này
})
```

### Error handling
Dùng Fastify's built-in error system:
```ts
throw fastify.httpErrors.notFound('Room not found')
throw fastify.httpErrors.forbidden('Not a member of this room')
throw fastify.httpErrors.badRequest('Match has already started')
```

### Prisma
- Không dùng `prisma.$queryRaw` trừ khi cần aggregation phức tạp
- Luôn `select` chỉ fields cần thiết — không fetch toàn bộ model
- Transactions cho operations liên quan đến nhiều bảng

```ts
// Settlement transaction
await prisma.$transaction(async (tx) => {
  await tx.prediction.updateMany({ where: { matchId }, data: { isSettled: true, pointsEarned } })
  // more operations
})
```

### Cron jobs (node-cron)
Tất cả cron jobs khởi tạo trong `src/services/scheduler.ts`:
```ts
// Mỗi phút check reminders
cron.schedule('* * * * *', () => notificationScheduler.checkReminders())

// Mỗi 60s update live scores (chỉ trong World Cup period)
cron.schedule('*/60 * * * * *', () => matchSyncService.updateLiveScores())
```

---

## Shared types — copy vào từng repo

Vì không có monorepo, shared types được duy trì độc lập trong mỗi repo.
Khi cần thêm/sửa type: cập nhật cả 2 file bên dưới đồng thời.

**kickoff-api:** `src/types/shared.ts`
**kickoff-mobile:** `src/types/shared.ts`

```ts
// src/types/shared.ts
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'
export type MatchStage = 'GROUP' | 'R16' | 'QF' | 'SF' | 'THIRD_PLACE' | 'FINAL'
export type ScoringMode = 'EXACT_SCORE' | 'OUTCOME_ONLY'

export interface Match {
  id: string
  externalId: string
  homeTeam: string
  awayTeam: string
  homeScore: number | null
  awayScore: number | null
  scheduledAt: string   // ISO string
  status: MatchStatus
  stage: MatchStage
  groupName: string | null
  venue: string | null
}

export interface ApiResponse<T> { success: boolean; data: T }
export interface PaginatedResponse<T> { success: boolean; data: T[]; total: number; page: number; pageSize: number }
// ... các interfaces khác xem đầy đủ trong file
```

---

## Testing conventions

### API tests (Vitest)
```ts
// src/__tests__/services/betService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { predictionService } from '@/services/predictionService'
import { prismaMock } from '../__mocks__/prisma'

describe('predictionService.placePrediction', () => {
  it('throws if match already started', async () => {
    prismaMock.match.findUnique.mockResolvedValue({
      ...mockMatch,
      status: 'LIVE'
    })
    await expect(
      predictionService.placePrediction('user-1', 'match-1', 'room-1', 2, 1)
    ).rejects.toThrow('Match has already started')
  })
})
```

### Mobile tests (Jest + Testing Library)
```tsx
// src/__tests__/components/MatchCard.test.tsx
import { render, screen } from '@testing-library/react-native'
import { MatchCard } from '@/components/ui/MatchCard'
import { TamaguiProvider } from 'tamagui'
import config from '../../tamagui.config'

const wrapper = ({ children }) => (
  <TamaguiProvider config={config}>{children}</TamaguiProvider>
)

it('shows LIVE badge when match is live', () => {
  render(<MatchCard match={liveMatchMock} />, { wrapper })
  expect(screen.getByText('LIVE')).toBeTruthy()
})
```

---

## Scoring logic

Nguồn duy nhất: `src/utils/scoring.ts` trong mỗi repo (nội dung giống hệt nhau).

```ts
// src/utils/scoring.ts
import type { ScoringMode } from '@/types/shared'

export function calculatePoints(
  predictedHome: number,
  predictedAway: number,
  actualHome: number,
  actualAway: number,
  mode: ScoringMode
): number {
  const exactMatch = predictedHome === actualHome && predictedAway === actualAway
  const predictedOutcome = Math.sign(predictedHome - predictedAway)
  const actualOutcome = Math.sign(actualHome - actualAway)
  const correctOutcome = predictedOutcome === actualOutcome

  if (mode === 'EXACT_SCORE') {
    if (exactMatch) return 3
    if (correctOutcome) return 1
    return 0
  }

  if (mode === 'OUTCOME_ONLY') {
    return correctOutcome ? 2 : 0
  }

  return 0
}
```

---

## Environment variables

### API (kickoff-api/.env)
| Var | Bắt buộc | Mô tả |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | ✅ | Service role key (admin) |
| `FOOTBALL_DATA_API_KEY` | ✅ | football-data.org API key |
| `JWT_SECRET` | ✅ | Min 32 chars |
| `PORT` | ❌ | Default: 3000 |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ✅ | FCM push notifications |

### Mobile (kickoff-mobile/.env)
| Var | Bắt buộc | Mô tả |
|---|---|---|
| `API_URL` | ✅ | Base URL của API |
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_ANON_KEY` | ✅ | Anon/public key |

Mobile env đọc qua `react-native-config` — prefix `API_URL` không cần `REACT_APP_`.

---

## Luồng dữ liệu quan trọng

### Prediction flow
```
User nhập tỉ số
  → POST /api/v1/predictions
  → Validate: match.status === SCHEDULED && match.scheduledAt > now
  → Validate: user là member của room
  → Upsert prediction (cho phép edit trước kickoff)
  → 200 OK

Khi match bắt đầu (status → LIVE):
  → matchSyncService detect status change
  → Predictions bị "khóa" — không thể tạo mới hoặc edit
  → Predictions của người khác trong room hiện ra (reveal)

Khi match kết thúc (status → FINISHED):
  → matchSyncService gọi predictionService.settlePredictions(matchId)
  → calculatePoints() cho từng prediction
  → Update isSettled=true, pointsEarned
  → Gửi push notification cho từng user
  → Supabase Realtime cập nhật leaderboard
```

### Live score flow
```
node-cron mỗi 60s:
  → GET football-data.org/matches?status=IN_PLAY
  → So sánh với DB
  → Nếu score thay đổi: UPDATE Match
  → Upsert Supabase table "live_scores"
  → Mobile subscribed via Supabase Realtime → cập nhật UI tức thì
```

---

## Những điều KHÔNG làm

- ❌ Không thêm payment, subscription plan, hoặc bất kỳ tính năng liên quan đến tiền
- ❌ Không dùng `any` trong TypeScript
- ❌ Không fetch data trực tiếp trong `useEffect` — dùng React Query
- ❌ Không dùng `View`/`Text` của React Native trong screens — dùng Tamagui
- ❌ Không hardcode màu sắc — dùng Tamagui tokens
- ❌ Không đặt business logic trong route handlers — delegate sang service
- ❌ Không gọi `prisma` trực tiếp từ routes — qua service layer
- ❌ Không hiện predictions của người khác khi match còn SCHEDULED
- ❌ Không cho phép đặt prediction sau khi match đã bắt đầu
- ❌ Không dùng monorepo workspaces — 2 repo độc lập
- ❌ Không import từ `@kickoff/shared` — import từ `src/types/shared.ts`
- ❌ Không dùng `../../../node_modules` trong Podfile — dùng `config[:reactNativePath]`

---

## CI pipeline

**kickoff-api** — GitHub Actions chạy khi có push/PR:

**lint-and-test** (tất cả branches):
1. `npm run lint` — ESLint
2. `npm run test` — Vitest
3. `npm run build` — build check

**deploy** (chỉ khi merge vào `main`):
1. `railway up --service kickoff-api`

**kickoff-mobile** — GitHub Actions:

**build-mobile** (chỉ khi merge vào `main`):
1. `eas build --platform all --profile preview`

PR không được merge nếu CI fail.

---

## Step-by-step build guide

Xem file [COPILOT_STEPS.md](./COPILOT_STEPS.md) để có đầy đủ 6 prompts cho Copilot Workspace Agent, chạy theo thứ tự từ Step 1 → Step 6.