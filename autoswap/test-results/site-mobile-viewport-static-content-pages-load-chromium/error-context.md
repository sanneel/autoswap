# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> mobile viewport >> static content pages load
- Location: e2e\site.spec.ts:153:5

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main, body')
Expected pattern: /AutoSwap|ავტო|გაცვლ/i
Error: strict mode violation: locator('main, body') resolved to 2 elements:
    1) <body>…</body> aka locator('body')
    2) <main class="about-main">…</main> aka getByRole('main')

Call log:
  - Expect "toContainText" with timeout 10000ms
  - waiting for locator('main, body')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "AutoSwap მთავარი გვერდი" [ref=e5] [cursor=pointer]:
        - /url: /#home
      - generic [ref=e12]:
        - group "ფასების ვალუტა" [ref=e13]:
          - button "₾" [pressed] [ref=e14] [cursor=pointer]
          - button "$" [ref=e15] [cursor=pointer]
        - button "შესვლა" [ref=e17] [cursor=pointer]
  - main [ref=e18]:
    - region [ref=e19]:
      - generic [ref=e20]:
        - heading "გაცვალე მანქანა გაყიდვის გარეშე" [level=1] [ref=e21]
        - paragraph [ref=e22]: AutoSwap აკავშირებს მფლობელებს, რომლებსაც ერთმანეთის მანქანები უნდათ, გაყიდვის ლოდინის, შემთხვევითი ზარებისა და ორმაგი ვაჭრობის გარეშე.
    - generic [ref=e23]:
      - generic [ref=e24]:
        - heading "რატომ გაცვლა?" [level=2] [ref=e25]
        - paragraph [ref=e26]: "გაყიდვა და ყიდვა ორი ცალკე პროცესია, ორი ვაჭრობა, ორი რისკი და შუაში მანქანის გარეშე დარჩენილი კვირები. გაცვლა ამ ორ ნაბიჯს ერთში აერთიანებს: თავიდანვე ხედავ, ვის უნდა შენი მანქანა, რას გთავაზობს სანაცვლოდ და რა თანხის სხვაობაზეა საუბარი."
      - generic [ref=e27]:
        - heading "როგორ მუშაობს" [level=2] [ref=e28]
        - paragraph [ref=e29]: დაამატებ მანქანას, მიუთითებ რა გინდა სანაცვლოდ და რა სხვაობას ელოდები. მატჩი გაჩვენებს მფლობელებს, რომლებიც სწორედ შენს მანქანას ეძებენ, პირობები ბარათზევე ჩანს, ამიტომ ზარი მხოლოდ საქმეზეა.
      - generic [ref=e30]:
        - heading "ნდობა" [level=2] [ref=e31]
        - paragraph [ref=e32]: "მფლობელები ნომრით დასტურდებიან, პირობები კი გამჭვირვალეა: რას ეძებს მეორე მხარე და რა სხვაობას ითხოვს ან გთავაზობს, წინასწარ იცი. შეთავაზება სტრუქტურირებულია და არა შემთხვევითი მიმოწერა."
      - generic [ref=e33]:
        - heading "კონტაქტი" [level=2] [ref=e34]
        - paragraph [ref=e35]:
          - text: "კითხვა ან უკუკავშირი გაქვს? მოგვწერე:"
          - link "hello@autoswap.ge" [ref=e36] [cursor=pointer]:
            - /url: mailto:hello@autoswap.ge
    - generic [ref=e38]:
      - paragraph [ref=e39]: შენი მანქანა შეიძლება უკვე ვიღაცას უნდა, განცხადება ორ წუთში ემატება.
      - link "დაამატე მანქანა" [ref=e40] [cursor=pointer]:
        - /url: /sell
  - navigation "მთავარი ნავიგაცია" [ref=e43]:
    - link "მთავარი" [ref=e44] [cursor=pointer]:
      - /url: /
    - link "გაცვლები" [ref=e50] [cursor=pointer]:
      - /url: /cars
    - link "დამატება" [ref=e56] [cursor=pointer]:
      - /url: /sell
    - link "შეთავაზებები" [ref=e60] [cursor=pointer]:
      - /url: /account?tab=offers
    - link "პროფილი" [ref=e68] [cursor=pointer]:
      - /url: /account
  - contentinfo [ref=e74]:
    - generic [ref=e75]:
      - generic [ref=e76]:
        - generic [ref=e77]: autoswap
        - paragraph [ref=e85]: რეალური გაცვლები რეალურ მფლობელებს შორის.
      - navigation "ფუტერის ნავიგაცია" [ref=e86]:
        - link "გაცვლები" [ref=e87] [cursor=pointer]:
          - /url: /cars
        - link "განცხადების დამატება" [ref=e88] [cursor=pointer]:
          - /url: /sell
        - link "ჩვენ შესახებ" [ref=e89] [cursor=pointer]:
          - /url: /about
        - link "წესები" [ref=e90] [cursor=pointer]:
          - /url: /terms
        - link "კონფიდენციალურობა" [ref=e91] [cursor=pointer]:
          - /url: /privacy
        - link "კონტაქტი" [ref=e92] [cursor=pointer]:
          - /url: /about#contact
    - generic [ref=e93]: © 2026 AutoSwap · ყველა უფლება დაცულია
```

# Test source

```ts
  56  |     });
  57  | 
  58  |     test('global navigation and footer links resolve', async ({ page }) => {
  59  |       await gotoAndWait(page, ROUTES.carsTbilisi);
  60  | 
  61  |       await expect(page.getByRole('link', { name: /მთავარი/i })).toBeVisible();
  62  |       await expect(page.getByRole('link', { name: /გაცვლები/i }).first()).toBeVisible();
  63  |       await expect(page.getByRole('link', { name: /დამატება|განცხადების დამატება/i }).first()).toBeVisible();
  64  |       await expect(page.getByRole('link', { name: /პროფილი/i })).toBeVisible();
  65  |       await expect(page.getByRole('link', { name: /ჩვენ შესახებ/i })).toBeVisible();
  66  |       await expect(page.getByRole('link', { name: /წესები/i })).toBeVisible();
  67  |       await expect(page.getByRole('link', { name: /კონფიდენციალურობა/i })).toBeVisible();
  68  |       await expect(page.getByRole('link', { name: /კონტაქტი/i })).toBeVisible();
  69  | 
  70  |       await assertNoConsoleErrors(page, consoleErrors);
  71  |       await assertNoPageErrors(page, pageErrors);
  72  |     });
  73  | 
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
> 156 |         await expect(page.locator('main, body')).toContainText(/AutoSwap|ავტო|გაცვლ/i);
      |                                                  ^ Error: expect(locator).toContainText(expected) failed
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
  174 |       await expect(page).toHaveURL(/\/account/);
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