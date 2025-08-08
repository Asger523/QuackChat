import {useContext, useEffect, useRef, useState, useCallback} from 'react';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import {useNotificationCore} from './use.notificationCore';
import {useNotificationActions} from './use.notificationActions';
import {NotificationContext} from '../contexts/notifications.context';

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  const messageHandlersSetup = useRef(false);
  const unsubscribeHandlers = useRef<(() => void) | null>(null);
  const [pendingNavigation, setPendingNavigation] = useState<{
    roomId: string;
    roomName: string;
  } | null>(null);

  if (!context) {
    throw new Error(
      'useNotifications must be used within a NotificationProvider',
    );
  }

  // Use consolidated hooks
  const {
    fcmToken,
    setIsNotificationEnabled,
    setFcmToken,
    checkPermissionStatus,
    requestPermission,
    getAndSaveToken,
    setupMessageHandlers,
  } = useNotificationCore();

  const {
    subscribeToRoom: subscribeToRoomBase,
    checkIfUserHasMessagesInRoom,
    promptForRoomNotificationSubscription:
      promptForRoomNotificationSubscriptionBase,
  } = useNotificationActions();

  const subscribeToRoom = async (roomId: string) => {
    try {
      console.log(
        `User sending first message in room: ${roomId}, handling notification setup...`,
      );

      // Check current permission status
      console.log('Checking permissions for room subscription...');
      const hasPermission = await checkPermissionStatus();

      if (!hasPermission) {
        console.log('No permissions, requesting permission...');
        const granted = await requestPermission();
        if (!granted) {
          console.log(
            'Permission denied, cannot subscribe to room notifications',
          );
          return;
        }
      }

      // Always ensure we have a token when subscribing (whether permissions were just granted or already existed)
      if (!fcmToken) {
        console.log(
          'Getting FCM token for first message notification setup...',
        );
        await getAndSaveToken();
      } else {
        console.log('Token already exists, proceeding with room subscription');
      }

      // Subscribe to the specific room
      await subscribeToRoomBase(roomId);
    } catch (error) {
      console.error('Failed to subscribe to room notifications:', error);
    }
  };

  // Enhanced promptForRoomNotificationSubscription that uses the local subscribeToRoom
  const promptForRoomNotificationSubscription = async (
    roomId: string,
    roomName: string,
  ): Promise<boolean> => {
    return promptForRoomNotificationSubscriptionBase(
      roomId,
      roomName,
      subscribeToRoom,
    );
  };

  // Function to check for initial notification that opened the app
  const checkInitialNotification = useCallback(async () => {
    try {
      console.log('Checking for initial notification...');
      const remoteMessage = await messaging().getInitialNotification();

      if (
        remoteMessage?.data?.roomId &&
        typeof remoteMessage.data.roomId === 'string'
      ) {
        console.log(
          'Initial notification found with roomId:',
          remoteMessage.data.roomId,
        );
        const pendingNav = {
          roomId: remoteMessage.data.roomId,
          roomName:
            typeof remoteMessage.data.roomName === 'string'
              ? remoteMessage.data.roomName
              : 'Chat Room',
        };
        setPendingNavigation(pendingNav);
        return pendingNav;
      } else {
        console.log('No initial notification or no roomId found');
        return null;
      }
    } catch (error) {
      console.error('Error checking initial notification:', error);
      return null;
    }
  }, []);

  // Function to clear pending navigation (call this after navigation is complete)
  const clearPendingNavigation = useCallback(() => {
    setPendingNavigation(null);
  }, []);

  // Initialize notifications on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      const unsubscribe = auth().onAuthStateChanged(async user => {
        if (user) {
          console.log('User authenticated, setting up message handlers...');

          // Add delay to ensure device registration from App.tsx completes
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Only setup message handlers once
          if (!messageHandlersSetup.current) {
            console.log('Setting up message handlers...');
            const cleanup = setupMessageHandlers();
            unsubscribeHandlers.current = cleanup;
            messageHandlersSetup.current = true;
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
  }, [setIsNotificationEnabled, setFcmToken, setupMessageHandlers]);

  return {
    ...context,
    subscribeToRoom,
    promptForRoomNotificationSubscription,
    requestPermission,
    checkPermissionStatus,
    checkIfUserHasMessagesInRoom,
    pendingNavigation,
    checkInitialNotification,
    clearPendingNavigation,
  };
};
