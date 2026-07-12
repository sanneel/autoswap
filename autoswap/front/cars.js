
const {
  Header,
  Footer,
  icons,
  DEMO_CARS,
  CATEGORY_LABELS,
  TRANSMISSION_LABELS,
  FUEL_LABELS,
  labelFor,
  fetchFeed,
  searchMakes,
  searchModels,
  getMyCar,
  setMyCar,
  openMyCarModal,
  matchLevel,
  daysSince,
} = window.AutoSwap;

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

const PAGE_SIZE = 24;
const STICKY_CTA_DISMISSED_KEY = 'autoswap_cta_dismissed';
const NUMERIC_FILTER_KEYS = ['yearFrom', 'yearTo', 'mileageMin', 'mileageMax', 'valueMin', 'valueMax'];

// Car brand logos from car-logos-dataset via jsdelivr CDN
const MAKE_LOGOS = {
  'BMW': 'bmw.png',
  'Mercedes-Benz': 'mercedes-benz.png',
  'Audi': 'audi.png',
  'Volkswagen': 'volkswagen.png',
  'Porsche': 'porsche.png',
  'Toyota': 'toyota.png',
  'Lexus': 'lexus.png',
  'Honda': 'honda.png',
  'Hyundai': 'hyundai.png',
  'Kia': 'kia.png',
};
const LOGO_CDN = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/';

const URL_MAKE_ALIASES = {
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

function normalizeVehicleSearchText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function urlKnownMakes() {
  return Array.from(new Set([
    'Alfa Romeo', 'Audi', 'BMW', 'Cadillac', 'Chevrolet', 'Chrysler', 'Mercedes-Benz',
    'Toyota', 'Volkswagen', 'Hyundai', 'Kia', 'Lexus', 'Honda', 'Ford', 'Nissan', 'Mazda', 'Porsche',
    ...DEMO_CARS.map((car) => car.make).filter(Boolean),
  ]));
}

function displayURLMake(make) {
  if (make === 'Mercedes-Benz') return 'Mercedes';
  if (make === 'Volkswagen') return 'VW';
  return make;
}

function resolveURLMake(text) {
  const normalized = normalizeVehicleSearchText(text);
  if (!normalized) return '';
  const firstToken = normalized.split(' ')[0];
  if (URL_MAKE_ALIASES[normalized]) return URL_MAKE_ALIASES[normalized];
  if (URL_MAKE_ALIASES[firstToken]) return URL_MAKE_ALIASES[firstToken];
  const rows = urlKnownMakes().map((make) => ({
    make,
    key: normalizeVehicleSearchText(make),
    labelKey: normalizeVehicleSearchText(displayURLMake(make)),
  }));
  const exact = rows.find((row) => normalized === row.key
    || normalized === row.labelKey
    || normalized.startsWith(`${row.key} `)
    || normalized.startsWith(`${row.labelKey} `));
  if (exact) return exact.make;
  const prefix = rows.filter((row) => firstToken.length >= 3
    && (row.key.startsWith(firstToken) || row.labelKey.startsWith(firstToken)));
  return prefix.length === 1 ? prefix[0].make : '';
}

function stripURLMake(text, make) {
  const raw = String(text || '').trim();
  if (!raw || !make) return raw;
  const aliases = Object.entries(URL_MAKE_ALIASES)
    .filter(([, target]) => target === make)
    .map(([alias]) => alias);
  const labels = Array.from(new Set([make, displayURLMake(make), ...aliases].filter(Boolean)))
    .sort((a, b) => b.length - a.length);
  for (const label of labels) {
    const parts = String(label).split(/[\s-]+/).filter(Boolean).map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    if (!parts.length) continue;
    const pattern = new RegExp(`^${parts.join('[\\s-]+')}[\\s-]*`, 'i');
    const next = raw.replace(pattern, '').trim();
    if (next !== raw) return next;
  }
  return raw;
}

function seedMyCarFromURL() {
  const params = new URLSearchParams(window.location.search);
  const have = String(params.get('have') || '').trim();
  if (!have) return;
  const make = resolveURLMake(have);
  if (!make) return;
  const wantLabel = String(params.get('query') || params.get('make') || '').trim();
  setMyCar({
    make,
    model: stripURLMake(have, make),
    wants: wantLabel ? [wantLabel] : [],
    source: 'hero-search-url',
  });
}
let allCars = DEMO_CARS.slice();
seedMyCarFromURL();
let currentFilters = readFiltersFromURL();
let pagesShown = 1;
let currentView = 'list';
let filtersLite = true;

const SORT_OPTIONS = [
  { value: 'match', label: 'ჩემი შესაბამისობით', needsCar: true },
  { value: 'new', label: 'ახალი პირველი' },
  { value: 'year_desc', label: 'წელი კლებადობით' },
  { value: 'year_asc', label: 'წელი ზრდადობით' },
  { value: 'mileage_asc', label: 'გარბენი ზრდადობით' },
  { value: 'value_asc', label: 'ღირებულება ზრდადობით' },
  { value: 'value_desc', label: 'ღირებულება კლებადობით' },
];

const FRESH_OPTIONS = [
  { value: '', label: 'ნებისმიერ დროს' },
  { value: '0', label: 'დღეს' },
  { value: '3', label: 'ბოლო 3 დღე' },
  { value: '7', label: 'ბოლო კვირა' },
];

function emptyFilters() {
  return {
    query: '', make: '', makeId: '', category: '', model: '', modelGroup: '', transmission: '', fuel: '',
    city: '', cash: '', yearFrom: '', yearTo: '', mileageMin: '', mileageMax: '',
    valueMin: '', valueMax: '',
    onlyMatches: '', verified: '', fresh: '', owner: '',
    modelTerms: [],
    sort: '',
  };
}

function readFiltersFromURL() {
  const p = new URLSearchParams(window.location.search);
  const f = emptyFilters();
  Object.keys(f).forEach((key) => {
    const value = p.get(key);
    if (!value) return;
    // Numeric filters come straight off the URL into number inputs; keep
    // digits only so a crafted ?valueMin=... can't break out of the attribute.
    f[key] = NUMERIC_FILTER_KEYS.includes(key) ? value.replace(/[^0-9]/g, '') : value.trim();
  });
  return f;
}

function effectiveSort() {
  if (currentFilters.sort) return currentFilters.sort;
  return getMyCar() ? 'match' : 'new';
}

function matchFor(car) {
  return matchLevel(car, getMyCar());
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean)))
    .sort((a, b) => String(a).localeCompare(String(b), 'ka'));
}

function optionTags(values, selected, labelMap) {
  return values
    .map((value) => {
      const label = labelMap ? labelFor(labelMap, value) : value;
      const isSel = String(value) === String(selected) ? ' selected' : '';
      return `<option value="${value}"${isSel}>${label}</option>`;
    })
    .join('');
}

