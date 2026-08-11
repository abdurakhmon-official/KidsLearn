// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type GameItemInput = {
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
};