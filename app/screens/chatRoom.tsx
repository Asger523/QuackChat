import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useTheme, TextInput, Button, IconButton} from 'react-native-paper';
import {useMessages} from '../contexts/messages.context';
import {useNotifications} from '../contexts/notifications.context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {MessageItem} from '../components/MessageItem';

const ChatRoom = ({route, navigation}) => {
  const {messages, loadMessages, addMessage, sendImage} = useMessages();
  const {subscribeToRoom, unsubscribeFromRoom} = useNotifications();
  const {roomId, roomName} = route.params;
  const [messageText, setMessageText] = useState('');
  const theme = useTheme();

  // Set the title of the navbar to the room name
  useEffect(() => {
    navigation.setOptions({title: roomName});
  }, [navigation, roomName]);

  // Continuously load messages when entering the chat room
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = loadMessages(roomId);
    return () => {
      unsubscribe(); // Clean up the listener on unmount
    };
  }, [roomId]);

  // Subscribe to room notifications when entering
  useEffect(() => {
    if (roomId) {
      subscribeToRoom(roomId);
    }

    // Cleanup: unsubscribe when leaving the room
    return () => {
      if (roomId) {
        unsubscribeFromRoom(roomId);
      }
    };
  }, [roomId]);

  // Get the current user's information
  const currentUser = auth().currentUser;

  // Handle sending a message if
  const handleSend = async () => {
    if (currentUser && messageText.trim()) {
      const newMessage = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        senderAvatar: currentUser.photoURL,
        text: messageText,
        timestamp: firestore.Timestamp.now(),
      };

      try {
        // Add the message to Firestore and remove the input text
        addMessage(roomId, newMessage);
        setMessageText('');
      } catch (error) {
        console.error('Error sending message: ', error);
        Alert.alert(error.message);
      }
    }
  };

  // Function to handle sending an image from the gallery
  const handleGallery = async () => {
    try {
      await sendImage(roomId);
      console.log('Image sent');
    } catch (error) {
      Alert.alert('Image upload failed', error.message);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.background}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 70}>
        <View style={{flex: 1}}>
          {/* List of messages */}
          <FlatList
            data={messages}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => (
              <MessageItem message={{...item}} roomId={roomId} />
            )}
            contentContainerStyle={{flexGrow: 1, paddingBottom: 10}}
            inverted={true}
          />
          {/* Footer container */}
          <View
            style={[
              styles.footerContainer,
              {borderTopColor: theme.colors.outline},
            ]}>
            {/* Gallery button - positioned above input row */}
            <View style={styles.galleryRow}>
              <IconButton
                mode="outlined"
                icon="image"
                onPress={handleGallery}
                style={styles.galleryButton}
                iconColor={theme.colors.primary}
              />
            </View>

            {/* Input and Send button row */}
            <View style={styles.inputRow}>
              <TextInput
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                mode="outlined"
                style={styles.input}
                multiline
                dense
              />
              {/* Send button */}
              <Button
                mode="contained"
                onPress={handleSend}
                disabled={!messageText.trim()}
                style={styles.sendButton}
                icon="send">
                Send
              </Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  footerContainer: {
    padding: 10,
    borderTopWidth: 1,
  },
  galleryRow: {
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 8,
  },
  galleryButton: {
    minWidth: 80,
  },
  sendButton: {
    marginLeft: 8,
  },
});

export default ChatRoom;
