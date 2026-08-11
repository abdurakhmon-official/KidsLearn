import prisma from '@/modules/db';
import { hashPassword } from '@/modules/auth';
import { AGE_GROUP, GAME_TYPE, MEDAL_TYPE, PROGRESS_STATUS, USER_ROLE } from '@/generated/prisma';
import { ageGroupOf } from '@/utils/age';
import { addDays, dateOnly } from '@/utils/date';
import { AWARD_RULES } from '@/utils/awards';

const CATEGORIES = [
  { name: 'Ranglar', slug: 'ranglar', icon: '🎨', color: '#ef4444', order: 1 },
  { name: 'Hayvonlar', slug: 'hayvonlar', icon: '🐻', color: '#f59e0b', order: 2 },
  { name: 'Mevalar', slug: 'mevalar', icon: '🍎', color: '#84cc16', order: 3 },
  { name: 'Harflar', slug: 'harflar', icon: '🔤', color: '#06b6d4', order: 4 },
  { name: 'Raqamlar', slug: 'raqamlar', icon: '🔢', color: '#3b82f6', order: 5 },
  { name: 'Shakllar', slug: 'shakllar', icon: '🔷', color: '#8b5cf6', order: 6 },
  { name: 'Ingliz alifbosi', slug: 'ingliz-alifbosi', icon: '🇬🇧', color: '#ec4899', order: 7 },
  { name: 'Sodda matematika', slug: 'sodda-matematika', icon: '➕', color: '#14b8a6', order: 8 },
  { name: 'Mantiqiy o‘yinlar', slug: 'mantiqiy-oyinlar', icon: '🧩', color: '#f97316', order: 9 },
];

const LESSONS = [
  { title: 'Asosiy ranglar', slug: 'ranglar', ageGroup: AGE_GROUP.AGE_1_2, description: "Qizil, ko'k, sariq va yashil ranglar bilan tanishamiz." },
  { title: 'Uy hayvonlari', slug: 'hayvonlar', ageGroup: AGE_GROUP.AGE_1_2, description: 'Mushuk, it, sigir va ularning ovozlari.' },
  { title: 'Shirin mevalar', slug: 'mevalar', ageGroup: AGE_GROUP.AGE_1_2, description: 'Olma, banan, uzum va boshqa mevalar.' },
  { title: "O'zbek alifbosi: A–J", slug: 'harflar', ageGroup: AGE_GROUP.AGE_3_4, description: 'Birinchi harflar bilan tanishuv.' },
  { title: '1 dan 10 gacha sanash', slug: 'raqamlar', ageGroup: AGE_GROUP.AGE_3_4, description: 'Raqamlarni tanib, ovoz chiqarib sanaymiz.' },
  { title: 'Geometrik shakllar', slug: 'shakllar', ageGroup: AGE_GROUP.AGE_3_4, description: 'Doira, kvadrat, uchburchak va to‘rtburchak.' },
  { title: 'English ABC: A–M', slug: 'ingliz-alifbosi', ageGroup: AGE_GROUP.AGE_5_7, description: 'Ingliz alifbosining birinchi yarmi.' },
  { title: "Qo'shish va ayirish", slug: 'sodda-matematika', ageGroup: AGE_GROUP.AGE_5_7, description: '10 ichida sodda amallar.' },
  { title: 'Ketma-ketlikni top', slug: 'mantiqiy-oyinlar', ageGroup: AGE_GROUP.AGE_5_7, description: 'Mantiqiy fikrlashni rivojlantiruvchi mashqlar.' },
];

