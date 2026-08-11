import { AGE_GROUP, Prisma } from '@/generated/prisma';
import { WithAge } from '@/types/child';

export const calculateAge = (birthDate: Date, at: Date = new Date()): number => {
  const birthYear = birthDate.getUTCFullYear();
  const birthMonth = birthDate.getUTCMonth();
  const birthDay = birthDate.getUTCDate();

  let age = at.getFullYear() - birthYear;

  if (at.getMonth() < birthMonth || (at.getMonth() === birthMonth && at.getDate() < birthDay)) {
    age--;
  }

  return Math.max(age, 0);
}

export const resolveAgeGroup = (age: number): AGE_GROUP => {
  if (age <= 2) return AGE_GROUP.AGE_1_2;
  if (age <= 4) return AGE_GROUP.AGE_3_4;

  return AGE_GROUP.AGE_5_7;
}

export const ageGroupOf = (birthDate: Date, at?: Date): AGE_GROUP => {
  return resolveAgeGroup(calculateAge(birthDate, at));
}

export const withAge = <T extends { birthDate: Date }>(child: T): WithAge<T> => {
  const age = calculateAge(child.birthDate);
  return { ...child, age, ageGroup: resolveAgeGroup(age) };
}

const utcDateMinusYears = (years: number, at: Date = new Date()): Date => {
  return new Date(Date.UTC(at.getFullYear() - years, at.getMonth(), at.getDate()));
}

export const birthDateRangeFor = (ageGroup: AGE_GROUP, at: Date = new Date()): Prisma.DateTimeFilter => {
  switch (ageGroup) {
    case AGE_GROUP.AGE_1_2:
      return { gt: utcDateMinusYears(3, at) };
    case AGE_GROUP.AGE_3_4:
      return { gt: utcDateMinusYears(5, at), lte: utcDateMinusYears(3, at) };
    case AGE_GROUP.AGE_5_7:
      return { lte: utcDateMinusYears(5, at) };
  }
}

export const birthDateRangeForAge = (age: number, at: Date = new Date()): Prisma.DateTimeFilter => {
  return { gt: utcDateMinusYears(age + 1, at), lte: utcDateMinusYears(age, at) };
}
