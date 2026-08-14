const {
  Header, Footer, icons, sb, toast, escapeAttr, authReady,
  signInWithProvider, signInWithPassword, setPassword, passwordProblem,
  passwordFieldHTML, usernameFieldHTML, bindPasswordFields,
  normalizePhone, requestPhoneOtp, confirmPhoneOtp, AUTH_DEMO_CODE,
  autofillOtpFromSms, channelPickerHTML, bindChannelPicker,
} = window.AutoSwap;

const RESEND_COOLDOWN_S = 60;

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

function googleBlock() {
  return `
    <div class="auth-providers">
      <button type="button" class="btn-provider btn-google" data-provider="google">${icons.google}<span>Google-ით გაგრძელება</span></button>
    </div>
    <div class="auth-divider"><span>ან ნომრით</span></div>
  `;
}

function phoneField(phone) {
  return `
    <label class="field">
      <span>ტელეფონის ნომერი (+995)</span>
      <input type="tel" name="phone" required autocomplete="tel-national" inputmode="tel"
             placeholder="5XX XX XX XX" value="${escapeAttr(phone || '')}">
    </label>
  `;
}

function err(message) {
  return `<p class="auth-error" role="alert"${message ? '' : ' hidden'}>${escapeAttr(message || '')}</p>`;
}

function showError(message) {
  const node = document.querySelector('.auth-error');
  if (!node) return;
  node.textContent = message || '';
  node.hidden = !message;
}

function SignInStep(phone, error) {
  return Shell(`
    <span class="auth-icon">${icons.swap}</span>
    <h1>შესვლა</h1>
    <p class="auth-sub">შედი ნომრითა და პაროლით, ან გააგრძელე Google-ით.</p>
    ${googleBlock()}
    ${err(error)}
    <form class="auth-form" id="signin-form" novalidate>
      ${phoneField(phone)}
      ${passwordFieldHTML({ label: 'პაროლი', autocomplete: 'current-password', rules: false })}
      <button class="btn btn-primary auth-submit" type="submit">შესვლა</button>
    </form>
    <div class="auth-secondary">
      <button type="button" class="auth-link" id="go-register">დარეგისტრირდი</button>
      <button type="button" class="auth-link" id="go-forgot">დაგავიწყდა პაროლი?</button>
    </div>
  `);
}

function RegisterStep(phone, error) {
  return Shell(`
    <span class="auth-icon">${icons.swap}</span>
    <h1>რეგისტრაცია</h1>
    <p class="auth-sub">დაადასტურე ნომერი ერთჯერადი კოდით, შემდეგ შექმენი პაროლი. კოდი მხოლოდ ერთხელ დაგჭირდება.</p>
    ${googleBlock()}
    ${err(error)}
    <form class="auth-form" id="register-form" novalidate>
      ${phoneField(phone)}
      <div class="field">
        <span>კოდი მივიღო</span>
        ${channelPickerHTML()}
      </div>
      <button class="btn btn-primary auth-submit" type="submit">გამომიგზავნე კოდი</button>
    </form>
    <div class="auth-secondary">
      <button type="button" class="auth-link" id="go-signin">უკვე გაქვს ანგარიში? შედი</button>
    </div>
  `);
}

function ForgotStep(phone, error) {
  return Shell(`
    <span class="auth-icon">${icons.check}</span>
    <h1>პაროლის აღდგენა</h1>
    <p class="auth-sub">გამოგიგზავნით ერთჯერად კოდს, შემდეგ დააყენებ ახალ პაროლს.</p>
    ${err(error)}
    <form class="auth-form" id="forgot-form" novalidate>
      ${phoneField(phone)}
      <div class="field">
        <span>კოდი მივიღო</span>
        ${channelPickerHTML()}
      </div>
      <button class="btn btn-primary auth-submit" type="submit">გამომიგზავნე კოდი</button>
    </form>
    <div class="auth-secondary">
      <button type="button" class="auth-link" id="go-signin">დაბრუნება შესვლაზე</button>
    </div>
  `);
}

