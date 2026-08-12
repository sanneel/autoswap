# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: site.spec.ts >> desktop viewport >> cars listing page renders summary, chips, sort and cards
- Location: e2e\site.spec.ts:74:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('link', { name: /დაამატე მანქანა/i })
Expected: visible
Error: strict mode violation: getByRole('link', { name: /დაამატე მანქანა/i }) resolved to 2 elements:
    1) <a href="/sell" class="btn btn-accent header-cta">…</a> aka getByRole('banner').getByRole('link', { name: 'დაამატე მანქანა' })
    2) <a href="/sell" class="btn btn-primary catalog-topbar-cta">…</a> aka getByRole('main').getByRole('link', { name: 'დაამატე მანქანა' })

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('link', { name: /დაამატე მანქანა/i })

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
        - navigation "მთავარი ნავიგაცია" [ref=e14]:
          - link "გაცვლები" [ref=e15] [cursor=pointer]:
            - /url: /cars
          - link "ჩვენ შესახებ" [ref=e16] [cursor=pointer]:
            - /url: /about
        - link "დაამატე მანქანა" [ref=e17] [cursor=pointer]:
          - /url: /sell
        - group "ფასების ვალუტა" [ref=e20]:
          - button "₾" [pressed] [ref=e21] [cursor=pointer]
          - button "$" [ref=e22] [cursor=pointer]
        - button "შესვლა" [ref=e24] [cursor=pointer]
  - main [ref=e25]:
    - generic [ref=e27]:
      - generic [ref=e28]:
        - heading "ავტომობილები გაცვლისთვის" [level=1] [ref=e29]
        - paragraph [ref=e30]:
          - strong [ref=e31]: "12"
          - text: აქტიური განცხადება · მოძებნე მარკით, ქალაქით და თანხის სხვაობით
      - link "დაამატე მანქანა" [ref=e32] [cursor=pointer]:
        - /url: /sell
    - generic "სწრაფი ფილტრები" [ref=e34]:
      - button "წინა" [ref=e35] [cursor=pointer]
      - navigation [ref=e38]:
        - link "ყველა 18" [ref=e39] [cursor=pointer]:
          - /url: /cars
          - generic [ref=e40]: ყველა
          - generic [ref=e41]: "18"
        - link "Toyota Toyota 5" [ref=e42] [cursor=pointer]:
          - /url: /cars?make=Toyota
          - img "Toyota" [ref=e43]
          - generic [ref=e44]: Toyota
          - generic [ref=e45]: "5"
        - link "BMW BMW 2" [ref=e46] [cursor=pointer]:
          - /url: /cars?make=BMW
          - img "BMW" [ref=e47]
          - generic [ref=e48]: BMW
          - generic [ref=e49]: "2"
        - link "Hyundai Hyundai 2" [ref=e50] [cursor=pointer]:
          - /url: /cars?make=Hyundai
          - img "Hyundai" [ref=e51]
          - generic [ref=e52]: Hyundai
          - generic [ref=e53]: "2"
        - link "Alfa Romeo 1" [ref=e54] [cursor=pointer]:
          - /url: /cars?make=Alfa%20Romeo
          - generic [ref=e55]: Alfa Romeo
          - generic [ref=e56]: "1"
        - link "Bentley 1" [ref=e57] [cursor=pointer]:
          - /url: /cars?make=BENTLEY
          - generic [ref=e58]: Bentley
          - generic [ref=e59]: "1"
        - link "Chevrolet Chevrolet 1" [ref=e60] [cursor=pointer]:
          - /url: /cars?make=Chevrolet
          - img "Chevrolet" [ref=e61]
          - generic [ref=e62]: Chevrolet
          - generic [ref=e63]: "1"
        - link "Ford Ford 1" [ref=e64] [cursor=pointer]:
          - /url: /cars?make=Ford
          - img "Ford" [ref=e65]
          - generic [ref=e66]: Ford
          - generic [ref=e67]: "1"
        - link "Jeep Jeep 1" [ref=e68] [cursor=pointer]:
          - /url: /cars?make=Jeep
          - img "Jeep" [ref=e69]
          - generic [ref=e70]: Jeep
          - generic [ref=e71]: "1"
        - link "სედანი 11" [ref=e72] [cursor=pointer]:
          - /url: /cars?category=sedan
          - generic [ref=e73]: სედანი
          - generic [ref=e74]: "11"
        - link "₾ გარეშე 3" [ref=e75] [cursor=pointer]:
          - /url: /cars?cash=none
          - generic [ref=e76]: ₾
          - generic [ref=e77]: გარეშე
          - generic [ref=e78]: "3"
      - button "შემდეგი" [ref=e79] [cursor=pointer]
    - generic [ref=e82]:
      - complementary "ფილტრები" [ref=e83]:
        - generic [ref=e84]:
          - generic [ref=e85]:
            - generic [ref=e86]: ფილტრები
            - button "გასუფთავება" [ref=e89] [cursor=pointer]
          - generic [ref=e93]:
            - generic [ref=e94]:
              - button "მიუთითე შენი მანქანა" [ref=e95] [cursor=pointer]
              - paragraph [ref=e99]: ნახე ვინ ეძებს მას. შეთავაზებები მოვა პირდაპირ შენთან.
            - generic [ref=e100]:
              - generic [ref=e101]: საძიებო სიტყვა
              - combobox "საძიებო სიტყვა" [ref=e107]
            - generic [ref=e108]:
              - heading "მანქანა" [level=3] [ref=e109]
              - generic [ref=e110]:
                - generic [ref=e111]: მარკა
                - combobox [ref=e113]:
                  - textbox "მარკა" [ref=e114]:
                    - /placeholder: მოძებნე მარკა…
                  - button "გასუფთავება" [ref=e115] [cursor=pointer]: ×
              - generic [ref=e116]:
                - generic [ref=e117]: მოდელი
                - combobox [ref=e119]:
                  - textbox "მოდელი" [disabled] [ref=e120]:
                    - /placeholder: ჯერ აირჩიე მარკა…
                  - button "გასუფთავება" [ref=e121] [cursor=pointer]: ×
              - generic [ref=e122]:
                - generic [ref=e123]: ტიპი
                - generic [ref=e124]:
                  - button "ნებისმიერი" [ref=e125] [cursor=pointer]
                  - button "კუპე" [ref=e126] [cursor=pointer]
                  - button "სედანი" [ref=e127] [cursor=pointer]
                  - button "ჯიპი" [ref=e128] [cursor=pointer]
            - generic [ref=e129]:
              - heading "გაცვლის პირობა" [level=3] [ref=e130]
              - generic [ref=e131]:
                - generic [ref=e132]: თანხის სხვაობა
                - generic [ref=e133]:
                  - button "ნებისმიერი" [ref=e134] [cursor=pointer]
                  - button "თანაბარი" [ref=e135] [cursor=pointer]
                  - button "ის ამატებს" [ref=e136] [cursor=pointer]
                  - button "ის ითხოვს" [ref=e137] [cursor=pointer]
                  - button "შეთანხმებით" [ref=e138] [cursor=pointer]
            - button "დამატებითი ფილტრები 1" [ref=e139] [cursor=pointer]:
              - text: დამატებითი ფილტრები
              - generic [ref=e141]: "1"
          - generic [ref=e142]:
            - button "გასუფთავება" [ref=e143] [cursor=pointer]
            - button "ძებნა (12)" [ref=e144] [cursor=pointer]:
              - text: ძებნა
              - generic [ref=e148]: (12)
      - generic [ref=e149]:
        - generic [ref=e150]:
          - paragraph [ref=e151]:
            - strong [ref=e152]: "12"
            - text: აქტიური გაცვლა
          - generic [ref=e153]:
            - generic [ref=e154]:
              - generic [ref=e155]: დალაგება
              - combobox "დალაგება" [ref=e156] [cursor=pointer]:
                - option "ახალი პირველი" [selected]
                - option "წელი კლებადობით"
                - option "წელი ზრდადობით"
                - option "გარბენი ზრდადობით"
                - option "ღირებულება ზრდადობით"
                - option "ღირებულება კლებადობით"
            - group "ხედი" [ref=e157]:
              - button "სია" [pressed] [ref=e158] [cursor=pointer]
              - button "ბადე" [ref=e162] [cursor=pointer]
        - generic [ref=e168]:
          - article [ref=e169]:
            - generic [ref=e170]:
              - link "BENTLEY ARMOURED ARNAGE დეტალურად" [ref=e171] [cursor=pointer]:
                - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
                - img "BENTLEY ARMOURED ARNAGE" [ref=e172]
              - button "BENTLEY ARMOURED ARNAGE შენახვა" [ref=e173] [cursor=pointer]
            - generic [ref=e176]:
              - generic [ref=e177]:
                - heading "BENTLEY ARMOURED ARNAGE 2020" [level=3] [ref=e178]:
                  - link "BENTLEY ARMOURED ARNAGE" [ref=e179] [cursor=pointer]:
                    - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
                  - generic [ref=e180]: "2020"
                - generic [ref=e181]:
                  - text: თბილისი
                  - generic [ref=e185]: · 2 დღის წინ
              - list [ref=e186]:
                - listitem [ref=e187]:
                  - generic [ref=e191]: ბენზინი
                - listitem [ref=e192]:
                  - generic [ref=e197]: ავტომატიკა
                - listitem [ref=e198]:
                  - generic [ref=e203]: 10,000 კმ
            - generic [ref=e204]:
              - generic [ref=e205]:
                - generic [ref=e206]: ეძებს
                - paragraph [ref=e211]: audi a6
              - paragraph [ref=e212]:
                - generic [ref=e214]: თანაბარი გაცვლა
              - generic [ref=e215]:
                - button "შესთავაზე გაცვლა" [ref=e216] [cursor=pointer]
                - link "დეტალურად" [ref=e222] [cursor=pointer]:
                  - /url: /vehicle?id=8f1d8bb3-428b-480c-abd3-8e47fcac681b
          - article [ref=e223]:
            - generic [ref=e224]:
              - link "MERCEDES-BENZ 190 დეტალურად" [ref=e225] [cursor=pointer]:
                - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
                - img "MERCEDES-BENZ 190" [ref=e226]
              - button "MERCEDES-BENZ 190 შენახვა" [ref=e227] [cursor=pointer]
            - generic [ref=e230]:
              - generic [ref=e231]:
                - heading "MERCEDES-BENZ 190 1999" [level=3] [ref=e232]:
                  - link "MERCEDES-BENZ 190" [ref=e233] [cursor=pointer]:
                    - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
                  - generic [ref=e234]: "1999"
                - generic [ref=e235]:
                  - text: თბილისი
                  - generic [ref=e239]: · 2 დღის წინ
              - list [ref=e240]:
                - listitem [ref=e241]:
                  - generic [ref=e245]: ბენზინი
                - listitem [ref=e246]:
                  - generic [ref=e251]: ავტომატიკა
                - listitem [ref=e252]:
                  - generic [ref=e257]: 11,111 კმ
            - generic [ref=e258]:
              - generic [ref=e259]:
                - generic [ref=e260]: ეძებს
                - paragraph [ref=e265]: Audi a6
                - generic [ref=e266]:
                  - generic [ref=e267]: mercedes benz
                  - generic [ref=e268]: bmw 528
                  - generic [ref=e269]: "+2"
              - paragraph [ref=e270]:
                - generic [ref=e272]: თანაბარი გაცვლა
              - generic [ref=e273]:
                - button "შესთავაზე გაცვლა" [ref=e274] [cursor=pointer]
                - link "დეტალურად" [ref=e280] [cursor=pointer]:
                  - /url: /vehicle?id=da28e9c8-3bfe-4f8e-9ab5-39c8f5267eec
          - article [ref=e281]:
            - generic [ref=e282]:
              - link "BMW 128i დეტალურად" [ref=e283] [cursor=pointer]:
                - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
                - img "BMW 128i" [ref=e284]
              - button "BMW 128i შენახვა" [ref=e285] [cursor=pointer]
            - generic [ref=e288]:
              - generic [ref=e289]:
                - heading "BMW 128i 2016" [level=3] [ref=e290]:
                  - link "BMW 128i" [ref=e291] [cursor=pointer]:
                    - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
                  - generic [ref=e292]: "2016"
                - generic [ref=e293]:
                  - text: თბილისი
                  - generic [ref=e297]: · 2 დღის წინ
              - list [ref=e298]:
                - listitem [ref=e299]:
                  - generic [ref=e303]: ბენზინი
                - listitem [ref=e304]:
                  - generic [ref=e309]: ავტომატიკა
                - listitem [ref=e310]:
                  - generic [ref=e315]: 10,000 კმ
            - generic [ref=e316]:
              - generic [ref=e317]:
                - generic [ref=e318]: ეძებს
                - paragraph [ref=e323]: ტყე
              - paragraph [ref=e324]:
                - generic [ref=e326]: თანაბარი გაცვლა
              - generic [ref=e327]:
                - button "შესთავაზე გაცვლა" [ref=e328] [cursor=pointer]
                - link "დეტალურად" [ref=e334] [cursor=pointer]:
                  - /url: /vehicle?id=d79b551a-eb3c-4d04-82f8-440b917e454a
          - article [ref=e335]:
            - generic [ref=e336]:
              - link "Jeep Compass დეტალურად" [ref=e337] [cursor=pointer]:
                - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
                - img "Jeep Compass" [ref=e338]
              - button "Jeep Compass შენახვა" [ref=e339] [cursor=pointer]
            - generic [ref=e342]:
              - generic [ref=e343]:
                - heading "Jeep Compass 2016" [level=3] [ref=e344]:
                  - link "Jeep Compass" [ref=e345] [cursor=pointer]:
                    - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
                  - generic [ref=e346]: "2016"
                - generic [ref=e347]:
                  - text: თბილისი
                  - generic [ref=e351]: · 63 დღის წინ
              - list [ref=e352]:
                - listitem [ref=e353]:
                  - generic [ref=e357]: ბენზინი
                - listitem [ref=e358]:
                  - generic [ref=e363]: ავტომატიკა
                - listitem [ref=e364]:
                  - generic [ref=e369]: 141,200 კმ
            - generic [ref=e370]:
              - generic [ref=e371]:
                - generic [ref=e372]: ეძებს
                - paragraph [ref=e377]: ნებისმიერ შეთავაზებაზე
              - paragraph [ref=e378]:
                - generic [ref=e384]: სხვაობა შეთანხმებით
              - generic [ref=e385]:
                - button "შესთავაზე გაცვლა" [ref=e386] [cursor=pointer]
                - link "დეტალურად" [ref=e392] [cursor=pointer]:
                  - /url: /vehicle?id=20147064-8910-4e25-99e9-2ada1f58d117
          - article [ref=e393]:
            - generic [ref=e394]:
              - link "Chevrolet Malibu დეტალურად" [ref=e395] [cursor=pointer]:
                - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
                - img "Chevrolet Malibu" [ref=e396]
              - button "Chevrolet Malibu შენახვა" [ref=e397] [cursor=pointer]
            - generic [ref=e400]:
              - generic [ref=e401]:
                - heading "Chevrolet Malibu 2023" [level=3] [ref=e402]:
                  - link "Chevrolet Malibu" [ref=e403] [cursor=pointer]:
                    - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
                  - generic [ref=e404]: "2023"
                - generic [ref=e405]:
                  - text: თბილისი
                  - generic [ref=e409]: · 63 დღის წინ
              - list [ref=e410]:
                - listitem [ref=e411]:
                  - generic [ref=e415]: ბენზინი
                - listitem [ref=e416]:
                  - generic [ref=e421]: ტიპტრონიკი
                - listitem [ref=e422]:
                  - generic [ref=e427]: 54,000 კმ
            - generic [ref=e428]:
              - generic [ref=e429]:
                - generic [ref=e430]: ეძებს
                - paragraph [ref=e435]: ნებისმიერ შეთავაზებაზე
              - paragraph [ref=e436]:
                - generic [ref=e442]: სხვაობა შეთანხმებით
              - generic [ref=e443]:
                - button "შესთავაზე გაცვლა" [ref=e444] [cursor=pointer]
                - link "დეტალურად" [ref=e450] [cursor=pointer]:
                  - /url: /vehicle?id=76f6a1ec-d967-4a31-ae9f-201864b71d6f
          - article [ref=e451]:
            - generic [ref=e452]:
              - link "Alfa Romeo Mito დეტალურად" [ref=e453] [cursor=pointer]:
                - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
                - img "Alfa Romeo Mito" [ref=e454]
              - button "Alfa Romeo Mito შენახვა" [ref=e455] [cursor=pointer]
            - generic [ref=e458]:
              - generic [ref=e459]:
                - heading "Alfa Romeo Mito 2008" [level=3] [ref=e460]:
                  - link "Alfa Romeo Mito" [ref=e461] [cursor=pointer]:
                    - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
                  - generic [ref=e462]: "2008"
                - generic [ref=e463]:
                  - text: თბილისი
                  - generic [ref=e467]: · 63 დღის წინ
              - list [ref=e468]:
                - listitem [ref=e469]:
                  - generic [ref=e473]: დიზელი
                - listitem [ref=e474]:
                  - generic [ref=e479]: მექანიკა
                - listitem [ref=e480]:
                  - generic [ref=e485]: 204,000 კმ
            - generic [ref=e486]:
              - generic [ref=e487]:
                - generic [ref=e488]: ეძებს
                - paragraph [ref=e493]: ნებისმიერ შეთავაზებაზე
              - paragraph [ref=e494]:
                - generic [ref=e500]: სხვაობა შეთანხმებით
              - generic [ref=e501]:
                - button "შესთავაზე გაცვლა" [ref=e502] [cursor=pointer]
                - link "დეტალურად" [ref=e508] [cursor=pointer]:
                  - /url: /vehicle?id=601e7ae7-9dcf-4fc5-8f10-de103a2ce5e0
          - article [ref=e509]:
            - generic [ref=e510]:
              - link "Hyundai Sonata დეტალურად" [ref=e511] [cursor=pointer]:
                - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
                - img "Hyundai Sonata" [ref=e512]
              - button "Hyundai Sonata შენახვა" [ref=e513] [cursor=pointer]
            - generic [ref=e516]:
              - generic [ref=e517]:
                - heading "Hyundai Sonata 2015" [level=3] [ref=e518]:
                  - link "Hyundai Sonata" [ref=e519] [cursor=pointer]:
                    - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
                  - generic [ref=e520]: "2015"
                - generic [ref=e521]:
                  - text: თბილისი
                  - generic [ref=e525]: · 63 დღის წინ
              - list [ref=e526]:
                - listitem [ref=e527]:
                  - generic [ref=e531]: ჰიბრიდი
                - listitem [ref=e532]:
                  - generic [ref=e537]: ავტომატიკა
                - listitem [ref=e538]:
                  - generic [ref=e543]: 142,400 კმ
            - generic [ref=e544]:
              - generic [ref=e545]:
                - generic [ref=e546]: ეძებს
                - paragraph [ref=e551]: ნებისმიერ შეთავაზებაზე
              - paragraph [ref=e552]:
                - generic [ref=e558]: სხვაობა შეთანხმებით
              - generic [ref=e559]:
                - button "შესთავაზე გაცვლა" [ref=e560] [cursor=pointer]
                - link "დეტალურად" [ref=e566] [cursor=pointer]:
                  - /url: /vehicle?id=65a65aae-babd-4520-9b33-59f68b4abb30
          - article [ref=e567]:
            - generic [ref=e568]:
              - link "Mitsubishi Outlander Sport SE დეტალურად" [ref=e569] [cursor=pointer]:
                - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
                - img "Mitsubishi Outlander Sport SE" [ref=e570]
              - button "Mitsubishi Outlander Sport SE შენახვა" [ref=e571] [cursor=pointer]
            - generic [ref=e574]:
              - generic [ref=e575]:
                - heading "Mitsubishi Outlander Sport SE 2018" [level=3] [ref=e576]:
                  - link "Mitsubishi Outlander Sport SE" [ref=e577] [cursor=pointer]:
                    - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
                  - generic [ref=e578]: "2018"
                - generic [ref=e579]:
                  - text: თბილისი
                  - generic [ref=e583]: · 63 დღის წინ
              - list [ref=e584]:
                - listitem [ref=e585]:
                  - generic [ref=e589]: ბენზინი
                - listitem [ref=e590]:
                  - generic [ref=e595]: ვარიატორი
                - listitem [ref=e596]:
                  - generic [ref=e601]: 144,000 კმ
            - generic [ref=e602]:
              - generic [ref=e603]:
                - generic [ref=e604]: ეძებს
                - paragraph [ref=e609]: ნებისმიერ შეთავაზებაზე
              - paragraph [ref=e610]:
                - generic [ref=e616]: სხვაობა შეთანხმებით
              - generic [ref=e617]:
                - button "შესთავაზე გაცვლა" [ref=e618] [cursor=pointer]
                - link "დეტალურად" [ref=e624] [cursor=pointer]:
                  - /url: /vehicle?id=1d495364-2949-4ea8-a680-49133fc97a95
          - article [ref=e625]:
            - generic [ref=e626]:
              - link "Hyundai Sonata Limited 4dr Sedan Automatic დეტალურად" [ref=e627] [cursor=pointer]:
                - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
                - img "Hyundai Sonata Limited 4dr Sedan Automatic" [ref=e628]
              - button "Hyundai Sonata Limited 4dr Sedan Automatic შენახვა" [ref=e629] [cursor=pointer]
            - generic [ref=e632]:
              - generic [ref=e633]:
                - heading "Hyundai Sonata Limited 4dr Sedan Automatic 2013" [level=3] [ref=e634]:
                  - link "Hyundai Sonata Limited 4dr Sedan Automatic" [ref=e635] [cursor=pointer]:
                    - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
                  - generic [ref=e636]: "2013"
                - generic [ref=e637]:
                  - text: თბილისი
                  - generic [ref=e641]: · 63 დღის წინ
              - list [ref=e642]:
                - listitem [ref=e643]:
                  - generic [ref=e647]: ბენზინი
                - listitem [ref=e648]:
                  - generic [ref=e653]: ავტომატიკა
                - listitem [ref=e654]:
                  - generic [ref=e659]: 182,400 კმ
            - generic [ref=e660]:
              - generic [ref=e661]:
                - generic [ref=e662]: ეძებს
                - paragraph [ref=e667]: ნებისმიერ შეთავაზებაზე
              - paragraph [ref=e668]:
                - generic [ref=e674]: სხვაობა შეთანხმებით
              - generic [ref=e675]:
                - button "შესთავაზე გაცვლა" [ref=e676] [cursor=pointer]
                - link "დეტალურად" [ref=e682] [cursor=pointer]:
                  - /url: /vehicle?id=58fa778c-2bdb-45b5-ab7d-53c12b207107
          - article [ref=e683]:
            - generic [ref=e684]:
              - link "BMW X3 xDrive28i 4dr All-wheel Drive დეტალურად" [ref=e685] [cursor=pointer]:
                - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
                - img "BMW X3 xDrive28i 4dr All-wheel Drive" [ref=e686]
              - button "BMW X3 xDrive28i 4dr All-wheel Drive შენახვა" [ref=e687] [cursor=pointer]
            - generic [ref=e690]:
              - generic [ref=e691]:
                - heading "BMW X3 xDrive28i 4dr All-wheel Drive 2012" [level=3] [ref=e692]:
                  - link "BMW X3 xDrive28i 4dr All-wheel Drive" [ref=e693] [cursor=pointer]:
                    - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
                  - generic [ref=e694]: "2012"
                - generic [ref=e695]:
                  - text: თბილისი
                  - generic [ref=e699]: · 63 დღის წინ
              - list [ref=e700]:
                - listitem [ref=e701]:
                  - generic [ref=e705]: ბენზინი
                - listitem [ref=e706]:
                  - generic [ref=e711]: ავტომატიკა
                - listitem [ref=e712]:
                  - generic [ref=e717]: 201,000 კმ
            - generic [ref=e718]:
              - generic [ref=e719]:
                - generic [ref=e720]: ეძებს
                - paragraph [ref=e725]: ნებისმიერ შეთავაზებაზე
              - paragraph [ref=e726]:
                - generic [ref=e732]: სხვაობა შეთანხმებით
              - generic [ref=e733]:
                - button "შესთავაზე გაცვლა" [ref=e734] [cursor=pointer]
                - link "დეტალურად" [ref=e740] [cursor=pointer]:
                  - /url: /vehicle?id=5ffedcea-150e-4dcb-a36a-37c434b8290e
          - article [ref=e741]:
            - generic [ref=e742]:
              - link "Mercedes-Benz GLK 350 დეტალურად" [ref=e743] [cursor=pointer]:
                - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
                - img "Mercedes-Benz GLK 350" [ref=e744]
              - button "Mercedes-Benz GLK 350 შენახვა" [ref=e745] [cursor=pointer]
            - generic [ref=e748]:
              - generic [ref=e749]:
                - heading "Mercedes-Benz GLK 350 2009" [level=3] [ref=e750]:
                  - link "Mercedes-Benz GLK 350" [ref=e751] [cursor=pointer]:
                    - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
                  - generic [ref=e752]: "2009"
                - generic [ref=e753]:
                  - text: თბილისი
                  - generic [ref=e757]: · 63 დღის წინ
              - list [ref=e758]:
                - listitem [ref=e759]:
                  - generic [ref=e763]: ბენზინი
                - listitem [ref=e764]:
                  - generic [ref=e769]: ავტომატიკა
                - listitem [ref=e770]:
                  - generic [ref=e775]: 100,000 კმ
            - generic [ref=e776]:
              - generic [ref=e777]:
                - generic [ref=e778]: ეძებს
                - paragraph [ref=e783]: ნებისმიერ შეთავაზებაზე
              - paragraph [ref=e784]:
                - generic [ref=e790]: სხვაობა შეთანხმებით
              - generic [ref=e791]:
                - button "შესთავაზე გაცვლა" [ref=e792] [cursor=pointer]
                - link "დეტალურად" [ref=e798] [cursor=pointer]:
                  - /url: /vehicle?id=90ecb92c-e7db-4f74-80fa-b312869c8ee9
          - article [ref=e799]:
            - generic [ref=e800]:
              - link "Toyota Camry SE 4dr Sedan Automatic დეტალურად" [ref=e801] [cursor=pointer]:
                - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
                - img "Toyota Camry SE 4dr Sedan Automatic" [ref=e802]
              - button "Toyota Camry SE 4dr Sedan Automatic შენახვა" [ref=e803] [cursor=pointer]
            - generic [ref=e806]:
              - generic [ref=e807]:
                - heading "Toyota Camry SE 4dr Sedan Automatic 2018" [level=3] [ref=e808]:
                  - link "Toyota Camry SE 4dr Sedan Automatic" [ref=e809] [cursor=pointer]:
                    - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
                  - generic [ref=e810]: "2018"
                - generic [ref=e811]:
                  - text: თბილისი
                  - generic [ref=e815]: · 63 დღის წინ
              - list [ref=e816]:
                - listitem [ref=e817]:
                  - generic [ref=e821]: ბენზინი
                - listitem [ref=e822]:
                  - generic [ref=e827]: ტიპტრონიკი
                - listitem [ref=e828]:
                  - generic [ref=e833]: 211,000 კმ
            - generic [ref=e834]:
              - generic [ref=e835]:
                - generic [ref=e836]: ეძებს
                - paragraph [ref=e841]: ნებისმიერ შეთავაზებაზე
              - paragraph [ref=e842]:
                - generic [ref=e848]: სხვაობა შეთანხმებით
              - generic [ref=e849]:
                - button "შესთავაზე გაცვლა" [ref=e850] [cursor=pointer]
                - link "დეტალურად" [ref=e856] [cursor=pointer]:
                  - /url: /vehicle?id=592c31c2-97c1-4dd4-a225-bf006a7b2e23
  - contentinfo [ref=e857]:
    - generic [ref=e858]:
      - generic [ref=e859]:
        - generic [ref=e860]: autoswap
        - paragraph [ref=e868]: რეალური გაცვლები რეალურ მფლობელებს შორის.
      - navigation "ფუტერის ნავიგაცია" [ref=e869]:
        - link "გაცვლები" [ref=e870] [cursor=pointer]:
          - /url: /cars
        - link "•განცხადების დამატება" [ref=e871] [cursor=pointer]:
          - /url: /sell
        - link "•ჩვენ შესახებ" [ref=e872] [cursor=pointer]:
          - /url: /about
        - link "•წესები" [ref=e873] [cursor=pointer]:
          - /url: /terms
        - link "•კონფიდენციალურობა" [ref=e874] [cursor=pointer]:
          - /url: /privacy
        - link "•კონტაქტი" [ref=e875] [cursor=pointer]:
          - /url: /about#contact
    - generic [ref=e876]: © 2026 AutoSwap · ყველა უფლება დაცულია
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
> 79  |       await expect(page.getByRole('link', { name: /დაამატე მანქანა/i })).toBeVisible();
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
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
  174 |       await expect(page).toHaveURL(/\/account/);
  175 |       await expect(page.locator('body')).toContainText(/პროფილი|account|შეთავაზებ/i);
  176 | 
  177 |       await gotoAndWait(page, ROUTES.offers);
  178 |       await expect(page).toHaveURL(/tab=offers/);
  179 |       await expect(page.locator('body')).toContainText(/შეთავაზებ|offers/i);
```