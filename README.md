# ⚽ KickOff — World Cup 2026 Friend Betting App

> Xem lịch thi đấu, dự đoán kết quả, cạnh tranh điểm số cùng bạn bè — không tiền mặt, chỉ vui thôi.

![React Native](https://img.shields.io/badge/React_Native-0.74-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)
![Fastify](https://img.shields.io/badge/Fastify-4.x-000000?logo=fastify)
![Supabase](https://img.shields.io/badge/Supabase-realtime-3ECF8E?logo=supabase)
![Tamagui](https://img.shields.io/badge/Tamagui-UI-FF4154)

---

## Tính năng chính

- **📅 Lịch thi đấu** — Toàn bộ 104 trận World Cup 2026, lọc theo vòng đấu, tìm kiếm theo đội
- **⚡ Live score** — Tỉ số cập nhật realtime qua Supabase Realtime trong khi trận đang diễn ra
- **🔔 Thông báo** — Nhắc trước trận 30 phút, thông báo kết quả dự đoán
- **👥 Phòng cá cược** — Tạo room riêng, mời bạn bè bằng code 6 ký tự
- **🎯 Dự đoán** — Đặt tỉ số trước khi trận bắt đầu, khóa tự động lúc kickoff
- **🏆 Bảng xếp hạng** — Thống kê điểm, tỉ lệ đúng, ai dự đoán chuẩn nhất trong nhóm

---

## Tech Stack

### Mobile (apps/mobile)
| Thư viện | Mục đích |
|---|---|
| React Native 0.74 CLI | Core framework |
| TypeScript | Type safety |
| Tamagui | UI design system, dark mode |
| React Navigation v7 | Routing (tabs + stack + modal) |
| Reanimated 3 + Moti | Animations |
| Gesture Handler | Swipe, press gestures |
| React Query | Server state + caching |
| Zustand | Client state |
| Supabase JS | Auth + Realtime subscriptions |
| Notifee + Firebase Messaging | Push notifications |
| react-native-mmkv | Fast local storage |
| react-native-fast-image | Flag & avatar caching |
| dayjs | Date/time + timezone |

### API (apps/api)
| Thư viện | Mục đích |
|---|---|
| Fastify 4 | HTTP server |
| TypeScript | Type safety |
| Prisma + PostgreSQL | Database ORM |
| Supabase Admin | Realtime sync + Auth verify |
| node-cron | Score polling + reminders |
| Firebase Admin | FCM push notifications |
| Zod | Request validation |
| axios | Football data API client |

### Infrastructure
| Service | Mục đích |
|---|---|
| Supabase | PostgreSQL + Auth + Realtime |
| Railway | API deployment |
| GitHub Actions | CI/CD |
| football-data.org | Match data source |

---

## Cấu trúc thư mục

```
kickoff/
├── apps/
│   ├── mobile/                    # React Native app
│   │   ├── android/
│   │   ├── ios/
│   │   └── src/
│   │       ├── components/        # Tamagui UI components
│   │       │   └── ui/            # Badge, MatchCard, PredictionInput...
│   │       ├── screens/           # All screens
│   │       ├── navigation/        # React Navigation setup
│   │       ├── hooks/             # Custom hooks (useLiveScore, useNotifications...)
│   │       ├── stores/            # Zustand stores
│   │       ├── api/               # Axios client + API functions
│   │       └── utils/             # Date helpers, scoring logic
│   │
│   └── api/                       # Fastify backend
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── src/
│           ├── routes/            # matches, rooms, predictions, users
│           ├── services/          # matchSync, notification, supabaseSync...
│           ├── middleware/        # auth (Supabase JWT verify)
│           └── index.ts
│
└── packages/
    └── shared/                    # Shared TypeScript types
        └── src/index.ts
```

---

## Bắt đầu nhanh

### Yêu cầu

- Node.js 20+
- npm 10+
- PostgreSQL (hoặc dùng Supabase hosted)
- Xcode (iOS) / Android Studio (Android)
- Ruby + CocoaPods (iOS)

### 1. Clone & cài đặt

```bash
git clone https://github.com/your-org/kickoff.git
cd kickoff
npm install
```

### 2. Cấu hình environment

```bash
cp .env.example .env
```

Điền các giá trị vào `.env`:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/kickoff"

# Supabase
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_KEY="eyJ..."

# Football data
FOOTBALL_DATA_API_KEY="your_key_from_football-data.org"

# Auth
JWT_SECRET="your-secret-min-32-chars"

# Server
PORT=3000
```

Cho mobile, tạo `apps/mobile/.env`:

```env
API_URL=http://localhost:3000/api/v1
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### 3. Setup database

```bash
cd apps/api
npm run db:migrate   # chạy Prisma migrations
npm run db:seed      # seed 48 trận group stage WC2026
```

### 4. Chạy API

```bash
cd apps/api
npm run dev
# → API chạy tại http://localhost:3000
# → GET http://localhost:3000/api/v1/health để kiểm tra
```

### 5. Chạy mobile

**iOS:**
```bash
cd apps/mobile
npx pod-install ios
npm run ios
```

**Android:**
```bash
cd apps/mobile
npm run android
```

---

## Scoring system

| Kết quả dự đoán | Chế độ Exact Score | Chế độ Outcome Only |
|---|---|---|
| Đúng tỉ số chính xác (vd: 2-1 = 2-1) | **3 điểm** | 2 điểm |
| Đúng kết quả (thắng/thua/hòa) | **1 điểm** | **2 điểm** |
| Sai hoàn toàn | 0 điểm | 0 điểm |

Dự đoán bị **khóa tự động** đúng lúc kickoff — không thể sửa sau khi trận bắt đầu.

Kết quả của người khác trong room chỉ **hiện sau khi trận bắt đầu** — không thể copy nhau.

---

## API Endpoints

```
GET  /api/v1/health
GET  /api/v1/matches                   ?status= &stage= &date= &search=
GET  /api/v1/matches/live
GET  /api/v1/matches/upcoming
GET  /api/v1/matches/:id

POST /api/v1/rooms                     (auth)
GET  /api/v1/rooms/my                  (auth)
GET  /api/v1/rooms/join/:code
POST /api/v1/rooms/join                (auth)
DELETE /api/v1/rooms/:id/leave         (auth)
GET  /api/v1/rooms/:id                 (auth)
GET  /api/v1/rooms/:id/leaderboard     (auth)
GET  /api/v1/rooms/:id/matches/:matchId/predictions (auth)

POST /api/v1/predictions               (auth)
GET  /api/v1/predictions/my            (auth)

GET  /api/v1/users/me                  (auth)
PATCH /api/v1/users/me                 (auth)
GET  /api/v1/users/check?username=     (auth)
PUT  /api/v1/users/push-token          (auth)
```

---

## Scripts

```bash
# Root — chạy tất cả workspaces
npm run dev          # chạy api + mobile song song
npm run lint         # lint tất cả
npm run test         # test tất cả
npm run build        # build tất cả

# apps/api
npm run dev          # ts-node-dev watch mode
npm run build        # tsc compile
npm run db:migrate   # prisma migrate dev
npm run db:seed      # seed data
npm run db:studio    # Prisma Studio UI

# apps/mobile
npm run ios          # run on iOS simulator
npm run android      # run on Android emulator
npm run lint         # ESLint
npm run test         # Jest
```

---

## Deploy

API được deploy lên Railway tự động khi merge vào `main`.

```bash
# Manual deploy
railway up --service kickoff-api
```

Mobile build qua EAS (sau khi setup):
```bash
cd apps/mobile
eas build --platform all --profile preview
```

---

## Contributing

Xem [GITHUB_COPILOT_INSTRUCTIONS.md](./GITHUB_COPILOT_INSTRUCTIONS.md) để biết cách làm việc với Copilot Workspace Agent trong dự án này.