const GAMES = [
  {
    code: GAME_TYPE.COLOR_MATCH,
    title: 'Rangni top',
    slug: 'ranglar',
    ageGroup: AGE_GROUP.AGE_1_2,
    description: 'Rang nomi chiqadi — bola to‘g‘ri rangni tanlaydi.',
    items: [
      { promptText: 'Qizil', correctValue: 'red', options: [{ value: 'red', label: 'Qizil', color: '#ef4444' }, { value: 'blue', label: "Ko'k", color: '#3b82f6' }, { value: 'green', label: 'Yashil', color: '#22c55e' }] },
      { promptText: "Ko'k", correctValue: 'blue', options: [{ value: 'yellow', label: 'Sariq', color: '#eab308' }, { value: 'blue', label: "Ko'k", color: '#3b82f6' }, { value: 'red', label: 'Qizil', color: '#ef4444' }] },
      { promptText: 'Sariq', correctValue: 'yellow', options: [{ value: 'green', label: 'Yashil', color: '#22c55e' }, { value: 'yellow', label: 'Sariq', color: '#eab308' }, { value: 'blue', label: "Ko'k", color: '#3b82f6' }] },
    ],
  },
  {
    code: GAME_TYPE.ANIMAL_SOUND,
    title: 'Hayvonni top',
    slug: 'hayvonlar',
    ageGroup: AGE_GROUP.AGE_1_2,
    description: 'Hayvon ovozi eshitiladi — bola to‘g‘ri hayvonni tanlaydi.',
    items: [
      { promptText: 'Bu qaysi hayvonning ovozi?', correctValue: 'cat', options: [{ value: 'cat', label: 'Mushuk' }, { value: 'dog', label: 'It' }, { value: 'cow', label: 'Sigir' }] },
      { promptText: 'Bu qaysi hayvonning ovozi?', correctValue: 'dog', options: [{ value: 'sheep', label: "Qo'y" }, { value: 'dog', label: 'It' }, { value: 'cat', label: 'Mushuk' }] },
    ],
  },
  {
    code: GAME_TYPE.LETTER_MATCH,
    title: 'Harfni top',
    slug: 'harflar',
    ageGroup: AGE_GROUP.AGE_3_4,
    description: 'Harf ko‘rsatiladi — bola mos harfni tanlaydi.',
    items: [
      { promptText: 'A', correctValue: 'A', options: [{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'D', label: 'D' }] },
      { promptText: 'M', correctValue: 'M', options: [{ value: 'N', label: 'N' }, { value: 'M', label: 'M' }, { value: 'H', label: 'H' }] },
    ],
  },
  {
    code: GAME_TYPE.NUMBER_MATCH,
    title: 'Raqamni top',
    slug: 'raqamlar',
    ageGroup: AGE_GROUP.AGE_3_4,
    description: 'Ekranda son chiqadi — bola shu sonni tanlaydi.',
    items: [
      { promptText: '3', correctValue: '3', options: [{ value: '1', label: '1' }, { value: '3', label: '3' }, { value: '8', label: '8' }] },
      { promptText: '7', correctValue: '7', options: [{ value: '7', label: '7' }, { value: '4', label: '4' }, { value: '9', label: '9' }] },
    ],
  },
  {
    code: GAME_TYPE.PUZZLE,
    title: 'Puzzle',
    slug: 'shakllar',
    ageGroup: AGE_GROUP.AGE_5_7,
    description: 'Rasm bo‘laklarga bo‘linadi — bola ularni joyiga qo‘yadi.',
    config: { rows: 3, cols: 3 },
    items: [{ promptText: 'Rasmni yig‘', correctValue: 'solved', options: [{ value: 'solved', label: 'Yig‘ilgan rasm' }] }],
  },
  {
    code: GAME_TYPE.MEMORY,
    title: 'Memory Game',
    slug: 'mantiqiy-oyinlar',
    ageGroup: AGE_GROUP.AGE_5_7,
    description: 'Kartochkalarni ochib juftini topadi.',
    config: { pairs: 6 },
    items: [{ promptText: 'Juftlarni top', correctValue: 'matched', options: [{ value: 'matched', label: 'Barcha juftlar topildi' }] }],
  },
];

/** Bugungi sanadan berilgan yosh chiqadigan tug'ilgan sana. */
function birthDateForAge(age: number): Date {
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  date.setMonth(0, 15);
  date.setHours(0, 0, 0, 0);
  return date;
}

async function main() {
  const password = await hashPassword('password123');

  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      fullName: 'Administrator',
      email: 'admin@gmail.com',
      password,
      role: USER_ROLE.ADMIN,
    },
  });

  const parent = await prisma.user.upsert({
    where: { email: 'parent@gmail.com' },
    update: {},
    create: {
      fullName: 'Malika Abduvaliyeva',
      email: 'ota-ona@gmail.com',
      password,
      role: USER_ROLE.PARENT,
      phone: '+998901234567',
    },
  });

  const categories = new Map<string, string>();

  for (const category of CATEGORIES) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });

    categories.set(saved.slug, saved.id);
  }

  const children = [
    { fullName: 'Amirbek', age: 2, avatar: '🦁' },
    { fullName: 'Zilola', age: 4, avatar: '🦄' },
    { fullName: 'Sardor', age: 6, avatar: '🚀' },
  ];

  for (const child of children) {
    const existing = await prisma.child.findFirst({
      where: { parentId: parent.id, fullName: child.fullName },
    });

    if (existing) continue;

    await prisma.child.create({
      data: {
        parentId: parent.id,
        fullName: child.fullName,
        birthDate: birthDateForAge(child.age),
        avatar: child.avatar,
        stats: { create: {} },
      },
    });
  }

  if ((await prisma.lesson.count()) === 0) {
    for (const [index, lesson] of LESSONS.entries()) {
      await prisma.lesson.create({
        data: {
          title: lesson.title,
          description: lesson.description,
          categoryId: categories.get(lesson.slug)!,
          ageGroup: lesson.ageGroup,
          order: index,
        },
      });
    }
  }

  if ((await prisma.game.count()) === 0) {
    for (const [index, game] of GAMES.entries()) {
      await prisma.game.create({
        data: {
          code: game.code,
          title: game.title,
          description: game.description,
          categoryId: categories.get(game.slug)!,
          ageGroup: game.ageGroup,
          config: game.config,
          order: index,
          items: {
            create: game.items.map((item, order) => ({ ...item, order })),
          },
        },
      });
    }
  }

  const demoChildren = await prisma.child.findMany({ where: { parentId: parent.id } });

  for (const child of demoChildren) {
    await seedActivity(child.id, ageGroupOf(child.birthDate));
  }

  console.info('Seed completed.');
  console.info('Admin:    admin@kidslearn.uz / password123');
  console.info('Ota-ona:  ota-ona@kidslearn.uz / password123');
}

