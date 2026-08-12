/* AutoSwap, login / registration page.
   Sign-in methods: Google OAuth, or Georgian phone number with
   a one-time SMS code (account auto-created on first login). Email auth is
   intentionally removed, the number is the marketplace identity, and OAuth
   users are asked to attach one right after (shared.js maybeRequirePhone).
   ?next=<page> sends the user back where they came from. */
const {
  Header, Footer, icons, sb, toast, escapeAttr, authReady,
  signInWithProvider, normalizePhone, requestPhoneOtp, confirmPhoneOtp, AUTH_DEMO_CODE,
  autofillOtpFromSms, channelPickerHTML, bindChannelPicker,
} = window.AutoSwap;

const RESEND_COOLDOWN_S = 60;

// Only same-directory pages are valid redirect targets.
function nextTarget() {
  const raw = new URLSearchParams(window.location.search).get('next') || '';
  if (!raw || raw.includes('//') || raw.includes('..') || !/^[\w.-]+\.html(\?[^#]*)?(#[\w/-]*)?$/.test(raw)) {
    return '/account';
  }
  return raw;
}

function Shell(inner) {
  return `
    ${Header({ active: 'account', currency: true })}
    <main class="auth-shell">
      <section class="container auth">
        <div class="auth-card">${inner}</div>
      </section>
    </main>
    ${Footer({ active: 'account' })}
  `;
}

function PhoneStep(phone, error) {
  return Shell(`
    <span class="auth-icon">${icons.swap}</span>
    <h1>შესვლა ან რეგისტრაცია</h1>
    <p class="auth-sub">გააგრძელე Google-ით, ან შეიყვანე ნომერი, გამოგიგზავნით ერთჯერად კოდს SMS-ით ან WhatsApp-ით.</p>
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
      <div class="field">
        <span>კოდი მივიღო</span>
        ${channelPickerHTML()}
      </div>
      <button class="btn btn-primary auth-submit" type="submit">გამომიგზავნე კოდი</button>
    </form>
    <p class="auth-note">პირველი შესვლისას ანგარიში ავტომატურად შეიქმნება.</p>
    <button type="button" class="auth-link-btn auth-demo-btn" data-auth-demo>სცადე დემო ანგარიშით, SMS-ის გარეშე</button>
  `);
}

function CodeStep(phone, isDemo, error) {
  return Shell(`
    <span class="auth-icon">${icons.check}</span>
    <h1>შეიყვანე კოდი</h1>
    <p class="auth-sub">კოდი გაიგზავნა ${currentChannel === 'whatsapp' ? 'WhatsApp-ით' : 'SMS-ით'} ნომერზე <strong>${escapeAttr(phone)}</strong>.${isDemo ? ` დემო რეჟიმი, შეიყვანე კოდი <strong>${AUTH_DEMO_CODE}</strong>.` : ' კოდი მოქმედებს 5 წუთის განმავლობაში.'}</p>
    ${currentFellBack ? '<p class="auth-note">WhatsApp ამ ნომრისთვის მიუწვდომელია, კოდი SMS-ით გაიგზავნა.</p>' : ''}
    ${error ? `<p class="auth-error" role="alert">${escapeAttr(error)}</p>` : ''}
    <form class="auth-form" id="code-form" novalidate>
      <label class="field">
        <span>ერთჯერადი კოდი</span>
        <input type="text" name="code" required inputmode="numeric" pattern="[0-9]*"
               autocomplete="one-time-code" data-lpignore="true" data-1p-ignore
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
// verify.ge binds the code to a requestId; the server exchanges that for the
// session. Null means the legacy Supabase path, which verifies client-side.
let currentRequestId = null;
// Mirrors shared.js's default; the real value arrives with the send response,
// which reports the channel actually used rather than the one requested.
let currentChannel = 'whatsapp';
// True when WhatsApp was asked for but the provider delivered SMS instead.
let currentFellBack = false;
let readChannel = () => currentChannel;

function friendlyError(message) {
  const msg = String(message || '');
  if (/rate limit|too many|security purposes/i.test(msg)) {
    return 'ძალიან ბევრი მცდელობა, დაიცადე ცოტა ხანი და სცადე თავიდან.';
  }
  if (/expired|invalid/i.test(msg)) {
    return 'კოდი არასწორია ან ვადა გაუვიდა, სცადე თავიდან.';
  }
  return msg || 'რაღაც შეცდომა მოხდა, სცადე თავიდან.';
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
  readChannel = bindChannelPicker(document.querySelector('#phone-form'));
  // Try-it-out account: local demo session, no SMS round-trip.
  document.querySelector('[data-auth-demo]')?.addEventListener('click', async () => {
    await confirmPhoneOtp('+995555000000', AUTH_DEMO_CODE, true);
    toast('დემო ანგარიშით შეხვედი, ტესტირებისთვის');
    window.location.href = '/';
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
    const channel = readChannel();
    const result = await requestPhoneOtp(phone, channel);
    if (result.error) {
      currentPhone = raw;
      renderPhoneStep(friendlyError(result.error));
      return;
    }
    currentPhone = phone;
    currentIsDemo = !!result.demo;
    currentRequestId = result.requestId || null;
    currentChannel = result.channel || channel;
    currentFellBack = !!result.fellBack;
    renderCodeStep();
  });
  form.querySelector('[name="phone"]').focus();
}

function renderCodeStep(error) {
  document.querySelector('#app').innerHTML = CodeStep(currentPhone, currentIsDemo, error);
  startResendCooldown();

  const form = document.querySelector('#code-form');
  // Autofill's requestSubmit() and the user's own tap can both fire; the
  // requestId is single-use, so the loser would flash an error over a sign-in
  // that actually succeeded.
  let verifying = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (verifying) return;
    const code = String(new FormData(form).get('code') || '').trim();
    if (!/^\d{4,6}$/.test(code)) {
      renderCodeStep('შეიყვანე SMS კოდი.');
      return;
    }
    verifying = true;
    form.querySelector('[type="submit"]').disabled = true;
    const result = await confirmPhoneOtp(currentPhone, code, currentIsDemo, currentRequestId);
    if (result.error) {
      renderCodeStep(friendlyError(result.error));
      return;
    }
    toast('შესვლა წარმატებულია');
    // Demo sessions can browse but not write, gated pages would bounce
    // them straight back here, so land on the catalog instead.
    window.location.replace(currentIsDemo ? '/cars' : nextTarget());
  });

  document.querySelector('#resend-btn').addEventListener('click', async (event) => {
    event.currentTarget.disabled = true;
    const result = await requestPhoneOtp(currentPhone, currentChannel);
    if (result.error) {
      renderCodeStep(friendlyError(result.error));
      return;
    }
    currentIsDemo = !!result.demo;
    // A resend mints a fresh code under a new requestId; the old one is dead.
    currentRequestId = result.requestId || null;
    currentChannel = result.channel || currentChannel;
    currentFellBack = !!result.fellBack;
    toast('ახალი კოდი გაიგზავნა');
    renderCodeStep();
  });

  document.querySelector('#change-phone').addEventListener('click', () => {
    clearInterval(resendTimer);
    renderPhoneStep();
  });

  const codeInput = form.querySelector('[name="code"]');
  codeInput.focus();
  // Fills straight from the SMS on Chrome for Android and submits, so the code
  // never has to be read across apps. No longer gated on the channel: verify.ge
  // reports WHATSAPP for messages that actually arrive as SMS, so the guard was
  // switching autofill off precisely when it could have worked. A genuine
  // WhatsApp delivery just leaves the request unresolved, which is harmless.
  autofillOtpFromSms(codeInput, () => form.requestSubmit());
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
