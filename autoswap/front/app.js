/* AutoSwap — landing page.
   Shared chrome, helpers and the Supabase read path live in shared.js
   (window.AutoSwap). This file renders the landing and links into the
   cars product page (cars.html). */
const { assets, icons, Header, Footer } = window.AutoSwap;

const listings = [
  {
    id: 'bmw-530i',
    badge: 'TOP შეთავაზება',
    make: 'BMW',
    model: '530i',
    year: '2019',
    mileage: '90,000 კმ',
    fuel: 'ბენზინი',
    city: 'თბილისი',
    price: '62,000 ₾',
    wants: 'Audi A6 ან Mercedes E-Class',
    cash: 'ამატებს: +2,000 ₾',
    cashType: 'add',
    image: assets.bmw,
  },
  {
    id: 'audi-a6-2021',
    badge: 'ახალი',
    make: 'Audi',
    model: 'A6',
    year: '2021',
    mileage: '66,000 კმ',
    fuel: 'ბენზინი',
    city: 'თბილისი',
    price: '68,000 ₾',
    wants: 'BMW 5 Series ან Lexus ES',
    cash: 'თანხის გარეშე',
    cashType: 'none',
    image: assets.audi,
  },
  {
    id: 'bmw-540i',
    badge: 'მოწონებული',
    make: 'BMW',
    model: '540i',
    year: '2020',
    mileage: '82,000 კმ',
    fuel: 'ბენზინი',
    city: 'ბათუმი',
    price: '74,500 ₾',
    wants: 'Audi A7 ან Mercedes CLS',
    cash: 'ითხოვს: +3,500 ₾',
    cashType: 'ask',
    image: assets.bmw,
  },
  {
    id: 'audi-a6-2020',
    badge: 'ახალი',
    make: 'Audi',
    model: 'A6',
    year: '2021',
    mileage: '66,000 კმ',
    fuel: 'ბენზინი',
    city: 'ქუთაისი',
    price: '64,900 ₾',
    wants: 'BMW 530i ან Lexus ES',
    cash: 'ამატებს: +1,500 ₾',
    cashType: 'add',
    image: assets.audi,
  },
];

// The grid renders from this mutable list. It starts with the demo listings
// above and is replaced with live Supabase data once the feed loads.
let activeListings = listings.slice();

function Hero() {
  return `
    <section class="hero" id="home" aria-labelledby="hero-title">
      <div class="hero-backdrop" aria-hidden="true"></div>
      <div class="container hero-inner">
        <div class="hero-copy">
          <h1 id="hero-title">შეცვალე მანქანა გაყიდვის გარეშე</h1>
          <p>იპოვე შესაბამისი გაცვლა რეალურ მფლობელებთან და ნახე პირობები წინასწარ.</p>
        </div>

        <div class="swap-stage" aria-label="BMW და Audi გაცვლის შედარება">
          <div class="swap-label swap-label-left">
            <span>მე მყავს</span>
          </div>

          <article class="hero-car hero-car-left">
            <img src="${assets.bmw}" alt="BMW 530i" width="791" height="396" decoding="async" fetchpriority="high">
            <div class="hero-car-caption">
              <strong>BMW 530i</strong>
              <small>2019 · 90,000 კმ</small>
            </div>
          </article>

          <div class="swap-center" aria-hidden="true">
            <span class="swap-line"></span>
            <span class="swap-icon">${icons.swap}</span>
            <span class="swap-line"></span>
          </div>

          <article class="hero-car hero-car-right">
            <img src="${assets.porsche}" alt="Porsche 718 Spyder" width="817" height="396" decoding="async" fetchpriority="high" onerror="this.onerror=null;this.src='${assets.audi}';">
            <div class="hero-car-caption">
              <strong>Porsche 718 Spyder</strong>
              <small>2023 · 12,000 კმ</small>
            </div>
          </article>

          <div class="swap-label swap-label-right">
            <span>მე მინდა</span>
          </div>
        </div>

        ${SearchBar()}
      </div>
    </section>
  `;
}

