import {useCallback} from 'react';
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';

export const useNotificationActions = () => {
  const subscribeToRoom = useCallback(async (roomId: string): Promise<void> => {
    try {
      const subscribeToRoomNotifications = functions().httpsCallable(
        'subscribeToRoomNotifications',
      );
      await subscribeToRoomNotifications({roomId});
      console.log(
        `Successfully subscribed to notifications for room: ${roomId}`,
      );
    } catch (error) {
      console.error('Failed to subscribe to room notifications:', error);
    }
  }, []);

  const unsubscribeFromRoom = useCallback(
    async (roomId: string): Promise<void> => {
      try {
        const unsubscribeFromRoomNotifications = functions().httpsCallable(
          'unsubscribeFromRoomNotifications',
        );
        await unsubscribeFromRoomNotifications({roomId});
        console.log(`Unsubscribed from notifications for room: ${roomId}`);
      } catch (error) {
        console.error('Failed to unsubscribe from room notifications:', error);
      }
    },
    [],
  );

  const checkIfUserHasMessagesInRoom = useCallback(
    async (roomId: string): Promise<boolean> => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) {
          return false;
        }

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
    },
    [],
  );

  const promptForRoomNotificationSubscription = useCallback(
    async (
      roomId: string,
      roomName: string,
      onSubscribe: (roomId: string) => Promise<void>,
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
    unsubscribeFromRoom,
    checkIfUserHasMessagesInRoom,
    promptForRoomNotificationSubscription,
  };
};
