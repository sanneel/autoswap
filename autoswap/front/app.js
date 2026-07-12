
const { assets, icons, Header, Footer, DEMO_CARS, escapeAttr, getCurrency, getUsdRate, onCurrencyChange } = window.AutoSwap;

// Hero cash slider range depends on the display currency.
function heroSliderCfg() {
  return getCurrency() === 'USD'
    ? { max: 10000, step: 500, sym: '$' }
    : { max: 25000, step: 1000, sym: '₾' };
}
function formatSliderDiff(raw) {
  const value = Number(raw) || 0;
  const sym = getCurrency() === 'USD' ? '$' : '₾';
  const amount = Math.abs(value).toLocaleString('en-US');
  if (value > 0) return `ვამატებ ${sym}${amount}`;
  if (value < 0) return `ვითხოვ ${sym}${amount}`;
  return 'თანხის გარეშე';
}
// Short alias, every user-controlled string rendered into innerHTML goes
// through this. Escapes & < > " so listing data can't inject markup.
const esc = escapeAttr;

// Real brand logos (self-hosted from the MIT-licensed car-logos-dataset,
// under assets/logos/<slug>.png). BRAND_SLUGS maps a make name to its file.
const BRAND_SLUGS = {
  BMW: 'bmw', 'Mercedes-Benz': 'mercedes-benz', Audi: 'audi', Toyota: 'toyota',
  Volkswagen: 'volkswagen', Hyundai: 'hyundai', Lexus: 'lexus', Kia: 'kia',
  Honda: 'honda', Ford: 'ford', Nissan: 'nissan', Chevrolet: 'chevrolet',
  Volvo: 'volvo', Mazda: 'mazda', Subaru: 'subaru', Mitsubishi: 'mitsubishi',
  Jeep: 'jeep', Porsche: 'porsche', Opel: 'opel', Skoda: 'skoda',
  Renault: 'renault', Peugeot: 'peugeot',
};

function hasBrandLogo(make) {
  return Boolean(BRAND_SLUGS[make]);
}

function brandLogo(make) {
  const slug = BRAND_SLUGS[make];
  return slug
    ? `<img class="brand-logo-img" src="assets/logos/${slug}.png" alt="${esc(make)}" loading="lazy" width="34" height="34">`
    : icons.car;
}

const HERO_SEARCH_BRANDS = [
  'Alfa Romeo',
  'Audi',
  'BMW',
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Mercedes-Benz',
  'Toyota',
  'Volkswagen',
  'Hyundai',
  'Kia',
  'Lexus',
  'Honda',
  'Ford',
  'Nissan',
  'Mazda',
  'Porsche',
];

const BRAND_ALIASES = {
  alfa: 'Alfa Romeo',
  'alfa romeo': 'Alfa Romeo',
  alpha: 'Alfa Romeo',
  'alpha romeo': 'Alfa Romeo',
  benz: 'Mercedes-Benz',
  mercedes: 'Mercedes-Benz',
  'mercedes benz': 'Mercedes-Benz',
  vw: 'Volkswagen',
  volkswagen: 'Volkswagen',
  volks: 'Volkswagen',
  chevy: 'Chevrolet',
};

