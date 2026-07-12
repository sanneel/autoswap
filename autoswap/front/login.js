/* AutoSwap — login / registration page.
   Sign-in methods: Google OAuth, or Georgian phone number with
   a one-time SMS code (account auto-created on first login). Email auth is
   intentionally removed — the number is the marketplace identity, and OAuth
   users are asked to attach one right after (shared.js maybeRequirePhone).
   ?next=<page> sends the user back where they came from. */
const {
  Header, Footer, icons, sb, toast, escapeAttr, authReady,
  signInWithProvider, normalizePhone, requestPhoneOtp, confirmPhoneOtp, AUTH_DEMO_CODE,
} = window.AutoSwap;

const RESEND_COOLDOWN_S = 60;

// Only same-directory pages are valid redirect targets.
function nextTarget() {
  const raw = new URLSearchParams(window.location.search).get('next') || '';
  if (!raw || raw.includes('//') || raw.includes('..') || !/^[\w.-]+\.html(\?[^#]*)?(#[\w/-]*)?$/.test(raw)) {
    return 'account.html';
  }
  return raw;
}

function Shell(inner) {
  return `
    ${Header({ active: 'account' })}
    <main class="auth-shell">
      <section class="container auth">
        <div class="auth-card">${inner}</div>
      </section>
    </main>
    ${Footer()}
  `;
}

function PhoneStep(phone, error) {
  return Shell(`
    <span class="auth-icon">${icons.swap}</span>
    <h1>შესვლა ან რეგისტრაცია</h1>
    <p class="auth-sub">გააგრძელე Google-ით, ან შეიყვანე ნომერი — გამოგიგზავნით ერთჯერად SMS კოდს.</p>
    <div class="auth-providers">
      <button type="button" class="btn-provider btn-google" data-provider="google">${icons.google}<span>Google-ით გაგრძელება</span></button>
    </div>
    <div class="auth-divider"><span>ან ნომრით</span></div>
    ${error ? `<p class="auth-error" role="alert">${escapeAttr(error)}</p>` : ''}
    <form class="auth-form" id="phone-form" novalidate>
      <label class="field">
        <span>ტელეფონის ნომერი (+995)</span>
        <input type="tel" name="phone" required autocomplete="tel-national" inputmode="tel"
               placeholder="5XX XX XX XX" value="${escapeAttr(phone || '')}">
      </label>
      <button class="btn btn-primary auth-submit" type="submit">გამომიგზავნე კოდი</button>
    </form>
    <p class="auth-note">პირველი შესვლისას ანგარიში ავტომატურად შეიქმნება.</p>
    <button type="button" class="auth-link-btn auth-demo-btn" data-auth-demo>სცადე დემო ანგარიშით — SMS-ის გარეშე</button>
  `);
}

function CodeStep(phone, isDemo, error) {
  return Shell(`
    <span class="auth-icon">${icons.check}</span>
    <h1>შეიყვანე კოდი</h1>
    <p class="auth-sub">კოდი გაიგზავნა ნომერზე <strong>${escapeAttr(phone)}</strong>.${isDemo ? ` დემო რეჟიმი — შეიყვანე კოდი <strong>${AUTH_DEMO_CODE}</strong>.` : ' კოდი მოქმედებს 5 წუთის განმავლობაში.'}</p>
    ${error ? `<p class="auth-error" role="alert">${escapeAttr(error)}</p>` : ''}
    <form class="auth-form" id="code-form" novalidate>
      <label class="field">
        <span>ერთჯერადი კოდი</span>
        <input type="text" name="code" required inputmode="numeric" autocomplete="one-time-code"
               maxlength="6" placeholder="0000" class="auth-code-input">
      </label>
      <button class="btn btn-primary auth-submit" type="submit">შესვლა</button>
    </form>
    <div class="auth-secondary">
      <button type="button" class="auth-link" id="resend-btn" disabled>კოდის თავიდან გაგზავნა (<span id="resend-count">${RESEND_COOLDOWN_S}</span>)</button>
      <button type="button" class="auth-link" id="change-phone">სხვა ნომერი</button>
    </div>
  `);
}

let currentPhone = '';
let currentIsDemo = false;
let resendTimer = null;

function friendlyError(message) {
  const msg = String(message || '');
  if (/rate limit|too many|security purposes/i.test(msg)) {
    return 'ძალიან ბევრი მცდელობა — დაიცადე ცოტა ხანი და სცადე თავიდან.';
  }
  if (/expired|invalid/i.test(msg)) {
    return 'კოდი არასწორია ან ვადა გაუვიდა — სცადე თავიდან.';
  }
  return msg || 'რაღაც შეცდომა მოხდა — სცადე თავიდან.';
}

function startResendCooldown() {
  const btn = document.querySelector('#resend-btn');
  const count = document.querySelector('#resend-count');
  if (!btn || !count) return;
  let left = RESEND_COOLDOWN_S;
  btn.disabled = true;
  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    left -= 1;
    if (left <= 0) {
      clearInterval(resendTimer);
      btn.disabled = false;
      btn.textContent = 'კოდის თავიდან გაგზავნა';
      return;
    }
    count.textContent = String(left);
  }, 1000);
}

