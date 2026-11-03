// Cloudflare Worker — minimal, privacy-friendly analytics for koenmeershoek.nl
//
// Four endpoints:
//   GET /collect?path=/index.html   records one pageview (public, no login —
//                                    every site visitor's browser calls this)
//   GET /stats                      returns the last 30 days as JSON (login-protected)
//   GET /pages                      returns all-time pageviews per page (login-protected)
//   POST /reset                     wipes all recorded stats back to 0 (login-protected)
//
// "Unique visitor" = a hash of (secret salt + today's date + IP + User-Agent).
// The date is part of the hash input, so the same person hashes to a
// different, unlinkable value every day. The raw IP is never stored —
// only this one-way hash is written to KV. That's what makes this
// cookie-free and GDPR-exempt: no personal data is retained.
//
// The dashboard itself (dashboard.html) stays publicly reachable — anyone
// who finds the URL just sees an empty page, because the protected
// endpoints refuse to answer without the correct X-Dashboard-User /
// X-Dashboard-Key headers.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Dashboard-User, X-Dashboard-Key',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (url.pathname === '/collect') {
      return handleCollect(request, env, url, corsHeaders);
    }
    if (url.pathname === '/stats' || url.pathname === '/pages' || url.pathname === '/reset') {
      const userOk = request.headers.get('X-Dashboard-User') === env.DASHBOARD_USERNAME;
      const passOk = request.headers.get('X-Dashboard-Key') === env.DASHBOARD_PASSWORD;
      if (!userOk || !passOk) {
        return new Response(JSON.stringify({ error: 'unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (url.pathname === '/stats') return handleStats(env, corsHeaders);
      if (url.pathname === '/pages') return handlePages(env, corsHeaders);
      return handleReset(env, corsHeaders);
    }
    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};

async function handleCollect(request, env, url, corsHeaders) {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const path = (url.searchParams.get('path') || '/').slice(0, 200);

  const ip = request.headers.get('CF-Connecting-IP') || '';
  const ua = request.headers.get('User-Agent') || '';
  const visitorId = await sha256(`${env.SALT}|${day}|${ip}|${ua}`);

  // Total pageviews for the day
  await incrementCounter(env, `pv:${day}`);

  // Pageviews for this specific page, for the day
  await incrementCounter(env, `page:${day}:${path}`);

  // All-time pageviews for this specific page (never expires), so the
  // "which project gets clicked on" ranking survives beyond the 95-day
  // window of the daily counters above.
  await incrementCounter(env, `pagetotal:${path}`, null);

  // Unique visitors for the day: a small JSON set of hashed visitor IDs.
  // Fine for a personal portfolio site's traffic volume; KV values can hold
  // up to 25MB, far more than we'll ever need here.
  const uvKey = `uv:${day}`;
  const raw = await env.ANALYTICS.get(uvKey);
  const seen = raw ? JSON.parse(raw) : {};
  seen[visitorId] = true;
  await env.ANALYTICS.put(uvKey, JSON.stringify(seen), { expirationTtl: 60 * 60 * 24 * 95 });

  return new Response('ok', { headers: corsHeaders });
}

async function incrementCounter(env, key, expirationTtl = 60 * 60 * 24 * 95) {
  const current = parseInt((await env.ANALYTICS.get(key)) || '0', 10);
  const options = expirationTtl ? { expirationTtl } : {};
  await env.ANALYTICS.put(key, String(current + 1), options);
}

async function handleStats(env, corsHeaders) {
  const days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const result = [];
  for (const day of days) {
    const pageviews = parseInt((await env.ANALYTICS.get(`pv:${day}`)) || '0', 10);
    const rawUv = await env.ANALYTICS.get(`uv:${day}`);
    const uniqueVisitors = rawUv ? Object.keys(JSON.parse(rawUv)).length : 0;
    result.push({ date: day, pageviews, uniqueVisitors });
  }

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handlePages(env, corsHeaders) {
  const pages = [];
  let cursor;
  do {
    const list = await env.ANALYTICS.list({ prefix: 'pagetotal:', cursor });
    for (const key of list.keys) {
      const path = key.name.slice('pagetotal:'.length);
      const pageviews = parseInt((await env.ANALYTICS.get(key.name)) || '0', 10);
      pages.push({ path, pageviews });
    }
    cursor = list.list_complete ? undefined : list.cursor;
  } while (cursor);

  pages.sort((a, b) => b.pageviews - a.pageviews);

  return new Response(JSON.stringify(pages), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleReset(env, corsHeaders) {
  const prefixes = ['pv:', 'page:', 'pagetotal:', 'uv:'];
  let deleted = 0;

  for (const prefix of prefixes) {
    let cursor;
    do {
      const list = await env.ANALYTICS.list({ prefix, cursor });
      await Promise.all(list.keys.map((key) => env.ANALYTICS.delete(key.name)));
      deleted += list.keys.length;
      cursor = list.list_complete ? undefined : list.cursor;
    } while (cursor);
  }

  return new Response(JSON.stringify({ ok: true, deleted }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sha256(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
