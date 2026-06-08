// Firebase Cloud Messaging Service Worker
// Yeh file repo ROOT mein honi chahiye

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD8ZTZLXzGPxoKyWNr1xIBjC-MJye9wLV0",
  authDomain: "universe-class-aap.firebaseapp.com",
  projectId: "universe-class-aap",
  storageBucket: "universe-class-aap.firebasestorage.app",
  messagingSenderId: "461911951937",
  appId: "1:461911951937:web:d00659ff6b099bba53d4c0"
});

const messaging = firebase.messaging();

// Background message handler (jab app band ho)
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const { title, body, icon } = payload.notification || {};

  self.registration.showNotification(title || 'Universe Classes', {
    body: body || 'Naya update aaya hai!',
    icon: icon || '/UNIVERSE-CLASSES/UNIVERSE%20CLASSES/logo.jpeg',
    badge: '/UNIVERSE-CLASSES/UNIVERSE%20CLASSES/logo.jpeg',
    vibrate: [200, 100, 200],
    data: payload.data || {},
    actions: [
      { action: 'open', title: '📖 Dekho' },
      { action: 'close', title: '✕ Band Karo' }
    ]
  });
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('https://universe-classes.github.io/UNIVERSE-CLASSES/')
    );
  }
});
