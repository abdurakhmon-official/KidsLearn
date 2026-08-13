# KidsLearn

**1–7 yoshdagi bolalar uchun interaktiv ta'lim platformasi.** Bolalar o'yin orqali ranglar,
harflar, raqamlar, shakllar, hayvonlar va mevalarni o'rganadi; ota-onalar farzandining
rivojlanishini grafiklar bilan kuzatadi; administrator butun kontentni boshqaradi.

```
KidsLearn/
├─ api/    Ts.ED 8 + Express 5 + Prisma + PostgreSQL  (REST API, Swagger)
└─ ui/     Next.js 16 + React 19 + Tailwind v4        (3 xil tajriba)
```

---

## Bir buyruq bilan ishga tushirish

```bash
cp ui/.env.example ui/.env.local          # ixtiyoriy — compose o'zi beradi
JWT_SECRET=uzun-tasodifiy-satr docker compose up --build
```

| Manzil | Nima |
|---|---|
| http://localhost:3000 | Ilova |
| http://localhost:9100/docs | Swagger hujjatlari |
| localhost:5433 | PostgreSQL |

### Ovoz (TTS)

Compose `api` xizmatiga o'zgaruvchilarni **repo ildizidagi `.env`** dan uzatadi.
`AZURE_SPEECH_KEY` berilmasa server TTS'ni o'chiradi va ilova brauzerning o'rnatilma
sintezatoriga tushadi — ovoz robotdek g'alati eshitiladi. Tabiiy ovoz uchun ildizda
`.env` yarating:

```bash
AZURE_SPEECH_KEY=...
AZURE_SPEECH_REGION=westeurope
AWS_REGION=...            # audio S3 ga yoziladi
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
```

Migratsiyalar va **kontent seed'i** (fanlar, darslar, o'yinlar) har bir ishga
tushishda avtomatik qo'llanadi — konteyner ichida `node dist/prisma/seed.js`
ishlaydi, ikkalasi ham idempotent.

Demo hisoblar bundan **istisno**: parollari repoda ochiq turgani uchun
production'da o'z-o'zidan yaratilmaydi. Kerak bo'lsa ildizdagi `.env` ga
`SEED_DEMO=true` qo'shib `docker compose up -d api` qiling.

> `npx prisma db seed` faqat **development**'da ishlaydi — u `ts-node` talab
> qiladi, production image'da esa `.ts` manbalar yo'q (faqat `dist/`).
> Konteynerda qo'lda seed qilish kerak bo'lsa: `docker compose exec api node dist/prisma/seed.js`.

### Demo hisoblar (`SEED_DEMO=true` bo'lganda)

| Rol | Email | Parol |
|---|---|---|
| Administrator | `admin@gmail.com` | `password123` |
| Ota-ona | `parent@gmail.com` | `password123` |

### Production'da admin yaratish

Seed'siz, real serverda admin ochish (yoki mavjud hisobni ADMIN qilish va
parolini tiklash). Parol argument sifatida berilmasa yashirin so'raladi —
shunda u shell tarixiga ham, `ps` chiqishiga ham tushmaydi:

```bash
docker compose exec api node scripts/create-admin.js admin@example.com --name "Ism Familiya"
# Parol: ****
```

Docker'siz (pm2 / systemd) o'rnatilgan bo'lsa, `api/` papkasidan (`.env` dan
`DATABASE_URL` o'qiladi):

```bash
node scripts/create-admin.js admin@example.com
```

> Parolni `.env` ga (`ADMIN_PASSWORD`) yozmang — u bir martalik amal uchun
> kerak, `.env` esa doimiy: parol diskda ochiq qoladi va `docker inspect`,
> `docker compose config`, backup'larda ko'rinadi.

