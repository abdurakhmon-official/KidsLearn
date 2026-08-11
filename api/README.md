# KidsLearn — Backend API

1–7 yoshdagi bolalar uchun interaktiv ta'lim platformasi. REST API.

Node.js + TypeScript, [Ts.ED](https://tsed.io) (Express 5 ustida), PostgreSQL va Prisma ORM.
Validatsiya uchun Zod, autentifikatsiya uchun JWT.

---

## Mundarija

- [Texnologiyalar](#texnologiyalar)
- [Ishga tushirish](#ishga-tushirish)
- [Docker](#docker)
- [Autentifikatsiya va rollar](#autentifikatsiya-va-rollar)
- [Papka strukturasi](#papka-strukturasi)
- [Ma'lumotlar modeli](#malumotlar-modeli)
- [Endpointlar](#endpointlar)
- [Qidiruv, filtr va pagination](#qidiruv-filtr-va-pagination)
- [Ball, yulduz, streak va medallar](#ball-yulduz-streak-va-medallar)
- [Bildirishnomalar](#bildirishnomalar)
- [Media fayllar](#media-fayllar)
- [Javob formati va xatoliklar](#javob-formati-va-xatoliklar)
- [Environment o'zgaruvchilari](#environment-ozgaruvchilari)
- [Ishonchlilik va xavfsizlik](#ishonchlilik-va-xavfsizlik)
- [Arxitektura qarorlari](#arxitektura-qarorlari)

---

## Texnologiyalar

| Qatlam     | Texnologiya                    |
| ---------- | ------------------------------ |
| Runtime    | Node.js 20+, TypeScript 5      |
| Framework  | Ts.ED 8 (Express 5 adapter)    |
| Database   | PostgreSQL 14+                 |
| ORM        | Prisma 6                       |
| Validation | Zod 3                          |
| Auth       | JWT (`jsonwebtoken`) + bcrypt  |
| Docs       | Swagger UI (OpenAPI 3.0.3)     |
| Security   | helmet, cors, hpp, compression, express-rate-limit |
| Tests      | Jest (unit) + smoke skript (e2e) |

---

## Ishga tushirish

```bash
yarn install
cp .env.sample .env      # DATABASE_URL va JWT_SECRET ni to'ldiring
yarn db:migrate          # migratsiyalarni qo'llaydi
yarn db:seed             # demo ma'lumotlar
yarn dev
```

Server `http://localhost:9100/api/v1`, Swagger `http://localhost:9100/docs`.

### Demo akkauntlar

| Rol | Email | Parol |
| --- | --- | --- |
| ADMIN | `admin@kidslearn.uz` | `password123` |
| PARENT | `ota-ona@kidslearn.uz` | `password123` |

Ota-ona akkauntida uchta demo bola bor — har bir yosh guruhidan bittadan, oxirgi
bir haftalik faollik, ball, yulduz va medallar bilan.

### Skriptlar

| Skript | Vazifa |
| --- | --- |
| `yarn dev` | nodemon + ts-node |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn build` | `dist/` ga kompilyatsiya |
| `yarn db:migrate` / `db:deploy` / `db:reset` | migratsiyalar |
| `yarn db:seed` / `db:studio` | seed / Prisma Studio |
| `yarn test` | Jest (unit testlar hozircha yozilmagan — `__tests__/` da rejalashtirilgan) |
| `yarn test:smoke` | 80 ta uchidan-uchiga tekshiruv ishlab turgan serverga qarshi |
| `yarn generate:types` | frontend uchun tiplar |

**`yarn test`** — Jest sozlangan, lekin unit testlar hozircha yozilmagan. Ular
keyinchalik `__tests__/` papkasida yoziladi: yosh hisobi va chegaralari, sana
mantiqi (`dateOnly` va `startOfLocalDay` farqi), streak, yulduzchalar, medal
qoidalari, sort oq ro'yxati va kesh.

**`yarn test:smoke`** — barcha modullarni real HTTP so'rovlar bilan tekshiradi:
auth oqimi, RBAC chegaralari, yosh guruhi filtrlari, ball/yulduz/streak hisobi,
medallar, bildirishnomalar va dashboard grafiklari. Takroriy yugurtirishga
chidamli. Ishlab turgan server talab qiladi.

---

## Docker

```bash
JWT_SECRET=uzun-tasodifiy-satr docker compose up --build
```

`docker-compose.yml` ikkita servisni ko'taradi:

- **db** — PostgreSQL 16, `kidslearn-pgdata` volume'ida saqlanadi, healthcheck bilan;
- **api** — build qilingan backend. Konteyner ko'tarilganda `prisma migrate deploy`
  avtomatik ishlaydi, shuning uchun kod va sxema doim mos bo'ladi.

API `http://localhost:9100` da. Demo ma'lumot kerak bo'lsa:

```bash
docker compose exec api npx prisma db seed
```

---

## Autentifikatsiya va rollar

Uchta rol bor, lekin **ikkita jadval**:

| Rol | Jadval | Qanday kiradi |
| --- | --- | --- |
| `ADMIN` | `users` | email + parol |
| `PARENT` | `users` | email + parol |
| `CHILD` | `children` | **parol yo'q** — ota-ona kirib, profil tanlaydi |

Bola 1–7 yoshda va parol yozolmaydi, shuning uchun bola sessiyasi ota-ona
tokenidan olinadi:

```
POST /api/v1/auth/login                   → PARENT token
POST /api/v1/auth/children/:id/select     → CHILD token
```

CHILD token payload'i: `{ sub: <parentId>, role: 'CHILD', childId, jti }`.

Uchta xavfsizlik nuqtasi:

- bolaga tegishli endpointlar `childId` ni **tokendan** oladi, URL'dan emas —
  bola boshqa bolaning (hatto aka-ukasining) ma'lumotini so'ray olmaydi;
- **bola tokeni hech qachon admin huquqini bermaydi**, ota-onasi ADMIN bo'lsa ham —
  chunki qurilma bolaning qo'lida bo'ladi;
- har bir bola sessiyasi ota-onasiga bog'langan, `TokenService` revocation
  mexanizmi o'zgarishsiz ishlaydi.

Dekoratorlar:

```ts
@Authorized(Authenticate())   // har qanday kirgan foydalanuvchi
@Authorized(AdminOnly())
@Authorized(ParentOnly())
@Authorized(ChildOnly())
```

ADMIN barcha rol tekshiruvlaridan o'tadi (CHILD sessiyasidan tashqari).

### Yosh va yosh guruhi

Bolaning yoshi **DB da saqlanmaydi** — har so'rovda `birthDate` dan hisoblanadi,
shunda tug'ilgan kun kelganda guruh o'zi siljiydi ([utils/age.ts](./utils/age.ts)).

| Guruh | Yosh | Mavzular |
| --- | --- | --- |
| `AGE_1_2` | 1–2 | Ranglar, Hayvonlar, Mevalar |
| `AGE_3_4` | 3–4 | Harflar, Raqamlar, Shakllar |
| `AGE_5_7` | 5–7 | Ingliz alifbosi, Sodda matematika, Mantiqiy o'yinlar |

Yosh bo'yicha **filtrlash** ham shu sababli `birthDate` oralig'iga aylantiriladi
(`birthDateRangeFor`) — aks holda har bir bolani o'qib, xotirada filtrlashga to'g'ri kelardi.

---

## Papka strukturasi

```
config/        STAGE bo'yicha (local/prod/testing) sozlamalar
controllers/   Ts.ED @Controller — ingichka, faqat service'ga uzatadi
services/      @Injectable() — biznes-logika, Prisma so'rovlari
types/         qo'lda yozilgan tiplar va interfeyslar, domen bo'yicha
inputs/        Zod schema + z.infer tiplar
outputs/       javob shakllari
middlewares/   auth, rate-limit, request-id, logging, 404, global error filter
modules/       db (prisma), auth (JWT/bcrypt), nanoid, express declarations
utils/         age, date, awards, streak, stars, sorting, slug, shuffle, constants
prisma/        schema, migratsiyalar, seed
generated/     Prisma client + zod tiplar (git'ga kirmaydi)
```

### `types/` qatlami

Qo'lda yozilgan tiplar va interfeyslar shu yerda, domen bo'yicha ajratilgan:

| Fayl | Nima bor |
| --- | --- |
| `auth.ts` | `AUTH_ROLE`, `AuthRole`, `RoleRequirements`, `AccessToken`, `AccessTokenPayload`, `TokenSubject`, `AuthenticatedUser`, `AuthenticatedChild` |
| `child.ts` | `WithAge<T>`, `CHILD_SORT_KEYS` |
| `user.ts` · `lesson.ts` · `media.ts` | `*_SORT_KEYS` — `sortBy` da ruxsat etilgan ustunlar |
| `game.ts` | `GameAnswerResult`, `GameConfig`, `GAME_SORT_KEYS` |
| `activity.ts` | `ActivityInput` |
| `award.ts` | `AwardStats`, `AwardContext`, `AwardDraft`, `AwardRule` |
| `notification.ts` | `NotificationDraft`, `NotifiableAward`, `NOTIFICATION_SORT_KEYS` |
| `dashboard.ts` | `CategoryPerformance`, `ChartDay`, `ActivityChart`, `DailyActivityRow`, … |
| `common.ts` | `ErrorResponse`, `ErrorPayload`, `ErrorDetail` |

**Prisma `select` / `include` obyektlari bu yerda emas** — ular ishlatiladigan
servisning o'zida, so'rovning yonida yoziladi:

```ts
const child = await prisma.child.findUnique({
  where: { id },
  select: { id: true, fullName: true, birthDate: true, stats: true },
});
```

Sabab: so'rov nima qaytarishini ko'rish uchun boshqa faylga o'tish kerak
bo'lmaydi. Bir xil select bir necha joyda takrorlanishi mumkin — bu ataylab
qabul qilingan murosа.

Ikkita istisno ataylab qoldirilgan:

- **`inputs/*.input.ts`** dagi `z.infer` tiplari — ular zod sxemasidan
  avtomatik chiqadi va sxemaning yonida turishi kerak, aks holda `types/`
  `inputs/` ga qarama-qarshi bog'lanib qolardi;
- **`modules/declarations.ts`** dagi `declare global` — Express `Request` va
  `ProcessEnv` kengaytmalari global augmentatsiya bo'lgani uchun boshqa joyga
  ko'chirib bo'lmaydi. Tiplarning o'zi baribir `types/auth.ts` dan olinadi.

---

## Ma'lumotlar modeli

| Guruh | Modellar |
| --- | --- |
| Foydalanuvchilar | `User`, `Child` |
| Kontent | `Category`, `Lesson`, `LessonMedia`, `Game`, `GameItem`, `MediaAsset` |
| Progress | `LessonProgress`, `GameSession`, `ChildStats`, `DailyActivity`, `Award` |
| Bildirishnoma | `Notification` |

---

## Endpointlar

Barchasi `/api/v1` ostida. Swagger — `/docs`.

### `/auth`

| Metod | Yo'l | Kim |
| --- | --- | --- |
| POST | `/auth/register` | ochiq — bo'sh bazada birinchi foydalanuvchi ADMIN bo'ladi |
| POST | `/auth/login` | ochiq |
| POST | `/auth/logout` | auth |
| POST | `/auth/children/:id/select` | PARENT → CHILD token |
| GET | `/auth/me` | auth — PARENT'da bolalar, CHILD'da bola profili |
| PUT | `/auth/profile` · `/auth/password` | auth |

### `/children`

| Metod | Yo'l | Kim |
| --- | --- | --- |
| GET | `/children` | PARENT — profil tanlash ro'yxati |
| GET | `/children/paginated` | auth — qidiruv (bola/ota-ona ismi), filtr (`age`, `ageGroup`, `active`, `parentId`) |
| GET | `/children/:id` · `/:id/progress` · `/:id/awards` | egasi yoki ADMIN |
| POST | `/children` | PARENT (ADMIN `parentId` bilan) |
| PUT · DELETE | `/children/:id` | egasi yoki ADMIN |

### `/categories`

| Metod | Yo'l | Kim |
| --- | --- | --- |
| GET | `/categories` (`?all=true` — nofaollar ham) · `/categories/:id` | auth |
| POST · PUT · DELETE | `/categories`, `/categories/:id` | ADMIN |

### `/lessons`

| Metod | Yo'l | Kim |
| --- | --- | --- |
| GET | `/lessons/paginated` | auth — qidiruv + filtr (`ageGroup`, `categoryId`, `active`, `from`, `to`) |
| GET | `/lessons/for-me` | CHILD — **faqat o'z yosh guruhi**, progress bilan |
| GET | `/lessons/:id` | auth |
| POST · PUT · DELETE | `/lessons`, `/lessons/:id` | ADMIN |
| POST · DELETE | `/lessons/:id/media`, `/lessons/:id/media/:mediaId` | ADMIN |
| POST | `/lessons/:id/progress` | CHILD — ko'rildi / tugatildi |

### `/games`

| Metod | Yo'l | Kim |
| --- | --- | --- |
| GET | `/games/paginated` | auth — filtr (`ageGroup`, `code`, `categoryId`, `active`) |
| GET | `/games/for-me` | CHILD — yosh guruhiga mos, eng yaxshi natija bilan |
| GET | `/games/:id` | auth — savollar faqat ADMIN'ga |
| GET | `/games/:id/play` | CHILD — **`correct_value` siz**, aralashtirilgan |
| POST | `/games/:id/submit` | CHILD — javoblar → ball, yulduz, medal |
| POST · PUT · DELETE | `/games`, `/games/:id` | ADMIN |
| GET · POST · PUT · DELETE | `/games/:id/items`, `/games/:id/items/:itemId` | ADMIN |

### `/progress`, `/dashboard`

| Metod | Yo'l | Kim |
| --- | --- | --- |
| GET | `/progress/me` · `/progress/me/awards` | CHILD |
| GET | `/dashboard/parent?childId=` | PARENT |
| GET | `/dashboard/admin` | ADMIN |
| GET | `/dashboard/leaderboard?period=week\|month\|all&ageGroup=&limit=` | auth |

### `/notifications`, `/media`, `/users`, `/health`

| Metod | Yo'l | Kim |
| --- | --- | --- |
| GET | `/notifications/paginated` (`?unread_only=true&type=`) | auth |
| PUT | `/notifications/:id/read` · `/notifications/read-all` | auth |
| POST | `/notifications/daily-digest` | ADMIN — kunlik cron |
| GET | `/media/paginated` (`?type=IMAGE\|VIDEO\|AUDIO`) · `/media/:id` | ADMIN |
| POST · DELETE | `/media`, `/media/:id` | ADMIN |
| GET | `/users/paginated` · `/users/:id` | ADMIN |
| POST · PUT · DELETE | `/users`, `/users/:id`, `/users/:id/status` | ADMIN |
| GET | `/health` | ochiq |

---

## Qidiruv, filtr va pagination

Barcha `/paginated` endpointlari bir xil query parametrlarini oladi
([inputs/basic.search.ts](./inputs/basic.search.ts)) va `{ items, count }` qaytaradi:

```
GET /api/v1/children/paginated?page=1&size=20&search=malika
    &sortBy[0][key]=created_at&sortBy[0][order]=desc
    &ageGroup=AGE_3_4&active=true
```

`sortBy` ichma-ich sintaksisi uchun Express 5 da `query parser` `extended` ga
o'rnatilgan ([server.ts](./server.ts)) — standart `simple` parser buni ocholmaydi.

Qidiruv bir nechta ustunni qamraydi: bolalar bo'yicha — bola ismi **va** ota-ona
ismi/emaili; foydalanuvchilar bo'yicha — ism, email, telefon **va** farzand ismi.

---

## Ball, yulduz, streak va medallar

Har qanday faollik bitta joydan o'tadi — [`ActivityService.record()`](./services/activity.service.ts).
U bitta tranzaksiyada `ChildStats` va `DailyActivity` ni yangilaydi, streak'ni
hisoblaydi, so'ng `AwardService` medallarni tekshiradi.

**Yulduzchalar** — to'g'ri javoblar foizidan: `≥90% → 3`, `≥70% → 2`, `≥40% → 1`.

**Streak** — oxirgi faollik kechagi kun bo'lsa `+1`, bugun bo'lsa o'zgarmaydi,
oradan kun tushib qolgan bo'lsa `1` ga tushadi.

**Ball** — o'yinda `to'g'ri javoblar × points_per_correct`, darsda `lesson.points`.
Dars ball keltiradi **faqat birinchi marta tugatilganda** — qayta ko'rish ball
to'plash yo'liga aylanmasin.

**Medallar** ([utils/awards.ts](./utils/awards.ts)) — barchasi `ChildStats` dan
hisoblanadi, shuning uchun har faollikdan keyin bir xil tarzda qayta tekshiriladi.
Takrorlanishni `awards` jadvalidagi `childId + code` unique kafolatlaydi.

| Kod | Shart | Medal |
| --- | --- | --- |
| `FIRST_LESSON` / `FIRST_GAME` | birinchi dars / o'yin | BRONZE |
| `LESSONS_10` / `LESSONS_50` | tugatilgan darslar | SILVER / GOLD |
| `POINTS_100` … `POINTS_5000` | ball chegarasi | BRONZE → DIAMOND |
| `STREAK_3` / `STREAK_7` / `STREAK_30` | ketma-ket kunlar | BRONZE / SILVER / DIAMOND |
| `PERFECT_GAME` | xatosiz o'yin | SILVER |
| `CATEGORY_MASTER_<slug>` | fanning barcha darslari | GOLD |

---

## Bildirishnomalar

| Tur | Qachon |
| --- | --- |
| `NEW_LESSON` | admin dars qo'shganda — yosh guruhiga mos bolasi bor ota-onalarga |
| `AWARD_EARNED` | bola medal olganda |
| `NO_ACTIVITY_TODAY` | kunlik job — bugun shug'ullanmagan bolalar bo'yicha |

Kunlik eslatma `POST /api/v1/notifications/daily-digest` orqali ishga tushadi va
**bir kunda bir bola uchun bir marta** yuboriladi (qayta chaqirish xavfsiz).
Tashqi cron uni admin akkaunt tokeni bilan kuniga bir marta chaqirishi kerak:

```
0 19 * * *  curl -X POST https://<host>/api/v1/notifications/daily-digest -H "Authorization: Bearer <admin token>"
```

---

## Media fayllar

`MediaAsset` — S3 ga yuklangan fayllar registri (admin panelidagi
"Rasmlar / Videolar / Audio"). Yuklashning o'zi alohida servisda:

- yuklovchi servis faylni S3 ga qo'yadi, so'ng `POST /api/v1/media` bilan yozuvni
  registrga qo'shadi (`url`, `key`, `mime_type`, `size`);
- `DELETE /api/v1/media/:id` yozuvni o'chirib, **S3 obyekt kalitini qaytaradi** —
  chaqiruvchi bucket'dan ham o'chirishi uchun.

---

## Javob formati va xatoliklar

```json
{ "success": true, "_message": "saved", "data": { } }
```

Ro'yxatlar `{ items, count }`, bildirishnomalar qo'shimcha `unread` qaytaradi.

Xatoliklar `GlobalErrorFilter` orqali bir xil shaklda; Zod validatsiya xatolari
maydonlar ro'yxati bilan `400` bo'lib chiqadi. `401` — token yo'q/yaroqsiz/bekor
qilingan, `403` — kirgan, lekin huquqi yo'q.

---

## Environment o'zgaruvchilari

| Nomi | Majburiy | Izoh |
| --- | --- | --- |
| `DATABASE_URL` | ha | PostgreSQL ulanish satri |
| `JWT_SECRET` | ha | uzun tasodifiy satr |
| `JWT_EXPIRES_IN` | yo'q | standart `1d` |
| `JWT_ISSUER`, `JWT_AUDIENCE` | yo'q | tokenga `iss`/`aud` da'volari; boshqa muhitning tokeni ishlamaydi |
| `API_ROOT` | yo'q | standart `/api/v1` |
| `PORT` | yo'q | standart `3000`, `.env.sample` da `9100` |
| `STAGE` | yo'q | `local` / `testing` / `production` |
| `CORS_ORIGIN` | yo'q | vergul bilan ajratilgan ro'yxat yoki `*` |
| `SWAGGER_ENABLED`, `SWAGGER_PATH` | yo'q | hujjatlar |
| `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET` | media uchun | S3 |

---

## Ishonchlilik va xavfsizlik

### Rate limiting

| Qamrov | Chegara |
| --- | --- |
| Butun API | 15 daqiqada 300 so'rov / IP |
| `/auth/login`, `/auth/register` | 15 daqiqada **10 muvaffaqiyatsiz** urinish / IP |

Auth chegarasida `skipSuccessfulRequests` yoqilgan — faqat noto'g'ri parol
sanaladi. Maqsad brute-force'ni to'xtatish, bir IP ortidagi butun oilani
bloklash emas.

### Yozuv yo'llarining atomiyligi

O'yin natijasi va dars progressi statistika bilan **bitta tranzaksiyada**
yoziladi:

| Tranzaksiya ichida | Tranzaksiyadan keyin |
| --- | --- |
| `GameSession` / `LessonProgress` | medallarni baholash |
| `ChildStats` (streak, ball, yulduz) | bildirishnoma yozish |
| `DailyActivity` | |

Medallar ataylab tashqarida: ular `childId + code` unique bilan idempotent,
shuning uchun qayta chaqirish xavfsiz — bildirishnoma yozuvini uzun
tranzaksiya ichiga tortib, qulflarni ushlab turishdan yaxshiroq.

Streak o'qib-keyin-yoziladigan qiymat, shuning uchun tranzaksiya boshida shu
bolaning `child_stats` satri `SELECT … FOR UPDATE` bilan qulflanadi. Turli
bolalar bir-birini kutmaydi.

### Sessiyani bekor qilish

Logout `revoked_tokens` jadvaliga yoziladi, xotiraga emas — shuning uchun
server restartidan va ikkinchi instansdan omon qoladi. Xotiradagi `Map`
uning oldida kesh bo'lib turadi. Muddati o'tgan yozuvlar har 5 daqiqada
tozalanadi.

### Kuzatuv

Har bir so'rovga `x-request-id` beriladi (kiruvchi sarlavha bo'lsa saqlanadi),
u javob sarlavhasida, logda va xato javobining `request_id` maydonida
takrorlanadi — foydalanuvchi aytgan id bo'yicha logdan aynan o'sha so'rovni
topsa bo'ladi.

| Endpoint | Vazifa |
| --- | --- |
| `GET /health/live` | jarayon tirikmi — bog'liqliklarni tekshirmaydi |
| `GET /health/ready` | bazaga `SELECT 1` yuboradi; ulanmasa `503` |

`live` va `ready` ajratilgani muhim: baza vaqtincha yiqilganda orkestrator
konteynerni qayta ishga tushirmasligi, faqat trafikni to'xtatishi kerak.

`SIGTERM`/`SIGINT` da graceful shutdown — ochiq so'rovlar tugatiladi, Prisma
ulanishi yopiladi, 10 soniyadan keyin majburan chiqiladi.

### Qidiruv indeksi

Qidiruv `ILIKE '%...%'` bilan ishlaydi va oddiy btree indeks bunga yordam
bermaydi. Migratsiya `pg_trgm` kengaytmasini yoqib, GIN indekslar quradi:
`children.fullName`, `users.fullName`, `users.email`, `lessons.title`,
`games.title`, `media_assets.original_name`.

> Demo hajmdagi ma'lumotda planner baribir `Seq Scan` tanlaydi — bu to'g'ri
> xulq. Indeks jadval o'sganda ishlay boshlaydi.

### Kesh

`GET /categories` javobi 5 daqiqaga keshlanadi. Kesh `@tsed/platform-cache`
(ichkarida `cache-manager`) orqali ishlaydi, sozlamasi [server.ts](./server.ts)
dagi `cache` blokida. Bir vaqtda kelgan so'rovlar bitta bazaga murojaatga
birlashtiriladi (*cache stampede* himoyasi).

Uch nuqta muhim:

- **Invalidatsiya** — `create` / `update` / `delete` dan keyin
  ([category.service.ts](./services/category.service.ts)). Bo'lmasa admin
  o'zi qo'shgan kategoriyani 5 daqiqa ko'rmasdi.
- **Alohida kalitlar** — `categories:active` va `categories:all`. Bitta kalit
  bo'lganda admin so'ragan nofaol kategoriyalar oddiy foydalanuvchiga ham
  ko'rinib qolardi.
- **TTL — xavfsizlik to'ri.** Invalidatsiya faqat shu jarayondagi
  o'zgarishlarni biladi; boshqa instans, seed yoki to'g'ridan-to'g'ri SQL
  orqali qilingan o'zgarish eng ko'pi bilan 5 daqiqada o'zi tuziladi.

> ⚠️ `cache-manager` TTL ni **millisekundlarda** kutadi. Shuning uchun konstanta
> `CATEGORY_CACHE_TTL_MS` deb nomlangan — sekund berib qo'yish hech qanday xato
> bermaydi, kesh shunchaki 300 ms yashab, hech narsani keshlamaydi.

Darslar va o'yinlar keshlanmaydi — ular javobda bolaning shaxsiy progressini
olib yuradi, ya'ni har bir bola uchun boshqacha.

Bir nechta instans bo'lganda har biri o'z keshini ushlaydi. Umumiy kesh kerak
bo'lganda `server.ts` dagi `cache` blokiga Redis store ulanadi — servis kodi
o'zgarmaydi.

---

## Arxitektura qarorlari

**`DailyActivity` alohida jadval.** Ota-ona dashboardidagi haftalik/oylik grafiklar
kunlik yig'indidan o'qiydi, millionlab `GameSession` qatorini skanerlamasdan.
Faollik bo'lmagan kunlar javobda nol bilan to'ldiriladi — grafikda kun tushib qolmasin.

**`Game` + `GameItem` — bitta moslashuvchan model.** Oltala o'yin turi shu ikki
jadvalga sig'adi, turga xos sozlamalar `config` (JSON) da: `PUZZLE → { rows, cols }`,
`MEMORY → { pairs }`. Yangi o'yin turi qo'shilganda migratsiya kerak emas —
faqat `GAME_TYPE` ga qiymat qo'shiladi.

**To'g'ri javob hech qachon klientga bormaydi.** `GET /games/:id/play` `correct_value`
ni javobdan chiqarib tashlaydi va variantlarni aralashtiradi; tekshiruv faqat
`POST /games/:id/submit` da, serverda.

**Yosh hisoblanadi, saqlanmaydi.** Shuning uchun yosh bo'yicha filtr `birthDate`
oralig'iga aylantiriladi va DB darajasida bajariladi.

**Fanlar bo'yicha aniqlik raw SQL bilan.** Prisma `groupBy` bog'langan jadval
ustuni bo'yicha guruhlay olmaydi, shuning uchun "eng yaxshi fanlar / qiyin mavzular"
`JOIN` li `$queryRaw` bilan hisoblanadi.