function SearchBar() {
  return `
    <form class="search-bar swap-search" id="search-form" action="cars.html" method="get" aria-label="გაცვლის ძებნა">
      <div class="swap-search-top">
        <label class="search-field">
          <span>${icons.car}</span>
          <input name="have" type="text" placeholder="რა მანქანა გყავს?" autocomplete="off">
        </label>
        <span class="swap-search-icon" aria-hidden="true">${icons.swap}</span>
        <label class="search-field">
          <span>${icons.search}</span>
          <input name="want" type="search" placeholder="რას ეძებ?" autocomplete="off">
        </label>
      </div>
      <div class="swap-search-bottom">
        <div class="search-slider">
          <div class="slider-track">
            <span class="slider-end">ითხოვს</span>
            <input name="cashSlider" class="cash-slider" type="range" min="-5000" max="5000" step="500" value="0" aria-label="თანხის სხვაობა">
            <span class="slider-end">ამატებს</span>
          </div>
          <span class="slider-value" id="slider-value">თანხის გარეშე</span>
        </div>
        <label class="search-field">
          <span>${icons.location}</span>
          <select name="city">
            <option value="">ყველა ქალაქი</option>
            <option value="თბილისი">თბილისი</option>
            <option value="ბათუმი">ბათუმი</option>
            <option value="ქუთაისი">ქუთაისი</option>
          </select>
        </label>
        <button class="btn btn-accent search-submit" type="submit">შესაბამისი გაცვლების ნახვა</button>
      </div>
    </form>
  `;
}

function ListingCard(car) {
  const detailHref = `vehicle.html?id=${encodeURIComponent(car.id)}`;
  return `
    <article class="listing-card" data-id="${car.id}">
      <div class="listing-media">
        <button class="save-btn" type="button" aria-label="${car.make} ${car.model} შენახვა">${icons.heart}</button>
        <a class="listing-media-link" href="${detailHref}" aria-label="${car.make} ${car.model} დეტალურად">
          <img src="${car.image}" alt="${car.make} ${car.model}" loading="lazy">
        </a>
      </div>
      <div class="listing-body">
        <div>
          <h3><a class="card-title-link" href="${detailHref}">${car.make} ${car.model}</a></h3>
          <p>${car.year} · ${car.mileage} · ${car.fuel}</p>
          <span class="listing-city">${icons.location}${car.city}</span>
        </div>
        <div class="wanted-line">
          <span class="wanted-label">ეძებს</span>
          <div class="wanted-main">
            <span class="wanted-icon">${icons.swap}</span>
            <strong>${car.wants}</strong>
          </div>
        </div>
        <div class="cash-line cash-${car.cashType || 'none'}">
          <strong>${car.cashType === 'none' ? 'თანხის გარეშე' : car.cash}</strong>
        </div>
        <div class="listing-foot">
          <button class="btn btn-secondary listing-offer" type="button" data-offer data-id="${car.id}" data-make="${car.make}" data-model="${car.model}">შესთავაზე გაცვლა</button>
        </div>
      </div>
    </article>
  `;
}

function ListingsSection(cars = activeListings) {
  return `
    <section class="listings-section" id="listings" aria-labelledby="listings-title">
      <div class="container">
        <div class="section-head">
          <div>
            <p class="section-kicker">01 / ახალი შეთავაზებები</p>
            <h2 id="listings-title">რეალური ავტომობილები გაცვლისთვის</h2>
          </div>
          <a class="text-link" href="cars.html">ყველა ავტომობილის ნახვა ${icons.arrowRight}</a>
        </div>
        <div class="listing-grid" id="listing-grid">
          ${cars.map(ListingCard).join('')}
        </div>
      </div>
    </section>
  `;
}