async function seedActivity(childId: string, ageGroup: AGE_GROUP) {
  if ((await prisma.gameSession.count({ where: { childId: childId } })) > 0) return;

  const lessons = await prisma.lesson.findMany({ where: { ageGroup: ageGroup, active: true }, orderBy: { order: 'asc' } });
  const games = await prisma.game.findMany({
    where: { ageGroup: ageGroup, active: true },
    include: { items: { where: { active: true } } },
  });

  if (!games.length) return;

  const today = dateOnly();

  let totalPoints = 0;
  let totalStars = 0;
  let gamesPlayed = 0;
  let lessonsCompleted = 0;

  for (let offset = 6; offset >= 0; offset--) {
    const day = addDays(today, -offset);
    const playedAt = new Date(day.getTime() + 15 * 60 * 60 * 1000);

    let dayPoints = 0;
    let dayGames = 0;
    let dayLessons = 0;
    let daySeconds = 0;

    const rounds = offset % 3 === 0 ? 2 : 1;

    for (let round = 0; round < rounds; round++) {
      const game = games[(offset + round) % games.length];
      const total = Math.max(game.items.length, 1);
      const accuracy = Math.min(1, 0.5 + (6 - offset) * 0.07 + round * 0.05);
      const correct = Math.max(1, Math.round(total * accuracy));
      const percent = (correct / total) * 100;
      const stars = percent >= 90 ? 3 : percent >= 70 ? 2 : percent >= 40 ? 1 : 0;
      const score = correct * game.pointsPerCorrect;
      const duration = 60 + round * 45;

      await prisma.gameSession.create({
        data: {
          childId: childId,
          gameId: game.id,
          totalItems: total,
          correctCount: correct,
          wrongCount: total - correct,
          score,
          stars,
          durationSeconds: duration,
          createdAt: playedAt,
        },
      });

      dayPoints += score;
      dayGames += 1;
      daySeconds += duration;
      totalStars += stars;
      gamesPlayed += 1;
    }

    const lessonIndex = Math.floor((6 - offset) / 2);

    if (offset % 2 === 0 && lessons[lessonIndex]) {
      const lesson = lessons[lessonIndex];

      await prisma.lessonProgress.upsert({
        where: { childId_lessonId: { childId: childId, lessonId: lesson.id } },
        update: {},
        create: {
          childId: childId,
          lessonId: lesson.id,
          status: PROGRESS_STATUS.COMPLETED,
          progressPercent: 100,
          watchedSeconds: 240,
          pointsEarned: lesson.points,
          startedAt: playedAt,
          completedAt: playedAt,
        },
      });

      dayPoints += lesson.points;
      dayLessons += 1;
      daySeconds += 240;
      lessonsCompleted += 1;
    }

    totalPoints += dayPoints;

    await prisma.dailyActivity.upsert({
      where: { childId_date: { childId: childId, date: day } },
      update: {},
      create: {
        childId: childId,
        date: day,
        points: dayPoints,
        gamesPlayed: dayGames,
        lessonsCompleted: dayLessons,
        activeSeconds: daySeconds,
      },
    });
  }

  const stats = {
    totalPoints: totalPoints,
    totalStars: totalStars,
    gamesPlayed: gamesPlayed,
    lessonsCompleted: lessonsCompleted,
    streakDays: 7,
    longestStreak: 7,
    lastActivityAt: new Date(),
  };

  await prisma.childStats.upsert({
    where: { childId: childId },
    update: stats,
    create: { childId: childId, ...stats },
  });

  const earned = AWARD_RULES.filter(rule => rule.check({ stats })).map(({ check, ...award }) => award);

  await prisma.award.createMany({
    data: earned.map(award => ({ childId: childId, ...award, medal: award.medal as MEDAL_TYPE })),
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async e => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
