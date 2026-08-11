// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type ChildStats = {
    childId: string;
    totalPoints: number;
    totalStars: number;
    gamesPlayed: number;
    lessonsCompleted: number;
    streakDays: number;
    longestStreak: number;
    lastActivityAt: Date | null;
    updatedAt: Date;
    child: any;
};