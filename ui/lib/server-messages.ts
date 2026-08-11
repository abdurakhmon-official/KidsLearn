import { getLocale } from "@/lib/session";

type Locale = "uz" | "en" | "ru";
type Translations = Record<Locale, string>;

/**
 * Backend har doim inglizcha `_message` qaytaradi (`api/services/*`,
 * `api/middlewares/error.middleware.ts`). Toast'ni chiqarishdan oldin shu yerda
 * tarjima qilamiz — chunki `lib/axios.ts` React daraxtidan tashqarida ishlaydi
 * va `useT()` ga kira olmaydi.
 *
 * Kalitlar kichik harfda saqlanadi, qidiruv `normalize()` orqali ketadi.
 */
const MESSAGES: Record<string, Translations> = {
  // ── Muvaffaqiyat ─────────────────────────────────────────────────────────
  "registered successfully": {
    uz: "Ro'yxatdan o'tdingiz",
    en: "Registered successfully",
    ru: "Регистрация завершена",
  },

  "signed out": {
    uz: "Chiqdingiz",
    en: "Signed out",
    ru: "Вы вышли",
  },

  saved: {
    uz: "Saqlandi",
    en: "Saved",
    ru: "Сохранено",
  },

  deleted: {
    uz: "O'chirildi",
    en: "Deleted",
    ru: "Удалено",
  },

  "password updated. please sign in again.": {
    uz: "Parol yangilandi. Qaytadan kiring.",
    en: "Password updated. Please sign in again.",
    ru: "Пароль обновлён. Войдите заново.",
  },

  "child added": {
    uz: "Farzand qo'shildi",
    en: "Child added",
    ru: "Ребёнок добавлен",
  },

  "category added": {
    uz: "Fan qo'shildi",
    en: "Category added",
    ru: "Категория добавлена",
  },

  "lesson created": {
    uz: "Dars qo'shildi",
    en: "Lesson created",
    ru: "Урок создан",
  },

  "lesson completed": {
    uz: "Dars tugatildi!",
    en: "Lesson completed!",
    ru: "Урок пройден!",
  },

  "progress saved": {
    uz: "Saqlandi",
    en: "Progress saved",
    ru: "Прогресс сохранён",
  },

  "media added": {
    uz: "Fayl qo'shildi",
    en: "Media added",
    ru: "Файл добавлен",
  },

  "media removed": {
    uz: "Fayl o'chirildi",
    en: "Media removed",
    ru: "Файл удалён",
  },

  "media registered": {
    uz: "Fayl ro'yxatga olindi",
    en: "Media registered",
    ru: "Файл зарегистрирован",
  },

  "game created": {
    uz: "O'yin qo'shildi",
    en: "Game created",
    ru: "Игра создана",
  },

  "game item added": {
    uz: "Savol qo'shildi",
    en: "Question added",
    ru: "Вопрос добавлен",
  },

  "game completed": {
    uz: "O'yin yakunlandi!",
    en: "Game completed!",
    ru: "Игра завершена!",
  },

  "marked as read": {
    uz: "O'qilgan deb belgilandi",
    en: "Marked as read",
    ru: "Отмечено прочитанным",
  },

  "user created": {
    uz: "Foydalanuvchi qo'shildi",
    en: "User created",
    ru: "Пользователь создан",
  },

  "user activated": {
    uz: "Foydalanuvchi faollashtirildi",
    en: "User activated",
    ru: "Пользователь активирован",
  },

  "user deactivated": {
    uz: "Foydalanuvchi bloklandi",
    en: "User deactivated",
    ru: "Пользователь заблокирован",
  },

  "uploaded!": {
    uz: "Yuklandi",
    en: "Uploaded",
    ru: "Загружено",
  },

  // ── Sessiya va ruxsat ────────────────────────────────────────────────────
  unauthorized: {
    uz: "Avval tizimga kiring",
    en: "Please sign in first",
    ru: "Сначала войдите в систему",
  },

  "invalid or expired token": {
    uz: "Sessiya muddati tugagan. Qaytadan kiring.",
    en: "Your session has expired. Please sign in again.",
    ru: "Срок сессии истёк. Войдите заново.",
  },

  "session has been terminated. please sign in again.": {
    uz: "Sessiya tugatilgan. Qaytadan kiring.",
    en: "Session has been terminated. Please sign in again.",
    ru: "Сессия завершена. Войдите заново.",
  },

  "you are not authorized to access this resource.": {
    uz: "Bu bo'limga ruxsatingiz yo'q",
    en: "You are not authorized to access this resource.",
    ru: "У вас нет доступа к этому разделу",
  },

  "your account has been deactivated. please contact an administrator.": {
    uz: "Hisobingiz bloklangan. Administrator bilan bog'laning.",
    en: "Your account has been deactivated. Please contact an administrator.",
    ru: "Ваш аккаунт заблокирован. Обратитесь к администратору.",
  },

  "your account is inactive. please contact an administrator.": {
    uz: "Hisobingiz faol emas. Administrator bilan bog'laning.",
    en: "Your account is inactive. Please contact an administrator.",
    ru: "Ваш аккаунт неактивен. Обратитесь к администратору.",
  },

  // ── Autentifikatsiya ─────────────────────────────────────────────────────
  "email already exist": {
    uz: "Bu email allaqachon ro'yxatdan o'tgan",
    en: "This email is already registered",
    ru: "Этот email уже зарегистрирован",
  },

  "invalid email or password": {
    uz: "Email yoki parol noto'g'ri",
    en: "Invalid email or password",
    ru: "Неверный email или пароль",
  },

  "current password is incorrect": {
    uz: "Joriy parol noto'g'ri",
    en: "Current password is incorrect",
    ru: "Текущий пароль неверный",
  },

  "new password must be different from the current password": {
    uz: "Yangi parol joriy paroldan farq qilishi kerak",
    en: "New password must be different from the current password",
    ru: "Новый пароль должен отличаться от текущего",
  },

  // ── Farzand rejimi ───────────────────────────────────────────────────────
  "already in a child session": {
    uz: "Siz allaqachon farzand rejimidasiz",
    en: "You are already in a child session",
    ru: "Вы уже в детском режиме",
  },

  "invalid child session": {
    uz: "Farzand sessiyasi yaroqsiz",
    en: "Invalid child session",
    ru: "Недействительная детская сессия",
  },

  "child profile is no longer available": {
    uz: "Farzand profili mavjud emas",
    en: "Child profile is no longer available",
    ru: "Профиль ребёнка больше недоступен",
  },

  "this child profile has been deactivated.": {
    uz: "Bu farzand profili bloklangan",
    en: "This child profile has been deactivated.",
    ru: "Этот профиль ребёнка заблокирован",
  },

  "this child profile has been deactivated": {
    uz: "Bu farzand profili bloklangan",
    en: "This child profile has been deactivated",
    ru: "Этот профиль ребёнка заблокирован",
  },

  // ── Topilmadi / band ─────────────────────────────────────────────────────
  "child not found": {
    uz: "Farzand topilmadi",
    en: "Child not found",
    ru: "Ребёнок не найден",
  },

  "parent not found": {
    uz: "Ota-ona topilmadi",
    en: "Parent not found",
    ru: "Родитель не найден",
  },

  "user not found": {
    uz: "Foydalanuvchi topilmadi",
    en: "User not found",
    ru: "Пользователь не найден",
  },

  "category not found": {
    uz: "Fan topilmadi",
    en: "Category not found",
    ru: "Категория не найдена",
  },

  "lesson not found": {
    uz: "Dars topilmadi",
    en: "Lesson not found",
    ru: "Урок не найден",
  },

  "game not found": {
    uz: "O'yin topilmadi",
    en: "Game not found",
    ru: "Игра не найдена",
  },

  "game item not found": {
    uz: "Savol topilmadi",
    en: "Question not found",
    ru: "Вопрос не найден",
  },

  "media not found": {
    uz: "Fayl topilmadi",
    en: "Media not found",
    ru: "Файл не найден",
  },

  "notification not found": {
    uz: "Bildirishnoma topilmadi",
    en: "Notification not found",
    ru: "Уведомление не найдено",
  },

  "record not found": {
    uz: "Ma'lumot topilmadi",
    en: "Record not found",
    ru: "Запись не найдена",
  },

  "you have no children yet": {
    uz: "Hali farzand qo'shilmagan",
    en: "You have no children yet",
    ru: "У вас пока нет детей",
  },

  "you already have a child with this name": {
    uz: "Bu ismli farzand allaqachon mavjud",
    en: "You already have a child with this name",
    ru: "Ребёнок с таким именем уже добавлен",
  },

  "a category with this name or slug already exists": {
    uz: "Bu nom yoki slug bilan fan allaqachon mavjud",
    en: "A category with this name or slug already exists",
    ru: "Категория с таким названием или slug уже существует",
  },

  // ── Kontent qoidalari ────────────────────────────────────────────────────
  "this game has no content yet": {
    uz: "Bu o'yinda hali savollar yo'q",
    en: "This game has no content yet",
    ru: "В этой игре пока нет вопросов",
  },

  "some answers refer to items outside this game": {
    uz: "Ba'zi javoblar bu o'yinga tegishli emas",
    en: "Some answers refer to items outside this game",
    ru: "Некоторые ответы не относятся к этой игре",
  },

  "this game is not for your age group": {
    uz: "Bu o'yin sizning yoshingiz uchun emas",
    en: "This game is not for your age group",
    ru: "Эта игра не для вашей возрастной группы",
  },

  "this lesson is not for your age group": {
    uz: "Bu dars sizning yoshingiz uchun emas",
    en: "This lesson is not for your age group",
    ru: "Этот урок не для вашей возрастной группы",
  },

  "you can't deactivate your own account": {
    uz: "O'z hisobingizni bloklay olmaysiz",
    en: "You can't deactivate your own account",
    ru: "Вы не можете заблокировать свой аккаунт",
  },

  "you can't delete your own account": {
    uz: "O'z hisobingizni o'chira olmaysiz",
    en: "You can't delete your own account",
    ru: "Вы не можете удалить свой аккаунт",
  },

  "invalid folder": {
    uz: "Papka noto'g'ri",
    en: "Invalid folder",
    ru: "Недопустимая папка",
  },

  // ── Tizim xatolari ───────────────────────────────────────────────────────
  "validation failed": {
    uz: "Ma'lumotlarni tekshiring",
    en: "Please check the submitted data",
    ru: "Проверьте введённые данные",
  },

  "invalid data sent to the database layer": {
    uz: "Yuborilgan ma'lumot noto'g'ri",
    en: "Invalid data sent to the database layer",
    ru: "Отправлены некорректные данные",
  },

  "the referenced record does not exist": {
    uz: "Bog'langan ma'lumot topilmadi",
    en: "The referenced record does not exist",
    ru: "Связанная запись не найдена",
  },

  "internal server error": {
    uz: "Serverda xatolik yuz berdi",
    en: "Internal server error",
    ru: "Внутренняя ошибка сервера",
  },

  "too many requests. please try again later.": {
    uz: "Juda ko'p urinish. Birozdan so'ng qayta urining.",
    en: "Too many requests. Please try again later.",
    ru: "Слишком много запросов. Повторите позже.",
  },

  // ── Tarmoq (axios o'zi hosil qiladi, backend emas) ───────────────────────
  "network error": {
    uz: "Serverga ulanib bo'lmadi. Internetni tekshiring.",
    en: "Cannot reach the server. Check your connection.",
    ru: "Не удалось связаться с сервером. Проверьте подключение.",
  },

  canceled: {
    uz: "So'rov bekor qilindi",
    en: "Request canceled",
    ru: "Запрос отменён",
  },

  // ── Zod'ning standart maydon xabarlari ───────────────────────────────────
  required: {
    uz: "Majburiy maydon",
    en: "Required",
    ru: "Обязательное поле",
  },

  "invalid email": {
    uz: "Email noto'g'ri",
    en: "Invalid email",
    ru: "Некорректный email",
  },

  "invalid input": {
    uz: "Qiymat noto'g'ri",
    en: "Invalid input",
    ru: "Некорректное значение",
  },

  "birth date cannot be in the future": {
    uz: "Tug'ilgan sana kelajakda bo'lishi mumkin emas",
    en: "Birth date cannot be in the future",
    ru: "Дата рождения не может быть в будущем",
  },

  "birth date is out of the supported range": {
    uz: "Tug'ilgan sana qo'llab-quvvatlanadigan oraliqdan tashqarida",
    en: "Birth date is out of the supported range",
    ru: "Дата рождения вне допустимого диапазона",
  },

  "correctvalue must match one of the options": {
    uz: "To'g'ri javob variantlardan biri bo'lishi kerak",
    en: "The correct answer must match one of the options",
    ru: "Правильный ответ должен совпадать с одним из вариантов",
  },
};

