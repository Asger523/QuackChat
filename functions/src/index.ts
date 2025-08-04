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

  console.log(
    `Updating FCM token for user ${uid}: ${
      token ? 'Token provided' : 'No token'
    }`,
  );

  await admin.firestore().collection('users').doc(uid).set(
    {
      fcmToken: token,
    },
    {merge: true},
  );

  console.log(`FCM token successfully saved for user ${uid}`);
  return {success: true};
});

// Test notification function - for debugging
exports.sendTestNotification = onCall(async (request: CallableRequest) => {
  if (!request.auth) {
    throw new Error('User must be authenticated');
  }

  const uid = request.auth.uid;
  console.log(`Sending test notification to user: ${uid}`);

  // Get user's FCM token
  const userDoc = await admin.firestore().collection('users').doc(uid).get();
  const userData = userDoc.data();

  console.log(`User data exists: ${!!userData}`);
  console.log(`FCM token exists: ${!!userData?.fcmToken}`);

  if (!userData?.fcmToken) {
    console.error(`No FCM token found for user ${uid}`);
    throw new Error(
      'No FCM token found for user. Please enable notifications first.',
    );
  }

  const token = userData.fcmToken;
  console.log(`Using FCM token: ${token.substring(0, 20)}...`);

  const testPayload = {
    token: userData.fcmToken,
    notification: {
      title: 'Test Notification',
      body: 'This is a test notification from QuackChat!',
    },
    data: {
      roomId: 'test-room',
      messageId: 'test-message',
    },
    android: {
      notification: {
        channelId: 'default',
        priority: 'high' as const,
      },
    },
    apns: {
      payload: {
        aps: {
          alert: {
            title: 'Test Notification',
            body: 'This is a test notification from QuackChat!',
          },
          sound: 'default',
        },
      },
    },
  };

  try {
    console.log('Attempting to send notification...');
    const result = await admin.messaging().send(testPayload);
    console.log('Test notification sent successfully:', result);
    return {
      success: true,
      messageId: result,
      tokenPrefix: token.substring(0, 20),
    };
  } catch (error) {
    console.error('Failed to send test notification:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    const errorCode = (error as any)?.code || 'unknown';
    console.error('Error details - Code:', errorCode, 'Message:', errorMessage);

    // Return error in response instead of throwing to avoid serialization issues
    return {
      success: false,
      error: `${errorCode} - ${errorMessage}`,
      code: errorCode,
      message: errorMessage,
    };
  }
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
    const messageId = event.params.messageId;

    if (!message) {
      console.log('No message data found');
      return;
    }

    console.log(
      `Processing message ${messageId} in room ${roomId} from ${message.senderId}`,
    );

    // Get room details
    const roomDoc = await admin
      .firestore()
      .collection('rooms')
      .doc(roomId)
      .get();
    const room = roomDoc.data();

    if (!room) {
      console.log(`Room ${roomId} not found`);
      return;
    }

    console.log(`Room found: ${room.title}`);

    // Get all subscribers except the sender
    const subscribersSnapshot = await admin
      .firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('subscribers')
      .get();

    console.log(
      `Found ${subscribersSnapshot.docs.length} subscribers for room ${roomId}`,
    );

    const notificationPromises: Promise<string>[] = [];

    for (const subscriberDoc of subscribersSnapshot.docs) {
      const subscriberId = subscriberDoc.id;

      // Don't send notification to the sender
      if (subscriberId === message.senderId) {
        console.log(`Skipping notification for sender ${subscriberId}`);
        continue;
      }

      // Get user's FCM token
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(subscriberId)
        .get();
      const userData = userDoc.data();

      console.log(
        `User ${subscriberId} FCM token exists: ${!!userData?.fcmToken}`,
      );

      if (userData?.fcmToken) {
        const notificationPayload = {
          token: userData.fcmToken,
          notification: {
            title: room?.title || 'New Message',
            body: message.imageUrl ? '📷 Image' : message.text || 'New message',
          },
          data: {
            roomId: roomId,
            messageId: messageId,
          },
          android: {
            notification: {
              channelId: 'default',
              priority: 'high' as const,
            },
          },
          apns: {
            payload: {
              aps: {
                alert: {
                  title: room?.title || 'New Message',
                  body: message.imageUrl
                    ? '📷 Image'
                    : message.text || 'New message',
                },
                sound: 'default',
              },
            },
          },
        };

        console.log(
          `Sending notification to ${subscriberId}:`,
          notificationPayload,
        );
        notificationPromises.push(admin.messaging().send(notificationPayload));
      }
    }

    try {
      const results = await Promise.allSettled(notificationPromises);
      const successful = results.filter(
        result => result.status === 'fulfilled',
      ).length;
      const failed = results.filter(
        result => result.status === 'rejected',
      ).length;

      console.log(
        `Notifications sent - Success: ${successful}, Failed: ${failed}`,
      );

      // Log failed notifications
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`Notification ${index} failed:`, result.reason);
        }
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  },
);

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
