// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type User = {
    role: "ADMIN" | "PARENT";
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    password: string;
    avatar: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    children: any[];
    notifications: any[];
    uploads: any[];
};