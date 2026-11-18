// Service worker: permite usar la app sin conexión en el navegador (iPhone / PWA).
// Al publicar una versión nueva, cambia VERSION para que los móviles la descarguen.
const VERSION = "mi-registro-v1.0.0";
const FILES = [
  "./", "index.html", "privacidad.html", "manifest.webmanifest",
  "css/app.css",
  "js/app.js", "js/db.js", "js/util.js", "js/platform.js", "js/report.js",
  "js/vendor/jspdf.umd.min.js", "js/vendor/capacitor-core.js",
  "fonts/Figtree_400Regular.ttf", "fonts/Figtree_600SemiBold.ttf", "fonts/Figtree_700Bold.ttf", "fonts/Figtree_800ExtraBold.ttf",
  "img/logo-full.png", "img/logo-mark.png", "img/logo-pdf.png", "img/logo-mark-pdf.png",
  "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});