/**
 * Ichida son/nom bo'lgan xabarlar (`${count} notification(s) ...`) lug'atga
 * to'g'ridan-to'g'ri sig'maydi — ularni regex bilan tutamiz. Tarjimadagi
 * `{0}`, `{1}` — regex guruhlarining tartib raqami.
 */
const PATTERNS: { match: RegExp; translations: Translations }[] = [
  {
    match: /^this category still has (\d+) lesson\(s\)$/i,
    translations: {
      uz: "Bu fanga biriktirilgan {0} ta dars bor",
      en: "This category still has {0} lesson(s)",
      ru: "В этой категории ещё {0} урок(ов)",
    },
  },
  {
    match: /^(\d+) notification\(s\) marked as read$/i,
    translations: {
      uz: "{0} ta bildirishnoma o'qilgan deb belgilandi",
      en: "{0} notification(s) marked as read",
      ru: "{0} уведомлений отмечено прочитанными",
    },
  },
  {
    match: /^(\d+) reminder\(s\) sent$/i,
    translations: {
      uz: "{0} ta eslatma yuborildi",
      en: "{0} reminder(s) sent",
      ru: "Отправлено напоминаний: {0}",
    },
  },
  {
    match: /^a record with this (.+) already exists$/i,
    translations: {
      uz: "Bunday {0} bilan yozuv allaqachon mavjud",
      en: "A record with this {0} already exists",
      ru: "Запись с таким значением ({0}) уже существует",
    },
  },
  {
    match: /^database request failed \((.+)\)$/i,
    translations: {
      uz: "Ma'lumotlar bazasi xatosi ({0})",
      en: "Database request failed ({0})",
      ru: "Ошибка базы данных ({0})",
    },
  },
  {
    match: /^cannot (\w+) (.+)$/i,
    translations: {
      uz: "Bunday manzil yo'q: {0} {1}",
      en: "No such endpoint: {0} {1}",
      ru: "Такого адреса нет: {0} {1}",
    },
  },
  {
    match: /^timeout of \d+ms exceeded$/i,
    translations: {
      uz: "So'rov vaqti tugadi. Qaytadan urinib ko'ring.",
      en: "The request timed out. Please try again.",
      ru: "Время ожидания истекло. Попробуйте снова.",
    },
  },
  {
    match: /^request failed with status code \d+$/i,
    translations: {
      uz: "Serverda xatolik yuz berdi",
      en: "The server returned an error",
      ru: "Сервер вернул ошибку",
    },
  },
  // Zod'ning standart uzunlik/oraliq xabarlari.
  {
    match: /^string must contain at least (\d+) character\(s\)$/i,
    translations: {
      uz: "Kamida {0} ta belgi kiriting",
      en: "Must be at least {0} character(s)",
      ru: "Минимум {0} символ(ов)",
    },
  },
  {
    match: /^string must contain at most (\d+) character\(s\)$/i,
    translations: {
      uz: "Ko'pi bilan {0} ta belgi kiriting",
      en: "Must be at most {0} character(s)",
      ru: "Максимум {0} символ(ов)",
    },
  },
  {
    match: /^number must be greater than or equal to (-?\d+(?:\.\d+)?)$/i,
    translations: {
      uz: "Qiymat {0} dan kichik bo'lmasin",
      en: "Must be greater than or equal to {0}",
      ru: "Значение должно быть не меньше {0}",
    },
  },
  {
    match: /^number must be less than or equal to (-?\d+(?:\.\d+)?)$/i,
    translations: {
      uz: "Qiymat {0} dan katta bo'lmasin",
      en: "Must be less than or equal to {0}",
      ru: "Значение должно быть не больше {0}",
    },
  },
  {
    match: /^expected .+, received .+$/i,
    translations: {
      uz: "Qiymat turi noto'g'ri",
      en: "Unexpected value type",
      ru: "Некорректный тип значения",
    },
  },
];

