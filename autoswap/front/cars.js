/* AutoSwap — cars product page (match market).
   Built around the viewer's car, not generic inventory: a persistent "my car"
   strip, compatibility badges, swap-intent filters in three groups, trade
   cards with trust strips, and a structured offer flow. Shares chrome,
   helpers, the Supabase read path and the demo dataset via window.AutoSwap.
   Filtering is client-side over the loaded feed. */
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
  openMyCarModal,
  matchLevel,
  daysSince,
} = window.AutoSwap;

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

const PAGE_SIZE = 8;
const STICKY_CTA_DISMISSED_KEY = 'autoswap_cta_dismissed';

let allCars = DEMO_CARS.slice();
let currentFilters = readFiltersFromURL();
let pagesShown = 1;

const SORT_OPTIONS = [
  { value: 'match', label: 'ჩემი შესაბამისობით', needsCar: true },
  { value: 'new', label: 'ახალი პირველი' },
  { value: 'year_desc', label: 'წელი — კლებადობით' },
  { value: 'year_asc', label: 'წელი — ზრდადობით' },
  { value: 'mileage_asc', label: 'გარბენი — ზრდადობით' },
  { value: 'value_asc', label: 'ღირებულება — ზრდადობით' },
  { value: 'value_desc', label: 'ღირებულება — კლებადობით' },
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
    onlyMatches: '', verified: '', fresh: '',
    modelTerms: [],
    sort: '',
  };
}

