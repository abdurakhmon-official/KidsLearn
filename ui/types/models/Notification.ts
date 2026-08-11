// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type Notification = {
    type: "NO_ACTIVITY_TODAY" | "NEW_LESSON" | "AWARD_EARNED";
    id: string;
    userId: string;
    childId: string | null;
    title: string;
    body: string;
    data: any | null;
    readAt: Date | null;
    createdAt: Date;
    user: any;
    child: any | null;
};