import {useState, useCallback} from 'react';
import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';
import auth from '@react-native-firebase/auth';
import {Platform, Alert} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import {navigateToChatRoomById} from '../services/navigationService';

export const useNotificationCore = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);

  // Check if the user has granted notification permissions
  const checkPermissionStatus = useCallback(async (): Promise<boolean> => {
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
  }, []);

  // Request notification permissions
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Handle device registration for iOS
      if (Platform.OS === 'ios') {
        try {
          // Check if the device is registered for remote messages
          const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
          if (!isRegistered) {
            await messaging().registerDeviceForRemoteMessages();
          }
        } catch (entitlementError) {
          console.log('Device registration failed:', entitlementError);
          setIsNotificationEnabled(false);
          return false;
        }
      }

      // Request notification permissions
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      // If the user denied permission, log it and return false
      if (!enabled) {
        console.log('Notification permission denied');
        setIsNotificationEnabled(false);
        return false;
      }

      // Request Android notification permission for API 33+
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          // If permission is not granted, log it and return false
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android notification permission denied');
            setIsNotificationEnabled(false);
            return false;
          }
        } catch (androidError) {
          console.warn('Android permission request failed:', androidError);
        }
      }

      setIsNotificationEnabled(true);
      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      setIsNotificationEnabled(false);
      return false;
    }
  }, []);

  // Get and save the FCM token
  // This function retrieves the FCM token and saves it to Firestore
  const getAndSaveToken = useCallback(async (): Promise<string | null> => {
    try {
      const token = await messaging().getToken();
      if (!token) {
        console.error('Failed to get FCM token');
        return null;
      }

      setFcmToken(token);
      console.log('FCM Token obtained:', token);

      // Save token to Firestore
      const user = auth().currentUser;
      if (user && token) {
        try {
          const updateUserTokenFunc =
            functions().httpsCallable('updateUserToken');
          await updateUserTokenFunc({token});
          console.log('Token saved to Firestore successfully');
        } catch (saveError) {
          console.error('Failed to save token to Firestore:', saveError);
        }
      }

      return token;
    } catch (error) {
      console.error('Failed to get and save token:', error);
      return null;
    }
  }, []);

  // Set up Firebase message handlers
  const setupMessageHandlers = useCallback(() => {
    // Handle messages when app is in foreground
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log('Foreground message:', remoteMessage);
      if (remoteMessage.notification) {
        Alert.alert(
          remoteMessage.notification.title || 'New Message',
          remoteMessage.notification.body || '',
          [
            {text: 'Dismiss', style: 'cancel'},
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
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log(
          'NotificationCore: Notification opened app:',
          remoteMessage,
        );
        if (
          remoteMessage.data?.roomId &&
          typeof remoteMessage.data.roomId === 'string'
        ) {
          navigateToChatRoomById(remoteMessage.data.roomId);
        }
      },
    );

    // Note: Initial notification handling is now done in SplashScreen to ensure proper navigation flow

    return () => {
      console.log('Cleaning up Firebase message handlers...');
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  return {
    fcmToken,
    isNotificationEnabled,
    setIsNotificationEnabled,
    setFcmToken,
    checkPermissionStatus,
    requestPermission,
    getAndSaveToken,
    setupMessageHandlers,
  };
};
