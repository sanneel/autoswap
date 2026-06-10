/* AutoSwap — add-listing page (demo).
   Styled listing form; on submit shows a friendly demo success panel. No
   persistence yet — wires to Supabase once keys + auth are configured. */
const { Header, Footer, icons } = window.AutoSwap;

function SellForm() {
  return `
    ${Header({ active: 'sell' })}
    <main class="sell-shell">
      <section class="container sell">
        <div class="sell-head">
          <p class="section-kicker">განცხადების დამატება</p>
          <h1>დაამატე შენი ავტომობილი</h1>
          <p class="sell-sub">აღწერე მანქანა და რა გინდა სანაცვლოდ — განცხადება გამოჩნდება გაცვლების ფიდში.</p>
        </div>

        <form class="sell-form" id="sell-form">
          <div class="sell-section">
            <h2>ავტომობილი</h2>
            <div class="sell-grid">
              <label class="field"><span>მარკა *</span><input name="make" required placeholder="BMW"></label>
              <label class="field"><span>მოდელი *</span><input name="model" required placeholder="530i"></label>
              <label class="field"><span>წელი *</span><input name="year" type="number" min="1980" max="2100" required placeholder="2020"></label>
              <label class="field"><span>გარბენი (კმ) *</span><input name="mileage" type="number" min="0" required placeholder="90000"></label>
              <label class="field"><span>საწვავი</span>
                <select name="fuel">
                  <option value="petrol">ბენზინი</option>
                  <option value="diesel">დიზელი</option>
                  <option value="hybrid">ჰიბრიდი</option>
                  <option value="electric">ელექტრო</option>
                  <option value="lpg">გაზი</option>
                </select>
              </label>
              <label class="field"><span>ტრანსმისია</span>
                <select name="transmission">
                  <option value="automatic">ავტომატიკა</option>
                  <option value="manual">მექანიკა</option>
                </select>
              </label>
              <label class="field"><span>კატეგორია</span>
                <select name="category">
                  <option value="sedan">სედანი</option>
                  <option value="suv">ჯიპი</option>
                  <option value="crossover">კროსოვერი</option>
                  <option value="hatchback">ჰეჩბექი</option>
                  <option value="coupe">კუპე</option>
                </select>
              </label>
              <label class="field"><span>ქალაქი *</span>
                <select name="city">
                  <option value="თბილისი">თბილისი</option>
                  <option value="ბათუმი">ბათუმი</option>
                  <option value="ქუთაისი">ქუთაისი</option>
                </select>
              </label>
            </div>
          </div>

          <div class="sell-section">
            <h2>რა გინდა სანაცვლოდ</h2>
            <div class="sell-grid">
              <label class="field"><span>სასურველი მანქანა</span><input name="desired" placeholder="Audi A6 ან Mercedes E-Class"></label>
              <label class="field"><span>თანხის სხვაობა</span>
                <select name="cashMode">
                  <option value="none">თანხის გარეშე</option>
                  <option value="add">ვამატებ თანხას</option>
                  <option value="ask">ვითხოვ თანხას</option>
                  <option value="flexible">შეთანხმებით</option>
                </select>
              </label>
              <label class="field"><span>თანხა (₾)</span><input name="amount" type="number" min="0" placeholder="0"></label>
            </div>
          </div>

          <div class="sell-section">
            <h2>დეტალები</h2>
            <label class="field"><span>აღწერა</span><textarea name="description" rows="4" placeholder="მოკლე აღწერა მანქანის მდგომარეობაზე..."></textarea></label>
            <div class="field">
              <span>ფოტოები</span>
              <label class="upload-zone" id="upload-zone">
                <input name="photos" type="file" accept="image/*" multiple class="upload-input">
                <span class="upload-icon">${icons.plus}</span>
                <span class="upload-text"><strong>ატვირთე ფოტოები</strong><small>მაქს. 6 · პირველი ხდება მთავარი ფოტო</small></span>
              </label>
              <div class="upload-previews" id="upload-previews" hidden></div>
            </div>
          </div>

          <div class="sell-actions">
            <a class="btn btn-ghost" href="cars.html">გაუქმება</a>
            <button class="btn btn-primary" type="submit">${icons.plus} გამოაქვეყნე განცხადება</button>
          </div>
        </form>
      </section>
    </main>
    ${Footer()}
  `;
}

function SuccessPanel(make, model) {
  const name = make ? `${make} ${model}`.trim() : 'შენი ავტომობილი';
  return `
    ${Header({ active: 'sell' })}
    <main class="sell-shell">
      <section class="container sell-success-page">
        <div class="sell-success-card">
          <span class="offer-success-icon">${icons.check}</span>
          <h1>შენი განცხადება მიღებულია 🎉</h1>
          <p>${name} დაემატა და გამოქვეყნდება გაცვლების ფიდში ბექენდის ჩართვისთანავე.</p>
          <p class="offer-demo-note">დემო რეჟიმი — განცხადება ამ ეტაპზე ჯერ არ ინახება.</p>
          <div class="sell-success-actions">
            <a class="btn btn-primary" href="cars.html">ნახე გაცვლები</a>
            <a class="btn btn-ghost" href="sell.html">დაამატე კიდევ ერთი</a>
          </div>
        </div>
      </section>
    </main>
    ${Footer()}
  `;
}

const MAX_PHOTOS = 6;

// Thumbnail previews for the picked photos (first = cover, max 6).
function bindUploadZone() {
  const input = document.querySelector('.upload-input');
  const previews = document.querySelector('#upload-previews');
  if (!input || !previews) return;

  input.addEventListener('change', () => {
    previews.querySelectorAll('img').forEach((img) => URL.revokeObjectURL(img.src));
    const files = Array.from(input.files || []).slice(0, MAX_PHOTOS);
    previews.innerHTML = files
      .map((file, i) => `
        <figure class="upload-preview">
          <img src="${URL.createObjectURL(file)}" alt="ფოტო ${i + 1}">
          ${i === 0 ? '<figcaption>მთავარი</figcaption>' : ''}
        </figure>
      `)
      .join('');
    previews.hidden = !files.length;
  });
}

function render() {
  document.querySelector('#app').innerHTML = SellForm();
  bindUploadZone();
  document.querySelector('#sell-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const make = String(data.get('make') || '').trim();
    const model = String(data.get('model') || '').trim();
    document.querySelector('#app').innerHTML = SuccessPanel(make, model);
    window.scrollTo(0, 0);
  });
}

render();