function normalizeBrandText(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function heroBrandNames() {
  return Array.from(new Set([
    ...HERO_SEARCH_BRANDS,
    ...DEMO_CARS.map((car) => car.make).filter(Boolean),
  ]));
}

function displayBrand(make) {
  if (make === 'Mercedes-Benz') return 'Mercedes';
  if (make === 'Volkswagen') return 'VW';
  return make;
}

function resolveMakeFromList(text, makes = heroBrandNames()) {
  const normalized = normalizeBrandText(text);
  if (!normalized) return '';
  const firstToken = normalized.split(' ')[0];
  if (BRAND_ALIASES[normalized]) return BRAND_ALIASES[normalized];
  if (BRAND_ALIASES[firstToken]) return BRAND_ALIASES[firstToken];

  const rows = makes.map((make) => ({
    make,
    key: normalizeBrandText(make),
    labelKey: normalizeBrandText(displayBrand(make)),
  }));
  const exact = rows.find((row) =>
    normalized === row.key
    || normalized === row.labelKey
    || normalized.startsWith(`${row.key} `)
    || normalized.startsWith(`${row.labelKey} `));
  if (exact) return exact.make;

  if (firstToken.length >= 3) {
    const prefixMatches = rows.filter((row) =>
      row.key.startsWith(firstToken) || row.labelKey.startsWith(firstToken));
    if (prefixMatches.length === 1) return prefixMatches[0].make;
  }
  return '';
}

async function resolveMakeFromText(text) {
  const local = resolveMakeFromList(text);
  if (local) return local;
  const firstToken = normalizeBrandText(text).split(' ')[0];
  if (!firstToken || firstToken.length < 2) return '';
  const catalog = await heroMakes();
  return resolveMakeFromList(text, catalog.map((make) => make.name));
}

function isMakeOnlySearch(text, make) {
  const normalized = normalizeBrandText(text);
  if (!normalized || !make) return false;
  const key = normalizeBrandText(make);
  const labelKey = normalizeBrandText(displayBrand(make));
  return normalized === key || normalized === labelKey || BRAND_ALIASES[normalized] === make;
}

function brandMatchesTerm(make, term) {
  const query = normalizeBrandText(term).split(' ')[0] || '';
  if (!query) return true;
  const key = normalizeBrandText(make);
  const labelKey = normalizeBrandText(displayBrand(make));
  return key.includes(query) || labelKey.includes(query);
}

// Suggestion rows for the searchable picker: makes first, then models as
// "Make Model" (myauto-style). Everything is contains-matched, so "530"
// finds "BMW 530i" and "bmw 5" narrows to the 5-series models.
async function brandPanelItems(term) {
  const query = String(term || '').trim();
  if (!query) {
    return heroBrandNames().map((make) => ({ group: 'make', make, label: displayBrand(make) }));
  }
  const catalog = await heroMakes();
  const merged = Array.from(new Set([
    ...heroBrandNames(),
    ...catalog.map((m) => m.name),
  ]));
  const names = merged;
  const makeItems = names
    .filter((name) => brandMatchesTerm(name, query))
    .slice(0, 6)
    .map((make) => ({ group: 'make', make, label: displayBrand(make) }));
  const modelItems = (await vehicleSuggestions(query).catch(() => []))
    .slice(0, 8)
    .map((item) => ({ group: 'model', make: item.make, label: item.label }));
  return [...makeItems, ...modelItems];
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function makeCandidateLabels(make) {
  const aliasLabels = Object.entries(BRAND_ALIASES)
    .filter(([, target]) => target === make)
    .map(([alias]) => alias);
  return Array.from(new Set([make, displayBrand(make), ...aliasLabels].filter(Boolean)))
    .sort((a, b) => b.length - a.length);
}

function stripResolvedMake(text, make) {
  const raw = String(text || '').trim();
  if (!raw || !make) return raw;
  for (const label of makeCandidateLabels(make)) {
    const parts = String(label).trim().split(/[\s-]+/).filter(Boolean).map(escapeRegExp);
    if (!parts.length) continue;
    const pattern = new RegExp(`^${parts.join('[\\s-]+')}[\\s-]*`, 'i');
    const next = raw.replace(pattern, '').trim();
    if (next !== raw) return next;
  }
  return raw;
}

async function vehicleFromSearchText(text) {
  const label = String(text || '').trim();
  if (!label) return null;
  const make = await resolveMakeFromText(label).catch(() => '');
  if (!make) return null;
  return { make, model: stripResolvedMake(label, make), label };
}

function myCarPayloadFromSearch(haveVehicle, wantLabel) {
  if (!haveVehicle || !haveVehicle.make) return null;
  return {
    make: haveVehicle.make,
    model: haveVehicle.model || '',
    wants: wantLabel ? [wantLabel] : [],
    source: 'hero-search',
  };
}
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
        <p class="hero-proof" id="hero-proof">${heroProofText(DEMO_CARS)}</p>
      </div>
    </section>
  `;
}

// Live marketplace numbers under the search bar, real counts only, no
// vanity metrics. Recomputed when the Supabase feed arrives.
function heroProofText(cars) {
  const active = cars.length;
  if (!active) return '';
  const cities = new Set(cars.map((car) => car.city).filter(Boolean)).size;
  const verified = cars.filter((car) => car.ownerVerified).length;
  const parts = [`${active} აქტიური განცხადება`];
  if (cities > 1) parts.push(`${cities} ქალაქი`);
  if (verified) parts.push(`${verified} დადასტურებული მფლობელი`);
  return parts.join(' · ');
}

function SearchBar() {
  return `
    <form class="garage-search" id="search-form" action="cars.html" method="get" aria-label="გაცვლის ძებნა">
      <div class="swap-search-top">
        <div class="search-field have-search-field" data-have-picker>
          <span>${icons.car}</span>
          <span class="brand-picker-selected-logo have-picker-selected-logo" data-have-selected-logo aria-hidden="true" hidden></span>
          <input name="have" data-have-input type="text" placeholder="რა მანქანა გყავს?" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="have-brand-list">
          <input name="haveMake" data-have-make type="hidden">
          <input name="haveModel" data-have-model type="hidden">
          <div class="brand-picker-panel" data-have-panel hidden>
            <div class="brand-picker-list" id="have-brand-list" role="listbox" aria-label="მარკები და მოდელები"></div>
          </div>
        </div>
        <span class="swap-search-icon" aria-hidden="true">${icons.swap}</span>
        <div class="search-field search-brand-field" data-brand-picker>
          <span>${icons.search}</span>
          <span class="brand-picker-selected-logo" data-brand-selected-logo aria-hidden="true" hidden></span>
          <input name="want" data-brand-input type="search" placeholder="მარკა ან მოდელი" autocomplete="off" aria-controls="hero-brand-list" aria-expanded="false">
          <input name="make" data-brand-hidden type="hidden">
          <button class="brand-picker-clear" type="button" data-brand-clear aria-label="გასუფთავება" hidden>&times;</button>
          <div class="brand-picker-panel" id="hero-brand-panel" data-brand-panel hidden>
            <div class="brand-picker-list" id="hero-brand-list" role="listbox" aria-label="მარკები და მოდელები"></div>
          </div>
        </div>
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
        <div class="hero-cash-slider">
          <span class="slider-edge">ვითხოვ</span>
          <input name="cashSlider" class="cash-slider garage-cash-slider" type="range" min="-${heroSliderCfg().max}" max="${heroSliderCfg().max}" step="${heroSliderCfg().step}" value="0" aria-label="თანხის სხვაობა">
          <span class="slider-edge">ვამატებ</span>
          <output class="slider-value garage-slider-value" id="slider-value">${formatSliderDiff(0)}</output>
        </div>
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

async function vehicleSuggestions(term) {
  const query = String(term || '').trim();
  if (query.length < 2) return [];
  const [first, ...restTokens] = query.split(/\s+/);
  const rest = restTokens.join(' ');
  const makes = await heroMakes();
  const q = first.toLowerCase();
  const aliased = BRAND_ALIASES[normalizeBrandText(first)];
  const make = (aliased && makes.find((m) => m.name === aliased))
    || makes.find((m) => m.name.toLowerCase() === q)
    || makes.find((m) => m.name.toLowerCase().startsWith(q))
    || makes.find((m) => m.name.toLowerCase().includes(q));

  if (make) {
    const models = await window.AutoSwap.searchModels(rest, make.id, 10).catch(() => []);
    const rows = models.length ? models : await window.AutoSwap.searchModels('', make.id, 10).catch(() => []);
    return rows.map((m) => ({ make: make.name, label: `${make.name} ${m.name}` }));
  }

  // No make hit: the term itself may be a model ("530", "camry").
  const byId = new Map(makes.map((m) => [String(m.id), m.name]));
  const models = await window.AutoSwap.searchModels(query, null, 10).catch(() => []);
  return models
    .map((m) => {
      const makeName = byId.get(String(m.make_id)) || '';
      return makeName ? { make: makeName, label: `${makeName} ${m.name}` } : null;
    })
    .filter(Boolean);
}

async function heroSuggestions(term) {
  return (await vehicleSuggestions(term)).map((item) => item.label);
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

function bindHavePicker(form) {
  const picker = form?.querySelector('[data-have-picker]');
  if (!picker) return;
  const input = picker.querySelector('[data-have-input]');
  const makeInput = picker.querySelector('[data-have-make]');
  const modelInput = picker.querySelector('[data-have-model]');
  const selectedLogo = picker.querySelector('[data-have-selected-logo]');
  const panel = picker.querySelector('[data-have-panel]');
  const list = panel?.querySelector('.brand-picker-list');
  if (!input || !makeInput || !modelInput || !panel || !list) return;

  let items = [];
  let activeIndex = -1;
  let timer = null;
  let seq = 0;

  const setOpen = (open) => {
    panel.hidden = !open;
    input.setAttribute('aria-expanded', String(open));
    picker.classList.toggle('is-open', open);
  };

  const setSelected = (vehicle) => {
    const make = vehicle?.make || '';
    makeInput.value = make;
    modelInput.value = vehicle?.model || '';
    picker.classList.toggle('has-selection', Boolean(make));
    if (selectedLogo) {
      // Only show the tile when we have a real logo, otherwise it duplicates
      // the default car glyph already sitting in the field.
      const showTile = Boolean(make) && hasBrandLogo(make);
      selectedLogo.hidden = !showTile;
      selectedLogo.innerHTML = showTile ? brandLogo(make) : '';
    }
  };

  const renderPanel = () => {
    activeIndex = -1;
    panel.classList.toggle('is-empty', !items.length);
    const hasBoth = items.some((it) => it.group === 'make') && items.some((it) => it.group === 'model');
    let lastGroup = '';
    list.innerHTML = items.map((item, index) => {
      const header = hasBoth && item.group !== lastGroup
        ? `<div class="brand-picker-group" aria-hidden="true">${item.group === 'make' ? 'მარკები' : 'მოდელები'}</div>`
        : '';
      lastGroup = item.group;
      return `${header}
        <button class="brand-picker-option" type="button" role="option" aria-selected="false" data-index="${index}">
          <span class="brand-picker-logo" aria-hidden="true">${brandLogo(item.make)}</span>
          <span class="brand-picker-name">${esc(item.label)}</span>
        </button>`;
    }).join('');
  };

  const setActive = (next) => {
    const options = Array.from(list.querySelectorAll('.brand-picker-option'));
    if (!options.length) return;
    activeIndex = ((next % options.length) + options.length) % options.length;
    options.forEach((option, i) => option.classList.toggle('is-active', i === activeIndex));
    options[activeIndex].scrollIntoView({ block: 'nearest' });
  };

  const choose = (index) => {
    const item = items[Number(index)];
    if (!item) return;
    seq += 1;
    window.clearTimeout(timer);
    const alreadyChosen = input.value.trim().toLowerCase() === item.label.toLowerCase();
    input.value = item.label;
    setSelected({ make: item.make, model: stripResolvedMake(item.label, item.make) });
    // Same drill-in as the brand picker: make → show its models, stay open.
    if (item.group === 'make' && !alreadyChosen) {
      input.focus();
      refresh();
      return;
    }
    setOpen(false);
  };

  const refresh = async () => {
    const stamp = ++seq;
    const value = input.value;
    const [next, vehicle] = await Promise.all([
      brandPanelItems(value).catch(() => []),
      value.trim() ? vehicleFromSearchText(value).catch(() => null) : Promise.resolve(null),
    ]);
    if (stamp !== seq) return;
    items = next;
    renderPanel();
    setSelected(vehicle);
  };

  input.addEventListener('focus', () => {
    setOpen(true);
    refresh();
  });

  input.addEventListener('input', () => {
    setOpen(true);
    window.clearTimeout(timer);
    timer = window.setTimeout(refresh, 140);
    if (!input.value.trim()) setSelected(null);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (panel.hidden) {
        setOpen(true);
        refresh();
        return;
      }
      setActive(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
    }
    if (event.key === 'Enter' && !panel.hidden && activeIndex >= 0) {
      event.preventDefault();
      choose(activeIndex);
    }
    if (event.key === 'Escape') setOpen(false);
  });

  list.addEventListener('mousedown', (event) => {
    const option = event.target.closest('.brand-picker-option');
    if (!option) return;
    event.preventDefault();
    choose(option.dataset.index);
  });

  document.addEventListener('pointerdown', (event) => {
    if (!picker.contains(event.target)) setOpen(false);
  });
}
function bindBrandPicker(form) {
  const picker = form?.querySelector('[data-brand-picker]');
  if (!picker) return;
  const input = picker.querySelector('[data-brand-input]');
  const hidden = picker.querySelector('[data-brand-hidden]');
  const clear = picker.querySelector('[data-brand-clear]');
  const selectedLogo = picker.querySelector('[data-brand-selected-logo]');
  const panel = picker.querySelector('[data-brand-panel]');
  const list = panel?.querySelector('.brand-picker-list');
  if (!input || !hidden || !panel || !list) return;

  let items = [];
  let activeIndex = -1;
  let timer = null;
  let seq = 0;

  const setOpen = (open) => {
    panel.hidden = !open;
    input.setAttribute('aria-expanded', String(open));
    picker.classList.toggle('is-open', open);
    form.classList.toggle('brand-picker-open', open);
  };

  const setSelected = (make) => {
    hidden.value = make || '';
    picker.classList.toggle('has-selection', Boolean(make));
    if (selectedLogo) {
      // Only show the tile when we have a real logo, otherwise it duplicates
      // the default car glyph already sitting in the field.
      const showTile = Boolean(make) && hasBrandLogo(make);
      selectedLogo.hidden = !showTile;
      selectedLogo.innerHTML = showTile ? brandLogo(make) : '';
    }
    if (clear) clear.hidden = !make && !input.value.trim();
  };

  const renderPanel = () => {
    activeIndex = -1;
    panel.classList.toggle('is-empty', !items.length);
    const hasBoth = items.some((it) => it.group === 'make') && items.some((it) => it.group === 'model');
    let lastGroup = '';
    list.innerHTML = items.map((item, index) => {
      const header = hasBoth && item.group !== lastGroup
        ? `<div class="brand-picker-group" aria-hidden="true">${item.group === 'make' ? 'მარკები' : 'მოდელები'}</div>`
        : '';
      lastGroup = item.group;
      return `${header}
        <button class="brand-picker-option" type="button" role="option" aria-selected="false" data-index="${index}">
          <span class="brand-picker-logo" aria-hidden="true">${brandLogo(item.make)}</span>
          <span class="brand-picker-name">${esc(item.label)}</span>
        </button>`;
    }).join('');
  };

  const setActive = (next) => {
    const options = Array.from(list.querySelectorAll('.brand-picker-option'));
    if (!options.length) return;
    activeIndex = ((next % options.length) + options.length) % options.length;
    options.forEach((option, i) => option.classList.toggle('is-active', i === activeIndex));
    options[activeIndex].scrollIntoView({ block: 'nearest' });
  };

  const choose = (index) => {
    const item = items[Number(index)];
    if (!item) return;
    seq += 1; // invalidate any in-flight refresh
    window.clearTimeout(timer);
    const alreadyChosen = input.value.trim().toLowerCase() === item.label.toLowerCase();
    input.value = item.label;
    setSelected(item.make);
    // myauto-style drill-in: picking a make keeps the panel open and lists
    // that make's models; picking it a second time confirms and closes.
    if (item.group === 'make' && !alreadyChosen) {
      input.focus();
      refresh();
      return;
    }
    setOpen(false);
  };

  const refresh = async () => {
    const stamp = ++seq;
    const value = input.value;
    const [next, resolved] = await Promise.all([
      brandPanelItems(value).catch(() => []),
      value.trim() ? resolveMakeFromText(value).catch(() => '') : Promise.resolve(''),
    ]);
    if (stamp !== seq) return;
    items = next;
    renderPanel();
    setSelected(resolved);
  };

  input.addEventListener('focus', () => {
    setOpen(true);
    refresh();
  });

  input.addEventListener('input', () => {
    setOpen(true);
    if (clear) clear.hidden = !input.value.trim() && !hidden.value;
    window.clearTimeout(timer);
    timer = window.setTimeout(refresh, 140);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (panel.hidden) {
        setOpen(true);
        refresh();
        return;
      }
      setActive(activeIndex + (event.key === 'ArrowDown' ? 1 : -1));
    }
    if (event.key === 'Enter' && !panel.hidden && activeIndex >= 0) {
      event.preventDefault();
      choose(activeIndex);
    }
    if (event.key === 'Escape') setOpen(false);
  });

  // mousedown (not click) so the option wins the race against input blur
  list.addEventListener('mousedown', (event) => {
    const option = event.target.closest('.brand-picker-option');
    if (!option) return;
    event.preventDefault();
    choose(option.dataset.index);
  });

  clear?.addEventListener('click', () => {
    input.value = '';
    setSelected('');
    setOpen(true);
    refresh();
    input.focus();
  });

  document.addEventListener('pointerdown', (event) => {
    if (!picker.contains(event.target)) setOpen(false);
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

// The one thing a first-time visitor must leave with: how a swap actually
// works. A real 3-step sequence (list → match → agree), so the numbers carry
// information, this is not decorative section scaffolding.
function HowItWorks() {
  return `
    <section class="how-strip" aria-labelledby="how-title">
      <div class="container">
        <div class="section-head">
          <h2 id="how-title">როგორ მუშაობს გაცვლა</h2>
        </div>
        <ol class="how-steps">
          <li class="how-step">
            <span class="how-icon" aria-hidden="true">${icons.car}</span>
            <div class="how-copy">
              <strong>დაამატე შენი მანქანა</strong>
              <p>ორ წუთში, ფოტოები, სასურველი სანაცვლო მანქანა და თანხის სხვაობა.</p>
            </div>
          </li>
          <li class="how-step">
            <span class="how-icon" aria-hidden="true">${icons.search}</span>
            <div class="how-copy">
              <strong>ნახე ვინ ეძებს მას</strong>
              <p>მატჩი გაჩვენებს მფლობელებს, რომლებსაც სწორედ შენი მანქანა უნდათ.</p>
            </div>
          </li>
          <li class="how-step">
            <span class="how-icon" aria-hidden="true">${icons.swap}</span>
            <div class="how-copy">
              <strong>შეთანხმდი და გაცვალე</strong>
              <p>პირობები ბარათზევე ჩანს, ამიტომ ზარი მხოლოდ საქმეზეა.</p>
            </div>
          </li>
        </ol>
      </div>
    </section>
  `;
}

function ClosingStrip() {
  return `
    <section class="closing-strip">
      <div class="container closing-strip-inner">
        <p>შენი მანქანა შეიძლება უკვე ვიღაცას უნდა, განცხადება ორ წუთში ემატება.</p>
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
    { label: 'სედანი', href: 'cars.html?category=sedan' },
    { label: 'ქროსოვერი', href: 'cars.html?category=crossover' },
    { label: 'თანხის გარეშე', href: 'cars.html?cash=none' },
  ];

  return `
    <section class="browse-strip browse-strip--garage" aria-label="დაათვალიერე მარკის მიხედვით">
      <div class="container browse-strip-inner">
        <button class="rail-arrow rail-arrow--prev" type="button" data-rail-prev aria-label="წინა">${icons.arrowRight}</button>
        <div class="browse-pills" data-drag-scroll>
          ${brands.map((brand) => `
            <a class="brand-chip" href="cars.html?make=${encodeURIComponent(brand.make)}" aria-label="${brand.label || brand.make}, გაცვლები">
              <span class="brand-mark">${brandLogo(brand.make)}</span>
              <span class="brand-chip-text"><strong>${brand.label || brand.make}</strong></span>
            </a>
          `).join('')}
          <span class="brand-chip-sep" aria-hidden="true"></span>
          ${filters.map((route) => `
            <a class="browse-pill" href="${route.href}">
              <span>${route.label}</span>
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
    });

    rail.addEventListener('pointermove', (event) => {
      if (!active) return;
      const delta = event.clientX - startX;
      // Capture the pointer only once a real drag starts. Capturing on
      // pointerdown retargets the eventual click to the rail itself, which
      // silently kills every chip/link click inside it.
      if (!moved && Math.abs(delta) > 6) {
        moved = true;
        rail.classList.add('is-dragging');
        rail.setPointerCapture?.(event.pointerId);
      }
      if (moved) rail.scrollLeft = startLeft - delta;
    });

    const stop = (event) => {
      if (!active) return;
      active = false;
      rail.classList.remove('is-dragging');
      if (moved) {
        rail.releasePointerCapture?.(event.pointerId);
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

  // Scroll arrows are dead controls when everything already fits, hide them.
  const syncRailArrows = () => {
    root.querySelectorAll('[data-drag-scroll]').forEach((rail) => {
      rail.parentElement?.classList.toggle('rail-no-overflow', rail.scrollWidth <= rail.clientWidth + 1);
    });
  };
  syncRailArrows();
  window.addEventListener('resize', syncRailArrows);
}

function bindInteractions() {
  const form = document.querySelector('#search-form');
  const slider = document.querySelector('.cash-slider');
  const sliderValue = document.querySelector('#slider-value');

  slider?.addEventListener('input', () => {
    if (sliderValue) sliderValue.textContent = formatSliderDiff(slider.value);
  });
  if (slider && sliderValue) sliderValue.textContent = formatSliderDiff(slider.value);

  // Re-scale the slider range + label when the header currency toggles.
  if (typeof onCurrencyChange === 'function') {
    onCurrencyChange(() => {
      if (!slider) return;
      const cfg = heroSliderCfg();
      slider.min = String(-cfg.max);
      slider.max = String(cfg.max);
      slider.step = String(cfg.step);
      slider.value = '0';
      if (sliderValue) sliderValue.textContent = formatSliderDiff(0);
    });
  }

  bindHavePicker(form);
  bindBrandPicker(form);

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

  
  
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const want = String(data.get('want') || '').trim();
    const have = String(data.get('have') || '').trim();
    const city = String(data.get('city') || '').trim();
    const diff = Number(data.get('cashSlider')) || 0;
    const selectedMake = String(data.get('make') || '').trim();
    const typedMake = want ? await resolveMakeFromText(want).catch(() => '') : '';
    const resolvedMake = typedMake || selectedMake;
    const query = resolvedMake && isMakeOnlySearch(want, resolvedMake) ? '' : want;
    const wantLabel = query || resolvedMake || want;
    const haveMake = String(data.get('haveMake') || '').trim();
    const haveModel = String(data.get('haveModel') || '').trim();
    const haveVehicle = have
      ? (haveMake ? { make: haveMake, model: haveModel, label: have } : await vehicleFromSearchText(have).catch(() => null))
      : null;
    const myCar = myCarPayloadFromSearch(haveVehicle, wantLabel);
    if (myCar) window.AutoSwap.setMyCar?.(myCar);
    if (resolvedMake) params.set('make', resolvedMake);
    if (query) params.set('query', query);
    if (have) params.set('have', have);
    if (myCar && !resolvedMake && !query) params.set('onlyMatches', '1');
    if (city) params.set('city', city);
    // Slider is from the searcher's perspective: "I add" → the owner asks
    // for money (cash=ask); "I receive" → the owner adds (cash=add).
    if (diff > 0) params.set('cash', 'ask');
    else if (diff < 0) params.set('cash', 'add');
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
      ${HowItWorks()}
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
    const proof = document.querySelector('#hero-proof');
    if (proof) proof.textContent = heroProofText(activeListings);
  }
}

document.querySelector('#app').innerHTML = App();
bindInteractions();
hydrateFromSupabase();
