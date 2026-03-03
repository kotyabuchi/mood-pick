import { expect, test as setup } from '@playwright/test';

const authFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'E2E_USER_EMAIL and E2E_USER_PASSWORD environment variables are required.\n' +
        'Set them in your shell or create a .env.test file:\n' +
        '  E2E_USER_EMAIL=test@example.com\n' +
        '  E2E_USER_PASSWORD=your-password',
    );
  }

  await page.goto('/login');

  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'ログイン' }).click();

  // ホームページへのリダイレクトを待つ
  await page.waitForURL('/', { timeout: 15000 });
  await expect(page.locator('[data-testid="notification-bell"]')).toBeVisible();

  // 認証状態（cookies + localStorage）を保存
  await page.context().storageState({ path: authFile });
});
