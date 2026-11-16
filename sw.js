// Stricker Außendienstassistent – Service Worker
// Online: immer zuerst die neueste Version vom Server holen.
// Offline: die zuletzt geladene Version aus dem Speicher nehmen.
const CACHE = 'stricker-v5';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(req, { cache: 'no-cache' });
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      if (req.mode === 'navigate') {
        const idx = (await cache.match('./', { ignoreSearch: true })) || (await cache.match('index.html', { ignoreSearch: true }));
        if (idx) return idx;
      }
      throw err;
    }
  })());
});
