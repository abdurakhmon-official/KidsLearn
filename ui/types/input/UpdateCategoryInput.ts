// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type UpdateCategoryInput = {
    name?: string | undefined;
    slug?: (string | undefined) | undefined;
    description?: ((string | undefined) | null) | undefined;
    icon?: ((string | undefined) | null) | undefined;
    color?: ((string | undefined) | null) | undefined;
    audioUrl?: ((string | undefined) | null) | undefined;
    order?: number | undefined;
    active?: boolean | undefined;
};