
const {
  Header, Footer, icons, sb, toast, escapeAttr, isUuid,
  authReady, getAuthUser, signOut, freshnessLabel, bustListingCaches,
  fuelLabel, labelFor, TRANSMISSION_LABELS, buildModal,
} = window.AutoSwap;

const TABS = [
  { id: 'garage', label: 'ჩემი განცხადებები', icon: icons.car },
  { id: 'received', label: 'მიღებული შეთავაზებები', icon: icons.swap },
  { id: 'sent', label: 'გაგზავნილი შეთავაზებები', icon: icons.arrowRight },
  { id: 'favorites', label: 'ფავორიტები', icon: icons.heart },
  { id: 'messages', label: 'შეტყობინებები', icon: icons.message },
  { id: 'profile', label: 'პროფილი', icon: icons.shield },
];

const VEHICLE_STATUS_LABELS = {
  active: 'აქტიური',
  paused: 'დაპაუზებული',
  draft: 'დრაფტი',
  completed: 'გაცვლილია',
  archived: 'არქივი',
  under_review: 'განხილვაშია',
};

const OFFER_STATUS_LABELS = {
  pending: 'მოლოდინში',
  viewed: 'ნანახია',
  accepted: 'მიღებულია ✓',
  declined: 'უარყოფილია',
  countered: 'კონტრ-შეთავაზება',
  cancelled: 'გაუქმებულია',
  expired: 'ვადაგასულია',
};

const CASH_MODE_LABELS = {
  none: 'თანაბარი გაცვლა',
  add_money: 'ამატებს თანხას',
  ask_money: 'ითხოვს თანხას',
  flexible: 'სხვაობა შეთანხმებით',
};

let me = null;
let activeThreadChannel = null;

