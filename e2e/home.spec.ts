import { expect, test } from '@playwright/test';

// storageState は playwright.config.ts から自動適用（認証済み）

test.describe('ホームページ', () => {
  test('ナビゲーション付きで表示される', async ({ page }) => {
    await page.goto('/');

    // ナビゲーションが表示される
    await expect(
      page
        .locator(
          'nav[aria-label="メインナビゲーション"], nav[aria-label="モバイルナビゲーション"]',
        )
        .first(),
    ).toBeVisible();

    // 通知ベルが表示される
    await expect(
      page.locator('[data-testid="notification-bell"]'),
    ).toBeVisible();
  });

  test('ナビゲーションでページ遷移', async ({ page }) => {
    await page.goto('/');

    const nav = page
      .locator(
        'nav[aria-label="メインナビゲーション"], nav[aria-label="モバイルナビゲーション"]',
      )
      .first();

    // リストページ
    await nav.getByText('リスト').click();
    await page.waitForURL('/list');

    // 検索ページ
    await nav.getByText('検索').click();
    await page.waitForURL('/search');

    // プロフィールページ
    await nav.getByText('プロフィール').click();
    await page.waitForURL('/profile');

    // ホームに戻る
    await nav.getByText('ホーム').click();
    await page.waitForURL('/');
  });
});

test.describe('認証済みリダイレクト', () => {
  test('/login にアクセスすると / にリダイレクト', async ({ page }) => {
    await page.goto('/login');
    await page.waitForURL('/');
  });

  test('/signup にアクセスすると / にリダイレクト', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForURL('/');
  });
});

test.describe('ログアウト', () => {
  test('設定ページからログアウト → /login にリダイレクト', async ({ page }) => {
    await page.goto('/settings');

    // ログアウトボタンをクリック
    await page.locator('[data-testid="logout-button"]').click();

    // 確認ダイアログで「ログアウト」をクリック
    const dialog = page.locator('[role="alertdialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('ログアウトしますか？')).toBeVisible();
    await dialog.getByRole('button', { name: 'ログアウト' }).click();

    // /login にリダイレクト
    await page.waitForURL('/login', { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'MoodPick' })).toBeVisible();
  });
});
