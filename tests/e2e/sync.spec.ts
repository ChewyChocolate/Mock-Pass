import { test, expect, type Page } from '@playwright/test';

const SUPABASE_AUTH_TIMEOUT = 20_000;

async function signUp(
  page: Page,
  { email, password, firstName, lastName }: SignUpArgs,
): Promise<void> {
  await page.goto('/');
  await page.getByRole('button', { name: /Create Account/ }).click();
  await page.getByLabel(/First Name/).fill(firstName);
  await page.getByLabel(/Last Name/).fill(lastName);
  await page.getByLabel(/Identification \(Email\)/).fill(email);
  await page.getByLabel(/Access Key \(Password\)/).fill(password);
  await page.getByRole('button', { name: /CREATE ACCOUNT/ }).click();
}

async function signIn(page: Page, { email, password }: SignInArgs): Promise<void> {
  await page.goto('/');
  await page.getByLabel(/Identification \(Email\)/).fill(email);
  await page.getByLabel(/Access Key \(Password\)/).fill(password);
  await page.getByRole('button', { name: /AUTHENTICATE/ }).click();
}

async function signOut(page: Page): Promise<void> {
  await page.getByRole('button', { name: /User menu/ }).click();
  await page.getByRole('menuitem', { name: /Sign out/ }).click();
  // App uses in-app routing (currentScreen state) so the URL doesn't change to /login.
  // Instead, wait for LoginScreen to render: the AUTHENTICATE submit button is unique.
  await expect(
    page.getByRole('button', { name: /AUTHENTICATE/ }),
  ).toBeVisible({ timeout: 10_000 });
}

interface SignUpArgs {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface SignInArgs {
  email: string;
  password: string;
}

test.describe('cross-device history sync', () => {
  test('a completed exam session syncs to Supabase and survives sign-out + sign-in', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const email = `e2e-${timestamp}@mockpass.test`;
    const password = 'E2ETestPassword123!';
    const firstName = 'E2E';
    const lastName = 'Tester';

    // --- 1. Sign up a brand-new user ---
    await signUp(page, { email, password, firstName, lastName });

    // After sign-up, the dashboard renders a first-time CTA.
    await expect(
      page.getByRole('button', { name: /Start Your First Exam/ }),
    ).toBeVisible({ timeout: SUPABASE_AUTH_TIMEOUT });

    // --- 2. Start the exam via the hero CTA ---
    await page.getByRole('button', { name: /Start Your First Exam/ }).click();
    await expect(page.locator('text=Question')).toBeVisible({ timeout: 10_000 });

    // --- 3. Fill all answers via devtools, then reload ---
    // Devtools are loaded in DEV mode (vite dev server), which Playwright runs against.
    await page.evaluate(() => {
      const mockpass = (window as unknown as { mockpass?: { autoFillCorrect?: () => void } })
        .mockpass;
      if (!mockpass?.autoFillCorrect) {
        throw new Error('window.mockpass.autoFillCorrect is not available (dev mode required).');
      }
      mockpass.autoFillCorrect();
    });

    // autoFillCorrect() writes to localStorage and reloads the page.
    await page.waitForLoadState('load');

    // --- 4. Submit the exam ---
    await page.getByRole('button', { name: /Submit Exam|Submit/ }).click();
    // Confirmation modal: "Submit exam?" → "Submit"
    await page.getByRole('button', { name: /^Submit$/ }).click();

    // --- 5. Review screen renders the results ---
    await expect(page.getByRole('heading', { name: /Exam Results|Results|Review/i })).toBeVisible({
      timeout: 15_000,
    });

    // --- 6. Navigate back to the dashboard; the session should be in Recent Activity ---
    // MainLayout renders sidebar nav as <button>s (not links). Scope to the Primary nav.
    await page
      .getByRole('navigation', { name: 'Primary' })
      .getByRole('button', { name: /^Dashboard$/ })
      .click();

    // The Recent Activity table should show 1 session row.
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 20_000 });
    await expect(firstRow).toContainText(/Mock Exam · 150 items/);
    // With autoFillCorrect, every answer is correct → score should be very high.
    const scoreCell = firstRow.locator('td').nth(3);
    await expect(scoreCell).toContainText(/%/);

    // Wait for the sync useEffect to push the session to Supabase.
    // The remote fetch below confirms it landed; we don't sleep, we just retry.
    await expect
      .poll(
        async () => {
          return await page.evaluate(async () => {
            const mockpass = (
              window as unknown as {
                mockpass?: { history?: { remote?: () => Promise<unknown> } };
              }
            ).mockpass;
            if (!mockpass?.history?.remote) return { error: 'no remote helper' };
            const result = (await mockpass.history.remote()) as {
              count?: number;
              error?: string;
            };
            return result;
          });
        },
        { timeout: 20_000, intervals: [1_000, 2_000, 3_000] },
      )
      .toMatchObject({ count: 1 });

    // --- 7. Sign out and sign back in (simulating a different device) ---
    await signOut(page);
    await signIn(page, { email, password });

    // After sign-in, the dashboard re-hydrates from Supabase.
    // Wait for the first Recent Activity row to appear (proxy for the
    // post-relogin history having re-hydrated from Supabase).
    const rowAfterRelogin = page.locator('table tbody tr').first();
    await expect(rowAfterRelogin).toBeVisible({ timeout: SUPABASE_AUTH_TIMEOUT });
    await expect(rowAfterRelogin).toContainText(/Mock Exam · 150 items/);
  });
});