function currentTab() {
  const hash = window.location.hash.replace(/^#/, '').split('/')[0];
  return TABS.some((t) => t.id === hash) ? hash : 'garage';
}

function threadIdFromHash() {
  const parts = window.location.hash.replace(/^#/, '').split('/');
  return parts[0] === 'messages' && isUuid(parts[1]) ? parts[1] : null;
}

function Shell(inner) {
  const tab = currentTab();
  return `
    ${Header({ active: 'account' })}
    <main class="account-shell">
      <section class="container account">
        <nav class="account-tabs" aria-label="ანგარიშის სექციები">
          ${TABS.map((t) => `<a class="account-tab${t.id === tab ? ' is-active' : ''}" href="#${t.id}">${t.icon}<span>${t.label}</span></a>`).join('')}
        </nav>
        <div class="account-body" id="account-body">${inner}</div>
      </section>
    </main>
    ${Footer()}
  `;
}

function loadingHTML() {
  return `<div class="account-loading">${[1, 2, 3].map(() => '<div class="skeleton-row"></div>').join('')}</div>`;
}

function emptyHTML(text, ctaHref, ctaLabel) {
  return `
    <div class="empty-state empty-state--actions">
      <p>${text}</p>
      ${ctaHref ? `<div class="empty-state-actions"><a class="btn btn-primary" href="${ctaHref}">${ctaLabel}</a></div>` : ''}
    </div>
  `;
}

function vehicleTitle(v) {
  if (!v) return 'მანქანა (აღარ ჩანს)';
  return `${v.make} ${v.model}${v.year ? ` · ${v.year}` : ''}`;
}

function statusBadge(map, status) {
  return `<span class="status-badge status-badge--${escapeAttr(status)}">${map[status] || status}</span>`;
}



async function renderGarage(body) {
  const { data, error } = await sb
    .from('vehicles')
    .select('id, make, model, year, mileage, fuel_type, transmission, city, status, estimated_value, created_at, vehicle_photos(url, position)')
    .eq('owner_id', me.id)
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (error) {
    body.innerHTML = emptyHTML('განცხადებების ჩატვირთვა ვერ მოხერხდა. სცადე თავიდან.');
    return;
  }
  if (!data.length) {
    body.innerHTML = emptyHTML('ჯერ არ გაქვს განცხადება.', 'sell.html', 'დაამატე პირველი მანქანა');
    return;
  }

  body.innerHTML = `
    <div class="account-head-row">
      <h1>ჩემი განცხადებები</h1>
      <a class="btn btn-primary" href="sell.html">${icons.plus} ახალი განცხადება</a>
    </div>
    <div class="account-list">
      ${data.map((v) => {
        const cover = (v.vehicle_photos || []).sort((a, b) => a.position - b.position)[0];
        const specs = [
          v.mileage != null ? `${Number(v.mileage).toLocaleString('en-US')} კმ` : '',
          fuelLabel(v.fuel_type),
          labelFor(TRANSMISSION_LABELS, v.transmission),
          v.estimated_value ? `~${Number(v.estimated_value).toLocaleString('en-US')} ₾` : '',
        ].filter(Boolean).join(' · ');
        return `
          <article class="account-card" data-vehicle="${v.id}">
            <div class="account-card-media">${cover ? `<img src="${escapeAttr(cover.url)}" alt="">` : icons.car}</div>
            <div class="account-card-body">
              <h3><a href="vehicle.html?id=${v.id}">${escapeAttr(vehicleTitle(v))}</a> ${statusBadge(VEHICLE_STATUS_LABELS, v.status)}</h3>
              <p class="account-card-specs">${escapeAttr(specs)}</p>
              <p class="account-card-meta">${escapeAttr(v.city || '')} · ${freshnessLabel(v.created_at)}</p>
            </div>
            <div class="account-card-actions">
              ${v.status === 'completed' ? '' : `
                <a class="btn btn-ghost btn-sm" href="sell.html?id=${v.id}">რედაქტირება</a>
                ${v.status === 'active'
                  ? `<button class="btn btn-ghost btn-sm" data-action="pause">პაუზა</button>`
                  : `<button class="btn btn-ghost btn-sm" data-action="activate">გააქტიურება</button>`}
                <button class="btn btn-danger btn-sm" data-action="delete">წაშლა</button>
              `}
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  body.querySelector('.account-list').addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-action]');
    if (!btn) return;
    const card = btn.closest('[data-vehicle]');
    const id = card.dataset.vehicle;
    const action = btn.dataset.action;

    if (action === 'delete' && !window.confirm('წავშალოთ განცხადება? ამის გაუქმება ვერ მოხერხდება.')) return;

    btn.disabled = true;
    const status = action === 'pause' ? 'paused' : action === 'activate' ? 'active' : 'deleted';
    const { error: updateError } = await sb.from('vehicles').update({ status }).eq('id', id);
    if (updateError) {
      btn.disabled = false;
      toast(updateError.message.includes('vehicles_active_requirements')
        ? 'გასააქტიურებლად საჭიროა ქალაქი და მდგომარეობა. შეავსე რედაქტირებაში'
        : 'ვერ შეიცვალა. სცადე თავიდან', 'error');
      return;
    }
    bustListingCaches();
    toast(action === 'delete' ? 'განცხადება წაიშალა' : 'სტატუსი განახლდა');
    renderGarage(body);
  });
}



const OFFER_EMBED = `
  id, status, cash_mode, cash_amount, message, created_at,
  from_user_id, to_user_id,
  target:vehicles!offers_target_vehicle_id_fkey (id, make, model, year),
  offered:vehicles!offers_offered_vehicle_id_fkey (id, make, model, year)
`;

function offerCard(offer, direction) {
  const mineLabel = direction === 'sent' ? vehicleTitle(offer.offered) : vehicleTitle(offer.target);
  const theirsLabel = direction === 'sent' ? vehicleTitle(offer.target) : vehicleTitle(offer.offered);
  const cash = offer.cash_mode !== 'none' && offer.cash_amount
    ? `${CASH_MODE_LABELS[offer.cash_mode] || offer.cash_mode}: ${Number(offer.cash_amount).toLocaleString('en-US')} ₾`
    : CASH_MODE_LABELS[offer.cash_mode] || '';

  const open = ['pending', 'viewed', 'countered'].includes(offer.status);
  const actions = direction === 'sent'
    ? (['pending', 'viewed'].includes(offer.status)
      ? `<button class="btn btn-ghost btn-sm" data-offer-action="cancel">გაუქმება</button>` : '')
    : (open
      ? `<button class="btn btn-primary btn-sm" data-offer-action="accept">დათანხმება</button>
         <button class="btn btn-ghost btn-sm" data-offer-action="decline">უარყოფა</button>` : '');

  return `
    <article class="account-card offer-card" data-offer="${offer.id}">
      <div class="account-card-body">
        <div class="offer-pair">
          <span class="offer-side"><small>${direction === 'sent' ? 'შენი' : 'შენი'}</small><strong>${escapeAttr(mineLabel)}</strong></span>
          <span class="offer-arrow">${icons.swap}</span>
          <span class="offer-side"><small>${direction === 'sent' ? 'მისი' : 'სთავაზობს'}</small><strong>${escapeAttr(theirsLabel)}</strong></span>
        </div>
        <p class="account-card-specs">${escapeAttr(cash)} ${statusBadge(OFFER_STATUS_LABELS, offer.status)}</p>
        ${offer.message ? `<p class="offer-card-msg">"${escapeAttr(offer.message)}"</p>` : ''}
        <p class="account-card-meta">${freshnessLabel(offer.created_at)}</p>
      </div>
      ${actions ? `<div class="account-card-actions">${actions}</div>` : ''}
    </article>
  `;
}

