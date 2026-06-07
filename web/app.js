const DEMO_LISTINGS = [
  {
    id: 'demo-range-rover',
    ownerId: 'demo-owner-1',
    make: 'Range Rover',
    model: 'Sport',
    year: 2020,
    engine: '3.0L',
    mileage: '60 000 კმ',
    mileageShort: '60,000 კმ',
    city: 'თბილისი',
    owner: 'გიორგი დემო',
    badge: 'Premium',
    specs: ['დიზელი', 'ავტომატიკა', 'შავი'],
    wants: 'BMW X5, Mercedes GLE',
    money: 'თანხის გარეშე',
    tone: '',
    description: 'მოვლილი Range Rover Sport, სრული კომპლექტაცია. განვიხილავ BMW X5-ში ან Mercedes GLE-ში გაცვლას.',
    image: 'assets/swap-card-1.webp',
  },
  {
    id: 'demo-e-class',
    ownerId: 'demo-owner-2',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    year: 2019,
    engine: '2.0L',
    mileage: '70 000 კმ',
    mileageShort: '70,000 კმ',
    city: 'თბილისი',
    owner: 'ნინო ლომიძე',
    badge: 'Premium',
    specs: ['ბენზინი', 'ავტომატიკა', 'ვერცხლისფერი'],
    wants: 'BMW 5 Series, Audi A6',
    money: '+ 2 500 GEL',
    tone: 'warning',
    description: 'Mercedes-Benz E-Class, წესრიგში. გაცვლა მინდა BMW 5 Series-ში ან Audi A6-ში.',
    image: 'assets/swap-card-2.webp',
  },
  {
    id: 'demo-lexus-ux',
    ownerId: 'demo-owner-3',
    make: 'Lexus',
    model: 'UX 300H',
    year: 2021,
    engine: '2.0L',
    mileage: '35 000 კმ',
    mileageShort: '35,000 კმ',
    city: 'ბათუმი',
    owner: 'ლაშა კობახიძე',
    badge: 'Premium',
    specs: ['ჰიბრიდი', 'ავტომატიკა', 'თეთრი'],
    wants: 'Toyota RAV4, Audi Q3',
    money: 'თანხის გარეშე',
    tone: '',
    description: 'Lexus UX 300H ჰიბრიდი, მცირე გარბენით. განვიხილავ კომპაქტურ ჯიპში გაცვლას.',
    image: 'assets/swap-card-3.webp',
  },
  {
    id: 'demo-touareg',
    ownerId: 'demo-owner-4',
    make: 'Volkswagen',
    model: 'Touareg',
    year: 2018,
    engine: '3.0L',
    mileage: '95 000 კმ',
    mileageShort: '95,000 კმ',
    city: 'თბილისი',
    owner: 'თამარ მაისურაძე',
    badge: 'Premium',
    specs: ['დიზელი', 'ავტომატიკა', 'რუხი'],
    wants: 'Audi Q7, BMW X5',
    money: '+ 4 000 GEL',
    tone: 'success',
    description: 'Volkswagen Touareg, ოჯახური ჯიპი. განვიხილავ Audi Q7-ში ან BMW X5-ში გაცვლას.',
    image: 'assets/swap-card-4.webp',
  },
  {
    id: 'demo-bmw-530i',
    ownerId: 'demo-owner-5',
    make: 'BMW',
    model: '530i',
    year: 2019,
    engine: '2.0L',
    mileage: '90 000 კმ',
    mileageShort: '90,000 კმ',
    city: 'თბილისი',
    owner: 'ზურა ბერიძე',
    badge: 'Premium',
    specs: ['ბენზინი', 'ავტომატიკა', 'შავი'],
    wants: 'Audi A6, Mercedes E-Class',
    money: '+ 2 000 GEL',
    tone: 'success',
    description: 'BMW 530i M-Sport, შავი ფერი. განვიხილავ Audi A6-ში ან Mercedes E-Class-ში გაცვლას.',
    image: 'assets/swap-card-1.webp',
  },
  {
    id: 'demo-audi-a6',
    ownerId: 'demo-owner-6',
    make: 'Audi',
    model: 'A6',
    year: 2021,
    engine: '2.0L',
    mileage: '56 000 კმ',
    mileageShort: '56,000 კმ',
    city: 'თბილისი',
    owner: 'მარიამ ჩხეიძე',
    badge: 'Premium',
    specs: ['ბენზინი', 'ავტომატიკა', 'ვერცხლისფერი'],
    wants: 'BMW 5 Series, Lexus ES',
    money: 'თანხის გარეშე',
    tone: '',
    description: 'Audi A6, მცირე გარბენი, სუფთა სალონი. გაცვლა მინდა BMW 5 Series-ში ან Lexus ES-ში.',
    image: 'assets/swap-card-2.webp',
  },
];

const SESSION_KEY = 'autoswap_session';
const PROTECTED_VIEWS = ['offers', 'messages', 'create'];
const VALID_VIEWS = ['landing', 'feed', 'detail', 'offers', 'messages', 'create', 'auth'];