function readFiltersFromURL() {
  const p = new URLSearchParams(window.location.search);
  const f = emptyFilters();
  Object.keys(f).forEach((key) => {
    const value = p.get(key);
    if (value) f[key] = value.trim();
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

function selectField(name, labelText, values, selected, allText, labelMap) {
  return `
    <label class="filter-field">
      <span class="filter-label">${labelText}</span>
      <select name="${name}">
        <option value="">${allText}</option>
        ${optionTags(values, selected, labelMap)}
      </select>
    </label>
  `;
}

/* Searchable make/model picker — type any fragment, matches the car catalog
   (Supabase car_makes / car_models, "contains" search) and filters listings. */
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

/* How many filters the user actually engaged — drives the mobile badge. */
function activeFilterCount() {
  const skip = ['makeId', 'modelGroup', 'modelTerms', 'sort'];
  return Object.entries(currentFilters)
    .filter(([key, value]) => !skip.includes(key) && value && String(value).length)
    .length;
}

/* ---- Filter sidebar: 3 swap-intent groups + a "more" fold ---- */
function FiltersSidebar(count) {
  const categories = uniqueSorted(allCars.map((c) => c.category));
  const fuels = uniqueSorted(allCars.map((c) => c.fuelType));
  const transmissions = uniqueSorted(allCars.map((c) => c.transmission));
  const cities = uniqueSorted(allCars.map((c) => c.city));
  const years = Array.from(new Set(allCars.map((c) => c.yearNum).filter(Boolean)))
    .sort((a, b) => b - a);
  const f = currentFilters;
  const myCar = getMyCar();
  const moreOpen = (f.transmission || f.fuel || f.mileageMin || f.mileageMax || f.valueMin || f.valueMax) ? ' open' : '';

  return `
    <aside class="filters" aria-label="ფილტრები">
      <form class="filters-form" id="filters-form">
        <div class="filters-head">
          <span class="filters-title">${icons.filter} ფილტრები</span>
          <button type="button" class="filters-close" id="filters-close" aria-label="ფილტრების დახურვა">&times;</button>
        </div>

        <fieldset class="filter-group">
          <legend class="filter-group-title">რას ეძებ</legend>

          ${comboField('make', 'მარკა', f.make, 'მოძებნე მარკა…')}
          ${comboField('model', 'მოდელი', f.model, 'მოძებნე მოდელი…', !f.makeId)}
          ${selectField('category', 'მანქანის ტიპი', categories, f.category, 'ყველა ტიპი', CATEGORY_LABELS)}

          <div class="filter-field">
            <span class="filter-label">წელი</span>
            <div class="filter-range">
              <select name="yearFrom"><option value="">მინ.</option>${optionTags(years, f.yearFrom)}</select>
              <span class="filter-range-sep">—</span>
              <select name="yearTo"><option value="">მაქს.</option>${optionTags(years, f.yearTo)}</select>
            </div>
          </div>

          <details class="more-filters"${moreOpen}>
            <summary>მეტი ფილტრი</summary>
            <div class="more-filters-body">
              <label class="filter-field">
                <span class="filter-label">ძებნა</span>
                <span class="filter-search">${icons.search}
                  <input type="search" name="query" value="${escapeHtml(f.query || '')}" placeholder="მარკა, მოდელი, ქალაქი…">
                </span>
              </label>
              ${selectField('transmission', 'გადაცემათა კოლოფი', transmissions, f.transmission, 'ყველა', TRANSMISSION_LABELS)}
              ${selectField('fuel', 'საწვავი', fuels, f.fuel, 'ყველა', FUEL_LABELS)}
              <div class="filter-field">
                <span class="filter-label">გარბენი (კმ)</span>
                <div class="filter-range">
                  <input type="number" name="mileageMin" value="${f.mileageMin || ''}" placeholder="მინ." min="0" inputmode="numeric" aria-label="გარბენი დან">
                  <span class="filter-range-sep">—</span>
                  <input type="number" name="mileageMax" value="${f.mileageMax || ''}" placeholder="მაქს." min="0" inputmode="numeric" aria-label="გარბენი მდე">
                </div>
              </div>
              <div class="filter-field">
                <span class="filter-label">ღირებულება (₾)</span>
                <div class="filter-range">
                  <input type="number" name="valueMin" value="${f.valueMin || ''}" placeholder="მინ." min="0" inputmode="numeric" aria-label="ღირებულება დან">
                  <span class="filter-range-sep">—</span>
                  <input type="number" name="valueMax" value="${f.valueMax || ''}" placeholder="მაქს." min="0" inputmode="numeric" aria-label="ღირებულება მდე">
                </div>
              </div>
            </div>
          </details>
        </fieldset>

        <fieldset class="filter-group">
          <legend class="filter-group-title">შენი მხარე</legend>
          ${myCar ? `
            <p class="filter-mycar">${icons.car}<span>${escapeHtml(`${myCar.make} ${myCar.model || ''}`.trim())}${myCar.year ? ` · ${escapeHtml(myCar.year)}` : ''}</span><button type="button" class="filter-mycar-edit" data-mycar-edit>შეცვლა</button></p>
            <label class="filter-check">
              <input type="checkbox" name="onlyMatches" value="1"${f.onlyMatches ? ' checked' : ''}>
              <span>მხოლოდ ვინც ჩემს მანქანას ეძებს</span>
            </label>
          ` : `
            <button type="button" class="filter-mycar-add" data-mycar-edit>${icons.plus} მიუთითე შენი მანქანა</button>
            <p class="filter-mycar-hint">გაიგებ ვის აინტერესებს ის — ფასის გამოქვეყნების გარეშე.</p>
          `}
        </fieldset>

        <fieldset class="filter-group">
          <legend class="filter-group-title">გარიგების პირობები</legend>

          <label class="filter-field">
            <span class="filter-label">თანხის სხვაობა</span>
            <select name="cash">
              <option value="">ყველა</option>
              <option value="none"${f.cash === 'none' ? ' selected' : ''}>თანაბარი გაცვლა</option>
              <option value="add"${f.cash === 'add' ? ' selected' : ''}>ის ამატებს — მე ვიღებ თანხას</option>
              <option value="ask"${f.cash === 'ask' ? ' selected' : ''}>ის ითხოვს — მე ვამატებ</option>
              <option value="flexible"${f.cash === 'flexible' ? ' selected' : ''}>შეთანხმებით</option>
            </select>
          </label>

          ${selectField('city', 'ქალაქი', cities, f.city, 'ყველა ქალაქი')}

          <label class="filter-field">
            <span class="filter-label">განცხადების ასაკი</span>
            <select name="fresh">
              ${FRESH_OPTIONS.map((o) => `<option value="${o.value}"${o.value === f.fresh ? ' selected' : ''}>${o.label}</option>`).join('')}
            </select>
          </label>

          <label class="filter-check">
            <input type="checkbox" name="verified" value="1"${f.verified ? ' checked' : ''}>
            <span>მხოლოდ დადასტურებული მფლობელები</span>
          </label>
        </fieldset>

        <button type="button" class="filters-reset" id="filters-reset">${icons.refresh} ფილტრების გასუფთავება</button>
        <button type="button" class="btn btn-primary filters-apply" id="filters-apply">ნახე <span id="apply-count">${count}</span> შედეგი</button>
      </form>
    </aside>
  `;
}

/* ---- "My car" strip: the spine of the page ---- */
function demandCount() {
  return allCars.filter((car) => matchFor(car)).length;
}

function MyCarStrip() {
  const myCar = getMyCar();
  if (!myCar) {
    return `
      <section class="mycar-panel" id="mycar-strip">
        <div class="mycar-cta">
          <span class="mycar-icon">${icons.car}</span>
          <div class="mycar-copy">
            <strong>დაამატე შენი მანქანა — ნახე ვინ ეძებს მას</strong>
            <small>60 წამი · ფასის დადება არ გჭირდება · შეთავაზებები მოდის პირდაპირ შენთან</small>
          </div>
          <button type="button" class="btn btn-accent mycar-btn" data-mycar-edit>${icons.plus} დამატება</button>
        </div>
      </section>
    `;
  }

  const label = `${myCar.make} ${myCar.model || ''}`.trim() + (myCar.year ? ` · ${myCar.year}` : '');
  const demand = demandCount();
  return `
    <section class="mycar-panel" id="mycar-strip">
      <div class="mycar-active">
        <span class="mycar-icon">${icons.car}</span>
        <div class="mycar-copy">
          <strong>${escapeHtml(label)}</strong>
          <small id="mycar-demand">${demand
            ? `შენს მანქანას ეძებს <b>${demand}</b> განცხადება`
            : 'ჯერ პირდაპირი მოთხოვნა არ ჩანს — ფილტრები მაინც შენზეა მორგებული'}</small>
        </div>
        <label class="matches-toggle">
          <input type="checkbox" id="matches-toggle"${currentFilters.onlyMatches ? ' checked' : ''}>
          <span>მხოლოდ ჩემი მატჩები</span>
        </label>
        <button type="button" class="mycar-edit" data-mycar-edit>შეცვლა</button>
      </div>
    </section>
  `;
}

// Compatibility badge — the product's differentiator, rendered in 20px.
function matchBadge(match) {
  if (match === 'mutual') return `<span class="match-badge match-badge--mutual">${icons.swap} ორმხრივი მატჩი</span>`;
  if (match === 'reverse') return `<span class="match-badge match-badge--reverse">${icons.search} ეძებს შენნაირ მანქანას</span>`;
  return '';
}

// Cash sentence: icon + explicit subject, color by direction.
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
    // Live feed without the profiles join yet — show only what we know.
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

/* ---- Trade card: their car / the terms / the human ---- */
function CarRow(car) {
  const match = matchFor(car);
  // Essential specs only — body type is visible in the photo.
  const statRow = [
    car.mileage ? { label: 'გარბენი', value: car.mileage } : null,
    car.fuel ? { label: 'საწვავი', value: car.fuel } : null,
    car.transmissionLabel ? { label: 'გადაცემათა', value: car.transmissionLabel } : null,
    car.estimatedValueLabel ? { label: 'ღირებულება', value: `~${car.estimatedValueLabel}` } : null,
  ].filter(Boolean)
    .map((s) => `<div class="stat-cell"><span>${s.label}</span><strong>${s.value}</strong></div>`)
    .join('');

  const detailHref = `vehicle.html?id=${encodeURIComponent(car.id)}`;
  return `
    <article class="car-row trade-card${match ? ` is-${match}` : ''}" data-id="${car.id}">
      <div class="car-row-media">
        <a class="car-row-media-link" href="${detailHref}" aria-label="${car.make} ${car.model} დეტალურად">
          <img src="${car.image}" alt="${car.make} ${car.model}" loading="lazy">
        </a>
        ${car.freshness ? `<span class="fresh-tag">${car.freshness}</span>` : ''}
        <button class="save-btn" type="button" aria-label="${car.make} ${car.model} შენახვა">${icons.heart}</button>
      </div>

      <div class="car-row-body">
        <div class="trade-head">
          <div>
            <h3 class="car-row-title"><a class="card-title-link" href="${detailHref}">${car.make} ${car.model}</a> <span class="car-row-year">${car.year}</span></h3>
            <span class="listing-city">${icons.location}${car.city}</span>
          </div>
          ${matchBadge(match)}
        </div>
        <div class="stat-row stat-row--card">${statRow}</div>
      </div>

      <div class="trade-deal">
        ${car.openToOffers
          ? `<div class="trade-wants trade-wants--open"><span class="wanted-label">ეძებს</span><p class="deal-open">${escapeHtml(car.wants)}</p></div>`
          : `
        <div class="trade-wants">
          <span class="wanted-label">ეძებს</span>
          <div class="wants-chips">${wantsChips(car)}</div>
        </div>`}
        ${cashLine(car)}
        <button class="btn btn-primary car-row-offer" type="button" data-offer data-id="${car.id}" data-make="${car.make}" data-model="${car.model}">${icons.swap} შესთავაზე გაცვლა</button>
      </div>

      ${trustStrip(car)}
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
        ${myCar ? '' : `<button type="button" class="btn btn-primary" data-mycar-edit>დაამატე შენი მანქანა — მატჩი თვითონ მოგძებნის</button>`}
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

function ResultsHead(count) {
  const sort = effectiveSort();
  const hasCar = !!getMyCar();
  const options = SORT_OPTIONS.filter((o) => !o.needsCar || hasCar);
  const filterCount = activeFilterCount();
  return `
    <div class="results-head">
      <p class="results-count"><strong id="results-count">${count}</strong> შედეგი</p>
      <div class="results-controls">
        <button type="button" class="filters-toggle" id="filters-toggle">${icons.filter} ფილტრები${filterCount ? `<span class="filters-toggle-badge" id="filters-badge">${filterCount}</span>` : '<span class="filters-toggle-badge" id="filters-badge" hidden></span>'}</button>
        <label class="results-sort">
          <span class="filter-label">დალაგება</span>
          <select id="sort-select" name="sort">
            ${options.map((o) => `<option value="${o.value}"${o.value === sort ? ' selected' : ''}>${o.label}</option>`).join('')}
          </select>
        </label>
      </div>
    </div>
  `;
}

// One compact, factual line about the trust model. Not marketing — rules.
function TrustNote() {
  return `
    <div class="trust-note">
      ${icons.shield}
      <p>აქ ნომრები ღია არ არის. აგზავნი სტრუქტურირებულ შეთავაზებას → მფლობელი ეთანხმება ან გპასუხობს → კონტაქტი იხსნება მხოლოდ ორმხრივი თანხმობისას.</p>
    </div>
  `;
}

function StickyCTA() {
  if (getMyCar()) return '';
  try {
    if (window.sessionStorage.getItem(STICKY_CTA_DISMISSED_KEY)) return '';
  } catch (_err) { /* ignore */ }
  return `
    <div class="sticky-cta" id="sticky-cta">
      <button type="button" class="btn btn-primary sticky-cta-btn" data-mycar-edit>${icons.plus} დაამატე მანქანა — ნახე ვინ ეძებს მას</button>
      <button type="button" class="sticky-cta-close" id="sticky-cta-close" aria-label="დახურვა">&times;</button>
    </div>
  `;
}

function CatalogPage() {
  const filtered = getFiltered();
  const slice = pageSlice(filtered);
  return `
    ${Header({ active: 'listings' })}
    <main class="catalog-shell">
      <div class="catalog-hero">
        <div class="container catalog-hero-inner">
          <div class="catalog-hero-copy">
            <h1>გაცვალე შენი მანქანა სასურველზე</h1>
            <p>ნახე ვინ რას ცვლის, რა სხვაობით — და გაუგზავნე სტრუქტურირებული შეთავაზება.</p>
            ${TrustNote()}
          </div>
          ${MyCarStrip()}
        </div>
      </div>
      <section class="catalog container">
        ${FiltersSidebar(filtered.length)}
        <div class="filters-overlay" id="filters-overlay" hidden></div>
        <div class="results">
          ${ResultsHead(filtered.length)}
          <div class="car-list" id="car-list">
            ${slice.length ? slice.map(CarRow).join('') : emptyStateHTML()}
          </div>
          <div class="load-more-wrap" id="load-more-wrap">${loadMoreHTML(filtered.length)}</div>
        </div>
      </section>
      ${StickyCTA()}
    </main>
    ${Footer()}
  `;
}

/* ---- Sorting: compatibility first, honesty about open listings ---- */
function rankCar(car) {
  // Lower = higher in the list.
  const match = matchFor(car);
  const matchRank = match === 'mutual' ? 0 : match === 'reverse' ? 1 : 2;
  const openRank = car.openToOffers ? 1 : 0; // concrete wants beat "open"
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
      // Listings without a value estimate sink to the bottom in both directions.
      return copy.sort((a, b) => (a.estimatedValue ?? Infinity) - (b.estimatedValue ?? Infinity));
    case 'value_desc':
      return copy.sort((a, b) => (b.estimatedValue ?? -Infinity) - (a.estimatedValue ?? -Infinity));
    default:
      // 'new' — boosted first, newest after; open-to-offers sinks within tier.
      return copy.sort((a, b) => {
        if (a.openToOffers !== b.openToOffers) return a.openToOffers ? 1 : -1;
        if (a.boosted !== b.boosted) return a.boosted ? -1 : 1;
        return String(b.createdAt).localeCompare(String(a.createdAt));
      });
  }
}

function applyFilters(cars, f) {
  const query = (f.query || '').toLowerCase();
  const yearFrom = Number(f.yearFrom) || null;
  const yearTo = Number(f.yearTo) || null;
  const mileageMin = Number(f.mileageMin) || null;
  const mileageMax = Number(f.mileageMax) || null;
  const valueMin = Number(f.valueMin) || null;
  const valueMax = Number(f.valueMax) || null;
  const maxDays = f.fresh === '' ? null : Number(f.fresh);

  const filtered = cars.filter((car) => {
    const haystack = `${car.make} ${car.model} ${car.year} ${car.city} ${car.wants}`.toLowerCase();
    if (query && !haystack.includes(query)) return false;
    // Make/model use "contains" so catalog picks (e.g. "BMW", "5 Series") match
    // listing values like "BMW", "530i" without needing an exact string.
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

// Mirror the active filters into the URL so any filtered view is a
// shareable / bookmarkable link (and survives refresh).
function syncFiltersToURL() {
  const params = new URLSearchParams();
  Object.entries(currentFilters).forEach(([key, value]) => {
    if (key === 'modelTerms' || key === 'modelGroup') return; // derived state
    if (value) params.set(key, value);
  });
  const query = params.toString();
  window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
}

// Refreshes only the dynamic parts; stable containers (form, chips nav,
// sort select, my-car strip) keep their bound listeners.
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

  const demand = document.querySelector('#mycar-demand');
  if (demand && getMyCar()) {
    const n = demandCount();
    demand.innerHTML = n
      ? `შენს მანქანას ეძებს <b>${n}</b> განცხადება`
      : 'ჯერ პირდაპირი მოთხოვნა არ ჩანს — ფილტრები მაინც შენზეა მორგებული';
  }
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

/* ---- Searchable make/model comboboxes ---- */
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

function initCombos() {
  document.querySelectorAll('.combo').forEach((combo) => {
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
      setComboValue(kind, input.value.trim(), ''); // free text = contains, no catalog id
    });
    // mousedown beats the input's blur so the click registers.
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

  // Disabled model field: clicking it should teach, not ignore — send the
  // user to the make field with a brief highlight.
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

function setFiltersOpen(open) {
  document.body.classList.toggle('filters-open', open);
  const overlay = document.querySelector('#filters-overlay');
  if (overlay) overlay.hidden = !open;
}

function applyFormFilters(form) {
  currentFilters = readFiltersFromForm(form);
  pagesShown = 1;
  update();
}

function bindEvents() {
  const form = document.querySelector('#filters-form');

  // Instant apply: every control change refilters; no submit button.
  form?.addEventListener('change', (event) => {
    if (event.target.classList.contains('combo-input')) return; // combos self-apply
    applyFormFilters(form);
  });

  let queryTimer = null;
  form?.querySelector('[name="query"]')?.addEventListener('input', () => {
    clearTimeout(queryTimer);
    queryTimer = setTimeout(() => applyFormFilters(form), 250);
  });

  form?.addEventListener('submit', (event) => event.preventDefault());

  document.querySelector('#filters-reset')?.addEventListener('click', () => {
    currentFilters = emptyFilters();
    pagesShown = 1;
    renderAll(); // rebuild so all sidebar controls reset to their defaults
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

  // Mobile filter sheet open/close.
  document.querySelector('#filters-toggle')?.addEventListener('click', () => setFiltersOpen(true));
  document.querySelector('#filters-close')?.addEventListener('click', () => setFiltersOpen(false));
  document.querySelector('#filters-overlay')?.addEventListener('click', () => setFiltersOpen(false));
  document.querySelector('#filters-apply')?.addEventListener('click', () => setFiltersOpen(false));

  // "Only my matches" toggle in the my-car strip mirrors the sidebar checkbox.
  document.querySelector('#matches-toggle')?.addEventListener('change', (event) => {
    currentFilters.onlyMatches = event.target.checked ? '1' : '';
    pagesShown = 1;
    update();
  });

  // Empty-state reset (re-rendered with the list, so delegate from the list).
  document.querySelector('#car-list')?.addEventListener('click', (event) => {
    if (!event.target.closest('#empty-reset')) return;
    currentFilters = emptyFilters();
    pagesShown = 1;
    renderAll();
  });

  document.querySelector('#sticky-cta-close')?.addEventListener('click', () => {
    try {
      window.sessionStorage.setItem(STICKY_CTA_DISMISSED_KEY, '1');
    } catch (_err) { /* ignore */ }
    document.querySelector('#sticky-cta')?.remove();
  });
}

// All "add / edit my car" entry points (strip, sidebar, empty state, sticky CTA).
document.addEventListener('click', (event) => {
  if (event.target.closest('[data-mycar-edit]')) openMyCarModal();
});

// Re-render when the viewer's car changes — matching, badges, CTAs all shift.
document.addEventListener('autoswap:mycar', () => {
  pagesShown = 1;
  renderAll();
});

function renderAll() {
  document.querySelector('#app').innerHTML = CatalogPage();
  bindEvents();
  initCombos();
}

async function hydrateFromSupabase() {
  const mapped = await fetchFeed();
  if (mapped !== null && mapped.length) {
    allCars = mapped;
    pagesShown = 1;
    renderAll(); // live data may add new makes/cities → rebuild filters + chips
  }
}

renderAll();
hydrateFromSupabase();
