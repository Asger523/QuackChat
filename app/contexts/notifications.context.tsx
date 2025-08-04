import React, {createContext, useContext, useEffect, useState} from 'react';
import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';
import {Alert, Platform} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import {navigateToChatRoomById} from '../services/navigationService';

interface NotificationContextInterface {
  fcmToken: string | null;
  isNotificationEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  checkPermissionStatus: () => Promise<boolean>;
  subscribeToRoom: (roomId: string) => Promise<void>;
  unsubscribeFromRoom: (roomId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextInterface>({
  fcmToken: null,
  isNotificationEnabled: false,
  requestPermission: async () => false,
  checkPermissionStatus: async () => false,
  subscribeToRoom: async () => {},
  unsubscribeFromRoom: async () => {},
});

export const NotificationProvider = ({children}) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  useEffect(() => {
    const initializeNotifications = async () => {
      // Wait for auth state to be ready
      const unsubscribe = auth().onAuthStateChanged(async user => {
        if (user && !isInitialized) {
          setIsInitialized(true);
          // Add delay to ensure device registration from App.tsx completes
          await new Promise(resolve => setTimeout(resolve, 1000));
          await requestPermission();
          setupMessageHandlers();
        }
      });

      return unsubscribe;
    };

    initializeNotifications();
  }, [isInitialized]);

  const requestPermission = async (): Promise<boolean> => {
    try {
      // Skip device registration on iOS if entitlements are missing
      if (Platform.OS === 'ios') {
        try {
          const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
          if (!isRegistered) {
            await messaging().registerDeviceForRemoteMessages();
          }
        } catch (entitlementError) {
          console.warn(
            'iOS push notification entitlements not configured:',
            entitlementError,
          );
          // Continue without push notifications for now
          return false;
        }
      }

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          return false;
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        try {
          const token = await messaging().getToken();
          setFcmToken(token);
          setIsNotificationEnabled(true);
          console.log('FCM Token:', token);

          // Save token to user's profile in Firestore
          const user = auth().currentUser;
          if (user && token) {
            await functions().httpsCallable('updateUserToken')({token});
            console.log('Token saved to Firestore');
          }
        } catch (tokenError) {
          console.error('Failed to get FCM token:', tokenError);
          setIsNotificationEnabled(false);
          return false;
        }
      } else {
        setIsNotificationEnabled(false);
      }

      return enabled;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  };

  const setupMessageHandlers = () => {
    // Handle messages when app is in foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'New Message',
          remoteMessage.notification.body || '',
          [
            {
              text: 'Dismiss',
              style: 'cancel',
            },
            {
              text: 'View',
              onPress: () => {
                if (
                  remoteMessage.data?.roomId &&
                  typeof remoteMessage.data.roomId === 'string'
                ) {
                  navigateToChatRoomById(remoteMessage.data.roomId);
                }
              },
            },
          ],
        );
      }
    });

    // Handle messages when app is opened from background/quit state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification opened app:', remoteMessage);
      // Navigate to specific chat room if data contains roomId
      if (
        remoteMessage.data?.roomId &&
        typeof remoteMessage.data.roomId === 'string'
      ) {
        console.log('Navigating to room:', remoteMessage.data.roomId);
        navigateToChatRoomById(remoteMessage.data.roomId);
      }
    });

    // Handle initial notification when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Initial notification:', remoteMessage);
          // Handle navigation to specific room
          if (
            remoteMessage.data?.roomId &&
            typeof remoteMessage.data.roomId === 'string'
          ) {
            console.log(
              'Navigating to room from initial notification:',
              remoteMessage.data.roomId,
            );
            // Add a small delay to ensure navigation is ready
            setTimeout(() => {
              navigateToChatRoomById(remoteMessage.data!.roomId as string);
            }, 1000);
          }
        }
      });

    return unsubscribeForeground;
  };

  const subscribeToRoom = async (roomId: string) => {
    try {
      const subscribeToRoomNotifications = functions().httpsCallable(
        'subscribeToRoomNotifications',
      );
      await subscribeToRoomNotifications({roomId});
      console.log(`Subscribed to notifications for room: ${roomId}`);
    } catch (error) {
      console.error('Failed to subscribe to room notifications:', error);
    }
  };

  const unsubscribeFromRoom = async (roomId: string) => {
    try {
      const unsubscribeFromRoomNotifications = functions().httpsCallable(
        'unsubscribeFromRoomNotifications',
      );
      await unsubscribeFromRoomNotifications({roomId});
      console.log(`Unsubscribed from notifications for room: ${roomId}`);
    } catch (error) {
      console.error('Failed to unsubscribe from room notifications:', error);
    }
  };

  const checkPermissionStatus = async (): Promise<boolean> => {
    try {
      const authStatus = await messaging().hasPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      setIsNotificationEnabled(enabled);
      return enabled;
    } catch (error) {
      console.error('Failed to check permission status:', error);
      setIsNotificationEnabled(false);
      return false;
    }
  };

  // Check permission status on mount and when user changes
  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      checkPermissionStatus();
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        fcmToken,
        isNotificationEnabled,
        requestPermission,
        checkPermissionStatus,
        subscribeToRoom,
        unsubscribeFromRoom,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