const feed = document.querySelector('#listing-feed');
const featured = document.querySelector('#featured-listings');
const similar = document.querySelector('#similar-listings');
const detailContent = document.querySelector('#detail-content');
const offerDialog = document.querySelector('#offer-dialog');
const filterDialog = document.querySelector('#filter-dialog');
const offerCarName = document.querySelector('#offer-car-name');
const offersList = document.querySelector('#offers-list');
const chatList = document.querySelector('.chat-list');
const chatTitle = document.querySelector('#chat-title');
const messageThread = document.querySelector('#message-thread');
const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');
const createForm = document.querySelector('#create-form');
const offerForm = document.querySelector('#offer-form');
const offerVehicleSelect = document.querySelector('#offer-vehicle-select');

const supabaseUrl = (window.AUTO_SWAP_SUPABASE_URL || '').trim();
const supabaseAnonKey = (window.AUTO_SWAP_SUPABASE_ANON_KEY || '').trim();
const backend = window.supabase && supabaseUrl && supabaseAnonKey
  ? window.supabase.createClient(supabaseUrl, supabaseAnonKey)
  : null;

let listings = [...DEMO_LISTINGS];
let session = null;
let pendingView = null;
let authMode = 'login';
let selectedOfferIndex = null;
let myVehicles = [];
let offers = [];
let conversations = [];
let activeConversationId = null;
let messageChannel = null;

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en').format(Number(value || 0));
}

function moneyClass(car) {
  return car.tone ? ` ${car.tone}` : '';
}

function chips(car) {
  return car.specs.map((item) => `<span class="meta-chip">${escapeHtml(item)}</span>`).join('');
}

function imageForVehicle(vehicle) {
  const make = encodeURIComponent(vehicle.make || 'car');
  const model = encodeURIComponent(vehicle.model || vehicle.modelFamily || '');
  return `https://cdn.imagin.studio/getImage?customer=hrjavascript-mastery&make=${make}&modelFamily=${model}&zoomType=fullscreen&angle=23`;
}

function firstPhoto(vehicle) {
  const photos = [...(vehicle.vehicle_photos || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
  return photos[0]?.url || imageForVehicle(vehicle);
}

function fuelLabel(value) {
  return {
    petrol: 'ბენზინი',
    diesel: 'დიზელი',
    hybrid: 'ჰიბრიდი',
    electric: 'Electric',
    lpg: 'LPG',
  }[value] || value || 'საწვავი უცნობია';
}

function transmissionLabel(value) {
  return {
    automatic: 'ავტომატიკა',
    manual: 'მექანიკა',
    semi_automatic: 'ნახევრად ავტომატიკა',
    cvt: 'CVT',
  }[value] || value || 'კოლოფი უცნობია';
}

function vehicleMoneyText(value) {
  const amount = Number(value || 0);
  if (amount > 0) return `+ ${formatNumber(amount)} GEL`;
  if (amount < 0) return `დავამატებ ${formatNumber(Math.abs(amount))} GEL`;
  return 'თანხის გარეშე';
}

function offerMoneyText(value) {
  const amount = Number(value || 0);
  if (amount > 0) return `გამგზავნი ამატებს ${formatNumber(amount)} GEL`;
  if (amount < 0) return `გამგზავნი ითხოვს ${formatNumber(Math.abs(amount))} GEL`;
  return 'თანხის გარეშე';
}

function cashTone(value) {
  const amount = Number(value || 0);
  if (amount > 0) return 'warning';
  if (amount < 0) return 'success';
  return '';
}

function desiredLabel(vehicle) {
  const desire = vehicle.desired_vehicles?.[0];
  if (!desire) return 'ნებისმიერი შესაბამისი გაცვლა';
  const makeModel = [desire.desired_make, desire.desired_model].filter(Boolean).join(' ');
  return makeModel || desire.desired_category || 'ნებისმიერი შესაბამისი გაცვლა';
}

function mapVehicle(row) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    make: row.make,
    model: row.model,
    year: row.year,
    engine: row.engine_size || '',
    mileage: `${formatNumber(row.mileage)} კმ`,
    mileageShort: `${formatNumber(row.mileage)} კმ`,
    city: row.location || 'ქალაქი უცნობია',
    owner: row.profiles?.display_name || 'AutoSwap user',
    badge: row.listing_type === 'sell' ? 'Sell' : 'Swap',
    specs: [fuelLabel(row.fuel_type), transmissionLabel(row.transmission), row.location].filter(Boolean),
    wants: desiredLabel(row),
    money: vehicleMoneyText(row.cash_adjustment),
    tone: cashTone(row.cash_adjustment),
    description: row.description || 'აღწერა ჯერ არ არის დამატებული.',
    image: firstPhoto(row),
    raw: row,
  };
}

