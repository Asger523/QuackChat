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
  loadMessages: (roomId: string) => Promise<void>;
  loadMoreMessages: (roomId: string) => Promise<void>;
  addMessage: (roomId: string, message: Omit<Message, 'id'>) => Promise<void>;
}

// Create the context
const MessageContext = createContext<MessageContextInterface>({
  messages: [],
  loadMessages: async () => {},
  loadMoreMessages: async () => {},
  addMessage: async () => {},
});

// Create a provider component
export const MessageProvider = ({children}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastVisible, setLastVisible] =
    useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Load messages for a specific room
  const loadMessages = async (roomId: string) => {
    try {
      const snapshot = await firestore()
        .collection('rooms')
        .doc(roomId)
        .collection('messages')
        .limit(50)
        .orderBy('timestamp', 'desc')
        .get();

      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(messagesData);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]); // Track the last visible document
      setHasMore(snapshot.docs.length === 50); // If less than 50, no more messages
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Load the next batch of 50 messages
  const loadMoreMessages = async (roomId: string) => {
    if (!hasMore || !lastVisible) return; // Stop if no more messages or no last visible document

    try {
      const snapshot = await firestore()
        .collection('rooms')
        .doc(roomId)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .startAfter(lastVisible) // Start after the last visible document
        .limit(50)
        .get();

      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(prevMessages => [...prevMessages, ...newMessages]); // Append new messages
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]); // Update the last visible document
      setHasMore(snapshot.docs.length === 50); // If less than 50, no more messages
    } catch (error) {
      console.error('Error loading more messages:', error);
    }
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
    <MessageContext.Provider
      value={{messages, loadMessages, loadMoreMessages, addMessage}}>
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the MessageContext
export const useMessages = () => useContext(MessageContext);
