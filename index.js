const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Jab bhi pending_notifications mein naya doc aaye, sab users ko push bhejo
exports.sendPushNotification = functions.firestore
  .document('pending_notifications/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    if (data.sent) return null; // Already sent
    
    try {
      // Sab users ke FCM tokens lo
      const usersSnap = await admin.firestore()
        .collection('users')
        .where('fcmToken', '!=', null)
        .get();
      
      const tokens = [];
      usersSnap.forEach(doc => {
        const token = doc.data().fcmToken;
        if (token) tokens.push(token);
      });
      
      if (!tokens.length) {
        console.log('Koi FCM token nahi mila');
        await snap.ref.update({ sent: true, sentAt: admin.firestore.FieldValue.serverTimestamp() });
        return null;
      }
      
      console.log(`${tokens.length} users ko notification bhej raha hoon...`);
      
      // Batch mein bhejo (max 500 per batch)
      const batchSize = 500;
      for (let i = 0; i < tokens.length; i += batchSize) {
        const batchTokens = tokens.slice(i, i + batchSize);
        
        const message = {
          notification: {
            title: data.title || 'Universe Classes',
            body: data.body || 'Naya update aaya hai!',
          },
          data: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
            url: 'https://universe-classes.github.io/UNIVERSE-CLASSES/'
          },
          tokens: batchTokens,
          webpush: {
            notification: {
              icon: 'https://universe-classes.github.io/UNIVERSE-CLASSES/UNIVERSE%20CLASSES/logo.jpeg',
              badge: 'https://universe-classes.github.io/UNIVERSE-CLASSES/UNIVERSE%20CLASSES/logo.jpeg',
              vibrate: [200, 100, 200],
              requireInteraction: false,
            },
            fcmOptions: {
              link: 'https://universe-classes.github.io/UNIVERSE-CLASSES/'
            }
          }
        };
        
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Sent: ${response.successCount}, Failed: ${response.failureCount}`);
        
        // Invalid tokens hata do
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            if (errCode === 'messaging/invalid-registration-token' ||
                errCode === 'messaging/registration-token-not-registered') {
              failedTokens.push(batchTokens[idx]);
            }
          }
        });
        
        // Invalid tokens Firestore se delete karo
        if (failedTokens.length) {
          const batch = admin.firestore().batch();
          usersSnap.forEach(doc => {
            if (failedTokens.includes(doc.data().fcmToken)) {
              batch.update(doc.ref, { fcmToken: admin.firestore.FieldValue.delete() });
            }
          });
          await batch.commit();
          console.log(`${failedTokens.length} invalid tokens removed`);
        }
      }
      
      // Sent mark karo
      await snap.ref.update({
        sent: true,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        recipientCount: tokens.length
      });
      
      console.log('✅ Notification successfully sent!');
      return null;
      
    } catch (error) {
      console.error('Push error:', error);
      await snap.ref.update({ sent: true, error: error.message });
      return null;
    }
  });
