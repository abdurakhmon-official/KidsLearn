// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type LessonMedia = {
    type: "IMAGE" | "VIDEO" | "AUDIO";
    id: string;
    lessonId: string;
    url: string;
    caption: string | null;
    order: number;
    createdAt: Date;
    lesson: any;
};