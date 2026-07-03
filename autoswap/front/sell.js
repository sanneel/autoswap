
const {
  Header, Footer, icons, sb, toast, escapeAttr, isUuid,
  authReady, getAuthUser, onAuth, openAuthModal,
  bustListingCaches, searchMakes, searchModels, FUEL_LABELS,
} = window.AutoSwap;

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const THIS_YEAR = new Date().getFullYear();
const SELL_LITE_KEY = 'autoswap.sellLite';
const CITIES = ['თბილისი', 'ბათუმი', 'ქუთაისი', 'რუსთავი', 'გორი', 'ზუგდიდი', 'ფოთი', 'თელავი'];

const editId = (() => {
  const raw = new URLSearchParams(window.location.search).get('id') || '';
  return isUuid(raw) ? raw : '';
})();

let existingPhotos = []; 
let removedPhotoIds = new Set();

const ICON_X = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12"></path><path d="M18 6 6 18"></path></svg>';


const SECTIONS = [
  { title: 'ავტომობილი', icon: icons.car },
  { title: 'რა გინდა სანაცვლოდ', icon: icons.tag },
  { title: 'დეტალები', icon: icons.doc },
];



function sellSection(index, bodyHTML, extraClass = '') {
  const s = SECTIONS[index];
  return `
    <section class="sell-section ${extraClass}" id="sell-section-${index + 1}">
      <div class="sell-section-head">
        <h2><span class="sell-section-num">0${index + 1}</span>${s.title}</h2>
        <span class="sell-section-badge">${s.icon}</span>
      </div>
      ${bodyHTML}
    </section>
  `;
}


function iconField(icon, label, controlHTML, extraClass = '') {
  return `
    <label class="field field--icon ${extraClass}">
      <span>${label}</span>
      <span class="field-control">${icon}${controlHTML}</span>
    </label>
  `;
}

function fieldRows(vehicle, prefs, wantsValue) {
  const v = vehicle || {};
  const p = prefs || {};
  const sel = (value, current) => (String(value) === String(current ?? '') ? ' selected' : '');
  const vehicleSearchValue = [v.make, v.model].filter(Boolean).join(' ');

  const cityOpts = CITIES.map((c) => `<option value="${c}"${sel(c, v.city)}>${c}</option>`).join('');
  const fuelOpts = [['petrol', 'ბენზინი'], ['diesel', 'დიზელი'], ['hybrid', 'ჰიბრიდი'], ['electric', 'ელექტრო'], ['lpg', 'გაზი']]
    .map(([value, label]) => `<option value="${value}"${sel(value, v.fuel_type)}>${label}</option>`).join('');
  const transOpts = [['automatic', 'ავტომატიკა'], ['manual', 'მექანიკა'], ['tiptronic', 'ტიპტრონიკი'], ['variator', 'ვარიატორი']]
    .map(([value, label]) => `<option value="${value}"${sel(value, v.transmission)}>${label}</option>`).join('');
  const catOpts = [['sedan', 'სედანი'], ['suv', 'ჯიპი'], ['crossover', 'კროსოვერი'], ['hatchback', 'ჰეჩბექი'], ['coupe', 'კუპე'], ['minivan', 'მინივენი'], ['pickup', 'პიკაპი'], ['universal', 'უნივერსალი']]
    .map(([value, label]) => `<option value="${value}"${sel(value, v.category)}>${label}</option>`).join('');
  const cashOpts = [['none', 'თანხის გარეშე'], ['add_money', 'ვამატებ თანხას'], ['ask_money', 'ვითხოვ თანხას'], ['flexible', 'შეთანხმებით']]
    .map(([value, label]) => `<option value="${value}"${sel(value, p.cash_mode)}>${label}</option>`).join('');

  const voice = `
    <div class="voice-fill" id="voice-fill" hidden>
      <button type="button" class="voice-btn" id="voice-btn" aria-label="ხმით შევსება">${icons.mic}</button>
      <div class="voice-copy">
        <strong>შეავსე ხმით</strong>
        <small id="voice-hint">დააჭირე მიკროფონს და თქვი: „BMW 530, 2020 წელი, 90 ათასი კმ, ბენზინი, ავტომატიკა, თბილისი“</small>
      </div>
    </div>
  `;

  const carBody = `
    <div class="sell-grid">
      ${iconField(icons.search, 'მარკა და მოდელი *', `<input name="vehicleSearch" required placeholder="BMW 530i" list="vehicle-search-list" value="${escapeAttr(vehicleSearchValue)}" autocomplete="off"><datalist id="vehicle-search-list"></datalist><input type="hidden" name="make" value="${escapeAttr(v.make || '')}"><input type="hidden" name="model" value="${escapeAttr(v.model || '')}">`, 'field--wide field--vehicle-search')}
      ${iconField(icons.calendar, 'წელი *', `<input name="year" type="number" min="1980" max="${THIS_YEAR + 1}" required placeholder="2020" value="${v.year ?? ''}">`)}
      ${iconField(icons.gauge, 'გარბენი (კმ) *', `<input name="mileage" type="number" min="0" max="2000000" required placeholder="90000" value="${v.mileage ?? ''}">`)}
      ${iconField(icons.fuel, 'საწვავი *', `<select name="fuel" required>${fuelOpts}</select>`)}
      ${iconField(icons.gear, 'ტრანსმისია *', `<select name="transmission" required>${transOpts}</select>`)}
      ${iconField(icons.car, 'კატეგორია', `<select name="category">${catOpts}</select>`, 'field--lite-extra')}
      ${iconField(icons.engine, 'ძრავი (ლ)', `<input name="engineSize" type="number" min="0.1" max="9.9" step="0.1" placeholder="2.0" value="${v.engine_size ?? ''}">`, 'field--lite-extra')}
    </div>
    <input type="hidden" name="city" value="${escapeAttr(v.city || 'თბილისი')}">
    <input type="hidden" name="condition" value="${escapeAttr(v.condition || 'good')}">
  `;

  const termsBody = `
    <div class="sell-grid">
      ${iconField(icons.swap, 'სასურველი მანქანა', `<input name="desired" placeholder="Audi A6, Mercedes E-Class" value="${escapeAttr(wantsValue || '')}">`)}
      ${iconField(icons.clock, 'თანხის სხვაობა', `<select name="cashMode">${cashOpts}</select>`)}
      ${iconField(icons.tag, 'რამდენი (₾)', `<input name="amount" type="number" min="0" placeholder="0" value="${p.cash_amount || ''}" inputmode="numeric">`, 'field--cash-amount')}
    </div>
  `;

  const existingPhotosHTML = existingPhotos.length ? `<div class="upload-previews upload-previews--existing" id="existing-photos">
        ${existingPhotos.map((photo) => `
          <figure class="upload-preview" data-photo="${photo.id}">
            <img src="${escapeAttr(photo.url)}" alt="">
            <button type="button" class="upload-remove" data-remove-photo aria-label="ფოტოს წაშლა">&times;</button>
          </figure>`).join('')}
      </div>` : '';

  const detailsBody = `
    <label class="field field--full"><span>აღწერა</span>
      <span class="field-control field-control--area">
        <textarea name="description" rows="3" maxlength="2000" placeholder="მოკლე აღწერა მანქანის მდგომარეობაზე…">${escapeAttr(v.description || '')}</textarea>
        <span class="field-counter" id="desc-counter" aria-hidden="true">${(v.description || '').length}/2000</span>
      </span>
    </label>
    <div class="field field--full"><span>ფოტოები</span>
      ${existingPhotosHTML}
      <label class="upload-zone" id="upload-zone">
        <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple class="upload-input">
        <span class="upload-icon">${icons.upload}</span>
        <span class="upload-text"><strong>ატვირთე ფოტოები</strong><small>მაქს. ${MAX_PHOTOS} · JPG/PNG/WebP · ≤5MB · პირველი ხდება მთავარი</small></span>
      </label>
      <div class="upload-previews" id="upload-previews" hidden></div>
    </div>
  `;

  return `
    ${voice}
    ${sellSection(0, carBody, 'sell-section--car')}
    ${sellSection(1, termsBody, 'sell-section--terms')}
    ${sellSection(2, detailsBody, 'sell-section--details')}
  `;
}



