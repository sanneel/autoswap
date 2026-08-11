
const {
  Header, Footer, icons, DEMO_CARS, fetchVehicleById, fetchVehiclePhotos, escapeAttr,
  fetchFeed, priceCurrencyToggle, toast,
} = window.AutoSwap;
// Escapes & < > ", every user-controlled listing string goes through this
// before being placed into innerHTML.
const esc = escapeAttr;

function getId() {
  return new URLSearchParams(window.location.search).get('id') || '';
}


function carCash(car) {
  switch (car.cashType) {
    case 'add':
      return { cls: 'car-row-cash--add', icon: icons.trendUp, text: car.cash };
    case 'ask':
      return { cls: 'car-row-cash--ask', icon: icons.trendDown, text: car.cash };
    case 'flexible':
      return { cls: 'car-row-cash--flexible', icon: icons.swap, text: 'სხვაობა შეთანხმებით' };
    default:
      return { cls: 'car-row-cash--none', icon: icons.equals, text: 'თანაბარი გაცვლა' };
  }
}

function descriptionFor(car) {
  if (car.description) return car.description;
  return 'მფლობელმა დამატებითი ინფო არ მიუთითა.';
}



function Gallery(car, photos) {
  const sources = (photos && photos.length ? photos : [car.image]).filter(Boolean);
  const name = esc(`${car.make} ${car.model}`);
  const thumbs = sources.length > 1
    ? `
      <div class="detail-thumbs">
        ${sources.map((src, i) => `
          <button type="button" class="detail-thumb${i === 0 ? ' is-active' : ''}" data-src="${esc(src)}" aria-label="ფოტო ${i + 1}">
            <img src="${esc(src)}" alt="">
          </button>
        `).join('')}
      </div>`
    : '';
  const count = `<span class="detail-photo-count">${icons.image || ''}${sources.length} ${sources.length === 1 ? 'ფოტო' : 'ფოტო'}</span>`;
  return `
    <div class="detail-gallery">
      <div class="detail-main-media">
        <img id="detail-main-img" src="${esc(sources[0])}" alt="${name}">
        ${count}
        <div class="gallery-tools">
          <button type="button" class="gallery-tool save-btn" data-id="${esc(car.id)}" aria-label="${name} შენახვა">${icons.heart}</button>
          <button type="button" class="gallery-tool" data-zoom aria-label="სურათის გადიდება">${icons.search}</button>
          <button type="button" class="gallery-tool" data-share aria-label="გაზიარება">${icons.upload}</button>
        </div>
      </div>
      ${thumbs}
    </div>
  `;
}

function Breadcrumb(car) {
  const trail = [
    { label: 'მთავარი', href: 'index.html' },
    { label: 'განცხადებები', href: 'cars.html' },
    car.make ? { label: car.make, href: `cars.html?make=${encodeURIComponent(car.make)}` } : null,
    car.model ? { label: car.model, href: '' } : null,
    car.year ? { label: car.year, href: '' } : null,
  ].filter(Boolean);
  return `
    <nav class="crumbs" aria-label="ნავიგაცია">
      <ol>
        ${trail.map((c, i) => {
    const last = i === trail.length - 1;
    const inner = c.href && !last
      ? `<a href="${esc(c.href)}">${esc(c.label)}</a>`
      : `<span${last ? ' aria-current="page"' : ''}>${esc(c.label)}</span>`;
    return `<li>${inner}</li>`;
  }).join('')}
      </ol>
    </nav>`;
}

// Where this listing's value sits among comparable listings currently on the
// site. Same category only, and suppressed below a real sample — a "price
// position" derived from two other cars would be decoration, not information.
const PRICE_POS_MIN_SAMPLE = 5;

function pricePosition(car, comparables) {
  if (!car.estimatedValue || !car.category) return null;
  const peers = comparables
    .filter((c) => c.id !== car.id && c.category === car.category && c.estimatedValue > 0)
    .map((c) => c.estimatedValue)
    .sort((a, b) => a - b);
  if (peers.length < PRICE_POS_MIN_SAMPLE) return null;
  const below = peers.filter((v) => v < car.estimatedValue).length;
  const pct = below / peers.length;
  return {
    pct,
    band: pct <= 0.33 ? 'low' : (pct >= 0.67 ? 'high' : 'mid'),
    sample: peers.length,
  };
}