function CodeStep(phone, isDemo, error) {
  return Shell(`
    <span class="auth-icon">${icons.check}</span>
    <h1>შეიყვანე კოდი</h1>
    <p class="auth-sub">კოდი გაიგზავნა ${currentChannel === 'whatsapp' ? 'WhatsApp-ით' : 'SMS-ით'} ნომერზე <strong>${escapeAttr(phone)}</strong>.${isDemo ? ` დემო რეჟიმი, შეიყვანე კოდი <strong>${AUTH_DEMO_CODE}</strong>.` : ' კოდი მოქმედებს 5 წუთის განმავლობაში.'}</p>
    ${currentFellBack ? '<p class="auth-note">WhatsApp ამ ნომრისთვის მიუწვდომელია, კოდი SMS-ით გაიგზავნა.</p>' : ''}
    ${err(error)}
    <form class="auth-form" id="code-form" novalidate>
      <label class="field">
        <span>ერთჯერადი კოდი</span>
        <input type="text" name="code" required inputmode="numeric" pattern="[0-9]*"
               autocomplete="one-time-code" data-lpignore="true" data-1p-ignore
               maxlength="6" placeholder="0000" class="auth-code-input">
      </label>
      <button class="btn btn-primary auth-submit" type="submit">დადასტურება</button>
    </form>
    <div class="auth-secondary">
      <button type="button" class="auth-link" id="resend-btn" disabled>კოდის თავიდან გაგზავნა (${RESEND_COOLDOWN_S})</button>
      <button type="button" class="auth-link" id="change-phone">სხვა ნომერი</button>
    </div>
  `);
}

function PasswordStep(error) {
  return Shell(`
    <span class="auth-icon">${icons.check}</span>
    <h1>${mode === 'forgot' ? 'ახალი პაროლი' : 'შექმენი პაროლი'}</h1>
    <p class="auth-sub">ნომერი დადასტურდა. შემდეგში ამ პაროლით შეხვალ, კოდი აღარ დაგჭირდება.</p>
    ${err(error)}
    <form class="auth-form" id="password-form" novalidate>
      ${usernameFieldHTML(currentPhone)}
      ${passwordFieldHTML({ label: 'ახალი პაროლი', autocomplete: 'new-password' })}
      <button class="btn btn-primary auth-submit" type="submit">შენახვა</button>
    </form>
  `);
}

let currentPhone = '';
let currentIsDemo = false;
let resendTimer = null;
let currentRequestId = null;
let currentChannel = 'whatsapp';
let currentFellBack = false;
let readChannel = () => currentChannel;
let mode = 'register';

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
  if (!btn) return;
  let left = RESEND_COOLDOWN_S;
  btn.disabled = true;
  btn.textContent = `კოდის თავიდან გაგზავნა (${left})`;
  clearInterval(resendTimer);
  resendTimer = setInterval(() => {
    left -= 1;
    if (left <= 0) {
      clearInterval(resendTimer);
      btn.disabled = false;
      btn.textContent = 'კოდის თავიდან გაგზავნა';
      return;
    }
    btn.textContent = `კოდის თავიდან გაგზავნა (${left})`;
  }, 1000);
}

function bindProviders(rerender) {
  document.querySelectorAll('.btn-provider').forEach((btn) => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      const { error } = await signInWithProvider(btn.dataset.provider);
      if (error) {
        btn.disabled = false;
        rerender(friendlyError(error));
      }
    });
  });
}

function focusOnRoomyScreens(el) {
  if (el && window.matchMedia('(min-width: 768px)').matches) el.focus();
}

function readPhone(form) {
  const raw = String(new FormData(form).get('phone') || '').trim();
  return { raw, phone: normalizePhone(raw) };
}

const BAD_PHONE = 'შეიყვანე ქართული მობილურის ნომერი ფორმატით 5XX XX XX XX.';

function renderSignIn(error) {
  document.querySelector('#app').innerHTML = SignInStep(currentPhone, error);
  bindProviders(renderSignIn);

  document.querySelector('#go-register').addEventListener('click', () => {
    mode = 'register';
    renderRegister();
  });
  document.querySelector('#go-forgot').addEventListener('click', () => {
    mode = 'forgot';
    renderForgot();
  });

  const form = document.querySelector('#signin-form');
  bindPasswordFields(form);
  const submit = form.querySelector('[type="submit"]');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { raw, phone } = readPhone(form);
    currentPhone = raw;
    if (!phone) {
      showError(BAD_PHONE);
      form.querySelector('[name="phone"]').focus();
      return;
    }
    const password = String(new FormData(form).get('password') || '');
    showError('');
    submit.disabled = true;
    const result = await signInWithPassword(phone, password);
    if (result.error) {
      submit.disabled = false;
      showError(result.error);
      form.querySelector('[name="password"]').select();
      return;
    }
    toast('შესვლა წარმატებულია');
    window.location.replace(nextTarget());
  });
  focusOnRoomyScreens(form.querySelector('[name="phone"]'));
}