function HeroSteps() {
  return `
    <ol class="sell-steps" aria-hidden="true">
      ${SECTIONS.map((s, i) => `
        <li class="sell-step-pip${i === 0 ? ' is-active' : ''}">
          <span class="sell-step-pip-num">${i + 1}</span>
          <span class="sell-step-pip-label">${s.title}</span>
        </li>`).join('')}
    </ol>
  `;
}

function isLiteMode() {
  return localStorage.getItem(SELL_LITE_KEY) !== 'off';
}

function ModeBar() {
  return `
    <div class="sell-mode-bar" aria-label="ფორმის ნაწილები">
      ${SECTIONS.map((s, i) => `<a class="sell-mode-chip" href="#sell-section-${i + 1}"><span>0${i + 1}</span>${s.title}</a>`).join('')}
    </div>
  `;
}

function applySellMode(lite) {
  const root = document.querySelector('.sell-shell');
  const toggle = document.querySelector('[data-lite-toggle]');
  if (!root || !toggle) return;
  root.classList.toggle('sell-shell--lite', lite);
  root.classList.toggle('sell-shell--full', !lite);
  toggle.classList.toggle('is-on', lite);
  toggle.setAttribute('aria-pressed', String(lite));
}

function bindSellMode() {
  const toggle = document.querySelector('[data-lite-toggle]');
  if (!toggle) return;
  applySellMode(isLiteMode());
  toggle.addEventListener('click', () => {
    const next = !toggle.classList.contains('is-on');
    localStorage.setItem(SELL_LITE_KEY, next ? 'on' : 'off');
    applySellMode(next);
  });
}

function SellPage(vehicle, prefs, wantsValue) {
  const lite = isLiteMode();
  return `
    ${Header({ active: 'sell', liteToggle: true })}
    <main class="sell-shell sell-shell--v3 ${lite ? 'sell-shell--lite' : 'sell-shell--full'}">
      <div class="sell-hero">
        <div class="container sell-hero-inner">
          <span class="sell-hero-icon">${icons.car}</span>
          <div class="sell-head">
            <h1>${editId ? 'განცხადების რედაქტირება' : 'დაამატე შენი ავტომობილი'}</h1>
            <p class="sell-sub">${editId ? 'შეცვალე დეტალები. ცვლილებები მაშინვე გამოჩნდება ფიდში.' : 'აღწერე მანქანა და რა გინდა სანაცვლოდ. განცხადება გამოჩნდება გაცვლების ფიდში.'}</p>
          </div>
          ${HeroSteps()}
        </div>
      </div>
      <section class="container sell">
        ${ModeBar()}
        <div class="sell-layout">
          <form class="sell-form" id="sell-form" novalidate>
            ${fieldRows(vehicle, prefs, wantsValue)}
            <p class="auth-error" id="sell-error" role="alert" hidden></p>
            <div class="sell-actions">
              <a class="btn btn-ghost" href="${editId ? 'account.html' : 'cars.html'}">${ICON_X} გაუქმება</a>
              <button class="btn btn-primary" type="submit" id="sell-submit">${icons.plus} ${editId ? 'შენახვა' : 'გამოაქვეყნე განცხადება'}</button>
            </div>
          </form>
          <aside class="sell-preview" aria-label="განცხადების გადახედვა">
            <p class="sell-preview-label">${icons.eye}<span>ასე გამოჩნდება ფიდში</span></p>
            <div id="sell-preview-card"></div>
          </aside>
        </div>
      </section>
    </main>
    ${Footer()}
  `;
}

function GatePanel(title, text, actions) {
  return `
    ${Header({ active: 'sell' })}
    <main class="sell-shell">
      <section class="container sell-success-page">
        <div class="sell-success-card">
          <span class="offer-success-icon">${icons.shield}</span>
          <h1>${title}</h1>
          <p>${text}</p>
          <div class="sell-success-actions">${actions}</div>
        </div>
      </section>
    </main>
    ${Footer()}
  `;
}


function DemoSuccess(make, model) {
  const name = make ? `${make} ${model}`.trim() : 'შენი ავტომობილი';
  return GatePanel(
    'განცხადება არ შენახულა',
    `${escapeAttr(name)} ფიდში ვერ მოხვდა. რეალური შენახვისთვის საჭიროა დადასტურებული ავტორიზაცია.`,
    '<a class="btn btn-primary" href="login.html?next=sell.html">ნამდვილი შესვლა</a><a class="btn btn-ghost" href="cars.html">ნახე გაცვლები</a>',
  );
}


let pickedFiles = [];

function remainingSlots() {
  return MAX_PHOTOS - (existingPhotos.length - removedPhotoIds.size);
}

