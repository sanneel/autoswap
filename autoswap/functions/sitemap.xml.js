// Cloudflare Pages Function for /sitemap.xml.
//
// The checked-in sitemap lists the six static pages and no listings, so search
// engines had no crawlable route to an individual car: /cars builds its feed
// from Supabase in the browser, and a listing URL appeared nowhere in the HTML.
// For a marketplace that is the difference between six indexed pages and every
// car being findable.
//
// The static file stays the source of truth for the curated entries (it carries
// the owner's priorities and change frequencies); this only appends the active
// listings before the closing tag. If Supabase is unavailable the untouched
// static sitemap is returned - a smaller sitemap is recoverable, a 500 teaches
// crawlers to back off.

const MAX_LISTINGS = 5000;   // sitemap spec allows 50k; this stays well inside

function xmlEscape(value) {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]
  ));
}

export async function onRequestGet(context) {
  const { request, env, next } = context;
  const response = await next();

  try {
    const base = (env.AUTO_SWAP_SUPABASE_URL || '').replace(/\/$/, '');
    const key = env.AUTO_SWAP_SUPABASE_ANON_KEY || '';
    if (!base || !key) return response;

    const xml = await response.text();
    if (!xml.includes('</urlset>')) return response;

    const query = `${base}/rest/v1/public_vehicle_feed`
      + `?select=id,created_at&order=created_at.desc&limit=${MAX_LISTINGS}`;
    const res = await fetch(query, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cf: { cacheTtl: 1800, cacheEverything: true },
    });
    if (!res.ok) return new Response(xml, { headers: response.headers });

    const rows = await res.json();
    if (!Array.isArray(rows) || !rows.length) return new Response(xml, { headers: response.headers });

    const origin = new URL(request.url).origin;
    const entries = rows.map((row) => {
      const loc = `${origin}/vehicle?id=${encodeURIComponent(row.id)}`;
      const lastmod = row.created_at ? String(row.created_at).slice(0, 10) : '';
      return '  <url>\n'
        + `    <loc>${xmlEscape(loc)}</loc>\n`
        + (lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n` : '')
        + '    <changefreq>daily</changefreq>\n'
        + '    <priority>0.8</priority>\n'
        + '  </url>\n';
    }).join('');

    const merged = xml.replace('</urlset>', `${entries}</urlset>`);
    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'application/xml; charset=utf-8');
    headers.set('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    return new Response(merged, { headers });
  } catch (_err) {
    return response;
  }
}
