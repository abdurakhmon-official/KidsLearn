// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type UpdateGameInput = {
    code?: unknown | undefined;
    title?: string | undefined;
    description?: ((string | undefined) | null) | undefined;
    categoryId?: ((string | undefined) | null) | undefined;
    ageGroup?: unknown | undefined;
    coverImage?: ((string | undefined) | null) | undefined;
    instructionAudio?: ((string | undefined) | null) | undefined;
    pointsPerCorrect?: number | undefined;
    config?: (({
        [x: string]: any;
    } | undefined) | null) | undefined;
    order?: number | undefined;
    active?: boolean | undefined;
    items?: ({
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
    }[] | undefined) | undefined;
};