function bindUploadZone() {
  const input = document.querySelector('.upload-input');
  const previews = document.querySelector('#upload-previews');
  if (!input || !previews) return;

  input.addEventListener('change', () => {
    previews.querySelectorAll('img').forEach((img) => URL.revokeObjectURL(img.src));
    const files = Array.from(input.files || []);
    const valid = [];
    for (const file of files) {
      if (!PHOTO_TYPES.includes(file.type)) {
        toast(`${file.name}: მხოლოდ JPG/PNG/WebP`, 'error');
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        toast(`${file.name}: მაქს. 5MB`, 'error');
        continue;
      }
      valid.push(file);
    }
    pickedFiles = valid.slice(0, remainingSlots());
    if (valid.length > pickedFiles.length) toast(`მაქს. ${MAX_PHOTOS} ფოტო თითო განცხადებაზე`, 'error');

    previews.innerHTML = pickedFiles
      .map((file, i) => `
        <figure class="upload-preview">
          <img src="${URL.createObjectURL(file)}" alt="ფოტო ${i + 1}">
          ${i === 0 && !(existingPhotos.length - removedPhotoIds.size) ? '<figcaption>მთავარი</figcaption>' : ''}
        </figure>
      `)
      .join('');
    previews.hidden = !pickedFiles.length;

    if (previewPhotoUrl) URL.revokeObjectURL(previewPhotoUrl);
    previewPhotoUrl = pickedFiles[0] ? URL.createObjectURL(pickedFiles[0]) : null;
    updatePreview(document.querySelector('#sell-form'));
  });

  document.querySelector('#existing-photos')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-remove-photo]');
    if (!btn) return;
    const fig = btn.closest('[data-photo]');
    removedPhotoIds.add(fig.dataset.photo);
    fig.remove();
    updatePreview(document.querySelector('#sell-form'));
  });
}


function bindCatalogSuggestions() {
  const searchInput = document.querySelector('[name="vehicleSearch"]');
  const makeInput = document.querySelector('[name="make"]');
  const modelInput = document.querySelector('[name="model"]');
  const list = document.querySelector('#vehicle-search-list');
  if (!searchInput || !makeInput || !modelInput || !list) return;

  let timer = null;
  let lastSuggestions = [];

  const setVehicle = (make, model, label) => {
    makeInput.value = make || '';
    modelInput.value = model || '';
    if (label) searchInput.value = label;
    makeInput.dispatchEvent(new Event('input', { bubbles: true }));
    modelInput.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const candidateMake = async (term) => {
    const tokens = tokenize(term);
    const makes = await loadCatalogMakes();
    const hit = matchMake(tokens, makes);
    if (hit) return hit.make;
    const quick = await searchMakes(term.split(/\s+/)[0] || term, 8);
    if (quick[0]) return quick[0];
    const q = normName(term.split(/\s+/)[0] || term);
    const localMake = Array.from(new Set((window.AutoSwap.DEMO_CARS || []).map((car) => car.make)))
      .find((name) => normName(name).startsWith(q) || q.startsWith(normName(name)));
    return localMake ? { id: '', name: localMake } : null;
  };

  const suggestionsFor = async (term) => {
    const query = term.trim();
    if (!query) return [];
    const make = await candidateMake(query);
    if (!make) {
      const makes = await searchMakes(query, 8);
      return makes.map((m) => ({ make: m.name, model: '', label: m.name }));
    }
    const makeNorm = normName(make.name);
    const queryNorm = normName(query);
    const modelQuery = queryNorm.startsWith(makeNorm) ? query.slice(make.name.length).trim() : query.split(/\s+/).slice(1).join(' ');
    const localModels = Array.from(new Set((window.AutoSwap.DEMO_CARS || [])
      .filter((car) => car.make.toLowerCase() === make.name.toLowerCase())
      .map((car) => car.model)))
      .filter((model) => !modelQuery || normName(model).includes(normName(modelQuery)) || normName(modelQuery).includes(normName(model)));
    const models = make.id ? await searchModels(modelQuery, make.id, 12) : [];
    const broadModels = models.length || !make.id ? [] : await searchModels('', make.id, 12);
    const rows = models.length ? models : (broadModels.length ? broadModels : localModels.map((name) => ({ name })));
    const output = rows.map((m) => ({ make: make.name, model: m.name, label: `${make.name} ${m.name}`.trim() }));
    output.unshift({ make: make.name, model: modelQuery, label: `${make.name} ${modelQuery}`.trim() });
    return output.filter((item, index, arr) => item.label && arr.findIndex((x) => x.label.toLowerCase() === item.label.toLowerCase()) === index).slice(0, 12);
  };

  const refresh = async () => {
    lastSuggestions = await suggestionsFor(searchInput.value);
    list.innerHTML = lastSuggestions.map((item) => `<option value="${escapeAttr(item.label)}"></option>`).join('');
    const exact = lastSuggestions.find((item) => item.label.toLowerCase() === searchInput.value.trim().toLowerCase());
    if (exact) {
      setVehicle(exact.make, exact.model);
      return;
    }
    const make = await candidateMake(searchInput.value);
    if (make) {
      const makeLabel = make.name;
      const raw = searchInput.value.trim();
      const model = raw.toLowerCase().startsWith(makeLabel.toLowerCase()) ? raw.slice(makeLabel.length).trim() : raw.split(/\s+/).slice(1).join(' ');
      setVehicle(makeLabel, model);
      return;
    }
    setVehicle('', '');
  };

  searchInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(refresh, 160);
  });
  searchInput.addEventListener('change', () => {
    const exact = lastSuggestions.find((item) => item.label.toLowerCase() === searchInput.value.trim().toLowerCase());
    if (exact) setVehicle(exact.make, exact.model, exact.label);
    else refresh();
  });
  if (searchInput.value) refresh();
}


let previewPhotoUrl = null; 

function cashLine(mode, amount) {
  const gel = Number(amount) > 0 ? `${Number(amount).toLocaleString('en-US')} ₾` : '';
  if (mode === 'add_money') return { type: 'add', icon: icons.trendUp, text: gel ? `ამატებს: +${gel}` : 'ამატებს თანხას' };
  if (mode === 'ask_money') return { type: 'ask', icon: icons.trendDown, text: gel ? `ითხოვს: +${gel}` : 'ითხოვს თანხას' };
  if (mode === 'flexible') return { type: 'flexible', icon: icons.swap, text: 'სხვაობა შეთანხმებით' };
  return { type: 'none', icon: icons.equals, text: 'თანაბარი გაცვლა' };
}


function selText(form, name) {
  const s = form.querySelector(`[name="${name}"]`);
  return s && s.selectedOptions && s.selectedOptions[0] ? s.selectedOptions[0].textContent.trim() : '';
}


