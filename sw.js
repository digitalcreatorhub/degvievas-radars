/* Degvielas Radars service worker: app shell offline, data network-first. */
const VERSION = "v12";
// The preview (/next/) and the main site share one origin, so each keeps its own cache names.
const PREFIX = self.location.pathname.includes("/next/") ? "drn" : "dr";
const SHELL = `${PREFIX}-shell-${VERSION}`;
const DATA = `${PREFIX}-data-${VERSION}`;
const FILES = ["./", "index.html", "style.css", "app.js", "map.js", "charts.js", "stats.js", "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(PREFIX + "-") && ![SHELL, DATA].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.includes("/data/")) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(DATA).then((c) => c.put(req.url.split("?")[0], copy));
        return res;
      }).catch(() => caches.match(req.url.split("?")[0]).then((hit) => hit || Response.error()))
    );
    return;
  }
  e.respondWith(
    fetch(req, { cache: "no-cache" }).then((res) => {
      const copy = res.clone();
      caches.open(SHELL).then((c) => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")))
  );
});
