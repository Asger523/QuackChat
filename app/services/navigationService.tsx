import {createNavigationContainerRef} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

export const navigationRef = createNavigationContainerRef();

// Get room information from Firestore
export const getRoomInfo = async (
  roomId: string,
): Promise<{roomName: string} | null> => {
  try {
    const roomDoc = await firestore().collection('rooms').doc(roomId).get();
    if (roomDoc.exists) {
      const roomData = roomDoc.data();
      return {
        roomName: roomData?.title || 'Chat Room',
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching room info:', error);
    return null;
  }
};

// Navigate to a specific chat room
export const navigateToChatRoom = (roomId: string, roomName: string) => {
  if (navigationRef.isReady()) {
    // @ts-ignore
    navigationRef.navigate('chatRoom', {roomId, roomName});
  }
};

// Navigate to a chat room by ID, fetching room info if needed
export const navigateToChatRoomById = async (roomId: string) => {
  const roomInfo = await getRoomInfo(roomId);
  if (roomInfo) {
    navigateToChatRoom(roomId, roomInfo.roomName);
  } else {
    // Fallback with generic name if room info couldn't be fetched
    navigateToChatRoom(roomId, 'Chat Room');
  }
};