function computeCompletion(form) {
  const val = (n) => String(new FormData(form).get(n) || '').trim();
  const required = ['make', 'model', 'year', 'mileage', 'fuel', 'transmission'];
  const optional = ['desired', 'description'];
  let done = required.filter((n) => val(n)).length + optional.filter((n) => val(n)).length;
  if (previewPhotoUrl || existingPhotos.some((p) => !removedPhotoIds.has(p.id))) done += 1;
  return Math.round((done / (required.length + optional.length + 1)) * 100);
}

function previewPanelHTML(form) {
  const val = (name) => String(new FormData(form).get(name) || '').trim();
  const title = [val('make'), val('model')].filter(Boolean).join(' ') || 'შენი მანქანა';
  const cash = cashLine(val('cashMode'), val('amount'));
  const photo = previewPhotoUrl
    || (existingPhotos.find((p) => !removedPhotoIds.has(p.id)) || {}).url
    || null;
  const photoCount = pickedFiles.length + existingPhotos.filter((p) => !removedPhotoIds.has(p.id)).length;
  const wants = val('desired').split(',').map((s) => s.trim()).filter(Boolean).join(' / ');
  const desc = val('description');
  const completion = computeCompletion(form);

  const cells = [
    val('year') ? { l: 'წელი', v: val('year') } : null,
    val('mileage') ? { l: 'გარბენი', v: `${Number(val('mileage')).toLocaleString('en-US')} კმ` } : null,
    val('fuel') ? { l: 'საწვავი', v: selText(form, 'fuel') } : null,
    val('transmission') ? { l: 'ტრანსმისია', v: selText(form, 'transmission') } : null,
    val('category') ? { l: 'კატეგორია', v: selText(form, 'category') } : null,
    val('city') ? { l: 'ქალაქი', v: val('city') } : null,
  ].filter(Boolean)
    .map((c) => `<div class="stat-cell"><span>${c.l}</span><strong>${escapeAttr(c.v)}</strong></div>`)
    .join('');

  return `
    <article class="preview-panel">
      <div class="preview-photo">
        ${photo
          ? `<img src="${escapeAttr(photo)}" alt="">`
          : `<div class="preview-photo-empty">${icons.car}<span>დაამატე ფოტო</span></div>`}
        ${photoCount ? `<span class="preview-photo-count">${ICON_CAMERA} ${photoCount} ფოტო</span>` : ''}
      </div>
      <div class="preview-panel-body">
        <div class="preview-panel-head">
          <h3 class="car-row-title">${escapeAttr(title)}${val('year') ? ` <span class="car-row-year">${val('year')}</span>` : ''}</h3>
          <span class="preview-swap-badge">${icons.swap} გაცვლა</span>
        </div>
        <span class="listing-city">${icons.location}${escapeAttr(val('city') || 'ქალაქი')}</span>
        ${cells ? `<div class="stat-row preview-stats">${cells}</div>` : ''}
        <div class="preview-wants"><span class="wanted-label">ეძებს</span><div class="wants-chips">${(wants ? wants.split(' / ') : ['ნებისმიერი']).map((w) => `<span class="want-chip">${escapeAttr(w)}</span>`).join('')}</div></div>
        <p class="trade-cash trade-cash--${cash.type}">${cash.icon}<span>${cash.text}</span></p>
        ${desc ? `<div class="preview-about"><span class="wanted-label">აღწერა</span><p>${escapeAttr(desc)}</p></div>` : ''}
        <div class="preview-progress">
          <div class="preview-progress-meter"><span style="width:${completion}%"></span></div>
          <span class="preview-progress-num">${completion}%</span>
        </div>
        <button class="btn btn-primary preview-publish" type="submit" form="sell-form" id="sell-submit">${icons.swap} ${editId ? 'შენახვა' : 'გამოაქვეყნე განცხადება'}</button>
      </div>
    </article>
  `;
}

function updatePreview(form) {
  const slot = document.querySelector('#sell-preview-card');
  if (slot && form) slot.innerHTML = previewPanelHTML(form);
}



function bindCounter(form) {
  if (!form) return;
  const counter = form.querySelector('#desc-counter');
  const desc = form.querySelector('[name="description"]');
  if (!counter || !desc) return;
  const update = () => { counter.textContent = `${desc.value.length}/2000`; };
  desc.addEventListener('input', update);
  update();
}

function bindPreview(form) {
  if (!form) return;
  updatePreview(form);
  form.addEventListener('input', () => updatePreview(form));
  form.addEventListener('change', () => updatePreview(form));
}

function bindCashAmount(form) {
  if (!form) return;
  const mode = form.querySelector('[name="cashMode"]');
  const amount = form.querySelector('[name="amount"]');
  const field = amount?.closest('.field');
  if (!mode || !amount || !field) return;
  const update = () => {
    const needsAmount = mode.value === 'add_money' || mode.value === 'ask_money';
    field.hidden = !needsAmount;
    amount.required = needsAmount;
    if (!needsAmount) amount.value = '';
    updatePreview(form);
  };
  mode.addEventListener('change', update);
  update();
}


const FUEL_STEMS = { 'ბენზინ': 'petrol', 'დიზელ': 'diesel', 'ჰიბრიდ': 'hybrid', 'ელექტრო': 'electric', 'გაზ': 'lpg' };
const TRANSMISSION_STEMS = { 'ავტომატ': 'automatic', 'მექანიკ': 'manual', 'ტიპტრონიკ': 'tiptronic', 'ვარიატორ': 'variator' };
const CATEGORY_STEMS = { 'სედან': 'sedan', 'ჯიპ': 'suv', 'კროსოვერ': 'crossover', 'ჰეჩბექ': 'hatchback', 'კუპე': 'coupe', 'მინივენ': 'minivan', 'პიკაპ': 'pickup', 'უნივერსალ': 'universal' };
const CITY_STEMS = ['თბილის', 'ბათუმ', 'ქუთაის', 'რუსთავ', 'გორ', 'ზუგდიდ', 'ფოთ', 'თელავ'];

const GE_TO_LAT = {
  ა: 'a', ბ: 'b', გ: 'g', დ: 'd', ე: 'e', ვ: 'v', ზ: 'z', თ: 't', ი: 'i',
  კ: 'k', ლ: 'l', მ: 'm', ნ: 'n', ო: 'o', პ: 'p', ჟ: 'zh', რ: 'r', ს: 's',
  ტ: 't', უ: 'u', ფ: 'f', ქ: 'k', ღ: 'gh', ყ: 'k', შ: 'sh', ჩ: 'ch',
  ც: 'ts', ძ: 'dz', წ: 'ts', ჭ: 'ch', ხ: 'kh', ჯ: 'j', ჰ: 'h',
};


