// Al cambiar algo de la app (por ejemplo el calendario), sube VERSION para que los iPhone lo descarguen.
const VERSION = "farmacias-v1.0.0";
const FILES = [
  "./", "index.html", "manifest.webmanifest",
  "assets/fernandez%20mena.jpg", "assets/garcia%20cotano.jpg", "assets/gomez%20munuera.jpg", "assets/saez%20fajardo.png",
  "fonts/inter-latin-300-normal.woff2", "fonts/inter-latin-400-normal.woff2", "fonts/inter-latin-500-normal.woff2", "fonts/inter-latin-600-normal.woff2",
  "fonts/playfair-display-latin-700-normal.woff2", "fonts/playfair-display-latin-900-normal.woff2",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== VERSION).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
