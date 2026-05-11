# ⚽ KickOff — World Cup 2026 Friend Betting App

> Xem lịch thi đấu, dự đoán kết quả, cạnh tranh điểm số cùng bạn bè — không tiền mặt, chỉ vui thôi.

![React Native](https://img.shields.io/badge/React_Native-0.85.3-61DAFB?logo=react)
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

### Mobile (mobile)
| Thư viện | Mục đích |
|---|---|
| React Native 0.85.3 CLI | Core framework |
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

### API (api)
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

**2 repo độc lập — không phải monorepo:**

```
api/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── routes/            # matches, rooms, predictions, users
│   ├── services/          # matchSync, notification, supabaseSync...
│   ├── middleware/        # auth (Supabase JWT verify)
│   ├── types/
│   │   └── shared.ts      # Shared TypeScript types (copy từ mobile)
│   └── utils/
│       └── scoring.ts     # Scoring logic (copy từ mobile)
├── .env.example
└── index.ts

mobile/
├── android/
├── ios/
└── src/
    ├── components/
    │   └── ui/            # Badge, MatchCard, PredictionInput...
    ├── screens/           # All screens
    ├── navigation/        # React Navigation setup
    ├── hooks/             # useLiveScore, useNotifications...
    ├── stores/            # Zustand stores
    ├── api/               # Axios client + API functions
    ├── types/
    │   └── shared.ts      # Shared TypeScript types (copy từ api)
    └── utils/
        └── scoring.ts     # Scoring logic (copy từ api)
```

> **Shared types & scoring logic** được giữ đồng bộ thủ công giữa 2 repo.
> Khi thay đổi một bên, nhớ cập nhật bên kia.

---

## Bắt đầu nhanh

### Yêu cầu

- Node.js 20+
- npm 10+
- PostgreSQL (hoặc dùng Supabase hosted)
- Xcode (iOS) / Android Studio (Android)
- Ruby + CocoaPods (iOS)

### 1. Clone cả 2 repo

```bash
git clone https://github.com/your-org/api.git
git clone https://github.com/your-org/mobile.git
```

### 2. Setup API

```bash
cd api
npm install
cp .env.example .env
```

Điền các giá trị vào `.env`:

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/kickoff"
SUPABASE_URL="https://xxxx.supabase.co"
SUPABASE_SERVICE_KEY="eyJ..."
FOOTBALL_DATA_API_KEY="your_key_from_football-data.org"
JWT_SECRET="your-secret-min-32-chars"
PORT=3000
FIREBASE_SERVICE_ACCOUNT_JSON='{...}'
```

```bash
npm run db:migrate   # chạy Prisma migrations
npm run db:seed      # seed 48 trận group stage WC2026
npm run dev          # API chạy tại http://localhost:3000
```

### 3. Setup Mobile

```bash
cd mobile
npm install
cp .env.example .env
```

Điền `.env`:

```env
API_URL=http://localhost:3000/api/v1
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

**iOS:**
```bash
cd ios && pod install && cd ..
npm run ios
```

**Android:**
```bash
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
# api
npm run dev          # ts-node-dev watch mode
npm run build        # tsc compile
npm run test         # Vitest
npm run lint         # ESLint
npm run db:migrate   # prisma migrate dev
npm run db:seed      # seed data
npm run db:studio    # Prisma Studio UI
npm run db:reset     # prisma migrate reset

# mobile
npm run ios          # run on iOS simulator
npm run android      # run on Android emulator
npm run lint         # ESLint
npm run test         # Jest
```

---

## Deploy

**API** deploy lên Railway tự động khi merge vào `main`:

```bash
# Manual deploy
cd api
railway up --service api
```

**Mobile** build qua EAS:

```bash
cd mobile
eas build --platform all --profile preview
```

---

## Contributing

Xem [GITHUB_COPILOT_INSTRUCTIONS.md](./GITHUB_COPILOT_INSTRUCTIONS.md) để biết conventions và cách làm việc với Copilot Workspace Agent trong dự án này.

Xem [COPILOT_STEPS.md](./COPILOT_STEPS.md) để có đầy đủ 6 prompts build từng bước.