const MAKE_ALIASES = {
  'ბმვ': 'bmw', 'ბემვე': 'bmw', 'მერსედეს': 'mercedesbenz', 'შევროლეტ': 'chevrolet',
  'ფოლკსვაგენ': 'volkswagen', 'ფოლცვაგენ': 'volkswagen', 'ტოიოტ': 'toyota',
  'ჰიუნდა': 'hyundai', 'ჰუნდა': 'hyundai', 'სიტროენ': 'citroen', 'პეჟო': 'peugeot',
  'რენო': 'renault', 'მიცუბიშ': 'mitsubishi', 'დაიჰატსუ': 'daihatsu',
};

function translit(value) {
  return [...String(value).toLowerCase()].map((c) => GE_TO_LAT[c] ?? c).join('');
}

function normName(value) {
  return translit(value).replace(/[^a-z0-9]/g, '');
}

function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

let catalogMakesPromise = null;
function loadCatalogMakes() {
  if (!catalogMakesPromise) {
    catalogMakesPromise = searchMakes('', 500)
      .then((makes) => makes.map((m) => ({ ...m, norm: normName(m.name) })));
  }
  return catalogMakesPromise;
}

const catalogModelsCache = new Map();
function loadCatalogModels(makeId) {
  if (!catalogModelsCache.has(makeId)) {
    catalogModelsCache.set(makeId, searchModels('', makeId, 400)
      .then((models) => models.map((m) => ({ ...m, norm: normName(m.name) }))));
  }
  return catalogModelsCache.get(makeId);
}


const SPEECH_STOP_WORDS = new Set([
  'და', 'ან', 'არის', 'მაქვს', 'მინდა', 'მყავს', 'ეს', 'ის', 'რომ', 'კმ',
  'წლის', 'წელი', 'წელს', 'გარბენი', 'ძრავი', 'ლიტრი', 'მთელი', 'ფერი',
]);





function speechCandidates(tokens) {
  const out = [];
  for (let i = 0; i < tokens.length; i++) {
    if (SPEECH_STOP_WORDS.has(tokens[i])) continue;
    const isLatin = /^[a-z0-9.-]+$/.test(tokens[i]);
    const alias = Object.entries(MAKE_ALIASES).find(([stem]) => tokens[i].startsWith(stem));
    const norm = alias ? alias[1] : normName(tokens[i]);
    if (norm.length >= (isLatin ? 2 : 3)) out.push({ norm, index: i, span: 1 });
    if (i + 1 < tokens.length && !SPEECH_STOP_WORDS.has(tokens[i + 1])) {
      const bigram = normName(tokens[i] + tokens[i + 1]);
      if (bigram.length >= 3) out.push({ norm: bigram, index: i, span: 2 });
    }
  }
  return out;
}


function bestNameMatch(candidate, rows) {
  let best = null;
  for (const row of rows) {
    let cost;
    if (candidate === row.norm) cost = 0;
    else if (row.norm.startsWith(candidate) && candidate.length >= 2) cost = 0.5;
    else {
      const tolerance = candidate.length >= 5 ? 2 : candidate.length >= 3 ? 1 : 0;
      const d = editDistance(candidate, row.norm);
      if (d > tolerance) continue;
      cost = 1 + d;
    }
    if (!best || cost < best.cost) best = { row, cost };
  }
  return best;
}

function matchMake(tokens, makes) {
  let best = null;
  for (const cand of speechCandidates(tokens)) {
    const hit = bestNameMatch(cand.norm, makes);
    if (!hit) continue;
    
    if (!best || hit.cost < best.cost || (hit.cost === best.cost && cand.norm.length > best.norm.length)) {
      best = { make: hit.row, index: cand.index, span: cand.span, cost: hit.cost, norm: cand.norm };
    }
  }
  return best;
}



function matchModel(tokens, afterIndex, models) {
  const windowTokens = tokens.slice(afterIndex, afterIndex + 3);
  let best = null;
  for (const cand of speechCandidates(windowTokens)) {
    const hit = bestNameMatch(cand.norm, models);
    if (!hit) continue;
    if (!best || hit.cost < best.cost || (hit.cost === best.cost && cand.norm.length > best.norm.length)) {
      best = { model: hit.row, cost: hit.cost, norm: cand.norm };
    }
  }
  return best ? best.model : null;
}


const NUM_STEMS = [
  ['ცხრაას', 900], ['რვაას', 800], ['შვიდას', 700], ['ექვსას', 600], ['ხუთას', 500],
  ['ოთხას', 400], ['სამას', 300], ['ორას', 200], ['ას', 100],
  ['თერთმეტ', 11], ['თორმეტ', 12], ['ცამეტ', 13], ['თოთხმეტ', 14], ['თხუთმეტ', 15],
  ['თექვსმეტ', 16], ['ჩვიდმეტ', 17], ['თვრამეტ', 18], ['ცხრამეტ', 19],
  ['ათ', 10], ['ცხრა', 9], ['რვა', 8], ['შვიდ', 7], ['ექვს', 6], ['ხუთ', 5],
  ['ოთხ', 4], ['სამ', 3], ['ორ', 2], ['ერთ', 1],
];
const VIGESIMAL_PREFIXES = [['ოთხმოცდა', 80], ['სამოცდა', 60], ['ორმოცდა', 40], ['ოცდა', 20]];
const VIGESIMAL_TENS = [['ოთხმოც', 80], ['სამოც', 60], ['ორმოც', 40], ['ოც', 20]];

function wordNum(token) {
  if (!token || /\d/.test(token) || token.startsWith('ათას')) return null;
  for (const [prefix, base] of VIGESIMAL_PREFIXES) {
    if (token.startsWith(prefix)) {
      const rest = wordNum(token.slice(prefix.length));
      return rest == null ? base : base + rest;
    }
  }
  for (const [stem, value] of VIGESIMAL_TENS) {
    if (token === stem || token === `${stem}ი`) return value;
  }
  for (const [stem, value] of NUM_STEMS) {
    if (token === stem || token === `${stem}ი`) return value;
  }
  return null;
}



