# KidsLearn API — Backend rejasi

1–7 yoshdagi bolalar uchun interaktiv ta'lim platformasining REST API qismi.

Asos EduTest-API dan olingan: **Ts.ED 8 + Express 5 + Prisma + PostgreSQL + Zod + Swagger**.
Qatlamlar (`controllers → services → prisma`), zod validatsiya, JWT + RBAC va `{ success, _message?, data }`
javob formati o'zgarishsiz saqlanadi.

---

## 1. Auth va rollar

Uchta rol bor, lekin **ikkita jadval**:

| Rol | Qayerda saqlanadi | Qanday kiradi |
|---|---|---|
| `ADMIN` | `users` | email + parol |
| `PARENT` | `users` | email + parol |
| `CHILD` | `children` | **parol yo'q** — ota-ona kirib, profil tanlaydi |

### Bola sessiyasi

Bola 1–7 yoshda — parol yozolmaydi. Shuning uchun Netflix uslubidagi profil tanlash:

```
POST /auth/login                    → PARENT token
POST /auth/children/:id/select      → CHILD token  (faqat o'z bolasi uchun)
```

CHILD token payload'i: `{ sub: <parent_id>, role: 'CHILD', child_id: <child_id>, jti }`.

Bu yechimning afzalliklari:
- har bir bola sessiyasi ota-onasiga bog'langan — audit va xavfsizlik uchun qulay;
- `TokenService` revocation mexanizmi o'zgarishsiz ishlaydi;
- bolaga tegishli endpointlar `child_id` ni **tokendan** oladi, URL'dan emas — bola boshqa bolaning ma'lumotini ko'ra olmaydi.

### RBAC

`USER_ROLE` Prisma enum'ida faqat `ADMIN` va `PARENT` bo'ladi (DB haqiqatni aks ettiradi).
TS darajasida `AUTH_ROLE = ADMIN | PARENT | CHILD` — middleware shu bilan ishlaydi.

Dekoratorlar (mavjud uslub saqlanadi):

```ts
@Authorized(Authenticate())   // har qanday kirgan foydalanuvchi
@Authorized(AdminOnly())
@Authorized(ParentOnly())
@Authorized(ChildOnly())
```

ADMIN barcha tekshiruvlardan o'tadi (mavjud xulq).

---

## 2. Domen modeli

### Foydalanuvchilar

| Model | Izoh |
|---|---|
| `User` | ADMIN va PARENT. `full_name, email, phone, password, role, avatar, active` |
| `Child` | `parent_id, full_name, birth_date, avatar, active`. **Yosh saqlanmaydi** — `birth_date` dan hisoblanadi |

Yosh guruhi `birth_date` dan chiqadi:

| Guruh | Yosh | Mavzular |
|---|---|---|
| `AGE_1_2` | 1–2 | Ranglar, Hayvonlar, Mevalar |
| `AGE_3_4` | 3–4 | Harflar, Raqamlar, Shakllar |
| `AGE_5_7` | 5–7 | Ingliz alifbosi, Sodda matematika, Mantiqiy o'yinlar |

Bolaga dars/o'yin chiqarilganda `age_group` avtomatik filtr sifatida qo'llanadi.

### Kontent

| Model | Izoh |
|---|---|
| `Category` | Fan/mavzu: Ranglar, Harflar, Hayvonlar… (`name, slug, icon, color, order`) |
| `Lesson` | `title, description, category_id, age_group, cover_image, video_url, audio_url, points, order, active` |
| `LessonMedia` | Darsga tegishli **bir nechta** rasm/video/audio (`type, url, caption, order`) |
| `Game` | `code (GAME_TYPE), title, category_id?, age_group, cover_image, points_per_correct, config` |
| `GameItem` | O'yin savoli: `prompt_text, prompt_image, prompt_audio, correct_value, options (Json)` |
| `MediaAsset` | S3 ga yuklangan fayllar registri — admin panelidagi "Rasmlar / Videolar / Audio" bo'limi |

Oltita o'yin bitta `Game` + `GameItem` modeliga sig'adi — farq `code` va `config` da:

