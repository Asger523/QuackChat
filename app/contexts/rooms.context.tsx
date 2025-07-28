import React, {createContext, useContext, useEffect, useState} from 'react';
import firestore, {Timestamp} from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Define the Room interface
interface Room {
  id: string;
  title: string;
  description: string;
  lastMessageTimestamp: Timestamp;
}

// Define the context interface
interface RoomContextInterface {
  rooms: Room[];
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>; // Exclude `id` when adding a room
  updateRoom: (roomId: string, updatedRoom: Partial<Room>) => Promise<void>;
  fetchRooms: () => Promise<void>;
}

// Create the context
const RoomContext = createContext<RoomContextInterface>({
  rooms: [],
  addRoom: async () => {},
  updateRoom: async () => {},
  fetchRooms: async () => {},
});

// Create a provider component
export const RoomProvider = ({children}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [user, setUser] = useState(auth().currentUser);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  // Fetch rooms from Firestore on refresh
  const fetchRooms = async () => {
    try {
      console.log('Fetching rooms from Firestore...');
      const snapshot = await firestore()
        .collection('rooms')
        .orderBy('lastMessageTimestamp', 'desc')
        .get();
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Room[];
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms: ', error);
    }
  };

  // Load rooms from Firestore if user is authenticated
  useEffect(() => {
    const currentUser = auth().currentUser;

    if (!currentUser) {
      //Clear rooms if no user is authenticated
      setRooms([]);
      return;
    }
    const unsubscribe = firestore()
      .collection('rooms')
      .orderBy('lastMessageTimestamp', 'desc')
      .onSnapshot(snapshot => {
        const roomsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Room[];
        setRooms(roomsData);
      });

    return () => unsubscribe();
  }, [user]); // Rerun effect when user changes

  // Add room (temporary functionality)
  const addRoom = async (room: Omit<Room, 'id'>) => {
    console.log('(context) Adding room:', room);
    try {
      console.log('context attempting to add room');
      await firestore()
        .collection('rooms')
        .add({
          ...room,
        });
      console.log('Room added successfully:', room);
    } catch (error) {
      console.error('Error adding room: ', error);
    }
  };

  // Update room
  const updateRoom = async (roomId: string, updatedRoom: Partial<Room>) => {
    try {
      await firestore().collection('rooms').doc(roomId).update(updatedRoom);
    } catch (error) {
      console.error('Error updating room: ', error);
    }
  };

  return (
    <RoomContext.Provider value={{rooms, addRoom, updateRoom, fetchRooms}}>
      {children}
    </RoomContext.Provider>
  );
};

// Custom hook to use the RoomContext
export const useRooms = () => useContext(RoomContext);