function selectField(name, labelText, values, selected, allText, labelMap, extraClass = '') {
  return `
    <label class="filter-field${extraClass ? ` ${extraClass}` : ''}">
      <span class="filter-label">${labelText}</span>
      <select name="${name}">
        <option value="">${allText}</option>
        ${optionTags(values, selected, labelMap)}
      </select>
    </label>
  `;
}

function comboField(kind, labelText, value, placeholder, disabled = false) {
  const listId = `${kind}-combo-list`;
  const disabledAttr = disabled ? ' disabled aria-disabled="true"' : '';
  const disabledClass = disabled ? ' is-disabled' : '';
  const clearHidden = disabled || !value ? ' hidden' : '';
  const displayPlaceholder = disabled ? 'ჯერ აირჩიე მარკა…' : placeholder;
  return `
    <div class="filter-field">
      <span class="filter-label">${labelText}</span>
      <div class="combo${disabledClass}" data-combo="${kind}">
        <span class="filter-search combo-control" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="${listId}">${icons.search}
          <input type="text" class="combo-input" name="${kind}" autocomplete="off" placeholder="${displayPlaceholder}" data-placeholder="${placeholder}" value="${escapeHtml(value || '')}" aria-autocomplete="list" aria-controls="${listId}" aria-expanded="false"${disabledAttr}>
          <button type="button" class="combo-clear" aria-label="გასუფთავება"${clearHidden}>&times;</button>
        </span>
        <ul class="combo-list" id="${listId}" role="listbox" hidden></ul>
      </div>
    </div>
  `;
}

function activeFilterCount() {
  const skip = ['makeId', 'modelGroup', 'modelTerms', 'sort'];
  return Object.entries(currentFilters)
    .filter(([key, value]) => !skip.includes(key) && value && String(value).length)
    .length;
}

const HERO_TRUST = [
  { icon: icons.shield, title: 'რეალური მფლობელები', text: 'გაცვლის შეთავაზებები მოდის ადამიანებისგან, რომლებიც მართლაც ეძებენ ახალ მანქანას.' },
  { icon: icons.medal, title: 'პირობები წინასწარ ჩანს', text: 'რას ეძებს მფლობელი და რა თანხის სხვაობაა, ბარათზევე ჩანს.' },
  { icon: icons.headset, title: 'ნაკლები შემთხვევითი ზარი', text: 'შეთავაზება უფრო ორგანიზებულია, ვიდრე ჩვეულებრივი განცხადებების ბაზარზე.' },
];

function HeroTrust() {
  return `
    <div class="catalog-hero-trust">
      ${HERO_TRUST.map((item) => `
        <div class="hero-trust-item">
          <span class="hero-trust-icon">${item.icon}</span>
          <div class="hero-trust-copy">
            <strong>${item.title}</strong>
            <small>${item.text}</small>
          </div>
        </div>`).join('')}
    </div>
  `;
}


function MyCarFilterPanel() {
  const myCar = getMyCar();
  if (!myCar) {
    return `
      <div class="mycar-rail" id="mycar-rail">
        <button type="button" class="filter-mycar-add" data-mycar-edit>${icons.car} მიუთითე შენი მანქანა</button>
        <p class="filter-mycar-hint">ნახე ვინ ეძებს მას. შეთავაზებები მოვა პირდაპირ შენთან.</p>
      </div>
    `;
  }
  const label = `${myCar.make} ${myCar.model || ''}`.trim() + (myCar.year ? ` · ${myCar.year}` : '');
  return `
    <div class="mycar-rail" id="mycar-rail">
      <div class="filter-mycar">
        ${icons.car}
        <span id="mycar-demand-label">${escapeHtml(label)}</span>
        <button type="button" class="filter-mycar-edit" data-mycar-edit>შეცვლა</button>
      </div>
    </div>
  `;
}


function FilterSidebar() {
  const categories = uniqueSorted(allCars.map((c) => c.category));
  const fuels = uniqueSorted(allCars.map((c) => c.fuelType));
  const transmissions = uniqueSorted(allCars.map((c) => c.transmission));
  const cities = uniqueSorted(allCars.map((c) => c.city));
  const years = Array.from(new Set(allCars.map((c) => c.yearNum).filter(Boolean)))
    .sort((a, b) => b - a);
  const f = currentFilters;
  const myCar = getMyCar();

  return `
    <aside class="filters" id="filters" aria-label="ფილტრები">
      <form class="filters-form${filtersLite ? ' is-lite' : ''}" id="filters-form">
        <div class="filters-head">
          <div class="filters-title-row">
            <span class="filters-title">${icons.filter} ფილტრები<span class="filters-count" id="apply-count">${getFiltered().length}</span></span>
            <button type="button" class="filter-lite-toggle${filtersLite ? ' is-on' : ''}" id="filter-lite-toggle" aria-pressed="${filtersLite}" aria-label="მხოლოდ ძირითადი ფილტრები" data-tooltip="მხოლოდ ძირითადი ფილტრები" title="მხოლოდ ძირითადი ფილტრები">
              <span>მარტივი</span>
              <i aria-hidden="true"></i>
            </button>
          </div>
          <button type="button" class="filters-reset" id="filters-reset">${icons.refresh} გასუფთავება</button>
          <button type="button" class="filters-close" id="filters-close" aria-label="დახურვა">&times;</button>
        </div>

        ${MyCarFilterPanel()}

        <label class="filter-field">
          <span class="filter-label">საძიებო სიტყვა</span>
          <div class="combo" data-query-suggest>
            <span class="filter-search combo-control">${icons.search}
              <input type="search" name="query" value="${escapeHtml(f.query || '')}" placeholder="მარკა, მოდელი, ქალაქი…" autocomplete="off" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="query-suggest-list">
            </span>
            <ul class="combo-list" id="query-suggest-list" role="listbox" hidden></ul>
          </div>
        </label>

        ${comboField('make', 'მარკა', f.make, 'მოძებნე მარკა…')}
        ${comboField('model', 'მოდელი', f.model, 'მოძებნე მოდელი…', !f.makeId)}
        ${selectField('category', 'მანქანის ტიპი', categories, f.category, 'ნებისმიერი ტიპი', CATEGORY_LABELS)}

        <div class="filter-field filter-advanced">
          <span class="filter-label">გამოშვების წელი</span>
          <div class="filter-range">
            <select name="yearFrom"><option value="">მინ.</option>${optionTags(years, f.yearFrom)}</select>
            <span class="filter-range-sep">-</span>
            <select name="yearTo"><option value="">მაქს.</option>${optionTags(years, f.yearTo)}</select>
          </div>
        </div>

        <div class="filter-field filter-advanced">
          <span class="filter-label">ღირებულება (₾)</span>
          <div class="filter-range">
            <input type="number" name="valueMin" value="${escapeHtml(f.valueMin || '')}" placeholder="მინ." min="0" inputmode="numeric" aria-label="ღირებულება დან">
            <span class="filter-range-sep">-</span>
            <input type="number" name="valueMax" value="${escapeHtml(f.valueMax || '')}" placeholder="მაქს." min="0" inputmode="numeric" aria-label="ღირებულება მდე">
          </div>
        </div>

        <div class="filter-field filter-advanced">
          <span class="filter-label">გარბენი (კმ)</span>
          <div class="filter-range">
            <input type="number" name="mileageMin" value="${escapeHtml(f.mileageMin || '')}" placeholder="მინ." min="0" inputmode="numeric" aria-label="გარბენი დან">
            <span class="filter-range-sep">-</span>
            <input type="number" name="mileageMax" value="${escapeHtml(f.mileageMax || '')}" placeholder="მაქს." min="0" inputmode="numeric" aria-label="გარბენი მდე">
          </div>
        </div>

        ${selectField('transmission', 'გადაცემათა კოლოფი', transmissions, f.transmission, 'ნებისმიერი', TRANSMISSION_LABELS, 'filter-advanced')}
        ${selectField('fuel', 'საწვავი', fuels, f.fuel, 'ნებისმიერი', FUEL_LABELS, 'filter-advanced')}
        ${selectField('city', 'ქალაქი', cities, f.city, 'ნებისმიერი ქალაქი', null, 'filter-advanced')}

        <label class="filter-field">
          <span class="filter-label">თანხის სხვაობა</span>
          <select name="cash">
            <option value="">ნებისმიერი</option>
            <option value="none"${f.cash === 'none' ? ' selected' : ''}>თანაბარი გაცვლა</option>
            <option value="add"${f.cash === 'add' ? ' selected' : ''}>ის ამატებს, მე ვიღებ თანხას</option>
            <option value="ask"${f.cash === 'ask' ? ' selected' : ''}>ის ითხოვს, მე ვამატებ</option>
            <option value="flexible"${f.cash === 'flexible' ? ' selected' : ''}>შეთანხმებით</option>
          </select>
        </label>

        <label class="filter-field filter-advanced">
          <span class="filter-label">განცხადების ასაკი</span>
          <select name="fresh">
            ${FRESH_OPTIONS.map((o) => `<option value="${o.value}"${o.value === f.fresh ? ' selected' : ''}>${o.label}</option>`).join('')}
          </select>
        </label>

        <div class="filter-checks filter-advanced">
          ${myCar ? `<label class="filter-check">
            <input type="checkbox" name="onlyMatches" value="1"${f.onlyMatches ? ' checked' : ''}>
            <span>მხოლოდ ვინც ჩემს მანქანას ეძებს</span>
          </label>` : ''}
          <label class="filter-check">
            <input type="checkbox" name="verified" value="1"${f.verified ? ' checked' : ''}>
            <span>მხოლოდ დადასტურებული მფლობელები</span>
          </label>
        </div>

        <div class="filters-actions">
          <button type="button" class="btn btn-primary filters-search" id="filters-search">${icons.search} შედეგების ნახვა</button>
        </div>
      </form>
    </aside>
  `;
}


