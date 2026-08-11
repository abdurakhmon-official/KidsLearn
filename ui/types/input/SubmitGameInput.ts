// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type SubmitGameInput = {
    answers: {
        itemId: string;
        value?: (string | null) | undefined;
    }[];
    durationSeconds?: (number | undefined) | null;
};