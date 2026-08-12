# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> tablet viewport >> listing filters by category and cash chips
- Location: e2e\site.spec.ts:106:5

# Error details

```
Error: Console errors detected

expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 4

- Array []
+ Array [
+   "Failed to load resource: the server responded with a status of 404 ()",
+   "Failed to load resource: the server responded with a status of 404 ()",
+ ]
```

# Page snapshot

```yaml
- generic [ref=f3e2]:
  - banner [ref=f3e3]:
    - generic [ref=f3e4]:
      - link "AutoSwap მთავარი გვერდი" [ref=f3e5] [cursor=pointer]:
        - /url: /#home
        - generic [ref=f3e12]: autoswap
      - generic [ref=f3e13]:
        - text: დამატება
        - group "ფასების ვალუტა" [ref=f3e14]:
          - button "₾" [pressed] [ref=f3e15] [cursor=pointer]
          - button "$" [ref=f3e16] [cursor=pointer]
        - button "შესვლა" [ref=f3e18] [cursor=pointer]
  - main [ref=f3e19]:
    - generic [ref=f3e21]:
      - generic [ref=f3e22]:
        - heading "ავტომობილები გაცვლისთვის" [level=1] [ref=f3e23]
        - paragraph [ref=f3e24]:
          - strong [ref=f3e25]: "3"
          - text: აქტიური განცხადება · მოძებნე მარკით, ქალაქით და თანხის სხვაობით
      - link "დაამატე მანქანა" [ref=f3e26] [cursor=pointer]:
        - /url: /sell
    - generic "სწრაფი ფილტრები" [ref=f3e28]:
      - navigation [ref=f3e29]:
        - link "ყველა 18" [ref=f3e30] [cursor=pointer]:
          - /url: /cars
          - generic [ref=f3e31]: ყველა
          - generic [ref=f3e32]: "18"
        - link "Toyota Toyota 5" [ref=f3e33] [cursor=pointer]:
          - /url: /cars?make=Toyota
          - img "Toyota" [ref=f3e34]
          - generic [ref=f3e35]: Toyota
          - generic [ref=f3e36]: "5"
        - link "BMW BMW 2" [ref=f3e37] [cursor=pointer]:
          - /url: /cars?make=BMW
          - img "BMW" [ref=f3e38]
          - generic [ref=f3e39]: BMW
          - generic [ref=f3e40]: "2"
        - link "Hyundai Hyundai 2" [ref=f3e41] [cursor=pointer]:
          - /url: /cars?make=Hyundai
          - img "Hyundai" [ref=f3e42]
          - generic [ref=f3e43]: Hyundai
          - generic [ref=f3e44]: "2"
        - link "Alfa Romeo 1" [ref=f3e45] [cursor=pointer]:
          - /url: /cars?make=Alfa%20Romeo
          - generic [ref=f3e46]: Alfa Romeo
          - generic [ref=f3e47]: "1"
        - link "Bentley 1" [ref=f3e48] [cursor=pointer]:
          - /url: /cars?make=BENTLEY
          - generic [ref=f3e49]: Bentley
          - generic [ref=f3e50]: "1"
        - link "Chevrolet Chevrolet 1" [ref=f3e51] [cursor=pointer]:
          - /url: /cars?make=Chevrolet
          - img "Chevrolet" [ref=f3e52]
          - generic [ref=f3e53]: Chevrolet
          - generic [ref=f3e54]: "1"
        - link "Ford Ford 1" [ref=f3e55] [cursor=pointer]:
          - /url: /cars?make=Ford
          - img "Ford" [ref=f3e56]
          - generic [ref=f3e57]: Ford
          - generic [ref=f3e58]: "1"
        - link "Jeep Jeep 1" [ref=f3e59] [cursor=pointer]:
          - /url: /cars?make=Jeep
          - img "Jeep" [ref=f3e60]
          - generic [ref=f3e61]: Jeep
          - generic [ref=f3e62]: "1"
        - link "სედანი 11" [ref=f3e63] [cursor=pointer]:
          - /url: /cars?category=sedan
          - generic [ref=f3e64]: სედანი
          - generic [ref=f3e65]: "11"
        - link "₾ გარეშე 3" [ref=f3e66] [cursor=pointer]:
          - /url: /cars?cash=none
          - generic [ref=f3e67]: ₾
          - generic [ref=f3e68]: გარეშე
          - generic [ref=f3e69]: "3"
      - button "შემდეგი" [ref=f3e70] [cursor=pointer]
    - generic [ref=f3e74]:
      - generic [ref=f3e75]:
        - paragraph [ref=f3e76]:
          - strong [ref=f3e77]: "3"
          - text: აქტიური გაცვლა
        - generic [ref=f3e78]:
          - button "ფილტრები" [ref=f3e79] [cursor=pointer]
          - generic [ref=f3e81]:
            - generic [ref=f3e82]: დალაგება
            - combobox "დალაგება" [ref=f3e83] [cursor=pointer]:
              - option "ახალი პირველი" [selected]
              - option "წელი კლებადობით"
              - option "წელი ზრდადობით"
              - option "გარბენი ზრდადობით"
              - option "ღირებულება ზრდადობით"
              - option "ღირებულება კლებადობით"
          - group "ხედი" [ref=f3e84]:
            - button "სია" [pressed] [ref=f3e85] [cursor=pointer]
            - button "ბადე" [ref=f3e89] [cursor=pointer]
      - generic [ref=f3e95]:
        - article [ref=f3e96]:
          - generic [ref=f3e97]:
            - link "BENTLEY ARMOURED ARNAGE დეტალურად" [ref=f3e98] [cursor=pointer]:
              - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
              - img "BENTLEY ARMOURED ARNAGE" [ref=f3e99]
            - button "BENTLEY ARMOURED ARNAGE შენახვა" [ref=f3e100] [cursor=pointer]
          - generic [ref=f3e104]:
            - heading "BENTLEY ARMOURED ARNAGE 2020" [level=3] [ref=f3e105]:
              - link "BENTLEY ARMOURED ARNAGE" [ref=f3e106] [cursor=pointer]:
                - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
              - generic [ref=f3e107]: "2020"
            - generic [ref=f3e108]: თბილისი
          - generic [ref=f3e112]:
            - generic [ref=f3e113]:
              - generic [ref=f3e114]: ეძებს
              - paragraph [ref=f3e119]: audi a6
            - paragraph [ref=f3e120]:
              - generic [ref=f3e122]: თანაბარი გაცვლა
        - article [ref=f3e123]:
          - generic [ref=f3e124]:
            - link "MERCEDES-BENZ 190 დეტალურად" [ref=f3e125] [cursor=pointer]:
              - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
              - img "MERCEDES-BENZ 190" [ref=f3e126]
            - button "MERCEDES-BENZ 190 შენახვა" [ref=f3e127] [cursor=pointer]
          - generic [ref=f3e131]:
            - heading "MERCEDES-BENZ 190 1999" [level=3] [ref=f3e132]:
              - link "MERCEDES-BENZ 190" [ref=f3e133] [cursor=pointer]:
                - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
              - generic [ref=f3e134]: "1999"
            - generic [ref=f3e135]: თბილისი
          - generic [ref=f3e139]:
            - generic [ref=f3e140]:
              - generic [ref=f3e141]: ეძებს
              - paragraph [ref=f3e146]: Audi a6
            - paragraph [ref=f3e147]:
              - generic [ref=f3e149]: თანაბარი გაცვლა
        - article [ref=f3e150]:
          - generic [ref=f3e151]:
            - link "BMW 128i დეტალურად" [ref=f3e152] [cursor=pointer]:
              - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
              - img "BMW 128i" [ref=f3e153]
            - button "BMW 128i შენახვა" [ref=f3e154] [cursor=pointer]
          - generic [ref=f3e158]:
            - heading "BMW 128i 2016" [level=3] [ref=f3e159]:
              - link "BMW 128i" [ref=f3e160] [cursor=pointer]:
                - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
              - generic [ref=f3e161]: "2016"
            - generic [ref=f3e162]: თბილისი
          - generic [ref=f3e166]:
            - generic [ref=f3e167]:
              - generic [ref=f3e168]: ეძებს
              - paragraph [ref=f3e173]: ტყე
            - paragraph [ref=f3e174]:
              - generic [ref=f3e176]: თანაბარი გაცვლა
    - generic [ref=f3e177]:
      - button "დაამატე მანქანა და ნახე ვინ ეძებს მას" [ref=f3e178] [cursor=pointer]
      - button "დახურვა" [ref=f3e180] [cursor=pointer]: ×
  - navigation "მთავარი ნავიგაცია" [ref=f3e181]:
    - link "მთავარი" [ref=f3e182] [cursor=pointer]:
      - /url: /
    - link "გაცვლები" [ref=f3e188] [cursor=pointer]:
      - /url: /cars
    - link "დამატება" [ref=f3e194] [cursor=pointer]:
      - /url: /sell
    - link "შეთავაზებები" [ref=f3e198] [cursor=pointer]:
      - /url: /account?tab=offers
    - link "პროფილი" [ref=f3e206] [cursor=pointer]:
      - /url: /account
  - contentinfo [ref=f3e212]:
    - generic [ref=f3e213]:
      - generic [ref=f3e214]:
        - generic [ref=f3e215]: autoswap
        - paragraph [ref=f3e223]: რეალური გაცვლები რეალურ მფლობელებს შორის.
      - navigation "ფუტერის ნავიგაცია" [ref=f3e224]:
        - link "გაცვლები" [ref=f3e225] [cursor=pointer]:
          - /url: /cars
        - link "განცხადების დამატება" [ref=f3e226] [cursor=pointer]:
          - /url: /sell
        - link "ჩვენ შესახებ" [ref=f3e227] [cursor=pointer]:
          - /url: /about
        - link "წესები" [ref=f3e228] [cursor=pointer]:
          - /url: /terms
        - link "კონფიდენციალურობა" [ref=f3e229] [cursor=pointer]:
          - /url: /privacy
        - link "კონტაქტი" [ref=f3e230] [cursor=pointer]:
          - /url: /about#contact
    - generic [ref=f3e231]: © 2026 AutoSwap · ყველა უფლება დაცულია
```