function bindCodeRequestForm(formId, rerender) {
  const form = document.querySelector(`#${formId}`);
  readChannel = bindChannelPicker(form);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { raw, phone } = readPhone(form);
    currentPhone = raw;
    if (!phone) {
      rerender(BAD_PHONE);
      return;
    }
    form.querySelector('[type="submit"]').disabled = true;
    const channel = readChannel();
    const result = await requestPhoneOtp(phone, channel);
    if (result.error) {
      rerender(friendlyError(result.error));
      return;
    }
    currentPhone = phone;
    currentIsDemo = !!result.demo;
    currentRequestId = result.requestId || null;
    currentChannel = result.channel || channel;
    currentFellBack = !!result.fellBack;
    renderCodeStep();
  });
  focusOnRoomyScreens(form.querySelector('[name="phone"]'));
}

function renderRegister(error) {
  document.querySelector('#app').innerHTML = RegisterStep(currentPhone, error);
  bindProviders(renderRegister);
  document.querySelector('#go-signin').addEventListener('click', renderSignInFresh);
  bindCodeRequestForm('register-form', renderRegister);
}

function renderForgot(error) {
  document.querySelector('#app').innerHTML = ForgotStep(currentPhone, error);
  document.querySelector('#go-signin').addEventListener('click', renderSignInFresh);
  bindCodeRequestForm('forgot-form', renderForgot);
}

function renderSignInFresh() {
  clearInterval(resendTimer);
  renderSignIn();
}

function renderCodeStep(error) {
  document.querySelector('#app').innerHTML = CodeStep(currentPhone, currentIsDemo, error);
  startResendCooldown();

  const form = document.querySelector('#code-form');
  let verifying = false;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (verifying) return;
    const input = form.querySelector('[name="code"]');
    const submit = form.querySelector('[type="submit"]');
    const code = String(new FormData(form).get('code') || '').trim();
    if (!/^\d{4,6}$/.test(code)) {
      showError('შეიყვანე კოდი.');
      input.select();
      return;
    }
    showError('');
    verifying = true;
    submit.disabled = true;
    const result = await confirmPhoneOtp(currentPhone, code, currentIsDemo, currentRequestId);
    if (result.error) {
      verifying = false;
      submit.disabled = false;
      showError(friendlyError(result.error));
      input.select();
      return;
    }
    if (currentIsDemo) {
      toast('დემო ანგარიშით შეხვედი, ტესტირებისთვის');
      window.location.replace('/cars');
      return;
    }
    clearInterval(resendTimer);
    renderPasswordStep();
  });

  document.querySelector('#resend-btn').addEventListener('click', async (event) => {
    event.currentTarget.disabled = true;
    const result = await requestPhoneOtp(currentPhone, currentChannel);
    if (result.error) {
      showError(friendlyError(result.error));
      startResendCooldown();
      return;
    }
    currentIsDemo = !!result.demo;
    currentRequestId = result.requestId || null;
    currentChannel = result.channel || currentChannel;
    currentFellBack = !!result.fellBack;
    toast('ახალი კოდი გაიგზავნა');
    renderCodeStep();
  });

  document.querySelector('#change-phone').addEventListener('click', () => {
    clearInterval(resendTimer);
    if (mode === 'forgot') renderForgot(); else renderRegister();
  });

  const codeInput = form.querySelector('[name="code"]');
  codeInput.focus();
  autofillOtpFromSms(codeInput, () => form.requestSubmit());
}

function renderPasswordStep(error) {
  document.querySelector('#app').innerHTML = PasswordStep(error);
  const form = document.querySelector('#password-form');
  bindPasswordFields(form);
  const input = form.querySelector('[name="password"]');
  const submit = form.querySelector('[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const password = String(new FormData(form).get('password') || '');
    const problem = passwordProblem(password);
    if (problem) {
      showError(problem);
      input.focus();
      return;
    }
    showError('');
    submit.disabled = true;
    const result = await setPassword(password);
    if (result.error) {
      submit.disabled = false;
      showError(result.error);
      return;
    }
    toast(mode === 'forgot' ? 'პაროლი განახლდა' : 'ანგარიში შეიქმნა');
    window.location.replace(nextTarget());
  });
  input.focus();
}

async function init() {
  const user = await authReady;
  if (user) {
    window.location.replace(nextTarget());
    return;
  }
  if (new URLSearchParams(window.location.search).has('register')) {
    mode = 'register';
    renderRegister();
    return;
  }
  renderSignIn();
}

init();