| `GAME_TYPE` | `GameItem` qanday to'ldiriladi |
|---|---|
| `COLOR_MATCH` | `prompt_text: "Qizil"`, `options: [{value:"red", color:"#e11"}, …]` |
| `ANIMAL_SOUND` | `prompt_audio: <s3 url>`, `options: [{value:"cat", image:<url>}, …]` |
| `LETTER_MATCH` | `prompt_text: "A"`, `options: [{value:"A", image:<url>}, …]` |
| `NUMBER_MATCH` | `prompt_text: "5"`, `options: [{value:"5"}, …]` |
| `PUZZLE` | `prompt_image: <url>`, `config: { rows: 3, cols: 3 }` |
| `MEMORY` | `config: { pairs: 6 }`, `options` — kartochka rasmlari |

> Bitta moslashuvchan model — yangi o'yin turi qo'shilganda migratsiya kerak emas, faqat `GAME_TYPE` ga qiymat qo'shiladi.

### Progress va mukofot

| Model | Izoh |
|---|---|
| `LessonProgress` | `child_id + lesson_id` unique. `status, progress_percent, watched_seconds, points_earned, completed_at` |
| `GameSession` | Har bir o'yin urinishi: `total_items, correct_count, wrong_count, score, stars (0–3), duration_seconds` |
| `ChildStats` | Bola bo'yicha yig'ma: `total_points, total_stars, games_played, lessons_completed, streak_days, longest_streak, last_activity_at` |
| `DailyActivity` | `child_id + date` unique — kunlik yig'indi. **Haftalik/oylik grafiklar shu jadvaldan chiqadi**, sessiyalarni qayta hisoblamasdan |
| `Award` | `medal (BRONZE/SILVER/GOLD/DIAMOND), code, title, earned_at`. `child_id + code` unique — bir medal ikki marta berilmaydi |

`DailyActivity` ataylab alohida jadval: ota-ona dashboardidagi grafiklar millionlab `GameSession`
qatorini skanerlamasligi kerak. Har bir sessiya/dars yakunida `upsert` qilinadi.

**Streak** shu yerda hisoblanadi: yangi faollik yozilganda `last_activity_at` ning sanasi
kechagi kunga teng bo'lsa `streak_days++`, aks holda `1` ga tushadi.

**Medallar** — `AwardService` da qoidalar jadvali (kod → shart):

| Kod | Shart | Medal |
|---|---|---|
| `FIRST_LESSON` | birinchi dars tugatildi | BRONZE |
| `POINTS_100` / `POINTS_500` / `POINTS_2000` | ball chegarasi | BRONZE / SILVER / GOLD |
| `STREAK_7` / `STREAK_30` | ketma-ket faol kunlar | SILVER / DIAMOND |
| `PERFECT_GAME` | 100% to'g'ri o'yin | SILVER |
| `CATEGORY_MASTER` | bir fanning barcha darslari | GOLD |

### Bildirishnomalar

`Notification` — `user_id (ota-ona), child_id?, type, title, body, data, read_at`.

| Tur | Qachon |
|---|---|
| `NEW_LESSON` | admin yosh guruhiga mos yangi dars qo'shganda |
| `AWARD_EARNED` | bola medal olganda |
| `NO_ACTIVITY_TODAY` | kunlik job — bugun faolligi bo'lmagan bolalar bo'yicha |

`NO_ACTIVITY_TODAY` uchun kunlik scheduled job kerak (`node-cron` yoki tashqi cron → himoyalangan
`POST /jobs/daily-digest`). Ikkinchisi Render/serverless'da ishonchliroq.

---

## 3. Endpointlar

Barchasi `/api` ostida, Swagger `/docs` da.

