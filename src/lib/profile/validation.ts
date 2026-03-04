import { z } from 'zod';

export const handleSchema = z
  .string()
  .min(3, 'ハンドルは3文字以上で入力してください')
  .max(20, 'ハンドルは20文字以内で入力してください')
  .regex(
    /^[a-z0-9_]+$/,
    'ハンドルは英小文字・数字・アンダースコアのみ使用できます',
  );

export const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, '名前を入力してください')
    .max(50, '名前は50文字以内で入力してください'),
  handle: handleSchema.optional(),
});

export type ProfileFormValues = z.infer<typeof profileFormSchema>;
