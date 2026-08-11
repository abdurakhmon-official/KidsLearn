// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type Lesson = {
    ageGroup: "AGE_1_2" | "AGE_3_4" | "AGE_5_7";
    id: string;
    title: string;
    description: string | null;
    categoryId: string;
    coverImage: string | null;
    videoUrl: string | null;
    audioUrl: string | null;
    points: number;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    category: any;
    media: any[];
    progress: any[];
};