// Dream Builders 17 — Service Worker
// এটা মূলত সাইটটাকে "ইনস্টলযোগ্য" (PWA) বানানোর জন্য প্রয়োজন এবং সামান্য
// অফলাইন সাপোর্ট দেয় (নেটওয়ার্ক না থাকলে শেষবার লোড হওয়া পেজ দেখাবে)।
// এটা কোনো ডেটা/API রেসপন্স ক্যাশ করে না — শুধু মূল পেজ শেলটা ক্যাশ করে,
// তাই সবসময় লাইভ ডেটাই (সদস্য/জমা/লোন ইত্যাদি) দেখাবে, পুরনো কোনো ডেটা
// দেখাবে না।

const CACHE_NAME = 'db17-shell-v1';
const SHELL_FILES = ['./index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // শুধু GET রিকোয়েস্ট, আর শুধু এই সাইটের নিজের পেজের জন্যই — বাইরের
  // API কল (Google Apps Script) বা অন্য কোনো রিসোর্সে হাত দেওয়া হয় না।
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
