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
        if (msg.type() !== 'error') return;
        const text = msg.text();
        if (/^Failed to load resource/.test(text)) return;
        consoleErrors.push(text);
      });

      page.on('response', res => {
        if (res.status() >= 400 && res.url().startsWith(BASE_URL)) {
          consoleErrors.push(`HTTP ${res.status()} ${res.url()}`);
        }
      });

      page.on('pageerror', err => {
        pageErrors.push(String(err));
      });
    });

    test('global navigation and footer links resolve', async ({ page }) => {
      await gotoAndWait(page, ROUTES.carsTbilisi);

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
      await expect(page.getByRole('link', { name: /დაამატე მანქანა/i }).first()).toBeVisible();
      await expect(page.getByRole('combobox', { name: /დალაგება/i })).toBeVisible();
      // Structure, not inventory: asserting named cars pinned the test to
      // whatever happened to be listed, and every deletion broke it.
      await expect(page.locator('.car-card').first()).toBeVisible();
      const cardCount = await page.locator('.car-card').count();
      expect(cardCount).toBeGreaterThan(0);

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('listing filters by make from the URL', async ({ page }) => {
      // Take the make from what is actually listed, then filter by it. A
      // hardcoded make breaks the day that brand has no listings.
      await gotoAndWait(page, ROUTES.cars);
      await expect(page.locator('.car-card').first()).toBeVisible();
      const title = (await page.locator('.car-card h3 a, .car-card .card-title-link').first().textContent()) || '';
      const make = title.trim().split(/\s+/)[0];
      expect(make.length).toBeGreaterThan(1);

      await gotoAndWait(page, `${ROUTES.cars}?make=${encodeURIComponent(make)}`);
      await expect(page).toHaveURL(new RegExp(`make=${make}`, 'i'));
      await expect(page.getByRole('heading', { name: /ავტომობილები გაცვლისთვის/i })).toBeVisible();
      await expect(page.locator('.car-card').first()).toBeVisible();

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('listing filters by category and cash from the URL', async ({ page }) => {
      await gotoAndWait(page, `${ROUTES.cars}?category=sedan`);
      await expect(page).toHaveURL(/category=sedan/);
      await expect(page.locator('#car-list')).toBeVisible();

      await gotoAndWait(page, `${ROUTES.cars}?cash=none`);
      await expect(page).toHaveURL(/cash=none/);
      await expect(page.locator('#car-list')).toBeVisible();

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('filter panel opens and applies a make', async ({ page }) => {
      await gotoAndWait(page, ROUTES.cars);
      const toggle = page.locator('.filters-toggle');
      if (await toggle.isVisible()) await toggle.click();
      await expect(page.locator('.filters-actions')).toBeVisible();
      // The flat panel: ranges and chips live directly in the form now, there
      // is no advanced button to click.
      await expect(page.locator('[name="valueMin"]')).toBeAttached();
      await expect(page.locator('.adv-chip').first()).toBeVisible();
      await expect(page.locator('#filters-search')).toBeVisible();

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
      // Scoped to the results: the flat filter panel now holds a city chip in
      // the DOM ahead of the list, and on mobile that chip is hidden inside
      // the closed drawer, so an unscoped first() landed on it.
      await expect(page.locator('#car-list .car-card, #car-list .empty-state').first()).toBeVisible();
      if (await page.locator('#car-list .car-card').count()) {
        await expect(page.locator('.results').getByText(/თბილისი/i).first()).toBeVisible();
      }
      await expect(page.locator('body')).not.toContainText(/404|Not Found|Something went wrong/i);

      await assertNoConsoleErrors(page, consoleErrors);
      await assertNoPageErrors(page, pageErrors);
    });

    test('regression: save CTAs render on cards', async ({ page }) => {
      await gotoAndWait(page, ROUTES.carsTbilisi);
      const saveButtons = page.getByRole('button', { name: /შენახვა/i });
      await expect(saveButtons.first()).toBeVisible();
      // One save button per card, however many cards there are. The old
      // hardcoded 12 was the page size of a catalog that no longer exists.
      const cardCount = await page.locator('.car-card').count();
      expect(cardCount).toBeGreaterThan(0);
      await expect(saveButtons).toHaveCount(cardCount);

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
