// Cloudflare Worker — minimal, privacy-friendly analytics for koenmeershoek.nl
//
// Two endpoints:
//   GET /collect?path=/index.html   records one pageview
//   GET /stats                      returns the last 30 days as JSON, for the dashboard
//
// "Unique visitor" = a hash of (secret salt + today's date + IP + User-Agent).
// The date is part of the hash input, so the same person hashes to a
// different, unlinkable value every day. The raw IP is never stored —
// only this one-way hash is written to KV. That's what makes this
// cookie-free and GDPR-exempt: no personal data is retained.

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    if (url.pathname === '/collect') {
      return handleCollect(request, env, url, corsHeaders);
    }
    if (url.pathname === '/stats') {
      return handleStats(env, corsHeaders);
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

async function incrementCounter(env, key) {
  const current = parseInt((await env.ANALYTICS.get(key)) || '0', 10);
  await env.ANALYTICS.put(key, String(current + 1), { expirationTtl: 60 * 60 * 24 * 95 });
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

async function sha256(message) {
  const data = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
