# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> tablet viewport >> account and offers pages are reachable
- Location: e2e\site.spec.ts:172:5

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/account/
Received string:  "https://autoswap-6gx.pages.dev/login?next=%2Faccount"
Timeout: 10000ms

Call log:
  - Expect "toHaveURL" with timeout 10000ms
    23 × locator resolved to <html lang="ka">…</html>
       - unexpected value "https://autoswap-6gx.pages.dev/login?next=%2Faccount"

```

```yaml
- banner:
  - link "AutoSwap მთავარი გვერდი":
    - /url: /#home
    - text: autoswap
  - group "ფასების ვალუტა":
    - button "₾" [pressed]
    - button "$"
  - button "შესვლა"
- main:
  - heading "შესვლა ან რეგისტრაცია" [level=1]
  - paragraph: გააგრძელე Google-ით, ან შეიყვანე ნომერი, გამოგიგზავნით ერთჯერად კოდს SMS-ით ან WhatsApp-ით.
  - button "Google-ით გაგრძელება"
  - text: ან ნომრით ტელეფონის ნომერი (+995)
  - textbox "ტელეფონის ნომერი (+995)":
    - /placeholder: 5XX XX XX XX
  - text: კოდი მივიღო
  - radiogroup "კოდის მიღების არხი":
    - radio "SMS" [checked]
    - radio "WhatsApp"
  - button "გამომიგზავნე კოდი"
  - paragraph: პირველი შესვლისას ანგარიში ავტომატურად შეიქმნება.
  - button "სცადე დემო ანგარიშით, SMS-ის გარეშე"
- navigation "მთავარი ნავიგაცია":
  - link "მთავარი":
    - /url: /
  - link "გაცვლები":
    - /url: /cars
  - link "დამატება":
    - /url: /sell
  - link "შეთავაზებები":
    - /url: /account?tab=offers
  - link "პროფილი":
    - /url: /account
- contentinfo:
  - paragraph: რეალური გაცვლები რეალურ მფლობელებს შორის.
  - navigation "ფუტერის ნავიგაცია":
    - link "გაცვლები":
      - /url: /cars
    - link "განცხადების დამატება":
      - /url: /sell
    - link "ჩვენ შესახებ":
      - /url: /about
    - link "წესები":
      - /url: /terms
    - link "კონფიდენციალურობა":
      - /url: /privacy
    - link "კონტაქტი":
      - /url: /about#contact
  - text: © 2026 AutoSwap · ყველა უფლება დაცულია
