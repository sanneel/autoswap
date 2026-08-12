
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
  getCurrency,
  getUsdRate,
  onCurrencyChange,
  priceCurrencyToggle,
  getLogoUrl,
  placeComboList,
} = window.AutoSwap;

// On touch the filter combos open keyboard-down: the field is readOnly, the
// dropdown shows its options plus a ძებნა row, and only tapping that row makes
// the field editable and raises the keyboard. On a phone the keyboard covers
// half the page, so it has to be opt-in rather than the price of a tap.
const IS_TOUCH = typeof window.matchMedia === 'function'
  && window.matchMedia('(hover: none) and (pointer: coarse)').matches;

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

const PAGE_SIZE = 24;
const STICKY_CTA_DISMISSED_KEY = 'autoswap_cta_dismissed';
const NUMERIC_FILTER_KEYS = ['yearFrom', 'yearTo', 'mileageMin', 'mileageMax', 'valueMin', 'valueMax', 'cashMin', 'cashMax'];

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

// These five appear as a logo row pinned to the top of the make dropdown and
// as the quick-filter chips. Their logos appear there and nowhere else: every
// row in the list itself is text, these five included.
const FEATURED_MAKES = ['BMW', 'Mercedes-Benz', 'Audi', 'Toyota', 'Porsche'];
const FEATURED_MAKE_SLUGS = new Set(FEATURED_MAKES.map((m) => m.toLowerCase().replace(/[^a-z0-9]+/g, '-')));
function makeSlug(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

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

// The catalog returns some makes in caps (BENTLEY, MERCEDES-BENZ) and others
// in title case, so the chip row read as a mix of shouting and normal words.
// Title-case anything long enough to be a word; 3 letters or fewer is left
// alone so genuine initialisms — BMW, KIA, GMC — are not mangled into Bmw.
function tidyMakeCase(name) {
  const raw = String(name || '');
  if (raw.length <= 3 || raw !== raw.toUpperCase()) return raw;
  return raw.toLowerCase().replace(/(^|[\s\-/])([a-z])/g, (m, sep, ch) => sep + ch.toUpperCase());
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
let currencySubscribed = false;

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
    city: '', cash: '', cashMin: '', cashMax: '', yearFrom: '', yearTo: '', mileageMin: '', mileageMax: '',
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
  // The visible label is a <span>, not a <label>, so it has to be wired to the
  // input by id or a screen reader announces the field with no name at all.
  const labelId = `${kind}-combo-label`;
  return `
    <div class="filter-field">
      <span class="filter-label" id="${labelId}">${labelText}</span>
      <div class="combo${disabledClass}" data-combo="${kind}">
        <span class="filter-search combo-control" role="combobox" aria-haspopup="listbox" aria-expanded="false" aria-owns="${listId}">
          <input type="text" class="combo-input" name="${kind}" autocomplete="off" aria-labelledby="${labelId}" placeholder="${displayPlaceholder}" data-placeholder="${placeholder}" value="${escapeHtml(value || '')}" aria-autocomplete="list" aria-controls="${listId}" aria-expanded="false"${disabledAttr}>
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

function advFilterCount() {
  const f = currentFilters;
  return [
    f.yearFrom || f.yearTo,
    f.valueMin || f.valueMax,
    f.mileageMin || f.mileageMax,
    f.transmission,
    f.fuel,
    f.city,
    f.fresh,
    f.verified,
  ].filter(Boolean).length;
}

function advChips(fieldName, options, currentVal) {
  return `<div class="adv-chips">${options.map((opt) => {
    const val = typeof opt === 'string' ? opt : opt.value;
    const label = typeof opt === 'string' ? opt : opt.label;
    const active = currentVal === val ? ' is-active' : '';
    return `<button type="button" class="adv-chip${active}" data-adv-chip="${escapeHtml(fieldName)}" data-value="${escapeHtml(val)}">${escapeHtml(label)}</button>`;
  }).join('')}</div>`;
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
  const f = currentFilters;
  const myCar = getMyCar();
  const advCount = advFilterCount();

  return `
    <aside class="filters" id="filters" aria-label="ფილტრები">
      <form class="filters-form" id="filters-form">
        <div class="filters-head">
          <div class="filters-title-row">
            <span class="filters-title">${icons.filter} ფილტრები</span>
          </div>
          <button type="button" class="filters-reset" id="filters-reset">${icons.refresh} გასუფთავება</button>
          <button type="button" class="filters-close" id="filters-close" aria-label="დახურვა">&times;</button>
        </div>

        <div class="filters-scroll">
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

        <section class="filter-group">
          <h3 class="filter-group-head">მანქანა</h3>
          ${comboField('make', 'მარკა', f.make, 'მოძებნე მარკა…')}
          ${comboField('model', 'მოდელი', f.model, 'მოძებნე მოდელი…', !f.makeId)}
          <div class="filter-field">
            <span class="filter-label">ტიპი</span>
            ${advChips('category', [{ value: '', label: 'ნებისმიერი' }, ...categories.map((c) => ({ value: c, label: labelFor(CATEGORY_LABELS, c) }))], f.category)}
          </div>
        </section>

        <section class="filter-group">
          <h3 class="filter-group-head">გაცვლის პირობა</h3>
          <div class="filter-field">
            <span class="filter-label">თანხის სხვაობა</span>
            ${advChips('cash', [
              { value: '', label: 'ნებისმიერი' },
              { value: 'none', label: 'თანაბარი' },
              { value: 'add', label: 'ის ამატებს' },
              { value: 'ask', label: 'ის ითხოვს' },
              { value: 'flexible', label: 'შეთანხმებით' },
            ], f.cash)}
          </div>

          <div class="filter-field filter-cash-amount" id="filter-cash-amount"${(f.cash === 'add' || f.cash === 'ask') ? '' : ' hidden'}>
            <span class="filter-label">თანხის ოდენობა <span class="cash-cur-tag" data-cash-cur>${getCurrency() === 'USD' ? '$' : '₾'}</span></span>
            <div class="filter-range">
              <input type="number" name="cashMin" value="${escapeHtml(f.cashMin || '')}" placeholder="მინ." min="0" inputmode="numeric" aria-label="თანხა დან">
              <span class="filter-range-sep">-</span>
              <input type="number" name="cashMax" value="${escapeHtml(f.cashMax || '')}" placeholder="მაქს." min="0" inputmode="numeric" aria-label="თანხა მდე">
            </div>
          </div>

          ${myCar ? `<label class="filter-check">
            <input type="checkbox" name="onlyMatches" value="1"${f.onlyMatches ? ' checked' : ''}>
            <span>ეძებს ჩემნაირ მანქანას</span>
          </label>` : ''}
        </section>

        <button type="button" class="filters-adv-btn" id="filters-adv-btn">
          ${icons.filter} დამატებითი ფილტრები
          <span class="filters-adv-badge" id="filters-adv-badge"${advCount > 0 ? '' : ' hidden'}>${advCount}</span>
        </button>
        </div>

        <div class="filters-actions">
          <button type="button" class="btn btn-ghost filters-clear" id="filters-clear">გასუფთავება</button>
          <button type="button" class="btn btn-primary filters-search" id="filters-search">${icons.search} ძებნა <span class="filters-search-count" id="apply-count">(${getFiltered().length})</span></button>
        </div>
      </form>
    </aside>
  `;
}


function AdvFiltersModal() {
  const f = currentFilters;
  const fuels = uniqueSorted(allCars.map((c) => c.fuelType));
  const transmissions = uniqueSorted(allCars.map((c) => c.transmission));
  const cities = uniqueSorted(allCars.map((c) => c.city));
  const years = Array.from(new Set(allCars.map((c) => c.yearNum).filter(Boolean))).sort((a, b) => b - a);
  const count = getFiltered().length;

  return `
    <div class="adv-modal" id="adv-modal" role="dialog" aria-modal="true" aria-labelledby="adv-modal-title" hidden>
      <div class="adv-modal-backdrop"></div>
      <div class="adv-modal-panel">
        <div class="adv-modal-head">
          <strong id="adv-modal-title">დამატებითი ფილტრები</strong>
          <button type="button" class="adv-modal-close" aria-label="დახურვა">&times;</button>
        </div>
        <div class="adv-modal-body">
          <div class="adv-section">
            <h4 class="adv-section-head">გამოშვების წელი</h4>
            <div class="adv-range">
              <select name="yearFrom" data-adv-field aria-label="გამოშვების წელი დან">
                <option value="">მინ.</option>${optionTags(years, f.yearFrom)}
              </select>
              <span class="adv-range-sep">–</span>
              <select name="yearTo" data-adv-field aria-label="გამოშვების წელი მდე">
                <option value="">მაქს.</option>${optionTags(years, f.yearTo)}
              </select>
            </div>
          </div>
          <div class="adv-section">
            <h4 class="adv-section-head">ღირებულება (₾)</h4>
            <div class="adv-range">
              <input type="number" name="valueMin" data-adv-field aria-label="ღირებულება დან" value="${escapeHtml(f.valueMin || '')}" placeholder="მინ." min="0" inputmode="numeric">
              <span class="adv-range-sep">–</span>
              <input type="number" name="valueMax" data-adv-field aria-label="ღირებულება მდე" value="${escapeHtml(f.valueMax || '')}" placeholder="მაქს." min="0" inputmode="numeric">
            </div>
          </div>
          <div class="adv-section">
            <h4 class="adv-section-head">გარბენი (კმ)</h4>
            <div class="adv-range">
              <input type="number" name="mileageMin" data-adv-field aria-label="გარბენი დან" value="${escapeHtml(f.mileageMin || '')}" placeholder="მინ." min="0" inputmode="numeric">
              <span class="adv-range-sep">–</span>
              <input type="number" name="mileageMax" data-adv-field aria-label="გარბენი მდე" value="${escapeHtml(f.mileageMax || '')}" placeholder="მაქს." min="0" inputmode="numeric">
            </div>
          </div>
          <div class="adv-section">
            <h4 class="adv-section-head">გადაცემათა კოლოფი</h4>
            ${advChips('transmission', [{ value: '', label: 'ნებისმიერი' }, ...transmissions.map((t) => ({ value: t, label: labelFor(TRANSMISSION_LABELS, t) }))], f.transmission)}
          </div>
          <div class="adv-section">
            <h4 class="adv-section-head">საწვავი</h4>
            ${advChips('fuel', [{ value: '', label: 'ნებისმიერი' }, ...fuels.map((t) => ({ value: t, label: labelFor(FUEL_LABELS, t) }))], f.fuel)}
          </div>
          <div class="adv-section">
            <h4 class="adv-section-head">ქალაქი</h4>
            ${advChips('city', [{ value: '', label: 'ნებისმიერი' }, ...cities], f.city)}
          </div>
          <div class="adv-section">
            <h4 class="adv-section-head">განცხადების ასაკი</h4>
            ${advChips('fresh', FRESH_OPTIONS, f.fresh)}
          </div>
          <div class="adv-section">
            <label class="adv-check">
              <input type="checkbox" data-adv-field name="verified" value="1"${f.verified ? ' checked' : ''}>
              <span>დადასტურებული მფლობელი</span>
            </label>
          </div>
        </div>
        <div class="adv-modal-foot">
          <button type="button" class="btn btn-ghost adv-clear-btn">გასუფთავება</button>
          <button type="button" class="btn btn-primary adv-apply-btn">ძებნა <span id="adv-foot-count">(${count})</span></button>
        </div>
      </div>
    </div>
  `;
}

function matchBadge(match) {
  if (match === 'mutual') return `<span class="match-badge match-badge--mutual">${icons.swap} ორმხრივი მატჩი</span>`;
  if (match === 'reverse') return `<span class="match-badge match-badge--reverse">${icons.search} ეძებს შენნაირ მანქანას</span>`;
  return '';
}


// Category price baselines for the "კარგი ფასი" badge, recomputed whenever the
// feed changes so the claim reflects what is actually on the market. A category
// needs a real sample before we call anything a deal — with three listings the
// "average" is noise, and a false badge is worse than no badge.
const GOOD_PRICE_RATIO = 0.88;
const GOOD_PRICE_MIN_SAMPLE = 5;
let priceBaselines = new Map();

function recomputePriceBaselines() {
  const buckets = new Map();
  allCars.forEach((car) => {
    if (!car.estimatedValue || !car.category) return;
    if (!buckets.has(car.category)) buckets.set(car.category, []);
    buckets.get(car.category).push(car.estimatedValue);
  });
  priceBaselines = new Map();
  buckets.forEach((values, category) => {
    if (values.length < GOOD_PRICE_MIN_SAMPLE) return;
    priceBaselines.set(category, values.reduce((a, b) => a + b, 0) / values.length);
  });
}

function isGoodPrice(car) {
  const baseline = priceBaselines.get(car.category);
  if (!baseline || !car.estimatedValue) return false;
  return car.estimatedValue <= baseline * GOOD_PRICE_RATIO;
}

// Icon-labelled spec row. Reads faster than a comma-separated string because
// the icon carries the category and the eye can skip to the one it wants.
function specStrip(car) {
  const items = [
    car.fuel ? [icons.fuel, car.fuel] : null,
    car.transmissionLabel ? [icons.gear, car.transmissionLabel] : null,
    car.mileage ? [icons.gauge, car.mileage] : null,
  ].filter(Boolean);
  if (!items.length) return '';
  return `<ul class="spec-strip">${items
    .map(([icon, text]) => `<li class="spec-chip">${icon}<span>${escapeHtml(text)}</span></li>`)
    .join('')}</ul>`;
}

function cashLine(car) {
  const iconMap = { add: icons.trendUp, ask: icons.trendDown, flexible: icons.swap, none: icons.equals };
  // Only amounts get the inline flip; "თანაბარი გაცვლა" has no figure to convert.
  const flip = car.cashAmount > 0 ? priceCurrencyToggle() : '';
  return `<p class="trade-cash trade-cash--${car.cashType}">${iconMap[car.cashType] || icons.equals}<span>${escapeHtml(car.cash)}</span>${flip}</p>`;
}

// Exchange-first hierarchy: the first desired-vehicle label (already carries
// make/model, and year when the owner set one, e.g. "BMW 550i 2018") reads as
// a headline; any further wants trail as small chips so they don't compete.
function wantsPrimary(car) {
  const myCar = getMyCar();
  const myMake = myCar ? String(myCar.make || '').toLowerCase().replace(/[^a-z0-9]+/g, '') : '';
  const hasMatch = !!matchFor(car);
  const isMatch = (want) => {
    const normalized = String(want).toLowerCase().replace(/[^a-z0-9]+/g, '');
    return hasMatch && !!myMake && normalized.includes(myMake);
  };
  const [first, ...rest] = car.wantsList;
  const chips = rest.slice(0, 2).map((want) =>
    `<span class="want-chip${isMatch(want) ? ' is-match' : ''}">${escapeHtml(want)}</span>`);
  const moreCount = rest.length - chips.length;
  if (moreCount > 0) chips.push(`<span class="want-chip want-chip--more">+${moreCount}</span>`);
  return `
    <p class="wants-primary${isMatch(first) ? ' is-match' : ''}">${escapeHtml(first)}</p>
    ${chips.length ? `<div class="wants-chips">${chips.join('')}</div>` : ''}
  `;
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
  const detailHref = `/vehicle?id=${encodeURIComponent(car.id)}`;
  const name = escapeHtml(`${car.make} ${car.model}`);
  return `
    <article class="car-card" data-id="${escapeHtml(car.id)}">
      <div class="car-card-media">
        <a class="car-row-media-link" href="${detailHref}" aria-label="${name} დეტალურად">
          <img src="${escapeHtml(car.image)}" alt="${name}" loading="lazy">
        </a>
        <button class="save-btn" type="button" aria-label="${name} შენახვა">${icons.heart}</button>
        ${matchBadge(matchFor(car))}
      </div>

      <div class="car-card-body">
        <div class="car-card-head">
          <h3 class="car-row-title"><a class="card-title-link" href="${detailHref}">${name}</a> <span class="car-row-year">${escapeHtml(car.year)}</span></h3>
          <span class="listing-city">${icons.location}${escapeHtml(car.city)}${car.freshness ? `<span class="listing-age">· ${escapeHtml(car.freshness)}</span>` : ''}</span>
        </div>
        ${specStrip(car)}
        ${isGoodPrice(car) ? `<span class="good-price-badge">${icons.tag} კარგი ფასი</span>` : ''}
      </div>

      <div class="car-card-aside">
        <div class="aside-wants">
          <span class="wanted-label">${icons.search}<b>ეძებს</b></span>
          ${car.openToOffers
            ? '<p class="car-card-wants car-card-wants--open">ნებისმიერ შეთავაზებაზე</p>'
            : wantsPrimary(car)}
        </div>
        ${cashLine(car)}
        <div class="aside-actions">
          <button class="btn btn-primary car-row-offer" type="button" data-offer data-id="${escapeHtml(car.id)}" data-make="${escapeHtml(car.make)}" data-model="${escapeHtml(car.model)}">${icons.swap} შესთავაზე გაცვლა</button>
          <a class="btn btn-ghost car-card-detail" href="${detailHref}">დეტალურად</a>
        </div>
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

// Slugs that actually have a file in assets/logos/. The quickbar used to gate
// logos on FEATURED_MAKES — a hardcoded five — so Hyundai, Ford, Jeep and
// Chevrolet sat as bare text next to a badged BMW and Toyota even though their
// logos were sitting in the repo unused. Gate on what exists instead.
// (The previous QUICK_BRAND_SLUGS map here was dead code, referenced nowhere.)
const LOGO_SLUGS = new Set([
  'audi', 'bmw', 'chevrolet', 'ford', 'honda', 'hyundai', 'jeep', 'kia',
  'lexus', 'mazda', 'mercedes-benz', 'mitsubishi', 'nissan', 'opel',
  'peugeot', 'porsche', 'renault', 'skoda', 'subaru', 'toyota',
  'volkswagen', 'volvo',
]);

// A logo whenever one exists. Brands with no file (Alfa Romeo, Bentley) stay
// text — still no filler glyph, since a generic car icon says nothing the
// word does not already say.
function quickBrandLogo(make) {
  return LOGO_SLUGS.has(makeSlug(make))
    ? `<img src="${escapeHtml(getLogoUrl(make))}" alt="${escapeHtml(make)}" class="quick-chip-brand-logo" loading="lazy">`
    : '';
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
  // Was a hardcoded five (BMW, Mercedes, Audi, Toyota, Porsche), so any other
  // make in the feed never got a chip no matter how many listings it had.
  // Derived from what is actually listed now, most-listed first, capped so the
  // rail stays a shortlist rather than a full index of every make.
  const brandChips = Array.from(allCars.reduce((counts, car) => {
    if (car.make) counts.set(car.make, (counts.get(car.make) || 0) + 1);
    return counts;
  }, new Map()))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([make]) => ({ make, label: tidyMakeCase(displayURLMake(make)) }));
  const routeChips = [
    // No icon: sedan and crossover were both showing the same car glyph, which
    // distinguishes nothing and just pads the chip.
    { label: 'სედანი', href: '/cars?category=sedan', count: countByCategory('sedan'), active: currentFilters.category === 'sedan' },
    { label: 'ქროსოვერი', href: '/cars?category=crossover', count: countByCategory('crossover'), active: currentFilters.category === 'crossover' },
    { label: 'გარეშე', href: '/cars?cash=none', count: countByCash('none'), active: currentFilters.cash === 'none', icon: '<span class="quick-chip-symbol">₾</span>' },
  ].filter((chip) => chip.count > 0);
  const noQuickFilter = !currentFilters.make && !currentFilters.category && !currentFilters.cash;

  return `
    <div class="catalog-quickbar" aria-label="სწრაფი ფილტრები">
      <button class="rail-arrow rail-arrow--prev" type="button" data-rail-prev aria-label="წინა">${icons.arrowRight}</button>
      <nav class="catalog-quickbar-pills quick-chip-strip" data-drag-scroll>
        ${quickChip({ href: '/cars', label: 'ყველა', count: allCars.length, active: noQuickFilter, extraClass: 'quick-chip--all' })}
        <span class="quick-chip-divider" aria-hidden="true"></span>
        ${brandChips.map((brand) => quickChip({
          href: `/cars?make=${encodeURIComponent(brand.make)}`,
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
    ${Header({ active: 'listings', currency: true })}
    <main class="catalog-shell">
      <header class="catalog-topbar">
        <div class="container catalog-topbar-inner">
          <div class="catalog-topbar-copy">
            <h1>ავტომობილები გაცვლისთვის</h1>
            <p><strong>${filtered.length}</strong> აქტიური განცხადება · მოძებნე მარკით, ქალაქით და თანხის სხვაობით</p>
          </div>
          <a class="btn btn-primary catalog-topbar-cta" href="/sell">${icons.plus} დაამატე მანქანა</a>
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
      ${AdvFiltersModal()}
      ${StickyCTA()}
    </main>
    ${Footer({ active: 'listings' })}
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
  // Cash amount is entered in the displayed currency; stored amounts are GEL,
  // so convert the bounds to GEL before comparing.
  const toGel = (n) => (getCurrency() === 'USD' ? Math.round(n * getUsdRate()) : n);
  const cashActive = (f.cash === 'add' || f.cash === 'ask');
  const cashMin = cashActive && Number(f.cashMin) ? toGel(Number(f.cashMin)) : null;
  const cashMax = cashActive && Number(f.cashMax) ? toGel(Number(f.cashMax)) : null;

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
    if (cashMin && (car.cashAmount == null || car.cashAmount < cashMin)) return false;
    if (cashMax && (car.cashAmount == null || car.cashAmount > cashMax)) return false;
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



function updateAdvBadge() {
  const n = advFilterCount();
  const badge = document.querySelector('#filters-adv-badge');
  if (badge) { badge.textContent = String(n); badge.hidden = !n; }
  const footCount = document.querySelector('#adv-foot-count');
  if (footCount) footCount.textContent = `(${getFiltered().length})`;
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
  if (applyCount) applyCount.textContent = `(${filtered.length})`;

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

  updateAdvBadge();

  // (#matches-toggle was a standalone control that no longer renders anywhere;
  // the sidebar checkbox below is the only one left.)
  const sidebarToggle = document.querySelector('#filters-form [name="onlyMatches"]');
  if (sidebarToggle) sidebarToggle.checked = !!currentFilters.onlyMatches;

}

function readFiltersFromForm(form) {
  const data = new FormData(form);
  // Start from currentFilters so advanced-modal values (year, mileage, etc.) are preserved.
  const f = { ...currentFilters };
  // category and cash are chip groups now, not form controls: they live on
  // currentFilters and would be wiped if read from FormData.
  ['query', 'make', 'model', 'cashMin', 'cashMax']
    .forEach((key) => { f[key] = String(data.get(key) || '').trim(); });
  if (f.cash !== 'add' && f.cash !== 'ask') { f.cashMin = ''; f.cashMax = ''; }
  f.onlyMatches = data.get('onlyMatches') ? '1' : '';
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
  // 200 not 40: the catalog holds 156 makes and the dropdown scrolls, so a
  // page-sized cap silently hid the alphabet's second half.
  if (kind === 'make') return searchMakes(term, 200);

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

// Positioning lives in shared.js (placeComboList) so the sell page's dropdown,
// which uses the same .combo-list class, is placed the same way. It used to be
// defined only here, which left that one unpositioned and sitting over its label.
function positionComboList(combo) {
  placeComboList(combo.querySelector('.combo-list'), combo.querySelector('.combo-control'));
}

function setComboOpen(combo, open) {
  const list = combo.querySelector('.combo-list');
  const input = combo.querySelector('.combo-input');
  const control = combo.querySelector('.combo-control');
  if (list) list.hidden = !open;
  if (input) input.setAttribute('aria-expanded', String(open));
  if (control) control.setAttribute('aria-expanded', String(open));
  // Closing re-arms the keyboard suppression: the next tap should again give
  // options first, whatever unlocking happened during this open.
  if (!open && input && combo.dataset.touchLock === '1') input.readOnly = true;
  if (open) positionComboList(combo);
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

// Logos live in the featured row at the top of the make dropdown and nowhere
// else. Repeating them beside list rows made five brands look promoted over the
// rest and turned the list into a logo gallery instead of a list of names.
function featuredMakeRow() {
  return `
    <li class="combo-featured" role="presentation">
      ${FEATURED_MAKES.map((make) => `
        <button type="button" class="combo-featured-tile" data-featured-make="${escapeHtml(make)}" title="${escapeHtml(make)}" aria-label="${escapeHtml(make)}">
          <img src="${escapeHtml(getLogoUrl(make))}" alt="" loading="lazy" width="24" height="24">
        </button>`).join('')}
    </li>`;
}

function renderComboList(combo, items) {
  const list = combo.querySelector('.combo-list');
  combo.__comboItems = items;
  const isMakeCombo = combo.dataset.combo === 'make';
  // Featured tiles only at rest; while filtering, the matches are the answer.
  const comboInput = combo.querySelector('.combo-input');
  const typing = Boolean(comboInput?.value.trim());
  const featured = isMakeCombo && !typing ? featuredMakeRow() : '';
  // The ძებნა row only exists while the field is still locked; once the user
  // unlocks and types, the caret lives in the field and the row is done. It is
  // re-rendered with the list, so it survives every innerHTML rewrite without
  // any focus juggling — the input being typed into is outside this list.
  const unlock = IS_TOUCH && comboInput?.readOnly
    ? '<li class="combo-unlock" role="option" data-combo-unlock><span class="combo-unlock-icon"></span>ძებნა</li>'
    : '';
  list.innerHTML = unlock + (items.length
    ? featured + items.map((it, index) => {
      const type = it.type || 'model';
      const count = type === 'group' && Array.isArray(it.children) ? `<span class="combo-option-meta">${it.children.length} მოდელი</span>` : '';
      return `<li class="combo-option combo-option--${type}" role="option" data-index="${index}" data-name="${escapeHtml(it.name)}" data-id="${escapeHtml(it.id)}"><span class="combo-option-label">${escapeHtml(it.label || it.name)}</span>${count}</li>`;
    }).join('')
    : featured + '<li class="combo-empty">ვერ მოიძებნა</li>');
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
    // Warm the model catalog as soon as a make is settled, so opening the
    // model field is instant instead of waiting on searchMakes → searchModels.
    if (currentFilters.makeId) loadCurrentMakeModels().catch(() => {});
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

    if (IS_TOUCH && input) {
      // Locked until the dropdown's ძებნა row is tapped; the tap on the field
      // still focuses it, so the option list opens keyboard-down.
      input.readOnly = true;
      combo.dataset.touchLock = '1';
    }

    const run = async () => {
      if (input.disabled) return;
      const term = input.value.trim();
      const items = await comboSearch(kind, term);
      renderComboList(combo, items);

      // Typing a name out in full commits it exactly like clicking the option
      // would, so "alfa romeo" unlocks the model field and "giulia" then
      // settles the model without ever touching the dropdown.
      const exact = term
        ? items.find((it) => String(it.name).toLowerCase() === term.toLowerCase())
        : null;
      if (exact) {
        const settled = kind === 'make'
          ? String(currentFilters.makeId) === String(exact.id)
          : currentFilters.model === exact.name;
        if (!settled) setComboValue(kind, exact.name, exact.id, exact);
        return;
      }
      setComboValue(kind, term, '');
    };

    input.addEventListener('focus', run);
    input.addEventListener('input', () => {
      if (input.disabled) return;
      clear.hidden = !input.value;
      clearTimeout(timer);
      // Debounced: setComboValue re-runs the whole filter + list render, so
      // calling it per keystroke made every character feel like a page reload.
      timer = setTimeout(run, 150);
    });
    
    list.addEventListener('mousedown', (event) => {
      // The ძებნა row hands the field back to the keyboard. blur() before
      // focus() because the readonly field is already the active element —
      // without the round trip iOS will not raise the keyboard for it. The
      // __unlocking flag stops the blur handler's deferred close from
      // slamming the dropdown shut mid-handoff.
      const unlockRow = event.target.closest('[data-combo-unlock]');
      if (unlockRow) {
        event.preventDefault();
        combo.__unlocking = true;
        input.readOnly = false;
        input.blur();
        requestAnimationFrame(() => {
          input.focus();
          combo.__unlocking = false;
        });
        return;
      }
      // A featured tile behaves as if the make had been typed, so the model
      // combo unlocks and the results update exactly as they would otherwise.
      const tile = event.target.closest('[data-featured-make]');
      if (tile) {
        event.preventDefault();
        input.value = tile.dataset.featuredMake;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (!IS_TOUCH) input.focus();
        return;
      }
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
    input.addEventListener('blur', () => setTimeout(() => {
      if (!combo.__unlocking) setComboOpen(combo, false);
    }, 140));
    clear.addEventListener('click', () => {
      input.value = '';
      clear.hidden = true;
      setComboOpen(combo, false);
      setComboValue(kind, '', '');
      if (!IS_TOUCH) input.focus();
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
    });

    rail.addEventListener('pointermove', (event) => {
      if (!active) return;
      const delta = event.clientX - startX;
      // Defer capture until real drag begins — capturing on pointerdown
      // retargets the eventual click to the rail and kills chip link clicks.
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

  // The landing page hides its rail arrows once the strip fits (app.js
  // syncRailArrows), but the catalog never did — so the quickbar's prev/next
  // sat there as dead controls, and on a wide screen the left one clipped
  // against the edge of the bar. Same rule here.
  const syncRailArrows = () => {
    root.querySelectorAll('[data-drag-scroll]').forEach((rail) => {
      rail.parentElement?.classList.toggle('rail-no-overflow', rail.scrollWidth <= rail.clientWidth + 1);
    });
  };
  syncRailArrows();
  if (!bindEvents.railResizeBound) {
    bindEvents.railResizeBound = true;
    window.addEventListener('resize', () => {
      const live = document.querySelector('#app') || document;
      live.querySelectorAll('[data-drag-scroll]').forEach((rail) => {
        rail.parentElement?.classList.toggle('rail-no-overflow', rail.scrollWidth <= rail.clientWidth + 1);
      });
    });
  }
}

function applyFormFilters(form) {
  currentFilters = readFiltersFromForm(form);
  pagesShown = 1;
  update();
}

// Open/close live at module scope: renderAll() re-runs bindEvents(), so a
// document-level Escape handler registered in there would stack up one more
// listener per render.
let advLastFocus = null;

function openAdvModal() {
  const modal = document.querySelector('#adv-modal');
  if (!modal) return;
  advLastFocus = document.activeElement;
  modal.removeAttribute('hidden');
  document.body.classList.add('adv-open');
  modal.querySelector('.adv-modal-close')?.focus();
}

function closeAdvModal() {
  const modal = document.querySelector('#adv-modal');
  if (!modal || modal.hasAttribute('hidden')) return;
  modal.setAttribute('hidden', '');
  document.body.classList.remove('adv-open');
  // Return focus to whatever opened it, falling back to the trigger, so
  // keyboard users are not dumped back at the top of the document.
  const back = (advLastFocus && document.contains(advLastFocus))
    ? advLastFocus
    : document.querySelector('#filters-adv-btn');
  back?.focus();
  advLastFocus = null;
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (document.querySelector('#adv-modal')?.hasAttribute('hidden') !== false) return;
  closeAdvModal();
});

function bindEvents() {
  const form = document.querySelector('#filters-form');


  
  form?.addEventListener('change', (event) => {
    if (event.target.classList.contains('combo-input')) return;
    applyFormFilters(form);
  });

  // Reveal the amount inputs only for the "adds / asks money" directions.
  const cashSelect = form?.querySelector('[name="cash"]');
  cashSelect?.addEventListener('change', () => {
    const field = document.querySelector('#filter-cash-amount');
    if (field) field.hidden = !(cashSelect.value === 'add' || cashSelect.value === 'ask');
  });

  // Keep the ₾/$ tag and the amount conversion in sync with the header toggle.
  // Subscribed once: bindEvents() re-runs on every renderAll(), and there is no
  // unsubscribe, so re-subscribing here stacked a duplicate callback per render.
  if (!currencySubscribed && typeof onCurrencyChange === 'function') {
    currencySubscribed = true;
    onCurrencyChange((cur) => {
      document.querySelectorAll('[data-cash-cur]').forEach((el) => { el.textContent = cur === 'USD' ? '$' : '₾'; });
      const liveForm = document.querySelector('#filters-form');
      if (liveForm) applyFormFilters(liveForm);
    });
  }

  let queryTimer = null;
  form?.querySelector('[name="query"]')?.addEventListener('input', () => {
    clearTimeout(queryTimer);
    queryTimer = setTimeout(() => applyFormFilters(form), 250);
  });

  form?.addEventListener('submit', (event) => event.preventDefault());

  // Advanced filters modal
  const advModal = document.querySelector('#adv-modal');
  document.querySelector('#filters-adv-btn')?.addEventListener('click', openAdvModal);
  advModal?.querySelector('.adv-modal-close')?.addEventListener('click', closeAdvModal);
  advModal?.querySelector('.adv-modal-backdrop')?.addEventListener('click', closeAdvModal);

  // Chip groups are radio-style: one value per group. The same component now
  // serves the sidebar (type, cash direction) and the advanced sheet, so the
  // handler is delegated from the document and marks every copy of the group
  // wherever it is rendered.
  document.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-adv-chip]');
    if (!chip) return;
    const field = chip.dataset.advChip;
    const value = chip.dataset.value;
    currentFilters[field] = value;
    document.querySelectorAll(`[data-adv-chip="${field}"]`).forEach((c) => {
      c.classList.toggle('is-active', c.dataset.value === value);
    });
    // The amount inputs only apply to the two directional cash modes.
    if (field === 'cash') {
      const amountField = document.querySelector('#filter-cash-amount');
      if (amountField) amountField.hidden = !(value === 'add' || value === 'ask');
      if (value !== 'add' && value !== 'ask') { currentFilters.cashMin = ''; currentFilters.cashMax = ''; }
    }
    // Sidebar chips filter immediately; the sheet waits for its apply button.
    if (chip.closest('#adv-modal')) updateAdvBadge();
    else { pagesShown = 1; update(); }
  });

  // Range selects and text inputs inside modal
  advModal?.addEventListener('change', (event) => {
    const el = event.target;
    if (!el.hasAttribute('data-adv-field')) return;
    currentFilters[el.name] = el.type === 'checkbox' ? (el.checked ? el.value : '') : el.value;
    updateAdvBadge();
  });
  // Debounced: updateAdvBadge() runs a full filter+sort, and doing that on
  // every keystroke of a range input janks once the feed is real-sized.
  let advInputTimer = null;
  advModal?.addEventListener('input', (event) => {
    const el = event.target;
    if (el.tagName !== 'INPUT' || el.type === 'checkbox' || !el.hasAttribute('data-adv-field')) return;
    currentFilters[el.name] = el.value;
    clearTimeout(advInputTimer);
    advInputTimer = setTimeout(updateAdvBadge, 200);
  });

  // Clear all advanced fields
  advModal?.querySelector('.adv-clear-btn')?.addEventListener('click', () => {
    ['yearFrom', 'yearTo', 'valueMin', 'valueMax', 'mileageMin', 'mileageMax',
      'transmission', 'fuel', 'city', 'fresh', 'verified'].forEach((key) => { currentFilters[key] = ''; });
    advModal.querySelectorAll('[data-adv-chip]').forEach((c) => {
      c.classList.toggle('is-active', c.dataset.value === '');
    });
    advModal.querySelectorAll('[data-adv-field]').forEach((el) => {
      if (el.type === 'checkbox') el.checked = false;
      else el.value = '';
    });
    pagesShown = 1;
    update();
  });

  // Apply and close
  advModal?.querySelector('.adv-apply-btn')?.addEventListener('click', () => {
    clearTimeout(advInputTimer);
    pagesShown = 1;
    update();
    closeAdvModal();
  });

  // Both the icon reset in the sheet header and the გასუფთავება button in the
  // sticky footer clear everything — same action, two reachable places, the
  // footer one so it sits beside ძებნა the way the advanced sheet does.
  const clearAllFilters = () => {
    currentFilters = emptyFilters();
    pagesShown = 1;
    syncFiltersToURL(); // otherwise a refresh re-applies the cleared filters
    renderAll();
  };
  document.querySelector('#filters-reset')?.addEventListener('click', clearAllFilters);
  document.querySelector('#filters-clear')?.addEventListener('click', clearAllFilters);

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

// Picking a brand chip navigates, and the reloaded page rendered the strip at
// scrollLeft 0. A chip further along (Toyota, Porsche) was then off-screen, so
// the filter you just applied looked like it had scrolled away on its own.
// Centre it instead, without scrolling the page.
function revealActiveQuickChip() {
  const strip = document.querySelector('.catalog-quickbar-pills');
  const active = strip?.querySelector('a.is-active');
  if (!strip || !active) return;
  if (strip.scrollWidth <= strip.clientWidth) return;
  const centred = active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2;
  strip.scrollLeft = Math.max(0, Math.min(centred, strip.scrollWidth - strip.clientWidth));
}

function renderAll() {
  // Before the markup: CarRow reads the baselines to decide the good-price badge.
  recomputePriceBaselines();
  document.querySelector('#app').innerHTML = CatalogPage();
  bindEvents();
  initCombos();
  bindQuerySuggest();
  revealActiveQuickChip();
}

async function hydrateFromSupabase() {
  const mapped = await fetchFeed();
  if (mapped !== null && mapped.length) {
    allCars = mapped;
    recomputePriceBaselines();
    pagesShown = 1;
    renderAll();
  }
}

renderAll();
hydrateFromSupabase();
