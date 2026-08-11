// WARNING: Do not change this file manually. Use yarn generate:types from the api project to update it

 export type MediaAsset = {
    type: "IMAGE" | "VIDEO" | "AUDIO";
    id: string;
    url: string;
    key: string;
    originalName: string;
    mimeType: string;
    size: number;
    uploadedById: string | null;
    createdAt: Date;
    uploader: any | null;
};