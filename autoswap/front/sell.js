/* AutoSwap — add / edit listing page.
   Signed in + Supabase configured → real create/edit: vehicle row, photos in
   the vehicle-photos bucket, swap_preferences (cash terms) and
   desired_vehicles (wants). Without Supabase the page degrades to the old
   demo submit. Edit mode: sell.html?id=<own vehicle uuid>. */
const {
  Header, Footer, icons, sb, toast, escapeAttr, isUuid,
  authReady, getAuthUser, onAuth, openAuthModal,
  bustListingCaches, searchMakes, searchModels, FUEL_LABELS,
} = window.AutoSwap;

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const THIS_YEAR = new Date().getFullYear();
const CITIES = ['თბილისი', 'ბათუმი', 'ქუთაისი', 'რუსთავი', 'გორი', 'ზუგდიდი', 'ფოთი', 'თელავი'];

const editId = (() => {
  const raw = new URLSearchParams(window.location.search).get('id') || '';
  return isUuid(raw) ? raw : '';
})();

let existingPhotos = []; // [{id, url, position}] in edit mode
let removedPhotoIds = new Set();
let currentStep = 1;

// Step icons not in the shared set.
const ICON_DOC = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"></path><path d="M14 3v4h4"></path><path d="M9 13h6M9 16.5h6"></path></svg>';
const ICON_CAMERA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8.5a2 2 0 0 1 2-2h1.6L8 4.5h8l1.4 2H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"></path><circle cx="12" cy="12.8" r="3.4"></circle></svg>';
const ICON_CHEVRON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"></path></svg>';

// The five steps — titles reuse existing in-app Georgian terms verbatim.
const STEPS = [
  { num: 1, title: 'ავტომობილი', icon: icons.car },
  { num: 2, title: 'რა გინდა სანაცვლოდ', icon: icons.swap },
  { num: 3, title: 'აღწერა', icon: ICON_DOC },
  { num: 4, title: 'ფოტოები', icon: ICON_CAMERA },
  { num: 5, title: 'გადახედვა', icon: icons.check },
];

/* One step panel: a clickable header (badge · icon · title) over an
   expandable body. The active step's body is open; the rest collapse. */
function stepSection(step, bodyHTML, footHTML) {
  return `
    <section class="sell-step${step.num === currentStep ? ' is-active' : ''}" data-step="${step.num}">
      <button type="button" class="sell-step-head" data-step-go="${step.num}" aria-expanded="${step.num === currentStep}">
        <span class="sell-step-badge">${step.num}</span>
        <span class="sell-step-icon">${step.icon}</span>
        <span class="sell-step-title">${step.title}</span>
        <span class="sell-step-chevron">${ICON_CHEVRON}</span>
      </button>
      <div class="sell-step-body">
        ${bodyHTML}
        ${footHTML ? `<div class="sell-step-foot">${footHTML}</div>` : ''}
      </div>
    </section>
  `;
}

// Step footer: back (previous step's title) on the left, continue (next
// step's title) on the right. Both labels reuse existing step titles, so
// no new copy is written. "continue" validates the current step first.
function stepFoot(step) {
  const prev = STEPS[step.num - 2];
  const next = STEPS[step.num];
  const back = prev
    ? `<button type="button" class="btn btn-ghost step-back" data-step-go="${prev.num}">${icons.arrowRight} ${prev.title}</button>`
    : '<span></span>';
  if (step.num === STEPS.length) {
    return `${back}<a class="btn btn-ghost" href="${editId ? 'account.html' : 'cars.html'}">გაუქმება</a>`;
  }
  return `${back}<button type="button" class="btn btn-primary step-next" data-step-go="${next.num}" data-from="${step.num}">${next.title} ${icons.arrowRight}</button>`;
}

