// Offline cache for House Plan Studio. Bump VERSION when publishing a new build.
const VERSION = "hps-202610291935";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];
const LIBS = ["https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js", "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/GLTFExporter.js", "https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/OBJExporter.js", "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js", "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans+Condensed:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap"];
self.addEventListener("install", e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    await c.addAll(CORE);
    await Promise.all(LIBS.map(async u => { try { const r = await fetch(new Request(u, { mode: "no-cors" })); await c.put(u, r); } catch { } }));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.hostname === "api.anthropic.com") return;
  if (u.origin === location.origin) {
    // the app itself: try the network so updates arrive, fall back to the cached copy offline
    e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
  } else {
    // libraries and fonts never change at a pinned version: cache first
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const cp = res.clone(); caches.open(VERSION).then(c => c.put(e.request, cp)); return res; })));
  }
});