function matchBadge(match) {
  if (match === 'mutual') return `<span class="match-badge match-badge--mutual">${icons.swap} ორმხრივი მატჩი</span>`;
  if (match === 'reverse') return `<span class="match-badge match-badge--reverse">${icons.search} ეძებს შენნაირ მანქანას</span>`;
  return '';
}


function cashLine(car) {
  const iconMap = { add: icons.trendUp, ask: icons.trendDown, flexible: icons.swap, none: icons.equals };
  return `<p class="trade-cash trade-cash--${car.cashType}">${iconMap[car.cashType] || icons.equals}<span>${escapeHtml(car.cash)}</span></p>`;
}

function wantsChips(car) {
  const myCar = getMyCar();
  const myMake = myCar ? String(myCar.make || '').toLowerCase().replace(/[^a-z0-9]+/g, '') : '';
  const hasMatch = !!matchFor(car);
  const visible = car.wantsList.slice(0, 3).map((want) => {
    const normalized = String(want).toLowerCase().replace(/[^a-z0-9]+/g, '');
    const isMatch = hasMatch && myMake && normalized.includes(myMake);
    return `<span class="want-chip${isMatch ? ' is-match' : ''}">${escapeHtml(want)}</span>`;
  });
  const extra = car.wantsList.length - 3;
  if (extra > 0) visible.push(`<span class="want-chip want-chip--more">+${extra}</span>`);
  return visible.join('');
}

function trustStrip(car) {
  if (!car.ownerName) {
    
    return car.freshness ? `<div class="trade-trust"><span class="trust-item">განახლდა ${car.freshness}</span></div>` : '';
  }
  const items = [
    `<span class="trust-owner"><span class="trust-avatar">${escapeHtml(car.ownerName.charAt(0))}</span>${escapeHtml(car.ownerName)}</span>`,
    car.ownerVerified ? `<span class="trust-item trust-item--ok">${icons.check} ტელეფონი</span>` : '',
    car.ownerSwaps > 0 ? `<span class="trust-item">${car.ownerSwaps} გაცვლა</span>` : '',
    car.ownerResponseHours != null ? `<span class="trust-item">პასუხობს ~${car.ownerResponseHours} სთ-ში</span>` : '',
    car.ownerActiveToday ? `<span class="trust-item trust-item--active">დღეს აქტიური</span>` : '',
  ].filter(Boolean);
  return `<div class="trade-trust">${items.join('')}</div>`;
}


function ownerLine(car) {
  if (!car.ownerName) {
    return car.freshness ? `<span class="aside-owner aside-owner--anon">${icons.user} განახლდა ${escapeHtml(car.freshness)}</span>` : '';
  }
  const signal = car.ownerVerified
    ? `<span class="trust-item trust-item--ok">${icons.check} ტელეფონი</span>`
    : (car.ownerActiveToday ? `<span class="trust-item trust-item--active">დღეს აქტიური</span>` : '');
  return `
    <span class="aside-owner">
      <span class="trust-avatar">${escapeHtml(car.ownerName.charAt(0))}</span>
      <span class="aside-owner-name">${escapeHtml(car.ownerName)}</span>
      ${signal}
    </span>
  `;
}


