// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type DailyActivity = {
    id: string;
    childId: string;
    date: Date;
    points: number;
    gamesPlayed: number;
    lessonsCompleted: number;
    activeSeconds: number;
    child: any;
};