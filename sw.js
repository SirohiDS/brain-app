/* NeuroForge service worker
   v3 — fixes: a single missing asset no longer aborts the whole install,
   HTML is network-first so updates actually reach the user, and only
   same-origin GETs are cached (Google Fonts requests no longer poison the cache). */
const CACHE = 'neuroforge-v3';
const ASSETS = [
  './',
  './index.html',
  './NeuroForge.html',
  './ReflexForge.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // addAll() rejects the ENTIRE install if any single asset 404s, which is how
    // the previous version silently failed. Add each asset independently instead.
    await Promise.all(ASSETS.map(url =>
      cache.add(new Request(url, { cache: 'reload' })).catch(err => {
        console.warn('[sw] skipped', url, err && err.message);
      })
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

function isHtml(req) {
  return req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // HTML: network-first, so a new deploy is picked up immediately.
  if (isHtml(req)) {
    e.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (sameOrigin && fresh.ok) {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (err) {
        const hit = await caches.match(req, { ignoreSearch: true });
        return hit || (await caches.match('./index.html')) ||
          new Response('<h1>Offline</h1><p>Open the app once while online to install it.</p>',
            { headers: { 'Content-Type': 'text/html' } });
      }
    })());
    return;
  }

  // Everything else: cache-first, refresh in the background.
  e.respondWith((async () => {
    const hit = await caches.match(req, { ignoreSearch: true });
    if (hit) return hit;
    try {
      const fresh = await fetch(req);
      // Only cache successful same-origin responses. Opaque cross-origin
      // responses (fonts, CDN) are returned but not stored.
      if (sameOrigin && fresh.ok) {
        const cache = await caches.open(CACHE);
        cache.put(req, fresh.clone());
      }
      return fresh;
    } catch (err) {
      return Response.error();
    }
  })());
});
