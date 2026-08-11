// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type Game = {
    code: "COLOR_MATCH" | "ANIMAL_SOUND" | "LETTER_MATCH" | "NUMBER_MATCH" | "PUZZLE" | "MEMORY";
    ageGroup: "AGE_1_2" | "AGE_3_4" | "AGE_5_7";
    id: string;
    title: string;
    description: string | null;
    categoryId: string | null;
    coverImage: string | null;
    instructionAudio: string | null;
    pointsPerCorrect: number;
    config: any | null;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    category: any | null;
    items: any[];
    sessions: any[];
};