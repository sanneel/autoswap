
const { assets, icons, Header, Footer, DEMO_CARS, escapeAttr } = window.AutoSwap;
// Short alias — every user-controlled string rendered into innerHTML goes
// through this. Escapes & < > " so listing data can't inject markup.
const esc = escapeAttr;

// Monochrome brand marks — recognizable by silhouette, tinted with the
// chip's own color so they stay quiet until hover (one-accent rule).
const brandLogos = {
  BMW: `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><circle cx="24" cy="24" r="13"/><path d="M24 11v26M11 24h26"/></svg>`,
  'Mercedes-Benz': `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2.4"/><g stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M24 24V6"/><path d="M24 24 8.4 33"/><path d="M24 24 39.6 33"/></g></svg>`,
  Audi: `<svg viewBox="0 0 76 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="15" cy="24" r="11"/><circle cx="30" cy="24" r="11"/><circle cx="45" cy="24" r="11"/><circle cx="60" cy="24" r="11"/></g></svg>`,
  Toyota: `<svg viewBox="0 0 60 48" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2.4"><ellipse cx="30" cy="24" rx="26" ry="15"/><ellipse cx="30" cy="17" rx="8.5" ry="6"/><ellipse cx="30" cy="27.5" rx="15" ry="9.5"/></g></svg>`,
  Volkswagen: `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M13 14l5 12 3-7 3 7 3-7 3 7 5-12" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  Hyundai: `<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="24" rx="21" ry="14" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M15 30c2-7 16-7 18 0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`,
  Lexus: `<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="24" rx="21" ry="15" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M24 12 12 33h9" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/></svg>`,
};

const legacyListings = [
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

const listings = DEMO_CARS.slice(0, 4);



let activeListings = listings.slice();

function Hero() {
  return `
    <section class="hero hero--garage" id="home" aria-labelledby="hero-title">
      <div class="hero-backdrop" aria-hidden="true"></div>
      <div class="container hero-inner">
        <div class="hero-copy">
          <h1 id="hero-title">მანქანები გაცვლისთვის</h1>
          <p>აირჩიე მანქანა, ნახე პირობები და გაგზავნე შეთავაზება.</p>
        </div>

        <div class="swap-stage" aria-label="BMW და Audi გაცვლის შედარება">
          <div class="swap-label swap-label-left">
            <span>მე მყავს</span>
          </div>

          <article class="hero-car hero-car-left">
            <img src="${assets.bmw}" alt="BMW 530i" width="791" height="396" decoding="async" fetchpriority="high">
            <button class="sound-btn" type="button" data-rev="bmw" aria-label="BMW 530i ძრავის ხმა">${icons.sound}</button>
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
            <img src="${assets.porsche}" alt="Porsche 718 Spyder" width="817" height="396" decoding="async" fetchpriority="high" data-fallback="${assets.audi}">
            <button class="sound-btn" type="button" data-rev="porsche" aria-label="Porsche 718 Spyder ძრავის ხმა">${icons.sound}</button>
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
    <form class="garage-search" id="search-form" action="cars.html" method="get" aria-label="გაცვლის ძებნა">
      <div class="swap-search-top">
        <label class="search-field">
          <span>${icons.car}</span>
          <input name="have" type="text" placeholder="რა მანქანა გყავს?" autocomplete="off" list="have-suggest">
          <datalist id="have-suggest"></datalist>
        </label>
        <span class="swap-search-icon" aria-hidden="true">${icons.swap}</span>
        <label class="search-field">
          <span>${icons.search}</span>
          <input name="want" type="search" placeholder="რას ეძებ?" autocomplete="off" list="want-suggest">
          <datalist id="want-suggest"></datalist>
        </label>
      </div>
      <div class="swap-search-bottom">
        <label class="search-field">
          <span>${icons.location}</span>
          <select name="city">
            <option value="">ყველა ქალაქი</option>
            <option value="თბილისი">თბილისი</option>
            <option value="ბათუმი">ბათუმი</option>
            <option value="ქუთაისი">ქუთაისი</option>
          </select>
        </label>
        <input name="cashSlider" class="cash-slider garage-cash-slider" type="range" min="-5000" max="5000" step="500" value="0" aria-label="თანხის სხვაობა">
        <span class="slider-value garage-slider-value" id="slider-value">თანხის გარეშე</span>
        <button class="btn btn-primary btn-liquid search-submit" type="submit">${icons.search} ძებნა</button>
      </div>
    </form>
  `;
}

const CASH_ICONS = { add: icons.trendUp, ask: icons.trendDown, flexible: icons.swap, none: icons.equals };



const LANDING_CARD_COUNT = 4;
const landingCards = (cars) => cars.slice(0, LANDING_CARD_COUNT).map(ListingCard).join('');

// Hero search typeahead: contains-match against the car catalog
// (Supabase car_makes/car_models with ilike, bundled fallback offline).
// Typing "bmw 530" offers "BMW 530i", "BMW 530d", ...
let heroMakesPromise = null;
function heroMakes() {
  if (!heroMakesPromise) {
    heroMakesPromise = window.AutoSwap.searchMakes('', 500).catch(() => []);
  }
  return heroMakesPromise;
}

async function heroSuggestions(term) {
  const query = String(term || '').trim();
  if (query.length < 2) return [];
  const [first, ...restTokens] = query.split(/\s+/);
  const rest = restTokens.join(' ');
  const makes = await heroMakes();
  const q = first.toLowerCase();
  const make = makes.find((m) => m.name.toLowerCase() === q)
    || makes.find((m) => m.name.toLowerCase().startsWith(q))
    || makes.find((m) => m.name.toLowerCase().includes(q));

  if (make) {
    const models = await window.AutoSwap.searchModels(rest, make.id, 10).catch(() => []);
    const rows = models.length ? models : await window.AutoSwap.searchModels('', make.id, 10).catch(() => []);
    return rows.map((m) => `${make.name} ${m.name}`);
  }

  // No make hit: the term itself may be a model ("530", "camry").
  const byName = new Map(makes.map((m) => [String(m.id), m.name]));
  const models = await window.AutoSwap.searchModels(query, null, 10).catch(() => []);
  return models
    .map((m) => `${byName.get(String(m.make_id)) || ''} ${m.name}`.trim())
    .filter(Boolean);
}

function bindHeroSuggest(input, listId) {
  const list = document.querySelector(`#${listId}`);
  if (!input || !list) return;
  let timer = null;
  let seq = 0;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const stamp = ++seq;
    timer = setTimeout(async () => {
      const items = await heroSuggestions(input.value);
      if (stamp !== seq) return; // a newer keystroke won
      list.innerHTML = items
        .map((label) => `<option value="${window.AutoSwap.escapeAttr(label)}"></option>`)
        .join('');
    }, 150);
  });
}



