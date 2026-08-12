import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://autoswap.ge';
const BREAKPOINTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

const ROUTES = {
  home: '/',
  cars: '/cars',
  carsTbilisi: '/cars?city=%E1%83%97%E1%83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98',
  sell: '/sell',
  account: '/account',
  offers: '/account?tab=offers',
  about: '/about',
  terms: '/terms',
  privacy: '/privacy',
  contact: '/about#contact',
  vehicleBentley: '/vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b',
  vehicleMercedes: '/vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec',
};

async function gotoAndWait(page: Page, path: string) {
  await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function assertNoConsoleErrors(page: Page, errors: string[]) {
  expect.soft(errors, 'Console errors detected').toEqual([]);
}

async function assertNoPageErrors(page: Page, pageErrors: string[]) {
  expect.soft(pageErrors, 'Uncaught page errors detected').toEqual([]);
}

for (const bp of BREAKPOINTS) {
  test.describe(`${bp.name} viewport`, () => {
    test.use({ viewport: { width: bp.width, height: bp.height } });

    let consoleErrors: string[];
    let pageErrors: string[];

    test.beforeEach(async ({ page }) => {
      consoleErrors = [];
      pageErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      page.on('pageerror', err => {
        pageErrors.push(String(err));
      });
    });

    test('global navigation and footer links resolve', async ({ page }) => {
      await gotoAndWait(page, ROUTES.carsTbilisi);

      // `მთავარი`, `პროფილი` and `დამატება` live only in the tab bar, which is
      // phone-and-tablet only — the desktop header carries the nav instead. So
      // those are asserted below 1024px and skipped above it, rather than
      // pretending a hidden element should be visible.
      // `მთავარი` also matches the brand link's aria-label ("AutoSwap მთავარი
      // გვერდი"), and `ჩვენ შესახებ` appears in header and footer — exact/first
      // keeps both out of strict-mode violations.
      if (bp.width < 1024) {
        await expect(page.getByRole('link', { name: 'მთავარი', exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: /დამატება|განცხადების დამატება/i }).first()).toBeVisible();
        await expect(page.getByRole('link', { name: /პროფილი/i })).toBeVisible();
      }
      await expect(page.getByRole('link', { name: /გაცვლები/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /ჩვენ შესახებ/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /წესები/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /კონფიდენციალურობა/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /კონტაქტი/i })).toBeVisible();

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('cars listing page renders summary, chips, sort and cards', async ({ page }) => {
      await gotoAndWait(page, ROUTES.carsTbilisi);

      await expect(page.getByRole('heading', { name: /ავტომობილები გაცვლისთვის/i })).toBeVisible();
      await expect(page.getByText(/აქტიური განცხადება/i).first()).toBeVisible();
      // Header CTA and catalog topbar CTA share this label.
      await expect(page.getByRole('link', { name: /დაამატე მანქანა/i }).first()).toBeVisible();
      await expect(page.getByRole('combobox', { name: /დალაგება/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Toyota/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /BMW/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /Bentley/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /BENTLEY ARMOURED ARNAGE/i }).first()).toBeVisible();
      await expect(page.getByRole('link', { name: /MERCEDES-BENZ 190/i }).first()).toBeVisible();
      await expect(page.getByText(/თანაბარი გაცვლა|სხვაობა შეთანხმებით/i).first()).toBeVisible();

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('listing filters by make via chip links', async ({ page }) => {
      await gotoAndWait(page, ROUTES.cars);
      await page.getByRole('link', { name: /Toyota/i }).first().click();
      await expect(page).toHaveURL(/make=Toyota/);
      await expect(page.getByRole('heading', { name: /ავტომობილები გაცვლისთვის/i })).toBeVisible();
      await expect(page.getByText(/აქტიური გაცვლა/i)).toBeVisible();

      await page.getByRole('link', { name: /BMW/i }).first().click();
      await expect(page).toHaveURL(/make=BMW/);

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('listing filters by category and cash chips', async ({ page }) => {
      await gotoAndWait(page, ROUTES.cars);

      await page.getByRole('link', { name: /სედანი/i }).first().click();
      await expect(page).toHaveURL(/category=sedan/);

      await gotoAndWait(page, ROUTES.cars);
      await page.getByRole('link', { name: /გარეშე/i }).first().click();
      await expect(page).toHaveURL(/cash=none/);

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('sort select changes without breaking cards', async ({ page }) => {
      await gotoAndWait(page, ROUTES.carsTbilisi);

      const sort = page.getByRole('combobox', { name: /დალაგება/i });
      await sort.selectOption({ label: 'ახალი პირველი' });
      await expect(sort).toHaveValue(/ახალი პირველი|new|latest/i);

      await sort.selectOption({ label: 'წელი კლებადობით' });
      await expect(page.getByRole('link', { name: /BENTLEY ARMOURED ARNAGE|MERCEDES-BENZ 190|BMW 128i/i }).first()).toBeVisible();

      await sort.selectOption({ label: 'ღირებულება კლებადობით' });
      await expect(page.locator('body')).toContainText(/აქტიური გაცვლა/i);

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('vehicle detail pages open from cards', async ({ page }) => {
      await gotoAndWait(page, ROUTES.carsTbilisi);

      await page.getByRole('link', { name: /BENTLEY ARMOURED ARNAGE/i }).first().click();
      await expect(page).toHaveURL(/\/vehicle\?id=/);
      await expect(page.locator('body')).toContainText(/BENTLEY ARMOURED ARNAGE/i);

      await gotoAndWait(page, ROUTES.carsTbilisi);
      await page.getByRole('link', { name: /MERCEDES-BENZ 190/i }).first().click();
      await expect(page).toHaveURL(/da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec/);
      await expect(page.locator('body')).toContainText(/MERCEDES-BENZ 190/i);

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('static content pages load', async ({ page }) => {
      for (const path of [ROUTES.about, ROUTES.terms, ROUTES.privacy]) {
        await gotoAndWait(page, path);
        // 'main, body' is two elements on these pages, which strict mode
        // rejects; body already covers the assertion.
        await expect(page.locator('body')).toContainText(/AutoSwap|ავტო|გაცვლ/i);
      }

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('sell page loads and exposes form entry point', async ({ page }) => {
      await gotoAndWait(page, ROUTES.sell);
      await expect(page.locator('body')).toContainText(/დაამატე|განცხადება|მანქანა/i);
      await expect(page.getByRole('button').or(page.getByRole('link')).first()).toBeVisible();

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('account and offers pages are reachable', async ({ page }) => {
      // Both are gated: a signed-out browser is sent to /login?next=… . That
      // redirect IS the correct behaviour, so assert either destination rather
      // than pretending the account page renders without a session.
      await gotoAndWait(page, ROUTES.account);
      await expect(page).toHaveURL(/\/account|\/login\?next=/);
      await expect(page.locator('body')).toContainText(/პროფილი|account|შეთავაზებ|შესვლა/i);

      await gotoAndWait(page, ROUTES.offers);
      await expect(page).toHaveURL(/tab=offers|\/login\?next=/);
      await expect(page.locator('body')).toContainText(/შეთავაზებ|offers|შესვლა/i);

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('mobile navigation remains usable on small screens', async ({ page }) => {
      test.skip(bp.name !== 'mobile', 'Mobile-only assertions');
      await gotoAndWait(page, ROUTES.carsTbilisi);

      const navLinks = [
        page.getByRole('link', { name: 'მთავარი', exact: true }),
        page.getByRole('link', { name: /^გაცვლები$/i }).last(),
        page.getByRole('link', { name: /დამატება/i }).first(),
        page.getByRole('link', { name: /შეთავაზებები/i }),
        page.getByRole('link', { name: /პროფილი/i }),
      ];

      for (const link of navLinks) {
        await expect(link).toBeVisible();
      }

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('regression: city query param page stays stable', async ({ page }) => {
      await gotoAndWait(page, ROUTES.carsTbilisi);
      await expect(page).toHaveURL(/city=/);
      await expect(page.getByText(/თბილისი/i).first()).toBeVisible();
      await expect(page.locator('body')).not.toContainText(/404|Not Found|Something went wrong/i);

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('regression: save CTAs render on cards', async ({ page }) => {
      await gotoAndWait(page, ROUTES.carsTbilisi);
      // The save control is an icon-only button — the word lives in its
      // aria-label ("<car> შენახვა"), so getByText finds nothing.
      const saveButtons = page.getByRole('button', { name: /შენახვა/i });
      await expect(saveButtons.first()).toBeVisible();
      await expect(saveButtons).toHaveCount(12);

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('regression: no broken primary routes', async ({ page }) => {
      const candidates = [
        ROUTES.home,
        ROUTES.cars,
        ROUTES.sell,
        ROUTES.about,
        ROUTES.terms,
        ROUTES.privacy,
        ROUTES.vehicleBentley,
        ROUTES.vehicleMercedes,
      ];

      for (const path of candidates) {
        const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
        expect.soft(response?.status(), `${path} should not 404`).toBeLessThan(400);
      }

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });
  });
}