function normalizeNumbers(tokens) {
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    const startsRun = wordNum(token) != null
      || token.startsWith('ათას')
      || (/^\d+$/.test(token) && tokens[i + 1] && tokens[i + 1].startsWith('ათას'));
    if (!startsRun) {
      out.push(token);
      i += 1;
      continue;
    }
    let total = 0;
    let current = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t.startsWith('ათას')) {
        current = (current || 1) * 1000;
        total += current;
        current = 0;
        i += 1;
        continue;
      }
      const w = wordNum(t);
      if (w != null) {
        current += w;
        i += 1;
        continue;
      }
      if (/^\d+$/.test(t) && tokens[i + 1] && tokens[i + 1].startsWith('ათას') && total === 0 && current === 0) {
        current = Number(t);
        i += 1;
        continue;
      }
      break;
    }
    total += current;
    if (total > 0) out.push(String(total));
  }
  return out;
}

function flashField(form, name, value, filled) {
  const input = form.querySelector(`[name="${name}"]`);
  if (!input || value == null || value === '') return;
  input.value = value;
  if (name === 'make' || name === 'model') {
    const vehicleSearch = form.querySelector('[name="vehicleSearch"]');
    const make = form.querySelector('[name="make"]')?.value || '';
    const model = form.querySelector('[name="model"]')?.value || '';
    if (vehicleSearch) vehicleSearch.value = [make, model].filter(Boolean).join(' ');
  }
  input.classList.add('field-flash');
  setTimeout(() => input.classList.remove('field-flash'), 1800);
  filled.push(name);
  
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function matchStem(tokens, stems) {
  for (const [stem, value] of Object.entries(stems)) {
    if (tokens.some((t) => t.startsWith(stem))) return value;
  }
  return null;
}

const FIELD_LABELS = {
  make: 'მარკა', model: 'მოდელი', year: 'წელი', mileage: 'გარბენი',
  fuel: 'საწვავი', transmission: 'ტრანსმისია', category: 'კატეგორია',
  city: 'ქალაქი', engineSize: 'ძრავი',
};



function tokenize(text) {
  const raw = String(text).toLowerCase().split(/[^a-z0-9ა-ჰ.,]+/).filter(Boolean);
  const merged = [];
  for (const t of raw) {
    const prev = merged[merged.length - 1];
    const prevIsYear = prev && prev.length === 4 && Number(prev) >= 1900;
    if (/^\d{3}$/.test(t) && prev && /^\d{1,4}$/.test(prev) && !prevIsYear) {
      merged[merged.length - 1] = prev + t;
    } else {
      merged.push(t);
    }
  }
  return merged;
}

function numberNear(tokens, numbers, idx, test) {
  for (const j of [idx - 1, idx + 1, idx - 2, idx + 2]) {
    if (j >= 0 && j < numbers.length && test(numbers[j])) return numbers[j];
  }
  return null;
}


function spokenEngine(tokens) {
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.startsWith('ნახევარ')) {
      const prev = Number(tokens[i - 1]);
      if (Number.isInteger(prev) && prev > 0 && prev < 10) return prev + 0.5;
    }
    const half = [['ერთნახევარ', 1.5], ['ორნახევარ', 2.5], ['სამნახევარ', 3.5]].find(([s]) => t.startsWith(s));
    if (half) return half[1];
    if (t === 'და' || t.startsWith('მთელ')) {
      const a = Number(tokens[i - 1]);
      const b = Number(tokens[i + 1]);
      if (Number.isInteger(a) && a > 0 && a < 10 && Number.isInteger(b) && b >= 0 && b <= 9) {
        return Number(`${a}.${b}`);
      }
    }
  }
  return null;
}

async function parseTranscript(form, text) {
  const filled = [];
  const tokens = normalizeNumbers(tokenize(text));
  const numbers = tokens.map((t) => Number(t.replace(',', '.')));
  const stemIdx = (stems) => tokens.findIndex((t) => stems.some((s) => t.startsWith(s)));
  const isYear = (n) => Number.isInteger(n) && n >= 1980 && n <= THIS_YEAR + 1;
  const isMileage = (n) => Number.isInteger(n) && n >= 1000 && n <= 2000000;

  
  let engine = spokenEngine(tokens);

  
  let year = null;
  const yearCtx = stemIdx(['წელ', 'წლის']);
  if (yearCtx !== -1) year = numberNear(tokens, numbers, yearCtx, isYear);

  let mileage = null;
  const kmCtx = stemIdx(['გარბენ', 'კილომეტრ', 'კმ']);
  if (kmCtx !== -1) mileage = numberNear(tokens, numbers, kmCtx, (n) => isMileage(n) && n !== year);

  if (engine == null) {
    engine = numbers.find((n) => n > 0.5 && n < 10 && !Number.isInteger(n)) ?? null;
  }
  if (engine == null) {
    const engCtx = stemIdx(['ძრავ', 'ლიტრ']);
    if (engCtx !== -1) engine = numberNear(tokens, numbers, engCtx, (n) => n > 0.5 && n < 10);
  }

  
  if (year == null) year = numbers.find(isYear) ?? null;
  if (mileage == null) mileage = numbers.find((n) => isMileage(n) && n !== year) ?? null;

  if (year != null) flashField(form, 'year', year, filled);
  if (mileage != null) flashField(form, 'mileage', mileage, filled);
  if (engine != null) flashField(form, 'engineSize', engine, filled);

  flashField(form, 'fuel', matchStem(tokens, FUEL_STEMS), filled);
  flashField(form, 'transmission', matchStem(tokens, TRANSMISSION_STEMS), filled);
  flashField(form, 'category', matchStem(tokens, CATEGORY_STEMS), filled);

  const cityIdx = CITY_STEMS.findIndex((stem) => tokens.some((t) => t.startsWith(stem)));
  if (cityIdx !== -1) flashField(form, 'city', CITIES[cityIdx], filled);

  
  try {
    const makes = await loadCatalogMakes();
    const makeHit = matchMake(tokens, makes);
    if (makeHit) {
      flashField(form, 'make', makeHit.make.name, filled);
      const models = await loadCatalogModels(makeHit.make.id);
      const model = matchModel(tokens, makeHit.index + makeHit.span, models);
      if (model) flashField(form, 'model', model.name, filled);
    }
  } catch (_err) {  }

  return filled;
}

