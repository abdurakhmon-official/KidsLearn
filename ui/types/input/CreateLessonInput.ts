// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type CreateLessonInput = {
    title: string;
    description?: (string | undefined) | null;
    categoryId: string;
    ageGroup: unknown;
    coverImage?: (string | undefined) | null;
    videoUrl?: (string | undefined) | null;
    audioUrl?: (string | undefined) | null;
    points?: number;
    order?: number;
    active?: boolean;
    media?: {
        type: unknown;
        url: string;
        caption?: (string | undefined) | null;
        order?: number;
    }[] | undefined;
};