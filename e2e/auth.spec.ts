import { expect, test } from '@playwright/test';

// このファイルのテストは未認証状態で実行
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('ログインページ表示', () => {
  test('ログインフォームが正しく表示される', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'MoodPick' })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
    await expect(page.getByRole('button', { name: '新規登録' })).toBeVisible();
    await expect(page.getByText('パスワードを忘れた方はこちら')).toBeVisible();
  });

  test('未入力時はログインボタンが無効', async ({ page }) => {
    await page.goto('/login');

    const loginButton = page.getByRole('button', { name: 'ログイン' });
    await expect(loginButton).toBeDisabled();

    // メールのみ入力 → まだ無効
    await page.locator('input[type="email"]').fill('test@example.com');
    await expect(loginButton).toBeDisabled();

    // パスワードも入力 → 有効
    await page.locator('input[type="password"]').fill('password');
    await expect(loginButton).toBeEnabled();
  });
});

test.describe('認証リダイレクト', () => {
  test('保護ルート（/）へのアクセスは/loginにリダイレクト', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForURL('/login');
    await expect(page.getByRole('heading', { name: 'MoodPick' })).toBeVisible();
  });

  test('各保護ルートから/loginにリダイレクト', async ({ page }) => {
    for (const path of ['/list', '/search', '/profile', '/feed']) {
      await page.goto(path);
      await page.waitForURL('/login');
    }
  });
});

test.describe('ログイン操作', () => {
  test('無効な認証情報でエラーメッセージ表示', async ({ page }) => {
    await page.goto('/login');

    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.getByRole('button', { name: 'ログイン' }).click();

    await expect(
      page.getByText('メールアドレスまたはパスワードが正しくありません'),
    ).toBeVisible({ timeout: 10000 });
  });

  test('有効な認証情報でログイン → ホームへ遷移', async ({ page }) => {
    const email = process.env.E2E_USER_EMAIL ?? '';
    const password = process.env.E2E_USER_PASSWORD ?? '';
    test.skip(!email || !password, 'E2E test credentials not set');

    await page.goto('/login');

    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'ログイン' }).click();

    await page.waitForURL('/', { timeout: 15000 });
    await expect(
      page.locator('[data-testid="notification-bell"]'),
    ).toBeVisible();
  });
});

test.describe('新規登録ページ', () => {
  test('ログインページから新規登録ページへ遷移', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '新規登録' }).click();

    await page.waitForURL('/signup');
    await expect(
      page.getByRole('heading', { name: 'アカウント作成' }),
    ).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    // パスワード入力欄が2つ（パスワード + 確認）
    await expect(page.locator('input[type="password"]')).toHaveCount(2);
  });

  test('パスワード不一致でエラー表示', async ({ page }) => {
    await page.goto('/signup');

    await page.locator('input[type="email"]').fill('test@example.com');
    await page.locator('input[type="password"]').first().fill('password123');
    await page.locator('input[type="password"]').nth(1).fill('different456');

    await page.getByRole('button', { name: 'アカウント作成' }).click();

    await expect(page.getByText('パスワードが一致しません')).toBeVisible();
  });
});