function previewCard(car) {
  return `
    <article class="preview-card">
      <img src="${escapeHtml(car.image)}" alt="${escapeHtml(`${car.make} ${car.model}`)}">
      <div>
        <h3>${escapeHtml(car.make)} ${escapeHtml(car.model)}</h3>
        <p>${escapeHtml(car.year)}, ${escapeHtml(car.city)}</p>
        <span class="money-chip${moneyClass(car)}">${escapeHtml(car.money)}</span>
      </div>
    </article>
  `;
}

function featuredCard(car, index) {
  const meta = `${car.year} · ${car.mileageShort || car.mileage}`;
  const moneyTone = car.tone ? ` ${car.tone}` : '';
  return `
    <article class="swap-card">
      <div class="swap-card-media">
        <span class="swap-card-money money-chip${moneyTone}">${escapeHtml(car.money)}</span>
        <img src="${escapeHtml(car.image)}" alt="${escapeHtml(`${car.make} ${car.model}`)}" loading="lazy">
      </div>
      <div class="swap-card-body">
        <div class="swap-card-head">
          <h3>${escapeHtml(car.make)} ${escapeHtml(car.model)}</h3>
          <p class="swap-card-meta">${escapeHtml(meta)}</p>
        </div>
        <p class="swap-card-city">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          ${escapeHtml(car.city)}
        </p>
        <p class="swap-card-wants"><span class="swap-card-wants-label">ეძებს</span><span class="swap-card-wants-value">${escapeHtml(car.wants)}</span></p>
        <button class="swap-card-btn primary" type="button" data-offer="${index}">შესთავაზე შენი მანქანა</button>
      </div>
    </article>
  `;
}

function listingCard(car, index) {
  return `
    <article class="listing-card">
      <img src="${escapeHtml(car.image)}" alt="${escapeHtml(`${car.make} ${car.model}`)}">
      <div class="listing-body">
        <h2>${escapeHtml(car.make)} ${escapeHtml(car.model)}</h2>
        <p class="listing-meta">${escapeHtml(car.year)}, ${escapeHtml(car.mileage)}</p>
        <p class="owner-line">${escapeHtml(car.owner)}, ${escapeHtml(car.city)}</p>
        <div class="chip-row">${chips(car)}</div>
        <p class="listing-wants"><span>ეძებს</span>${escapeHtml(car.wants)}</p>
        <span class="money-chip${moneyClass(car)}">${escapeHtml(car.money)}</span>
        <div class="listing-actions">
          <button type="button" data-detail="${index}">ვრცლად</button>
          <button class="primary" type="button" data-offer="${index}">შეთავაზების გაგზავნა</button>
        </div>
      </div>
    </article>
  `;
}

function renderListings() {
  if (feed) feed.innerHTML = listings.map(listingCard).join('');
  if (featured) featured.innerHTML = listings.slice(0, 4).map(featuredCard).join('');
  if (similar) similar.innerHTML = listings.slice(1, 4).map(previewCard).join('');

  const resultToolbar = document.querySelector('.result-toolbar strong');
  if (resultToolbar) resultToolbar.textContent = `${listings.length} აქტიური განცხადება`;

  const heroCount = document.querySelector('#hero-active-count');
  if (heroCount) heroCount.textContent = String(listings.length);
}

function renderDetail(index) {
  if (!detailContent || !listings.length) return;
  const car = listings[index] || listings[0];
  detailContent.innerHTML = `
    <article class="detail-main">
      <div class="detail-gallery">
        <img src="${escapeHtml(car.image)}" alt="${escapeHtml(`${car.make} ${car.model}`)}">
        <img src="${escapeHtml(listings[(index + 1) % listings.length]?.image || car.image)}" alt="მსგავსი მანქანა">
        <img src="${escapeHtml(listings[(index + 2) % listings.length]?.image || car.image)}" alt="მსგავსი მანქანა">
      </div>
      <div class="detail-title-row">
        <div>
          <h1 id="detail-title">${escapeHtml(car.make)} ${escapeHtml(car.model)}</h1>
          <p class="listing-meta">${escapeHtml(car.year)}, ${escapeHtml(car.mileage)}, ${escapeHtml(car.city)}</p>
        </div>
        <span class="money-chip${moneyClass(car)}">${escapeHtml(car.money)}</span>
      </div>
      <p class="detail-description">${escapeHtml(car.description)}</p>
      <div class="spec-table">
        <div><span>საწვავი</span><strong>${escapeHtml(car.specs[0] || '-')}</strong></div>
        <div><span>კოლოფი</span><strong>${escapeHtml(car.specs[1] || '-')}</strong></div>
        <div><span>ქალაქი</span><strong>${escapeHtml(car.city)}</strong></div>
        <div><span>გარბენი</span><strong>${escapeHtml(car.mileage)}</strong></div>
      </div>
    </article>
    <aside class="detail-side">
      <section>
        <h2>მფლობელი</h2>
        <p>${escapeHtml(car.owner)}, ${escapeHtml(car.city)}</p>
      </section>
      <section>
        <h2>სასურველი მანქანები</h2>
        <p>${escapeHtml(car.wants)}</p>
      </section>
      <section>
        <h2>თანხის პირობა</h2>
        <p>${escapeHtml(car.money)}</p>
      </section>
      <section>
        <button class="primary-action" type="button" data-offer="${index}">შეთავაზების გაგზავნა</button>
      </section>
    </aside>
  `;
}

