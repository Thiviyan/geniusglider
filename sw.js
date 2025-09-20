/**
 * Service Worker for Geniusglider IT Services
 * Handles caching, offline functionality, and performance optimization
 */

const CACHE_NAME = 'geniusglider-v1.0.0';
const STATIC_CACHE_NAME = 'geniusglider-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'geniusglider-dynamic-v1.0.0';

// Files to cache immediately (app shell)
const STATIC_FILES = [
  '/',
  '/index.html',
  '/assets/css/critical.css',
  '/assets/css/styles.css',
  '/assets/js/app.js',
  '/assets/images/logo.svg',
  '/assets/images/logo-white.svg',
  '/manifest.json'
];

// Files that can be cached dynamically
const DYNAMIC_CACHE_PATTERNS = [
  /^https:\/\/fonts\.googleapis\.com/,
  /^https:\/\/fonts\.gstatic\.com/,
  /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
  /\.(?:css|js)$/
];

// Files/routes that should always fetch from network
const NETWORK_FIRST = [
  '/api/',
  '/contact',
  '?fresh=true'
];

// Maximum age for cached files (in milliseconds)
const CACHE_MAX_AGE = {
  static: 30 * 24 * 60 * 60 * 1000, // 30 days
  dynamic: 7 * 24 * 60 * 60 * 1000,  // 7 days
  api: 60 * 60 * 1000                 // 1 hour
};

// ===== SERVICE WORKER EVENTS =====

/**
 * Install Event - Cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Error caching static files:', error);
      })
  );
});

/**
 * Activate Event - Clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME &&
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName.startsWith('geniusglider-')) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch Event - Handle network requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request
  if (shouldUseNetworkFirst(request)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

/**
 * Background Sync - Handle offline form submissions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'consultation-form') {
    event.waitUntil(handleOfflineFormSubmission());
  }
});

/**
 * Push Event - Handle push notifications (future feature)
 */
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/assets/images/icon-192x192.png',
      badge: '/assets/images/badge-72x72.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

/**
 * Notification Click - Handle notification interactions
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});

// ===== CACHING STRATEGIES =====

/**
 * Cache First Strategy - For static assets
 */
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);

    if (cachedResponse && !isCacheExpired(cachedResponse)) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(getCacheName(request));
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);

    // Try to return cached version even if expired
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline.html') || new Response('Offline');
    }

    throw error;
  }
}

/**
 * Network First Strategy - For API calls and dynamic content
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Network first strategy failed:', error);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    throw error;
  }
}

/**
 * Stale While Revalidate Strategy - For regular pages
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  // Fetch from network in background
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.error('Network request failed:', error);
    });

  // Return cached version immediately if available
  if (cachedResponse && !isCacheExpired(cachedResponse)) {
    fetchPromise; // Continue background update
    return cachedResponse;
  }

  // Wait for network response if no cache or expired
  return fetchPromise || cachedResponse || new Response('Offline');
}

// ===== UTILITY FUNCTIONS =====

/**
 * Determine if request should use network-first strategy
 */
function shouldUseNetworkFirst(request) {
  return NETWORK_FIRST.some(pattern => {
    if (typeof pattern === 'string') {
      return request.url.includes(pattern);
    }
    return pattern.test(request.url);
  });
}

/**
 * Determine if request is for a static asset
 */
function isStaticAsset(request) {
  return STATIC_FILES.includes(new URL(request.url).pathname) ||
         request.url.includes('/assets/');
}

/**
 * Get appropriate cache name for request
 */
function getCacheName(request) {
  if (isStaticAsset(request)) {
    return STATIC_CACHE_NAME;
  }
  return DYNAMIC_CACHE_NAME;
}

/**
 * Check if cached response has expired
 */
function isCacheExpired(response) {
  const cachedDate = new Date(response.headers.get('date') || Date.now());
  const now = new Date();
  const age = now - cachedDate;

  // Use different max ages based on content type
  if (response.url.includes('/api/')) {
    return age > CACHE_MAX_AGE.api;
  } else if (isStaticAsset({ url: response.url })) {
    return age > CACHE_MAX_AGE.static;
  } else {
    return age > CACHE_MAX_AGE.dynamic;
  }
}

/**
 * Handle offline form submissions
 */
async function handleOfflineFormSubmission() {
  try {
    const db = await openDB();
    const offlineForms = await getOfflineForms(db);

    for (const form of offlineForms) {
      try {
        const response = await fetch('/api/consultation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form.data)
        });

        if (response.ok) {
          await deleteOfflineForm(db, form.id);
          console.log('Offline form submitted successfully');
        }
      } catch (error) {
        console.error('Failed to submit offline form:', error);
      }
    }
  } catch (error) {
    console.error('Error handling offline forms:', error);
  }
}

/**
 * Open IndexedDB for offline storage
 */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GeniusgliderDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('offlineForms')) {
        const store = db.createObjectStore('offlineForms', { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

/**
 * Get offline forms from IndexedDB
 */
async function getOfflineForms(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineForms'], 'readonly');
    const store = transaction.objectStore('offlineForms');
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Delete offline form from IndexedDB
 */
async function deleteOfflineForm(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['offlineForms'], 'readwrite');
    const store = transaction.objectStore('offlineForms');
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// ===== PERFORMANCE MONITORING =====

/**
 * Log performance metrics
 */
function logPerformanceMetrics() {
  if ('performance' in self) {
    const perfEntries = performance.getEntriesByType('navigation');
    if (perfEntries.length > 0) {
      const perfData = perfEntries[0];
      console.log('Service Worker Performance:', {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        totalTime: perfData.loadEventEnd - perfData.fetchStart
      });
    }
  }
}

// Log performance on load
self.addEventListener('load', logPerformanceMetrics);

console.log('Service Worker loaded successfully');