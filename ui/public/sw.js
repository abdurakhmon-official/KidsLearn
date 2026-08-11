/**
 * KidsLearn service worker.
 *
 * Ikki xil strategiya:
 *  - statik fayllar (`/_next/static`, ikonkalar) — cache-first, ular
 *    o'zgarmaydi (hash bilan nomlangan);
 *  - navigatsiya — network-first, offline'da zaxira sahifa.
 *
 * API javoblari **umuman cache qilinmaydi**: ular `Authorization` header
 * bilan keladi va bir bolaning ma'lumoti boshqasiga ko'rinib qolishi mumkin.
 */

const VERSION = "v1";
const STATIC_CACHE = `kidslearn-static-${VERSION}`;
const PAGES_CACHE = `kidslearn-pages-${VERSION}`;

const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PAGES_CACHE).then((cache) => cache.addAll([OFFLINE_URL])),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PAGES_CACHE)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

const isStaticAsset = (url) =>
  url.pathname.startsWith("/_next/static/") ||
  url.pathname.startsWith("/icons/") ||
  url.pathname === "/manifest.json";

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Boshqa domenlar (jumladan API) — service worker aralashmaydi.
  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? caches.match(OFFLINE_URL))),
    );
  }
});
