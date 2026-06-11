/* AutoSwap — vehicle detail page.
   Reads ?id=, finds the car in DEMO_CARS (or public_vehicle_feed when Supabase
   is configured), and renders the full listing. Offer + save are handled by the
   global delegated listeners in shared.js. */
const { Header, Footer, icons, DEMO_CARS, fetchVehicleById, fetchVehiclePhotos } = window.AutoSwap;

function getId() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

// Mirrors the cars.js cash badge mapping (sender's perspective).
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
  // The owner's own words win; the generated line is only a fallback.
  if (car.description) return car.description;
  const parts = [car.transmissionLabel, car.categoryLabel].filter(Boolean).join(' · ');
  const intent = car.openToOffers
    ? 'მფლობელი ღიაა გაცვლის შემოთავაზებებისთვის.'
    : `მფლობელი ეძებს გაცვლას: ${car.wants}.`;
  return `${car.make} ${car.model}, ${car.year} წ. — ${car.mileage}, ${car.fuel}${parts ? `, ${parts}` : ''}. `
    + `${intent} ავტომობილი დათვალიერებადია ${car.city}-ში, დოკუმენტები წესრიგშია.`;
}

// Only this vehicle's own photos — no shared filler images. With a single
// photo the thumbnail row is omitted entirely.
function Gallery(car, photos) {
  const sources = (photos && photos.length ? photos : [car.image]).filter(Boolean);
  const thumbs = sources.length > 1
    ? `
      <div class="detail-thumbs">
        ${sources.map((src, i) => `
          <button type="button" class="detail-thumb${i === 0 ? ' is-active' : ''}" data-src="${src}" aria-label="ფოტო ${i + 1}">
            <img src="${src}" alt="">
          </button>
        `).join('')}
      </div>`
    : '';
  return `
    <div class="detail-gallery">
      <div class="detail-main-media">
        <img id="detail-main-img" src="${sources[0]}" alt="${car.make} ${car.model}">
      </div>
      ${thumbs}
    </div>
  `;
}

function DetailPage(car, photos) {
  const cash = carCash(car);
  // Instrument-cluster stat row: caption label above a mono value, 1px dividers.
  const stats = [
    car.year ? { label: 'წელი', value: car.year } : null,
    car.mileage ? { label: 'გარბენი', value: car.mileage } : null,
    car.fuel ? { label: 'საწვავი', value: car.fuel } : null,
    car.transmissionLabel ? { label: 'გადაცემათა', value: car.transmissionLabel } : null,
    car.categoryLabel ? { label: 'ტიპი', value: car.categoryLabel } : null,
    car.estimatedValueLabel ? { label: 'ღირებულება', value: `~${car.estimatedValueLabel}` } : null,
  ].filter(Boolean);
  const statRow = stats
    .map((s) => `<div class="stat-cell"><span>${s.label}</span><strong>${s.value}</strong></div>`)
    .join('');

  return `
    ${Header({ active: 'listings' })}
    <main class="detail-shell">
      <section class="container detail">
        <a class="detail-back" href="cars.html">${icons.arrowRight}<span>გაცვლებზე დაბრუნება</span></a>
        <div class="detail-grid">
          ${Gallery(car, photos)}
          <aside class="detail-panel">
            <h1 class="detail-title">${car.make} ${car.model} <span>${car.year}</span></h1>
            <span class="listing-city">${icons.location}${car.city}</span>
            <div class="stat-row" role="list">${statRow}</div>
            <div class="car-row-cash ${cash.cls} detail-cash">${cash.icon}<span>${cash.text}</span></div>
            <div class="car-row-wants detail-wants">
              <span>ეძებს</span>
              <strong>${car.wants}</strong>
            </div>
            <div class="detail-actions">
              <button class="btn btn-primary detail-offer" type="button" data-offer data-id="${car.id}" data-make="${car.make}" data-model="${car.model}">${icons.swap} შესთავაზე გაცვლა</button>
              <button class="save-btn detail-save" type="button" data-id="${car.id}" aria-label="${car.make} ${car.model} შენახვა">${icons.heart}</button>
            </div>
            <div class="detail-owner">
              <span class="owner-avatar">${(car.ownerName || car.make || 'A').charAt(0)}</span>
              <div>
                <strong>${car.ownerName || 'კერძო მფლობელი'}</strong>
                <small>${car.city}${car.ownerSwaps ? ` · ${car.ownerSwaps} გაცვლა` : ''}</small>
              </div>
            </div>
          </aside>
        </div>
        <section class="detail-about">
          <h2>აღწერა</h2>
          <p>${descriptionFor(car)}</p>
        </section>
      </section>
    </main>
    ${Footer()}
  `;
}

function NotFound() {
  return `
    ${Header({ active: 'listings' })}
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
    ${Footer()}
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

async function render() {
  const id = getId();
  let car = DEMO_CARS.find((c) => c.id === id) || null;
  const isDemo = !!car;
  if (!car && id) car = await fetchVehicleById(id);

  // Demo cars have a single bundled cover; live cars load their own photos.
  const photos = car && !isDemo ? await fetchVehiclePhotos(car.id) : [];

  document.querySelector('#app').innerHTML = car ? DetailPage(car, photos) : NotFound();
  if (car) bindThumbs();
}

render();
