import {useCallback} from 'react';
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';

export const useNotificationActions = () => {
  // Subscribe to room notifications
  const subscribeToRoom = useCallback(async (roomId: string): Promise<void> => {
    try {
      // Call the Firebase function to subscribe to room notifications
      const subscribeToRoomNotifications = functions().httpsCallable(
        'subscribeToRoomNotifications',
      );
      // Pass the roomId to the function
      await subscribeToRoomNotifications({roomId});
      console.log(
        `Successfully subscribed to notifications for room: ${roomId}`,
      );
    } catch (error) {
      console.error('Failed to subscribe to room notifications:', error);
    }
  }, []);
  // Check if the user has messages in the room
  const checkIfUserHasMessagesInRoom = useCallback(
    async (roomId: string): Promise<boolean> => {
      try {
        // Get the current user
        const currentUser = auth().currentUser;
        if (!currentUser) {
          return false;
        }
        // Check if the user has sent any messages in the room
        const snapshot = await firestore()
          .collection('rooms')
          .doc(roomId)
          .collection('messages')
          .where('senderId', '==', currentUser.uid)
          .limit(1)
          .get();
        // If the snapshot is not empty, the user has messages in the room
        return !snapshot.empty;
      } catch (error) {
        console.error('Error checking user messages in room:', error);
        return false;
      }
    },
    [],
  );
  // Prompt the user to subscribe to room notifications
  const promptForRoomNotificationSubscription = useCallback(
    async (
      roomId: string,
      roomName: string,
      onSubscribe: (roomId: string) => Promise<void>,
    ): Promise<boolean> => {
      return new Promise(resolve => {
        // Show an alert to the user asking if they want to enable notifications
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
                  await onSubscribe(roomId);
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
    },
    [],
  );

  return {
    subscribeToRoom,
    checkIfUserHasMessagesInRoom,
    promptForRoomNotificationSubscription,
  };
};
