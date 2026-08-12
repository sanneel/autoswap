# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> desktop viewport >> regression: save CTAs render on cards
- Location: e2e\site.spec.ts:215:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText(/შენახვა/i).first()
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/შენახვა/i).first()

```

```yaml
- banner:
  - link "AutoSwap მთავარი გვერდი":
    - /url: /#home
    - text: autoswap
  - navigation "მთავარი ნავიგაცია":
    - link "გაცვლები":
      - /url: /cars
    - link "ჩვენ შესახებ":
      - /url: /about
  - link "დაამატე მანქანა":
    - /url: /sell
  - group "ფასების ვალუტა":
    - button "₾" [pressed]
    - button "$"
  - button "შესვლა"
- main:
  - heading "ავტომობილები გაცვლისთვის" [level=1]
  - paragraph:
    - strong: "12"
    - text: აქტიური განცხადება · მოძებნე მარკით, ქალაქით და თანხის სხვაობით
  - link "დაამატე მანქანა":
    - /url: /sell
  - button "წინა"
  - navigation:
    - link "ყველა 18":
      - /url: /cars
    - link "Toyota Toyota 5":
      - /url: /cars?make=Toyota
      - img "Toyota"
      - text: Toyota 5
    - link "BMW BMW 2":
      - /url: /cars?make=BMW
      - img "BMW"
      - text: BMW 2
    - link "Hyundai Hyundai 2":
      - /url: /cars?make=Hyundai
      - img "Hyundai"
      - text: Hyundai 2
    - link "Alfa Romeo 1":
      - /url: /cars?make=Alfa%20Romeo
    - link "Bentley 1":
      - /url: /cars?make=BENTLEY
    - link "Chevrolet Chevrolet 1":
      - /url: /cars?make=Chevrolet
      - img "Chevrolet"
      - text: Chevrolet 1
    - link "Ford Ford 1":
      - /url: /cars?make=Ford
      - img "Ford"
      - text: Ford 1
    - link "Jeep Jeep 1":
      - /url: /cars?make=Jeep
      - img "Jeep"
      - text: Jeep 1
    - link "სედანი 11":
      - /url: /cars?category=sedan
    - link "₾ გარეშე 3":
      - /url: /cars?cash=none
  - button "შემდეგი"
  - complementary "ფილტრები":
    - text: ფილტრები
    - button "გასუფთავება"
    - button "მიუთითე შენი მანქანა"
    - paragraph: ნახე ვინ ეძებს მას. შეთავაზებები მოვა პირდაპირ შენთან.
    - text: საძიებო სიტყვა
    - combobox "საძიებო სიტყვა"
    - heading "მანქანა" [level=3]
    - text: მარკა
    - combobox:
      - textbox "მარკა":
        - /placeholder: მოძებნე მარკა…
      - button "გასუფთავება": ×
    - text: მოდელი
    - combobox:
      - textbox "მოდელი" [disabled]:
        - /placeholder: ჯერ აირჩიე მარკა…
      - button "გასუფთავება": ×
    - text: ტიპი
    - button "ნებისმიერი"
    - button "კუპე"
    - button "სედანი"
    - button "ჯიპი"
    - heading "გაცვლის პირობა" [level=3]
    - text: თანხის სხვაობა
    - button "ნებისმიერი"
    - button "თანაბარი"
    - button "ის ამატებს"
    - button "ის ითხოვს"
    - button "შეთანხმებით"
    - button "დამატებითი ფილტრები 1"
    - button "გასუფთავება"
    - button "ძებნა (12)"
  - paragraph:
    - strong: "12"
    - text: აქტიური გაცვლა
  - text: დალაგება
  - combobox "დალაგება":
    - option "ახალი პირველი" [selected]
    - option "წელი კლებადობით"
    - option "წელი ზრდადობით"
    - option "გარბენი ზრდადობით"
    - option "ღირებულება ზრდადობით"
    - option "ღირებულება კლებადობით"
  - group "ხედი":
    - button "სია" [pressed]
    - button "ბადე"
  - article:
    - link "BENTLEY ARMOURED ARNAGE დეტალურად":
      - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
      - img "BENTLEY ARMOURED ARNAGE"
    - button "BENTLEY ARMOURED ARNAGE შენახვა"
    - heading "BENTLEY ARMOURED ARNAGE 2020" [level=3]:
      - link "BENTLEY ARMOURED ARNAGE":
        - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
      - text: "2020"
    - text: თბილისი · 2 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ავტომატიკა
      - listitem: 10,000 კმ
    - text: ეძებს
    - paragraph: audi a6
    - paragraph: თანაბარი გაცვლა
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
  - article:
    - link "MERCEDES-BENZ 190 დეტალურად":
      - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
      - img "MERCEDES-BENZ 190"
    - button "MERCEDES-BENZ 190 შენახვა"
    - heading "MERCEDES-BENZ 190 1999" [level=3]:
      - link "MERCEDES-BENZ 190":
        - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
      - text: "1999"
    - text: თბილისი · 2 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ავტომატიკა
      - listitem: 11,111 კმ
    - text: ეძებს
    - paragraph: Audi a6
    - text: mercedes benz bmw 528 +2
    - paragraph: თანაბარი გაცვლა
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
  - article:
    - link "BMW 128i დეტალურად":
      - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
      - img "BMW 128i"
    - button "BMW 128i შენახვა"
    - heading "BMW 128i 2016" [level=3]:
      - link "BMW 128i":
        - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
      - text: "2016"
    - text: თბილისი · 2 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ავტომატიკა
      - listitem: 10,000 კმ
    - text: ეძებს
    - paragraph: ტყე
    - paragraph: თანაბარი გაცვლა
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
  - article:
    - link "Jeep Compass დეტალურად":
      - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
      - img "Jeep Compass"
    - button "Jeep Compass შენახვა"
    - heading "Jeep Compass 2016" [level=3]:
      - link "Jeep Compass":
        - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
      - text: "2016"
    - text: თბილისი · 63 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ავტომატიკა
      - listitem: 141,200 კმ
    - text: ეძებს
    - paragraph: ნებისმიერ შეთავაზებაზე
    - paragraph: სხვაობა შეთანხმებით
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
  - article:
    - link "Chevrolet Malibu დეტალურად":
      - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
      - img "Chevrolet Malibu"
    - button "Chevrolet Malibu შენახვა"
    - heading "Chevrolet Malibu 2023" [level=3]:
      - link "Chevrolet Malibu":
        - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
      - text: "2023"
    - text: თბილისი · 63 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ტიპტრონიკი
      - listitem: 54,000 კმ
    - text: ეძებს
    - paragraph: ნებისმიერ შეთავაზებაზე
    - paragraph: სხვაობა შეთანხმებით
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
  - article:
    - link "Alfa Romeo Mito დეტალურად":
      - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
      - img "Alfa Romeo Mito"
    - button "Alfa Romeo Mito შენახვა"
    - heading "Alfa Romeo Mito 2008" [level=3]:
      - link "Alfa Romeo Mito":
        - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
      - text: "2008"
    - text: თბილისი · 63 დღის წინ
    - list:
      - listitem: დიზელი
      - listitem: მექანიკა
      - listitem: 204,000 კმ
    - text: ეძებს
    - paragraph: ნებისმიერ შეთავაზებაზე
    - paragraph: სხვაობა შეთანხმებით
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
  - article:
    - link "Hyundai Sonata დეტალურად":
      - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
      - img "Hyundai Sonata"
    - button "Hyundai Sonata შენახვა"
    - heading "Hyundai Sonata 2015" [level=3]:
      - link "Hyundai Sonata":
        - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
      - text: "2015"
    - text: თბილისი · 63 დღის წინ
    - list:
      - listitem: ჰიბრიდი
      - listitem: ავტომატიკა
      - listitem: 142,400 კმ
    - text: ეძებს
    - paragraph: ნებისმიერ შეთავაზებაზე
    - paragraph: სხვაობა შეთანხმებით
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
  - article:
    - link "Mitsubishi Outlander Sport SE დეტალურად":
      - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
      - img "Mitsubishi Outlander Sport SE"
    - button "Mitsubishi Outlander Sport SE შენახვა"
    - heading "Mitsubishi Outlander Sport SE 2018" [level=3]:
      - link "Mitsubishi Outlander Sport SE":
        - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
      - text: "2018"
    - text: თბილისი · 63 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ვარიატორი
      - listitem: 144,000 კმ
    - text: ეძებს
    - paragraph: ნებისმიერ შეთავაზებაზე
    - paragraph: სხვაობა შეთანხმებით
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
  - article:
    - link "Hyundai Sonata Limited 4dr Sedan Automatic დეტალურად":
      - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
      - img "Hyundai Sonata Limited 4dr Sedan Automatic"
    - button "Hyundai Sonata Limited 4dr Sedan Automatic შენახვა"
    - heading "Hyundai Sonata Limited 4dr Sedan Automatic 2013" [level=3]:
      - link "Hyundai Sonata Limited 4dr Sedan Automatic":
        - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
      - text: "2013"
    - text: თბილისი · 63 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ავტომატიკა
      - listitem: 182,400 კმ
    - text: ეძებს
    - paragraph: ნებისმიერ შეთავაზებაზე
    - paragraph: სხვაობა შეთანხმებით
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
  - article:
    - link "BMW X3 xDrive28i 4dr All-wheel Drive დეტალურად":
      - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
      - img "BMW X3 xDrive28i 4dr All-wheel Drive"
    - button "BMW X3 xDrive28i 4dr All-wheel Drive შენახვა"
    - heading "BMW X3 xDrive28i 4dr All-wheel Drive 2012" [level=3]:
      - link "BMW X3 xDrive28i 4dr All-wheel Drive":
        - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
      - text: "2012"
    - text: თბილისი · 63 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ავტომატიკა
      - listitem: 201,000 კმ
    - text: ეძებს
    - paragraph: ნებისმიერ შეთავაზებაზე
    - paragraph: სხვაობა შეთანხმებით
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
  - article:
    - link "Mercedes-Benz GLK 350 დეტალურად":
      - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
      - img "Mercedes-Benz GLK 350"
    - button "Mercedes-Benz GLK 350 შენახვა"
    - heading "Mercedes-Benz GLK 350 2009" [level=3]:
      - link "Mercedes-Benz GLK 350":
        - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
      - text: "2009"
    - text: თბილისი · 63 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ავტომატიკა
      - listitem: 100,000 კმ
    - text: ეძებს
    - paragraph: ნებისმიერ შეთავაზებაზე
    - paragraph: სხვაობა შეთანხმებით
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
  - article:
    - link "Toyota Camry SE 4dr Sedan Automatic დეტალურად":
      - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
      - img "Toyota Camry SE 4dr Sedan Automatic"
    - button "Toyota Camry SE 4dr Sedan Automatic შენახვა"
    - heading "Toyota Camry SE 4dr Sedan Automatic 2018" [level=3]:
      - link "Toyota Camry SE 4dr Sedan Automatic":
        - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
      - text: "2018"
    - text: თბილისი · 63 დღის წინ
    - list:
      - listitem: ბენზინი
      - listitem: ტიპტრონიკი
      - listitem: 211,000 კმ
    - text: ეძებს
    - paragraph: ნებისმიერ შეთავაზებაზე
    - paragraph: სხვაობა შეთანხმებით
    - button "შესთავაზე გაცვლა"
    - link "დეტალურად":
      - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
- contentinfo:
  - paragraph: რეალური გაცვლები რეალურ მფლობელებს შორის.
  - navigation "ფუტერის ნავიგაცია":
    - link "გაცვლები":
      - /url: /cars
    - link "•განცხადების დამატება":
      - /url: /sell
    - link "•ჩვენ შესახებ":
      - /url: /about
    - link "•წესები":
      - /url: /terms
    - link "•კონფიდენციალურობა":
      - /url: /privacy
    - link "•კონტაქტი":
      - /url: /about#contact
  - text: © 2026 AutoSwap · ყველა უფლება დაცულია
```

# Test source

```ts
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
> 218 |       await expect(saveTexts.first()).toBeVisible();
      |                                       ^ Error: expect(locator).toBeVisible() failed
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