function fieldRows(vehicle, prefs, wantsValue) {
  const v = vehicle || {};
  const p = prefs || {};
  const sel = (value, current) => (String(value) === String(current ?? '') ? ' selected' : '');

  const carBody = `
    <div class="voice-fill" id="voice-fill" hidden>
      <button type="button" class="voice-btn" id="voice-btn" aria-label="ხმით შევსება">${icons.mic}</button>
      <div class="voice-copy">
        <strong>შეავსე ხმით</strong>
        <small id="voice-hint">დააჭირე მიკროფონს და თქვი: „BMW 530, 2020 წელი, 90 ათასი კმ, ბენზინი, ავტომატიკა, თბილისი“</small>
      </div>
    </div>

    <div class="sell-subgroup">
      <h4 class="sell-subgroup-title">ძირითადი ინფორმაცია</h4>
      <div class="sell-grid">
        <label class="field"><span>მარკა *</span>
          <input name="make" required placeholder="BMW" list="make-list" value="${escapeAttr(v.make || '')}" autocomplete="off">
          <datalist id="make-list"></datalist></label>
        <label class="field"><span>მოდელი *</span>
          <input name="model" required placeholder="530i" list="model-list" value="${escapeAttr(v.model || '')}" autocomplete="off">
          <datalist id="model-list"></datalist></label>
        <label class="field"><span>წელი *</span><input name="year" type="number" min="1980" max="${THIS_YEAR + 1}" required placeholder="2020" value="${v.year ?? ''}"></label>
        <label class="field"><span>ქალაქი *</span>
          <select name="city">
            ${CITIES.map((c) => `<option value="${c}"${sel(c, v.city)}>${c}</option>`).join('')}
          </select>
        </label>
      </div>
    </div>

    <div class="sell-subgroup">
      <h4 class="sell-subgroup-title">ტექნიკური ინფორმაცია</h4>
      <div class="sell-grid">
        <label class="field"><span>გარბენი (კმ) *</span><input name="mileage" type="number" min="0" max="2000000" required placeholder="90000" value="${v.mileage ?? ''}"></label>
        <label class="field"><span>საწვავი *</span>
          <select name="fuel" required>
            <option value="petrol"${sel('petrol', v.fuel_type)}>ბენზინი</option>
            <option value="diesel"${sel('diesel', v.fuel_type)}>დიზელი</option>
            <option value="hybrid"${sel('hybrid', v.fuel_type)}>ჰიბრიდი</option>
            <option value="electric"${sel('electric', v.fuel_type)}>ელექტრო</option>
            <option value="lpg"${sel('lpg', v.fuel_type)}>გაზი</option>
          </select>
        </label>
        <label class="field"><span>ტრანსმისია *</span>
          <select name="transmission" required>
            <option value="automatic"${sel('automatic', v.transmission)}>ავტომატიკა</option>
            <option value="manual"${sel('manual', v.transmission)}>მექანიკა</option>
            <option value="tiptronic"${sel('tiptronic', v.transmission)}>ტიპტრონიკი</option>
            <option value="variator"${sel('variator', v.transmission)}>ვარიატორი</option>
          </select>
        </label>
        <label class="field"><span>ძრავი (ლ)</span>
          <input name="engineSize" type="number" min="0.1" max="9.9" step="0.1" placeholder="2.0" value="${v.engine_size ?? ''}"></label>
        <label class="field"><span>კატეგორია</span>
          <select name="category">
            <option value="sedan"${sel('sedan', v.category)}>სედანი</option>
            <option value="suv"${sel('suv', v.category)}>ჯიპი</option>
            <option value="crossover"${sel('crossover', v.category)}>კროსოვერი</option>
            <option value="hatchback"${sel('hatchback', v.category)}>ჰეჩბექი</option>
            <option value="coupe"${sel('coupe', v.category)}>კუპე</option>
            <option value="minivan"${sel('minivan', v.category)}>მინივენი</option>
            <option value="pickup"${sel('pickup', v.category)}>პიკაპი</option>
            <option value="universal"${sel('universal', v.category)}>უნივერსალი</option>
          </select>
        </label>
      </div>
    </div>
    <p class="auth-error sell-step-error" data-step-error="1" hidden></p>
    <input type="hidden" name="condition" value="${escapeAttr(v.condition || 'good')}">
  `;

  const termsBody = `
    <div class="sell-grid">
      <label class="field"><span>სასურველი მანქანა</span>
        <input name="desired" placeholder="Audi A6, Mercedes E-Class" value="${escapeAttr(wantsValue || '')}">
      </label>
      <label class="field"><span>თანხის სხვაობა</span>
        <select name="cashMode">
          <option value="none"${sel('none', p.cash_mode)}>თანხის გარეშე</option>
          <option value="add_money"${sel('add_money', p.cash_mode)}>ვამატებ თანხას</option>
          <option value="ask_money"${sel('ask_money', p.cash_mode)}>ვითხოვ თანხას</option>
          <option value="flexible"${sel('flexible', p.cash_mode)}>შეთანხმებით</option>
        </select>
      </label>
      <label class="field"><span>თანხა (₾)</span><input name="amount" type="number" min="0" placeholder="0" value="${p.cash_amount || ''}"></label>
    </div>
  `;

  const descBody = `
    <label class="field"><span>აღწერა</span><textarea name="description" rows="4" maxlength="2000" placeholder="მოკლე აღწერა მანქანის მდგომარეობაზე…">${escapeAttr(v.description || '')}</textarea></label>
  `;

  const photosBody = `
    <div class="field">
      ${existingPhotos.length ? `<div class="upload-previews upload-previews--existing" id="existing-photos">
        ${existingPhotos.map((photo) => `
          <figure class="upload-preview" data-photo="${photo.id}">
            <img src="${escapeAttr(photo.url)}" alt="">
            <button type="button" class="upload-remove" data-remove-photo aria-label="ფოტოს წაშლა">&times;</button>
          </figure>`).join('')}
      </div>` : ''}
      <label class="upload-zone" id="upload-zone">
        <input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple class="upload-input">
        <span class="upload-icon">${icons.plus}</span>
        <span class="upload-text"><strong>ატვირთე ფოტოები</strong><small>მაქს. ${MAX_PHOTOS} · JPG/PNG/WebP · ≤5MB · პირველი ხდება მთავარი</small></span>
      </label>
      <div class="upload-previews" id="upload-previews" hidden></div>
    </div>
  `;

  const reviewBody = `
    <p class="sell-review-note">${editId ? 'შეცვალე დეტალები — ცვლილებები მაშინვე გამოჩნდება ფიდში.' : 'აღწერე მანქანა და რა გინდა სანაცვლოდ — განცხადება გამოჩნდება გაცვლების ფიდში.'}</p>
  `;

  return [
    stepSection(STEPS[0], carBody, stepFoot(STEPS[0])),
    stepSection(STEPS[1], termsBody, stepFoot(STEPS[1])),
    stepSection(STEPS[2], descBody, stepFoot(STEPS[2])),
    stepSection(STEPS[3], photosBody, stepFoot(STEPS[3])),
    stepSection(STEPS[4], reviewBody, stepFoot(STEPS[4])),
  ].join('');
}