function scrollSwaps(direction) {
  if (!featured) return;
  const card = featured.querySelector('.swap-card');
  const step = card ? card.offsetWidth + 16 : 280;
  featured.scrollBy({ left: direction * step, behavior: 'smooth' });
}

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch (error) {
    console.warn('Session parse failed, clearing.', error);
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function userFromSupabase(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.user_metadata?.display_name || user.user_metadata?.name || user.email?.split('@')[0] || user.phone || 'AutoSwap user',
    email: user.email || user.phone || '',
  };
}

function isAuthed() {
  return Boolean(session && (session.id || session.email));
}

function initials(value) {
  const source = (value || '').trim();
  return source ? source[0].toUpperCase() : 'A';
}

function setText(selector, value) {
  const node = document.querySelector(selector);
  if (node) node.textContent = value;
}

function updateAuthUI() {
  document.body.dataset.auth = isAuthed() ? 'in' : 'out';
  const name = isAuthed() ? session.name || session.email : '';
  const avatar = initials(isAuthed() ? session.name || session.email : 'A');

  setText('#header-name', isAuthed() ? name : 'პროფილი');
  setText('#header-avatar', avatar);
  setText('#profile-name', name || 'მომხმარებელი');
  setText('#profile-email', isAuthed() ? session.email : '');
  setText('#profile-avatar', avatar);
}

function setAuthMode(mode) {
  authMode = mode;
  const box = document.querySelector('.auth-box');
  if (box) box.dataset.mode = mode;

  const isRegister = mode === 'register';
  setText('#auth-title', isRegister ? 'რეგისტრაცია' : 'შესვლა');
  setText('#auth-submit', isRegister ? 'ანგარიშის შექმნა' : 'შესვლა');
  setText('#auth-switch-text', isRegister ? 'უკვე გაქვს ანგარიში?' : 'არ გაქვს ანგარიში?');
  setText('#auth-toggle', isRegister ? 'შესვლა' : 'რეგისტრაცია');
  hideAuthAlert();
}

function showAuthAlert(message) {
  const alertNode = document.querySelector('#auth-alert');
  if (!alertNode) return;
  alertNode.textContent = message;
  alertNode.hidden = false;
}

function hideAuthAlert() {
  const alertNode = document.querySelector('#auth-alert');
  if (alertNode) alertNode.hidden = true;
}

function requireAuth(targetView) {
  pendingView = targetView;
  setAuthMode('login');
  showAuthAlert('ამ გვერდის სანახავად გაიარე ავტორიზაცია.');
  showView('auth', true);
}