async function renderOffers(body, direction) {
  const column = direction === 'sent' ? 'from_user_id' : 'to_user_id';
  const { data, error } = await sb
    .from('offers')
    .select(OFFER_EMBED)
    .eq(column, me.id)
    .order('created_at', { ascending: false });

  if (error) {
    body.innerHTML = emptyHTML('შეთავაზებების ჩატვირთვა ვერ მოხერხდა.');
    console.error('AutoSwap: offers load failed', error.message);
    return;
  }
  if (!data.length) {
    body.innerHTML = direction === 'sent'
      ? emptyHTML('ჯერ არ გაგიგზავნია შეთავაზება.', 'cars.html', 'ნახე გაცვლები')
      : emptyHTML('ჯერ არ მიგიღია შეთავაზება. აქტიური განცხადება ზრდის შანსს.', 'sell.html', 'დაამატე განცხადება');
    return;
  }

  body.innerHTML = `
    <h1>${direction === 'sent' ? 'გაგზავნილი' : 'მიღებული'} შეთავაზებები</h1>
    <div class="account-list">${data.map((o) => offerCard(o, direction)).join('')}</div>
  `;

  
  if (direction === 'received') {
    data.filter((o) => o.status === 'pending')
      .forEach((o) => sb.rpc('mark_offer_viewed', { offer_id_input: o.id }).then(() => {}));
  }

  body.querySelector('.account-list').addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-offer-action]');
    if (!btn) return;
    const offerId = btn.closest('[data-offer]').dataset.offer;
    const action = btn.dataset.offerAction;

    if (action === 'accept'
      && !window.confirm('დათანხმებისას ორივე მანქანა გადავა "გაცვლილია" სტატუსში და სხვა შეთავაზებები დაიხურება. ვაგრძელებთ?')) return;

    btn.disabled = true;
    const rpcName = action === 'accept' ? 'accept_offer' : action === 'decline' ? 'decline_offer' : 'cancel_offer';
    const { data: result, error: rpcError } = await sb.rpc(rpcName, { offer_id_input: offerId });

    if (rpcError) {
      btn.disabled = false;
      toast(/active to complete/.test(rpcError.message)
        ? 'ერთ-ერთი მანქანა აღარ არის აქტიური. შეთავაზება ვეღარ მიიღება'
        : 'მოქმედება ვერ შესრულდა. სცადე თავიდან', 'error');
      console.error(`AutoSwap: ${rpcName} failed`, rpcError.message);
      return;
    }

    bustListingCaches();
    if (action === 'accept') {
      toast('გილოცავ, გაცვლა შედგა. ჩატი უკვე ღიაა.');
      window.location.hash = isUuid(result) ? `messages/${result}` : 'messages';
      return;
    }
    toast(action === 'decline' ? 'შეთავაზება უარყოფილია' : 'შეთავაზება გაუქმდა');
    renderOffers(body, direction);
  });
}



