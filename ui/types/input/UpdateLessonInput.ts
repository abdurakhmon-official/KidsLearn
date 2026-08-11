// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type UpdateLessonInput = {
    title?: string | undefined;
    description?: ((string | undefined) | null) | undefined;
    categoryId?: string | undefined;
    ageGroup?: unknown | undefined;
    coverImage?: ((string | undefined) | null) | undefined;
    videoUrl?: ((string | undefined) | null) | undefined;
    audioUrl?: ((string | undefined) | null) | undefined;
    points?: number | undefined;
    order?: number | undefined;
    active?: boolean | undefined;
    media?: ({
        type: unknown;
        url: string;
        caption?: (string | undefined) | null;
        order?: number;
    }[] | undefined) | undefined;
};