function PricePositionBar(pos) {
  if (!pos) return '';
  // "საშუალო ფასი" tells the reader nothing they can act on — the bar only
  // earns its space when the price is actually notable in one direction.
  if (pos.band === 'mid') return '';
  const labels = { low: 'დაბალი ფასი', high: 'მაღალი ფასი' };
  return `
    <div class="price-pos price-pos--${pos.band}">
      <div class="price-pos-head">
        <strong class="price-pos-label">${labels[pos.band]}</strong>
        <span class="price-pos-note">${pos.sample} მსგავს განცხადებასთან</span>
      </div>
      <div class="price-pos-track" role="img" aria-label="${labels[pos.band]}, ${pos.sample} მსგავს განცხადებასთან შედარებით">
        <span class="price-pos-marker" style="left:${Math.round(pos.pct * 100)}%"></span>
      </div>
      <div class="price-pos-scale"><span>დაბალი</span><span>საშუალო</span><span>მაღალი</span></div>
    </div>`;
}

function StickyBar(car, cash) {
  const name = esc(`${car.make} ${car.model}`);
  const specs = [car.year, car.mileage, car.fuel].filter(Boolean).join(' · ');
  return `
    <div class="detail-stickybar" id="detail-stickybar" aria-hidden="true">
      <div class="container detail-stickybar-inner">
        <img class="detail-stickybar-thumb" src="${esc(car.image)}" alt="">
        <div class="detail-stickybar-copy">
          <strong>${name} <span>${esc(car.year)}</span></strong>
          <small>${esc(specs)}</small>
        </div>
        <span class="detail-stickybar-cash ${cash.cls}">${cash.icon}<span>${esc(cash.text)}</span></span>
        <button class="btn btn-primary detail-stickybar-cta" type="button" data-offer data-id="${esc(car.id)}" data-make="${esc(car.make)}" data-model="${esc(car.model)}">${icons.swap} შესთავაზე გაცვლა</button>
      </div>
    </div>`;
}

function DetailPage(car, photos, comparables) {
  const cash = carCash(car);
  
  const stats = [
    car.year ? { label: 'წელი', value: car.year } : null,
    car.mileage ? { label: 'გარბენი', value: car.mileage } : null,
    car.fuel ? { label: 'საწვავი', value: car.fuel } : null,
    car.transmissionLabel ? { label: 'გადაცემათა', value: car.transmissionLabel } : null,
    car.categoryLabel ? { label: 'ტიპი', value: car.categoryLabel } : null,
    car.estimatedValueLabel ? { label: 'ღირებულება', value: `~${car.estimatedValueLabel}` } : null,
  ].filter(Boolean);
  const statRow = stats
    .map((s) => `<div class="stat-cell"><span>${s.label}</span><strong>${esc(s.value)}</strong></div>`)
    .join('');

  const name = esc(`${car.make} ${car.model}`);
  const ownerHref = car.ownerId ? `cars.html?owner=${encodeURIComponent(car.ownerId)}` : '';
  const ownerTag = ownerHref ? 'a' : 'div';
  const ownerAttr = ownerHref ? ` href="${ownerHref}" aria-label="მფლობელის სხვა განცხადებები"` : '';
  return `
    ${Header({ active: 'listings', currency: true })}
    ${StickyBar(car, cash)}
    <main class="detail-shell">
      <section class="container detail">
        ${Breadcrumb(car)}
        <div class="detail-grid">
          ${Gallery(car, photos)}
          <aside class="detail-panel">
            <h1 class="detail-title">${name} <span>${esc(car.year)}</span></h1>
            <span class="listing-city">${icons.location}${esc(car.city)}</span>
            <div class="stat-row" role="list">${statRow}</div>
            <div class="car-row-cash ${cash.cls} detail-cash">${cash.icon}<span>${esc(cash.text)}</span>${car.cashAmount > 0 ? priceCurrencyToggle() : ''}</div>
            ${PricePositionBar(pricePosition(car, comparables))}
            <div class="car-row-wants detail-wants">
              <span>ეძებს</span>
              <strong>${esc(car.wants)}</strong>
            </div>
            <div class="detail-actions">
              <button class="btn btn-primary detail-offer" type="button" data-offer data-id="${esc(car.id)}" data-make="${esc(car.make)}" data-model="${esc(car.model)}">${icons.swap} შესთავაზე გაცვლა</button>
              <button class="save-btn detail-save" type="button" data-id="${esc(car.id)}" aria-label="${name} შენახვა">${icons.heart}</button>
            </div>
            <${ownerTag} class="detail-owner${ownerHref ? ' detail-owner--link' : ''}"${ownerAttr}>
              <span class="owner-avatar">${esc((car.ownerName || car.make || 'A').charAt(0))}</span>
              <div class="detail-owner-info">
                <strong>${car.ownerName ? esc(car.ownerName) : 'კერძო მფლობელი'}</strong>
                <small>${esc(car.city)}${car.ownerSwaps ? ` · ${esc(String(car.ownerSwaps))} გაცვლა` : ''}</small>
              </div>
              ${ownerHref ? `<span class="owner-more">სხვა განცხადებები ${icons.arrowRight}</span>` : ''}
            </${ownerTag}>
          </aside>
        </div>
        <section class="detail-about">
          <h2>აღწერა</h2>
          <p>${esc(descriptionFor(car))}</p>
        </section>
      </section>
    </main>
    ${Footer({ active: 'listings' })}
  `;
}