function bindVoiceFill(form) {
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  const panel = document.querySelector('#voice-fill');
  if (!panel || !SpeechRecognitionCtor || !form) return;
  panel.hidden = false;

  const btn = panel.querySelector('#voice-btn');
  const hint = panel.querySelector('#voice-hint');
  const defaultHint = hint.textContent;
  let recognition = null;

  const chips = (names) => names.map((n) => `✓ ${FIELD_LABELS[n] || n}`).join(' · ');

  btn.addEventListener('click', () => {
    if (recognition) {
      recognition.stop();
      return;
    }
    recognition = new SpeechRecognitionCtor();
    recognition.lang = 'ka-GE';
    recognition.continuous = true; 
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    let finalText = '';
    let parsedUpto = 0;
    const filledAll = new Set();
    const pendingParses = [];
    let interimActive = false;

    btn.classList.add('is-listening');
    hint.textContent = 'გისმენ… თქვი დეტალები; დასასრულებლად ისევ დააჭირე.';

    const refreshChips = () => {
      if (!interimActive && filledAll.size) hint.textContent = chips([...filledAll]);
    };

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result.isFinal) {
          interim += result[0].transcript;
          continue;
        }
        if (i >= parsedUpto) {
          
          finalText += `${result[0].transcript} `;
          pendingParses.push(parseTranscript(form, result[0].transcript).then((names) => {
            names.forEach((n) => filledAll.add(n));
            refreshChips();
          }));
          parsedUpto = i + 1;
        }
      }
      const heard = interim.trim();
      interimActive = !!heard;
      if (heard) hint.textContent = heard;
      else refreshChips();
    };
    recognition.onerror = (event) => {
      hint.textContent = event.error === 'not-allowed'
        ? 'მიკროფონზე წვდომა აკრძალულია. ჩართე ბრაუზერის ნებართვა.'
        : 'ხმის ამოცნობა ვერ მოხერხდა. სცადე თავიდან.';
    };
    recognition.onend = async () => {
      btn.classList.remove('is-listening');
      recognition = null;
      interimActive = false;
      const text = finalText.trim();
      if (!text) {
        if (hint.textContent.startsWith('გისმენ')) hint.textContent = defaultHint;
        return;
      }
      await Promise.allSettled(pendingParses);
      
      const desc = form.querySelector('[name="description"]');
      if (desc && !desc.value.trim()) {
        desc.value = text;
        desc.dispatchEvent(new Event('input', { bubbles: true }));
      }
      hint.textContent = filledAll.size
        ? `${chips([...filledAll])}. გადაამოწმე და შეასწორე.`
        : 'ველები ვერ ამოვიცანი. ნათქვამი ჩავწერე აღწერაში.';
      toast(filledAll.size ? `ხმით შეივსო ${filledAll.size} ველი` : 'ჩაწერა აღწერაში გადავიდა');
    };

    try {
      recognition.start();
    } catch (_err) {
      btn.classList.remove('is-listening');
      recognition = null;
    }
  });
}


function readForm(form) {
  const data = new FormData(form);
  const str = (name) => String(data.get(name) || '').trim();
  const num = (name) => (data.get(name) === null || str(name) === '' ? null : Number(data.get(name)));
  const typedVehicle = str('vehicleSearch');
  const typedParts = typedVehicle.split(/\s+/).filter(Boolean);
  const typedMake = typedParts[0] || '';
  const typedModel = typedParts.slice(1).join(' ');
  return {
    make: str('make') || typedMake,
    model: str('model') || typedModel,
    year: num('year'),
    mileage: num('mileage'),
    fuel_type: str('fuel'),
    transmission: str('transmission'),
    category: str('category') || null,
    condition: str('condition') || 'good',
    city: str('city'),
    engine_size: num('engineSize'),
    description: str('description') || null,
    cash_mode: str('cashMode') || 'none',
    cash_amount: num('amount') || 0,
    desired: str('desired'),
  };
}

function validate(values) {
  if (!values.make || !values.model) return 'მარკა და მოდელი სავალდებულოა.';
  if (!values.year || values.year < 1980 || values.year > THIS_YEAR + 1) return `წელი უნდა იყოს 1980-${THIS_YEAR + 1} შუალედში.`;
  if (values.mileage == null || values.mileage < 0) return 'გარბენი უნდა იყოს დადებითი რიცხვი.';
  if (!values.fuel_type || !values.transmission) return 'საწვავი და ტრანსმისია სავალდებულოა.';
  if (values.cash_amount < 0) return 'თანხა ვერ იქნება უარყოფითი.';
  if ((values.cash_mode === 'add_money' || values.cash_mode === 'ask_money') && values.cash_amount <= 0) {
    return 'თანხის სხვაობისთვის მიუთითე თანხა.';
  }
  return null;
}

// Downscale + re-encode photos in the browser before upload so listings stay
// fast and storage costs stay low. Falls back to the original file if the
// browser can't decode it or compression doesn't actually help.
const MAX_IMAGE_DIM = 1600;
const IMAGE_QUALITY = 0.82;

async function compressImage(file) {
  if (!file.type.startsWith('image/') || typeof createImageBitmap !== 'function') return file;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch (_err) {
    return file;
  }
  const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const supportsWebp = canvas.toDataURL('image/webp').startsWith('data:image/webp');
  const outType = supportsWebp ? 'image/webp' : 'image/jpeg';
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outType, IMAGE_QUALITY));
  // Keep the original when re-encoding failed or made the file bigger.
  if (!blob || blob.size >= file.size) return file;
  const ext = outType === 'image/webp' ? 'webp' : 'jpg';
  const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
  return new File([blob], `${base}.${ext}`, { type: outType });
}

async function uploadPhotos(vehicleId, files, startPosition) {
  let position = startPosition;
  for (const original of files) {
    const file = await compressImage(original);
    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `vehicles/${vehicleId}/${crypto.randomUUID()}.${ext}`;
    const { error: upError } = await sb.storage.from('vehicle-photos').upload(path, file, {
      contentType: file.type,
      cacheControl: '31536000',
    });
    if (upError) throw new Error(`ფოტო ვერ აიტვირთა: ${upError.message}`);
    const { data: pub } = sb.storage.from('vehicle-photos').getPublicUrl(path);
    const { error: rowError } = await sb.from('vehicle_photos').insert({
      vehicle_id: vehicleId,
      url: pub.publicUrl,
      position,
    });
    if (rowError) throw new Error(`ფოტოს შენახვა ვერ მოხერხდა: ${rowError.message}`);
    position += 1;
  }
}