function StepNav() {
  return `
    <nav class="step-nav" aria-label="ნაბიჯები">
      ${STEPS.map((s) => `
        <button type="button" class="step-nav-item${s.num === currentStep ? ' is-active' : ''}" data-step-go="${s.num}">
          <span class="step-nav-icon">${s.icon}</span>
          <span class="step-nav-text"><b>${s.num}</b><span>${s.title}</span></span>
        </button>`).join('')}
    </nav>
  `;
}

function SellPage(vehicle, prefs, wantsValue) {
  return `
    ${Header({ active: 'sell' })}
    <main class="sell-shell sell-shell--stepper">
      <section class="container sell sell--stepper">
        <a class="sell-back" href="${editId ? 'account.html' : 'cars.html'}">${icons.arrowRight}${editId ? 'ჩემი განცხადებები' : 'გაცვლები'}</a>
        <div class="sell-headline">
          <h1>${editId ? 'განცხადების რედაქტირება' : 'დაამატე შენი ავტომობილი'}</h1>
          <p class="sell-sub">${editId ? 'შეცვალე დეტალები — ცვლილებები მაშინვე გამოჩნდება ფიდში.' : 'აღწერე მანქანა და რა გინდა სანაცვლოდ — განცხადება გამოჩნდება გაცვლების ფიდში.'}</p>
        </div>
        <div class="sell-stepper-grid">
          ${StepNav()}
          <form class="sell-form" id="sell-form" novalidate>
            ${fieldRows(vehicle, prefs, wantsValue)}
            <p class="auth-error" id="sell-error" role="alert" hidden></p>
          </form>
          <aside class="sell-preview" aria-label="განცხადების გადახედვა">
            <p class="sell-preview-label">ასე გამოჩნდება ფიდში</p>
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

/* ---- demo fallback (Supabase not configured) ---- */
function DemoSuccess(make, model) {
  const name = make ? `${make} ${model}`.trim() : 'შენი ავტომობილი';
  return GatePanel(
    'დემო რეჟიმი — განცხადება არ შენახულა',
    `${escapeAttr(name)} ფიდში ვერ მოხვდება, რადგან შენი სესია სატესტოა (SMS კოდი 1234). რეალური შენახვისთვის საჭიროა ნამდვილი ავტორიზაცია — ჩართე Google/Apple პროვაიდერი ან SMS პროვაიდერი Supabase-ის დეშბორდში და შედი თავიდან.`,
    '<a class="btn btn-primary" href="login.html?next=sell.html">ნამდვილი შესვლა</a><a class="btn btn-ghost" href="cars.html">ნახე გაცვლები</a>',
  );
}

/* ---- photo picking ---- */
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

/* ---- catalog-backed datalists ---- */
function bindCatalogSuggestions() {
  const makeInput = document.querySelector('[name="make"]');
  const modelInput = document.querySelector('[name="model"]');
  const makeList = document.querySelector('#make-list');
  const modelList = document.querySelector('#model-list');
  if (!makeInput || !makeList) return;

  let makeId = null;
  let timer = null;

  const fillMakes = async (term) => {
    const makes = await searchMakes(term, 12);
    makeList.innerHTML = makes.map((m) => `<option value="${escapeAttr(m.name)}"></option>`).join('');
    const exact = makes.find((m) => m.name.toLowerCase() === makeInput.value.trim().toLowerCase());
    makeId = exact ? exact.id : null;
    if (modelList) modelList.innerHTML = '';
    if (makeId && modelInput) fillModels(modelInput.value);
  };

  const fillModels = async (term) => {
    if (!makeId || !modelList) return;
    const models = await searchModels(term, makeId, 16);
    modelList.innerHTML = models.map((m) => `<option value="${escapeAttr(m.name)}"></option>`).join('');
  };

  makeInput.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => fillMakes(makeInput.value), 200);
  });
  modelInput?.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => fillModels(modelInput.value), 200);
  });
  if (makeInput.value) fillMakes(makeInput.value);
}

/* ---- live card preview: the form mirrored as a feed card ---- */
let previewPhotoUrl = null; // objectURL of the first picked file

function cashLine(mode, amount) {
  const gel = Number(amount) > 0 ? `${Number(amount).toLocaleString('en-US')} ₾` : '';
  if (mode === 'add_money') return { type: 'add', icon: icons.trendUp, text: gel ? `ამატებს: +${gel}` : 'ამატებს თანხას' };
  if (mode === 'ask_money') return { type: 'ask', icon: icons.trendDown, text: gel ? `ითხოვს: +${gel}` : 'ითხოვს თანხას' };
  if (mode === 'flexible') return { type: 'flexible', icon: icons.swap, text: 'სხვაობა შეთანხმებით' };
  return { type: 'none', icon: icons.equals, text: 'თანაბარი გაცვლა' };
}

// The exact Georgian label shown for a <select> value.
function selText(form, name) {
  const s = form.querySelector(`[name="${name}"]`);
  return s && s.selectedOptions && s.selectedOptions[0] ? s.selectedOptions[0].textContent.trim() : '';
}

// Listing completion: required fields + a couple of "nice to have" ones.
function computeCompletion(form) {
  const val = (n) => String(new FormData(form).get(n) || '').trim();
  const required = ['make', 'model', 'year', 'mileage', 'fuel', 'transmission', 'city'];
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

/* ---- Step navigation: expand one step, collapse the rest ---- */
function bindStepper(form) {
  if (!form) return;
  const root = document.querySelector('.sell--stepper');
  if (!root) return;
  const steps = [...form.querySelectorAll('.sell-step')];

  const setStep = (num) => {
    currentStep = num;
    steps.forEach((s) => {
      const on = Number(s.dataset.step) === num;
      s.classList.toggle('is-active', on);
      s.querySelector('.sell-step-head')?.setAttribute('aria-expanded', String(on));
    });
    document.querySelectorAll('.step-nav-item').forEach((it) => {
      const n = Number(it.dataset.stepGo);
      it.classList.toggle('is-active', n === num);
      it.classList.toggle('is-done', n < num);
    });
  };

  // Required fields live entirely in step 1, so only "continue" out of
  // step 1 needs a gate — it reuses the full validator's Georgian message.
  const showStepError = (fromStep, message) => {
    const box = form.querySelector(`[data-step-error="${fromStep}"]`);
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
    box.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const firstEmpty = ['make', 'model', 'year', 'mileage', 'fuel', 'transmission', 'city']
      .map((n) => form.querySelector(`[name="${n}"]`))
      .find((el) => el && !String(el.value).trim());
    firstEmpty?.focus();
  };
  const clearStepError = (fromStep) => {
    const box = form.querySelector(`[data-step-error="${fromStep}"]`);
    if (box) box.hidden = true;
  };

  // Editing any field dismisses a showing step error — it stops nagging.
  form.addEventListener('input', () => {
    form.querySelectorAll('.sell-step-error:not([hidden])').forEach((box) => { box.hidden = true; });
  });

  root.addEventListener('click', (event) => {
    const go = event.target.closest('[data-step-go]');
    if (!go || !root.contains(go)) return;
    event.preventDefault();

    // Forward "continue" validates the step it leaves; back / rail jump free.
    if (go.classList.contains('step-next')) {
      const from = Number(go.dataset.from);
      if (from === 1) {
        const problem = validate(readForm(form));
        if (problem) { showStepError(1, problem); return; }
        clearStepError(1);
      }
    }

    const num = Number(go.dataset.stepGo);
    setStep(num);
    const active = steps.find((s) => Number(s.dataset.step) === num);
    if (active && !go.classList.contains('step-nav-item')) {
      active.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  setStep(currentStep);
}

function bindPreview(form) {
  if (!form) return;
  updatePreview(form);
  form.addEventListener('input', () => updatePreview(form));
  form.addEventListener('change', () => updatePreview(form));
}

/* ---- voice fill: speak the listing, the form types itself ----
   Web Speech API (Chrome/Edge/Safari), lang ka-GE. One tap records an
   utterance; the transcript is parsed into form fields (year, mileage,
   fuel, transmission, category, city, make/model, engine size) and the
   raw text lands in the description so nothing said is lost. */
const FUEL_STEMS = { 'ბენზინ': 'petrol', 'დიზელ': 'diesel', 'ჰიბრიდ': 'hybrid', 'ელექტრო': 'electric', 'გაზ': 'lpg' };
const TRANSMISSION_STEMS = { 'ავტომატ': 'automatic', 'მექანიკ': 'manual', 'ტიპტრონიკ': 'tiptronic', 'ვარიატორ': 'variator' };
const CATEGORY_STEMS = { 'სედან': 'sedan', 'ჯიპ': 'suv', 'კროსოვერ': 'crossover', 'ჰეჩბექ': 'hatchback', 'კუპე': 'coupe', 'მინივენ': 'minivan', 'პიკაპ': 'pickup', 'უნივერსალ': 'universal' };
const CITY_STEMS = ['თბილის', 'ბათუმ', 'ქუთაის', 'რუსთავ', 'გორ', 'ზუგდიდ', 'ფოთ', 'თელავ'];
/* Make/model come ONLY from the catalog (car_makes / car_models): speech is
   fuzzy-matched against real DB rows, so "BM" resolves to BMW and nothing
   that doesn't exist in the catalog is ever written into the fields. */
const GE_TO_LAT = {
  ა: 'a', ბ: 'b', გ: 'g', დ: 'd', ე: 'e', ვ: 'v', ზ: 'z', თ: 't', ი: 'i',
  კ: 'k', ლ: 'l', მ: 'm', ნ: 'n', ო: 'o', პ: 'p', ჟ: 'zh', რ: 'r', ს: 's',
  ტ: 't', უ: 'u', ფ: 'f', ქ: 'k', ღ: 'gh', ყ: 'k', შ: 'sh', ჩ: 'ch',
  ც: 'ts', ძ: 'dz', წ: 'ts', ჭ: 'ch', ხ: 'kh', ჯ: 'j', ჰ: 'h',
};

// Georgian spellings whose transliteration lands too far from the Latin name.
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

// Common Georgian function/domain words never name a car.
const SPEECH_STOP_WORDS = new Set([
  'და', 'ან', 'არის', 'მაქვს', 'მინდა', 'მყავს', 'ეს', 'ის', 'რომ', 'კმ',
  'წლის', 'წელი', 'წელს', 'გარბენი', 'ძრავი', 'ლიტრი', 'მთელი', 'ფერი',
]);

// Spoken-token candidates: single tokens and two-token spans ("alfa romeo",
// "e class"), normalized; Georgian aliases applied first. Short candidates
// are only trusted when typed in Latin ("BM") — short Georgian words are
// function words, not car names.
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

// exact > prefix (≥2 chars) > small edit distance; null when nothing is close.
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
    // Prefer cheaper matches; on ties, longer spoken evidence wins.
    if (!best || hit.cost < best.cost || (hit.cost === best.cost && cand.norm.length > best.norm.length)) {
      best = { make: hit.row, index: cand.index, span: cand.span, cost: hit.cost, norm: cand.norm };
    }
  }
  return best;
}

// The model is spoken right after the make — match the next few tokens
// against that make's real model list only.
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

/* ---- Georgian spoken numbers → digits ----
   "ორი ათას თვრამეტი" → 2018, "ას ოცი ათასი" → 120000, "ოცდახუთი" → 25. */
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

// Collapses runs of spoken numbers (words, and a digit multiplier before
// "ათასი") into single digit tokens, so the rest of the parser sees digits.
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
  input.classList.add('field-flash');
  setTimeout(() => input.classList.remove('field-flash'), 1800);
  filled.push(name);
  // Programmatic .value writes don't fire events — the live preview needs one.
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

// Speech spells big numbers as groups ("180 000") — glue them back together.
// A 4-digit year never swallows a following group.
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

// Spoken engine sizes: "ორი და ხუთი" / "2 მთელი 5" → 2.5, "ორნახევარი" → 2.5.
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

  // Spoken decimals first — they would otherwise read as separate integers.
  let engine = spokenEngine(tokens);

  // Context keywords beat bare-number guessing: "2012 წლის", "გარბენი 180000".
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

  // Fallback heuristics for bare numbers.
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

  // Make/model only from the catalog — never write unvalidated text.
  try {
    const makes = await loadCatalogMakes();
    const makeHit = matchMake(tokens, makes);
    if (makeHit) {
      flashField(form, 'make', makeHit.make.name, filled);
      const models = await loadCatalogModels(makeHit.make.id);
      const model = matchModel(tokens, makeHit.index + makeHit.span, models);
      if (model) flashField(form, 'model', model.name, filled);
    }
  } catch (_err) { /* catalog unavailable — leave make/model for typing */ }

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
    recognition.continuous = true; // keep listening through pauses, stop on tap
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
          // Each finalized chunk fills fields immediately — while you talk.
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
      if (heard) hint.textContent = `🎙 ${heard}`;
      else refreshChips();
    };
    recognition.onerror = (event) => {
      hint.textContent = event.error === 'not-allowed'
        ? 'მიკროფონზე წვდომა აკრძალულია — ჩართე ბრაუზერის ნებართვა.'
        : 'ხმის ამოცნობა ვერ მოხერხდა — სცადე თავიდან.';
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
      // Nothing said gets lost: the whole transcript lands in the description.
      const desc = form.querySelector('[name="description"]');
      if (desc && !desc.value.trim()) {
        desc.value = text;
        desc.dispatchEvent(new Event('input', { bubbles: true }));
      }
      hint.textContent = filledAll.size
        ? `${chips([...filledAll])} — გადაამოწმე და შეასწორე.`
        : 'ველები ვერ ამოვიცანი — ნათქვამი ჩავწერე აღწერაში.';
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

/* ---- validation + persistence ---- */
function readForm(form) {
  const data = new FormData(form);
  const str = (name) => String(data.get(name) || '').trim();
  const num = (name) => (data.get(name) === null || str(name) === '' ? null : Number(data.get(name)));
  return {
    make: str('make'),
    model: str('model'),
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
  if (!values.year || values.year < 1980 || values.year > THIS_YEAR + 1) return `წელი უნდა იყოს 1980–${THIS_YEAR + 1} შუალედში.`;
  if (values.mileage == null || values.mileage < 0) return 'გარბენი უნდა იყოს დადებითი რიცხვი.';
  if (!values.fuel_type || !values.transmission) return 'საწვავი და ტრანსმისია სავალდებულოა.';
  if (!values.city) return 'ქალაქი სავალდებულოა.';
  if (values.cash_amount < 0) return 'თანხა ვერ იქნება უარყოფითი.';
  return null;
}

async function uploadPhotos(vehicleId, files, startPosition) {
  let position = startPosition;
  for (const file of files) {
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

  // Photos: remove the ones the user deleted, then append new ones.
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

  // Swap terms (1:1) + wants (replace wholesale).
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

/* ---- page bootstrap ---- */
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
  bindUploadZone();
  bindCatalogSuggestions();
  bindVoiceFill(document.querySelector('#sell-form'));
  bindPreview(document.querySelector('#sell-form'));
  bindStepper(document.querySelector('#sell-form'));

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

// Signed out: the real form stays visible behind a soft gate. We do NOT
// auto-pop the auth modal — the gate reads as the next step, and the CTA
// opens login when the user is ready.
function renderLocked() {
  document.querySelector('#app').innerHTML = SellPage(null, null, '');
  updatePreview(document.querySelector('#sell-form'));
  bindStepper(document.querySelector('#sell-form'));
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
  // Any successful sign-in (real or demo) unlocks the page.
  onAuth((user) => {
    if (user) window.location.reload();
  });
}

function renderDemo() {
  document.querySelector('#app').innerHTML = SellPage(null, null, '');
  bindUploadZone();
  bindVoiceFill(document.querySelector('#sell-form'));
  bindPreview(document.querySelector('#sell-form'));
  bindStepper(document.querySelector('#sell-form'));
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
    // A demo session (SMS provider not configured) has no JWT, so it cannot
    // write to Supabase — give it the labelled demo form, not a login wall.
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