async function renderFavorites(body) {
  const { data, error } = await sb
    .from('saved_listings')
    .select('id, vehicle_id, created_at, vehicle:vehicles (id, make, model, year, mileage, city, status, vehicle_photos(url, position))')
    .eq('user_id', me.id)
    .order('created_at', { ascending: false });

  if (error) {
    body.innerHTML = emptyHTML('ფავორიტების ჩატვირთვა ვერ მოხერხდა.');
    return;
  }
  if (!data.length) {
    body.innerHTML = emptyHTML('ფავორიტები ჯერ ცარიელია. შეინახე მოწონებული მანქანები გულის ღილაკით.', 'cars.html', 'ნახე გაცვლები');
    return;
  }

  body.innerHTML = `
    <h1>ფავორიტები</h1>
    <div class="account-list">
      ${data.map((row) => {
        const v = row.vehicle;
        const gone = !v || v.status !== 'active';
        const cover = v ? (v.vehicle_photos || []).sort((a, b) => a.position - b.position)[0] : null;
        return `
          <article class="account-card" data-fav="${row.vehicle_id}">
            <div class="account-card-media">${cover ? `<img src="${escapeAttr(cover.url)}" alt="">` : icons.car}</div>
            <div class="account-card-body">
              <h3>${v ? `<a href="vehicle.html?id=${v.id}">${escapeAttr(vehicleTitle(v))}</a>` : 'განცხადება აღარ არის ხელმისაწვდომი'}</h3>
              ${gone ? '<p class="account-card-meta">აღარ არის აქტიური</p>' : `<p class="account-card-meta">${escapeAttr(v.city || '')}</p>`}
            </div>
            <div class="account-card-actions">
              <button class="btn btn-ghost btn-sm" data-action="unfav">წაშლა</button>
            </div>
          </article>
        `;
      }).join('')}
    </div>
  `;

  body.querySelector('.account-list').addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-action="unfav"]');
    if (!btn) return;
    const vehicleId = btn.closest('[data-fav]').dataset.fav;
    btn.disabled = true;
    const { error: delError } = await sb
      .from('saved_listings').delete()
      .eq('user_id', me.id).eq('vehicle_id', vehicleId);
    if (delError) {
      btn.disabled = false;
      toast('წაშლა ვერ მოხერხდა', 'error');
      return;
    }
    renderFavorites(body);
  });
}



function leaveThread() {
  if (activeThreadChannel) {
    sb.removeChannel(activeThreadChannel);
    activeThreadChannel = null;
  }
}

async function renderConversations(body) {
  leaveThread();
  const { data, error } = await sb
    .from('conversations')
    .select(`
      id, created_at, user_a, user_b,
      offer:offers (
        id,
        target:vehicles!offers_target_vehicle_id_fkey (make, model),
        offered:vehicles!offers_offered_vehicle_id_fkey (make, model)
      )
    `)
    .or(`user_a.eq.${me.id},user_b.eq.${me.id}`)
    .order('created_at', { ascending: false });

  if (error) {
    body.innerHTML = emptyHTML('ჩატების ჩატვირთვა ვერ მოხერხდა.');
    return;
  }
  if (!data.length) {
    body.innerHTML = emptyHTML('ჩატი იხსნება შეთავაზების მიღების შემდეგ.', 'cars.html', 'ნახე გაცვლები');
    return;
  }

  body.innerHTML = `
    <h1>შეტყობინებები</h1>
    <div class="account-list">
      ${data.map((c) => {
        const title = c.offer
          ? `${vehicleTitle(c.offer.offered)} ⇄ ${vehicleTitle(c.offer.target)}`
          : 'გაცვლის ჩატი';
        return `
          <a class="account-card conversation-card" href="#messages/${c.id}">
            <div class="account-card-media">${icons.message}</div>
            <div class="account-card-body">
              <h3>${escapeAttr(title)}</h3>
              <p class="account-card-meta">გაიხსნა ${freshnessLabel(c.created_at)}</p>
            </div>
            <span class="conversation-open">${icons.arrowRight}</span>
          </a>
        `;
      }).join('')}
    </div>
  `;
}

function messageBubble(msg) {
  const mine = msg.sender_id === me.id;
  return `
    <div class="msg-bubble${mine ? ' is-mine' : ''}" data-msg="${msg.id}">
      <p>${escapeAttr(msg.body)}</p>
      <small>${new Date(msg.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</small>
    </div>
  `;
}

