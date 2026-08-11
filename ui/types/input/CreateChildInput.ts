// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type CreateChildInput = {
    fullName: string;
    birthDate: Date;
    avatar?: (string | undefined) | null;
    parentId?: string | undefined;
};