const currentLocale = (): Locale => {
  const locale = getLocale();
  return locale === "en" || locale === "ru" ? locale : "uz";
};

/** Backend xabarlari bosh harf/nuqta jihatidan bir xil emas — bir ko'rinishga keltiramiz. */
const normalize = (message: string) => message.trim().toLowerCase();

const fill = (template: string, groups: string[]) =>
  template.replace(/\{(\d+)\}/g, (placeholder, index: string) => groups[Number(index)] ?? placeholder);

export function translateServerMessage(message: string): string {
  if (!message) return message;

  const locale = currentLocale();

  const exact = MESSAGES[normalize(message)];
  if (exact) return exact[locale];

  // Shablonlar asl matnga solishtiriladi (regexlar `i` bayrog'i bilan) — aks
  // holda ushlangan qiymatlar (`P2014`, `GET`) kichik harfga tushib ketardi.
  for (const { match, translations } of PATTERNS) {
    const result = message.trim().match(match);

    if (result) {
      return fill(translations[locale], result.slice(1));
    }
  }

  // Lug'atda yo'q xabar inglizcha holicha chiqadi — bu bug, shuning uchun
  // dev'da ko'rinib tursin.
  if (process.env.NODE_ENV === "development") {
    console.warn(`[i18n] tarjimasi yo'q server xabari: "${message}"`);
  }

  return message;
}