function CarRow(car) {
  const detailHref = `vehicle.html?id=${encodeURIComponent(car.id)}`;
  const specs = [
    car.mileage,
    car.fuel,
    car.transmissionLabel,
    car.category ? labelFor(CATEGORY_LABELS, car.category) : null,
  ].filter(Boolean).join(' · ');
  const name = escapeHtml(`${car.make} ${car.model}`);
  return `
    <article class="car-card" data-id="${escapeHtml(car.id)}">
      <div class="car-card-media">
        <a class="car-row-media-link" href="${detailHref}" aria-label="${name} დეტალურად">
          <img src="${escapeHtml(car.image)}" alt="${name}" loading="lazy">
        </a>
        <button class="save-btn" type="button" aria-label="${name} შენახვა">${icons.heart}</button>
      </div>

      <div class="car-card-body">
        <div class="car-card-head">
          <h3 class="car-row-title"><a class="card-title-link" href="${detailHref}">${name}</a> <span class="car-row-year">${escapeHtml(car.year)}</span></h3>
          <span class="listing-city">${icons.location}${escapeHtml(car.city)}${car.freshness ? `<span class="listing-age">· ${escapeHtml(car.freshness)}</span>` : ''}</span>
        </div>
        <p class="car-card-specs">${escapeHtml(specs)}</p>
        ${car.openToOffers
          ? '<p class="car-card-wants car-card-wants--open">ღიაა ნებისმიერ შეთავაზებაზე</p>'
          : `<p class="car-card-wants"><span>ეძებს</span>${escapeHtml(car.wants)}</p>`}
      </div>

      <div class="car-card-aside">
        ${cashLine(car)}
        <button class="btn btn-primary car-row-offer" type="button" data-offer data-id="${escapeHtml(car.id)}" data-make="${escapeHtml(car.make)}" data-model="${escapeHtml(car.model)}">${icons.swap} შესთავაზე გაცვლა</button>
        <a class="btn btn-ghost car-card-detail" href="${detailHref}">დეტალურად</a>
      </div>
    </article>
  `;
}

function emptyStateHTML() {
  const myCar = getMyCar();
  return `
    <div class="empty-state empty-state--actions">
      <p>ამ ფილტრებით ვერაფერი მოიძებნა.</p>
      <div class="empty-state-actions">
        <button type="button" class="btn btn-ghost" id="empty-reset">ფილტრების გასუფთავება</button>
        ${myCar ? '' : `<button type="button" class="btn btn-primary" data-mycar-edit>დაამატე შენი მანქანა. მატჩი თვითონ მოგძებნის</button>`}
      </div>
    </div>
  `;
}

function loadMoreHTML(total) {
  const shown = Math.min(total, pagesShown * PAGE_SIZE);
  const remaining = total - shown;
  if (remaining <= 0) return '';
  return `<button type="button" class="btn btn-light load-more" id="load-more">მეტის ჩატვირთვა <span>(${remaining})</span></button>`;
}

const LIST_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13"></path><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"></path></svg>';
const GRID_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.4"></rect><rect x="14" y="3" width="7" height="7" rx="1.4"></rect><rect x="3" y="14" width="7" height="7" rx="1.4"></rect><rect x="14" y="14" width="7" height="7" rx="1.4"></rect></svg>';

function ResultsHead(count) {
  const sort = effectiveSort();
  const hasCar = !!getMyCar();
  const options = SORT_OPTIONS.filter((o) => !o.needsCar || hasCar);
  return `
    <div class="results-head">
      <p class="results-count"><strong id="results-count">${count}</strong> აქტიური გაცვლა</p>
      <div class="results-controls">
        <button type="button" class="filters-toggle" id="filters-toggle">${icons.filter} ფილტრები<span class="filters-toggle-badge" id="filters-badge" hidden></span></button>
        <label class="results-sort">
          <span class="filter-label">დალაგება</span>
          <select id="sort-select" name="sort">
            ${options.map((o) => `<option value="${o.value}"${o.value === sort ? ' selected' : ''}>${o.label}</option>`).join('')}
          </select>
        </label>
        <div class="view-toggle" role="group" aria-label="ხედი">
          <button type="button" class="view-btn${currentView === 'list' ? ' is-active' : ''}" data-view="list" aria-label="სია" aria-pressed="${currentView === 'list'}">${LIST_ICON}</button>
          <button type="button" class="view-btn${currentView === 'grid' ? ' is-active' : ''}" data-view="grid" aria-label="ბადე" aria-pressed="${currentView === 'grid'}">${GRID_ICON}</button>
        </div>
      </div>
    </div>
  `;
}

function StickyCTA() {
  if (getMyCar()) return '';
  try {
    if (window.sessionStorage.getItem(STICKY_CTA_DISMISSED_KEY)) return '';
  } catch (_err) {  }
  return `
    <div class="sticky-cta" id="sticky-cta">
      <button type="button" class="btn btn-primary sticky-cta-btn" data-mycar-edit>${icons.plus} დაამატე მანქანა და ნახე ვინ ეძებს მას</button>
      <button type="button" class="sticky-cta-close" id="sticky-cta-close" aria-label="დახურვა">&times;</button>
    </div>
  `;
}

const QUICK_BRAND_SLUGS = {
  BMW: 'bmw',
  'Mercedes-Benz': 'mercedes-benz',
  Audi: 'audi',
  Toyota: 'toyota',
  Volkswagen: 'volkswagen',
  Hyundai: 'hyundai',
  Lexus: 'lexus',
};

function quickBrandLogo(make) {
  const url = window.AutoSwap.getLogoUrl(make);
  return url
    ? `<img src="${url}" alt="${make}" class="quick-chip-brand-logo" loading="lazy" onerror="this.style.display='none'">`
    : `<span class="quick-chip-icon">${icons.car}</span>`;
}

function quickChip({ href, label, count, icon = '', active = false, extraClass = '' }) {
  return `
    <a class="quick-chip${active ? ' is-active' : ''}${extraClass ? ` ${extraClass}` : ''}" href="${href}">
      ${icon}
      <span class="quick-chip-label">${label}</span>
      <span class="quick-chip-count">${count}</span>
    </a>
  `;
}

function CatalogQuickBar(count) {
  const countByMake = (make) => allCars.filter((car) => car.make === make).length;
  const countByCategory = (category) => allCars.filter((car) => car.category === category).length;
  const countByCash = (cash) => allCars.filter((car) => car.cashType === cash).length;
  const brandChips = [
    { make: 'BMW' },
    { make: 'Mercedes-Benz', label: 'Mercedes' },
    { make: 'Audi' },
    { make: 'Toyota' },
    { make: 'Volkswagen', label: 'VW' },
  ].filter((brand) => countByMake(brand.make) > 0);
  const routeChips = [
    { label: 'სედანი', href: 'cars.html?category=sedan', count: countByCategory('sedan'), active: currentFilters.category === 'sedan', icon: `<span class="quick-chip-icon">${icons.car}</span>` },
    { label: 'ქროსოვერი', href: 'cars.html?category=crossover', count: countByCategory('crossover'), active: currentFilters.category === 'crossover', icon: `<span class="quick-chip-icon">${icons.car}</span>` },
    { label: 'გარეშე', href: 'cars.html?cash=none', count: countByCash('none'), active: currentFilters.cash === 'none', icon: '<span class="quick-chip-symbol">₾</span>' },
  ];
  const noQuickFilter = !currentFilters.make && !currentFilters.category && !currentFilters.cash;

  return `
    <div class="catalog-quickbar" aria-label="სწრაფი ფილტრები">
      <button class="rail-arrow rail-arrow--prev" type="button" data-rail-prev aria-label="წინა">${icons.arrowRight}</button>
      <nav class="catalog-quickbar-pills quick-chip-strip" data-drag-scroll>
        ${quickChip({ href: 'cars.html', label: 'ყველა', count: allCars.length, active: noQuickFilter, extraClass: 'quick-chip--all' })}
        <span class="quick-chip-divider" aria-hidden="true"></span>
        ${brandChips.map((brand) => quickChip({
          href: `cars.html?make=${encodeURIComponent(brand.make)}`,
          label: brand.label || brand.make,
          count: countByMake(brand.make),
          active: currentFilters.make.toLowerCase() === brand.make.toLowerCase(),
          icon: quickBrandLogo(brand.make),
        })).join('')}
        <span class="quick-chip-divider" aria-hidden="true"></span>
        ${routeChips.map((chip) => quickChip(chip)).join('')}
      </nav>
      <button class="rail-arrow" type="button" data-rail-next aria-label="შემდეგი">${icons.arrowRight}</button>
    </div>
  `;
}

