/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from 'firebase-functions/v2';
import {onCall, CallableRequest} from 'firebase-functions/v2/https';
import {onDocumentCreated} from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit.
setGlobalOptions({maxInstances: 10});

// Update user's FCM token
exports.updateUserToken = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const {token} = request.data;
  const uid = request.auth.uid;

  await admin.firestore().collection('users').doc(uid).set(
    {
      fcmToken: token,
    },
    {merge: true},
  );

  return {success: true};
});

// Subscribe to room notifications
exports.subscribeToRoomNotifications = onCall(
  async (request: CallableRequest) => {
    if (!request.auth) {
      throw new Error('User must be authenticated');
    }

    const {roomId} = request.data;
    const uid = request.auth.uid;

    // Add user to room subscribers
    await admin
      .firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('subscribers')
      .doc(uid)
      .set({
        subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {success: true};
  },
);

// Unsubscribe from room notifications
exports.unsubscribeFromRoomNotifications = onCall(
  async (request: CallableRequest) => {
    if (!request.auth) {
      throw new Error('User must be authenticated');
    }

    const {roomId} = request.data;
    const uid = request.auth.uid;

    // Remove user from room subscribers
    await admin
      .firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('subscribers')
      .doc(uid)
      .delete();

    return {success: true};
  },
);

// Trigger notification when new message is added
exports.onMessageCreated = onDocumentCreated(
  'rooms/{roomId}/messages/{messageId}',
  async event => {
    const snap = event.data;
    const message = snap?.data();
    const roomId = event.params.roomId;

    if (!message) return;

    // Get room details
    const roomDoc = await admin
      .firestore()
      .collection('rooms')
      .doc(roomId)
      .get();
    const room = roomDoc.data();

    // Get all subscribers except the sender
    const subscribersSnapshot = await admin
      .firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('subscribers')
      .get();

    const notificationPromises: Promise<string>[] = [];

    for (const subscriberDoc of subscribersSnapshot.docs) {
      const subscriberId = subscriberDoc.id;

      // Don't send notification to the sender
      if (subscriberId === message.senderId) continue;

      // Get user's FCM token
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(subscriberId)
        .get();
      const userData = userDoc.data();

      if (userData?.fcmToken) {
        const notificationPayload = {
          token: userData.fcmToken,
          notification: {
            title: room?.title || 'New Message',
            body: message.imageUrl ? '📷 Image' : message.text,
          },
          data: {
            roomId: roomId,
            messageId: event.id,
          },
        };

        notificationPromises.push(admin.messaging().send(notificationPayload));
      }
    }

    await Promise.all(notificationPromises);
    console.log(
      `Sent ${notificationPromises.length} notifications for room ${roomId}`,
    );
  },
);

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
