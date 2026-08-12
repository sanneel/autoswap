# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> tablet viewport >> global navigation and footer links resolve
- Location: e2e\site.spec.ts:58:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /მთავარი/i })
Expected: visible
Error: strict mode violation: getByRole('link', { name: /მთავარი/i }) resolved to 2 elements:
    1) <a class="brand" href="/#home" aria-label="AutoSwap მთავარი გვერდი">…</a> aka getByRole('link', { name: 'AutoSwap მთავარი გვერდი' })
    2) <a href="/" class="tabbar-item">…</a> aka getByRole('link', { name: 'მთავარი', exact: true })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('link', { name: /მთავარი/i })

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "AutoSwap მთავარი გვერდი" [ref=e5] [cursor=pointer]:
        - /url: /#home
        - generic [ref=e12]: autoswap
      - generic [ref=e13]:
        - text: დამატება
        - group "ფასების ვალუტა" [ref=e14]:
          - button "₾" [pressed] [ref=e15] [cursor=pointer]
          - button "$" [ref=e16] [cursor=pointer]
        - button "შესვლა" [ref=e18] [cursor=pointer]
  - main [ref=e19]:
    - generic [ref=e21]:
      - generic [ref=e22]:
        - heading "ავტომობილები გაცვლისთვის" [level=1] [ref=e23]
        - paragraph [ref=e24]:
          - strong [ref=e25]: "12"
          - text: აქტიური განცხადება · მოძებნე მარკით, ქალაქით და თანხის სხვაობით
      - link "დაამატე მანქანა" [ref=e26] [cursor=pointer]:
        - /url: /sell
    - generic "სწრაფი ფილტრები" [ref=e28]:
      - navigation [ref=e29]:
        - link "ყველა 18" [ref=e30] [cursor=pointer]:
          - /url: /cars
          - generic [ref=e31]: ყველა
          - generic [ref=e32]: "18"
        - link "Toyota Toyota 5" [ref=e33] [cursor=pointer]:
          - /url: /cars?make=Toyota
          - img "Toyota" [ref=e34]
          - generic [ref=e35]: Toyota
          - generic [ref=e36]: "5"
        - link "BMW BMW 2" [ref=e37] [cursor=pointer]:
          - /url: /cars?make=BMW
          - img "BMW" [ref=e38]
          - generic [ref=e39]: BMW
          - generic [ref=e40]: "2"
        - link "Hyundai Hyundai 2" [ref=e41] [cursor=pointer]:
          - /url: /cars?make=Hyundai
          - img "Hyundai" [ref=e42]
          - generic [ref=e43]: Hyundai
          - generic [ref=e44]: "2"
        - link "Alfa Romeo 1" [ref=e45] [cursor=pointer]:
          - /url: /cars?make=Alfa%20Romeo
          - generic [ref=e46]: Alfa Romeo
          - generic [ref=e47]: "1"
        - link "Bentley 1" [ref=e48] [cursor=pointer]:
          - /url: /cars?make=BENTLEY
          - generic [ref=e49]: Bentley
          - generic [ref=e50]: "1"
        - link "Chevrolet Chevrolet 1" [ref=e51] [cursor=pointer]:
          - /url: /cars?make=Chevrolet
          - img "Chevrolet" [ref=e52]
          - generic [ref=e53]: Chevrolet
          - generic [ref=e54]: "1"
        - link "Ford Ford 1" [ref=e55] [cursor=pointer]:
          - /url: /cars?make=Ford
          - img "Ford" [ref=e56]
          - generic [ref=e57]: Ford
          - generic [ref=e58]: "1"
        - link "Jeep Jeep 1" [ref=e59] [cursor=pointer]:
          - /url: /cars?make=Jeep
          - img "Jeep" [ref=e60]
          - generic [ref=e61]: Jeep
          - generic [ref=e62]: "1"
        - link "სედანი 11" [ref=e63] [cursor=pointer]:
          - /url: /cars?category=sedan
          - generic [ref=e64]: სედანი
          - generic [ref=e65]: "11"
        - link "₾ გარეშე 3" [ref=e66] [cursor=pointer]:
          - /url: /cars?cash=none
          - generic [ref=e67]: ₾
          - generic [ref=e68]: გარეშე
          - generic [ref=e69]: "3"
      - button "შემდეგი" [ref=e70] [cursor=pointer]
    - generic [ref=e74]:
      - generic [ref=e75]:
        - paragraph [ref=e76]:
          - strong [ref=e77]: "12"
          - text: აქტიური გაცვლა
        - generic [ref=e78]:
          - button "ფილტრები" [ref=e79] [cursor=pointer]
          - generic [ref=e81]:
            - generic [ref=e82]: დალაგება
            - combobox "დალაგება" [ref=e83] [cursor=pointer]:
              - option "ახალი პირველი" [selected]
              - option "წელი კლებადობით"
              - option "წელი ზრდადობით"
              - option "გარბენი ზრდადობით"
              - option "ღირებულება ზრდადობით"
              - option "ღირებულება კლებადობით"
          - group "ხედი" [ref=e84]:
            - button "სია" [pressed] [ref=e85] [cursor=pointer]
            - button "ბადე" [ref=e89] [cursor=pointer]
      - generic [ref=e95]:
        - article [ref=e96]:
          - generic [ref=e97]:
            - link "BENTLEY ARMOURED ARNAGE დეტალურად" [ref=e98] [cursor=pointer]:
              - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
              - img "BENTLEY ARMOURED ARNAGE" [ref=e99]
            - button "BENTLEY ARMOURED ARNAGE შენახვა" [ref=e100] [cursor=pointer]
          - generic [ref=e104]:
            - heading "BENTLEY ARMOURED ARNAGE 2020" [level=3] [ref=e105]:
              - link "BENTLEY ARMOURED ARNAGE" [ref=e106] [cursor=pointer]:
                - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
              - generic [ref=e107]: "2020"
            - generic [ref=e108]: თბილისი
          - generic [ref=e112]:
            - generic [ref=e113]:
              - generic [ref=e114]: ეძებს
              - paragraph [ref=e119]: audi a6
            - paragraph [ref=e120]:
              - generic [ref=e122]: თანაბარი გაცვლა
        - article [ref=e123]:
          - generic [ref=e124]:
            - link "MERCEDES-BENZ 190 დეტალურად" [ref=e125] [cursor=pointer]:
              - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
              - img "MERCEDES-BENZ 190" [ref=e126]
            - button "MERCEDES-BENZ 190 შენახვა" [ref=e127] [cursor=pointer]
          - generic [ref=e131]:
            - heading "MERCEDES-BENZ 190 1999" [level=3] [ref=e132]:
              - link "MERCEDES-BENZ 190" [ref=e133] [cursor=pointer]:
                - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
              - generic [ref=e134]: "1999"
            - generic [ref=e135]: თბილისი
          - generic [ref=e139]:
            - generic [ref=e140]:
              - generic [ref=e141]: ეძებს
              - paragraph [ref=e146]: Audi a6
            - paragraph [ref=e147]:
              - generic [ref=e149]: თანაბარი გაცვლა
        - article [ref=e150]:
          - generic [ref=e151]:
            - link "BMW 128i დეტალურად" [ref=e152] [cursor=pointer]:
              - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
              - img "BMW 128i" [ref=e153]
            - button "BMW 128i შენახვა" [ref=e154] [cursor=pointer]
          - generic [ref=e158]:
            - heading "BMW 128i 2016" [level=3] [ref=e159]:
              - link "BMW 128i" [ref=e160] [cursor=pointer]:
                - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
              - generic [ref=e161]: "2016"
            - generic [ref=e162]: თბილისი
          - generic [ref=e166]:
            - generic [ref=e167]:
              - generic [ref=e168]: ეძებს
              - paragraph [ref=e173]: ტყე
            - paragraph [ref=e174]:
              - generic [ref=e176]: თანაბარი გაცვლა
        - article [ref=e177]:
          - generic [ref=e178]:
            - link "Jeep Compass დეტალურად" [ref=e179] [cursor=pointer]:
              - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
              - img "Jeep Compass" [ref=e180]
            - button "Jeep Compass შენახვა" [ref=e181] [cursor=pointer]
          - generic [ref=e185]:
            - heading "Jeep Compass 2016" [level=3] [ref=e186]:
              - link "Jeep Compass" [ref=e187] [cursor=pointer]:
                - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
              - generic [ref=e188]: "2016"
            - generic [ref=e189]: თბილისი
          - generic [ref=e193]:
            - generic [ref=e194]:
              - generic [ref=e195]: ეძებს
              - paragraph [ref=e200]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e201]:
              - generic [ref=e207]: სხვაობა შეთანხმებით
        - article [ref=e208]:
          - generic [ref=e209]:
            - link "Chevrolet Malibu დეტალურად" [ref=e210] [cursor=pointer]:
              - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
              - img "Chevrolet Malibu" [ref=e211]
            - button "Chevrolet Malibu შენახვა" [ref=e212] [cursor=pointer]
          - generic [ref=e216]:
            - heading "Chevrolet Malibu 2023" [level=3] [ref=e217]:
              - link "Chevrolet Malibu" [ref=e218] [cursor=pointer]:
                - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
              - generic [ref=e219]: "2023"
            - generic [ref=e220]: თბილისი
          - generic [ref=e224]:
            - generic [ref=e225]:
              - generic [ref=e226]: ეძებს
              - paragraph [ref=e231]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e232]:
              - generic [ref=e238]: სხვაობა შეთანხმებით
        - article [ref=e239]:
          - generic [ref=e240]:
            - link "Alfa Romeo Mito დეტალურად" [ref=e241] [cursor=pointer]:
              - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
              - img "Alfa Romeo Mito" [ref=e242]
            - button "Alfa Romeo Mito შენახვა" [ref=e243] [cursor=pointer]
          - generic [ref=e247]:
            - heading "Alfa Romeo Mito 2008" [level=3] [ref=e248]:
              - link "Alfa Romeo Mito" [ref=e249] [cursor=pointer]:
                - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
              - generic [ref=e250]: "2008"
            - generic [ref=e251]: თბილისი
          - generic [ref=e255]:
            - generic [ref=e256]:
              - generic [ref=e257]: ეძებს
              - paragraph [ref=e262]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e263]:
              - generic [ref=e269]: სხვაობა შეთანხმებით
        - article [ref=e270]:
          - generic [ref=e271]:
            - link "Hyundai Sonata დეტალურად" [ref=e272] [cursor=pointer]:
              - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
              - img "Hyundai Sonata" [ref=e273]
            - button "Hyundai Sonata შენახვა" [ref=e274] [cursor=pointer]
          - generic [ref=e278]:
            - heading "Hyundai Sonata 2015" [level=3] [ref=e279]:
              - link "Hyundai Sonata" [ref=e280] [cursor=pointer]:
                - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
              - generic [ref=e281]: "2015"
            - generic [ref=e282]: თბილისი
          - generic [ref=e286]:
            - generic [ref=e287]:
              - generic [ref=e288]: ეძებს
              - paragraph [ref=e293]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e294]:
              - generic [ref=e300]: სხვაობა შეთანხმებით
        - article [ref=e301]:
          - generic [ref=e302]:
            - link "Mitsubishi Outlander Sport SE დეტალურად" [ref=e303] [cursor=pointer]:
              - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
              - img "Mitsubishi Outlander Sport SE" [ref=e304]
            - button "Mitsubishi Outlander Sport SE შენახვა" [ref=e305] [cursor=pointer]
          - generic [ref=e309]:
            - heading "Mitsubishi Outlander Sport SE 2018" [level=3] [ref=e310]:
              - link "Mitsubishi Outlander Sport SE" [ref=e311] [cursor=pointer]:
                - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
              - generic [ref=e312]: "2018"
            - generic [ref=e313]: თბილისი
          - generic [ref=e317]:
            - generic [ref=e318]:
              - generic [ref=e319]: ეძებს
              - paragraph [ref=e324]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e325]:
              - generic [ref=e331]: სხვაობა შეთანხმებით
        - article [ref=e332]:
          - generic [ref=e333]:
            - link "Hyundai Sonata Limited 4dr Sedan Automatic დეტალურად" [ref=e334] [cursor=pointer]:
              - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
              - img "Hyundai Sonata Limited 4dr Sedan Automatic" [ref=e335]
            - button "Hyundai Sonata Limited 4dr Sedan Automatic შენახვა" [ref=e336] [cursor=pointer]
          - generic [ref=e340]:
            - heading "Hyundai Sonata Limited 4dr Sedan Automatic 2013" [level=3] [ref=e341]:
              - link "Hyundai Sonata Limited 4dr Sedan Automatic" [ref=e342] [cursor=pointer]:
                - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
              - generic [ref=e343]: "2013"
            - generic [ref=e344]: თბილისი
          - generic [ref=e348]:
            - generic [ref=e349]:
              - generic [ref=e350]: ეძებს
              - paragraph [ref=e355]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e356]:
              - generic [ref=e362]: სხვაობა შეთანხმებით
        - article [ref=e363]:
          - generic [ref=e364]:
            - link "BMW X3 xDrive28i 4dr All-wheel Drive დეტალურად" [ref=e365] [cursor=pointer]:
              - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
              - img "BMW X3 xDrive28i 4dr All-wheel Drive" [ref=e366]
            - button "BMW X3 xDrive28i 4dr All-wheel Drive შენახვა" [ref=e367] [cursor=pointer]
          - generic [ref=e371]:
            - heading "BMW X3 xDrive28i 4dr All-wheel Drive 2012" [level=3] [ref=e372]:
              - link "BMW X3 xDrive28i 4dr All-wheel Drive" [ref=e373] [cursor=pointer]:
                - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
              - generic [ref=e374]: "2012"
            - generic [ref=e375]: თბილისი
          - generic [ref=e379]:
            - generic [ref=e380]:
              - generic [ref=e381]: ეძებს
              - paragraph [ref=e386]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e387]:
              - generic [ref=e393]: სხვაობა შეთანხმებით
        - article [ref=e394]:
          - generic [ref=e395]:
            - link "Mercedes-Benz GLK 350 დეტალურად" [ref=e396] [cursor=pointer]:
              - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
              - img "Mercedes-Benz GLK 350" [ref=e397]
            - button "Mercedes-Benz GLK 350 შენახვა" [ref=e398] [cursor=pointer]
          - generic [ref=e402]:
            - heading "Mercedes-Benz GLK 350 2009" [level=3] [ref=e403]:
              - link "Mercedes-Benz GLK 350" [ref=e404] [cursor=pointer]:
                - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
              - generic [ref=e405]: "2009"
            - generic [ref=e406]: თბილისი
          - generic [ref=e410]:
            - generic [ref=e411]:
              - generic [ref=e412]: ეძებს
              - paragraph [ref=e417]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e418]:
              - generic [ref=e424]: სხვაობა შეთანხმებით
        - article [ref=e425]:
          - generic [ref=e426]:
            - link "Toyota Camry SE 4dr Sedan Automatic დეტალურად" [ref=e427] [cursor=pointer]:
              - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
              - img "Toyota Camry SE 4dr Sedan Automatic" [ref=e428]
            - button "Toyota Camry SE 4dr Sedan Automatic შენახვა" [ref=e429] [cursor=pointer]
          - generic [ref=e433]:
            - heading "Toyota Camry SE 4dr Sedan Automatic 2018" [level=3] [ref=e434]:
              - link "Toyota Camry SE 4dr Sedan Automatic" [ref=e435] [cursor=pointer]:
                - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
              - generic [ref=e436]: "2018"
            - generic [ref=e437]: თბილისი
          - generic [ref=e441]:
            - generic [ref=e442]:
              - generic [ref=e443]: ეძებს
              - paragraph [ref=e448]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e449]:
              - generic [ref=e455]: სხვაობა შეთანხმებით
    - generic [ref=e456]:
      - button "დაამატე მანქანა და ნახე ვინ ეძებს მას" [ref=e457] [cursor=pointer]
      - button "დახურვა" [ref=e459] [cursor=pointer]: ×
  - navigation "მთავარი ნავიგაცია" [ref=e460]:
    - link "მთავარი" [ref=e461] [cursor=pointer]:
      - /url: /
    - link "გაცვლები" [ref=e467] [cursor=pointer]:
      - /url: /cars
    - link "დამატება" [ref=e473] [cursor=pointer]:
      - /url: /sell
    - link "შეთავაზებები" [ref=e477] [cursor=pointer]:
      - /url: /account?tab=offers
    - link "პროფილი" [ref=e485] [cursor=pointer]:
      - /url: /account
  - contentinfo [ref=e491]:
    - generic [ref=e492]:
      - generic [ref=e493]:
        - generic [ref=e494]: autoswap
        - paragraph [ref=e502]: რეალური გაცვლები რეალურ მფლობელებს შორის.
      - navigation "ფუტერის ნავიგაცია" [ref=e503]:
        - link "გაცვლები" [ref=e504] [cursor=pointer]:
          - /url: /cars
        - link "განცხადების დამატება" [ref=e505] [cursor=pointer]:
          - /url: /sell
        - link "ჩვენ შესახებ" [ref=e506] [cursor=pointer]:
          - /url: /about
        - link "წესები" [ref=e507] [cursor=pointer]:
          - /url: /terms
        - link "კონფიდენციალურობა" [ref=e508] [cursor=pointer]:
          - /url: /privacy
        - link "კონტაქტი" [ref=e509] [cursor=pointer]:
          - /url: /about#contact
    - generic [ref=e510]: © 2026 AutoSwap · ყველა უფლება დაცულია
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
  31  |   expect.soft(errors, 'Console errors detected').toEqual([]);
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
> 61  |       await expect(page.getByRole('link', { name: /მთავარი/i })).toBeVisible();
      |                                                                  ^ Error: expect(locator).toBeVisible() failed
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
  156 |         await expect(page.locator('main, body')).toContainText(/AutoSwap|ავტო|გაცვლ/i);
  157 |       }
  158 | 
  159 |       await assertNoConsoleErrors(page, consoleErrors);
  160 |       await assertNoPageErrors(page, pageErrors);
  161 |     });
```