import { MEDAL_TYPE } from '@/generated/prisma';
import { AwardDraft, AwardRule } from '@/types/award';

// rules for awards
export const AWARD_RULES: AwardRule[] = [
  {
    code: 'FIRST_LESSON',
    medal: MEDAL_TYPE.BRONZE,
    title: 'Birinchi qadam',
    description: 'Birinchi darsni tugatding!',
    icon: '🎓',
    check: ({ stats }) => stats.lessonsCompleted >= 1,
  },
  {
    code: 'FIRST_GAME',
    medal: MEDAL_TYPE.BRONZE,
    title: "Birinchi o'yin",
    description: "Birinchi o'yinni o'ynading!",
    icon: '🎮',
    check: ({ stats }) => stats.gamesPlayed >= 1,
  },
  {
    code: 'LESSONS_10',
    medal: MEDAL_TYPE.SILVER,
    title: 'Bilimdon',
    description: '10 ta darsni tugatding',
    icon: '📚',
    check: ({ stats }) => stats.lessonsCompleted >= 10,
  },
  {
    code: 'LESSONS_50',
    medal: MEDAL_TYPE.GOLD,
    title: 'Zo‘r o‘quvchi',
    description: '50 ta darsni tugatding',
    icon: '🏫',
    check: ({ stats }) => stats.lessonsCompleted >= 50,
  },
  {
    code: 'POINTS_100',
    medal: MEDAL_TYPE.BRONZE,
    title: '100 ball',
    description: '100 ball to‘plading',
    icon: '⭐',
    check: ({ stats }) => stats.totalPoints >= 100,
  },
  {
    code: 'POINTS_500',
    medal: MEDAL_TYPE.SILVER,
    title: '500 ball',
    description: '500 ball to‘plading',
    icon: '🌟',
    check: ({ stats }) => stats.totalPoints >= 500,
  },
  {
    code: 'POINTS_2000',
    medal: MEDAL_TYPE.GOLD,
    title: '2000 ball',
    description: '2000 ball to‘plading',
    icon: '🏆',
    check: ({ stats }) => stats.totalPoints >= 2000,
  },
  {
    code: 'POINTS_5000',
    medal: MEDAL_TYPE.DIAMOND,
    title: '5000 ball',
    description: '5000 ball to‘plading',
    icon: '💎',
    check: ({ stats }) => stats.totalPoints >= 5000,
  },
  {
    code: 'STREAK_3',
    medal: MEDAL_TYPE.BRONZE,
    title: '3 kun ketma-ket',
    description: '3 kun to‘xtamay shug‘ullanding',
    icon: '🔥',
    check: ({ stats }) => stats.streakDays >= 3,
  },
  {
    code: 'STREAK_7',
    medal: MEDAL_TYPE.SILVER,
    title: 'Bir hafta',
    description: '7 kun to‘xtamay shug‘ullanding',
    icon: '🔥',
    check: ({ stats }) => stats.streakDays >= 7,
  },
  {
    code: 'STREAK_30',
    medal: MEDAL_TYPE.DIAMOND,
    title: 'Bir oy',
    description: '30 kun to‘xtamay shug‘ullanding',
    icon: '💎',
    check: ({ stats }) => stats.streakDays >= 30,
  },
  {
    code: 'PERFECT_GAME',
    medal: MEDAL_TYPE.SILVER,
    title: 'Xatosiz',
    description: 'O‘yinni bitta ham xato qilmay yakunlading',
    icon: '🎯',
    check: ({ perfectGame }) => !!perfectGame,
  },
];

export function categoryMasterAward(category: { name: string; slug: string }): AwardDraft {
  return {
    code: `CATEGORY_MASTER_${category.slug.toUpperCase()}`,
    medal: MEDAL_TYPE.GOLD,
    title: `${category.name} ustasi`,
    description: `"${category.name}" bo‘limidagi barcha darslarni tugatding`,
    icon: '🥇',
  };
}