function ProcessSection() {
  const steps = [
    { icon: icons.car, title: 'დაამატე შენი ავტომობილი', text: 'აღწერე მანქანა, გარბენი, ფასი და სასურველი გაცვლა.' },
    { icon: icons.swap, title: 'იპოვე შესაბამისი გაცვლა', text: 'ნახე რას ეძებენ მფლობელები და რა თანხის სხვაობაა.' },
    { icon: icons.message, title: 'გაგზავნე შეთავაზება', text: 'შესთავაზე შენი მანქანა და შეთანხმდი პირდაპირ მფლობელთან.' },
  ];

  return `
    <section class="process-section" id="sections" aria-labelledby="process-title">
      <div class="container split-section">
        <div>
          <p class="section-kicker">02 / როგორ მუშაობს</p>
          <h2 id="process-title">გაცვლა რამდენიმე მკაფიო ნაბიჯად</h2>
        </div>
        <div class="process-grid">
          ${steps.map((step, index) => `
            <article class="process-card">
              <span class="process-icon">${step.icon}</span>
              <span class="step-index">${index + 1}</span>
              <h3>${step.title}</h3>
              <p>${step.text}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function BenefitsSection() {
  const benefits = [
    { icon: icons.shield, title: 'რეალური მფლობელები', text: 'გაცვლის შეთავაზებები მოდის ადამიანებისგან, რომლებიც მართლაც ეძებენ ახალ მანქანას.' },
    { icon: icons.medal, title: 'პირობები წინასწარ ჩანს', text: 'რას ეძებს მფლობელი და რა თანხის სხვაობაა, ბარათზევე ჩანს.' },
    { icon: icons.headset, title: 'ნაკლები შემთხვევითი ზარი', text: 'შეთავაზება უფრო ორგანიზებულია, ვიდრე ჩვეულებრივი განცხადებების ბაზარზე.' },
  ];

  return `
    <section class="benefits-section" aria-labelledby="benefits-title">
      <div class="container">
        <div class="section-head compact">
          <div>
            <p class="section-kicker">03 / რატომ <span class="brandcase">AutoSwap</span>?</p>
            <h2 id="benefits-title">ნაკლები ხმაური, მეტი ნდობა</h2>
          </div>
        </div>
        <div class="benefits-grid">
          ${benefits.map((item) => `
            <article class="benefit-card">
              <span>${item.icon}</span>
              <h3>${item.title}</h3>
              <p>${item.text}</p>
            </article>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function CTASection() {
  return `
    <section class="cta-section" aria-labelledby="cta-title">
      <div class="container cta-panel">
        <div>
          <h2 id="cta-title">მზად ხარ შემდეგი მანქანის შესაცვლელად?</h2>
          <p>შექმენი განცხადება და იპოვე გაცვლა, რომელიც რეალურად შეესაბამება შენს ავტომობილს.</p>
        </div>
        <div class="cta-actions">
          <a class="btn btn-light" href="cars.html">შეთავაზებების ნახვა</a>
          <a class="btn btn-accent" href="sell.html">ჩემი მანქანის დამატება</a>
        </div>
      </div>
    </section>
  `;
}

function renderListingGrid(cars) {
  const grid = document.querySelector('#listing-grid');
  if (!grid) return;

  grid.innerHTML = cars.length
    ? cars.map(ListingCard).join('')
    : '<p class="empty-state">ამ ფილტრებით შეთავაზება ვერ მოიძებნა.</p>';
}

function bindInteractions() {
  const form = document.querySelector('#search-form');
  const slider = document.querySelector('.cash-slider');
  const sliderValue = document.querySelector('#slider-value');

  const formatDiff = (raw) => {
    const value = Number(raw) || 0;
    if (value > 0) return `ვამატებ: +${value.toLocaleString('en-US')} ₾`;
    if (value < 0) return `ვითხოვ: ${Math.abs(value).toLocaleString('en-US')} ₾`;
    return 'თანხის გარეშე';
  };

  slider?.addEventListener('input', () => {
    if (sliderValue) sliderValue.textContent = formatDiff(slider.value);
  });

  // The hero search links into the product page (cars.html), translating the
  // swap intent (have / want / cash slider / city) into feed filters.
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const want = String(data.get('want') || '').trim();
    const have = String(data.get('have') || '').trim();
    const city = String(data.get('city') || '').trim();
    const diff = Number(data.get('cashSlider')) || 0;
    if (want) params.set('query', want);
    if (have) params.set('have', have);
    if (city) params.set('city', city);
    if (diff > 0) params.set('cash', 'add');
    else if (diff < 0) params.set('cash', 'ask');
    const qs = params.toString();
    window.location.href = qs ? `cars.html?${qs}` : 'cars.html';
  });
  // Save (heart) toggle is a single global listener in shared.js.
}

function App() {
  return `
    ${Header({ active: 'listings' })}
    <main>
      ${Hero()}
      ${ListingsSection()}
      ${ProcessSection()}
      ${BenefitsSection()}
      ${CTASection()}
    </main>
    ${Footer()}
  `;
}

// Replaces the demo grid with the live public_vehicle_feed when Supabase is
// configured; otherwise the demo listings above stay on screen.
async function hydrateFromSupabase() {
  const mapped = await window.AutoSwap.fetchFeed();
  if (mapped !== null) {
    activeListings = mapped;
    renderListingGrid(activeListings);
  }
}

document.querySelector('#app').innerHTML = App();
bindInteractions();
hydrateFromSupabase();
