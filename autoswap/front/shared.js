(function () {
  const assets = {
    road: 'assets/hero-road-bg.webp',
    logo: 'assets/autoswap-logo.png',
    bmw: 'assets/hero-bmw-530i.webp',
    audi: 'assets/hero-audi-a6.webp',
    porsche: 'assets/hero-porsche-aligned.webp?v=5',
    revs: {
      bmw: 'assets/bmw-rev.mp3',
      porsche: 'assets/porsche-rev.mp3',
    },
    cards: [
      'assets/swap-card-1.webp',
      'assets/swap-card-2.webp',
      'assets/swap-card-3.webp',
      'assets/swap-card-4.webp',
    ],
  };

  const icons = {
    arrowRight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path></svg>',
    bell: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9Z"></path><path d="M10 20a2.2 2.2 0 0 0 4 0"></path></svg>',
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
    mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0"></path><path d="M12 18v3"></path></svg>',
    logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3"></path><path d="m16 17 5-5-5-5"></path><path d="M21 12H9"></path></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"></rect><path d="M3 10h18"></path><path d="M8 3v4"></path><path d="M16 3v4"></path></svg>',
    engine: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9h5l2-2h3v3h3v5h-3v3h-4l-2-2H6l-2-2H2v-3h2Z"></path><path d="M13 7V5h4"></path></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.6 6.2A9.9 9.9 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3 3.6"></path><path d="M6.3 7.7A16.7 16.7 0 0 0 2 12s3.6 6 10 6a9.7 9.7 0 0 0 4-.8"></path><path d="M9.9 10.1a3 3 0 0 0 4.2 4.2"></path><path d="m3 3 18 18"></path></svg>',
    upload: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15a4 4 0 0 1 .9-7.9A6 6 0 0 1 17.6 6.8 4.5 4.5 0 0 1 18.5 15.7"></path><path d="M12 12v8"></path><path d="m8.5 15 3.5-3 3.5 3"></path></svg>',
    doc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"></path><path d="M14 3v5h5"></path><path d="M9 13h6"></path><path d="M9 17h4"></path></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3.5 2"></path></svg>',
    sms: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 1 1 17 0z"></path></svg>',
    whatsapp: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#25D366" stroke="none" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>',
    google: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" stroke="none" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" stroke="none" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"/><path fill="#FBBC05" stroke="none" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"/><path fill="#EA4335" stroke="none" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"/></svg>',
  };

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

  const LOGO_EXT = { bmw: 'svg' };

  function logoSlug(make) {
    return String(make || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function getLogoUrl(make) {
    const slug = logoSlug(make);
    if (!slug) return null;
    return `assets/logos/${slug}.${LOGO_EXT[slug] || 'png'}`;
  }

  function formatCash(mode, amount) {
    const money = `${(Number(amount) || 0).toLocaleString('en-US')} ₾`;
    switch (mode) {
      case 'add_money':
        return { cash: `ამატებს ${money}`, cashType: 'add' };
      case 'ask_money':
        return { cash: `ითხოვს ${money}`, cashType: 'ask' };
      case 'flexible':
        return { cash: 'სხვაობა შეთანხმებით', cashType: 'flexible' };
      default:
        return { cash: 'თანაბარი გაცვლა', cashType: 'none' };
    }
  }

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

  function georgianError(err) {
    const raw = String(err?.message || err || '');
    const m = raw.toLowerCase();

    const missingCol = /could not find the '([^']+)' column/i.exec(raw);
    if (missingCol) {
      return `ბაზა არ არის განახლებული (აკლია ველი „${missingCol[1]}“). გაუშვი supabase/schema.sql.`;
    }
    if (m.includes('duplicate key') || m.includes('already exists')) return 'ასეთი ჩანაწერი უკვე არსებობს.';
    if (m.includes('violates row-level security') || m.includes('row-level security')) return 'ამ მოქმედების უფლება არ გაქვს.';
    if (m.includes('violates foreign key')) return 'დაკავშირებული ჩანაწერი ვერ მოიძებნა.';
    if (m.includes('violates check constraint')) return 'ერთ-ერთი ველი დაუშვებელ მნიშვნელობას შეიცავს.';
    if (m.includes('not-null') || m.includes('null value in column')) return 'სავალდებულო ველი შეუვსებელია.';
    if (m.includes('jwt') || m.includes('unauthorized') || m.includes('401')) return 'სესია ამოიწურა, გაიარე ავტორიზაცია ხელახლა.';
    if (m.includes('payload too large') || m.includes('413')) return 'ფაილი ძალიან დიდია.';
    if (m.includes('failed to fetch') || m.includes('networkerror')) return 'კავშირი ვერ შედგა, შეამოწმე ინტერნეტი.';
    if (m.includes('rate limit') || m.includes('429')) return 'ბევრი მცდელობა იყო, სცადე ცოტა ხანში.';
    return raw || 'უცნობი შეცდომა.';
  }

  function bindOfferAmount(form) {
    const mode = form?.querySelector('[name="cashMode"]');
    const field = form?.querySelector('[data-offer-amount]');
    const amount = form?.querySelector('[name="amount"]');
    if (!mode || !field || !amount) return;
    const update = () => {
      const needs = mode.value !== 'none' && mode.value !== 'flexible';
      field.hidden = !needs;
      if (!needs) amount.value = '';
    };
    mode.addEventListener('change', update);
    update();
  }

  function offerAmountInGel(form) {
    const raw = Number(form?.querySelector('[name="amount"]')?.value) || 0;
    if (raw <= 0) return 0;
    const currency = form?.querySelector('[name="amountCurrency"]')?.value || 'GEL';
    return currency === 'USD' ? Math.round(raw * getUsdRate()) : Math.round(raw);
  }

  const COMBO_LIST_MAX_H = 264;

  function placeComboList(list, anchor) {
    if (!list || !anchor || list.hidden) return;
    const r = anchor.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const gap = 4;
    const margin = 8;
    const spaceBelow = window.innerHeight - r.bottom - gap - margin;
    const spaceAbove = r.top - gap - margin;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    const avail = Math.max(120, Math.min(COMBO_LIST_MAX_H, openUp ? spaceAbove : spaceBelow));
    list.style.left = `${Math.round(r.left)}px`;
    list.style.width = `${Math.round(r.width)}px`;
    list.style.maxHeight = `${Math.round(avail)}px`;
    if (openUp) {
      list.style.top = 'auto';
      list.style.bottom = `${Math.round(window.innerHeight - r.top + gap)}px`;
    } else {
      list.style.bottom = 'auto';
      list.style.top = `${Math.round(r.bottom + gap)}px`;
    }
  }

  function repositionComboLists() {
    document.querySelectorAll('.combo-list').forEach((list) => {
      if (list.hidden) return;
      const anchor = list.closest('.combo')?.querySelector('.combo-control')
        || list.parentElement?.querySelector('input, select');
      if (anchor) placeComboList(list, anchor);
    });
  }

  window.addEventListener('scroll', repositionComboLists, true);
  window.addEventListener('resize', repositionComboLists);

  const PHOTO_PLACEHOLDER = 'data:image/svg+xml;charset=utf-8,'
    + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
<rect width="400" height="300" fill="#eceee9"/>
<g fill="none" stroke="#a8b0a4" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
<path d="M96 176h208M110 176l16-42a18 18 0 0 1 17-12h114a18 18 0 0 1 17 12l16 42"/>
<path d="M96 176v30h208v-30"/><circle cx="140" cy="206" r="15"/><circle cx="260" cy="206" r="15"/>
</g></svg>`);

  function bindImageFallbacks() {
    document.addEventListener('error', (event) => {
      const img = event.target;
      if (!img || img.tagName !== 'IMG' || img.dataset.imgFallbackDone) return;
      const next = img.dataset.fallback || PHOTO_PLACEHOLDER;
      if (img.src === next) return;
      img.dataset.imgFallbackDone = '1';
      img.classList.add('img-placeholder');
      img.src = next;
    }, true);
  }
  bindImageFallbacks();

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
      ownerId: row.owner_id || row.owner_name || '',
      badge: row.is_boosted ? 'TOP შეთავაზება' : 'ახალი',
      boosted: !!row.is_boosted,

      make: row.make || '',
      model: row.model || '',

      estimatedValue: row.estimated_value != null ? Number(row.estimated_value) : null,
      estimatedValueLabel: row.estimated_value != null
        ? `${Number(row.estimated_value).toLocaleString('en-US')} ₾`
        : '',
      description: row.description || '',

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

      wantsList: labels,
      openToOffers: labels.length === 0,
      wants: labels.length ? labels.join(' / ') : 'ღიაა შემოთავაზებებისთვის',
      cash,
      cashType,
      cashMode: row.cash_mode || 'none',
      cashAmount: Number(row.cash_amount) || 0,

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
    } catch (_err) {  }
    document.dispatchEvent(new CustomEvent('autoswap:mycar'));
  }

  function clearMyCar() {
    try {
      window.localStorage.removeItem(MY_CAR_KEY);
    } catch (_err) {  }
    document.dispatchEvent(new CustomEvent('autoswap:mycar'));
  }

  function normMatchText(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  function wantCoversCar(want, make, model) {
    const w = normMatchText(want);
    if (!w) return false;
    const mk = normMatchText(make);
    const md = normMatchText(model);
    if (mk && w === mk) return true;
    if (md && (w.includes(md) || (md.length >= 3 && md.includes(w)))) return true;
    if (mk && w.startsWith(mk)) {
      const rest = w.slice(mk.length);
      if (!rest) return true;
      if (!md) return true;
      if (md && (md.includes(rest) || rest.includes(md))) return true;
      if (md && rest[0] && md[0] === rest[0]) return true;
    }
    return false;
  }

  function matchLevel(car, myCar) {
    if (!myCar || !myCar.make || !Array.isArray(car.wantsList) || !car.wantsList.length) return '';
    const theyWantMine = car.wantsList.some((w) => wantCoversCar(w, myCar.make, myCar.model));
    if (!theyWantMine) return '';
    const iWantTheirs = (myCar.wants || []).some((w) => wantCoversCar(w, car.make, car.model));
    return iWantTheirs ? 'mutual' : 'reverse';
  }

  function Header(opts) {
    const options = opts || {};
    const active = options.active || '';
    const nav = [
      { id: 'listings', label: 'გაცვლები', href: '/cars' },
      { id: 'about', label: 'ჩვენ შესახებ', href: '/about' },
    ];

    return `
      <header class="site-header">
        <div class="container header-inner">
          <a class="brand" href="/#home" aria-label="AutoSwap მთავარი გვერდი">
            <span class="brand-tile" aria-hidden="true">${icons.swap}</span>
            <span class="brand-word">auto<b>swap</b></span>
          </a>
          <div class="header-actions">
            <nav class="site-nav" aria-label="მთავარი ნავიგაცია">
              ${nav.map((item) => `<a class="${item.id === active ? 'is-active' : ''}" href="${item.href}"${item.id === active ? ' aria-current="page"' : ''}>${item.label}</a>`).join('')}
            </nav>
            <a class="btn btn-accent header-cta" href="/sell">${icons.plus}<span>დაამატე მანქანა</span></a>
            ${options.currency ? `
            <div class="currency-switch" role="group" aria-label="ფასების ვალუტა">
              <button type="button" data-currency="GEL" aria-pressed="true">₾</button>
              <button type="button" data-currency="USD" aria-pressed="false">$</button>
            </div>` : `
            <div class="currency-switch currency-switch--ghost" aria-hidden="true">
              <button type="button" tabindex="-1">₾</button>
              <button type="button" tabindex="-1">$</button>
            </div>`}
            <div class="notify-wrap">
              <button class="notify-btn" type="button" data-notify-btn aria-haspopup="true" aria-expanded="false" aria-label="შეტყობინებები">
                ${icons.bell}
                <span class="notify-badge" data-notify-badge hidden></span>
              </button>
              <div class="notify-panel" data-notify-panel hidden>
                <div class="notify-head">შეტყობინებები</div>
                <div class="notify-body" data-notify-body></div>
              </div>
            </div>
            <div class="header-auth" id="header-auth">${authSlotHTML()}</div>
          </div>
        </div>
      </header>
    `;
  }

  const TAB_ITEMS = [
    { id: 'home', label: 'მთავარი', href: '/', icon: 'car' },
    { id: 'listings', label: 'გაცვლები', href: '/cars', icon: 'search' },
    { id: 'sell', label: 'დამატება', href: '/sell', icon: 'plus', primary: true },
    { id: 'offers', label: 'შეთავაზებები', href: '/account?tab=offers', icon: 'swap' },
    { id: 'account', label: 'პროფილი', href: '/account', icon: 'user' },
  ];

  function MobileTabBar(active) {
    return `
      <nav class="tabbar" aria-label="მთავარი ნავიგაცია">
        ${TAB_ITEMS.map((t) => `
          <a class="tabbar-item${t.primary ? ' tabbar-item--primary' : ''}${t.id === active ? ' is-active' : ''}"
             href="${t.href}"${t.id === active ? ' aria-current="page"' : ''}>
            <span class="tabbar-icon" aria-hidden="true">${icons[t.icon]}</span>
            <span class="tabbar-label">${t.label}</span>
          </a>`).join('')}
      </nav>`;
  }

  function Footer(opts) {
    const active = (opts && opts.active) || '';
    return `
      ${MobileTabBar(active)}
      <footer class="site-footer" id="contact">
        <div class="container footer-grid">
          <div class="footer-brand">
            <span class="brand" aria-hidden="true">
              <span class="brand-tile">${icons.swap}</span>
              <span class="brand-word">auto<b>swap</b></span>
            </span>
            <p>რეალური გაცვლები რეალურ მფლობელებს შორის.</p>
          </div>
          <nav class="footer-nav" aria-label="ფუტერის ნავიგაცია">
            <a href="/cars">გაცვლები</a>
            <a href="/sell">განცხადების დამატება</a>
            <a href="/about">ჩვენ შესახებ</a>
            <a href="/terms">წესები</a>
            <a href="/privacy">კონფიდენციალურობა</a>
            <a href="/about#contact">კონტაქტი</a>
          </nav>
        </div>
        <div class="container footer-base">
          <span>© 2026 AutoSwap · ყველა უფლება დაცულია</span>
        </div>
      </footer>
    `;
  }

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

  function isPlaceholderConfig(url, key) {
    if (/^(dummy|your-|example|placeholder|project)[-.]/i.test(key)) return true;
    try {
      return /^(dummy|example|placeholder|project|your-project)\./i.test(new URL(url).host);
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

    if (isPlaceholderConfig(url, key)) {
      console.warn('AutoSwap: supabase-config.js still has placeholder values, listings cannot load.');
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

  const CACHE_PREFIX = 'as:cache:';

  function cacheGet(key) {
    try {
      const raw = window.sessionStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry || (entry.exp && Date.now() > entry.exp)) {
        window.sessionStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return entry.v;
    } catch (_err) {
      return null;
    }
  }

  function cacheSet(key, value, ttlMs) {
    try {
      window.sessionStorage.setItem(
        CACHE_PREFIX + key,
        JSON.stringify({ v: value, exp: Date.now() + ttlMs }),
      );
    } catch (_err) {  }
  }

  function cacheBust(prefix) {
    try {
      const doomed = [];
      for (let i = 0; i < window.sessionStorage.length; i += 1) {
        const key = window.sessionStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX + prefix)) doomed.push(key);
      }
      doomed.forEach((key) => window.sessionStorage.removeItem(key));
    } catch (_err) {  }
  }

  function toast(message, kind = 'info') {
    let host = document.querySelector('.toast-host');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toast-host';
      document.body.appendChild(host);
    }
    const node = document.createElement('div');
    node.className = `toast toast--${kind}`;
    node.setAttribute('role', 'status');
    node.textContent = message;
    host.appendChild(node);
    setTimeout(() => node.classList.add('is-out'), 3600);
    setTimeout(() => node.remove(), 4000);
  }

  let authUser = null;
  const authListeners = new Set();

  function demoAuthUser() {
    const demo = getDemoUser();
    return demo ? { demo: true, ...demo } : null;
  }

  function notifyAuth() {
    renderAuthSlot();
    authListeners.forEach((cb) => {
      try { cb(authUser); } catch (_err) {  }
    });
    document.dispatchEvent(new CustomEvent('autoswap:auth'));
  }

  function onAuth(cb) {
    authListeners.add(cb);
    cb(authUser);
    return () => authListeners.delete(cb);
  }

  function getAuthUser() {
    return authUser;
  }

  const authReady = (async () => {
    if (!sbClient) {
      authUser = demoAuthUser();
      notifyAuth();
      return null;
    }
    let session = null;
    try {
      ({ data: { session } } = await sbClient.auth.getSession());
    } catch (_err) {  }
    authUser = (session && session.user) || demoAuthUser();
    notifyAuth();
    sbClient.auth.onAuthStateChange((_event, nextSession) => {
      const next = (nextSession && nextSession.user) || demoAuthUser();
      if ((next && next.id) === (authUser && authUser.id) && !!next === !!authUser) {
        authUser = next;
        return;
      }
      authUser = next;
      savedIdsPromise = null;
      notifyAuth();
    });
    return session ? session.user : null;
  })();

  async function signInWithProvider(provider) {
    if (!sbClient) return { error: 'დემო რეჟიმი, Google-ით შესვლა მოითხოვს Supabase-ის კონფიგურაციას.' };
    const { error } = await sbClient.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.href.split('#')[0] },
    });
    return { error: error ? error.message : null };
  }

  async function signOut() {
    if (sbClient) await sbClient.auth.signOut();
  }

  const SHADOW_EMAIL_DOMAIN = 'phone.autoswap.ge';

  function shadowEmailForPhone(phone) {
    return `p${String(phone || '').replace(/\D/g, '')}@${SHADOW_EMAIL_DOMAIN}`;
  }

  function isShadowEmail(email) {
    return String(email || '').endsWith(`@${SHADOW_EMAIL_DOMAIN}`);
  }

  async function signInWithPassword(phone, password) {
    if (!sbClient) return { error: 'დემო რეჟიმი, პაროლით შესვლა მოითხოვს Supabase-ის კონფიგურაციას.' };
    const { data, error } = await sbClient.auth.signInWithPassword({
      email: shadowEmailForPhone(phone),
      password,
    });
    if (error) {
      if (/rate|too many/i.test(error.message || '')) {
        return { error: 'ძალიან ბევრი მცდელობა, დაიცადე ცოტა ხანი და სცადე თავიდან.' };
      }
      return { error: 'ნომერი ან პაროლი არასწორია.' };
    }
    return { user: data.user };
  }

  async function setPassword(password) {
    if (!sbClient) return { error: 'დემო რეჟიმი.' };
    const { data, error } = await sbClient.auth.updateUser({
      password,
      data: { has_password: true },
    });
    if (error) return { error: `პაროლი ვერ შეინახა: ${georgianError(error)}` };
    authUser = data.user;
    notifyAuth();
    return {};
  }

  function hasPassword(user) {
    return Boolean(user && user.user_metadata && user.user_metadata.has_password);
  }

  async function verifyCurrentPassword(password) {
    if (!sbClient) return { error: 'დემო რეჟიმი.' };
    const email = authUser && authUser.email;
    if (!email) return { error: 'ამ ანგარიშს პაროლი ვერ დაუყენდება.' };
    const { error } = await sbClient.auth.signInWithPassword({ email, password });
    if (!error) return {};
    if (/rate|too many/i.test(error.message || '')) {
      return { error: 'ძალიან ბევრი მცდელობა, დაიცადე ცოტა ხანი და სცადე თავიდან.' };
    }
    return { error: 'ამჟამინდელი პაროლი არასწორია.' };
  }

  const PASSWORD_RULES = [
    { id: 'len', label: 'მინიმუმ 8 სიმბოლო', ok: (v) => v.length >= 8 },
    { id: 'mix', label: 'ასო და ციფრი', ok: (v) => /[a-zA-Z]/.test(v) && /\d/.test(v) },
  ];

  function passwordProblem(password) {
    const value = String(password || '');
    const failed = PASSWORD_RULES.find((rule) => !rule.ok(value));
    if (!failed) return '';
    return failed.id === 'len'
      ? 'პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო.'
      : 'პაროლი უნდა შეიცავდეს ასოსა და ციფრს.';
  }

  function passwordFieldHTML(options) {
    const opts = options || {};
    const name = opts.name || 'password';
    const id = opts.id || `pw-${name}-${Math.random().toString(36).slice(2, 8)}`;
    const complete = opts.autocomplete || 'new-password';
    return `
      <div class="field pw-field" data-pw-field>
        <label for="${id}">${escapeAttr(opts.label || 'პაროლი')}</label>
        <div class="pw-input">
          <input id="${id}" type="password" name="${escapeAttr(name)}" required
                 autocomplete="${escapeAttr(complete)}" minlength="8"
                 autocapitalize="none" autocorrect="off" spellcheck="false"
                 placeholder="••••••••">
          <button type="button" class="pw-toggle" data-pw-toggle
                  aria-controls="${id}" aria-pressed="false" aria-label="პაროლის ჩვენება">${icons.eye}</button>
        </div>
        ${opts.rules === false ? '' : `<ul class="pw-rules" data-pw-rules>${
          PASSWORD_RULES.map((rule) => `<li data-pw-rule="${rule.id}">${icons.check}<span>${rule.label}</span></li>`).join('')
        }</ul>`}
      </div>
    `;
  }

  function usernameFieldHTML(value) {
    if (!value) return '';
    return `<input class="pw-username" type="text" name="username" autocomplete="username"
                   value="${escapeAttr(value)}" readonly tabindex="-1" aria-hidden="true">`;
  }

  function bindPasswordFields(root) {
    const scope = root || document;
    scope.querySelectorAll('[data-pw-field]').forEach((field) => {
      if (field.dataset.pwBound === '1') return;
      field.dataset.pwBound = '1';
      const input = field.querySelector('input');
      const toggle = field.querySelector('[data-pw-toggle]');
      const rules = field.querySelectorAll('[data-pw-rule]');

      if (toggle) {
        toggle.addEventListener('click', () => {
          const show = input.type === 'password';
          const at = input.selectionStart;
          input.type = show ? 'text' : 'password';
          toggle.setAttribute('aria-pressed', String(show));
          toggle.setAttribute('aria-label', show ? 'პაროლის დამალვა' : 'პაროლის ჩვენება');
          toggle.innerHTML = show ? icons.eyeOff : icons.eye;
          input.focus();
          try { input.setSelectionRange(at, at); } catch {  }
        });
      }

      if (rules.length) {
        const paint = () => {
          const value = input.value;
          rules.forEach((li) => {
            const rule = PASSWORD_RULES.find((r) => r.id === li.dataset.pwRule);
            li.classList.toggle('is-ok', !!rule && rule.ok(value));
          });
        };
        input.addEventListener('input', paint);
        paint();
      }
    });
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ''));
  }

  let savedIdsPromise = null;

  function fetchSavedIds() {
    if (!sbClient || !authUser || authUser.demo) return Promise.resolve(new Set());
    if (!savedIdsPromise) {
      savedIdsPromise = sbClient
        .from('saved_listings')
        .select('vehicle_id')
        .then(({ data, error }) => {
          if (error) return new Set();
          return new Set((data || []).map((row) => row.vehicle_id));
        });
    }
    return savedIdsPromise;
  }

  async function hydrateSavedButtons() {
    if (!authUser || authUser.demo) return;
    const buttons = document.querySelectorAll('.save-btn:not([data-saved-hydrated])');
    if (!buttons.length) return;
    const saved = await fetchSavedIds();
    buttons.forEach((btn) => {
      btn.setAttribute('data-saved-hydrated', '1');
      const id = btn.dataset.id || btn.closest('[data-id]')?.dataset.id;
      if (id && saved.has(id)) btn.classList.add('is-saved');
    });
  }

  const rerenderObserver = new MutationObserver(() => {
    renderAuthSlot();
    hydrateSavedButtons();
  });
  document.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('#app');
    if (app) rerenderObserver.observe(app, { childList: true, subtree: true });
    authReady.then(() => {
      renderAuthSlot();
      hydrateSavedButtons();
      maybeRequireProfile();
    });
  });

  async function fetchFeed(limit = 48) {
    if (!sbClient) return null;

    const cached = cacheGet(`feed:${limit}`);
    if (cached) return cached.map(mapFeedRow);

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

    cacheSet(`feed:${limit}`, data || [], 60 * 1000);
    return (data || []).map(mapFeedRow);
  }

  function bustListingCaches() {
    cacheBust('feed:');
  }

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

  const CATALOG_TTL = 10 * 60 * 1000;

  async function searchMakes(term = '', limit = 40) {
    if (sbClient) {
      const cacheKey = `makes:${String(term).trim().toLowerCase()}:${limit}`;
      const cached = cacheGet(cacheKey);
      if (cached) return cached;
      let query = sbClient.from('car_makes').select('id,name').order('name').limit(limit);
      if (String(term).trim()) query = query.ilike('name', `%${String(term).trim()}%`);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        cacheSet(cacheKey, data, CATALOG_TTL);
        return data;
      }
      if (error) logCatalogFallback('makes', error);
    }
    return containsFilter(FALLBACK_MAKES, term, limit);
  }

  async function searchModels(term = '', makeId = null, limit = 60) {
    if (sbClient) {
      const cacheKey = `models:${makeId || ''}:${String(term).trim().toLowerCase()}:${limit}`;
      const cached = cacheGet(cacheKey);
      if (cached) return cached;
      let query = sbClient.from('car_models').select('id,name,make_id').order('name').limit(limit);
      if (makeId && /^\d+$/.test(String(makeId))) query = query.eq('make_id', makeId);
      if (String(term).trim()) query = query.ilike('name', `%${String(term).trim()}%`);
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        cacheSet(cacheKey, data, CATALOG_TTL);
        return data;
      }
      if (error) logCatalogFallback('models', error);
    }
    const scoped = makeId ? FALLBACK_MODELS.filter((m) => String(m.make_id) === String(makeId)) : FALLBACK_MODELS;
    return containsFilter(scoped, term, limit);
  }

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
          <p class="mycar-note">ეს მხოლოდ კატალოგის მორგებაა, სრული განცხადებისთვის <a href="/sell">დაამატე ფოტოებით</a>.</p>
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
    return String(value).replace(/[&<>"'`]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[c]));
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

  function openLoginGateModal(message) {
    const next = encodeURIComponent(window.location.pathname.split('/').pop() + window.location.search);
    const { overlay } = buildModal(`
      <div class="modal-body">
        <p class="modal-eyebrow">ავტორიზაცია</p>
        <h2 class="modal-title" id="login-gate-title">ჯერ შესვლაა საჭირო</h2>
        <p class="offer-gate-text">${escapeAttr(message)}</p>
        <div class="offer-actions">
          <a class="btn btn-ghost" href="/login?next=${next}">Google-ით</a>
          <button type="button" class="btn btn-primary" id="login-gate-phone">ნომრით შესვლა</button>
        </div>
      </div>
    `, 'login-gate-title');
    overlay.querySelector('#login-gate-phone').addEventListener('click', () => openAuthModal('login'));
  }

  async function openRealOfferModal(car) {
    const title = `${car.make || ''} ${car.model || ''}`.trim() || 'ავტომობილი';

    let ownerId = car.ownerId || '';
    if (!ownerId) {
      const { data } = await sbClient.from('vehicles').select('owner_id').eq('id', car.id).maybeSingle();
      ownerId = data ? data.owner_id : '';
    }
    if (!ownerId) {
      toast('განცხადება ვერ მოიძებნა ან აღარ არის აქტიური', 'error');
      return;
    }
    if (ownerId === authUser.id) {
      toast('საკუთარ განცხადებაზე შეთავაზებას ვერ გააგზავნი', 'error');
      return;
    }

    const { data: mine, error: mineError } = await sbClient
      .from('vehicles')
      .select('id,make,model,year')
      .eq('owner_id', authUser.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (mineError) {
      toast('შენი მანქანების ჩატვირთვა ვერ მოხერხდა', 'error');
      return;
    }

    if (!mine || !mine.length) {
      buildModal(`
        <div class="modal-body">
          <p class="modal-eyebrow">გაცვლის შეთავაზება</p>
          <h2 class="modal-title" id="offer-title">ჯერ შენი განცხადება გვჭირდება</h2>
          <p class="offer-gate-text">შეთავაზებაში შენი აქტიური მანქანა მონაწილეობს, დაამატე განცხადება და მერე შესთავაზე ${escapeAttr(title)}-ის მფლობელს.</p>
          <div class="offer-actions">
            <button type="button" class="btn btn-ghost" data-close>გაუქმება</button>
            <a class="btn btn-primary" href="/sell">დაამატე განცხადება</a>
          </div>
        </div>
      `, 'offer-title');
      return;
    }

    const vehicleOptions = mine
      .map((v) => `<option value="${v.id}">${escapeAttr(`${v.make} ${v.model}${v.year ? ` · ${v.year}` : ''}`)}</option>`)
      .join('');

    const { overlay, close } = buildModal(`
      <div class="modal-body" id="offer-modal-body">
        <p class="modal-eyebrow">გაცვლის შეთავაზება</p>
        <h2 class="modal-title" id="offer-title">${escapeAttr(title)}</h2>
        ${ownerTrustLine(car)}
        <form class="offer-form" id="real-offer-form" novalidate>
          <label class="field">
            <span>რომელ მანქანას სთავაზობ</span>
            <select name="offeredVehicle" required>${vehicleOptions}</select>
          </label>
          <div class="field-row">
            <label class="field">
              <span>თანხის სხვაობა</span>
              <select name="cashMode">
                <option value="none">თანაბარი გაცვლა</option>
                <option value="add_money">მე ვამატებ თანხას</option>
                <option value="ask_money">მე ვითხოვ თანხას</option>
                <option value="flexible">შეთანხმებით</option>
              </select>
            </label>
            <label class="field field--offer-amount" data-offer-amount hidden>
              <span>თანხა</span>
              <span class="offer-amount-control">
                <input type="number" name="amount" min="0" placeholder="0" inputmode="numeric">
                <select name="amountCurrency" aria-label="ვალუტა">
                  <option value="GEL">₾</option>
                  <option value="USD">$</option>
                </select>
              </span>
            </label>
          </div>
          <label class="field">
            <span>შეტყობინება (არასავალდებულო)</span>
            <textarea name="message" rows="3" maxlength="500" placeholder="მაგ: მანქანა იდეალურ მდგომარეობაშია, შეგვიძლია დიაგნოსტიკაზე შევხვდეთ."></textarea>
          </label>
          <div class="offer-actions">
            <button type="button" class="btn btn-ghost" data-close>გაუქმება</button>
            <button type="submit" class="btn btn-primary">შეთავაზების გაგზავნა</button>
          </div>
        </form>
      </div>
    `, 'offer-title');

    bindOfferAmount(overlay.querySelector('#real-offer-form'));
    overlay.querySelector('#real-offer-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget;
      const data = new FormData(form);
      const submitBtn = form.querySelector('[type="submit"]');
      submitBtn.disabled = true;

      const cashMode = String(data.get('cashMode') || 'none');
      const { error } = await sbClient.from('offers').insert({
        target_vehicle_id: car.id,
        offered_vehicle_id: String(data.get('offeredVehicle')),
        from_user_id: authUser.id,
        to_user_id: ownerId,
        cash_mode: cashMode,
        cash_amount: cashMode === 'none' || cashMode === 'flexible' ? 0 : offerAmountInGel(form),
        message: String(data.get('message') || '').trim() || null,
      });

      if (error) {
        submitBtn.disabled = false;
        if (String(error.code) === '23505') {
          toast('ამ წყვილზე უკვე გაქვს მოლოდინში მყოფი შეთავაზება', 'error');
        } else {
          toast('შეთავაზება ვერ გაიგზავნა, სცადე თავიდან', 'error');
          console.error('AutoSwap: offer insert failed', error.message);
        }
        return;
      }

      overlay.querySelector('#offer-modal-body').innerHTML = `
        <div class="offer-success">
          <span class="offer-success-icon">${icons.check}</span>
          <h2 class="modal-title">შეთავაზება გაიგზავნა</h2>
          <p>${escapeAttr(title)}-ის მფლობელი ნახავს შენს შეთავაზებას. პასუხს ნახავ <a href="/account#sent">შენს გვერდზე</a>.</p>
          <button type="button" class="btn btn-primary" data-close>გასაგებია</button>
        </div>
      `;
    });

    return { overlay, close };
  }

  function openOfferModal(car) {
    if (sbClient && car && isUuid(car.id)) {
      if (!authUser || authUser.demo) {
        openLoginGateModal('შეთავაზების გასაგზავნად შედი ერთჯერადი კოდით, ისე, რომ მფლობელმა იცოდეს ვინ სთავაზობს.');
        return;
      }
      openRealOfferModal(car);
      return;
    }

    const title = `${car && car.make ? car.make : ''} ${car && car.model ? car.model : ''}`.trim() || 'ავტომობილი';
    const myCar = getMyCar();

    if (!myCar) {
      buildModal(`
        <div class="modal-body">
          <p class="modal-eyebrow">გაცვლის შეთავაზება</p>
          <h2 class="modal-title" id="offer-title">ჯერ შენი მანქანა გვჭირდება</h2>
          <p class="offer-gate-text">შეთავაზება გაცვლის ნახევარია, ${escapeAttr(title)}-ის მფლობელმა უნდა ნახოს, რას სთავაზობ სანაცვლოდ.</p>
          <div class="offer-actions">
            <a class="btn btn-ghost" href="/sell">სრული განცხადება</a>
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
            <label class="field field--offer-amount" data-offer-amount hidden>
              <span>თანხა</span>
              <span class="offer-amount-control">
                <input type="number" name="amount" min="0" placeholder="0" inputmode="numeric">
                <select name="amountCurrency" aria-label="ვალუტა">
                  <option value="GEL">₾</option>
                  <option value="USD">$</option>
                </select>
              </span>
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

    bindOfferAmount(overlay.querySelector('#offer-form'));
    overlay.querySelector('#offer-form').addEventListener('submit', (event) => {
      event.preventDefault();
      overlay.querySelector('#offer-modal-body').innerHTML = `
        <div class="offer-success">
          <span class="offer-success-icon">${icons.check}</span>
          <h2 class="modal-title">შეთავაზება გაიგზავნა</h2>
          <p>${escapeAttr(title)}-ის მფლობელი ნახავს შენს ${escapeAttr(myLabel)}-ს და პირობებს. ნახვისთანავე და პასუხისთანავე შეგატყობინებთ.</p>
          <p class="offer-demo-note">დემო რეჟიმი, რეალური გაგზავნა ჩაირთვება ანგარიშის დადასტურების შემდეგ.</p>
          <button type="button" class="btn btn-primary" data-close>გასაგებია</button>
        </div>
      `;
    });
  }

  const DEMO_USER_KEY = 'autoswap.demoUser';
  const DEMO_OTP_CODE = '1234';

  function getDemoUser() {
    try {
      const raw = localStorage.getItem(DEMO_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_err) {
      return null;
    }
  }

  function formatPhoneDisplay(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    const m = digits.match(/^995(5\d{2})(\d{2})(\d{2})(\d{2})$/);
    return m ? `+995 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : (digits ? `+${digits}` : '');
  }

  function authDisplayName(user) {
    if (!user) return '';
    if (user.demo) return user.name || formatPhoneDisplay(user.phone);
    const meta = user.user_metadata || {};
    return meta.full_name || formatPhoneDisplay(user.phone) || 'ანგარიში';
  }

  function authSlotHTML() {
    if (!authUser) {
      return '<button class="btn btn-light header-login" type="button" data-auth-open>შესვლა</button>';
    }
    const display = authDisplayName(authUser);
    const first = display.trim().charAt(0);
    const initial = /[a-z]/.test(first) ? first.toUpperCase() : first;
    const chip = `
      <span class="header-avatar" aria-hidden="true">${/^[+\d]/.test(initial) ? icons.user : initial}</span>
      <span class="header-user-name">${escapeAttr(display)}</span>
    `;
    return `
      ${authUser.demo
        ? `<span class="header-user">${chip}</span>`
        : `<a class="header-user" href="/account" title="ჩემი ანგარიში">${chip}</a>`}
      <button class="header-logout" type="button" data-logout title="გასვლა" aria-label="გასვლა">${icons.logout}</button>
    `;
  }

  function renderAuthSlot() {
    const state = authUser ? `in:${authUser.demo ? 'demo' : authUser.id}:${authDisplayName(authUser)}` : 'out';
    document.querySelectorAll('#header-auth').forEach((slot) => {
      if (slot.dataset.authState === state) return;
      slot.dataset.authState = state;
      slot.innerHTML = authSlotHTML();
    });
    document.querySelectorAll('.notify-wrap').forEach((wrap) => {
      wrap.hidden = !authUser;
    });
  }

  function normalizePhone(raw) {
    const digits = String(raw || '').replace(/\D/g, '');
    if (/^9955\d{8}$/.test(digits)) return `+${digits}`;
    if (/^5\d{8}$/.test(digits)) return `+995${digits}`;
    return null;
  }

  const CHANNEL_KEY = 'autoswap.otpChannel';
  const CHANNELS = ['whatsapp', 'sms'];
  const CHANNEL_LABEL = { sms: 'SMS', whatsapp: 'WhatsApp' };
  const DEFAULT_CHANNEL = 'whatsapp';

  function preferredChannel() {
    try {
      const saved = localStorage.getItem(CHANNEL_KEY);
      return CHANNELS.includes(saved) ? saved : DEFAULT_CHANNEL;
    } catch (_err) {
      return DEFAULT_CHANNEL;
    }
  }

  function rememberChannel(channel) {
    try { localStorage.setItem(CHANNEL_KEY, channel); } catch (_err) {  }
  }

  function channelPickerHTML() {
    const current = preferredChannel();
    return `
      <div class="otp-channel" role="radiogroup" aria-label="კოდის მიღების არხი">
        ${CHANNELS.map((c) => `
          <button type="button" class="otp-channel-opt${c === current ? ' is-on' : ''}"
                  role="radio" aria-checked="${c === current}" data-channel="${c}">
            <span class="otp-channel-icon">${c === 'whatsapp' ? icons.whatsapp : icons.sms}</span>
            <span>${CHANNEL_LABEL[c]}</span>
          </button>`).join('')}
      </div>
    `;
  }

  function bindChannelPicker(root) {
    const group = root && root.querySelector('.otp-channel');
    if (!group) return () => preferredChannel();
    group.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-channel]');
      if (!btn) return;
      group.querySelectorAll('[data-channel]').forEach((el) => {
        const on = el === btn;
        el.classList.toggle('is-on', on);
        el.setAttribute('aria-checked', String(on));
      });
      rememberChannel(btn.dataset.channel);
    });
    return () => {
      const on = group.querySelector('.is-on');
      return (on && on.dataset.channel) || preferredChannel();
    };
  }

  async function callAuthFn(name, body, options) {
    const base = String(window.AUTO_SWAP_SUPABASE_URL || '').trim().replace(/\/$/, '');
    const anonKey = String(window.AUTO_SWAP_SUPABASE_ANON_KEY || '').trim();
    let bearer = anonKey;
    if (options && options.auth) {
      const { data: { session } } = await sbClient.auth.getSession();
      if (session && session.access_token) bearer = session.access_token;
    }
    let res;
    try {
      res = await fetch(`${base}/functions/v1/${name}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: anonKey, Authorization: `Bearer ${bearer}` },
        body: JSON.stringify(body),
      });
    } catch (_err) {
      return { error: 'კავშირი ვერ შედგა, შეამოწმე ინტერნეტი და სცადე თავიდან.' };
    }
    let data = {};
    try { data = await res.json(); } catch (_err) {  }
    if (res.status === 404 && !data.error) {
      return { error: 'სერვისი დროებით მიუწვდომელია. სცადე მოგვიანებით.' };
    }
    return { res, data };
  }

  async function requestOtp(phone, channel, purpose) {
    if (!sbClient) return { demo: true };
    const wantsAttach = purpose === 'attach';
    const { res, data, error } = await callAuthFn(
      'request-otp',
      { phone, channel: channel || preferredChannel(), purpose: wantsAttach ? 'attach' : 'login' },
      { auth: wantsAttach },
    );
    if (error) return { error };
    if (res.status === 429 || data.blocked) {
      const wait = Number(data.retry_after) || 60;
      return { error: `კოდი ვერ გაიგზავნა: ${data.error || 'too many requests'} (${wait}s)` };
    }
    if (!res.ok) {
      console.error('request-otp failed', {
        status: res.status,
        provider_status: data.provider_status,
        code: data.code,
        error: data.error,
        channel: channel || preferredChannel(),
      });
      return { error: `კოდი ვერ გაიგზავნა: ${data.error || res.statusText}` };
    }
    if (data.status === 'provider_disabled') return { demo: true };
    if (data.status === 'legacy_attach') return { demo: false, legacy: true };
    const delivered = String(data.channel || 'SMS').toLowerCase();
    const asked = String(data.requested_channel || delivered).toLowerCase();
    return {
      demo: false,
      requestId: data.request_id || null,
      channel: delivered,
      fellBack: asked === 'whatsapp' && delivered !== 'whatsapp',
    };
  }

  async function exchangeOtp(requestId, code, needsAuth) {
    const { res, data, error } = await callAuthFn(
      'verify-otp',
      { request_id: requestId, code },
      { auth: !!needsAuth },
    );
    if (error) return { error };
    if (!res.ok) return { error: data.error || res.statusText };
    return { data };
  }

  async function confirmOtp(phone, code, isDemo, requestId) {
    if (isDemo) {
      if (code !== DEMO_OTP_CODE) return { error: `არასწორი კოდი, დემო რეჟიმში კოდია ${DEMO_OTP_CODE}.` };
      const existing = getDemoUser();
      const demoUser = { name: (existing && existing.phone === phone && existing.name) || '', phone };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      authUser = { demo: true, ...demoUser };
      notifyAuth();
      return { user: authUser };
    }
    if (requestId) {
      const { data, error } = await exchangeOtp(requestId, code);
      if (error) return { error: `კოდი ვერ დადასტურდა: ${error}` };
      const { data: applied, error: sessionError } = await sbClient.auth.verifyOtp({
        token_hash: data.token_hash,
        type: 'magiclink',
      });
      if (sessionError) return { error: `სესია ვერ შეიქმნა: ${georgianError(sessionError)}` };
      return { user: applied.user || (applied.session && applied.session.user) };
    }
    const { data, error } = await sbClient.auth.verifyOtp({ phone, token: code, type: 'sms' });
    return error ? { error: `კოდი ვერ დადასტურდა: ${georgianError(error)}` } : { user: data.user };
  }

  function needsName(user) {
    if (!user) return false;
    if (user.demo) return !user.name;
    return !(user.user_metadata && user.user_metadata.full_name);
  }

  async function saveDisplayName(name) {
    if (authUser && authUser.demo) {
      const demoUser = { ...getDemoUser(), name };
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      authUser = { demo: true, ...demoUser };
      notifyAuth();
      return {};
    }
    const { data, error } = await sbClient.auth.updateUser({ data: { full_name: name } });
    if (error) return { error: `სახელი ვერ შეინახა: ${georgianError(error)}` };
    authUser = data.user;
    notifyAuth();
    return {};
  }

  function openNameRequiredModal() {
    const { overlay, close } = buildModal(`
      <div class="modal-body auth-modal">
        <h2 class="modal-title" id="name-req-title">როგორ მოგმართოთ?</h2>
        <p class="auth-sub">სახელი გამოჩნდება შენს განცხადებებზე და შეთავაზებებზე.</p>
        <form class="offer-form" id="name-req-form" novalidate>
          <label class="field">
            <span>სახელი</span>
            <input type="text" name="name" autocomplete="name" placeholder="მაგ: გიორგი" required>
          </label>
          <p class="auth-error" hidden></p>
          <button type="submit" class="btn btn-primary auth-submit">შენახვა</button>
        </form>
        <button type="button" class="auth-link-btn" data-close>მოგვიანებით</button>
      </div>
    `, 'name-req-title');
    overlay.querySelector('#name-req-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const errorBox = overlay.querySelector('.auth-error');
      const name = String(new FormData(event.currentTarget).get('name') || '').trim();
      if (!name) {
        errorBox.textContent = 'შეიყვანე სახელი.';
        errorBox.hidden = false;
        return;
      }
      const result = await saveDisplayName(name);
      if (result.error) {
        errorBox.textContent = result.error;
        errorBox.hidden = false;
        return;
      }
      toast(`გამარჯობა, ${name}!`);
      close();
    });
    overlay.querySelector('[name="name"]').focus();
  }

  function logout() {
    localStorage.removeItem(DEMO_USER_KEY);
    authUser = null;
    savedIdsPromise = null;
    notifyAuth();
    sbClient?.auth.signOut().catch((err) => console.error('AutoSwap: signOut failed', err.message));
  }

  function signedInWithOAuth(user) {
    const provider = user && user.app_metadata && user.app_metadata.provider;
    if (provider && provider !== 'phone') return true;
    const identities = user && user.identities;
    return Array.isArray(identities)
      && identities.some((identity) => identity.provider && identity.provider !== 'phone');
  }

  // Display-only view of the number attached to an account, in descending order
  // of trust: the GoTrue-verified column, then app_metadata.verified_phone
  // (stamped by verify-otp; readable by the client but writable only by the
  // service role), then legacy user_metadata. Identity is never resolved from
  // this - that happens server-side in user_id_for_phone().
  function attachedPhone(user) {
    if (!user) return '';
    return user.phone
      || (user.app_metadata && user.app_metadata.verified_phone)
      || (user.user_metadata && user.user_metadata.phone)
      || '';
  }

  function needsPhone(user) {
    if (!user || user.demo) return false;
    if (signedInWithOAuth(user)) return false;
    return !attachedPhone(user);
  }

  function autofillOtpFromSms(input, onFilled) {
    const noop = () => {};
    if (!input || !('OTPCredential' in window) || !window.isSecureContext) return noop;
    let controller;
    try {
      controller = new AbortController();
    } catch (_err) {
      return noop;
    }
    navigator.credentials
      .get({ otp: { transport: ['sms'] }, signal: controller.signal })
      .then((credential) => {
        const code = credential && credential.code;
        if (!code || !input.isConnected) return;
        input.value = code;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        if (typeof onFilled === 'function') onFilled(code);
      })
      .catch(() => {  });
    const stop = () => { try { controller.abort(); } catch (_err) {  } };
    if (typeof MutationObserver === 'function') {
      const observer = new MutationObserver(() => {
        if (input.isConnected) return;
        observer.disconnect();
        stop();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    return stop;
  }

  async function requestPhoneAttach(phone, channel) {
    const result = await requestOtp(phone, channel, 'attach');
    if (result.error) return { error: `ნომერი ვერ დაემატა: ${result.error}` };
    if (!result.legacy) return result;
    const { error } = await sbClient.auth.updateUser({ phone });
    if (!error) return { demo: false };
    const message = String(error.message || '');
    if (/provider|not enabled|disabled|unsupported|sms/i.test(message)) return { demo: true };
    return { error: `ნომერი ვერ დაემატა: ${message}` };
  }

  async function confirmPhoneAttach(phone, code, isDemo, requestId) {
    if (isDemo) {
      if (code !== DEMO_OTP_CODE) return { error: `არასწორი კოდი, დემო რეჟიმში კოდია ${DEMO_OTP_CODE}.` };
      const { error } = await sbClient.auth.updateUser({ data: { phone } });
      return error ? { error: `ნომერი ვერ შეინახა: ${georgianError(error)}` } : {};
    }
    if (requestId) {
      const { error } = await exchangeOtp(requestId, code, true);
      if (error) return { error: `კოდი ვერ დადასტურდა: ${error}` };
      const { data: refreshed } = await sbClient.auth.refreshSession();
      if (refreshed && refreshed.user) {
        authUser = refreshed.user;
        notifyAuth();
      }
      return {};
    }
    const { error } = await sbClient.auth.verifyOtp({ phone, token: code, type: 'phone_change' });
    return error ? { error: `კოდი ვერ დადასტურდა: ${georgianError(error)}` } : {};
  }

  function openPhoneRequiredModal() {
    const { overlay, close } = buildModal(`
      <div class="modal-body auth-modal">
        <h2 class="modal-title" id="phone-req-title">დაამატე ტელეფონის ნომერი</h2>
        <p class="auth-sub">ნომერი სავალდებულოა, გაცვლის შეთავაზებები და კონტაქტი ნომერზე დგას.</p>
        <div id="phone-req-step">
          <form class="offer-form" id="phone-req-form" novalidate>
            <label class="field">
              <span>ტელეფონის ნომერი</span>
              <input type="tel" name="phone" inputmode="tel" autocomplete="tel-national" placeholder="5XX XX XX XX" required>
            </label>
            <div class="field">
              <span>კოდი მივიღო</span>
              ${channelPickerHTML()}
            </div>
            <p class="auth-error" hidden></p>
            <button type="submit" class="btn btn-primary auth-submit">კოდის გაგზავნა</button>
          </form>
          <button type="button" class="auth-link-btn" data-close>მოგვიანებით</button>
        </div>
      </div>
    `, 'phone-req-title');

    const step = overlay.querySelector('#phone-req-step');
    const showError = (text) => {
      const el = step.querySelector('.auth-error');
      if (!el) return;
      el.textContent = text;
      el.hidden = false;
    };

    const readChannel = bindChannelPicker(step);

    step.querySelector('#phone-req-form').addEventListener('submit', async (event) => {
      event.preventDefault();
      const phone = normalizePhone(new FormData(event.currentTarget).get('phone'));
      if (!phone) {
        showError('შეიყვანე ქართული მობილურის ნომერი ფორმატით 5XX XX XX XX.');
        return;
      }
      const submit = event.currentTarget.querySelector('[type="submit"]');
      submit.disabled = true;
      const channel = readChannel();
      const result = await requestPhoneAttach(phone, channel);
      if (result.error) {
        submit.disabled = false;
        showError(result.error);
        return;
      }
      const attachRequestId = result.requestId || null;
      const viaWhatsApp = (result.channel || channel) === 'whatsapp';
      step.innerHTML = `
        <p class="auth-sub">კოდი გაიგზავნა ${viaWhatsApp ? 'WhatsApp-ით' : 'SMS-ით'} ნომერზე <strong>${escapeAttr(phone)}</strong>.${result.demo ? ` დემო რეჟიმი, შეიყვანე კოდი <strong>${DEMO_OTP_CODE}</strong>.` : ''}</p>
        ${result.fellBack ? '<p class="auth-note">WhatsApp ამ ნომრისთვის მიუწვდომელია, კოდი SMS-ით გაიგზავნა.</p>' : ''}
        <form class="offer-form" id="phone-req-otp" novalidate>
          <label class="field">
            <span>ერთჯერადი კოდი</span>
            <input class="otp-input" type="text" name="code" inputmode="numeric" pattern="[0-9]*" autocomplete="one-time-code" data-lpignore="true" data-1p-ignore maxlength="6" placeholder="••••">
          </label>
          <p class="auth-error" hidden></p>
          <button type="submit" class="btn btn-primary auth-submit">დადასტურება</button>
        </form>
        <button type="button" class="auth-link-btn" data-close>მოგვიანებით</button>
      `;
      const otpInput = step.querySelector('.otp-input');
      otpInput.focus();
      autofillOtpFromSms(otpInput, () => {
        const liveForm = step.querySelector('form');
        if (liveForm) liveForm.requestSubmit();
      });
      let attaching = false;
      step.querySelector('#phone-req-otp').addEventListener('submit', async (otpEvent) => {
        otpEvent.preventDefault();
        if (attaching) return;
        const code = String(new FormData(otpEvent.currentTarget).get('code') || '').trim();
        if (!code) {
          showError('შეიყვანე SMS კოდი.');
          return;
        }
        attaching = true;
        const attachSubmit = otpEvent.currentTarget.querySelector('[type="submit"]');
        if (attachSubmit) attachSubmit.disabled = true;
        const confirmed = await confirmPhoneAttach(phone, code, result.demo, attachRequestId);
        if (confirmed.error) {
          attaching = false;
          if (attachSubmit) attachSubmit.disabled = false;
          showError(confirmed.error);
          return;
        }
        const { data } = await sbClient.auth.getUser();
        if (data && data.user) {
          authUser = data.user;
          notifyAuth();
        }
        toast('ნომერი დაემატა');
        close();
      });
    });
  }

  const NAME_LATER_KEY = 'autoswap.nameLater';

  function maybeRequireProfile() {
    if (document.querySelector('.modal-overlay')) return;
    if (needsPhone(authUser)) {
      openPhoneRequiredModal();
      return;
    }
    if (needsName(authUser) && !sessionStorage.getItem(NAME_LATER_KEY)) {
      sessionStorage.setItem(NAME_LATER_KEY, '1');
      openNameRequiredModal();
    }
  }

  function authProvidersHTML() {
    return `
      <div class="auth-providers">
        <button type="button" class="btn-provider btn-google" data-provider="google">${icons.google}<span>Google-ით გაგრძელება</span></button>
      </div>
      <div class="auth-divider"><span>ან ნომრით</span></div>
    `;
  }

  function authFormHTML() {
    return `
      ${authProvidersHTML()}
      <form class="offer-form" id="auth-form" novalidate>
        <label class="field">
          <span>ტელეფონის ნომერი</span>
          <input type="tel" name="phone" inputmode="tel" autocomplete="tel-national" placeholder="5XX XX XX XX" required>
        </label>
        ${passwordFieldHTML({ label: 'პაროლი', autocomplete: 'current-password', rules: false })}
        <p class="auth-error" id="auth-error" hidden></p>
        <button type="submit" class="btn btn-primary auth-submit" id="auth-submit">შესვლა</button>
      </form>
      <div class="auth-secondary">
        <a class="auth-link" href="/login?register">დარეგისტრირდი</a>
        <a class="auth-link" href="/login">დაგავიწყდა პაროლი?</a>
      </div>
    `;
  }

  function openAuthModal() {
    const { overlay, close } = buildModal(`
      <div class="modal-body auth-modal" id="auth-body">
        <h2 class="modal-title" id="auth-title">შესვლა</h2>
        <div id="auth-step">${authFormHTML()}</div>
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
      bindPasswordFields(step);

      step.querySelectorAll('.btn-provider').forEach((btn) => {
        btn.addEventListener('click', async () => {
          btn.disabled = true;
          const { error } = await signInWithProvider(btn.dataset.provider);
          if (error) {
            btn.disabled = false;
            showError(error);
          }
        });
      });

      step.querySelector('#auth-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const phone = normalizePhone(data.get('phone'));
        if (!phone) {
          showError('შეიყვანე ქართული მობილურის ნომერი ფორმატით 5XX XX XX XX.');
          return;
        }
        const submit = step.querySelector('#auth-submit');
        submit.disabled = true;
        submit.textContent = 'შესვლა…';
        const result = await signInWithPassword(phone, String(data.get('password') || ''));
        if (result.error) {
          submit.disabled = false;
          submit.textContent = 'შესვლა';
          showError(result.error);
          return;
        }
        if (needsName(result.user || authUser)) {
          bindNameStep();
          return;
        }
        showSuccess(authDisplayName(result.user || authUser));
      });
    }

    function bindNameStep() {
      step.innerHTML = `
        <p class="auth-sub">ნომერი დადასტურდა, როგორ მოგმართოთ?</p>
        <form class="offer-form" id="name-form" novalidate>
          <label class="field">
            <span>სახელი</span>
            <input type="text" name="name" autocomplete="name" placeholder="მაგ: გიორგი" required>
          </label>
          <p class="auth-error" hidden></p>
          <button type="submit" class="btn btn-primary auth-submit">შენახვა</button>
        </form>
        <button type="button" class="auth-link-btn" data-close>მოგვიანებით</button>
      `;
      step.querySelector('#name-form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = String(new FormData(event.currentTarget).get('name') || '').trim();
        if (!name) {
          showError('შეიყვანე სახელი.');
          return;
        }
        const result = await saveDisplayName(name);
        if (result.error) {
          showError(result.error);
          return;
        }
        showSuccess(name);
      });
      step.querySelector('[name="name"]').focus();
    }

    function showSuccess(name) {
      step.innerHTML = `
        <div class="offer-success">
          <span class="offer-success-icon">${icons.check}</span>
          <h2 class="modal-title">გამარჯობა${name ? `, ${escapeAttr(name)}` : ''}!</h2>
          <p>შესვლა წარმატებულია.</p>
          <button type="button" class="btn btn-primary" data-close>გასაგებია</button>
        </div>
      `;
    }

    bindPhoneStep();
    return { overlay, close };
  }

  document.addEventListener('click', (event) => {
    const offerBtn = event.target.closest('[data-offer]');
    if (offerBtn) {
      event.preventDefault();
      openOfferModal({ id: offerBtn.dataset.id, make: offerBtn.dataset.make, model: offerBtn.dataset.model });
    }
  });
  async function toggleSaved(listingId, btn) {
    const wasSaved = btn.classList.contains('is-saved');
    btn.classList.toggle('is-saved');
    const saved = await fetchSavedIds();

    const revert = (message) => {
      btn.classList.toggle('is-saved', wasSaved);
      if (message) toast(message, 'error');
    };

    if (wasSaved) {
      const { error } = await sbClient
        .from('saved_listings')
        .delete()
        .eq('user_id', authUser.id)
        .eq('vehicle_id', listingId);
      if (error) return revert('წაშლა ვერ მოხერხდა');
      saved.delete(listingId);
    } else {
      const { error } = await sbClient
        .from('saved_listings')
        .insert({ user_id: authUser.id, vehicle_id: listingId });
      if (error && String(error.code) !== '23505') return revert('შენახვა ვერ მოხერხდა');
      saved.add(listingId);
      toast('დაემატა ფავორიტებში');
    }
  }

  document.addEventListener('click', (event) => {
    const saveBtn = event.target.closest('.save-btn');
    if (!saveBtn) return;
    const listingId = saveBtn.dataset.id || saveBtn.closest('[data-id]')?.dataset.id || '';

    if (sbClient && isUuid(listingId)) {
      if (!authUser || authUser.demo) {
        openLoginGateModal('ფავორიტებში შესანახად შედი ერთჯერადი კოდით.');
        return;
      }
      toggleSaved(listingId, saveBtn);
      return;
    }
    saveBtn.classList.toggle('is-saved');
  });
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-auth-open]')) openAuthModal();
    if (event.target.closest('[data-logout]')) logout();
  });

  const CURRENCY_KEY = 'autoswap.currency';
  const USD_RATE_CACHE_KEY = 'autoswap.usdRate';
  const USD_RATE_TTL = 12 * 60 * 60 * 1000;
  const FALLBACK_GEL_PER_USD = 2.70;
  const MONEY_RE = /(\d[\d\s,.]*\d|\d)\s*₾/g;

  let currency = 'GEL';
  try {
    currency = localStorage.getItem(CURRENCY_KEY) === 'USD' ? 'USD' : 'GEL';
  } catch (_err) {  }
  let gelPerUsd = FALLBACK_GEL_PER_USD;

  async function loadUsdRate() {
    try {
      const cached = JSON.parse(localStorage.getItem(USD_RATE_CACHE_KEY) || 'null');
      if (cached && cached.rate > 0 && Date.now() - cached.ts < USD_RATE_TTL) {
        gelPerUsd = cached.rate;
        return;
      }
    } catch (_err) {  }
    try {
      const res = await fetch('https://nbg.gov.ge/gw/api/ct/monetarypolicy/currencies/en/json?currencies=USD');
      const data = await res.json();
      const rate = Number(data?.[0]?.currencies?.[0]?.rate);
      const quantity = Number(data?.[0]?.currencies?.[0]?.quantity) || 1;
      if (rate > 0) {
        gelPerUsd = rate / quantity;
        try { localStorage.setItem(USD_RATE_CACHE_KEY, JSON.stringify({ rate: gelPerUsd, ts: Date.now() })); } catch (_err) {  }
        if (currency === 'USD') applyCurrency(document.body);
      }
    } catch (_err) {  }
  }

  function gelToUsdText(match, amount) {
    const gel = Number(String(amount).replace(/[^\d]/g, ''));
    if (!Number.isFinite(gel)) return match;
    return `$${Math.round(gel / gelPerUsd).toLocaleString('en-US')}`;
  }

  function convertMoneyNode(node) {
    if (currency === 'USD') {
      const source = node.__gelText != null ? node.__gelText : node.nodeValue;
      if (!/₾/.test(source)) return;
      MONEY_RE.lastIndex = 0;
      if (!MONEY_RE.test(source)) return;
      MONEY_RE.lastIndex = 0;
      node.__gelText = source;
      node.nodeValue = source.replace(MONEY_RE, gelToUsdText);
    } else if (node.__gelText != null) {
      node.nodeValue = node.__gelText;
      delete node.__gelText;
    }
  }

  function applyCurrency(root) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || parent.closest('script, style')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(convertMoneyNode);
    syncCurrencyUI();
  }

  function syncCurrencyUI() {
    document.querySelectorAll('[data-currency]').forEach((btn) => {
      const active = btn.dataset.currency === currency;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  const currencySubs = [];
  function onCurrencyChange(cb) {
    if (typeof cb === 'function') currencySubs.push(cb);
  }

  function priceCurrencyToggle() {
    const target = currency === 'USD' ? '₾' : '$';
    return `<button type="button" class="cur-flip" data-currency-flip aria-label="ვალუტის შეცვლა" title="ვალუტის შეცვლა">${target}</button>`;
  }

  function syncFlipLabels() {
    const target = currency === 'USD' ? '₾' : '$';
    document.querySelectorAll('[data-currency-flip]').forEach((btn) => {
      btn.textContent = target;
    });
  }

  function setCurrency(next) {
    if (next !== 'GEL' && next !== 'USD') return;
    currency = next;
    try { localStorage.setItem(CURRENCY_KEY, next); } catch (_err) {  }
    currencySubs.forEach((cb) => { try { cb(currency, gelPerUsd); } catch (_err) {  } });
    applyCurrency(document.body);
    syncFlipLabels();
  }

  document.addEventListener('click', (event) => {
    const flip = event.target.closest('[data-currency-flip]');
    if (!flip) return;
    event.preventDefault();
    event.stopPropagation();
    setCurrency(currency === 'USD' ? 'GEL' : 'USD');
  });

  loadUsdRate();

  const NOTIFY_SEEN_KEY = 'autoswap.notifySeen';
  let notifyMatches = [];
  let dbNotifications = [];

  const notifySignedIn = () => Boolean(sbClient && authUser && !authUser.demo);

  function notifySeenIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem(NOTIFY_SEEN_KEY) || '[]'));
    } catch (_err) {
      return new Set();
    }
  }

  function notifyHref(n) {
    if (n.type === 'offer_received' || n.type === 'offer_countered') return '/account#received';
    if (n.type === 'offer_accepted' || n.type === 'offer_declined') return '/account#sent';
    if (n.type === 'message_received') return '/account#messages';
    if (n.related_vehicle_id) return `/vehicle?id=${encodeURIComponent(n.related_vehicle_id)}`;
    return '/account';
  }

  function paintNotifyBadge(count) {
    document.querySelectorAll('[data-notify-badge]').forEach((badge) => {
      badge.textContent = count ? String(count) : '';
      badge.hidden = !count;
    });
  }

  async function refreshNotifications() {
    if (notifySignedIn()) {
      const { data, error } = await sbClient
        .from('notifications')
        .select('id, type, title, body, related_vehicle_id, read_at, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      dbNotifications = error ? [] : (data || []);
      paintNotifyBadge(dbNotifications.filter((n) => !n.read_at).length);
      return;
    }
    dbNotifications = [];
    const myCar = getMyCar();
    if (!authUser || !myCar) {
      notifyMatches = [];
    } else {
      const feed = await fetchFeed().catch(() => null);
      notifyMatches = (feed || []).filter((car) => matchLevel(car, myCar)).slice(0, 8);
    }
    const seen = notifySeenIds();
    paintNotifyBadge(notifyMatches.filter((car) => !seen.has(String(car.id))).length);
  }

  async function markNotificationsRead() {
    if (!notifySignedIn()) return;
    if (!dbNotifications.some((n) => !n.read_at)) return;
    const now = new Date().toISOString();
    dbNotifications = dbNotifications.map((n) => (n.read_at ? n : { ...n, read_at: now }));
    await sbClient.from('notifications').update({ read_at: now }).is('read_at', null);
  }

  function renderNotifyPanel() {
    const body = document.querySelector('[data-notify-body]');
    if (!body) return;
    if (notifySignedIn()) {
      if (!dbNotifications.length) {
        body.innerHTML = '<p class="notify-empty">შეტყობინება ჯერ არ გაქვს. როცა ვინმეს შენი მანქანა მოუნდება ან შეთავაზება მოგივა, აქ გამოჩნდება.</p>';
        return;
      }
      body.innerHTML = dbNotifications.map((n) => `
        <a class="notify-item${n.read_at ? '' : ' is-unread'}" href="${notifyHref(n)}">
          <span class="notify-item-title">${escapeAttr(n.title || '')}</span>
          <span class="notify-item-meta">${escapeAttr(n.body || '')}</span>
          <span class="notify-item-time">${escapeAttr(freshnessLabel(n.created_at) || '')}</span>
        </a>
      `).join('');
      return;
    }
    const myCar = getMyCar();
    if (!myCar) {
      body.innerHTML = `
        <p class="notify-empty">მიუთითე შენი მანქანა და აქ გამოჩნდება, ვინ ეძებს მას.</p>
        <button class="btn btn-primary notify-cta" type="button" data-notify-addcar>${icons.car} მიუთითე მანქანა</button>
      `;
      return;
    }
    if (!notifyMatches.length) {
      body.innerHTML = `<p class="notify-empty">ჯერ არავინ ეძებს შენს ${escapeAttr(myCar.make)}-ს. შეტყობინება აქ გამოჩნდება, როგორც კი მატჩი იქნება.</p>`;
      return;
    }
    body.innerHTML = `
      ${notifyMatches.map((car) => `
        <a class="notify-item" href="/vehicle?id=${encodeURIComponent(car.id)}">
          <span class="notify-item-title">${escapeAttr(car.ownerName || 'მფლობელი')} ეძებს შენს ${escapeAttr(myCar.make)}-ს</span>
          <span class="notify-item-meta">სთავაზობს: ${escapeAttr(`${car.make} ${car.model}`)} · ${escapeAttr(car.city || '')}</span>
        </a>
      `).join('')}
      <a class="notify-all" href="/cars?onlyMatches=1">ყველა მატჩის ნახვა ${icons.arrowRight}</a>
    `;
  }

  function setNotifyOpen(open) {
    const panel = document.querySelector('[data-notify-panel]');
    const btn = document.querySelector('[data-notify-btn]');
    if (!panel || !btn) return;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (open) {
      renderNotifyPanel();
      if (notifySignedIn()) {
        markNotificationsRead();
      } else {
        try { localStorage.setItem(NOTIFY_SEEN_KEY, JSON.stringify(notifyMatches.map((car) => String(car.id)))); } catch (_err) {  }
      }
      document.querySelectorAll('[data-notify-badge]').forEach((badge) => { badge.hidden = true; });
    }
  }

  document.addEventListener('click', (event) => {
    const currencyBtn = event.target.closest('[data-currency]');
    if (currencyBtn) {
      setCurrency(currencyBtn.dataset.currency);
      return;
    }
    const bell = event.target.closest('[data-notify-btn]');
    if (bell) {
      const panel = document.querySelector('[data-notify-panel]');
      setNotifyOpen(panel ? panel.hidden : true);
      return;
    }
    if (event.target.closest('[data-notify-addcar]')) {
      setNotifyOpen(false);
      openMyCarModal();
      return;
    }
    if (!event.target.closest('.notify-wrap')) setNotifyOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setNotifyOpen(false);
  });

  document.addEventListener('autoswap:mycar', refreshNotifications);
  document.addEventListener('autoswap:auth', () => refreshNotifications());
  authReady.then(() => refreshNotifications());

  const ASELECT_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.5L19 7"></path></svg>';
  const aselect = { select: null, panel: null, activeIndex: -1 };

  function aselectClose() {
    aselect.panel?.remove();
    if (aselect.select) aselect.select.setAttribute('aria-expanded', 'false');
    aselect.panel = null;
    aselect.select = null;
    aselect.activeIndex = -1;
  }

  function aselectPosition() {
    const { select, panel } = aselect;
    if (!select || !panel) return;
    const rect = select.getBoundingClientRect();
    if (!rect.width) {
      aselectClose();
      return;
    }
    panel.style.left = `${Math.round(rect.left)}px`;
    panel.style.minWidth = `${Math.round(rect.width)}px`;
    const spaceBelow = window.innerHeight - rect.bottom - 16;
    if (spaceBelow < 200 && rect.top > window.innerHeight - rect.bottom) {
      panel.style.top = 'auto';
      panel.style.bottom = `${Math.round(window.innerHeight - rect.top + 6)}px`;
      panel.style.maxHeight = `${Math.min(300, Math.max(140, rect.top - 16))}px`;
    } else {
      panel.style.bottom = 'auto';
      panel.style.top = `${Math.round(rect.bottom + 6)}px`;
      panel.style.maxHeight = `${Math.min(300, Math.max(140, spaceBelow))}px`;
    }
  }

  function aselectRender() {
    const { select, panel, activeIndex } = aselect;
    if (!select || !panel) return;
    panel.innerHTML = Array.from(select.options).map((option, index) => {
      const selected = index === select.selectedIndex;
      const classes = `aselect-option${selected ? ' is-selected' : ''}${index === activeIndex ? ' is-active' : ''}`;
      return `<button type="button" class="${classes}" role="option" aria-selected="${selected}" data-index="${index}"${option.disabled ? ' disabled' : ''}>
        <span>${escapeAttr(option.textContent.trim()) || '&nbsp;'}</span>
        ${selected ? ASELECT_CHECK : ''}
      </button>`;
    }).join('');
    panel.querySelector('.aselect-option.is-active')?.scrollIntoView({ block: 'nearest' });
  }

  function aselectCommit(index) {
    const { select } = aselect;
    if (!select) return;
    const option = select.options[index];
    if (!option || option.disabled) return;
    if (select.selectedIndex !== index) {
      select.selectedIndex = index;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const focusTarget = select;
    aselectClose();
    focusTarget.focus({ preventScroll: true });
  }

  function aselectOpen(select) {
    if (aselect.select === select) return;
    aselectClose();
    if (select.disabled || !select.options.length) return;
    aselect.select = select;
    aselect.activeIndex = Math.max(0, select.selectedIndex);
    const panel = document.createElement('div');
    panel.className = 'aselect-panel';
    panel.setAttribute('role', 'listbox');
    aselect.panel = panel;
    document.body.appendChild(panel);
    select.setAttribute('aria-expanded', 'true');
    aselectPosition();
    aselectRender();
    panel.addEventListener('mousedown', (event) => {
      const optionBtn = event.target.closest('.aselect-option');
      if (!optionBtn) return;
      event.preventDefault();
      aselectCommit(Number(optionBtn.dataset.index));
    });
  }

  function aselectKeydown(event, select) {
    const { key } = event;
    const isOpen = aselect.select === select;
    if (!isOpen) {
      if (key === 'Enter' || key === ' ' || key === 'ArrowDown' || key === 'ArrowUp') {
        event.preventDefault();
        aselectOpen(select);
      }
      return;
    }
    const count = select.options.length;
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault();
      const delta = key === 'ArrowDown' ? 1 : -1;
      aselect.activeIndex = ((aselect.activeIndex + delta) % count + count) % count;
      aselectRender();
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault();
      aselect.activeIndex = key === 'Home' ? 0 : count - 1;
      aselectRender();
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      aselectCommit(aselect.activeIndex);
    } else if (key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      aselectClose();
    } else if (key === 'Tab') {
      aselectClose();
    }
  }

  function enhanceSelects(root = document) {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    root.querySelectorAll('select:not([data-native]):not([data-aselect])').forEach((select) => {
      select.dataset.aselect = '1';
      select.setAttribute('role', 'combobox');
      select.setAttribute('aria-expanded', 'false');
      select.addEventListener('mousedown', (event) => {
        event.preventDefault();
        select.focus({ preventScroll: true });
        if (aselect.select === select) aselectClose();
        else aselectOpen(select);
      });
      select.addEventListener('keydown', (event) => aselectKeydown(event, select));
      select.addEventListener('blur', aselectClose);
    });
  }

  window.addEventListener('resize', aselectClose);
  window.addEventListener('scroll', () => aselectPosition(), true);
  document.addEventListener('pointerdown', (event) => {
    if (!aselect.select) return;
    if (event.target === aselect.select || aselect.panel?.contains(event.target)) return;
    aselectClose();
  });

  enhanceSelects();
  let domSyncQueued = false;
  const domObserver = new MutationObserver(() => {
    if (domSyncQueued) return;
    domSyncQueued = true;
    requestAnimationFrame(() => {
      domSyncQueued = false;
      enhanceSelects();
      if (currency === 'USD') applyCurrency(document.body);
      else syncCurrencyUI();
      const badge = document.querySelector('[data-notify-badge]');
      if (badge && !badge.dataset.ready) {
        badge.dataset.ready = '1';
        refreshNotifications();
      }
    });
  });
  domObserver.observe(document.body, { childList: true, subtree: true });

  const MM_FEATURED = ['BMW', 'Mercedes-Benz', 'Audi', 'Toyota', 'Porsche'];

  function stripMakePrefix(make, model) {
    const m = String(model || '').trim();
    const mk = String(make || '').trim();
    if (!m || !mk) return m;
    const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const nmk = norm(mk);
    const nm = norm(m);
    if (!nmk || !nm.startsWith(nmk)) return m;
    if (nm === nmk) return '';
    let consumed = 0;
    let i = 0;
    while (i < m.length && consumed < nmk.length) {
      if (/[a-z0-9]/i.test(m[i])) consumed += 1;
      i += 1;
    }
    return m.slice(i).replace(/^[\s\-–]+/, '').trim();
  }

  function modelFamily(make, model) {
    const m = String(model || '').trim();
    const mk = String(make || '').toLowerCase();
    if (!m) return '';
    if (mk === 'bmw') {
      if (/^i/i.test(m)) return 'i Series';
      if (/^xm$/i.test(m) || /^m\s*\d/i.test(m)) return 'M Series';
      if (/^x\s*\d/i.test(m)) return 'X Series';
      if (/^z\s*\d/i.test(m)) return 'Z Series';
      const digit = m.match(/^(\d)\d{2}/);
      return digit ? `${digit[1]} Series` : '';
    }
    if (mk.startsWith('mercedes')) {
      if (/^amg/i.test(m)) return 'AMG';
      const eq = m.match(/^(EQ[A-Z])/i);
      if (eq) return eq[1].toUpperCase();
    }
    const letters = m.match(/^([A-Za-z]{1,3})[\s-]*\d/);
    if (letters) {
      const tag = letters[1].toUpperCase();
      return (mk.startsWith('mercedes') && tag.length === 1) ? `${tag}-Class` : tag;
    }
    if (/^\d/.test(m) && mk.startsWith('mercedes')) return 'კლასიკური';
    return '';
  }

  function compareFamilies(a, b) {
    if (a === b) return 0;
    if (a === 'კლასიკური') return 1;
    if (b === 'კლასიკური') return -1;
    const na = a.match(/^(\d+)/);
    const nb = b.match(/^(\d+)/);
    if (na && nb) return Number(na[1]) - Number(nb[1]);
    if (na) return -1;
    if (nb) return 1;
    return a.localeCompare(b);
  }

  const MM_GROUP_MIN_MODELS = 12;
  const MM_GROUP_MIN_COVERAGE = 0.6;

  function groupModels(make, models) {
    if (models.length < MM_GROUP_MIN_MODELS) return null;
    const map = new Map();
    const rest = [];
    models.forEach((m) => {
      const family = modelFamily(make, m.cleanName);
      if (!family) { rest.push(m); return; }
      if (!map.has(family)) map.set(family, []);
      map.get(family).push(m);
    });
    const grouped = models.length - rest.length;
    if (map.size < 2 || grouped / models.length < MM_GROUP_MIN_COVERAGE) return null;
    return {
      groups: Array.from(map.entries()).sort((a, b) => compareFamilies(a[0], b[0])),
      rest,
    };
  }

  function mmPanelHTML() {
    return `
      <div class="brand-picker-panel" data-mm-panel hidden>
        <div class="brand-picker-search" data-mm-search-row hidden>
          <span>${icons.search}</span>
          <input type="search" data-mm-search placeholder="ძებნა" autocomplete="off" aria-label="ძებნა">
        </div>
        <div class="brand-picker-list" role="listbox"></div>
      </div>`;
  }

  function pickerYears() {
    const now = new Date().getFullYear();
    const years = [];
    for (let y = now; y >= 1990; y -= 1) years.push(y);
    return years;
  }

  function bindMakeModelPicker(picker, { onSelect, years: withYears } = {}) {
    const input = picker.querySelector('[data-mm-input]');
    const panel = picker.querySelector('[data-mm-panel]');
    const list = panel && panel.querySelector('.brand-picker-list');
    const searchRow = picker.querySelector('[data-mm-search-row]');
    const search = picker.querySelector('[data-mm-search]');
    if (!input || !panel || !list) return;

    const touch = typeof window.matchMedia === 'function'
      && window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (touch && search && searchRow) {
      input.readOnly = true;
      searchRow.hidden = false;
    }

    let stage = 'make';
    let curMake = null;
    let curModel = '';
    let seq = 0;
    let timer = null;
    let makesCache = null;

    const setOpen = (open) => {
      panel.hidden = !open;
      picker.classList.toggle('is-open', open);
      input.setAttribute('aria-expanded', String(open));
    };

    const term = () => {
      if (touch && search) return search.value.trim();
      const raw = input.value.trim();
      if (stage === 'model' && curMake && raw.toLowerCase().startsWith(curMake.name.toLowerCase())) {
        return raw.slice(curMake.name.length).trim();
      }
      return raw;
    };

    const row = (label, attrs) => `
      <button type="button" class="brand-picker-option is-textonly" role="option" ${attrs}>
        <span class="brand-picker-name">${escapeAttr(label)}</span>
      </button>`;

    const tiles = () => `
      <div class="brand-featured" role="group" aria-label="პოპულარული მარკები">
        ${MM_FEATURED.map((name) => `
          <button class="brand-featured-tile" type="button" data-mm-make="${escapeAttr(name)}" title="${escapeAttr(name)}" aria-label="${escapeAttr(name)}">
            <img class="brand-logo-img" src="${escapeAttr(getLogoUrl(name))}" alt="" loading="lazy" width="34" height="34">
          </button>`).join('')}
      </div>`;

    const loadMakes = () => {
      if (!makesCache) makesCache = searchMakes('', 500).catch(() => []);
      return makesCache;
    };

    const render = async () => {
      const stamp = ++seq;
      const q = term().toLowerCase();
      let html = '';
      if (stage === 'year') {
        const chosen = `${curMake.name}${curModel ? ` ${curModel}` : ''}`;
        list.innerHTML = row(`← ${chosen}`, 'data-mm-back="1"')
          + row('ნებისმიერი წელი', 'data-mm-year=""')
          + pickerYears().map((y) => row(`${chosen} ${y}`, `data-mm-year="${y}"`)).join('');
        return;
      }
      if (stage === 'make') {
        const makes = await loadMakes();
        if (stamp !== seq) return;
        const rows = (q ? makes.filter((m) => m.name.toLowerCase().includes(q)) : makes).slice(0, 300);
        html = (q ? '' : tiles())
          + rows.map((m) => row(m.name, `data-mm-make="${escapeAttr(m.name)}" data-mm-make-id="${escapeAttr(m.id ?? '')}"`)).join('');
      } else {
        const raw = curMake.id ? await searchModels(term(), curMake.id, 300).catch(() => []) : [];
        if (stamp !== seq) return;
        const models = raw
          .map((m) => ({ ...m, cleanName: stripMakePrefix(curMake.name, m.name) }))
          .filter((m) => m.cleanName);
        const modelRow = (m) => row(
          `${curMake.name} ${m.cleanName}`,
          `data-mm-model="${escapeAttr(m.cleanName)}"`,
        );
        const grouped = groupModels(curMake.name, models);
        const body = grouped
          ? grouped.groups.map(([family, items]) => `
              <div class="brand-picker-group" role="presentation">${escapeAttr(family)}</div>
              ${items.map(modelRow).join('')}`).join('')
            + (grouped.rest.length
              ? `<div class="brand-picker-group" role="presentation">სხვა</div>${grouped.rest.map(modelRow).join('')}`
              : '')
          : models.map(modelRow).join('');
        html = row(`← ${curMake.name}`, 'data-mm-back="1"')
          + row(curMake.name, 'data-mm-any="1"')
          + body;
      }
      list.innerHTML = html || '<div class="brand-picker-empty">ვერ მოიძებნა</div>';
    };

    const scheduleRender = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(render, 140);
    };

    const reset = () => {
      stage = 'make';
      curMake = null;
      curModel = '';
      if (search) search.value = '';
    };

    const enterYearStage = (model) => {
      stage = 'year';
      curModel = model || '';
      if (search) search.value = '';
      render();
    };

    const finish = (make, model, year) => {
      const previous = input.value;
      const label = [make, model || '', year || ''].filter(Boolean).join(' ');
      input.value = label;
      setOpen(false);
      reset();
      if (onSelect) {
        onSelect({ make, model: model || '', year: year || '', label }, { input, previous });
      }
    };

    const enterModelStage = async (name, id) => {
      let makeId = id;
      if (!makeId) {
        const makes = await loadMakes();
        const hit = makes.find((m) => m.name.toLowerCase() === name.toLowerCase());
        makeId = hit ? hit.id : '';
      }
      if (!makeId) {
        finish(name, '');
        return;
      }
      stage = 'model';
      curMake = { id: makeId, name };
      if (search) search.value = '';
      if (!touch) input.value = `${name} `;
      render();
    };

    input.addEventListener('focus', () => {
      setOpen(true);
      render();
    });

    input.addEventListener('input', () => {
      setOpen(true);
      if (stage === 'model' && curMake
        && !input.value.trim().toLowerCase().startsWith(curMake.name.toLowerCase())) {
        reset();
      }
      scheduleRender();
    });

    search?.addEventListener('input', scheduleRender);

    const onEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    input.addEventListener('keydown', onEscape);
    search?.addEventListener('keydown', onEscape);

    list.addEventListener('mousedown', (event) => {
      const back = event.target.closest('[data-mm-back]');
      if (back) {
        event.preventDefault();
        if (stage === 'year') {
          stage = 'model';
          curModel = '';
          if (search) search.value = '';
        } else {
          reset();
        }
        render();
        return;
      }
      const any = event.target.closest('[data-mm-any]');
      if (any) {
        event.preventDefault();
        finish(curMake.name, '');
        return;
      }
      const makeEl = event.target.closest('[data-mm-make]');
      if (makeEl) {
        event.preventDefault();
        enterModelStage(makeEl.dataset.mmMake, makeEl.dataset.mmMakeId || '');
        return;
      }
      const yearEl = event.target.closest('[data-mm-year]');
      if (yearEl) {
        event.preventDefault();
        finish(curMake.name, curModel, yearEl.dataset.mmYear);
        return;
      }
      const modelEl = event.target.closest('[data-mm-model]');
      if (modelEl) {
        event.preventDefault();
        if (withYears) enterYearStage(modelEl.dataset.mmModel);
        else finish(curMake.name, modelEl.dataset.mmModel);
      }
    });

    document.addEventListener('pointerdown', (event) => {
      if (!picker.contains(event.target)) setOpen(false);
    });
  }

  window.AutoSwap = {
    assets,
    icons,
    sb: sbClient,
    isUuid,
    toast,
    cacheGet,
    cacheSet,
    cacheBust,
    bustListingCaches,
    authReady,
    getAuthUser,
    onAuth,
    signInWithProvider,
    signInWithPassword,
    setPassword,
    hasPassword,
    passwordProblem,
    passwordFieldHTML,
    usernameFieldHTML,
    bindPasswordFields,
    verifyCurrentPassword,
    isShadowEmail,
    shadowEmailForPhone,
    normalizePhone,
    requestPhoneOtp: requestOtp,
    confirmPhoneOtp: confirmOtp,
    AUTH_DEMO_CODE: DEMO_OTP_CODE,
    channelPickerHTML,
    bindChannelPicker,
    signOut,
    escapeAttr,
    buildModal,
    openLoginGateModal,
    FUEL_LABELS,
    TRANSMISSION_LABELS,
    CATEGORY_LABELS,
    labelFor,
    fuelLabel,
    getLogoUrl,
    autofillOtpFromSms,
    formatCash,
    fallbackImageFor,
    georgianError,
    placeComboList,
    repositionComboLists,
    mmPanelHTML,
    bindMakeModelPicker,
    refreshNotifications,
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
    getCurrency: () => currency,
    getUsdRate: () => gelPerUsd,
    setCurrency,
    onCurrencyChange,
    priceCurrencyToggle,
  };
})();
