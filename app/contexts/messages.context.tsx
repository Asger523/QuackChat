import React, {createContext, useContext, useState} from 'react';
import firestore, {
  FirebaseFirestoreTypes,
  Timestamp,
} from '@react-native-firebase/firestore';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

// Define the Message interface
interface Message {
  id: string;
  senderId: FirebaseAuthTypes.User['uid'];
  senderName: FirebaseAuthTypes.User['displayName'];
  senderAvatar?: FirebaseAuthTypes.User['photoURL'];
  text: string;
  imageUrl?: string;
  timestamp: Timestamp;
}

// Define the context interface
interface MessageContextInterface {
  messages: Message[];
  loadMessages: (roomId: string) => void;
  addMessage: (roomId: string, message: Omit<Message, 'id'>) => Promise<void>;
}

// Create the context
const MessageContext = createContext<MessageContextInterface>({
  messages: [],
  loadMessages: async () => {},
  addMessage: async () => {},
});

// Create a provider component
export const MessageProvider = ({children}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load messages for a specific room
  const loadMessages = (roomId: string) => {
    setLoading(true);
    const unsubscribe = firestore()
      .collection('rooms')
      .doc(roomId)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        snapshot => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Message[];

          setMessages(messagesData);
          setLoading(false);
        },
        error => {
          console.error('Error loading messages in real-time:', error);
          setLoading(false);
        },
      );

    return unsubscribe;
  };

  // Add a new message to Firestore
  const addMessage = async (roomId: string, message: Omit<Message, 'id'>) => {
    try {
      await firestore()
        .collection('rooms')
        .doc(roomId)
        .collection('messages')
        .add({
          ...message,
        });

      // Update the room's lastMessageTimestamp
      await firestore().collection('rooms').doc(roomId).update({
        lastMessageTimestamp: message.timestamp,
      });
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  return (
    <MessageContext.Provider value={{messages, loadMessages, addMessage}}>
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the MessageContext
export const useMessages = () => useContext(MessageContext);
