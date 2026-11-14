self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
// Network-only by design: authenticated pages and private messages must not be cached.
self.addEventListener("fetch", (event) => event.respondWith(fetch(event.request)));
