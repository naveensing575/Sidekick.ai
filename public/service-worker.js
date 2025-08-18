const STATIC_CACHE = 'sidekick-static-v1'
const DYNAMIC_CACHE = 'sidekick-dynamic-v1'

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-icon.png',
]

// Install event → pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)))
})

// Activate event → clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
  )
  return self.clients.claim()
})

// Fetch handler
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests (like POST to /api/rename-chat, streaming, etc.)
  if (request.method !== 'GET') return

  // API calls (network-first strategy)
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const resClone = res.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, resClone))
          return res
        })
        .catch(() => caches.match(request))
    )
    return
  }

  // Static + page assets (cache-first strategy)
  event.respondWith(
    caches.match(request).then((cachedRes) => {
      if (cachedRes) return cachedRes
      return fetch(request)
        .then((res) => {
          const resClone = res.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, resClone))
          return res
        })
        .catch(() => {
          if (request.mode === 'navigate') {
            return caches.match('/') // offline fallback
          }
        })
    })
  )
})
