// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type GameItem = {
    id: string;
    gameId: string;
    promptText: string | null;
    promptImage: string | null;
    promptAudio: string | null;
    correctValue: string;
    options: any;
    order: number;
    active: boolean;
    createdAt: Date;
    game: any;
};