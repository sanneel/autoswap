
const { Header, Footer, icons, DEMO_CARS, fetchVehicleById, fetchVehiclePhotos, escapeAttr } = window.AutoSwap;
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
      </div>
      ${thumbs}
    </div>
  `;
}

function DetailPage(car, photos) {
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
    ${Header({ active: 'listings' })}
    <main class="detail-shell">
      <section class="container detail">
        <a class="detail-back" href="cars.html">${icons.arrowRight}<span>უკან განცხადებებზე</span></a>
        <div class="detail-grid">
          ${Gallery(car, photos)}
          <aside class="detail-panel">
            <h1 class="detail-title">${name} <span>${esc(car.year)}</span></h1>
            <span class="listing-city">${icons.location}${esc(car.city)}</span>
            <div class="stat-row" role="list">${statRow}</div>
            <div class="car-row-cash ${cash.cls} detail-cash">${cash.icon}<span>${esc(cash.text)}</span></div>
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

  
  const photos = car && !isDemo ? await fetchVehiclePhotos(car.id) : [];

  document.querySelector('#app').innerHTML = car ? DetailPage(car, photos) : NotFound();
  if (car) bindThumbs();
}

render();
