import { z } from 'zod';
import { UserSchema } from '@/generated/zod/modelSchema/UserSchema';
import { ChildSchema } from '@/generated/zod/modelSchema/ChildSchema';
import { AGE_GROUPSchema } from '@/generated/zod/inputTypeSchemas/AGE_GROUPSchema';

export const AuthUserOutputSchema = UserSchema.omit({ password: true }).extend({
  isAdmin: z.boolean(),
});

export const ChildProfileOutputSchema = ChildSchema.extend({
  age: z.number().int().nonnegative(),
  ageGroup: AGE_GROUPSchema,
});

export type AuthUserOutput = z.infer<typeof AuthUserOutputSchema>;
export type ChildProfileOutput = z.infer<typeof ChildProfileOutputSchema>;
