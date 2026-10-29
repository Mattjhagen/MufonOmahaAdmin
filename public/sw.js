// Keep authenticated pages and private case data out of offline caches.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch {}
  event.waitUntil(self.registration.showNotification(payload.title || 'Omaha MUFON Admin', {
    body: payload.body || 'New admin activity is available.',
    icon: '/android-chrome-192x192.png', badge: '/favicon-32x32.png',
    tag: payload.tag || 'mufon-admin', data: { url: '/' }
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const tabs = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const tab of tabs) if (new URL(tab.url).origin === self.location.origin) return tab.focus();
    return self.clients.openWindow('/');
  })());
});
