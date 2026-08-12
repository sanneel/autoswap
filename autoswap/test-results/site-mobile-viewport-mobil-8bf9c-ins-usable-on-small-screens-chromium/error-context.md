# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> mobile viewport >> mobile navigation remains usable on small screens
- Location: e2e\site.spec.ts:185:5

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
      - generic [ref=e12]:
        - group "ფასების ვალუტა" [ref=e13]:
          - button "₾" [pressed] [ref=e14] [cursor=pointer]
          - button "$" [ref=e15] [cursor=pointer]
        - button "შესვლა" [ref=e17] [cursor=pointer]
  - main [ref=e18]:
    - generic [ref=e20]:
      - generic [ref=e21]:
        - heading "ავტომობილები გაცვლისთვის" [level=1] [ref=e22]
        - paragraph [ref=e23]:
          - strong [ref=e24]: "12"
          - text: აქტიური განცხადება · მოძებნე მარკით, ქალაქით და თანხის სხვაობით
      - link "დაამატე მანქანა" [ref=e25] [cursor=pointer]:
        - /url: /sell
    - generic "სწრაფი ფილტრები" [ref=e27]:
      - navigation [ref=e28]:
        - link "ყველა 18" [ref=e29] [cursor=pointer]:
          - /url: /cars
          - generic [ref=e30]: ყველა
          - generic [ref=e31]: "18"
        - link "Toyota Toyota 5" [ref=e32] [cursor=pointer]:
          - /url: /cars?make=Toyota
          - img "Toyota" [ref=e33]
          - generic [ref=e34]: Toyota
          - generic [ref=e35]: "5"
        - link "BMW BMW 2" [ref=e36] [cursor=pointer]:
          - /url: /cars?make=BMW
          - img "BMW" [ref=e37]
          - generic [ref=e38]: BMW
          - generic [ref=e39]: "2"
        - link "Hyundai Hyundai 2" [ref=e40] [cursor=pointer]:
          - /url: /cars?make=Hyundai
          - img "Hyundai" [ref=e41]
          - generic [ref=e42]: Hyundai
          - generic [ref=e43]: "2"
        - link "Alfa Romeo 1" [ref=e44] [cursor=pointer]:
          - /url: /cars?make=Alfa%20Romeo
          - generic [ref=e45]: Alfa Romeo
          - generic [ref=e46]: "1"
        - link "Bentley 1" [ref=e47] [cursor=pointer]:
          - /url: /cars?make=BENTLEY
          - generic [ref=e48]: Bentley
          - generic [ref=e49]: "1"
        - link "Chevrolet Chevrolet 1" [ref=e50] [cursor=pointer]:
          - /url: /cars?make=Chevrolet
          - img "Chevrolet" [ref=e51]
          - generic [ref=e52]: Chevrolet
          - generic [ref=e53]: "1"
        - link "Ford Ford 1" [ref=e54] [cursor=pointer]:
          - /url: /cars?make=Ford
          - img "Ford" [ref=e55]
          - generic [ref=e56]: Ford
          - generic [ref=e57]: "1"
        - link "Jeep Jeep 1" [ref=e58] [cursor=pointer]:
          - /url: /cars?make=Jeep
          - img "Jeep" [ref=e59]
          - generic [ref=e60]: Jeep
          - generic [ref=e61]: "1"
        - link "სედანი 11" [ref=e62] [cursor=pointer]:
          - /url: /cars?category=sedan
          - generic [ref=e63]: სედანი
          - generic [ref=e64]: "11"
        - link "₾ გარეშე 3" [ref=e65] [cursor=pointer]:
          - /url: /cars?cash=none
          - generic [ref=e66]: ₾
          - generic [ref=e67]: გარეშე
          - generic [ref=e68]: "3"
      - button "შემდეგი" [ref=e69] [cursor=pointer]
    - generic [ref=e73]:
      - generic [ref=e74]:
        - paragraph [ref=e75]:
          - strong [ref=e76]: "12"
          - text: აქტიური გაცვლა
        - generic [ref=e77]:
          - button "ფილტრები" [ref=e78] [cursor=pointer]
          - generic [ref=e80]:
            - generic [ref=e81]: დალაგება
            - combobox "დალაგება" [ref=e82] [cursor=pointer]:
              - option "ახალი პირველი" [selected]
              - option "წელი კლებადობით"
              - option "წელი ზრდადობით"
              - option "გარბენი ზრდადობით"
              - option "ღირებულება ზრდადობით"
              - option "ღირებულება კლებადობით"
          - group "ხედი" [ref=e83]:
            - button "სია" [pressed] [ref=e84] [cursor=pointer]
            - button "ბადე" [ref=e88] [cursor=pointer]
      - generic [ref=e94]:
        - article [ref=e95]:
          - generic [ref=e96]:
            - link "BENTLEY ARMOURED ARNAGE დეტალურად" [ref=e97] [cursor=pointer]:
              - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
              - img "BENTLEY ARMOURED ARNAGE" [ref=e98]
            - button "BENTLEY ARMOURED ARNAGE შენახვა" [ref=e99] [cursor=pointer]
          - generic [ref=e103]:
            - heading "BENTLEY ARMOURED ARNAGE 2020" [level=3] [ref=e104]:
              - link "BENTLEY ARMOURED ARNAGE" [ref=e105] [cursor=pointer]:
                - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
              - generic [ref=e106]: "2020"
            - generic [ref=e107]: თბილისი
          - generic [ref=e111]:
            - generic [ref=e112]:
              - generic [ref=e113]: ეძებს
              - paragraph [ref=e118]: audi a6
            - paragraph [ref=e119]:
              - generic [ref=e121]: თანაბარი გაცვლა
        - article [ref=e122]:
          - generic [ref=e123]:
            - link "MERCEDES-BENZ 190 დეტალურად" [ref=e124] [cursor=pointer]:
              - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
              - img "MERCEDES-BENZ 190" [ref=e125]
            - button "MERCEDES-BENZ 190 შენახვა" [ref=e126] [cursor=pointer]
          - generic [ref=e130]:
            - heading "MERCEDES-BENZ 190 1999" [level=3] [ref=e131]:
              - link "MERCEDES-BENZ 190" [ref=e132] [cursor=pointer]:
                - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
              - generic [ref=e133]: "1999"
            - generic [ref=e134]: თბილისი
          - generic [ref=e138]:
            - generic [ref=e139]:
              - generic [ref=e140]: ეძებს
              - paragraph [ref=e145]: Audi a6
            - paragraph [ref=e146]:
              - generic [ref=e148]: თანაბარი გაცვლა
        - article [ref=e149]:
          - generic [ref=e150]:
            - link "BMW 128i დეტალურად" [ref=e151] [cursor=pointer]:
              - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
              - img "BMW 128i" [ref=e152]
            - button "BMW 128i შენახვა" [ref=e153] [cursor=pointer]
          - generic [ref=e157]:
            - heading "BMW 128i 2016" [level=3] [ref=e158]:
              - link "BMW 128i" [ref=e159] [cursor=pointer]:
                - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
              - generic [ref=e160]: "2016"
            - generic [ref=e161]: თბილისი
          - generic [ref=e165]:
            - generic [ref=e166]:
              - generic [ref=e167]: ეძებს
              - paragraph [ref=e172]: ტყე
            - paragraph [ref=e173]:
              - generic [ref=e175]: თანაბარი გაცვლა
        - article [ref=e176]:
          - generic [ref=e177]:
            - link "Jeep Compass დეტალურად" [ref=e178] [cursor=pointer]:
              - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
              - img "Jeep Compass" [ref=e179]
            - button "Jeep Compass შენახვა" [ref=e180] [cursor=pointer]
          - generic [ref=e184]:
            - heading "Jeep Compass 2016" [level=3] [ref=e185]:
              - link "Jeep Compass" [ref=e186] [cursor=pointer]:
                - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
              - generic [ref=e187]: "2016"
            - generic [ref=e188]: თბილისი
          - generic [ref=e192]:
            - generic [ref=e193]:
              - generic [ref=e194]: ეძებს
              - paragraph [ref=e199]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e200]:
              - generic [ref=e206]: სხვაობა შეთანხმებით
        - article [ref=e207]:
          - generic [ref=e208]:
            - link "Chevrolet Malibu დეტალურად" [ref=e209] [cursor=pointer]:
              - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
              - img "Chevrolet Malibu" [ref=e210]
            - button "Chevrolet Malibu შენახვა" [ref=e211] [cursor=pointer]
          - generic [ref=e215]:
            - heading "Chevrolet Malibu 2023" [level=3] [ref=e216]:
              - link "Chevrolet Malibu" [ref=e217] [cursor=pointer]:
                - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
              - generic [ref=e218]: "2023"
            - generic [ref=e219]: თბილისი
          - generic [ref=e223]:
            - generic [ref=e224]:
              - generic [ref=e225]: ეძებს
              - paragraph [ref=e230]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e231]:
              - generic [ref=e237]: სხვაობა შეთანხმებით
        - article [ref=e238]:
          - generic [ref=e239]:
            - link "Alfa Romeo Mito დეტალურად" [ref=e240] [cursor=pointer]:
              - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
              - img "Alfa Romeo Mito" [ref=e241]
            - button "Alfa Romeo Mito შენახვა" [ref=e242] [cursor=pointer]
          - generic [ref=e246]:
            - heading "Alfa Romeo Mito 2008" [level=3] [ref=e247]:
              - link "Alfa Romeo Mito" [ref=e248] [cursor=pointer]:
                - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
              - generic [ref=e249]: "2008"
            - generic [ref=e250]: თბილისი
          - generic [ref=e254]:
            - generic [ref=e255]:
              - generic [ref=e256]: ეძებს
              - paragraph [ref=e261]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e262]:
              - generic [ref=e268]: სხვაობა შეთანხმებით
        - article [ref=e269]:
          - generic [ref=e270]:
            - link "Hyundai Sonata დეტალურად" [ref=e271] [cursor=pointer]:
              - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
              - img "Hyundai Sonata" [ref=e272]
            - button "Hyundai Sonata შენახვა" [ref=e273] [cursor=pointer]
          - generic [ref=e277]:
            - heading "Hyundai Sonata 2015" [level=3] [ref=e278]:
              - link "Hyundai Sonata" [ref=e279] [cursor=pointer]:
                - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
              - generic [ref=e280]: "2015"
            - generic [ref=e281]: თბილისი
          - generic [ref=e285]:
            - generic [ref=e286]:
              - generic [ref=e287]: ეძებს
              - paragraph [ref=e292]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e293]:
              - generic [ref=e299]: სხვაობა შეთანხმებით
        - article [ref=e300]:
          - generic [ref=e301]:
            - link "Mitsubishi Outlander Sport SE დეტალურად" [ref=e302] [cursor=pointer]:
              - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
              - img "Mitsubishi Outlander Sport SE" [ref=e303]
            - button "Mitsubishi Outlander Sport SE შენახვა" [ref=e304] [cursor=pointer]
          - generic [ref=e308]:
            - heading "Mitsubishi Outlander Sport SE 2018" [level=3] [ref=e309]:
              - link "Mitsubishi Outlander Sport SE" [ref=e310] [cursor=pointer]:
                - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
              - generic [ref=e311]: "2018"
            - generic [ref=e312]: თბილისი
          - generic [ref=e316]:
            - generic [ref=e317]:
              - generic [ref=e318]: ეძებს
              - paragraph [ref=e323]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e324]:
              - generic [ref=e330]: სხვაობა შეთანხმებით
        - article [ref=e331]:
          - generic [ref=e332]:
            - link "Hyundai Sonata Limited 4dr Sedan Automatic დეტალურად" [ref=e333] [cursor=pointer]:
              - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
              - img "Hyundai Sonata Limited 4dr Sedan Automatic" [ref=e334]
            - button "Hyundai Sonata Limited 4dr Sedan Automatic შენახვა" [ref=e335] [cursor=pointer]
          - generic [ref=e339]:
            - heading "Hyundai Sonata Limited 4dr Sedan Automatic 2013" [level=3] [ref=e340]:
              - link "Hyundai Sonata Limited 4dr Sedan Automatic" [ref=e341] [cursor=pointer]:
                - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
              - generic [ref=e342]: "2013"
            - generic [ref=e343]: თბილისი
          - generic [ref=e347]:
            - generic [ref=e348]:
              - generic [ref=e349]: ეძებს
              - paragraph [ref=e354]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e355]:
              - generic [ref=e361]: სხვაობა შეთანხმებით
        - article [ref=e362]:
          - generic [ref=e363]:
            - link "BMW X3 xDrive28i 4dr All-wheel Drive დეტალურად" [ref=e364] [cursor=pointer]:
              - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
              - img "BMW X3 xDrive28i 4dr All-wheel Drive" [ref=e365]
            - button "BMW X3 xDrive28i 4dr All-wheel Drive შენახვა" [ref=e366] [cursor=pointer]
          - generic [ref=e370]:
            - heading "BMW X3 xDrive28i 4dr All-wheel Drive 2012" [level=3] [ref=e371]:
              - link "BMW X3 xDrive28i 4dr All-wheel Drive" [ref=e372] [cursor=pointer]:
                - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
              - generic [ref=e373]: "2012"
            - generic [ref=e374]: თბილისი
          - generic [ref=e378]:
            - generic [ref=e379]:
              - generic [ref=e380]: ეძებს
              - paragraph [ref=e385]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e386]:
              - generic [ref=e392]: სხვაობა შეთანხმებით
        - article [ref=e393]:
          - generic [ref=e394]:
            - link "Mercedes-Benz GLK 350 დეტალურად" [ref=e395] [cursor=pointer]:
              - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
              - img "Mercedes-Benz GLK 350" [ref=e396]
            - button "Mercedes-Benz GLK 350 შენახვა" [ref=e397] [cursor=pointer]
          - generic [ref=e401]:
            - heading "Mercedes-Benz GLK 350 2009" [level=3] [ref=e402]:
              - link "Mercedes-Benz GLK 350" [ref=e403] [cursor=pointer]:
                - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
              - generic [ref=e404]: "2009"
            - generic [ref=e405]: თბილისი
          - generic [ref=e409]:
            - generic [ref=e410]:
              - generic [ref=e411]: ეძებს
              - paragraph [ref=e416]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e417]:
              - generic [ref=e423]: სხვაობა შეთანხმებით
        - article [ref=e424]:
          - generic [ref=e425]:
            - link "Toyota Camry SE 4dr Sedan Automatic დეტალურად" [ref=e426] [cursor=pointer]:
              - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
              - img "Toyota Camry SE 4dr Sedan Automatic" [ref=e427]
            - button "Toyota Camry SE 4dr Sedan Automatic შენახვა" [ref=e428] [cursor=pointer]
          - generic [ref=e432]:
            - heading "Toyota Camry SE 4dr Sedan Automatic 2018" [level=3] [ref=e433]:
              - link "Toyota Camry SE 4dr Sedan Automatic" [ref=e434] [cursor=pointer]:
                - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
              - generic [ref=e435]: "2018"
            - generic [ref=e436]: თბილისი
          - generic [ref=e440]:
            - generic [ref=e441]:
              - generic [ref=e442]: ეძებს
              - paragraph [ref=e447]: ნებისმიერ შეთავაზებაზე
            - paragraph [ref=e448]:
              - generic [ref=e454]: სხვაობა შეთანხმებით
  - navigation "მთავარი ნავიგაცია" [ref=e455]:
    - link "მთავარი" [ref=e456] [cursor=pointer]:
      - /url: /
    - link "გაცვლები" [ref=e462] [cursor=pointer]:
      - /url: /cars
    - link "დამატება" [ref=e468] [cursor=pointer]:
      - /url: /sell
    - link "შეთავაზებები" [ref=e472] [cursor=pointer]:
      - /url: /account?tab=offers
    - link "პროფილი" [ref=e480] [cursor=pointer]:
      - /url: /account
  - contentinfo [ref=e486]:
    - generic [ref=e487]:
      - generic [ref=e488]:
        - generic [ref=e489]: autoswap
        - paragraph [ref=e497]: რეალური გაცვლები რეალურ მფლობელებს შორის.
      - navigation "ფუტერის ნავიგაცია" [ref=e498]:
        - link "გაცვლები" [ref=e499] [cursor=pointer]:
          - /url: /cars
        - link "განცხადების დამატება" [ref=e500] [cursor=pointer]:
          - /url: /sell
        - link "ჩვენ შესახებ" [ref=e501] [cursor=pointer]:
          - /url: /about
        - link "წესები" [ref=e502] [cursor=pointer]:
          - /url: /terms
        - link "კონფიდენციალურობა" [ref=e503] [cursor=pointer]:
          - /url: /privacy
        - link "კონტაქტი" [ref=e504] [cursor=pointer]:
          - /url: /about#contact
    - generic [ref=e505]: © 2026 AutoSwap · ყველა უფლება დაცულია
```

# Test source

```ts
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
> 198 |         await expect(link).toBeVisible();
      |                            ^ Error: expect(locator).toBeVisible() failed
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