// Offline-Cache: alle App-Dateien werden beim ersten Start gespeichert.
// Beim Update werden die Dateien frisch vom Server geholt (cache: 'reload'), nicht aus dem Browser-Zwischenspeicher.
// Die Daten selbst liegen nicht hier, sondern im Speicher der App (localStorage).
const CACHE = 'mealprep-fb2a61c57c';
const FILES = ['./', 'index.html', 'app.js', 'app.css', 'icon.svg', 'wasm_exec.js', 'main.wasm', 'manifest.webmanifest',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'heute.html', 'einkaufsliste.html'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true })
    .then(hit => hit || (/\/(heute|einkaufsliste)\/?$/.test(new URL(e.request.url).pathname)
      ? caches.match(new URL(e.request.url).pathname.replace(/\/?$/, '.html').replace(/\/\.html$/, '.html')) : null))
    .then(hit => hit || fetch(e.request)));
});