async function renderThread(body, conversationId) {
  leaveThread();
  const { data: conv, error: convError } = await sb
    .from('conversations')
    .select('id, user_a, user_b')
    .eq('id', conversationId)
    .maybeSingle();

  if (convError || !conv) {
    body.innerHTML = emptyHTML('ჩატი ვერ მოიძებნა.', '#messages', 'ჩატებზე დაბრუნება');
    return;
  }

  const { data: messages, error: msgError } = await sb
    .from('messages')
    .select('id, sender_id, body, created_at, read_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (msgError) {
    body.innerHTML = emptyHTML('შეტყობინებების ჩატვირთვა ვერ მოხერხდა.');
    return;
  }

  body.innerHTML = `
    <a class="detail-back" href="#messages">${icons.arrowRight}<span>ყველა ჩატი</span></a>
    <div class="msg-thread" id="msg-thread">
      ${messages.length ? messages.map(messageBubble).join('') : '<p class="msg-empty">დაიწყე საუბარი. შეთანხმდით სად და როდის ნახავთ მანქანებს.</p>'}
    </div>
    <form class="msg-form" id="msg-form">
      <input type="text" name="body" maxlength="2000" autocomplete="off" placeholder="დაწერე შეტყობინება…" required>
      <button class="btn btn-primary" type="submit">გაგზავნა</button>
    </form>
  `;

  const thread = body.querySelector('#msg-thread');
  thread.scrollTop = thread.scrollHeight;

  
  sb.from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', me.id)
    .is('read_at', null)
    .then(() => {});

  
  activeThreadChannel = sb
    .channel(`thread-${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`,
    }, (payload) => {
      const msg = payload.new;
      if (!msg || msg.sender_id === me.id) return;
      if (thread.querySelector(`[data-msg="${msg.id}"]`)) return;
      thread.querySelector('.msg-empty')?.remove();
      thread.insertAdjacentHTML('beforeend', messageBubble(msg));
      thread.scrollTop = thread.scrollHeight;
    })
    .subscribe();

  body.querySelector('#msg-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = event.currentTarget.querySelector('[name="body"]');
    const text = input.value.trim();
    if (!text) return;
    input.disabled = true;
    const { data: sent, error: sendError } = await sb
      .from('messages')
      .insert({ conversation_id: conversationId, sender_id: me.id, body: text })
      .select('id, sender_id, body, created_at')
      .single();
    input.disabled = false;
    if (sendError) {
      toast('გაგზავნა ვერ მოხერხდა', 'error');
      return;
    }
    thread.querySelector('.msg-empty')?.remove();
    thread.insertAdjacentHTML('beforeend', messageBubble(sent));
    thread.scrollTop = thread.scrollHeight;
    input.value = '';
    input.focus();
  });
}



// Telegram notifications: shown only when a bot username is configured in
// supabase-config.js (window.AUTO_SWAP_TELEGRAM_BOT). Connecting writes a
// one-time link code to the user's own profile, then opens the bot deep link;
// the telegram-bot Edge Function stores the chat id and clears the code.
function telegramBotName() {
  return typeof window !== 'undefined' ? (window.AUTO_SWAP_TELEGRAM_BOT || '') : '';
}

function telegramRow(profile) {
  if (!telegramBotName()) return '';
  if (profile.telegram_chat_id) {
    return '<p class="tg-status"><strong>Telegram:</strong> ✅ დაკავშირებულია</p>';
  }
  return `
    <p class="tg-status"><strong>Telegram:</strong> არ არის დაკავშირებული</p>
    <button class="btn btn-secondary" id="tg-connect" type="button">Telegram-ის დაკავშირება</button>`;
}

function bindTelegramConnect(body, profile) {
  const btn = body.querySelector('#tg-connect');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const bot = telegramBotName();
    if (!bot) return;
    btn.disabled = true;
    const code = (crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36)).slice(0, 24);
    const { error } = await sb.from('profiles').update({ telegram_link_code: code }).eq('id', me.id);
    if (error) {
      btn.disabled = false;
      toast('დაკავშირება ვერ მოხერხდა. სცადე თავიდან', 'error');
      return;
    }
    window.open(`https://t.me/${encodeURIComponent(bot)}?start=${encodeURIComponent(code)}`, '_blank', 'noopener');
    toast('გახსენი Telegram და დააჭირე „Start“-ს', 'success');
  });
}

