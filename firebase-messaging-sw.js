importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD8ZTZLXzGPxoKyWNr1xIBjC-MJye9wLV0",
  authDomain: "universe-class-aap.firebaseapp.com",
  projectId: "universe-class-aap",
  storageBucket: "universe-class-aap.firebasestorage.app",
  messagingSenderId: "461911951937",
  appId: "1:461911951937:web:d00659ff6b099bba53d4c0",
  databaseURL: "https://universe-class-aap-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Universe Classes', {
    body: body || 'Nayi update hai!',
    icon: icon || '/UNIVERSE-CLASSES/logo.jpeg',
    badge: '/UNIVERSE-CLASSES/logo.jpeg',
    vibrate: [200, 100, 200],
    data: payload.data || {}
  });
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://universe-classes.github.io/UNIVERSE-CLASSES/')
  );
});
