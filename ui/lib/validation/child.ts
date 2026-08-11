import { z } from "zod";

const birthDate = z
  .string()
  .min(1, "Tug'ilgan sanani kiriting")
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Sana noto'g'ri" })
  .refine((value) => new Date(value).getTime() <= Date.now(), {
    message: "Tug'ilgan sana kelajakda bo'lishi mumkin emas",
  })
  .refine((value) => new Date(value).getUTCFullYear() >= new Date().getFullYear() - 18, {
    message: "Sana qo'llab-quvvatlanadigan oraliqdan tashqarida",
  });

export const childSchema = z.object({
  fullName: z.string().min(1, "Ismni kiriting"),
  birthDate,
  avatar: z.string().optional(),
});

export type ChildValues = z.infer<typeof childSchema>;

export const CHILD_AVATARS = [
  "🦁", "🦄", "🚀", "🐻", "🐼", "🦊", "🐰", "🐨",
  "🐯", "🦖", "🐳", "🦋", "🌟", "🍎", "⚽", "🎨",
];
