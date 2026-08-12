// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type CreateCategoryInput = {
    name: string;
    slug?: string | undefined;
    description?: (string | undefined) | null;
    icon?: (string | undefined) | null;
    color?: (string | undefined) | null;
    audioUrl?: (string | undefined) | null;
    order?: number;
    active?: boolean;
};