async function renderProfile(body) {
  const { data: profile, error } = await sb
    .from('profiles')
    .select('display_name, city, phone, preferred_contact_method, completed_swaps_count, created_at, telegram_chat_id')
    .eq('id', me.id)
    .maybeSingle();

  if (error || !profile) {
    body.innerHTML = emptyHTML('პროფილის ჩატვირთვა ვერ მოხერხდა.');
    return;
  }

  body.innerHTML = `
    <h1>პროფილი</h1>
    <div class="profile-grid">
      <form class="auth-form profile-form" id="profile-form">
        <label class="field"><span>სახელი</span>
          <input name="display_name" maxlength="60" value="${escapeAttr(profile.display_name || '')}" placeholder="შენი სახელი"></label>
        <label class="field"><span>ქალაქი</span>
          <input name="city" maxlength="40" value="${escapeAttr(profile.city || '')}" placeholder="თბილისი"></label>
        <label class="field"><span>ტელეფონი</span>
          <input name="phone" maxlength="20" inputmode="tel" value="${escapeAttr(profile.phone || '')}" placeholder="+995 5XX XX XX XX"></label>
        <label class="field"><span>სასურველი კონტაქტი</span>
          <select name="preferred_contact_method">
            ${['app', 'phone', 'whatsapp', 'email'].map((m) => `<option value="${m}"${profile.preferred_contact_method === m ? ' selected' : ''}>${{ app: 'აპში ჩატი', phone: 'ზარი', whatsapp: 'WhatsApp', email: 'ელფოსტა' }[m]}</option>`).join('')}
          </select></label>
        <button class="btn btn-primary auth-submit" type="submit">შენახვა</button>
      </form>
      <aside class="profile-aside">
        <p><strong>ელფოსტა:</strong> ${escapeAttr(me.email || '-')}</p>
        <p><strong>დასრულებული გაცვლები:</strong> ${profile.completed_swaps_count || 0}</p>
        <p><strong>წევრი:</strong> ${freshnessLabel(profile.created_at) || '-'}</p>
        ${telegramRow(profile)}
        <button class="btn btn-danger" id="logout-btn" type="button">გასვლა</button>
      </aside>
    </div>
  `;

  bindTelegramConnect(body, profile);

  body.querySelector('#profile-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const { error: saveError } = await sb.from('profiles').update({
      display_name: String(data.get('display_name') || '').trim() || null,
      city: String(data.get('city') || '').trim() || null,
      phone: String(data.get('phone') || '').trim() || null,
      preferred_contact_method: String(data.get('preferred_contact_method') || 'app'),
    }).eq('id', me.id);
    if (saveError) {
      toast('შენახვა ვერ მოხერხდა', 'error');
      return;
    }
    toast('პროფილი განახლდა');
  });

  body.querySelector('#logout-btn').addEventListener('click', async () => {
    await signOut();
    window.location.replace('index.html');
  });
}



async function renderTab() {
  document.querySelector('#app').innerHTML = Shell(loadingHTML());
  const body = document.querySelector('#account-body');
  const tab = currentTab();
  const thread = threadIdFromHash();

  if (tab !== 'messages') leaveThread();

  if (tab === 'garage') return renderGarage(body);
  if (tab === 'sent') return renderOffers(body, 'sent');
  if (tab === 'received') return renderOffers(body, 'received');
  if (tab === 'favorites') return renderFavorites(body);
  if (tab === 'messages') return thread ? renderThread(body, thread) : renderConversations(body);
  if (tab === 'profile') return renderProfile(body);
  return renderGarage(body);
}

async function init() {
  if (!sb) {
    document.querySelector('#app').innerHTML = `
      ${Header({ active: 'account' })}
      <main class="account-shell"><section class="container account">
        ${emptyHTML('ანგარიში დროებით მიუწვდომელია. მანამდე შეგიძლია გაცვლების ნახვა.', 'cars.html', 'გაცვლების ნახვა')}
      </section></main>
      ${Footer()}
    `;
    return;
  }

  me = await authReady;
  if (!me) {
    const next = encodeURIComponent('account.html' + window.location.hash);
    window.location.replace(`login.html?next=${next}`);
    return;
  }

  window.addEventListener('hashchange', renderTab);
  renderTab();
}

init();