async function ensureProfile() {
  if (!backend || !session?.id) return;
  await backend.from('profiles').upsert(
    {
      id: session.id,
      display_name: session.name || session.email?.split('@')[0] || 'AutoSwap user',
      phone: null,
      avatar_url: null,
    },
    { onConflict: 'id' },
  );
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const name = (document.querySelector('#auth-name')?.value || '').trim();
  const email = (document.querySelector('#auth-email')?.value || '').trim();
  const password = document.querySelector('#auth-password')?.value || '';

  if (!email || !email.includes('@')) {
    showAuthAlert('შეიყვანე სწორი ელფოსტა.');
    return;
  }
  if (password.length < 6) {
    showAuthAlert('პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო.');
    return;
  }
  if (authMode === 'register' && !name) {
    showAuthAlert('შეიყვანე სახელი.');
    return;
  }

  hideAuthAlert();

  if (backend) {
    const result = authMode === 'register'
      ? await backend.auth.signUp({
          email,
          password,
          options: { data: { display_name: name || email.split('@')[0] } },
        })
      : await backend.auth.signInWithPassword({ email, password });

    if (result.error) {
      showAuthAlert(result.error.message);
      return;
    }

    const user = result.data.user || (await backend.auth.getUser()).data.user;
    session = userFromSupabase(user);
    await ensureProfile();
  } else {
    session = { name: name || email.split('@')[0], email };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  updateAuthUI();
  await loadMyVehicles();

  const next = pendingView && pendingView !== 'auth' ? pendingView : 'feed';
  pendingView = null;
  showView(next);
}

async function logout() {
  if (backend) {
    await backend.auth.signOut();
  }
  session = null;
  localStorage.removeItem(SESSION_KEY);
  updateAuthUI();
  showView('landing');
}

async function initAuth() {
  if (backend) {
    const { data } = await backend.auth.getSession();
    session = userFromSupabase(data.session?.user);
    backend.auth.onAuthStateChange(async (_event, authSession) => {
      session = userFromSupabase(authSession?.user);
      updateAuthUI();
      if (isAuthed()) {
        await ensureProfile();
        await loadMyVehicles();
      }
    });
  } else {
    session = readSession();
  }
  updateAuthUI();
}

async function loadListings() {
  if (!backend) {
    listings = [...DEMO_LISTINGS];
    renderListings();
    renderDetail(0);
    return;
  }

  const { data, error } = await backend
    .from('vehicles')
    .select(`
      *,
      profiles:owner_id(id, display_name, phone, avatar_url),
      vehicle_photos(id, url, position),
      desired_vehicles(id, desired_make, desired_model, desired_category)
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('Supabase feed failed, showing demo listings.', error);
    listings = [...DEMO_LISTINGS];
  } else {
    listings = (data || []).map(mapVehicle);
  }

  renderListings();
  renderDetail(0);
}

async function loadMyVehicles() {
  if (!backend || !session?.id) {
    myVehicles = [];
    return;
  }

  const { data, error } = await backend
    .from('vehicles')
    .select('id, owner_id, make, model, year, mileage, fuel_type, transmission, location, description, listing_type, cash_adjustment, status')
    .eq('owner_id', session.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  myVehicles = error ? [] : (data || []);
}

function cashAdjustmentFrom(direction, amountValue, mode) {
  const amount = Math.max(0, Math.round(Number(amountValue || 0)));
  if (mode === 'offer') {
    if (direction === 'sender_adds') return amount;
    if (direction === 'sender_wants') return -amount;
    return 0;
  }
  if (direction === 'owner_wants') return amount;
  if (direction === 'owner_adds') return -amount;
  return 0;
}

function parseDesired(value) {
  const first = String(value || '').split(',')[0].trim();
  if (!first) {
    return null;
  }
  const parts = first.split(/\s+/);
  return {
    desired_make: parts.length > 1 ? parts[0] : null,
    desired_model: parts.length > 1 ? parts.slice(1).join(' ') : null,
    desired_category: first,
  };
}

async function handleCreateSubmit(event) {
  event.preventDefault();
  if (!isAuthed()) {
    requireAuth('create');
    return;
  }

  const submit = createForm.querySelector('[type="submit"]');
  submit.disabled = true;
  const formData = new FormData(createForm);

  try {
    const make = String(formData.get('make') || '').trim();
    const model = String(formData.get('model') || '').trim();
    const year = Number(formData.get('year'));
    const mileage = Number(formData.get('mileage'));

    if (!make || !model || !year || !Number.isFinite(mileage)) {
      window.alert('შეავსე აუცილებელი ველები.');
      return;
    }

    if (!backend) {
      const photo = formData.getAll('photos').find((file) => file instanceof File && file.size > 0);
      listings.unshift({
        id: `local-${Date.now()}`,
        ownerId: 'local-owner',
        make,
        model,
        year,
        mileage: `${formatNumber(mileage)} კმ`,
        mileageShort: `${formatNumber(mileage)} კმ`,
        city: String(formData.get('location') || 'თბილისი'),
        owner: session.name || session.email,
        badge: 'Swap',
        specs: [fuelLabel(formData.get('fuel_type')), transmissionLabel(formData.get('transmission'))],
        wants: String(formData.get('desired') || 'ნებისმიერი შესაბამისი გაცვლა'),
        money: vehicleMoneyText(cashAdjustmentFrom(formData.get('cash_direction'), formData.get('cash_amount'))),
        tone: cashTone(cashAdjustmentFrom(formData.get('cash_direction'), formData.get('cash_amount'))),
        description: String(formData.get('description') || ''),
        image: photo ? URL.createObjectURL(photo) : imageForVehicle({ make, model }),
      });
      renderListings();
      renderDetail(0);
      createForm.reset();
      showView('detail');
      return;
    }

    await ensureProfile();

    const { data: vehicle, error: vehicleError } = await backend
      .from('vehicles')
      .insert({
        owner_id: session.id,
        make,
        model,
        year,
        mileage,
        fuel_type: formData.get('fuel_type') || null,
        transmission: formData.get('transmission') || null,
        location: formData.get('location') || null,
        description: String(formData.get('description') || '').trim() || null,
        listing_type: 'swap',
        cash_adjustment: cashAdjustmentFrom(formData.get('cash_direction'), formData.get('cash_amount')),
        status: 'active',
      })
      .select('id')
      .single();

    if (vehicleError) throw vehicleError;

    const desired = parseDesired(formData.get('desired'));
    if (desired) {
      await backend.from('desired_vehicles').insert({
        vehicle_id: vehicle.id,
        ...desired,
      });
    }

    const files = formData
      .getAll('photos')
      .filter((file) => file instanceof File && file.size > 0)
      .slice(0, 6);

    for (const [position, file] of files.entries()) {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `vehicles/${vehicle.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await backend.storage.from('vehicle-photos').upload(path, file, {
        contentType: file.type || 'image/jpeg',
      });

      if (!uploadError) {
        const { data: publicData } = backend.storage.from('vehicle-photos').getPublicUrl(path);
        await backend.from('vehicle_photos').insert({
          vehicle_id: vehicle.id,
          url: publicData.publicUrl,
          position,
        });
      }
    }

    createForm.reset();
    await loadListings();
    const index = listings.findIndex((item) => item.id === vehicle.id);
    renderDetail(Math.max(0, index));
    showView('detail');
  } catch (error) {
    console.error(error);
    window.alert(error.message || 'განცხადება ვერ შეინახა.');
  } finally {
    submit.disabled = false;
  }
}

async function openOffer(index) {
  if (!isAuthed()) {
    requireAuth('feed');
    return;
  }

  selectedOfferIndex = index;
  const car = listings[index];
  offerCarName.textContent = `${car.make} ${car.model} ${car.year}`;

  await loadMyVehicles();
  if (!backend) {
    offerVehicleSelect.innerHTML = '<option value="demo-my-car">Toyota Prius 2018</option><option value="demo-honda-fit">Honda Fit 2019</option>';
  } else if (!myVehicles.length) {
    offerVehicleSelect.innerHTML = '<option value="">ჯერ დაამატე შენი მანქანა</option>';
  } else {
    offerVehicleSelect.innerHTML = myVehicles
      .filter((vehicle) => vehicle.id !== car.id)
      .map((vehicle) => `<option value="${escapeHtml(vehicle.id)}">${escapeHtml(`${vehicle.year} ${vehicle.make} ${vehicle.model}`)}</option>`)
      .join('');
  }

  offerDialog.showModal();
}

async function handleOfferSubmit(event) {
  event.preventDefault();
  const target = listings[selectedOfferIndex];
  if (!target) return;

  if (!backend) {
    window.alert('Supabase config is empty, so this offer is only a frontend preview.');
    offerDialog.close();
    return;
  }

  if (!offerVehicleSelect.value) {
    window.alert('ჯერ დაამატე შენი მანქანა და შემდეგ გაგზავნე შეთავაზება.');
    return;
  }

  const submit = offerForm.querySelector('[type="submit"]');
  submit.disabled = true;

  try {
    await ensureProfile();
    const { error } = await backend.from('offers').insert({
      target_vehicle_id: target.id,
      offered_vehicle_id: offerVehicleSelect.value,
      from_user_id: session.id,
      to_user_id: target.ownerId,
      cash_adjustment: cashAdjustmentFrom(
        document.querySelector('#offer-cash-direction')?.value,
        document.querySelector('#offer-cash-amount')?.value,
        'offer',
      ),
      message: document.querySelector('#offer-message')?.value?.trim() || null,
      status: 'pending',
    });

    if (error) throw error;
    offerForm.reset();
    offerDialog.close();
    await loadOffers();
    showView('offers');
  } catch (error) {
    console.error(error);
    window.alert(error.message || 'შეთავაზება ვერ გაიგზავნა.');
  } finally {
    submit.disabled = false;
  }
}

function vehicleLabel(vehicle) {
  if (!vehicle) return 'მანქანა მიუწვდომელია';
  return `${vehicle.year || ''} ${vehicle.make || ''} ${vehicle.model || ''}`.trim();
}

function vehicleImage(vehicle) {
  if (!vehicle) return DEMO_LISTINGS[0].image;
  return firstPhoto(vehicle);
}

function renderOfferRow(offer) {
  const incoming = offer.to_user_id === session?.id;
  const conversationId = Array.isArray(offer.conversations) ? offer.conversations[0]?.id : offer.conversations?.id;
  const actions = [];

  if (incoming && offer.status === 'pending') {
    actions.push(`<button type="button" data-accept-offer="${offer.id}">მიღება</button>`);
    actions.push(`<button type="button" data-reject-offer="${offer.id}">უარყოფა</button>`);
  }
  if (!incoming && offer.status === 'pending') {
    actions.push(`<button type="button" data-cancel-offer="${offer.id}">გაუქმება</button>`);
  }
  if (offer.status === 'accepted' && conversationId) {
    actions.push(`<button type="button" data-conversation="${conversationId}">ჩატი</button>`);
  }

  return `
    <article class="offer-row">
      <img src="${escapeHtml(vehicleImage(offer.target_vehicle))}" alt="${escapeHtml(vehicleLabel(offer.target_vehicle))}">
      <img src="${escapeHtml(vehicleImage(offer.offered_vehicle))}" alt="${escapeHtml(vehicleLabel(offer.offered_vehicle))}">
      <div>
        <h2>${escapeHtml(vehicleLabel(offer.offered_vehicle))} და ${escapeHtml(vehicleLabel(offer.target_vehicle))}</h2>
        <p>${escapeHtml(offerMoneyText(offer.cash_adjustment))}${offer.message ? ` · ${escapeHtml(offer.message)}` : ''}</p>
      </div>
      <span class="status">${escapeHtml(incoming ? 'შემომავალი' : 'გაგზავნილი')} · ${escapeHtml(offer.status)}</span>
      <div>${actions.join('')}</div>
    </article>
  `;
}

async function loadOffers() {
  if (!backend || !session?.id) {
    if (offersList) {
      offersList.innerHTML = '<p class="auth-note">Supabase-ის ჩართვის შემდეგ შეთავაზებები აქ გამოჩნდება.</p>';
    }
    return;
  }

  const { data, error } = await backend
    .from('offers')
    .select(`
      *,
      target_vehicle:vehicles!offers_target_vehicle_id_fkey(*, vehicle_photos(id, url, position)),
      offered_vehicle:vehicles!offers_offered_vehicle_id_fkey(*, vehicle_photos(id, url, position)),
      conversations(id)
    `)
    .or(`from_user_id.eq.${session.id},to_user_id.eq.${session.id}`)
    .order('created_at', { ascending: false });

  offers = error ? [] : (data || []);
  if (offersList) {
    offersList.innerHTML = offers.length
      ? offers.map(renderOfferRow).join('')
      : '<p class="auth-note">შეთავაზებები ჯერ არ არის.</p>';
  }
}

async function updateOfferStatus(id, status, incomingOnly) {
  if (!backend) return;
  let query = backend.from('offers').update({ status }).eq('id', id).eq('status', 'pending');
  query = incomingOnly ? query.eq('to_user_id', session.id) : query.eq('from_user_id', session.id);
  const { error } = await query;
  if (error) window.alert(error.message);
  await loadOffers();
}

async function acceptOffer(id) {
  if (!backend) return;
  const { data, error } = await backend.rpc('accept_offer', { offer_id_input: id });
  if (error) {
    window.alert(error.message);
    return;
  }
  await loadOffers();
  await loadConversations(data);
  showView('messages');
}

function lastMessage(conversation) {
  return [...(conversation.messages || [])].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
}

function renderConversationList() {
  if (!chatList) return;
  const items = conversations.map((conversation) => {
    const offer = conversation.offers;
    const latest = lastMessage(conversation);
    return `
      <button class="chat-item ${conversation.id === activeConversationId ? 'is-active' : ''}" type="button" data-conversation="${conversation.id}">
        <span>${escapeHtml(vehicleLabel(offer?.offered_vehicle))}</span>
        <small>${escapeHtml(latest?.body || vehicleLabel(offer?.target_vehicle) || 'ჩატი მზად არის')}</small>
      </button>
    `;
  }).join('');

  chatList.innerHTML = `<h1 id="messages-title">შეტყობინებები</h1>${items || '<p class="auth-note">ჩატი გაჩნდება მიღებული შეთავაზების შემდეგ.</p>'}`;
}

function renderConversation(id) {
  const conversation = conversations.find((item) => item.id === id) || conversations[0];
  activeConversationId = conversation?.id || null;
  renderConversationList();

  if (!conversation) {
    if (chatTitle) chatTitle.innerHTML = '<strong>ჩატი არ არის</strong><span>მიიღე შეთავაზება საუბრის დასაწყებად.</span>';
    if (messageThread) messageThread.innerHTML = '';
    if (messageForm) messageForm.hidden = true;
    return;
  }

  const offer = conversation.offers;
  if (chatTitle) {
    chatTitle.innerHTML = `
      <strong>${escapeHtml(vehicleLabel(offer?.offered_vehicle))}</strong>
      <span>${escapeHtml(vehicleLabel(offer?.target_vehicle))}</span>
    `;
  }

  const messages = [...(conversation.messages || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  if (messageThread) {
    messageThread.innerHTML = messages.length
      ? messages.map((message) => `<div class="bubble ${message.sender_id === session?.id ? 'mine' : 'other'}">${escapeHtml(message.body)}</div>`).join('')
      : '<p class="auth-note">შეტყობინებები ჯერ არ არის.</p>';
  }
  if (messageForm) messageForm.hidden = false;

  subscribeToConversation(conversation.id);
}

async function loadConversations(openId) {
  if (!backend || !session?.id) {
    conversations = [];
    renderConversationList();
    renderConversation();
    return;
  }

  const { data, error } = await backend
    .from('conversations')
    .select(`
      *,
      offers:offer_id(
        *,
        target_vehicle:vehicles!offers_target_vehicle_id_fkey(*, vehicle_photos(id, url, position)),
        offered_vehicle:vehicles!offers_offered_vehicle_id_fkey(*, vehicle_photos(id, url, position))
      ),
      messages(id, conversation_id, sender_id, body, created_at, read_at)
    `)
    .or(`user_a.eq.${session.id},user_b.eq.${session.id}`)
    .order('created_at', { ascending: false });

  conversations = error ? [] : (data || []);
  renderConversation(openId || activeConversationId || conversations[0]?.id);
}

function subscribeToConversation(id) {
  if (!backend || !id) return;
  if (messageChannel) backend.removeChannel(messageChannel);
  messageChannel = backend
    .channel(`messages:${id}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${id}`,
    }, async () => {
      await loadConversations(id);
    })
    .subscribe();
}

async function handleMessageSubmit(event) {
  event.preventDefault();
  const body = messageInput?.value.trim();
  if (!backend || !activeConversationId || !body) return;

  const { error } = await backend.from('messages').insert({
    conversation_id: activeConversationId,
    sender_id: session.id,
    body,
  });

  if (error) {
    window.alert(error.message);
    return;
  }
  messageInput.value = '';
  await loadConversations(activeConversationId);
}

function showView(name, skipGuard) {
  if (!skipGuard && PROTECTED_VIEWS.includes(name) && !isAuthed()) {
    requireAuth(name);
    return;
  }

  document.body.dataset.view = name;
  document.querySelectorAll('.view').forEach((view) => {
    view.classList.toggle('is-visible', view.id === `${name}-view`);
  });
  document.querySelectorAll('[data-view]').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.view === name);
  });
  document.querySelectorAll('.bottom-nav button').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.view === name);
  });

  if (name === 'offers') loadOffers();
  if (name === 'messages') loadConversations();

  window.scrollTo({ top: 0, behavior: 'instant' });
}

