// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type GameRound = {
    id: string;
    childId: string;
    gameId: string;
    itemIds: any;
    layout: any | null;
    submittedAt: Date | null;
    createdAt: Date;
    child: any;
    game: any;
};