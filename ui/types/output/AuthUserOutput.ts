// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type AuthUserOutput = {
    role: "ADMIN" | "PARENT";
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    isAdmin: boolean;
};