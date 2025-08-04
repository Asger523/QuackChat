import {createNavigationContainerRef} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

export const navigationRef = createNavigationContainerRef();

export async function navigateToChatRoomById(roomId: string) {
  if (navigationRef.isReady()) {
    try {
      // Get room details first
      const roomDoc = await firestore().collection('rooms').doc(roomId).get();
      if (roomDoc.exists) {
        const roomData = roomDoc.data();
        navigationRef.navigate('chatRoom', {
          roomId: roomId,
          roomName: roomData?.title || 'Chat Room',
        });
      }
    } catch (error) {
      console.error('Failed to navigate to chat room:', error);
    }
  }
}
