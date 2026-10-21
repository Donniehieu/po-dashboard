// Service worker: chỉ lưu "vỏ" ứng dụng để mở nhanh/cài lên màn hình. Không bao giờ lưu dữ liệu GitHub (dữ liệu nằm trong IndexedDB của trang).
const CACHE = "qlpo-shell-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return; // api.github.com, Odoo… đi thẳng ra mạng
  // mạng trước (luôn lấy bản mới nhất), mất mạng mới dùng bản đã lưu
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request).then(m => m || caches.match("index.html"))));
});
