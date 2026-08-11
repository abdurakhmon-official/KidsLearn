// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type Award = {
    medal: "BRONZE" | "SILVER" | "GOLD" | "DIAMOND";
    id: string;
    childId: string;
    code: string;
    title: string;
    description: string | null;
    icon: string | null;
    earnedAt: Date;
    child: any;
};