function CatalogPage() {
  const filtered = getFiltered();
  const slice = pageSlice(filtered);
  return `
    ${Header({ active: 'listings' })}
    <main class="catalog-shell">
      <header class="catalog-topbar">
        <div class="container catalog-topbar-inner">
          <div class="catalog-topbar-copy">
            <h1>ავტომობილები გაცვლისთვის</h1>
            <p><strong>${filtered.length}</strong> აქტიური განცხადება · მოძებნე მარკით, ქალაქით და თანხის სხვაობით</p>
          </div>
          <a class="btn btn-primary catalog-topbar-cta" href="sell.html">${icons.plus} დაამატე მანქანა</a>
        </div>
      </header>
      ${CatalogQuickBar()}
      <section class="catalog container">
        ${FilterSidebar()}
        <div class="results">
          ${ResultsHead(filtered.length)}
          <div class="car-list view-${currentView}" id="car-list">
            ${slice.length ? slice.map(CarRow).join('') : emptyStateHTML()}
          </div>
          <div class="load-more-wrap" id="load-more-wrap">${loadMoreHTML(filtered.length)}</div>
        </div>
      </section>
      <div class="filters-overlay" id="filters-overlay" hidden></div>
      ${StickyCTA()}
    </main>
    ${Footer()}
  `;
}


function rankCar(car) {
  
  const match = matchFor(car);
  const matchRank = match === 'mutual' ? 0 : match === 'reverse' ? 1 : 2;
  const openRank = car.openToOffers ? 1 : 0; 
  const boostRank = car.boosted ? 0 : 1;
  return [matchRank, openRank, boostRank];
}

function compareRanks(a, b) {
  const ra = rankCar(a);
  const rb = rankCar(b);
  for (let i = 0; i < ra.length; i += 1) {
    if (ra[i] !== rb[i]) return ra[i] - rb[i];
  }
  return String(b.createdAt).localeCompare(String(a.createdAt));
}

function sortCars(list, sort) {
  const copy = list.slice();
  switch (sort) {
    case 'match':
      return copy.sort(compareRanks);
    case 'year_desc':
      return copy.sort((a, b) => (b.yearNum || 0) - (a.yearNum || 0));
    case 'year_asc':
      return copy.sort((a, b) => (a.yearNum || 0) - (b.yearNum || 0));
    case 'mileage_asc':
      return copy.sort((a, b) => (a.mileageNum || 0) - (b.mileageNum || 0));
    case 'value_asc':
      
      return copy.sort((a, b) => (a.estimatedValue ?? Infinity) - (b.estimatedValue ?? Infinity));
    case 'value_desc':
      return copy.sort((a, b) => (b.estimatedValue ?? -Infinity) - (a.estimatedValue ?? -Infinity));
    default:
      
      return copy.sort((a, b) => {
        if (a.openToOffers !== b.openToOffers) return a.openToOffers ? 1 : -1;
        if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
        return String(b.createdAt).localeCompare(String(a.createdAt));
      });
  }
}