function bindProviders() {
  document.querySelectorAll('.btn-provider').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const { error } = await signInWithProvider(btn.dataset.provider);
      if (error) {
        btn.disabled = false;
        renderPhoneStep(friendlyError(error));
      }
      // On success the browser navigates away to the provider.
    });
  });
}

function renderPhoneStep(error) {
  document.querySelector('#app').innerHTML = PhoneStep(currentPhone, error);
  bindProviders();
  // Try-it-out account: local demo session, no SMS round-trip.
  document.querySelector('[data-auth-demo]')?.addEventListener('click', async () => {
    await confirmPhoneOtp('+995555000000', AUTH_DEMO_CODE, true);
    toast('დემო ანგარიშით შეხვედი — ტესტირებისთვის');
    window.location.href = 'index.html';
  });
  const form = document.querySelector('#phone-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const raw = String(new FormData(form).get('phone') || '').trim();
    const phone = normalizePhone(raw);
    if (!phone) {
      currentPhone = raw;
      renderPhoneStep('შეიყვანე ქართული მობილურის ნომერი ფორმატით 5XX XX XX XX.');
      return;
    }
    form.querySelector('[type="submit"]').disabled = true;
    // Account is auto-created on first login; the name popup follows the
    // first verified sign-in (shared.js maybeRequireProfile).
    const result = await requestPhoneOtp(phone);
    if (result.error) {
      currentPhone = raw;
      renderPhoneStep(friendlyError(result.error));
      return;
    }
    currentPhone = phone;
    currentIsDemo = !!result.demo;
    renderCodeStep();
  });
  form.querySelector('[name="phone"]').focus();
}

function renderCodeStep(error) {
  document.querySelector('#app').innerHTML = CodeStep(currentPhone, currentIsDemo, error);
  startResendCooldown();

  const form = document.querySelector('#code-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = String(new FormData(form).get('code') || '').trim();
    if (!/^\d{4,6}$/.test(code)) {
      renderCodeStep('შეიყვანე SMS კოდი.');
      return;
    }
    form.querySelector('[type="submit"]').disabled = true;
    const result = await confirmPhoneOtp(currentPhone, code, currentIsDemo);
    if (result.error) {
      renderCodeStep(friendlyError(result.error));
      return;
    }
    toast('შესვლა წარმატებულია');
    // Demo sessions can browse but not write — gated pages would bounce
    // them straight back here, so land on the catalog instead.
    window.location.replace(currentIsDemo ? 'cars.html' : nextTarget());
  });

  document.querySelector('#resend-btn').addEventListener('click', async (event) => {
    event.currentTarget.disabled = true;
    const result = await requestPhoneOtp(currentPhone);
    if (result.error) {
      renderCodeStep(friendlyError(result.error));
      return;
    }
    currentIsDemo = !!result.demo;
    toast('ახალი კოდი გაიგზავნა');
    renderCodeStep();
  });

  document.querySelector('#change-phone').addEventListener('click', () => {
    clearInterval(resendTimer);
    renderPhoneStep();
  });

  form.querySelector('[name="code"]').focus();
}

async function init() {
  const user = await authReady;
  if (user) {
    window.location.replace(nextTarget());
    return;
  }
  // Without Supabase the phone flow still works in the labelled demo mode,
  // so the page renders either way.
  renderPhoneStep();
}

init();
