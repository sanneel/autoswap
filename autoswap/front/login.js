/* AutoSwap — OTP login / registration.
   Email → 6-digit one-time code → session. Supabase Auth generates the code,
   stores only its hash, expires it (set to 5 min in the dashboard) and
   rate-limits requests; supabase-js keeps the JWT + refresh token rotating.
   ?next=<page> sends the user back where they came from. */
const {
  Header, Footer, icons, sb, toast,
  requestEmailOtp, verifyEmailOtp, authReady, escapeAttr,
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

function EmailStep(email, error) {
  return Shell(`
    <span class="auth-icon">${icons.shield}</span>
    <h1>შესვლა ან რეგისტრაცია</h1>
    <p class="auth-sub">შეიყვანე ელფოსტა — გამოგიგზავნით 6-ნიშნა ერთჯერად კოდს. პაროლი არ გჭირდება.</p>
    ${error ? `<p class="auth-error" role="alert">${escapeAttr(error)}</p>` : ''}
    <form class="auth-form" id="email-form" novalidate>
      <label class="field">
        <span>ელფოსტა</span>
        <input type="email" name="email" required autocomplete="email" inputmode="email"
               placeholder="you@example.com" value="${escapeAttr(email || '')}">
      </label>
      <button class="btn btn-primary auth-submit" type="submit">გამომიგზავნე კოდი</button>
    </form>
    <p class="auth-note">პირველი შესვლისას ანგარიში ავტომატურად შეიქმნება.</p>
  `);
}

function CodeStep(email, error) {
  return Shell(`
    <span class="auth-icon">${icons.check}</span>
    <h1>შეიყვანე კოდი</h1>
    <p class="auth-sub">6-ნიშნა კოდი გაიგზავნა <strong>${escapeAttr(email)}</strong>-ზე. კოდი მოქმედებს 5 წუთის განმავლობაში.</p>
    ${error ? `<p class="auth-error" role="alert">${escapeAttr(error)}</p>` : ''}
    <form class="auth-form" id="code-form" novalidate>
      <label class="field">
        <span>ერთჯერადი კოდი</span>
        <input type="text" name="code" required inputmode="numeric" autocomplete="one-time-code"
               pattern="\\d{6}" maxlength="6" placeholder="000000" class="auth-code-input">
      </label>
      <button class="btn btn-primary auth-submit" type="submit">შესვლა</button>
    </form>
    <div class="auth-secondary">
      <button type="button" class="auth-link" id="resend-btn" disabled>კოდის თავიდან გაგზავნა (<span id="resend-count">${RESEND_COOLDOWN_S}</span>)</button>
      <button type="button" class="auth-link" id="change-email">სხვა ელფოსტა</button>
    </div>
  `);
}

function NotConfigured() {
  return Shell(`
    <span class="auth-icon">${icons.shield}</span>
    <h1>დემო რეჟიმი</h1>
    <p class="auth-sub">ავტორიზაცია ჩაირთვება Supabase-ის კონფიგურაციის შემდეგ — შექმენი <code>front/supabase-config.js</code> ფაილი <code>supabase-config.example.js</code>-ის მიხედვით.</p>
    <a class="btn btn-primary auth-submit" href="cars.html">გაცვლების ნახვა</a>
  `);
}

let currentEmail = '';
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

function renderEmailStep(error) {
  document.querySelector('#app').innerHTML = EmailStep(currentEmail, error);
  const form = document.querySelector('#email-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = String(new FormData(form).get('email') || '').trim().toLowerCase();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      renderEmailStep('შეიყვანე სწორი ელფოსტა.');
      return;
    }
    form.querySelector('[type="submit"]').disabled = true;
    const { error: otpError } = await requestEmailOtp(email);
    if (otpError) {
      currentEmail = email;
      renderEmailStep(friendlyError(otpError));
      return;
    }
    currentEmail = email;
    renderCodeStep();
  });
  form.querySelector('[name="email"]').focus();
}

function renderCodeStep(error) {
  document.querySelector('#app').innerHTML = CodeStep(currentEmail, error);
  startResendCooldown();

  const form = document.querySelector('#code-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = String(new FormData(form).get('code') || '').trim();
    if (!/^\d{6}$/.test(code)) {
      renderCodeStep('კოდი 6 ციფრისგან შედგება.');
      return;
    }
    form.querySelector('[type="submit"]').disabled = true;
    const { user, error: verifyError } = await verifyEmailOtp(currentEmail, code);
    if (verifyError || !user) {
      renderCodeStep(friendlyError(verifyError));
      return;
    }
    toast('შესვლა წარმატებულია');
    window.location.replace(nextTarget());
  });

  document.querySelector('#resend-btn').addEventListener('click', async (event) => {
    event.currentTarget.disabled = true;
    const { error: otpError } = await requestEmailOtp(currentEmail);
    if (otpError) {
      renderCodeStep(friendlyError(otpError));
      return;
    }
    toast('ახალი კოდი გაიგზავნა');
    renderCodeStep();
  });

  document.querySelector('#change-email').addEventListener('click', () => {
    clearInterval(resendTimer);
    renderEmailStep();
  });

  form.querySelector('[name="code"]').focus();
}

async function init() {
  if (!sb) {
    document.querySelector('#app').innerHTML = NotConfigured();
    return;
  }
  const user = await authReady;
  if (user) {
    window.location.replace(nextTarget());
    return;
  }
  renderEmailStep();
}

init();
