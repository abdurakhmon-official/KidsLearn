const MS_PER_DAY = 24 * 60 * 60 * 1000;

export const dateOnly = (date: Date = new Date()): Date => {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export const addDays = (date: Date, days: number): Date => {
  return new Date(date.getTime() + days * MS_PER_DAY);
}

export const diffInDays = (from: Date, to: Date): number => {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

export const startOfRange = (days: number, at: Date = new Date()): Date => {
  return addDays(dateOnly(at), -(days - 1));
}

export const startOfLocalDay = (at: Date = new Date()): Date => {
  return new Date(at.getFullYear(), at.getMonth(), at.getDate());
}

export const startOfLocalRange = (days: number, at: Date = new Date()): Date => {
  const start = startOfLocalDay(at);
  start.setDate(start.getDate() - (days - 1));
  return start;
}

export const toDateKey = (date: Date): string => {
  return date.toISOString().slice(0, 10);
}

export const eachDay = (from: Date, to: Date): Date[] => {
  const days: Date[] = [];

  for (let day = from; day.getTime() <= to.getTime(); day = addDays(day, 1)) {
    days.push(day);
  }

  return days;
}
