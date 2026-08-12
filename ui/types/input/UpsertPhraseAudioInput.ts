// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type UpsertPhraseAudioInput = {
    key: string;
    locale?: "uz" | "ru" | "en";
    text: string;
    url: string;
    source?: unknown;
    durationMs?: (number | undefined) | null;
    active?: boolean;
};