function NotFound() {
  return `
    ${Header({ active: 'listings', currency: true })}
    <main class="detail-shell">
      <section class="container detail-missing">
        <div class="detail-missing-card">
          <span class="detail-missing-icon">${icons.car}</span>
          <h1>განცხადება ვერ მოიძებნა</h1>
          <p>ეს ბმული აღარ მუშაობს ან ავტომობილი წაიშალა.</p>
          <a class="btn btn-primary detail-missing-btn" href="cars.html">${icons.arrowRight} დაბრუნდი გაცვლებში</a>
        </div>
      </section>
    </main>
    ${Footer({ active: 'listings' })}
  `;
}

function bindThumbs() {
  document.querySelector('.detail-thumbs')?.addEventListener('click', (event) => {
    const thumb = event.target.closest('.detail-thumb');
    if (!thumb) return;
    document.querySelectorAll('.detail-thumb').forEach((b) => b.classList.remove('is-active'));
    thumb.classList.add('is-active');
    const main = document.querySelector('#detail-main-img');
    if (main) main.src = thumb.dataset.src;
  });
}

// Reveals the sticky CTA bar once the main image has scrolled away, so the
// offer action is never out of reach. Falls back to always-hidden where
// IntersectionObserver is unavailable rather than pinning it permanently.
function bindStickyBar() {
  const bar = document.querySelector('#detail-stickybar');
  const media = document.querySelector('.detail-main-media');
  if (!bar || !media || typeof IntersectionObserver !== 'function') return;
  const io = new IntersectionObserver(([entry]) => {
    const show = !entry.isIntersecting;
    bar.classList.toggle('is-visible', show);
    bar.setAttribute('aria-hidden', String(!show));
  }, { rootMargin: '-80px 0px 0px 0px' });
  io.observe(media);
}

function bindGalleryTools() {
  document.querySelector('.gallery-tools')?.addEventListener('click', (event) => {
    const zoom = event.target.closest('[data-zoom]');
    const share = event.target.closest('[data-share]');
    if (zoom) {
      const src = document.querySelector('#detail-main-img')?.src;
      if (src) openLightbox(src);
      return;
    }
    if (!share) return;
    const payload = { title: document.title, url: window.location.href };
    if (navigator.share) {
      navigator.share(payload).catch(() => { /* user dismissed */ });
      return;
    }
    navigator.clipboard?.writeText(payload.url)
      .then(() => toast('ბმული დაკოპირდა'))
      .catch(() => toast('ბმული ვერ დაკოპირდა', 'error'));
  });
}

function openLightbox(src) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `<img src="${esc(src)}" alt=""><button type="button" class="lightbox-close" aria-label="დახურვა">&times;</button>`;
  const close = () => {
    overlay.remove();
    document.removeEventListener('keydown', onKey);
  };
  function onKey(e) { if (e.key === 'Escape') close(); }
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('.lightbox-close')) close();
  });
  document.addEventListener('keydown', onKey);
  document.body.appendChild(overlay);
  overlay.querySelector('.lightbox-close')?.focus();
}

async function render() {
  const id = getId();
  let car = DEMO_CARS.find((c) => c.id === id) || null;
  const isDemo = !!car;
  if (!car && id) car = await fetchVehicleById(id);

  const photos = car && !isDemo ? await fetchVehiclePhotos(car.id) : [];
  // Comparison set for the price-position bar. Demo listings compare against
  // the demo set; live listings against the real feed.
  let comparables = DEMO_CARS;
  if (car && !isDemo) {
    const feed = await fetchFeed().catch(() => null);
    if (feed && feed.length) comparables = feed;
  }

  document.querySelector('#app').innerHTML = car ? DetailPage(car, photos, comparables) : NotFound();
  if (car) {
    bindThumbs();
    bindStickyBar();
    bindGalleryTools();
  }
}

render();
