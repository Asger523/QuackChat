import React, {createContext, useContext, useState} from 'react';
import firestore, {Timestamp} from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {launchImageLibrary} from 'react-native-image-picker';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {Alert} from 'react-native';

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
  loadMessages: (roomId: string) => () => void;
  addMessage: (roomId: string, message: Omit<Message, 'id'>) => Promise<void>;
  sendImage: (roomId: string) => Promise<void>;
}

// Create the context
const MessageContext = createContext<MessageContextInterface>({
  messages: [],
  loadMessages: () => () => {},
  addMessage: async () => {},
  sendImage: async () => {},
});

// Create a provider component
export const MessageProvider = ({children}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load messages from Firestore in real-time
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
          return unsubscribe;
        },
        error => {
          console.error('Error loading messages in real-time:', error);
          setLoading(false);
        },
      );
    return unsubscribe; // Clean up the listener on unmount
  };

  // Add a new message to Firestore and update the room's last message timestamp
  const addMessage = async (roomId: string, message: Omit<Message, 'id'>) => {
    if (!auth().currentUser) return;
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

  //Send image function
  const sendImage = async (roomId: string) => {
    const currentUser = auth().currentUser;
    if (!currentUser) return;
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
      },
      async response => {
        if (response.didCancel || !response.assets?.length) {
          return;
        }
        const asset = response.assets[0];
        if (!asset.uri) return;

        try {
          //Prepare the image for upload
          const responseFetch = await fetch(asset.uri);
          const blob = await responseFetch.blob();

          //Create a unique path in Firebase Storage
          const fileName = `${currentUser.uid}_${Date.now()}`;
          const storageRef = storage().ref(`chatImages/${roomId}/${fileName}`);

          // Upload the image
          await storageRef.put(blob);

          // Get the download URL
          const downloadURL = await storageRef.getDownloadURL();

          // Send a message with imageUrl
          const newMessage = {
            senderId: currentUser.uid,
            senderName: currentUser.displayName || currentUser.email,
            senderAvatar: currentUser.photoURL,
            text: '',
            imageUrl: downloadURL,
            timestamp: firestore.Timestamp.now(),
          };
          await addMessage(roomId, newMessage);
        } catch (error) {
          console.error('Error uploading image: ', error);
          Alert.alert('Upload failed', error.message);
        }
      },
    );
  };

  return (
    <MessageContext.Provider
      value={{messages, loadMessages, addMessage, sendImage}}>
      {children}
    </MessageContext.Provider>
  );
};

// Custom hook to use the MessageContext
export const useMessages = () => useContext(MessageContext);