// Unicode-aware (Georgian city names must survive), unlike
// normalizeVehicleSearchText which keeps latin/digits only.
function queryHaystackText(value) {
  return String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function applyFilters(cars, f) {
  // Token match so "BMW 5 Series" (a family suggestion) finds "BMW 530i":
  // every query token must appear somewhere in the haystack, which also
  // carries the model's family label ("530i" → "5 Series").
  const queryTokens = queryHaystackText(f.query).split(' ').filter(Boolean);
  const yearFrom = Number(f.yearFrom) || null;
  const yearTo = Number(f.yearTo) || null;
  const mileageMin = Number(f.mileageMin) || null;
  const mileageMax = Number(f.mileageMax) || null;
  const valueMin = Number(f.valueMin) || null;
  const valueMax = Number(f.valueMax) || null;
  const maxDays = f.fresh === '' ? null : Number(f.fresh);

  const filtered = cars.filter((car) => {
    const family = familyLabelForModel(car.model, car.make);
    const haystack = queryHaystackText(`${car.make} ${car.model} ${family} ${car.year} ${car.city} ${car.wants}`);
    if (queryTokens.length && !queryTokens.every((token) => haystack.includes(token))) return false;
    
    
    if (f.owner && car.ownerId !== f.owner) return false;
    if (f.make && !car.make.toLowerCase().includes(f.make.toLowerCase())) return false;
    if (f.category && car.category !== f.category) return false;
    if (f.model && !modelMatchesFilter(car.model, f)) return false;
    if (f.transmission && car.transmission !== f.transmission) return false;
    if (f.fuel && car.fuelType !== f.fuel) return false;
    if (f.city && car.city !== f.city) return false;
    if (f.cash && car.cashType !== f.cash) return false;
    if (yearFrom && (car.yearNum == null || car.yearNum < yearFrom)) return false;
    if (yearTo && (car.yearNum == null || car.yearNum > yearTo)) return false;
    if (mileageMin && (car.mileageNum == null || car.mileageNum < mileageMin)) return false;
    if (mileageMax && (car.mileageNum == null || car.mileageNum > mileageMax)) return false;
    if (valueMin && (car.estimatedValue == null || car.estimatedValue < valueMin)) return false;
    if (valueMax && (car.estimatedValue == null || car.estimatedValue > valueMax)) return false;
    if (f.verified && !car.ownerVerified) return false;
    if (maxDays != null) {
      const age = daysSince(car.createdAt);
      if (age == null || age > maxDays) return false;
    }
    if (f.onlyMatches && !matchFor(car)) return false;
    return true;
  });

  return sortCars(filtered, effectiveSort());
}

function getFiltered() {
  return applyFilters(allCars, currentFilters);
}

function pageSlice(list) {
  return list.slice(0, pagesShown * PAGE_SIZE);
}



function syncFiltersToURL() {
  const params = new URLSearchParams();
  Object.entries(currentFilters).forEach(([key, value]) => {
    if (key === 'modelTerms' || key === 'modelGroup') return; 
    if (value) params.set(key, value);
  });
  const query = params.toString();
  window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}



function update() {
  syncFiltersToURL();
  const filtered = getFiltered();
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (pagesShown > pages) pagesShown = pages;
  const slice = pageSlice(filtered);

  const count = document.querySelector('#results-count');
  if (count) count.textContent = String(filtered.length);
  const applyCount = document.querySelector('#apply-count');
  if (applyCount) applyCount.textContent = String(filtered.length);

  const badge = document.querySelector('#filters-badge');
  if (badge) {
    const n = activeFilterCount();
    badge.textContent = n ? String(n) : '';
    badge.hidden = !n;
  }


  const list = document.querySelector('#car-list');
  if (list) {
    list.innerHTML = slice.length ? slice.map(CarRow).join('') : emptyStateHTML();
  }

  const more = document.querySelector('#load-more-wrap');
  if (more) more.innerHTML = loadMoreHTML(filtered.length);

  const toggle = document.querySelector('#matches-toggle');
  if (toggle) toggle.checked = !!currentFilters.onlyMatches;
  const sidebarToggle = document.querySelector('#filters-form [name="onlyMatches"]');
  if (sidebarToggle) sidebarToggle.checked = !!currentFilters.onlyMatches;

}

function readFiltersFromForm(form) {
  const data = new FormData(form);
  const f = { ...currentFilters };
  ['query', 'make', 'category', 'model', 'yearFrom', 'yearTo', 'transmission', 'fuel', 'mileageMin', 'mileageMax', 'valueMin', 'valueMax', 'city', 'cash', 'fresh']
    .forEach((key) => { f[key] = String(data.get(key) || '').trim(); });
  f.onlyMatches = data.get('onlyMatches') ? '1' : '';
  f.verified = data.get('verified') ? '1' : '';
  if (!f.make || f.make !== currentFilters.make) f.makeId = '';
  return f;
}

const MODEL_CATALOG_LIMIT = 500;
const modelCatalogCache = new Map();

function normalizeMatchText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function familyLabelForModel(modelName, makeName) {
  const raw = String(modelName || '').trim();
  const compact = raw.toUpperCase().replace(/[^A-Z0-9]+/g, '');
  const make = String(makeName || '').toLowerCase();

  if (!raw) return '';

  if (make.includes('bmw')) {
    const series = compact.match(/^([1-8])(?:\d{2}|M)/);
    if (series) return `${series[1]} Series`;
    const mSeries = compact.match(/^M([1-8])$/);
    if (mSeries) return `${mSeries[1]} Series`;
    const xSeries = compact.match(/^X([1-7])/);
    if (xSeries) return `X${xSeries[1]}`;
    const zSeries = compact.match(/^Z([1-9])/);
    if (zSeries) return `Z${zSeries[1]}`;
    const iSeries = compact.match(/^I([1-9X])/);
    if (iSeries) return `i${iSeries[1]}`;
  }

  if (make.includes('mercedes')) {
    const classMatch = compact.match(/^([ABCEGS])(?:\d|CLASS)/);
    if (classMatch) return `${classMatch[1]}-Class`;
    const glMatch = compact.match(/^(GLA|GLB|GLC|GLE|GLS|G)\d?/);
    if (glMatch) return glMatch[1] === 'G' ? 'G-Class' : glMatch[1];
  }

  if (make.includes('audi')) {
    const audiMatch = compact.match(/^((?:RS|S)?[AQ][1-8]|TT|R8)/);
    if (audiMatch) return audiMatch[1];
  }

  if (make.includes('lexus') || make.includes('infiniti') || make.includes('acura')) {
    const luxuryMatch = compact.match(/^([A-Z]{2,3})\d/);
    if (luxuryMatch) return luxuryMatch[1];
  }

  return raw;
}

function naturalCompare(a, b) {
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function buildModelFamilies(models, makeName) {
  const groups = new Map();
  models.forEach((model) => {
    const name = String(model.name || '').trim();
    const familyName = familyLabelForModel(name, makeName);
    if (!familyName) return;
    if (!groups.has(familyName)) {
      groups.set(familyName, { name: familyName, children: [], terms: [familyName] });
    }
    const group = groups.get(familyName);
    if (!group.children.some((child) => child.name.toLowerCase() === name.toLowerCase())) {
      group.children.push({ ...model, name });
      group.terms.push(name);
    }
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      children: group.children.sort((a, b) => naturalCompare(a.name, b.name)),
      terms: Array.from(new Set(group.terms)),
    }))
    .sort((a, b) => naturalCompare(a.name, b.name));
}

function modelGroupChildren(group, term = '') {
  const q = normalizeMatchText(term === group.name ? '' : term);
  const children = q
    ? group.children.filter((child) => normalizeMatchText(child.name).includes(q))
    : group.children;

  return [
    { type: 'all-group', name: group.name, label: `ყველა ${group.name}`, id: `all-${group.name}`, terms: group.terms, groupName: group.name, children: group.children },
    ...children.map((child) => ({ type: 'model', name: child.name, label: child.name, id: child.id, terms: [child.name], groupName: group.name })),
  ];
}

function modelFamilyOptions(models, makeName, term = '') {
  const q = normalizeMatchText(term);
  const groups = buildModelFamilies(models, makeName);

  return groups
    .filter((group) => !q
      || normalizeMatchText(group.name).includes(q)
      || group.children.some((child) => normalizeMatchText(child.name).includes(q)))
    .map((group) => {
      const isSinglePlainModel = group.children.length === 1
        && normalizeMatchText(group.name) === normalizeMatchText(group.children[0].name);
      return isSinglePlainModel
        ? { type: 'model', name: group.children[0].name, label: group.children[0].name, id: group.children[0].id, terms: [group.children[0].name] }
        : { type: 'group', name: group.name, label: group.name, id: `group-${group.name}`, terms: group.terms, groupName: group.name, children: group.children };
    })
    .slice(0, 80);
}

function modelMatchesFilter(modelName, f) {
  const terms = Array.isArray(f.modelTerms) && f.modelTerms.length ? f.modelTerms : [f.model];
  const normalizedModel = normalizeMatchText(modelName);
  return terms.some((term) => {
    const normalizedTerm = normalizeMatchText(term);
    return normalizedTerm
      && (normalizedModel.includes(normalizedTerm)
        || (normalizedModel.length >= 3 && normalizedTerm.includes(normalizedModel)));
  });
}

async function resolveSelectedMakeId() {
  if (currentFilters.makeId) return currentFilters.makeId;
  const makeName = String(currentFilters.make || '').trim();
  if (!makeName) return '';

  const makes = await searchMakes(makeName, 12);
  const exact = makes.find((make) => make.name.toLowerCase() === makeName.toLowerCase());
  if (!exact) return '';

  currentFilters.make = exact.name;
  currentFilters.makeId = String(exact.id);
  return currentFilters.makeId;
}

async function loadCurrentMakeModels() {
  const makeId = await resolveSelectedMakeId();
  if (!makeId) return [];
  if (!modelCatalogCache.has(makeId)) {
    modelCatalogCache.set(makeId, await searchModels('', makeId, MODEL_CATALOG_LIMIT));
  }
  return modelCatalogCache.get(makeId) || [];
}


async function comboSearch(kind, term) {
  if (kind === 'make') return searchMakes(term, 40);

  if (!currentFilters.make) return [];
  const models = await loadCurrentMakeModels();
  if (!models.length) return [];

  if (currentFilters.modelGroup) {
    const group = buildModelFamilies(models, currentFilters.make)
      .find((item) => item.name === currentFilters.modelGroup);
    if (group) return modelGroupChildren(group, term);
  }

  return modelFamilyOptions(models, currentFilters.make, term);
}

function setComboOpen(combo, open) {
  const list = combo.querySelector('.combo-list');
  const input = combo.querySelector('.combo-input');
  const control = combo.querySelector('.combo-control');
  if (list) list.hidden = !open;
  if (input) input.setAttribute('aria-expanded', String(open));
  if (control) control.setAttribute('aria-expanded', String(open));
}

function setActiveComboOption(list, index) {
  const options = Array.from(list.querySelectorAll('.combo-option'));
  options.forEach((option) => option.classList.remove('is-active'));
  if (!options.length) {
    list.dataset.activeIndex = '-1';
    return null;
  }

  const nextIndex = (index + options.length) % options.length;
  const active = options[nextIndex];
  active.classList.add('is-active');
  active.scrollIntoView({ block: 'nearest' });
  list.dataset.activeIndex = String(nextIndex);
  return active;
}

function renderComboList(combo, items) {
  const list = combo.querySelector('.combo-list');
  combo.__comboItems = items;
  list.innerHTML = items.length
    ? items.map((it, index) => {
      const type = it.type || 'model';
      const count = type === 'group' && Array.isArray(it.children) ? `<span class="combo-option-meta">${it.children.length} მოდელი</span>` : '';
      return `<li class="combo-option combo-option--${type}" role="option" data-index="${index}" data-name="${escapeHtml(it.name)}" data-id="${escapeHtml(it.id)}"><span>${escapeHtml(it.label || it.name)}</span>${count}</li>`;
    }).join('')
    : '<li class="combo-empty">ვერ მოიძებნა</li>';
  setComboOpen(combo, true);
  setActiveComboOption(list, 0);
}

function clearModelComboInput() {
  const modelCombo = document.querySelector('.combo[data-combo="model"]');
  if (!modelCombo) return;
  const input = modelCombo.querySelector('.combo-input');
  const clear = modelCombo.querySelector('.combo-clear');
  if (input) input.value = '';
  if (clear) clear.hidden = true;
  setComboOpen(modelCombo, false);
}

function setModelComboDisabled(disabled) {
  const modelCombo = document.querySelector('.combo[data-combo="model"]');
  if (!modelCombo) return;
  const input = modelCombo.querySelector('.combo-input');
  const clear = modelCombo.querySelector('.combo-clear');
  modelCombo.classList.toggle('is-disabled', disabled);
  if (input) {
    input.disabled = disabled;
    input.setAttribute('aria-disabled', String(disabled));
    input.placeholder = disabled ? 'ჯერ აირჩიე მარკა…' : (input.dataset.placeholder || 'მოძებნე მოდელი…');
  }
  if (disabled) {
    if (clear) clear.hidden = true;
    setComboOpen(modelCombo, false);
  }
}

function resetModelFilter() {
  currentFilters.model = '';
  currentFilters.modelGroup = '';
  currentFilters.modelTerms = [];
  clearModelComboInput();
}

function setComboValue(kind, name, id, item = null) {
  if (kind === 'make') {
    const changed = currentFilters.make !== name;
    currentFilters.make = name;
    currentFilters.makeId = id ? String(id) : '';
    setModelComboDisabled(!currentFilters.makeId);
    if (changed) {
      resetModelFilter();
    }
  } else {
    currentFilters.model = name;
    currentFilters.modelGroup = item && item.groupName ? item.groupName : '';
    currentFilters.modelTerms = item && Array.isArray(item.terms) ? item.terms : (name ? [name] : []);
  }
  pagesShown = 1;
  update();
}

function chooseComboOption(combo, option) {
  const kind = combo.dataset.combo;
  const input = combo.querySelector('.combo-input');
  const clear = combo.querySelector('.combo-clear');
  const item = combo.__comboItems ? combo.__comboItems[Number(option.dataset.index)] : null;
  const name = item ? item.name : option.dataset.name;
  input.value = name;
  clear.hidden = false;

  if (kind === 'model' && item && item.type === 'group') {
    currentFilters.model = item.name;
    currentFilters.modelGroup = item.name;
    currentFilters.modelTerms = item.terms || [item.name];
    pagesShown = 1;
    update();
    renderComboList(combo, modelGroupChildren(item, ''));
    input.focus();
    return;
  }

  setComboOpen(combo, false);
  setComboValue(kind, name, item ? item.id : option.dataset.id, item);
}

// Free-text query suggestions (same idea as the hero search): contains-match
// against the make/model catalog so "bmw 5" offers "BMW 5 Series", "BMW X5"…
let queryMakesPromise = null;
function queryMakesCatalog() {
  if (!queryMakesPromise) queryMakesPromise = searchMakes('', 500).catch(() => []);
  return queryMakesPromise;
}

async function querySuggestions(term) {
  const query = String(term || '').trim();
  if (query.length < 2) return [];
  const [first, ...restTokens] = query.split(/\s+/);
  const rest = restTokens.join(' ');
  const makes = await queryMakesCatalog();
  const q = first.toLowerCase();
  const make = makes.find((m) => m.name.toLowerCase() === q)
    || makes.find((m) => m.name.toLowerCase().startsWith(q))
    || makes.find((m) => m.name.toLowerCase().includes(q));

  if (make) {
    const models = await searchModels(rest, make.id, 8).catch(() => []);
    const rows = models.length ? models : await searchModels('', make.id, 8).catch(() => []);
    return [make.name, ...rows.map((m) => `${make.name} ${m.name}`)];
  }

  const byId = new Map(makes.map((m) => [String(m.id), m.name]));
  const models = await searchModels(query, null, 8).catch(() => []);
  return models
    .map((m) => {
      const makeName = byId.get(String(m.make_id)) || '';
      return makeName ? `${makeName} ${m.name}` : '';
    })
    .filter(Boolean);
}

function bindQuerySuggest() {
  const wrap = document.querySelector('[data-query-suggest]');
  if (!wrap) return;
  const input = wrap.querySelector('input[name="query"]');
  const list = wrap.querySelector('.combo-list');
  const form = input?.closest('form');
  if (!input || !list || !form) return;
  let timer = null;
  let seq = 0;

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  };

  const run = async () => {
    const stamp = ++seq;
    const items = await querySuggestions(input.value);
    if (stamp !== seq) return;
    if (!items.length) {
      close();
      return;
    }
    list.innerHTML = items
      .map((label) => `<li class="combo-option" role="option"><span>${escapeHtml(label)}</span></li>`)
      .join('');
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  input.addEventListener('input', () => {
    clearTimeout(timer);
    if (input.value.trim().length < 2) {
      close();
      return;
    }
    timer = setTimeout(run, 200);
  });

  list.addEventListener('mousedown', (event) => {
    const option = event.target.closest('.combo-option');
    if (!option) return;
    event.preventDefault();
    seq += 1; // drop any in-flight suggestion render
    clearTimeout(timer);
    input.value = option.textContent.trim();
    close();
    applyFormFilters(form);
  });

  input.addEventListener('blur', () => setTimeout(close, 140));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
}

function initCombos() {
  document.querySelectorAll('.combo[data-combo]').forEach((combo) => {
    const kind = combo.dataset.combo;
    const input = combo.querySelector('.combo-input');
    const list = combo.querySelector('.combo-list');
    const clear = combo.querySelector('.combo-clear');
    let timer = null;

    const run = async () => {
      if (input.disabled) return;
      renderComboList(combo, await comboSearch(kind, input.value.trim()));
    };

    input.addEventListener('focus', run);
    input.addEventListener('input', () => {
      if (input.disabled) return;
      clear.hidden = !input.value;
      clearTimeout(timer);
      timer = setTimeout(run, 150);
      setComboValue(kind, input.value.trim(), ''); 
    });
    
    list.addEventListener('mousedown', (event) => {
      const opt = event.target.closest('.combo-option');
      if (!opt) return;
      event.preventDefault();
      chooseComboOption(combo, opt);
    });
    input.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        if (list.hidden) {
          run();
          return;
        }
        const current = Number(list.dataset.activeIndex || 0);
        setActiveComboOption(list, current + (event.key === 'ArrowDown' ? 1 : -1));
      }
      if (event.key === 'Enter') {
        const active = list.querySelector('.combo-option.is-active');
        if (active && !list.hidden) {
          event.preventDefault();
          chooseComboOption(combo, active);
        }
      }
      if (event.key === 'Escape') setComboOpen(combo, false);
    });
    input.addEventListener('blur', () => setTimeout(() => setComboOpen(combo, false), 140));
    clear.addEventListener('click', () => {
      input.value = '';
      clear.hidden = true;
      setComboOpen(combo, false);
      setComboValue(kind, '', '');
      input.focus();
    });
  });

  
  
  const modelCombo = document.querySelector('.combo[data-combo="model"]');
  modelCombo?.addEventListener('click', () => {
    if (!modelCombo.classList.contains('is-disabled')) return;
    const makeControl = document.querySelector('.combo[data-combo="make"] .combo-control');
    const makeInput = document.querySelector('.combo[data-combo="make"] .combo-input');
    makeControl?.classList.add('is-flash');
    setTimeout(() => makeControl?.classList.remove('is-flash'), 900);
    makeInput?.focus();
  });
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