const TITLE_MAX_CHARS = 26;
function trimTitle(title) {
  if (title.length <= TITLE_MAX_CHARS) return title;
  const cut = title.slice(0, TITLE_MAX_CHARS);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 8 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function ListingCard(car) {
  const detailHref = `vehicle.html?id=${encodeURIComponent(car.id)}`;
  const name = esc(`${car.make} ${car.model}`);
  const title = esc(trimTitle(`${car.make} ${car.model}`));
  const wants = car.openToOffers ? '' : esc(car.wants);
  const meta = esc([car.year, car.mileage, car.fuel].filter(Boolean).join(' · '));
  return `
    <article class="listing-card" data-id="${esc(car.id)}">
      <div class="listing-media">
        <button class="save-btn" type="button" aria-label="${name} შენახვა">${icons.heart}</button>
        <a class="listing-media-link" href="${detailHref}" aria-label="${name} დეტალურად">
          <img src="${esc(car.image)}" alt="${name}" loading="lazy">
        </a>
      </div>
      <div class="listing-body">
        <div>
          <h3><a class="card-title-link" href="${detailHref}" title="${name}">${title}</a></h3>
          <p>${meta}</p>
          <span class="listing-city">${icons.location}${esc(car.city)}</span>
        </div>
        ${wants ? `
        <p class="listing-wants"><span class="wanted-label">${icons.search}<b>ეძებს</b></span>${wants}</p>` : ''}
        <p class="trade-cash trade-cash--${esc(car.cashType || 'none')}">${CASH_ICONS[car.cashType] || icons.equals}<span>${car.cashType === 'none' ? 'თანაბარი გაცვლა' : esc(car.cash)}</span></p>
        <div class="listing-foot">
          <button class="btn btn-accent listing-offer" type="button" data-offer data-id="${esc(car.id)}" data-make="${esc(car.make)}" data-model="${esc(car.model)}">შეთავაზება</button>
        </div>
      </div>
    </article>
  `;
}

function FeaturedSwap(car) {
  const detailHref = `vehicle.html?id=${encodeURIComponent(car.id)}`;
  const name = esc(`${car.make} ${car.model}`);
  const meta = esc([car.year, car.mileage, car.fuel].filter(Boolean).join(' · '));
  const wants = car.openToOffers ? 'ღიაა შეთავაზებებზე' : esc(car.wants);
  return `
    <article class="featured-swap" data-id="${esc(car.id)}">
      <a class="featured-media" href="${detailHref}" aria-label="${name} დეტალურად">
        <img src="${esc(car.image)}" alt="${name}" loading="lazy">
        <span class="featured-flag">დღის გაცვლა</span>
      </a>
      <div class="featured-body">
        <h3><a class="card-title-link" href="${detailHref}">${name}</a></h3>
        <p class="featured-meta">${meta}</p>
        <span class="listing-city">${icons.location}${esc(car.city)}</span>
        <p class="featured-wants"><b>ეძებს:</b> ${wants}</p>
        <p class="trade-cash trade-cash--${esc(car.cashType || 'none')}">${CASH_ICONS[car.cashType] || icons.equals}<span>${car.cashType === 'none' ? 'თანაბარი გაცვლა' : esc(car.cash)}</span></p>
      </div>
      <div class="featured-aside">
        <button class="btn btn-accent btn-liquid" type="button" data-offer data-id="${esc(car.id)}" data-make="${esc(car.make)}" data-model="${esc(car.model)}">${icons.swap}<span>შესთავაზე გაცვლა</span></button>
        <a class="btn btn-secondary" href="${detailHref}">დეტალურად</a>
      </div>
    </article>
  `;
}

function LandingListings(cars) {
  if (!cars.length) return '<p class="empty-state">ამ ფილტრებით შეთავაზება ვერ მოიძებნა.</p>';
  const [first, ...rest] = cars;
  return `
    ${FeaturedSwap(first)}
    <div class="listing-grid listing-grid--trio">
      ${rest.slice(0, 3).map(ListingCard).join('')}
    </div>
  `;
}

function ListingsSection(cars = activeListings) {
  return `
    <section class="listings-section" id="listings" aria-labelledby="listings-title">
      <div class="container">
        <div class="section-head">
          <div>
            <h2 id="listings-title">იცვლება</h2>
          </div>
          <a class="text-link" href="cars.html">ყველა განცხადება ${icons.arrowRight}</a>
        </div>
        <div id="landing-listings">
          ${LandingListings(cars)}
        </div>
      </div>
    </section>
  `;
}

function ClosingStrip() {
  return `
    <section class="closing-strip">
      <div class="container closing-strip-inner">
        <p>შენი მანქანა შეიძლება უკვე ვიღაცას უნდა — განცხადება ორ წუთში ემატება.</p>
        <a class="btn btn-accent btn-liquid" href="sell.html">${icons.plus}<span>დაამატე მანქანა</span></a>
      </div>
    </section>
  `;
}

function BrowseStrip() {
  const countByMake = (make) => DEMO_CARS.filter((car) => car.make === make).length;
  // Brands shown as logos; only render a make that actually has listings.
  const brands = [
    { make: 'BMW' },
    { make: 'Mercedes-Benz', label: 'Mercedes' },
    { make: 'Audi' },
    { make: 'Toyota' },
    { make: 'Volkswagen', label: 'VW' },
    { make: 'Hyundai' },
    { make: 'Lexus' },
  ].filter((b) => countByMake(b.make) > 0).slice(0, 5);

  const filters = [
    { label: 'სედანი', href: 'cars.html?category=sedan', meta: `${DEMO_CARS.filter((car) => car.category === 'sedan').length} განცხადება` },
    { label: 'ქროსოვერი', href: 'cars.html?category=crossover', meta: `${DEMO_CARS.filter((car) => car.category === 'crossover').length} განცხადება` },
    { label: 'თანხის გარეშე', href: 'cars.html?cash=none', meta: `${DEMO_CARS.filter((car) => car.cashType === 'none').length} განცხადება` },
  ];

  return `
    <section class="browse-strip browse-strip--garage" aria-label="დაათვალიერე მარკის მიხედვით">
      <div class="container browse-strip-inner">
        <a class="brand-chip brand-chip--all" href="cars.html">
          <strong>ყველა</strong>
          <small>${DEMO_CARS.length} განცხადება</small>
        </a>
        <button class="rail-arrow rail-arrow--prev" type="button" data-rail-prev aria-label="წინა">${icons.arrowRight}</button>
        <div class="browse-pills" data-drag-scroll>
          ${brands.map((brand) => `
            <a class="brand-chip" href="cars.html?make=${encodeURIComponent(brand.make)}" aria-label="${brand.label || brand.make} — გაცვლები">
              <span class="brand-mark">${brandLogos[brand.make] || icons.car}</span>
              <span class="brand-chip-text">
                <strong>${brand.label || brand.make}</strong>
                <small>${countByMake(brand.make)} მანქანა</small>
              </span>
            </a>
          `).join('')}
          <span class="brand-chip-sep" aria-hidden="true"></span>
          ${filters.map((route) => `
            <a class="browse-pill" href="${route.href}">
              <span>${route.label}</span>
              <small>${route.meta}</small>
            </a>
          `).join('')}
        </div>
        <button class="rail-arrow" type="button" data-rail-next aria-label="შემდეგი">${icons.arrowRight}</button>
      </div>
    </section>
  `;
}

function renderListingGrid(cars) {
  const wrap = document.querySelector('#landing-listings');
  if (!wrap) return;
  wrap.innerHTML = LandingListings(cars);
}

function bindDragRails(root = document) {
  root.querySelectorAll('[data-drag-scroll]').forEach((rail) => {
    let active = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    rail.addEventListener('pointerdown', (event) => {
      active = true;
      moved = false;
      startX = event.clientX;
      startLeft = rail.scrollLeft;
      rail.classList.add('is-dragging');
      rail.setPointerCapture?.(event.pointerId);
    });

    rail.addEventListener('pointermove', (event) => {
      if (!active) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 4) moved = true;
      rail.scrollLeft = startLeft - delta;
    });

    const stop = (event) => {
      if (!active) return;
      active = false;
      rail.classList.remove('is-dragging');
      rail.releasePointerCapture?.(event.pointerId);
      if (moved) {
        rail.dataset.dragged = '1';
        window.setTimeout(() => delete rail.dataset.dragged, 0);
      }
    };

    rail.addEventListener('pointerup', stop);
    rail.addEventListener('pointercancel', stop);
    rail.addEventListener('click', (event) => {
      if (!rail.dataset.dragged) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  });

  root.querySelectorAll('[data-rail-prev], [data-rail-next]').forEach((button) => {
    button.addEventListener('click', () => {
      const rail = button.parentElement?.querySelector('[data-drag-scroll]');
      if (!rail) return;
      const direction = button.hasAttribute('data-rail-prev') ? -1 : 1;
      rail.scrollBy({ left: direction * Math.max(220, rail.clientWidth * 0.7), behavior: 'smooth' });
    });
  });
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

  bindHeroSuggest(form?.querySelector('[name="have"]'), 'have-suggest');
  bindHeroSuggest(form?.querySelector('[name="want"]'), 'want-suggest');

  // Image fallback wired in JS (not an inline onerror handler) so the strict
  // CSP can keep script-src free of 'unsafe-inline'.
  document.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener('error', function onError() {
      img.removeEventListener('error', onError);
      img.src = img.dataset.fallback;
    });
  });


  let revAudio = null;
  let activeRevBtn = null;

  const stopRev = () => {
    revAudio?.pause();
    revAudio = null;
    activeRevBtn?.classList.remove('is-playing');
    activeRevBtn = null;
  };

  document.querySelectorAll('.sound-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const wasActive = activeRevBtn === btn;
      stopRev();
      if (wasActive) return;
      const src = assets.revs[btn.dataset.rev];
      if (!src) return;
      const audio = new Audio(src);
      audio.addEventListener('ended', stopRev);
      revAudio = audio;
      activeRevBtn = btn;
      btn.classList.add('is-playing');
      audio.play().catch(stopRev);
    });
  });



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

  bindDragRails();
}

function App() {
  return `
    ${Header()}
    <main class="home-main">
      ${Hero()}
      ${BrowseStrip()}
      ${ListingsSection()}
      ${ClosingStrip()}
    </main>
    ${Footer()}
  `;
}

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