### `/auth`
| Metod | Yo'l | Kim |
|---|---|---|
| POST | `/auth/register` | ochiq — ota-ona ro'yxatdan o'tadi (birinchi foydalanuvchi ADMIN bo'ladi) |
| POST | `/auth/login` | ochiq |
| POST | `/auth/logout` | auth |
| GET | `/auth/me` | auth — PARENT bo'lsa bolalari, CHILD bo'lsa bola profili qaytadi |
| PUT | `/auth/profile` | auth |
| PUT | `/auth/password` | auth |
| POST | `/auth/children/:id/select` | PARENT → CHILD token |

### `/children`
| Metod | Yo'l | Kim |
|---|---|---|
| GET | `/children` | PARENT — o'z bolalari (yosh va statistika bilan) |
| GET | `/children/paginated` | ADMIN — qidiruv (bola ismi, ota-ona ismi) + filtr (yosh, faollik, sana) |
| POST | `/children` | PARENT |
| GET/PUT/DELETE | `/children/:id` | PARENT (o'zinikini) / ADMIN |
| GET | `/children/:id/progress` | PARENT / ADMIN |
| GET | `/children/:id/awards` | PARENT / ADMIN |

### `/categories`
`GET /categories` (auth) · `POST` / `PUT /:id` / `DELETE /:id` (ADMIN)

### `/lessons`
| Metod | Yo'l | Kim |
|---|---|---|
| GET | `/lessons/paginated` | auth — search (nomi) + filter (`age_group`, `category_id`, `active`, sana) |
| GET | `/lessons/for-me` | CHILD — **faqat o'z yosh guruhi**, progress bilan |
| GET | `/lessons/:id` | auth |
| POST / PUT / DELETE | `/lessons`, `/lessons/:id` | ADMIN |
| POST / DELETE | `/lessons/:id/media`, `/lessons/:id/media/:mediaId` | ADMIN |
| POST | `/lessons/:id/progress` | CHILD — ko'rildi / tugatildi → ball, streak, medal |

### `/games`
| Metod | Yo'l | Kim |
|---|---|---|
| GET | `/games/paginated` | auth — filter (`age_group`, `code`, `category_id`) |
| GET | `/games/for-me` | CHILD — yosh guruhiga mos |
| GET | `/games/:id` | auth |
| POST / PUT / DELETE | `/games`, `/games/:id` | ADMIN |
| GET / POST / PUT / DELETE | `/games/:id/items…` | ADMIN |
| GET | `/games/:id/play` | CHILD — **`correct_value` siz**, aralashtirilgan variantlar |
| POST | `/games/:id/submit` | CHILD — javoblar → ball, yulduz, medal, streak |

> `/play` va `/submit` ajratilgani muhim: to'g'ri javob hech qachon bolaning brauzeriga
> yuborilmaydi, tekshiruv faqat serverda. (Mavjud `TestService.submit` dagi bilan bir xil yondashuv.)

### `/progress` va `/dashboard`
| Metod | Yo'l | Kim |
|---|---|---|
| GET | `/progress/me` | CHILD — ball, yulduz, streak, medallar |
| GET | `/dashboard/parent` | PARENT — `?child_id=` : bugungi mashg'ulotlar, haftalik/oylik grafik, eng yaxshi fanlar, qiyin mavzular |
| GET | `/dashboard/admin` | ADMIN — foydalanuvchilar, bolalar, darslar, o'yinlar, faollik |
| GET | `/leaderboard` | auth — *bonus* |

"Eng yaxshi fanlar" / "qiyin mavzular" — `GameSession` va `LessonProgress` ni `category` bo'yicha
`groupBy` qilib, o'rtacha foizga qarab tartiblash.

### `/awards`, `/notifications`, `/media`, `/users`, `/health`
| Metod | Yo'l | Kim |
|---|---|---|
| GET | `/awards` | CHILD (o'zi) / PARENT (`?child_id=`) |
| GET | `/notifications/paginated` | PARENT |
| PUT | `/notifications/:id/read`, `/notifications/read-all` | PARENT |
| POST | `/media/upload` | ADMIN — **S3 (siz yozasiz)** |
| GET | `/media/paginated` | ADMIN — turi bo'yicha filtr |
| DELETE | `/media/:id` | ADMIN |
| GET | `/users/paginated` | ADMIN — search (ism, email) |
| POST / PUT / DELETE | `/users`, `/users/:id`, `/users/:id/status` | ADMIN |
| GET | `/health` | ochiq |

---

## 4. Kodni tozalash

### O'chiriladigan (EduTest'ga xos)
```
controllers/  test.controller.ts  result.controller.ts  subject.controller.ts  dashboard.controller.ts
services/     test.service.ts     result.service.ts     subject.service.ts     dashboard.service.ts
inputs/       test.input.ts       subject.input.ts
prisma/       migrations/*        (schema butunlay o'zgargani uchun — yangi init migratsiya)
```

### Saqlanadigan (o'zgarishsiz yoki deyarli)
```
config/*  modules/db.ts  modules/nanoid.ts  modules/auth.ts
middlewares/  logging  404  error
inputs/basic.search.ts  utils/*  server.ts  index.ts
jest.config.js  .barrelsby.json  tsconfig*  generate-types.ts
```

### Moslashtiriladigan
| Fayl | O'zgarish |
|---|---|
| `prisma/schema.prisma` | butunlay yangi domen modeli |
| `prisma/seed.ts` | admin + demo ota-ona/bola + kategoriyalar + darslar + o'yinlar |
| `modules/auth.ts` | JWT payload'iga `child_id`, `AUTH_ROLE` |
| `modules/declarations.ts` | `Request.child`, yangi env o'zgaruvchilar (S3) |
| `middlewares/auth.middleware.ts` | CHILD rolini hal qilish, `ParentOnly()` / `ChildOnly()` |
| `services/auth.service.ts` | yangi User maydonlari (`school_name`… olib tashlanadi), `selectChild()` |
| `inputs/auth.input.ts` | `full_name, email, phone, password` |
| `utils/constants.ts` | `USER_PUBLIC_SELECT`, `CHILD_PUBLIC_SELECT`, yosh guruhi chegaralari, medal qoidalari |
| `services/user.service.ts` | maktab/fan maydonlarisiz, PARENT bilan ishlash |
| `server.ts`, `package.json`, `README.md` | KidsLearn nomi va tavsifi |

### Yangi fayllar
```
utils/age.ts                  birth_date → yosh, AGE_GROUP
services/  child  category  lesson  game  progress  award  notification  dashboard  media
controllers/  o'sha nomlar bilan
inputs/    child  category  lesson  game  media  user
```

---

## 5. Bosqichlar

| # | Bosqich | Holat |
|---|---|---|
| 1 | Plan + `schema.prisma` + tozalash + auth moslashuvi | ✅ |
| 2 | `children`, `categories` modullari + seed | ✅ |
| 3 | `lessons` + `LessonMedia` + progress | ✅ |
| 4 | `games` + `GameItem` + `/play` `/submit` + ball/yulduz | ✅ |
| 5 | `awards` + `streak` + `DailyActivity` | ✅ |
| 6 | `dashboard` (ota-ona grafiklari, admin) + `leaderboard` | ✅ |
| 7 | `notifications` + kunlik job | ✅ |
| 8 | `media` registri + admin panel endpointlari | ✅ |
| 9 | Docker Compose, README, Swagger | ✅ |

Backend to'liq qurilgan: **13 ta servis, 11 ta controller, 80 ta uchidan-uchiga tekshiruv**.

### Keyingi bosqich — system design auditi (bajarildi)

Auditda 19 ta bo'shliq topildi va yopildi. Batafsil reja:
`~/.claude/plans/sysytem-desgin-ni-yaxshilash-reflective-sutton.md`.

| Bosqich | Nima qilindi |
|---|---|
| Xavfsizlik | rate limiting, pagination `size` cheklovi, sort kaliti oq ro'yxati, CORS qattiqlashtirish, Swagger production'da opt-in, JWT `iss`/`aud`, birinchi-admin faqat development'da |
| Butunlik | o'yin/dars yozuvi statistika bilan bitta tranzaksiyada, `revoked_tokens` jadvali (logout restartdan omon qoladi), streak uchun `SELECT … FOR UPDATE` |
| Operatsion | `/health/live` va `/health/ready`, `x-request-id` kuzatuvi, graceful shutdown, 62 unit test |
| Masshtab | `pg_trgm` GIN indekslar, bildirishnomalarni sahifalab yozish, kategoriyalar keshi, ulanish puli hujjati |
| Tozalash | `/api/v1` versiyasi, xabarlar tili birxillashtirildi |

## 6. Qolgan ishlar

| Ish | Izoh |
|---|---|
| **S3 yuklash servisi** | Siz `StorageService` va upload controller'ini berasiz. Ulanish nuqtasi tayyor: `MediaService.register()` yuklashdan keyin chaqiriladi, `remove()` esa S3 kalitini qaytaradi |
| **Jest testlari** | `jest.config.js` sozlangan, hozircha `--passWithNoTests`. Smoke test skripti bor, uni unit/integration testlarga aylantirish mumkin |
| **Ko'p tillilik** | Kelishuv bo'yicha keyinga qoldirildi — kerak bo'lsa `LessonTranslation` / `CategoryTranslation` jadvallari bilan |

## 7. Ochiq savollar

- **Docker Compose** — hozir `postgres` + `api`. Frontend tayyor bo'lgach unga ham servis qo'shiladimi?
- **Kunlik job** — hozir `POST /notifications/daily-digest`, tashqi cron admin tokeni bilan chaqiradi.
  `node-cron` bilan ichkariga ko'chirilsinmi?
- **Leaderboard** — hozir uchalasi ham bor (`period=week|month|all`, `age_group` filtri bilan).
