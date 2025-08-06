import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Alert, Platform} from 'react-native';
import {PermissionsAndroid} from 'react-native';
import {navigateToChatRoomById} from '../services/navigationService';

// Define the context interface
interface NotificationContextInterface {
  fcmToken: string | null;
  isNotificationEnabled: boolean;
  requestPermission: () => Promise<boolean>;
  checkPermissionStatus: () => Promise<boolean>;
  subscribeToRoom: (roomId: string) => Promise<void>;
  unsubscribeFromRoom: (roomId: string) => Promise<void>;
  promptForRoomNotificationSubscription: (
    roomId: string,
    roomName: string,
  ) => Promise<boolean>;
  checkIfUserHasMessagesInRoom: (roomId: string) => Promise<boolean>;
}

// Create the context
const NotificationContext = createContext<NotificationContextInterface>({
  fcmToken: null,
  isNotificationEnabled: false,
  requestPermission: async () => false,
  checkPermissionStatus: async () => false,
  subscribeToRoom: async () => {},
  unsubscribeFromRoom: async () => {},
  promptForRoomNotificationSubscription: async () => false,
  checkIfUserHasMessagesInRoom: async () => false,
});

export const NotificationProvider = ({children}) => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(false);
  const messageHandlersSetup = useRef(false);
  const unsubscribeHandlers = useRef<(() => void) | null>(null);

  // Initialize notifications on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      const unsubscribe = auth().onAuthStateChanged(async user => {
        if (user) {
          console.log('User authenticated, initializing notifications...');

          // Add delay to ensure device registration from App.tsx completes
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Only setup message handlers once
          if (!messageHandlersSetup.current) {
            console.log('Setting up message handlers...');
            const cleanup = setupMessageHandlers();
            unsubscribeHandlers.current = cleanup;
            messageHandlersSetup.current = true;
          }

          // Check current permission status
          const hasPermission = await checkPermissionStatus();
          console.log('Current notification permission status:', hasPermission);

          // If we have permissions, get the token and save it
          if (hasPermission) {
            try {
              const token = await messaging().getToken();
              if (token) {
                setFcmToken(token);
                console.log('FCM Token obtained on init:', token);

                // Save token to Firestore
                try {
                  const updateUserTokenFunc =
                    functions().httpsCallable('updateUserToken');
                  await updateUserTokenFunc({token});
                  console.log('Token saved to Firestore on init');
                } catch (saveError) {
                  console.error('Failed to save token on init:', saveError);
                }
              }
            } catch (tokenError) {
              console.error('Failed to get token on init:', tokenError);
            }
          }
        } else {
          console.log('User not authenticated, resetting notification state');
          setIsNotificationEnabled(false);
          setFcmToken(null);
        }
      });

      return unsubscribe;
    };

    initializeNotifications();

    // Cleanup function
    return () => {
      if (unsubscribeHandlers.current) {
        unsubscribeHandlers.current();
        unsubscribeHandlers.current = null;
      }
      messageHandlersSetup.current = false;
    };
  }, []); // Remove isInitialized dependency to avoid loops

  // Request notification permissions
  const requestPermission = async (): Promise<boolean> => {
    try {
      console.log('Starting notification permission request...');

      // Handle device registration for iOS first
      if (Platform.OS === 'ios') {
        try {
          const isRegistered = messaging().isDeviceRegisteredForRemoteMessages;
          console.log('iOS device registration status:', isRegistered);
          if (!isRegistered) {
            await messaging().registerDeviceForRemoteMessages();
            console.log('iOS device registered for remote messages');
          }
        } catch (entitlementError) {
          console.warn(
            'iOS push notification entitlements not configured:',
            entitlementError,
          );
          setIsNotificationEnabled(false);
          return false;
        }
      }

      // Request notification permissions
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      console.log(
        'Notification permission status:',
        authStatus,
        'Enabled:',
        enabled,
      );

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
          console.log('Android notification permission:', granted);
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android notification permission denied');
            setIsNotificationEnabled(false);
            return false;
          }
        } catch (androidError) {
          console.warn('Android permission request failed:', androidError);
          // Continue anyway for older Android versions
        }
      }

      // Get FCM token
      const token = await messaging().getToken();
      console.log('FCM Token obtained:', token ? 'Yes' : 'No');

      if (!token) {
        console.error('Failed to get FCM token');
        setIsNotificationEnabled(false);
        return false;
      }

      setFcmToken(token);
      setIsNotificationEnabled(true);
      console.log('FCM Token:', token);

      // Save token to user's profile in Firestore
      const user = auth().currentUser;
      if (user && token) {
        try {
          const updateUserTokenFunc =
            functions().httpsCallable('updateUserToken');
          const result = await updateUserTokenFunc({token});
          console.log('Token saved to Firestore successfully:', result);

          // Verify the token was saved by checking Firestore directly
          const userDoc = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();
          const userData = userDoc.data();
          console.log(
            'User document after token save:',
            userData?.fcmToken ? 'Token exists' : 'No token found',
          );
        } catch (saveError) {
          console.error('Failed to save token to Firestore:', saveError);
        }
      } else {
        console.warn('No authenticated user found or no token to save');
      }

      return true;
    } catch (error) {
      console.error('Permission request failed:', error);
      setIsNotificationEnabled(false);
      return false;
    }
  };

  // Set up message handlers for foreground and background notifications
  const setupMessageHandlers = () => {
    console.log('Registering Firebase message handlers...');

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
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      remoteMessage => {
        console.log('Notification opened app:', remoteMessage);
        // Navigate to specific chat room if data contains roomId
        if (
          remoteMessage.data?.roomId &&
          typeof remoteMessage.data.roomId === 'string'
        ) {
          console.log('Navigating to room:', remoteMessage.data.roomId);
          navigateToChatRoomById(remoteMessage.data.roomId);
        }
      },
    );

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
            }, 500);
          }
        }
      });

    // Return cleanup function that unsubscribes from all handlers
    return () => {
      console.log('Cleaning up Firebase message handlers...');
      unsubscribeForeground();
      unsubscribeBackground();
    };
  };

  // Subscribe to room notifications
  const subscribeToRoom = async (roomId: string) => {
    try {
      console.log(
        `Attempting to subscribe to room notifications for: ${roomId}`,
      );

      // If notifications aren't enabled, try to enable them automatically
      if (!isNotificationEnabled) {
        console.log('Notifications not enabled, requesting permission...');
        const granted = await requestPermission();
        if (!granted) {
          console.log(
            'Permission denied, cannot subscribe to room notifications',
          );
          return;
        }
      }

      const subscribeToRoomNotifications = functions().httpsCallable(
        'subscribeToRoomNotifications',
      );
      const result = await subscribeToRoomNotifications({roomId});
      console.log(
        `Successfully subscribed to notifications for room: ${roomId}`,
        result,
      );
    } catch (error) {
      console.error('Failed to subscribe to room notifications:', error);
    }
  };

  // Unsubscribe from room notifications
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

  // Check notification permission status
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

  // Check if user has any messages in the room
  const checkIfUserHasMessagesInRoom = async (
    roomId: string,
  ): Promise<boolean> => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) return false;

      const snapshot = await firestore()
        .collection('rooms')
        .doc(roomId)
        .collection('messages')
        .where('senderId', '==', currentUser.uid)
        .limit(1)
        .get();

      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking user messages in room:', error);
      return false;
    }
  };

  // Prompt user for notification subscription on first message
  const promptForRoomNotificationSubscription = async (
    roomId: string,
    roomName: string,
  ): Promise<boolean> => {
    return new Promise(resolve => {
      Alert.alert(
        'Enable Notifications?',
        `Would you like to receive notifications for new messages in "${roomName}"?`,
        [
          {
            text: 'No Thanks',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Enable',
            onPress: async () => {
              try {
                await subscribeToRoom(roomId);
                resolve(true);
              } catch (error) {
                console.error('Failed to subscribe to room:', error);
                resolve(false);
              }
            },
          },
        ],
        {cancelable: false},
      );
    });
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
        promptForRoomNotificationSubscription,
        checkIfUserHasMessagesInRoom,
      }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
