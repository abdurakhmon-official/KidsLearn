// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type GameSession = {
    id: string;
    childId: string;
    gameId: string;
    totalItems: number;
    correctCount: number;
    wrongCount: number;
    score: number;
    stars: number;
    durationSeconds: number | null;
    createdAt: Date;
    child: any;
    game: any;
};