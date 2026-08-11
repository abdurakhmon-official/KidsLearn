// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type ChildProfileOutput = {
    id: string;
    parentId: string;
    fullName: string;
    birthDate: Date;
    avatar: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    age: number;
    ageGroup: "AGE_1_2" | "AGE_3_4" | "AGE_5_7";
};