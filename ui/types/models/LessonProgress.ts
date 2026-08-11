// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type LessonProgress = {
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    id: string;
    childId: string;
    lessonId: string;
    progressPercent: number;
    watchedSeconds: number;
    pointsEarned: number;
    startedAt: Date;
    completedAt: Date | null;
    updatedAt: Date;
    child: any;
    lesson: any;
};