```

# Test source

```ts
  74  |     test('cars listing page renders summary, chips, sort and cards', async ({ page }) => {
  75  |       await gotoAndWait(page, ROUTES.carsTbilisi);
  76  | 
  77  |       await expect(page.getByRole('heading', { name: /ავტომობილები გაცვლისთვის/i })).toBeVisible();
  78  |       await expect(page.getByText(/აქტიური განცხადება/i).first()).toBeVisible();
  79  |       await expect(page.getByRole('link', { name: /დაამატე მანქანა/i })).toBeVisible();
  80  |       await expect(page.getByRole('combobox', { name: /დალაგება/i })).toBeVisible();
  81  |       await expect(page.getByRole('link', { name: /Toyota/i }).first()).toBeVisible();
  82  |       await expect(page.getByRole('link', { name: /BMW/i }).first()).toBeVisible();
  83  |       await expect(page.getByRole('link', { name: /Bentley/i }).first()).toBeVisible();
  84  |       await expect(page.getByRole('link', { name: /BENTLEY ARMOURED ARNAGE/i }).first()).toBeVisible();
  85  |       await expect(page.getByRole('link', { name: /MERCEDES-BENZ 190/i }).first()).toBeVisible();
  86  |       await expect(page.getByText(/თანაბარი გაცვლა|სხვაობა შეთანხმებით/i).first()).toBeVisible();
  87  | 
  88  |       await assertNoConsoleErrors(page, consoleErrors);
  89  |       await assertNoPageErrors(page, pageErrors);
  90  |     });
  91  | 
  92  |     test('listing filters by make via chip links', async ({ page }) => {
  93  |       await gotoAndWait(page, ROUTES.cars);
  94  |       await page.getByRole('link', { name: /Toyota/i }).first().click();
  95  |       await expect(page).toHaveURL(/make=Toyota/);
  96  |       await expect(page.getByRole('heading', { name: /ავტომობილები გაცვლისთვის/i })).toBeVisible();
  97  |       await expect(page.getByText(/აქტიური გაცვლა/i)).toBeVisible();
  98  | 
  99  |       await page.getByRole('link', { name: /BMW/i }).first().click();
  100 |       await expect(page).toHaveURL(/make=BMW/);
  101 | 
  102 |       await assertNoConsoleErrors(page, consoleErrors);
  103 |       await assertNoPageErrors(page, pageErrors);
  104 |     });
  105 | 
  106 |     test('listing filters by category and cash chips', async ({ page }) => {
  107 |       await gotoAndWait(page, ROUTES.cars);
  108 | 
  109 |       await page.getByRole('link', { name: /სედანი/i }).first().click();
  110 |       await expect(page).toHaveURL(/category=sedan/);
  111 | 
  112 |       await gotoAndWait(page, ROUTES.cars);
  113 |       await page.getByRole('link', { name: /გარეშე/i }).first().click();
  114 |       await expect(page).toHaveURL(/cash=none/);
  115 | 
  116 |       await assertNoConsoleErrors(page, consoleErrors);
  117 |       await assertNoPageErrors(page, pageErrors);
  118 |     });
  119 | 
  120 |     test('sort select changes without breaking cards', async ({ page }) => {
  121 |       await gotoAndWait(page, ROUTES.carsTbilisi);
  122 | 
  123 |       const sort = page.getByRole('combobox', { name: /დალაგება/i });
  124 |       await sort.selectOption({ label: 'ახალი პირველი' });
  125 |       await expect(sort).toHaveValue(/ახალი პირველი|new|latest/i);
  126 | 
  127 |       await sort.selectOption({ label: 'წელი კლებადობით' });
  128 |       await expect(page.getByRole('link', { name: /BENTLEY ARMOURED ARNAGE|MERCEDES-BENZ 190|BMW 128i/i }).first()).toBeVisible();
  129 | 
  130 |       await sort.selectOption({ label: 'ღირებულება კლებადობით' });
  131 |       await expect(page.locator('body')).toContainText(/აქტიური გაცვლა/i);
  132 | 
  133 |       await assertNoConsoleErrors(page, consoleErrors);
  134 |       await assertNoPageErrors(page, pageErrors);
  135 |     });
  136 | 
  137 |     test('vehicle detail pages open from cards', async ({ page }) => {
  138 |       await gotoAndWait(page, ROUTES.carsTbilisi);
  139 | 
  140 |       await page.getByRole('link', { name: /BENTLEY ARMOURED ARNAGE/i }).first().click();
  141 |       await expect(page).toHaveURL(/\/vehicle\?id=/);
  142 |       await expect(page.locator('body')).toContainText(/BENTLEY ARMOURED ARNAGE/i);
  143 | 
  144 |       await gotoAndWait(page, ROUTES.carsTbilisi);
  145 |       await page.getByRole('link', { name: /MERCEDES-BENZ 190/i }).first().click();
  146 |       await expect(page).toHaveURL(/da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec/);
  147 |       await expect(page.locator('body')).toContainText(/MERCEDES-BENZ 190/i);
  148 | 
  149 |       await assertNoConsoleErrors(page, consoleErrors);
  150 |       await assertNoPageErrors(page, pageErrors);
  151 |     });
  152 | 
  153 |     test('static content pages load', async ({ page }) => {
  154 |       for (const path of [ROUTES.about, ROUTES.terms, ROUTES.privacy]) {
  155 |         await gotoAndWait(page, path);
  156 |         await expect(page.locator('main, body')).toContainText(/AutoSwap|ავტო|გაცვლ/i);
  157 |       }
  158 | 
  159 |       await assertNoConsoleErrors(page, consoleErrors);
  160 |       await assertNoPageErrors(page, pageErrors);
  161 |     });
  162 | 
  163 |     test('sell page loads and exposes form entry point', async ({ page }) => {
  164 |       await gotoAndWait(page, ROUTES.sell);
  165 |       await expect(page.locator('body')).toContainText(/დაამატე|განცხადება|მანქანა/i);
  166 |       await expect(page.getByRole('button').or(page.getByRole('link')).first()).toBeVisible();
  167 | 
  168 |       await assertNoConsoleErrors(page, consoleErrors);
  169 |       await assertNoPageErrors(page, pageErrors);
  170 |     });
  171 | 
  172 |     test('account and offers pages are reachable', async ({ page }) => {
  173 |       await gotoAndWait(page, ROUTES.account);
> 174 |       await expect(page).toHaveURL(/\/account/);
      |                          ^ Error: expect(page).toHaveURL(expected) failed
  175 |       await expect(page.locator('body')).toContainText(/პროფილი|account|შეთავაზებ/i);
  176 | 
  177 |       await gotoAndWait(page, ROUTES.offers);
  178 |       await expect(page).toHaveURL(/tab=offers/);
  179 |       await expect(page.locator('body')).toContainText(/შეთავაზებ|offers/i);
  180 | 
  181 |       await assertNoConsoleErrors(page, consoleErrors);
  182 |       await assertNoPageErrors(page, pageErrors);
  183 |     });
  184 | 
  185 |     test('mobile navigation remains usable on small screens', async ({ page }) => {
  186 |       test.skip(bp.name !== 'mobile', 'Mobile-only assertions');
  187 |       await gotoAndWait(page, ROUTES.carsTbilisi);
  188 | 
  189 |       const navLinks = [
  190 |         page.getByRole('link', { name: /მთავარი/i }),
  191 |         page.getByRole('link', { name: /^გაცვლები$/i }).last(),
  192 |         page.getByRole('link', { name: /დამატება/i }),
  193 |         page.getByRole('link', { name: /შეთავაზებები/i }),
  194 |         page.getByRole('link', { name: /პროფილი/i }),
  195 |       ];
  196 | 
  197 |       for (const link of navLinks) {
  198 |         await expect(link).toBeVisible();
  199 |       }
  200 | 
  201 |       await assertNoConsoleErrors(page, consoleErrors);
  202 |       await assertNoPageErrors(page, pageErrors);
  203 |     });
  204 | 
  205 |     test('regression: city query param page stays stable', async ({ page }) => {
  206 |       await gotoAndWait(page, ROUTES.carsTbilisi);
  207 |       await expect(page).toHaveURL(/city=/);
  208 |       await expect(page.getByText(/თბილისი/i).first()).toBeVisible();
  209 |       await expect(page.locator('body')).not.toContainText(/404|Not Found|Something went wrong/i);
  210 | 
  211 |       await assertNoConsoleErrors(page, consoleErrors);
  212 |       await assertNoPageErrors(page, pageErrors);
  213 |     });
  214 | 
  215 |     test('regression: save CTAs render on cards', async ({ page }) => {
  216 |       await gotoAndWait(page, ROUTES.carsTbilisi);
  217 |       const saveTexts = page.getByText(/შენახვა/i);
  218 |       await expect(saveTexts.first()).toBeVisible();
  219 |       await expect(saveTexts).toHaveCount(12);
  220 | 
  221 |       await assertNoConsoleErrors(page, consoleErrors);
  222 |       await assertNoPageErrors(page, pageErrors);
  223 |     });
  224 | 
  225 |     test('regression: no broken primary routes', async ({ page }) => {
  226 |       const candidates = [
  227 |         ROUTES.home,
  228 |         ROUTES.cars,
  229 |         ROUTES.sell,
  230 |         ROUTES.about,
  231 |         ROUTES.terms,
  232 |         ROUTES.privacy,
  233 |         ROUTES.vehicleBentley,
  234 |         ROUTES.vehicleMercedes,
  235 |       ];
  236 | 
  237 |       for (const path of candidates) {
  238 |         const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  239 |         expect.soft(response?.status(), `${path} should not 404`).toBeLessThan(400);
  240 |       }
  241 | 
  242 |       await assertNoConsoleErrors(page, consoleErrors);
  243 |       await assertNoPageErrors(page, pageErrors);
  244 |     });
  245 |   });
  246 | }
  247 | 
```