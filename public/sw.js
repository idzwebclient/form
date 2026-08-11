const CACHE_PREFIX = "qudani-forms";
const CACHE_NAME = `${CACHE_PREFIX}-v1`;
const APP_SHELL = [
  "/",
  "/claim-form",
  "/advance-form",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/brand/qudani-wordmark-white.png",
  "/brand/qudani-logo-black.png",
  "/forms/branch-purchase/page-2-template.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(APP_SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname === "/sw.js") return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch {
        const cached = await cache.match(request);
        if (cached) return cached;

        if (request.mode === "navigate") {
          const home = await cache.match("/");
          if (home) return home;
        }

        return new Response("Offline", { status: 503, statusText: "Offline" });
      }
    }),
  );
});