document.addEventListener('click', async (event) => {
  const viewButton = event.target.closest('[data-view]');
  if (viewButton) {
    event.preventDefault();
    showView(viewButton.dataset.view);
  }

  const scrollButton = event.target.closest('[data-scroll]');
  if (scrollButton) {
    event.preventDefault();
    showView('landing');
    window.setTimeout(() => {
      document.getElementById(scrollButton.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' });
    }, 0);
  }

  const detailButton = event.target.closest('[data-detail]');
  if (detailButton) {
    renderDetail(Number(detailButton.dataset.detail));
    showView('detail');
  }

  const offerButton = event.target.closest('[data-offer]');
  if (offerButton) {
    await openOffer(Number(offerButton.dataset.offer));
  }

  if (event.target.closest('[data-filter-sheet]')) {
    filterDialog.showModal();
  }

  if (event.target.closest('[data-swaps-prev]')) {
    scrollSwaps(-1);
  }

  if (event.target.closest('[data-swaps-next]')) {
    scrollSwaps(1);
  }

  if (event.target.closest('#auth-toggle')) {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  }

  if (event.target.closest('#auth-logout')) {
    await logout();
  }

  if (event.target.closest('.close-dialog')) {
    event.target.closest('dialog')?.close();
  }

  const acceptButton = event.target.closest('[data-accept-offer]');
  if (acceptButton) {
    await acceptOffer(acceptButton.dataset.acceptOffer);
  }

  const rejectButton = event.target.closest('[data-reject-offer]');
  if (rejectButton) {
    await updateOfferStatus(rejectButton.dataset.rejectOffer, 'rejected', true);
  }

  const cancelButton = event.target.closest('[data-cancel-offer]');
  if (cancelButton) {
    await updateOfferStatus(cancelButton.dataset.cancelOffer, 'cancelled', false);
  }

  const conversationButton = event.target.closest('[data-conversation]');
  if (conversationButton) {
    await loadConversations(conversationButton.dataset.conversation);
    showView('messages');
  }
});

document.querySelector('#auth-form')?.addEventListener('submit', handleAuthSubmit);
createForm?.addEventListener('submit', handleCreateSubmit);
offerForm?.addEventListener('submit', handleOfferSubmit);
messageForm?.addEventListener('submit', handleMessageSubmit);

const swapBarForm = document.querySelector('#hero-swap-bar');
const swapBarHave = document.querySelector('#swap-have');
const swapBarWant = document.querySelector('#swap-want');
const swapBarPivot = document.querySelector('#swap-bar-pivot');

swapBarPivot?.addEventListener('click', () => {
  if (!swapBarHave || !swapBarWant) return;
  const haveValue = swapBarHave.value;
  swapBarHave.value = swapBarWant.value;
  swapBarWant.value = haveValue;
  swapBarPivot.classList.toggle('is-flipped');
});

swapBarForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  const query = [(swapBarWant?.value || '').trim(), (swapBarHave?.value || '').trim()]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  const headerSearch = document.querySelector('#header-search');
  if (headerSearch) {
    headerSearch.value = query;
    headerSearch.dispatchEvent(new Event('input', { bubbles: true }));
  }
  document.getElementById('swaps')?.scrollIntoView({ behavior: 'smooth' });
});

(async function init() {
  setAuthMode('login');
  await initAuth();
  await loadListings();
  await loadMyVehicles();

  const initialView = window.location.hash.replace('#', '');
  if (VALID_VIEWS.includes(initialView)) {
    showView(initialView);
  }

  if (!backend) {
    console.info('AutoSwap is running in demo mode. Fill web/supabase-config.js to enable Supabase.');
  }
})();