# Test source

```ts
  1   | import { test, expect, Page } from '@playwright/test';
  2   | 
  3   | const BASE_URL = process.env.BASE_URL || 'https://autoswap-6gx.pages.dev';
  4   | const BREAKPOINTS = [
  5   |   { name: 'mobile', width: 375, height: 812 },
  6   |   { name: 'tablet', width: 768, height: 1024 },
  7   |   { name: 'desktop', width: 1440, height: 900 },
  8   | ] as const;
  9   | 
  10  | const ROUTES = {
  11  |   home: '/',
  12  |   cars: '/cars',
  13  |   carsTbilisi: '/cars?city=%E1%83%97%E1%83%91%E1%83%98%E1%83%9A%E1%83%98%E1%83%A1%E1%83%98',
  14  |   sell: '/sell',
  15  |   account: '/account',
  16  |   offers: '/account?tab=offers',
  17  |   about: '/about',
  18  |   terms: '/terms',
  19  |   privacy: '/privacy',
  20  |   contact: '/about#contact',
  21  |   vehicleBentley: '/vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b',
  22  |   vehicleMercedes: '/vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec',
  23  | };
  24  | 
  25  | async function gotoAndWait(page: Page, path: string) {
  26  |   await page.goto(`${BASE_URL}${path}`, { waitUntil: 'domcontentloaded' });
  27  |   await page.waitForLoadState('networkidle').catch(() => {});
  28  | }
  29  | 
  30  | async function assertNoConsoleErrors(page: Page, errors: string[]) {
> 31  |   expect.soft(errors, 'Console errors detected').toEqual([]);
      |                                                  ^ Error: Console errors detected
  32  | }
  33  | 
  34  | async function assertNoPageErrors(page: Page, pageErrors: string[]) {
  35  |   expect.soft(pageErrors, 'Uncaught page errors detected').toEqual([]);
  36  | }
  37  | 
  38  | for (const bp of BREAKPOINTS) {
  39  |   test.describe(`${bp.name} viewport`, () => {
  40  |     test.use({ viewport: { width: bp.width, height: bp.height } });
  41  | 
  42  |     let consoleErrors: string[];
  43  |     let pageErrors: string[];
  44  | 
  45  |     test.beforeEach(async ({ page }) => {
  46  |       consoleErrors = [];
  47  |       pageErrors = [];
  48  | 
  49  |       page.on('console', msg => {
  50  |         if (msg.type() === 'error') consoleErrors.push(msg.text());
  51  |       });
  52  | 
  53  |       page.on('pageerror', err => {
  54  |         pageErrors.push(String(err));
  55  |       });
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
```