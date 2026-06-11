/* AutoSwap — add / edit listing page.
   Signed in + Supabase configured → real create/edit: vehicle row, photos in
   the vehicle-photos bucket, swap_preferences (cash terms) and
   desired_vehicles (wants). Without Supabase the page degrades to the old
   demo submit. Edit mode: sell.html?id=<own vehicle uuid>. */
const {
  Header, Footer, icons, sb, toast, escapeAttr, isUuid,
  authReady, bustListingCaches, searchMakes, searchModels,
} = window.AutoSwap;

const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const THIS_YEAR = new Date().getFullYear();

const editId = (() => {
  const raw = new URLSearchParams(window.location.search).get('id') || '';
  return isUuid(raw) ? raw : '';
})();

let existingPhotos = []; // [{id, url, position}] in edit mode
let removedPhotoIds = new Set();

function fieldRows(vehicle, prefs, wantsValue) {
  const v = vehicle || {};
  const p = prefs || {};
  const sel = (value, current) => (String(value) === String(current ?? '') ? ' selected' : '');
  return `
    <div class="sell-section">
      <h2>ავტომობილი</h2>
      <div class="sell-grid">
        <label class="field"><span>მარკა *</span>
          <input name="make" required placeholder="BMW" list="make-list" value="${escapeAttr(v.make || '')}" autocomplete="off">
          <datalist id="make-list"></datalist></label>
        <label class="field"><span>მოდელი *</span>
          <input name="model" required placeholder="530i" list="model-list" value="${escapeAttr(v.model || '')}" autocomplete="off">
          <datalist id="model-list"></datalist></label>
        <label class="field"><span>წელი *</span><input name="year" type="number" min="1980" max="${THIS_YEAR + 1}" required placeholder="2020" value="${v.year ?? ''}"></label>
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
        <label class="field"><span>მდგომარეობა *</span>
          <select name="condition" required>
            <option value="excellent"${sel('excellent', v.condition)}>იდეალური</option>
            <option value="good"${sel('good', v.condition) || (!v.condition ? ' selected' : '')}>კარგი</option>
            <option value="fair"${sel('fair', v.condition)}>საშუალო</option>
            <option value="needs_work"${sel('needs_work', v.condition)}>საჭიროებს შეკეთებას</option>
          </select>
        </label>
        <label class="field"><span>ქალაქი *</span>
          <select name="city">
            ${['თბილისი', 'ბათუმი', 'ქუთაისი', 'რუსთავი', 'გორი', 'ზუგდიდი', 'ფოთი', 'თელავი']
              .map((c) => `<option value="${c}"${sel(c, v.city)}>${c}</option>`).join('')}
          </select>
        </label>
        <label class="field"><span>სავარაუდო ღირებულება (₾) *</span>
          <input name="estimatedValue" type="number" min="1" required placeholder="35000" value="${v.estimated_value ?? ''}"></label>
        <label class="field"><span>ძრავი (ლ)</span>
          <input name="engineSize" type="number" min="0.1" max="9.9" step="0.1" placeholder="2.0" value="${v.engine_size ?? ''}"></label>
        <label class="field"><span>ცხ. ძალა</span>
          <input name="powerHp" type="number" min="1" max="2000" placeholder="190" value="${v.power_hp ?? ''}"></label>
        <label class="field"><span>ფერი</span>
          <input name="color" maxlength="30" placeholder="შავი" value="${escapeAttr(v.color || '')}"></label>
      </div>
    </div>

    <div class="sell-section">
      <h2>რა გინდა სანაცვლოდ</h2>
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
    </div>

    <div class="sell-section">
      <h2>დეტალები</h2>
      <label class="field"><span>აღწერა</span><textarea name="description" rows="4" maxlength="2000" placeholder="მოკლე აღწერა მანქანის მდგომარეობაზე...">${escapeAttr(v.description || '')}</textarea></label>
      <div class="field">
        <span>ფოტოები</span>
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
    </div>
  `;
}

function SellPage(vehicle, prefs, wantsValue) {
  return `
    ${Header({ active: 'sell' })}
    <main class="sell-shell">
      <section class="container sell">
        <div class="sell-head">
          <h1>${editId ? 'განცხადების რედაქტირება' : 'დაამატე შენი ავტომობილი'}</h1>
          <p class="sell-sub">${editId ? 'შეცვალე დეტალები — ცვლილებები მაშინვე გამოჩნდება ფიდში.' : 'აღწერე მანქანა და რა გინდა სანაცვლოდ — განცხადება გამოჩნდება გაცვლების ფიდში.'}</p>
        </div>
        <form class="sell-form" id="sell-form" novalidate>
          ${fieldRows(vehicle, prefs, wantsValue)}
          <p class="auth-error" id="sell-error" role="alert" hidden></p>
          <div class="sell-actions">
            <a class="btn btn-ghost" href="${editId ? 'account.html' : 'cars.html'}">გაუქმება</a>
            <button class="btn btn-primary" type="submit" id="sell-submit">${icons.plus} ${editId ? 'შენახვა' : 'გამოაქვეყნე განცხადება'}</button>
          </div>
        </form>
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
    'შენი განცხადება მიღებულია 🎉',
    `${escapeAttr(name)} დაემატება გაცვლების ფიდში ბექენდის ჩართვისთანავე. <span class="offer-demo-note">დემო რეჟიმი — განცხადება ჯერ არ ინახება.</span>`,
    '<a class="btn btn-primary" href="cars.html">ნახე გაცვლები</a><a class="btn btn-ghost" href="sell.html">დაამატე კიდევ ერთი</a>',
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
  });

  document.querySelector('#existing-photos')?.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-remove-photo]');
    if (!btn) return;
    const fig = btn.closest('[data-photo]');
    removedPhotoIds.add(fig.dataset.photo);
    fig.remove();
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
    condition: str('condition'),
    city: str('city'),
    estimated_value: num('estimatedValue'),
    engine_size: num('engineSize'),
    power_hp: num('powerHp'),
    color: str('color') || null,
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
  if (!values.city || !values.condition) return 'ქალაქი და მდგომარეობა სავალდებულოა.';
  if (!values.estimated_value || values.estimated_value <= 0) return 'მიუთითე სავარაუდო ღირებულება.';
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
    estimated_value: values.estimated_value,
    engine_size: values.engine_size,
    power_hp: values.power_hp,
    color: values.color,
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
    submit.textContent = 'ინახება...';

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

function renderDemo() {
  document.querySelector('#app').innerHTML = SellPage(null, null, '');
  bindUploadZone();
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
    const next = encodeURIComponent(`sell.html${editId ? `?id=${editId}` : ''}`);
    document.querySelector('#app').innerHTML = GatePanel(
      'ჯერ შესვლაა საჭირო',
      'განცხადების დასამატებლად შედი ერთჯერადი კოდით — ისე, რომ შეთავაზებები შენთან მოვიდეს.',
      `<a class="btn btn-primary" href="login.html?next=${next}">შესვლა კოდით</a><a class="btn btn-ghost" href="cars.html">გაცვლების ნახვა</a>`,
    );
    return;
  }
  renderReal(user);
}

init();
