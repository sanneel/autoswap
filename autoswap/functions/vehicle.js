// Cloudflare Pages Function for /vehicle.
//
// The client sets per-listing <title>/OG tags once it has fetched the car, which
// is enough for browsers and for Google (it renders JS). It is NOT enough for
// the crawlers that matter most here: WhatsApp, Facebook and Telegram read the
// raw HTML and never run scripts, so every shared listing produced the same
// generic card. This rewrites the tags at the edge, before the HTML is sent.
//
// It fails open on purpose. Missing env vars, a slow or broken Supabase, a
// non-UUID id, an unknown listing - every one of those returns the untouched
// static page rather than an error, because a generic preview is a much smaller
// problem than a listing that will not load.
//
// Browsers skip the rewrite entirely. They get the same tags from the page
// script, and the Supabase lookup here held back the first byte of every car
// click (150-325ms warm, 1.2s cold, against ~40ms for the static page).

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SITE = 'https://autoswap.ge';

// Browsers mark page loads (and prerenders) with Sec-Fetch-Dest: document;
// preview crawlers do not send it, and the ones that might are caught by name.
const CRAWLER_RE = /bot|crawl|spider|preview|facebookexternalhit|whatsapp|telegram|viber|slack|discord|skype|embedly|vkshare|pinterest/i;

function isBrowserNavigation(request) {
  if (request.headers.get('sec-fetch-dest') !== 'document') return false;
  return !CRAWLER_RE.test(request.headers.get('user-agent') || '');
}

class AttrSetter {
  constructor(attr, value) { this.attr = attr; this.value = value; }
  element(el) { if (this.value) el.setAttribute(this.attr, this.value); }
}

class TextSetter {
  constructor(value) { this.value = value; this.first = true; }
  text(chunk) {
    // The title's text arrives in chunks; replace the first and drop the rest.
    if (this.first) { chunk.replace(this.value); this.first = false; }
    else if (!chunk.lastInTextNode) chunk.remove();
  }
}

export async function onRequestGet(context) {
  const { request, env, next } = context;
  if (isBrowserNavigation(request)) return next();
  const response = await next();

  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id || !UUID_RE.test(id)) return response;
    if (!(response.headers.get('content-type') || '').includes('text/html')) return response;

    const base = (env.AUTO_SWAP_SUPABASE_URL || '').replace(/\/$/, '');
    const key = env.AUTO_SWAP_SUPABASE_ANON_KEY || '';
    if (!base || !key) return response;

    // public_vehicle_feed is the same anon-readable view the browser uses, so
    // this exposes nothing the page would not already show.
    const query = `${base}/rest/v1/public_vehicle_feed`
      + `?id=eq.${encodeURIComponent(id)}`
      + `&select=id,make,model,year,description,cover_photo_url&limit=1`;
    const res = await fetch(query, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!res.ok) return response;

    const [car] = await res.json();
    if (!car || !car.make) return response;

    const year = car.year ? ` · ${car.year}` : '';
    const title = `${car.make} ${car.model || ''}`.trim() + `${year} · AutoSwap`;
    const url = `${SITE}/vehicle?id=${encodeURIComponent(car.id)}`;
    const image = car.cover_photo_url || '';
    // Only override the description when the seller wrote one; otherwise the
    // page keeps the copy that is already in the HTML.
    const description = car.description || '';

    let out = new HTMLRewriter()
      .on('title', new TextSetter(title))
      .on('meta[property="og:title"]', new AttrSetter('content', title))
      .on('meta[name="twitter:title"]', new AttrSetter('content', title))
      .on('meta[property="og:url"]', new AttrSetter('content', url))
      .on('link[rel="canonical"]', new AttrSetter('href', url));

    if (image) {
      out = out.on('meta[property="og:image"]', new AttrSetter('content', image))
               .on('meta[name="twitter:image"]', new AttrSetter('content', image));
    }
    if (description) {
      out = out.on('meta[name="description"]', new AttrSetter('content', description))
               .on('meta[property="og:description"]', new AttrSetter('content', description))
               .on('meta[name="twitter:description"]', new AttrSetter('content', description));
    }

    const rewritten = out.transform(response);
    // Listings change (price, photos, status), so let the edge hold it briefly
    // and serve stale while it refreshes rather than pinning it.
    rewritten.headers.set('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=600');
    return rewritten;
  } catch (_err) {
    return response;
  }
}
