import { test, expect, type Page } from '@playwright/test';

const SUPABASE_AUTH_TIMEOUT = 20_000;
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? '';
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? '';
const HAS_ADMIN_CREDS = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/');
  await page.getByLabel(/Identification \(Email\)/).fill(email);
  await page.getByLabel(/Access Key \(Password\)/).fill(password);
  await page.getByRole('button', { name: /AUTHENTICATE/ }).click();
}

async function signOut(page: Page): Promise<void> {
  await page.getByRole('button', { name: /User menu/ }).click();
  await page.getByRole('menuitem', { name: /Sign out/ }).click();
  await expect(
    page.getByRole('button', { name: /AUTHENTICATE/ }),
  ).toBeVisible({ timeout: 10_000 });
}

/**
 * Admin E2E: opt-in via env vars. Set both `E2E_ADMIN_EMAIL` and
 * `E2E_ADMIN_PASSWORD` to run. Skip otherwise — this test creates a
 * real Supabase auth user and writes to `exam_seasons`, so it should
 * not run in local dev unless the env vars are explicitly set.
 *
 * The test only validates the happy path: sign in as admin, reach the
 * console, see the New Season button. CRUD-on-data correctness is
 * covered by `useExamSeasons` unit tests + manual smoke tests.
 */
test.describe('admin console (Exam Seasons CRUD)', () => {
  test.skip(
    !HAS_ADMIN_CREDS,
    'E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD env vars are not set. The admin E2E is opt-in; set both to run.',
  );

  test('admin can sign in, reach the console, and see the New Season affordance', async ({
    page,
  }) => {
    await signIn(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await expect(
      page.getByRole('heading', { name: /Welcome|Welcome back/ }),
    ).toBeVisible({ timeout: SUPABASE_AUTH_TIMEOUT });

    // The "Admin Console" item only appears in the user menu for
    // users in the admin_allowlist table.
    await page.getByRole('button', { name: /User menu/ }).click();
    const adminConsoleItem = page.getByRole('menuitem', { name: /Admin Console/ });
    await expect(adminConsoleItem).toBeVisible({ timeout: 5_000 });

    await adminConsoleItem.click();
    await expect(
      page.getByRole('heading', { name: /Exam Seasons/ }),
    ).toBeVisible({ timeout: 10_000 });
    await expect(
      page.getByRole('button', { name: /New Season/ }),
    ).toBeVisible();

    await signOut(page);
  });
});
