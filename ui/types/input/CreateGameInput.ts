// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type CreateGameInput = {
    code: unknown;
    title: string;
    description?: (string | undefined) | null;
    categoryId?: (string | undefined) | null;
    ageGroup: unknown;
    coverImage?: (string | undefined) | null;
    instructionAudio?: (string | undefined) | null;
    pointsPerCorrect?: number;
    config?: ({
        [x: string]: any;
    } | undefined) | null;
    order?: number;
    active?: boolean;
    items?: {
        promptText?: (string | undefined) | null;
        promptImage?: (string | undefined) | null;
        promptAudio?: (string | undefined) | null;
        correctValue: string;
        options: {
            value: string;
            label?: (string | undefined) | null;
            image?: (string | undefined) | null;
            audio?: (string | undefined) | null;
            color?: (string | undefined) | null;
        }[];
        order?: number;
        active?: boolean;
    }[] | undefined;
};