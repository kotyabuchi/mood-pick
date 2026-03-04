import { describe, expect, it } from 'vitest';

import { handleSchema, profileFormSchema } from '@/lib/profile/validation';

describe('handleSchema', () => {
  it.each([
    'abc',
    'user_123',
    'a_b',
    'test_user_name_long',
  ])('有効なハンドル: %s', (handle) => {
    expect(handleSchema.safeParse(handle).success).toBe(true);
  });

  it.each([
    ['ab', '3文字未満'],
    ['a'.repeat(21), '21文字以上'],
    ['ABC', '大文字'],
    ['user-name', 'ハイフン'],
    ['user name', 'スペース'],
    ['user.name', 'ドット'],
    ['ユーザー', '日本語'],
    ['user@name', '特殊文字'],
  ])('無効なハンドル: %s (%s)', (handle) => {
    expect(handleSchema.safeParse(handle).success).toBe(false);
  });

  it('最小文字数のエラーメッセージが日本語', () => {
    const result = handleSchema.safeParse('ab');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('3文字以上');
    }
  });

  it('最大文字数のエラーメッセージが日本語', () => {
    const result = handleSchema.safeParse('a'.repeat(21));
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('20文字以内');
    }
  });

  it('フォーマットエラーメッセージが日本語', () => {
    const result = handleSchema.safeParse('ABC');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('英小文字');
    }
  });
});

describe('profileFormSchema', () => {
  it('有効なデータ (handle あり)', () => {
    const result = profileFormSchema.safeParse({
      name: 'テストユーザー',
      handle: 'test_user',
    });
    expect(result.success).toBe(true);
  });

  it('有効なデータ (handle なし)', () => {
    const result = profileFormSchema.safeParse({
      name: 'テストユーザー',
    });
    expect(result.success).toBe(true);
  });

  it('name が空文字の場合はエラー', () => {
    const result = profileFormSchema.safeParse({
      name: '',
      handle: 'test_user',
    });
    expect(result.success).toBe(false);
  });

  it('name が50文字超の場合はエラー', () => {
    const result = profileFormSchema.safeParse({
      name: 'あ'.repeat(51),
    });
    expect(result.success).toBe(false);
  });

  it('handle が無効な場合はエラー', () => {
    const result = profileFormSchema.safeParse({
      name: 'テスト',
      handle: 'AB',
    });
    expect(result.success).toBe(false);
  });
});