function applyFormFilters(form) {
  currentFilters = readFiltersFromForm(form);
  pagesShown = 1;
  update();
}

function bindEvents() {
  const form = document.querySelector('#filters-form');


  
  form?.addEventListener('change', (event) => {
    if (event.target.classList.contains('combo-input')) return; 
    applyFormFilters(form);
  });

  let queryTimer = null;
  form?.querySelector('[name="query"]')?.addEventListener('input', () => {
    clearTimeout(queryTimer);
    queryTimer = setTimeout(() => applyFormFilters(form), 250);
  });

  form?.addEventListener('submit', (event) => event.preventDefault());

  document.querySelector('#filter-lite-toggle')?.addEventListener('click', () => {
    filtersLite = !filtersLite;
    renderAll();
  });

  document.querySelector('#filters-reset')?.addEventListener('click', () => {
    currentFilters = emptyFilters();
    pagesShown = 1;
    syncFiltersToURL(); // otherwise a refresh re-applies the cleared filters
    renderAll();
  });

  document.querySelector('#sort-select')?.addEventListener('change', (event) => {
    currentFilters.sort = event.target.value;
    pagesShown = 1;
    update();
  });

  document.querySelector('#load-more-wrap')?.addEventListener('click', (event) => {
    if (!event.target.closest('#load-more')) return;
    pagesShown += 1;
    update();
  });

  
  const openFilters = () => {
    document.body.classList.add('filters-open');
    document.querySelector('#filters-overlay')?.removeAttribute('hidden');
  };
  const closeFilters = () => {
    document.body.classList.remove('filters-open');
    document.querySelector('#filters-overlay')?.setAttribute('hidden', '');
  };
  document.querySelector('#filters-toggle')?.addEventListener('click', openFilters);
  document.querySelector('#filters-close')?.addEventListener('click', closeFilters);
  document.querySelector('#filters-overlay')?.addEventListener('click', closeFilters);

  
  
  document.querySelector('#filters-search')?.addEventListener('click', () => {
    applyFormFilters(form);
    closeFilters();
    if (window.matchMedia('(max-width: 980px)').matches) {
      document.querySelector('.results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  
  document.querySelectorAll('.view-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const view = btn.dataset.view;
      if (view === currentView) return;
      currentView = view;
      document.querySelectorAll('.view-btn').forEach((b) => {
        const active = b.dataset.view === currentView;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      const list = document.querySelector('#car-list');
      if (list) list.className = `car-list view-${currentView}`;
    });
  });

  
  document.querySelector('#car-list')?.addEventListener('click', (event) => {
    if (!event.target.closest('#empty-reset')) return;
    currentFilters = emptyFilters();
    pagesShown = 1;
    syncFiltersToURL();
    renderAll();
  });

  document.querySelector('#sticky-cta-close')?.addEventListener('click', () => {
    try {
      window.sessionStorage.setItem(STICKY_CTA_DISMISSED_KEY, '1');
    } catch (_err) {  }
    document.querySelector('#sticky-cta')?.remove();
  });

  bindDragRails();
}


document.addEventListener('click', (event) => {
  if (event.target.closest('[data-mycar-edit]')) openMyCarModal();
});


document.addEventListener('autoswap:mycar', () => {
  pagesShown = 1;
  renderAll();
});

function renderAll() {
  document.querySelector('#app').innerHTML = CatalogPage();
  bindEvents();
  initCombos();
  bindQuerySuggest();
}

async function hydrateFromSupabase() {
  const mapped = await fetchFeed();
  if (mapped !== null && mapped.length) {
    allCars = mapped;
    pagesShown = 1;
    renderAll(); 
  }
}

renderAll();
hydrateFromSupabase();
