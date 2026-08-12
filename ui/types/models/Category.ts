// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    color: string | null;
    audioUrl: string | null;
    order: number;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    lessons: any[];
    games: any[];
};