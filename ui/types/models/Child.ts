// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type Child = {
    id: string;
    parentId: string;
    fullName: string;
    birthDate: Date;
    avatar: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    parent: any;
    stats: any | null;
    lessonProgress: any[];
    gameSessions: any[];
    gameRounds: any[];
    awards: any[];
    dailyActivity: any[];
    notifications: any[];
};