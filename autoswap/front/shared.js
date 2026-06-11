/* ===================================================================
   AutoSwap — shared module (window.AutoSwap)
   Used by both the landing (app.js) and the cars product page (cars.js).
   Holds: assets, icons, Header/Footer markup, label maps + mappers,
   the Supabase read path, and a feed-shaped demo dataset.
   No framework — plain script, exposed on window.AutoSwap.
=================================================================== */
(function () {
  const assets = {
    road: '../assets/hero-road-bg.png',
    logo: '../assets/autoswap-logo.png',
    bmw: '../assets/hero-bmw-530i.png',
    audi: '../assets/hero-audi-a6.png',
    porsche: '../assets/hero-porsche-aligned.png?v=4',
    revs: {
      bmw: '../assets/bmw-rev.mp3',
      porsche: '../assets/porsche-rev.mp3',
    },
    cards: [
      '../assets/swap-card-1.webp',
      '../assets/swap-card-2.webp',
      '../assets/swap-card-3.webp',
      '../assets/swap-card-4.webp',
    ],
  };

  const icons = {
    arrowRight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
    car: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 17h14"></path><path d="M6 17v2"></path><path d="M18 17v2"></path><path d="M4 13l2.1-5.1A3 3 0 0 1 8.9 6h6.2a3 3 0 0 1 2.8 1.9L20 13"></path><path d="M5 13h14v4H5z"></path><path d="M7.5 15h.1"></path><path d="M16.4 15h.1"></path></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"></path></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg>',
    headset: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 13a8 8 0 0 1 16 0"></path><path d="M4 13v4a2 2 0 0 0 2 2h1v-6H6a2 2 0 0 0-2 2Z"></path><path d="M20 13v4a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z"></path><path d="M16 21h-4"></path></svg>',
    location: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>',
    medal: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="5"></circle><path d="m9 13-2 8 5-3 5 3-2-8"></path></svg>',
    message: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 13a7 7 0 0 1-7 7H7l-4 3v-9a7 7 0 0 1 7-7h4a7 7 0 0 1 7 6Z"></path></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>',
    search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="m21 21-4.35-4.35"></path></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path><path d="m9 12 2 2 4-5"></path></svg>',
    swap: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 2l4 4-4 4"></path><path d="M3 11V8a2 2 0 0 1 2-2h16"></path><path d="M7 22l-4-4 4-4"></path><path d="M21 13v3a2 2 0 0 1-2 2H3"></path></svg>',
    gauge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a2 2 0 1 0 2-2"></path><path d="M4 18a8 8 0 1 1 16 0"></path><path d="m12 12 4-3"></path></svg>',
    fuel: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 21h12V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2Z"></path><path d="M15 9h2.5a1.5 1.5 0 0 1 1.5 1.5V17a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.8a2 2 0 0 0-.6-1.4L19 6"></path><path d="M6 8h6"></path></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v16"></path><path d="M18 4v16"></path><path d="M6 8h12"></path><circle cx="6" cy="5" r="1.6"></circle><circle cx="18" cy="5" r="1.6"></circle><circle cx="6" cy="20" r="1.6"></circle></svg>',
    filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16"></path><path d="M7 12h10"></path><path d="M10 19h4"></path></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.3 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.5l5.9-.9Z"></path></svg>',
    trendUp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"></path><path d="M15 7h6v6"></path></svg>',
    trendDown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7l6 6 4-4 8 8"></path><path d="M15 17h6v-6"></path></svg>',
    equals: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h14"></path><path d="M5 15h14"></path></svg>',
    refresh: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.4"></path><path d="M21 4v5h-5"></path></svg>',
    tag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9Z"></path><circle cx="7.5" cy="7.5" r="1.4"></circle></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"></path><path d="M16 8.5a4 4 0 0 1 0 7"></path><path d="M19 5.5a8 8 0 0 1 0 13"></path></svg>',
    user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"></circle><path d="M4 21a8 8 0 0 1 16 0"></path></svg>',
  };

  // ---- Display label maps -------------------------------------------------
  const FUEL_LABELS = {
    petrol: 'ბენზინი',
    diesel: 'დიზელი',
    hybrid: 'ჰიბრიდი',
    electric: 'ელექტრო',
    lpg: 'გაზი',
  };

  const TRANSMISSION_LABELS = {
    automatic: 'ავტომატიკა',
    manual: 'მექანიკა',
    tiptronic: 'ტიპტრონიკი',
    variator: 'ვარიატორი',
  };

  const CATEGORY_LABELS = {
    sedan: 'სედანი',
    suv: 'ჯიპი',
    crossover: 'კროსოვერი',
    hatchback: 'ჰეჩბექი',
    coupe: 'კუპე',
    minivan: 'მინივენი',
    pickup: 'პიკაპი',
    universal: 'უნივერსალი',
  };

  function labelFor(map, value) {
    if (!value) return '';
    return map[String(value).toLowerCase()] || value;
  }

  function fuelLabel(value) {
    return labelFor(FUEL_LABELS, value);
  }

  // Cash sentence with an explicit subject ("ის" = the listing owner) so the
  // reader never has to compute who pays whom.
  function formatCash(mode, amount) {
    const money = `${(Number(amount) || 0).toLocaleString('en-US')} ₾`;
    switch (mode) {
      case 'add_money':
        return { cash: `ის ამატებს ${money}`, cashType: 'add' };
      case 'ask_money':
        return { cash: `ის ითხოვს ${money}`, cashType: 'ask' };
      case 'flexible':
        return { cash: 'სხვაობა შეთანხმებით', cashType: 'flexible' };
      default:
        return { cash: 'თანაბარი გაცვლა', cashType: 'none' };
    }
  }

  // Listing freshness ("დღეს", "გუშინ", "N დღის წინ") from created_at.
  function daysSince(iso) {
    if (!iso) return null;
    const then = new Date(iso).getTime();
    if (Number.isNaN(then)) return null;
    return Math.max(0, Math.floor((Date.now() - then) / 86400000));
  }

  function freshnessLabel(iso) {
    const days = daysSince(iso);
    if (days == null) return '';
    if (days === 0) return 'დღეს';
    if (days === 1) return 'გუშინ';
    return `${days} დღის წინ`;
  }

  function fallbackImageFor(make) {
    return String(make || '').toLowerCase().includes('bmw') ? assets.bmw : assets.audi;
  }

  // Maps a public_vehicle_feed row (also the shape of DEMO_FEED) to a uniform
  // card object carrying BOTH display strings and raw values for filtering.
  // Bare "any car" labels carry zero swap intent — strip them so such
  // listings fall into the open-to-offers category instead of faking a want.
  // Qualified wants like "ნებისმიერი SUV" are real intent and stay.
  function isAnyCarLabel(label) {
    const text = String(label || '').toLowerCase().trim();
    return !text
      || /^ნებისმიერი(\s+(მანქანა|ავტომობილი))?$/.test(text)
      || text === 'any' || text === 'any car' || text === 'anything';
  }

  function mapFeedRow(row) {
    const { cash, cashType } = formatCash(row.cash_mode, row.cash_amount);
    const labels = Array.isArray(row.desired_vehicle_labels)
      ? row.desired_vehicle_labels.filter((label) => !isAnyCarLabel(label))
      : [];

    return {
      id: row.id,
      badge: row.is_boosted ? 'TOP შეთავაზება' : 'ახალი',
      boosted: !!row.is_boosted,

      make: row.make || '',
      model: row.model || '',

      year: row.year != null ? String(row.year) : '',
      yearNum: row.year != null ? Number(row.year) : null,

      mileage: row.mileage != null ? `${Number(row.mileage).toLocaleString('en-US')} კმ` : '',
      mileageNum: row.mileage != null ? Number(row.mileage) : null,

      fuel: fuelLabel(row.fuel_type),
      fuelType: row.fuel_type ? String(row.fuel_type).toLowerCase() : '',

      transmission: row.transmission ? String(row.transmission).toLowerCase() : '',
      transmissionLabel: labelFor(TRANSMISSION_LABELS, row.transmission),

      category: row.category ? String(row.category).toLowerCase() : '',
      categoryLabel: labelFor(CATEGORY_LABELS, row.category),

      city: row.city || '',

      // Structured wants. Listings with no targets are honestly categorized
      // as "open to offers" — they must never pretend to want "any car".
      wantsList: labels,
      openToOffers: labels.length === 0,
      wants: labels.length ? labels.join(' / ') : 'ღიაა შემოთავაზებებისთვის',
      cash,
      cashType,
      cashMode: row.cash_mode || 'none',
      cashAmount: Number(row.cash_amount) || 0,

      // Owner trust aggregates. Supplied by the demo feed today; the
      // public_vehicle_feed view gains these via a profiles join (no raw PII).
      ownerName: row.owner_name || '',
      ownerVerified: !!row.owner_phone_verified,
      ownerSwaps: Number(row.owner_completed_swaps) || 0,
      ownerResponseHours: row.owner_response_hours != null ? Number(row.owner_response_hours) : null,
      ownerActiveToday: !!row.owner_active_today,

      createdAt: row.created_at || '',
      freshness: freshnessLabel(row.created_at),
      image: row.cover_photo_url || fallbackImageFor(row.make),
    };
  }

  // ---- "My car" context (the viewer's half of the trade) -------------------
  // Stored locally for now; becomes the signed-in user's garage later.
  const MY_CAR_KEY = 'autoswap_my_car';

  function getMyCar() {
    try {
      const raw = window.localStorage.getItem(MY_CAR_KEY);
      const car = raw ? JSON.parse(raw) : null;
      return car && car.make ? car : null;
    } catch (_err) {
      return null;
    }
  }

  function setMyCar(car) {
    try {
      window.localStorage.setItem(MY_CAR_KEY, JSON.stringify(car));
    } catch (_err) { /* private mode — context just won't persist */ }
    document.dispatchEvent(new CustomEvent('autoswap:mycar'));
  }

  function clearMyCar() {
    try {
      window.localStorage.removeItem(MY_CAR_KEY);
    } catch (_err) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('autoswap:mycar'));
  }

  function normMatchText(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  // Does a desired-vehicle label ("BMW 5 Series", "Camry") cover this car?
  // Pragmatic series-level matching; the server-side matcher is the authority.
  function wantCoversCar(want, make, model) {
    const w = normMatchText(want);
    if (!w) return false;
    const mk = normMatchText(make);
    const md = normMatchText(model);
    if (mk && w === mk) return true;                       // wants the whole make
    if (md && (w.includes(md) || (md.length >= 3 && md.includes(w)))) return true;
    if (mk && w.startsWith(mk)) {
      const rest = w.slice(mk.length);
      if (!rest) return true;
      if (md && (md.includes(rest) || rest.includes(md))) return true;
      if (md && rest[0] && md[0] === rest[0]) return true; // "5series" ≈ "530i"
    }
    return false;
  }

  // 'mutual'  — they want your car AND you want theirs.
  // 'reverse' — they want your car.
  // ''        — no compatibility signal.
  // Open-to-offers listings never claim to want your car.
  function matchLevel(car, myCar) {
    if (!myCar || !myCar.make || !Array.isArray(car.wantsList) || !car.wantsList.length) return '';
    const theyWantMine = car.wantsList.some((w) => wantCoversCar(w, myCar.make, myCar.model));
    if (!theyWantMine) return '';
    const iWantTheirs = (myCar.wants || []).some((w) => wantCoversCar(w, car.make, car.model));
    return iWantTheirs ? 'mutual' : 'reverse';
  }

  // ---- Shared chrome ------------------------------------------------------
  function Header(opts) {
    const options = opts || {};
    const active = options.active || 'listings';
    // "Add your car" moved from the nav into the CTA — it is the conversion
    // action, not a navigation item.
    const nav = [
      { id: 'listings', label: 'გაცვლები', href: 'cars.html' },
      { id: 'contact', label: 'კონტაქტი', href: 'index.html#contact' },
    ];

    return `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="index.html#home" aria-label="AutoSwap მთავარი გვერდი">
            <img class="brand-logo" src="${assets.logo}" alt="AutoSwap" width="1640" height="338">
          </a>
          <div class="header-actions">
            <nav class="site-nav" aria-label="მთავარი ნავიგაცია">
              ${nav.map((item) => `<a class="${item.id === active ? 'is-active' : ''}" href="${item.href}">${item.label}</a>`).join('')}
            </nav>
            <div class="header-auth" id="header-auth">${authSlotHTML()}</div>
            <a class="btn btn-accent header-cta" href="sell.html">${icons.plus}<span>დაამატე მანქანა</span></a>
          </div>
        </div>
      </header>
    `;
  }

  function Footer() {
    return `
      <footer class="site-footer" id="contact">
        <div class="container footer-grid">
          <div class="footer-brand">
            <img class="brand-logo" src="${assets.logo}" alt="AutoSwap" width="1640" height="338">
            <p>რეალური გაცვლები რეალურ მფლობელებს შორის.</p>
          </div>
          <nav class="footer-nav" aria-label="ფუტერის ნავიგაცია">
            <a href="cars.html">გაცვლები</a>
            <a href="sell.html">განცხადების დამატება</a>
            <a href="vehicle.html?id=demo-bmw-530i">ნიმუშის ნახვა</a>
            <a href="index.html#contact">კონტაქტი</a>
          </nav>
        </div>
        <div class="container footer-base">
          <span>© 2026 AutoSwap · ყველა უფლება დაცულია</span>
        </div>
      </footer>
    `;
  }

  // ---- Supabase read path -------------------------------------------------
  function decodeJwtPayload(token) {
    try {
      const payload = String(token || '').split('.')[1];
      if (!payload) return null;
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
      return JSON.parse(window.atob(padded));
    } catch (_err) {
      return null;
    }
  }

  function isServiceRoleKey(key) {
    const payload = decodeJwtPayload(key);
    return payload && payload.role === 'service_role';
  }

  function isUsableSupabaseUrl(url) {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      const isLocal = host === 'localhost' || host === '127.0.0.1';
      return (parsed.protocol === 'https:' || parsed.protocol === 'http:')
        && (isLocal || host.endsWith('.supabase.co'));
    } catch (_err) {
      return false;
    }
  }

  function createClient() {
    const url = String(window.AUTO_SWAP_SUPABASE_URL || '').trim();
    const key = String(window.AUTO_SWAP_SUPABASE_ANON_KEY || '').trim();

    if (!url || !key || !window.supabase || typeof window.supabase.createClient !== 'function') {
      return null;
    }

    if (!isUsableSupabaseUrl(url)) {
      console.warn('AutoSwap: Supabase URL must be the project API URL, for example https://PROJECT_REF.supabase.co.');
      return null;
    }

    if (isServiceRoleKey(key)) {
      console.error('AutoSwap: refusing to initialize Supabase with a service-role key in browser code. Use the anon/public key only.');
      return null;
    }

    return window.supabase.createClient(url, key);
  }

  const sbClient = createClient();

  // Returns mapped listings on success (possibly empty), or null when Supabase
  // is not configured / the request failed — null means "keep the demo data".
  async function fetchFeed(limit = 48) {
    if (!sbClient) return null;

    const { data, error } = await sbClient
      .from('public_vehicle_feed')
      .select('*')
      .order('is_boosted', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('AutoSwap: feed load failed', error.message);
      return null;
    }

    return (data || []).map(mapFeedRow);
  }

  // ---- Demo dataset (shaped exactly like public_vehicle_feed rows) --------
  // Local cover images so the catalog always renders (no remote calls).
  // Inventory mirrors the real Georgian swap market (Prius/Camry/Sonata
  // territory, not a German showroom). owner_* fields = the trust aggregates
  // the feed view will expose from profiles.
  const C = assets.cards;
  const DEMO_FEED = [
    { id: 'demo-toyota-camry', make: 'Toyota', model: 'Camry', year: 2020, mileage: 78000, fuel_type: 'hybrid', transmission: 'automatic', city: 'თბილისი', category: 'sedan', cover_photo_url: C[2], desired_vehicle_labels: ['Lexus ES', 'BMW 530i'], cash_mode: 'add_money', cash_amount: 3000, is_boosted: true, created_at: '2026-06-10T08:00:00Z', owner_name: 'გიორგი', owner_phone_verified: true, owner_completed_swaps: 2, owner_response_hours: 1, owner_active_today: true },
    { id: 'demo-bmw-530i', make: 'BMW', model: '530i', year: 2019, mileage: 90000, fuel_type: 'petrol', transmission: 'automatic', city: 'თბილისი', category: 'sedan', cover_photo_url: assets.bmw, desired_vehicle_labels: ['Audi A6', 'Mercedes E-Class'], cash_mode: 'add_money', cash_amount: 2000, is_boosted: false, created_at: '2026-06-10T07:30:00Z', owner_name: 'ლევანი', owner_phone_verified: true, owner_completed_swaps: 1, owner_response_hours: 2, owner_active_today: true },
    { id: 'demo-toyota-prius', make: 'Toyota', model: 'Prius', year: 2017, mileage: 148000, fuel_type: 'hybrid', transmission: 'automatic', city: 'რუსთავი', category: 'hatchback', cover_photo_url: C[0], desired_vehicle_labels: ['Toyota Camry', 'Hyundai Sonata'], cash_mode: 'ask_money', cash_amount: 4000, is_boosted: false, created_at: '2026-06-09T18:00:00Z', owner_name: 'ნიკა', owner_phone_verified: true, owner_completed_swaps: 0, owner_response_hours: 1, owner_active_today: true },
    { id: 'demo-hyundai-sonata', make: 'Hyundai', model: 'Sonata', year: 2019, mileage: 96000, fuel_type: 'lpg', transmission: 'automatic', city: 'თბილისი', category: 'sedan', cover_photo_url: C[1], desired_vehicle_labels: ['Toyota Camry'], cash_mode: 'none', cash_amount: 0, is_boosted: false, created_at: '2026-06-09T14:00:00Z', owner_name: 'თამარი', owner_phone_verified: true, owner_completed_swaps: 1, owner_response_hours: 3, owner_active_today: false },
    { id: 'demo-audi-a6-2021', make: 'Audi', model: 'A6', year: 2021, mileage: 66000, fuel_type: 'diesel', transmission: 'automatic', city: 'თბილისი', category: 'sedan', cover_photo_url: assets.audi, desired_vehicle_labels: ['BMW X5'], cash_mode: 'ask_money', cash_amount: 2000, is_boosted: false, created_at: '2026-06-09T10:00:00Z', owner_name: 'დავითი', owner_phone_verified: true, owner_completed_swaps: 3, owner_response_hours: 1, owner_active_today: true },
    { id: 'demo-hyundai-tucson', make: 'Hyundai', model: 'Tucson', year: 2021, mileage: 54000, fuel_type: 'petrol', transmission: 'automatic', city: 'ბათუმი', category: 'crossover', cover_photo_url: C[3], desired_vehicle_labels: ['Toyota RAV4'], cash_mode: 'none', cash_amount: 0, is_boosted: false, created_at: '2026-06-08T16:00:00Z', owner_name: 'ზურა', owner_phone_verified: true, owner_completed_swaps: 0, owner_response_hours: 4, owner_active_today: true },
    { id: 'demo-toyota-rav4', make: 'Toyota', model: 'RAV4', year: 2021, mileage: 61000, fuel_type: 'hybrid', transmission: 'automatic', city: 'ქუთაისი', category: 'crossover', cover_photo_url: C[2], desired_vehicle_labels: ['Hyundai Tucson', 'Kia Sportage'], cash_mode: 'ask_money', cash_amount: 1500, is_boosted: false, created_at: '2026-06-08T11:00:00Z', owner_name: 'მარიამი', owner_phone_verified: true, owner_completed_swaps: 1, owner_response_hours: 2, owner_active_today: false },
    { id: 'demo-kia-optima', make: 'Kia', model: 'Optima', year: 2018, mileage: 112000, fuel_type: 'lpg', transmission: 'automatic', city: 'ქუთაისი', category: 'sedan', cover_photo_url: C[0], desired_vehicle_labels: [], cash_mode: 'flexible', cash_amount: 0, is_boosted: false, created_at: '2026-06-07T15:00:00Z', owner_name: 'გია', owner_phone_verified: false, owner_completed_swaps: 0, owner_response_hours: null, owner_active_today: false },
    { id: 'demo-mercedes-eclass', make: 'Mercedes-Benz', model: 'E 220d', year: 2020, mileage: 74000, fuel_type: 'diesel', transmission: 'automatic', city: 'თბილისი', category: 'sedan', cover_photo_url: C[0], desired_vehicle_labels: ['BMW 5 Series', 'Audi A6'], cash_mode: 'flexible', cash_amount: 0, is_boosted: false, created_at: '2026-06-07T12:00:00Z', owner_name: 'ირაკლი', owner_phone_verified: true, owner_completed_swaps: 2, owner_response_hours: 1, owner_active_today: true },
    { id: 'demo-lexus-rx', make: 'Lexus', model: 'RX 450h', year: 2019, mileage: 91000, fuel_type: 'hybrid', transmission: 'automatic', city: 'გორი', category: 'suv', cover_photo_url: C[1], desired_vehicle_labels: ['Mercedes GLE'], cash_mode: 'none', cash_amount: 0, is_boosted: false, created_at: '2026-06-06T13:00:00Z', owner_name: 'სანდრო', owner_phone_verified: false, owner_completed_swaps: 0, owner_response_hours: 8, owner_active_today: false },
    { id: 'demo-vw-tiguan', make: 'Volkswagen', model: 'Tiguan', year: 2019, mileage: 88000, fuel_type: 'petrol', transmission: 'automatic', city: 'ბათუმი', category: 'crossover', cover_photo_url: C[3], desired_vehicle_labels: ['Toyota Camry', 'Honda Accord'], cash_mode: 'ask_money', cash_amount: 2500, is_boosted: false, created_at: '2026-06-05T17:00:00Z', owner_name: 'ბექა', owner_phone_verified: true, owner_completed_swaps: 0, owner_response_hours: 5, owner_active_today: false },
    { id: 'demo-bmw-x5', make: 'BMW', model: 'X5 xDrive40i', year: 2021, mileage: 58000, fuel_type: 'petrol', transmission: 'automatic', city: 'თბილისი', category: 'suv', cover_photo_url: assets.bmw, desired_vehicle_labels: [], cash_mode: 'none', cash_amount: 0, is_boosted: false, created_at: '2026-06-04T10:00:00Z', owner_name: 'ანა', owner_phone_verified: true, owner_completed_swaps: 1, owner_response_hours: 2, owner_active_today: true },
  ];

  // Pre-mapped demo cards (uniform shape, boosted first then newest).
  const DEMO_CARS = DEMO_FEED
    .slice()
    .sort((a, b) => (Number(b.is_boosted) - Number(a.is_boosted)) || (b.created_at > a.created_at ? 1 : -1))
    .map(mapFeedRow);

  // ---- Vehicle by id (detail page); demo data is found in the page itself ----
  async function fetchVehicleById(id) {
    if (!sbClient || !id) return null;
    const { data, error } = await sbClient
      .from('public_vehicle_feed')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return mapFeedRow(data);
  }

  // This vehicle's own photos only — gallery thumbnails must never borrow
  // images from other listings or shared assets.
  async function fetchVehiclePhotos(vehicleId) {
    if (!sbClient || !vehicleId) return [];
    const { data, error } = await sbClient
      .from('vehicle_photos')
      .select('url, position')
      .eq('vehicle_id', vehicleId)
      .order('position', { ascending: true });
    if (error || !Array.isArray(data)) return [];
    return data.map((row) => row.url).filter(Boolean);
  }

  // ---- Car catalog (makes / models) search --------------------------------
  // Backed by public.car_makes / public.car_models (ingested from vPIC). When
  // Supabase is not configured, falls back to a compact popular-brand list so
  // the searchable picker still works in demo mode. Search is "contains".
  const FALLBACK_SOURCE = {
    'BMW': ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '6 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4', 'i3', 'i4', 'i7', 'iX', 'M2', 'M3', 'M4', 'M5'],
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron', 'RS6', 'RS7', 'S4', 'S6'],
    'Mercedes-Benz': ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'G-Class', 'SL', 'AMG GT'],
    'Toyota': ['Corolla', 'Camry', 'Avalon', 'Prius', 'RAV4', 'Highlander', 'Land Cruiser', 'Land Cruiser Prado', '4Runner', 'Yaris', 'C-HR', 'Supra', 'Hilux'],
    'Volkswagen': ['Golf', 'Golf GTI', 'Polo', 'Passat', 'Jetta', 'Arteon', 'Tiguan', 'Touareg', 'T-Roc', 'ID.3', 'ID.4'],
    'Honda': ['Civic', 'Accord', 'CR-V', 'HR-V', 'Pilot', 'Fit', 'Insight', 'Odyssey'],
    'Ford': ['Focus', 'Fiesta', 'Fusion', 'Mustang', 'Escape', 'Explorer', 'Edge', 'F-150', 'Ranger'],
    'Nissan': ['Micra', 'Sentra', 'Altima', 'Maxima', 'Leaf', 'Juke', 'Qashqai', 'X-Trail', 'Rogue', 'Pathfinder', 'GT-R'],
    'Hyundai': ['i10', 'i20', 'i30', 'Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Kona', 'Ioniq', 'Ioniq 5'],
    'Kia': ['Rio', 'Ceed', 'Forte', 'Optima', 'K5', 'Sportage', 'Sorento', 'Seltos', 'Stinger', 'EV6'],
    'Lexus': ['IS', 'ES', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX', 'UX', 'RC'],
    'Porsche': ['911', '718 Cayman', '718 Boxster', 'Panamera', 'Macan', 'Cayenne', 'Taycan'],
    'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
    'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90'],
    'Mazda': ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-9', 'MX-5'],
    'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'XV', 'WRX', 'BRZ'],
    'Mitsubishi': ['Lancer', 'Outlander', 'ASX', 'Pajero', 'Eclipse Cross', 'L200'],
    'Chevrolet': ['Spark', 'Malibu', 'Cruze', 'Camaro', 'Corvette', 'Equinox', 'Tahoe', 'Suburban'],
    'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Gladiator'],
    'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Range Rover Velar'],
    'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Koleos', 'Duster'],
    'Peugeot': ['208', '308', '508', '2008', '3008', '5008'],
    'Skoda': ['Fabia', 'Octavia', 'Superb', 'Scala', 'Kamiq', 'Karoq', 'Kodiaq'],
    'Opel': ['Corsa', 'Astra', 'Insignia', 'Mokka', 'Grandland', 'Crossland'],
    'Mini': ['Cooper', 'Clubman', 'Countryman', 'Paceman'],
    'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
    'Infiniti': ['Q50', 'Q60', 'QX50', 'QX60', 'QX80'],
    'Acura': ['ILX', 'TLX', 'RDX', 'MDX', 'NSX'],
  };

  const FALLBACK_MAKES = Object.keys(FALLBACK_SOURCE).map((name, i) => ({ id: `f${i}`, name }));
  const FALLBACK_MODELS = FALLBACK_MAKES.flatMap((mk) =>
    FALLBACK_SOURCE[mk.name].map((name) => ({ id: `${mk.id}-${name}`, make_id: mk.id, name })));

  function containsFilter(rows, term, limit) {
    const q = String(term || '').trim().toLowerCase();
    const list = q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
    return list.slice(0, limit);
  }

  const catalogErrorsLogged = { makes: false, models: false };

  function logCatalogFallback(kind, error) {
    if (catalogErrorsLogged[kind]) return;
    catalogErrorsLogged[kind] = true;
    console.warn(`AutoSwap: ${kind} catalog query failed; using bundled fallback.`, error.message || error);
  }

  async function searchMakes(term = '', limit = 40) {
    if (sbClient) {
      let query = sbClient.from('car_makes').select('id,name').order('name').limit(limit);
      if (String(term).trim()) query = query.ilike('name', `%${String(term).trim()}%`);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) return data;
      if (error) logCatalogFallback('makes', error);
    }
    return containsFilter(FALLBACK_MAKES, term, limit);
  }

  async function searchModels(term = '', makeId = null, limit = 60) {
    if (sbClient) {
      let query = sbClient.from('car_models').select('id,name,make_id').order('name').limit(limit);
      if (makeId && /^\d+$/.test(String(makeId))) query = query.eq('make_id', makeId);
      if (String(term).trim()) query = query.ilike('name', `%${String(term).trim()}%`);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) return data;
      if (error) logCatalogFallback('models', error);
    }
    const scoped = makeId ? FALLBACK_MODELS.filter((m) => String(m.make_id) === String(makeId)) : FALLBACK_MODELS;
    return containsFilter(scoped, term, limit);
  }

  // ---- Offer modal (structured trade proposal, not a DM) ----
  const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12"></path><path d="M18 6 6 18"></path></svg>';

  function trapFocus(event, container) {
    const focusable = container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function buildModal(bodyHTML, labelledBy) {
    document.querySelector('.modal-overlay')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="${labelledBy}">
        <button class="modal-close" type="button" data-close aria-label="დახურვა">${closeIcon}</button>
        ${bodyHTML}
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.classList.add('modal-open');

    const close = () => {
      overlay.remove();
      document.body.classList.remove('modal-open');
      document.removeEventListener('keydown', onKey);
    };
    const onKey = (event) => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') trapFocus(event, overlay);
    };
    document.addEventListener('keydown', onKey);
    overlay.addEventListener('mousedown', (event) => { if (event.target === overlay) close(); });
    overlay.addEventListener('click', (event) => { if (event.target.closest('[data-close]')) close(); });

    (overlay.querySelector('select, input, textarea, button:not(.modal-close)') || overlay).focus();
    return { overlay, close };
  }

  // Quick "my car" capture — the viewer's half of the trade. Local-only for
  // now; the full listing flow on sell.html replaces this after auth lands.
  function openMyCarModal() {
    const myCar = getMyCar() || {};
    const wantsValue = Array.isArray(myCar.wants) ? myCar.wants.join(', ') : '';
    const { overlay, close } = buildModal(`
      <div class="modal-body">
        <p class="modal-eyebrow">შენი მანქანა</p>
        <h2 class="modal-title" id="mycar-title">რა გყავს და რა გინდა?</h2>
        <form class="offer-form" id="mycar-form" novalidate>
          <div class="field-row">
            <label class="field">
              <span>მარკა</span>
              <input type="text" name="make" required value="${escapeAttr(myCar.make || '')}" placeholder="მაგ: Toyota">
            </label>
            <label class="field">
              <span>მოდელი</span>
              <input type="text" name="model" value="${escapeAttr(myCar.model || '')}" placeholder="მაგ: Camry">
            </label>
          </div>
          <div class="field-row">
            <label class="field">
              <span>წელი</span>
              <input type="number" name="year" min="1980" max="2026" inputmode="numeric" value="${escapeAttr(myCar.year || '')}" placeholder="2018">
            </label>
            <label class="field">
              <span>რაში გაცვლიდი? (არასავალდებულო)</span>
              <input type="text" name="wants" value="${escapeAttr(wantsValue)}" placeholder="მაგ: BMW X5, Audi Q7">
            </label>
          </div>
          <p class="mycar-note">ეს მხოლოდ კატალოგის მორგებაა — სრული განცხადებისთვის <a href="sell.html">დაამატე ფოტოებით</a>.</p>
          <div class="offer-actions">
            ${myCar.make ? '<button type="button" class="btn btn-ghost" id="mycar-clear">წაშლა</button>' : '<button type="button" class="btn btn-ghost" data-close>გაუქმება</button>'}
            <button type="submit" class="btn btn-primary">შენახვა</button>
          </div>
        </form>
      </div>
    `, 'mycar-title');

    overlay.querySelector('#mycar-clear')?.addEventListener('click', () => {
      clearMyCar();
      close();
    });

    overlay.querySelector('#mycar-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const make = String(data.get('make') || '').trim();
      if (!make) {
        event.currentTarget.querySelector('[name="make"]').focus();
        return;
      }
      setMyCar({
        make,
        model: String(data.get('model') || '').trim(),
        year: String(data.get('year') || '').trim(),
        wants: String(data.get('wants') || '').split(',').map((s) => s.trim()).filter(Boolean).slice(0, 3),
      });
      close();
    });
  }

  function escapeAttr(value) {
    return String(value).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  }

  function ownerTrustLine(car) {
    if (!car || !car.ownerName) return '';
    const bits = [
      `<strong>${escapeAttr(car.ownerName)}</strong>`,
      car.ownerVerified ? `<span class="trust-ok">${icons.check} ტელეფონი</span>` : '',
      car.ownerResponseHours != null ? `პასუხობს ~${car.ownerResponseHours} სთ-ში` : '',
    ].filter(Boolean).join(' · ');
    return `<p class="offer-owner-line">${bits}</p>`;
  }

  function openOfferModal(car) {
    const title = `${car && car.make ? car.make : ''} ${car && car.model ? car.model : ''}`.trim() || 'ავტომობილი';
    const myCar = getMyCar();

    // No car = no trade. An offer is half a deal — never let users send
    // an empty one; convert the moment into adding their car instead.
    if (!myCar) {
      buildModal(`
        <div class="modal-body">
          <p class="modal-eyebrow">გაცვლის შეთავაზება</p>
          <h2 class="modal-title" id="offer-title">ჯერ შენი მანქანა გვჭირდება</h2>
          <p class="offer-gate-text">შეთავაზება გაცვლის ნახევარია — ${escapeAttr(title)}-ის მფლობელმა უნდა ნახოს, რას სთავაზობ სანაცვლოდ.</p>
          <div class="offer-actions">
            <a class="btn btn-ghost" href="sell.html">სრული განცხადება</a>
            <button type="button" class="btn btn-primary" id="offer-add-mycar">მიუთითე შენი მანქანა</button>
          </div>
        </div>
      `, 'offer-title').overlay.querySelector('#offer-add-mycar').addEventListener('click', () => {
        openMyCarModal();
      });
      return;
    }

    const myLabel = `${myCar.make} ${myCar.model || ''}${myCar.year ? ` · ${myCar.year}` : ''}`.trim();
    const { overlay } = buildModal(`
      <div class="modal-body" id="offer-modal-body">
        <p class="modal-eyebrow">გაცვლის შეთავაზება</p>
        <h2 class="modal-title" id="offer-title">${escapeAttr(title)}</h2>
        ${ownerTrustLine(car)}
        <div class="offer-trade-summary">
          <span class="offer-trade-side">შენი<br><strong>${escapeAttr(myLabel)}</strong></span>
          <span class="offer-trade-icon">${icons.swap}</span>
          <span class="offer-trade-side">მისი<br><strong>${escapeAttr(title)}</strong></span>
        </div>
        <form class="offer-form" id="offer-form" novalidate>
          <div class="field-row">
            <label class="field">
              <span>თანხის სხვაობა</span>
              <select name="cashMode">
                <option value="none">თანაბარი გაცვლა</option>
                <option value="add">მე ვამატებ თანხას</option>
                <option value="ask">მე ვითხოვ თანხას</option>
                <option value="flexible">შეთანხმებით</option>
              </select>
            </label>
            <label class="field">
              <span>თანხა (₾)</span>
              <input type="number" name="amount" min="0" placeholder="0" inputmode="numeric">
            </label>
          </div>
          <label class="field">
            <span>შეტყობინება (არასავალდებულო)</span>
            <textarea name="message" rows="3" placeholder="მაგ: მანქანა იდეალურ მდგომარეობაშია, შეგვიძლია დიაგნოსტიკაზე შევხვდეთ."></textarea>
          </label>
          <ol class="offer-steps">
            <li>შეთავაზება მიდის მფლობელთან</li>
            <li>ის ეთანხმება, უარყოფს ან გიგზავნის counter-ს</li>
            <li>კონტაქტი იხსნება მხოლოდ ორმხრივი თანხმობისას</li>
          </ol>
          <div class="offer-actions">
            <button type="button" class="btn btn-ghost" data-close>გაუქმება</button>
            <button type="submit" class="btn btn-primary">შეთავაზების გაგზავნა</button>
          </div>
        </form>
      </div>
    `, 'offer-title');

    overlay.querySelector('#offer-form').addEventListener('submit', (event) => {
      event.preventDefault();
      overlay.querySelector('#offer-modal-body').innerHTML = `
        <div class="offer-success">
          <span class="offer-success-icon">${icons.check}</span>
          <h2 class="modal-title">შეთავაზება გაიგზავნა</h2>
          <p>${escapeAttr(title)}-ის მფლობელი ნახავს შენს ${escapeAttr(myLabel)}-ს და პირობებს. ნახვისთანავე და პასუხისთანავე შეგატყობინებთ.</p>
          <p class="offer-demo-note">დემო რეჟიმი — რეალური გაგზავნა ჩაირთვება ანგარიშის დადასტურების შემდეგ.</p>
          <button type="button" class="btn btn-primary" data-close>გასაგებია</button>
        </div>
      `;
    });
  }

  // ---- Auth: phone OTP login / registration -------------------------------
  // Real path: Supabase phone OTP (signInWithOtp + verifyOtp). When Supabase
  // or its SMS provider is not configured, falls back to a clearly-labelled
  // local demo flow (fixed code), same convention as the offer modal.
  const DEMO_USER_KEY = 'autoswap.demoUser';
  const DEMO_OTP_CODE = '1234';

  let authUser = null;

  function getDemoUser() {
    try {
      const raw = localStorage.getItem(DEMO_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_err) {
      return null;
    }
  }

  function authDisplayName(user) {
    if (!user) return '';
    if (user.demo) return user.name || user.phone;
    const meta = user.user_metadata || {};
    return meta.full_name || (user.phone ? `+${user.phone}` : 'ანგარიში');
  }

  function authSlotHTML() {
    if (!authUser) {
      return '<button class="btn btn-light header-login" type="button" data-auth-open>შესვლა</button>';
    }
    return `
      <span class="header-user">${icons.user}<span class="header-user-name">${escapeAttr(authDisplayName(authUser))}</span></span>
      <button class="header-logout" type="button" data-logout>გასვლა</button>
    `;
  }

  function renderAuthSlot() {
    document.querySelectorAll('#header-auth').forEach((slot) => {
      slot.innerHTML = authSlotHTML();
    });
  }

  function initAuth() {
    const demo = getDemoUser();
    if (demo) authUser = { demo: true, ...demo };
    if (sbClient) {
      // Fires INITIAL_SESSION on subscribe, so this also covers page load.
      sbClient.auth.onAuthStateChange((_event, session) => {
        authUser = (session && session.user) || (getDemoUser() ? { demo: true, ...getDemoUser() } : null);
        renderAuthSlot();
      });
    }
    document.addEventListener('DOMContentLoaded', renderAuthSlot);
  }

  // Georgian mobile numbers: 5XX XX XX XX, with or without the +995 prefix.
  function normalizePhone(raw) {
    const digits = String(raw || '').replace(/\D/g, '');
    if (/^9955\d{8}$/.test(digits)) return `+${digits}`;
    if (/^5\d{8}$/.test(digits)) return `+995${digits}`;
    return null;
  }

  // → { demo: boolean } on success, { error: string } on failure.
  async function requestOtp(phone, name, mode) {
    if (!sbClient) return { demo: true };
    const options = mode === 'register'
      ? { shouldCreateUser: true, data: name ? { full_name: name } : undefined }
      : { shouldCreateUser: false };
    const { error } = await sbClient.auth.signInWithOtp({ phone, options });
    if (!error) return { demo: false };
    const message = String(error.message || '');
    // SMS provider not wired up on the Supabase project → demo flow.
    if (/provider|not enabled|disabled|unsupported/i.test(message)) return { demo: true };
    if (/signups not allowed/i.test(message)) return { error: 'ეს ნომერი ჯერ არ არის რეგისტრირებული — გადადი რეგისტრაციაზე.' };
    return { error: `კოდი ვერ გაიგზავნა: ${message}` };
  }

  // → {} on success (header updates via auth listener), { error } on failure.
  async function confirmOtp(phone, code, name, isDemo) {
    if (isDemo) {
      if (code !== DEMO_OTP_CODE) return { error: `არასწორი კოდი — დემო რეჟიმში კოდია ${DEMO_OTP_CODE}.` };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify({ name: name || '', phone }));
      authUser = { demo: true, name: name || '', phone };
      renderAuthSlot();
      return {};
    }
    const { error } = await sbClient.auth.verifyOtp({ phone, token: code, type: 'sms' });
    return error ? { error: `კოდი ვერ დადასტურდა: ${error.message}` } : {};
  }

  function logout() {
    localStorage.removeItem(DEMO_USER_KEY);
    authUser = null;
    renderAuthSlot();
    sbClient?.auth.signOut().catch((err) => console.error('AutoSwap: signOut failed', err.message));
  }

  function authFormHTML(mode) {
    return `
      <div class="auth-tabs" role="tablist">
        <button class="auth-tab ${mode === 'login' ? 'is-active' : ''}" type="button" data-mode="login">შესვლა</button>
        <button class="auth-tab ${mode === 'register' ? 'is-active' : ''}" type="button" data-mode="register">რეგისტრაცია</button>
      </div>
      <form class="offer-form" id="auth-form" novalidate>
        <label class="field" id="auth-name-field" ${mode === 'register' ? '' : 'hidden'}>
          <span>სახელი</span>
          <input type="text" name="name" autocomplete="name" placeholder="მაგ: გიორგი">
        </label>
        <label class="field">
          <span>ტელეფონის ნომერი (+995)</span>
          <input type="tel" name="phone" inputmode="tel" autocomplete="tel-national" placeholder="5XX XX XX XX" required>
        </label>
        <p class="auth-error" id="auth-error" hidden></p>
        <div class="offer-actions">
          <button type="button" class="btn btn-ghost" data-close>გაუქმება</button>
          <button type="submit" class="btn btn-primary" id="auth-submit">კოდის გაგზავნა</button>
        </div>
      </form>
    `;
  }

  function openAuthModal(initialMode) {
    let mode = initialMode === 'register' ? 'register' : 'login';
    const { overlay, close } = buildModal(`
      <div class="modal-body" id="auth-body">
        <p class="modal-eyebrow">ანგარიში</p>
        <h2 class="modal-title" id="auth-title">გაიარე ავტორიზაცია ნომრით</h2>
        <div id="auth-step">${authFormHTML(mode)}</div>
      </div>
    `, 'auth-title');

    const step = overlay.querySelector('#auth-step');

    const showError = (text) => {
      const el = step.querySelector('.auth-error');
      if (!el) return;
      el.textContent = text;
      el.hidden = false;
    };

    function bindPhoneStep() {
      step.querySelectorAll('.auth-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
          mode = tab.dataset.mode === 'register' ? 'register' : 'login';
          step.innerHTML = authFormHTML(mode);
          bindPhoneStep();
        });
      });

      step.querySelector('#auth-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = String(data.get('name') || '').trim();
        const phone = normalizePhone(data.get('phone'));
        if (!phone) {
          showError('შეიყვანე ქართული მობილურის ნომერი ფორმატით 5XX XX XX XX.');
          return;
        }
        if (mode === 'register' && !name) {
          showError('შეიყვანე სახელი.');
          return;
        }
        const submit = step.querySelector('#auth-submit');
        submit.disabled = true;
        submit.textContent = 'იგზავნება…';
        const result = await requestOtp(phone, name, mode);
        if (result.error) {
          submit.disabled = false;
          submit.textContent = 'კოდის გაგზავნა';
          showError(result.error);
          return;
        }
        bindOtpStep(phone, name, result.demo);
      });
    }

    function bindOtpStep(phone, name, isDemo) {
      step.innerHTML = `
        <p class="auth-sub">კოდი გაიგზავნა ნომერზე <strong>${escapeAttr(phone)}</strong>.${isDemo ? ` დემო რეჟიმი — შეიყვანე კოდი <strong>${DEMO_OTP_CODE}</strong>.` : ''}</p>
        <form class="offer-form" id="otp-form" novalidate>
          <label class="field">
            <span>SMS კოდი</span>
            <input class="otp-input" type="text" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="••••">
          </label>
          <p class="auth-error" hidden></p>
          <div class="offer-actions">
            <button type="button" class="btn btn-ghost" id="auth-back">უკან</button>
            <button type="submit" class="btn btn-primary">დადასტურება</button>
          </div>
        </form>
      `;

      step.querySelector('#auth-back').addEventListener('click', () => {
        step.innerHTML = authFormHTML(mode);
        bindPhoneStep();
      });

      step.querySelector('#otp-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const code = String(new FormData(event.currentTarget).get('code') || '').trim();
        if (!code) {
          showError('შეიყვანე SMS კოდი.');
          return;
        }
        const result = await confirmOtp(phone, code, name, isDemo);
        if (result.error) {
          showError(result.error);
          return;
        }
        step.innerHTML = `
          <div class="offer-success">
            <span class="offer-success-icon">${icons.check}</span>
            <h2 class="modal-title">გამარჯობა${name ? `, ${escapeAttr(name)}` : ''}!</h2>
            <p>${mode === 'register' ? 'რეგისტრაცია წარმატებით დასრულდა.' : 'შესვლა წარმატებულია.'}</p>
            <button type="button" class="btn btn-primary" data-close>გასაგებია</button>
          </div>
        `;
      });

      step.querySelector('.otp-input').focus();
    }

    bindPhoneStep();
    return { overlay, close };
  }

  initAuth();

  // ---- Global delegated listeners (bound once per page load) ----
  document.addEventListener('click', (event) => {
    const offerBtn = event.target.closest('[data-offer]');
    if (offerBtn) {
      event.preventDefault();
      openOfferModal({ id: offerBtn.dataset.id, make: offerBtn.dataset.make, model: offerBtn.dataset.model });
    }
  });
  document.addEventListener('click', (event) => {
    const saveBtn = event.target.closest('.save-btn');
    if (saveBtn) saveBtn.classList.toggle('is-saved');
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-auth-open]')) openAuthModal();
    if (event.target.closest('[data-logout]')) logout();
  });

  window.AutoSwap = {
    assets,
    icons,
    FUEL_LABELS,
    TRANSMISSION_LABELS,
    CATEGORY_LABELS,
    labelFor,
    fuelLabel,
    formatCash,
    fallbackImageFor,
    mapFeedRow,
    Header,
    Footer,
    createClient,
    fetchFeed,
    fetchVehicleById,
    fetchVehiclePhotos,
    searchMakes,
    searchModels,
    openOfferModal,
    openMyCarModal,
    openAuthModal,
    getMyCar,
    setMyCar,
    clearMyCar,
    matchLevel,
    freshnessLabel,
    daysSince,
    DEMO_FEED,
    DEMO_CARS,
  };
})();