Bola profillari ota-ona hisobiga ulangan — kirgandan keyin **profil tanlash**
ekranida tanlanadi (bolalarda parol yo'q).

---

## Qo'lda ishga tushirish

**Talab:** Node.js 20+, PostgreSQL 16+.

```bash
# 1. API
cd api
cp .env.sample .env            # DATABASE_URL va JWT_SECRET ni to'ldiring
yarn install
yarn db:migrate
yarn db:seed
yarn dev                       # http://localhost:9100

# 2. UI (yangi terminal)
cd ui
cp .env.example .env.local
npm install
npm run dev                    # http://localhost:3000
```

> `api/.env` da `CORS_ORIGIN=http://localhost:3000` bo'lsin. Bo'sh qoldirilsa
> default `*` ishlaydi, lekin u holda `credentials` majburan o'chiriladi.

---

## Uchta rol, uchta tajriba

| Rol | Kirish | Nima ko'radi |
|---|---|---|
| **Administrator** | email + parol | `/admin` — foydalanuvchilar, bolalar, fanlar, darslar, o'yinlar, media, statistika |
| **Ota-ona** | email + parol | `/dashboard` — grafiklar, farzandlar CRUD, bildirishnomalar, reyting |
| **Bola** | ota-ona profilini tanlaydi | `/play` — fullscreen o'yin rejimi, darslar, o'yinlar, mukofotlar |

### Bola sessiyasi qanday ishlaydi

Bola (1–7 yosh) parol yozolmaydi, shuning uchun Netflix uslubidagi profil tanlash:

```
POST /auth/login                   → PARENT token
POST /auth/children/:id/select     → CHILD token  { sub: <ota-ona id>, role:'CHILD', childId }
```

Bola rejimiga kirganda ota-ona tokeni **cookie'da saqlanib turadi** va chiqishda
tiklanadi. Bola tokeni hech qachon admin huquqini bermaydi — ota-onasi ADMIN
bo'lsa ham sessiya CHILD bo'lib qoladi, chunki qurilma bolaning qo'lida bo'ladi.

---

## Imkoniyatlar

**Asosiy**

- JWT autentifikatsiya, rolga asoslangan kirish (RBAC), haqiqiy logout (token bekor qilinadi)
- Ota-ona → bir nechta bola; yosh `birthDate` dan avtomatik hisoblanadi
- Yoshga qarab kontent: `1–2`, `3–4`, `5–7` guruhlari
- Darslar: video, audio, rasmlar galereyasi, ko'rish progressi
- **6 ta o'yin:** Rangni top · Hayvonni top · Harfni top · Raqamni top · Puzzle · Memory
- Progress: ball, yulduzlar, streak, tugatilgan darslar, o'yinlar aniqligi
- 4 turdagi medallar (Bronza / Kumush / Oltin / Olmos), 12 ta qoida
- Ota-ona statistikasi: bugungi mashg'ulot, haftalik va oylik grafik, eng yaxshi
  fanlar va qiyin mavzular
- Bildirishnomalar: yangi dars, mukofot, bugun mashg'ulot bo'lmadi
- Qidiruv (bola/ota-ona ismi, yosh, dars nomi) va filtrlar (yosh, fan, sana, faollik)
- Pagination, validatsiya, xatolik boshqaruvi, loading skeletonlari
- Responsive dizayn, Dark / Light rejim
- Swagger hujjatlari

**Bonus**

- O'zbek / Ingliz / Rus tillari
- PWA — o'rnatiladigan ilova, offline sahifa
- **Ovoz:** matnni o'qib berish (TTS) — bola o'qiy olmaydi, shuning uchun bu
  asosiy funksiya; ovoz bilan javob berish (STT) qo'llab-quvvatlaydigan brauzerlarda
- Leaderboard — hafta / oy / umumiy, yosh guruhi bo'yicha
- PDF sertifikat

---

## Texnologiyalar

### Backend (`api/`)

Ts.ED 8 · Express 5 · Prisma 6 · PostgreSQL 16 · zod · JWT · bcrypt ·
Swagger · `typedSql` (analitik so'rovlar) · AWS S3 · Docker

Qatlamlar: `controllers → services → prisma`. Javob konverti
`{ success, _message?, data }`, xatolar `GlobalErrorFilter` orqali bir xil shaklda.

### Frontend (`ui/`)

| Qatlam | Tanlov |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Styling | Tailwind CSS v4, oklch token'lar, shadcn/ui (`base-ui` ustida) |
| Ma'lumot | Redux Toolkit + **RTK Query** (axios `baseQuery` ustida) |
| Formalar | react-hook-form + zod |
| Grafiklar | Recharts |
| Boshqa | date-fns · lucide-react · sonner · next-themes · jsPDF |
| i18n / PWA / Ovoz | kutubxonasiz — Context, qo'lda yozilgan service worker, Web Speech API |

---

## Loyiha tuzilishi (`ui/`)

```
app/
├─ (auth)/          login, register
├─ (parent)/        dashboard, children/[id], notifications, leaderboard, profile, settings
├─ (child)/play/    fullscreen bola rejimi: lessons, games/[id], progress
├─ (admin)/admin/   users, children, categories, lessons/[id], games/[id], media
└─ select-child/    profil tanlash

components/  ui · shared · charts · games · parent · child · admin · providers
store/api/   baseApi + 9 domen (injectEndpoints bilan bitta cache'da)
lib/         session · axios · i18n · speech · certificate · validation
types/api.ts javob tiplari (qo'lda)  ·  types/{input,models}  generatsiya qilinadi
```

### Tiplarni sinxron ushlash

API zod schema'laridan TypeScript tiplari generatsiya qilinadi:

```bash
cd api && yarn generate:types      # → ui/types/{input,models,output}
```

API'da input o'zgargan **har safar** shu buyruqni ishga tushiring.

> Generatsiya qilingan tiplar zod'ning **chiqish** tipini beradi
> (`z.coerce.date()` → `Date`), lekin JSON orqali sana **string** ketadi.
> Shuning uchun javob tiplari `ui/types/api.ts` da qo'lda yozilgan.

---

## Grafik palitrasi

`--chart-1..5` ranglari qo'lda tanlanmagan — ular rang ko'rish nuqsoni (CVD)
bo'yicha tekshirilgan: lightness band, chroma floor, qo'shni juftlarning
ajralishi va fon bilan kontrast. Dark rejim uchun **alohida** qadamlar
tanlangan (light'ni avtomatik yorug'lashtirish emas).

Dark rejimda qo'shni juftlarning ajralishi chegaraviy oraliqda, shuning uchun
grafiklarda **legend va to'g'ridan-to'g'ri yorliqlar majburiy** — rang hech
qachon yagona signal bo'lmaydi.

---

## Qolgan ishlar

| Ish | Holat |
|---|---|
| S3 `generatePolicy` papka ro'yxati | `['brands','products','avatars']` — boshqa loyihadan qolgan. Dars/o'yin media'si uchun `lessons`, `games` qo'shilishi kerak; hozircha admin panelida URL kiritiladi |
| `POST /s3/:folder/upload` | `multer` yo'q, shuning uchun ishlamaydi. Presigned policy oqimi baribir afzal (fayl API serveridan o'tmaydi) |
| Sana filtri | Hozir faqat darslarda (`from`/`to`); bolalar va o'yinlarga ham qo'shilishi mumkin |
| Push Notification | Backend'da web-push/VAPID yo'q — hozircha in-app bildirishnomalar |
| Testlar | API'da `jest` sozlangan, unit testlar yozilishi kerak |
