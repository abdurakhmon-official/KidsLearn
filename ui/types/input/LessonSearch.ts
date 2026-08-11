// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type LessonSearch = {
    ageGroup?: unknown | undefined;
    categoryId?: string | undefined;
    active?: (boolean | ("true" | "false")) | undefined;
    from?: Date | undefined;
    to?: Date | undefined;
};