async function persist(user, values) {
  const vehiclePayload = {
    make: values.make,
    model: values.model,
    year: values.year,
    mileage: values.mileage,
    fuel_type: values.fuel_type,
    transmission: values.transmission,
    category: values.category,
    condition: values.condition,
    city: values.city,
    engine_size: values.engine_size,
    description: values.description,
  };

  let vehicleId = editId;
  if (editId) {
    const { error } = await sb.from('vehicles').update(vehiclePayload).eq('id', editId);
    if (error) throw new Error(error.message);
  } else {
    const { data, error } = await sb
      .from('vehicles')
      .insert({ ...vehiclePayload, owner_id: user.id, status: 'active', listing_type: 'swap' })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    vehicleId = data.id;
  }

  
  if (removedPhotoIds.size) {
    const doomed = existingPhotos.filter((p) => removedPhotoIds.has(p.id));
    await sb.from('vehicle_photos').delete().in('id', doomed.map((p) => p.id));
    const paths = doomed
      .map((p) => (p.url.split('/vehicle-photos/')[1] || '').split('?')[0])
      .filter(Boolean);
    if (paths.length) await sb.storage.from('vehicle-photos').remove(paths);
  }
  if (pickedFiles.length) {
    const keptPositions = existingPhotos
      .filter((p) => !removedPhotoIds.has(p.id))
      .map((p) => p.position);
    const startPosition = keptPositions.length ? Math.max(...keptPositions) + 1 : 0;
    await uploadPhotos(vehicleId, pickedFiles, startPosition);
  }

  
  const { error: prefsError } = await sb.from('swap_preferences').upsert({
    vehicle_id: vehicleId,
    cash_mode: values.cash_mode,
    cash_amount: values.cash_mode === 'none' || values.cash_mode === 'flexible' ? 0 : values.cash_amount,
  }, { onConflict: 'vehicle_id' });
  if (prefsError) throw new Error(prefsError.message);

  await sb.from('desired_vehicles').delete().eq('vehicle_id', vehicleId);
  const labels = values.desired.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 5);
  if (labels.length) {
    const { error: wantsError } = await sb
      .from('desired_vehicles')
      .insert(labels.map((label) => ({ vehicle_id: vehicleId, label })));
    if (wantsError) throw new Error(wantsError.message);
  }

  return vehicleId;
}


async function renderReal(user) {
  let vehicle = null;
  let prefs = null;
  let wantsValue = '';

  if (editId) {
    const { data, error } = await sb
      .from('vehicles')
      .select('*, vehicle_photos(id, url, position), swap_preferences(cash_mode, cash_amount), desired_vehicles(label)')
      .eq('id', editId)
      .eq('owner_id', user.id)
      .maybeSingle();
    if (error || !data) {
      document.querySelector('#app').innerHTML = GatePanel(
        'განცხადება ვერ მოიძებნა',
        'ეს განცხადება არ არსებობს ან შენი არ არის.',
        '<a class="btn btn-primary" href="account.html">ჩემი განცხადებები</a>',
      );
      return;
    }
    vehicle = data;
    prefs = Array.isArray(data.swap_preferences) ? data.swap_preferences[0] : data.swap_preferences;
    wantsValue = (data.desired_vehicles || []).map((d) => d.label).join(', ');
    existingPhotos = (data.vehicle_photos || []).sort((a, b) => a.position - b.position);
  }

  document.querySelector('#app').innerHTML = SellPage(vehicle, prefs, wantsValue);
  bindSellMode();
  bindUploadZone();
  bindCatalogSuggestions();
  bindVoiceFill(document.querySelector('#sell-form'));
  bindPreview(document.querySelector('#sell-form'));
  bindCashAmount(document.querySelector('#sell-form'));
  bindCounter(document.querySelector('#sell-form'));

  const form = document.querySelector('#sell-form');
  const errorBox = document.querySelector('#sell-error');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = readForm(form);
    const problem = validate(values);
    if (problem) {
      errorBox.textContent = problem;
      errorBox.hidden = false;
      errorBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    errorBox.hidden = true;

    const submit = document.querySelector('#sell-submit');
    submit.disabled = true;
    submit.textContent = 'ინახება…';

    try {
      const vehicleId = await persist(user, values);
      bustListingCaches();
      toast(editId ? 'განცხადება განახლდა' : 'განცხადება გამოქვეყნდა');
      window.location.href = `vehicle.html?id=${vehicleId}`;
    } catch (err) {
      submit.disabled = false;
      submit.textContent = editId ? 'შენახვა' : 'გამოაქვეყნე განცხადება';
      errorBox.textContent = `შენახვა ვერ მოხერხდა: ${err.message}`;
      errorBox.hidden = false;
      console.error('AutoSwap: listing save failed', err);
    }
  });
}




function renderLocked() {
  document.querySelector('#app').innerHTML = SellPage(null, null, '');
  bindSellMode();
  bindCatalogSuggestions();
  updatePreview(document.querySelector('#sell-form'));
  bindCashAmount(document.querySelector('#sell-form'));
  bindCounter(document.querySelector('#sell-form'));
  const section = document.querySelector('.sell');
  section.classList.add('sell-locked');
  const overlay = document.createElement('div');
  overlay.className = 'sell-locked-overlay';
  overlay.innerHTML = `
    <div class="sell-locked-card">
      <span class="sell-locked-lock">${icons.shield}</span>
      <h2>დაამატე მანქანა ერთ ნაბიჯში</h2>
      <p>შეთავაზებები პირდაპირ შენთან მოვა.</p>
      <button class="btn btn-accent auth-submit" type="button" data-auth-open>შესვლა SMS კოდით</button>
      <small class="sell-locked-note">რეგისტრაცია არ გჭირდება ცალკე.</small>
    </div>`;
  section.appendChild(overlay);
  
  onAuth((user) => {
    if (user) window.location.reload();
  });
}

function renderDemo() {
  document.querySelector('#app').innerHTML = SellPage(null, null, '');
  bindSellMode();
  bindUploadZone();
  bindCatalogSuggestions();
  bindVoiceFill(document.querySelector('#sell-form'));
  bindPreview(document.querySelector('#sell-form'));
  bindCashAmount(document.querySelector('#sell-form'));
  bindCounter(document.querySelector('#sell-form'));
  document.querySelector('#sell-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    document.querySelector('#app').innerHTML = DemoSuccess(
      String(data.get('make') || '').trim(),
      String(data.get('model') || '').trim(),
    );
    window.scrollTo(0, 0);
  });
}

async function init() {
  if (!sb) {
    renderDemo();
    return;
  }
  const user = await authReady;
  if (!user) {
    
    
    const demoUser = getAuthUser();
    if (demoUser && demoUser.demo) {
      renderDemo();
      return;
    }
    renderLocked();
    return;
  }
  renderReal(user);
}

init();
