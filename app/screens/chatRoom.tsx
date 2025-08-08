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
import {
  useTheme,
  TextInput,
  Button,
  IconButton,
  Tooltip,
} from 'react-native-paper';
import {useMessages} from '../contexts/messages.context';
import {useNotifications} from '../hooks/use.notifications';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {MessageItem} from '../components/MessageItem';

const ChatRoom = ({route, navigation}) => {
  const {messages, loadMessages, addMessage, sendImage} = useMessages();
  const {promptForRoomNotificationSubscription, checkIfUserHasMessagesInRoom} =
    useNotifications();
  const {roomId, roomName} = route.params;
  const [messageText, setMessageText] = useState('');
  const [hasCheckedFirstMessage, setHasCheckedFirstMessage] = useState(false);
  const theme = useTheme();

  // Set the title of the navbar to the room name
  useEffect(() => {
    navigation.setOptions({title: roomName});
  }, [navigation, roomName]);

  // Continuously load messages when entering the chat room
  useEffect(() => {
    if (!roomId) {
      return;
    }
    const unsubscribe = loadMessages(roomId);
    return () => {
      unsubscribe(); // Clean up the listener on unmount
    };
  }, [roomId]);

  // Check if this is user's first time in the room
  useEffect(() => {
    const checkFirstMessage = async () => {
      if (roomId && !hasCheckedFirstMessage) {
        const hasMessages = await checkIfUserHasMessagesInRoom(roomId);
        setHasCheckedFirstMessage(true);
        // We don't do anything here, just check for future reference
      }
    };
    checkFirstMessage();
  }, [roomId, hasCheckedFirstMessage, checkIfUserHasMessagesInRoom]);

  // Get the current user's information
  const currentUser = auth().currentUser;

  // Handle sending a message
  const handleSend = async () => {
    if (currentUser && messageText.trim()) {
      try {
        // Check if this is the user's first message in this room
        const hasMessages = await checkIfUserHasMessagesInRoom(roomId);

        if (!hasMessages) {
          // This is the user's first message, prompt for notification subscription
          await promptForRoomNotificationSubscription(roomId, roomName);
        }

        const newMessage = {
          senderId: currentUser.uid,
          senderName: currentUser.displayName || currentUser.email,
          senderAvatar: currentUser.photoURL,
          text: messageText,
          timestamp: firestore.Timestamp.now(),
        };

        // Add the message to Firestore and remove the input text
        await addMessage(roomId, newMessage);
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
      // Check if this is the user's first message in this room
      const hasMessages = await checkIfUserHasMessagesInRoom(roomId);

      if (!hasMessages) {
        // This is the user's first message, prompt for notification subscription
        await promptForRoomNotificationSubscription(roomId, roomName);
      }

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
            {/* Bottom row */}
            <View style={styles.bottomRow}>
              {/* Gallery button */}
              <Tooltip title="Send an image" theme={theme}>
                <IconButton
                  mode="outlined"
                  icon="image"
                  onPress={handleGallery}
                  style={styles.thinButton}
                  iconColor={theme.colors.primary}
                />
              </Tooltip>
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
              <IconButton
                mode="outlined"
                icon="send"
                onPress={handleSend}
                disabled={!messageText.trim()}
                style={styles.thinButton}
                iconColor={theme.colors.primary}
              />
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
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
  },
  thinButton: {
    width: 40,
    height: 40,
    padding: 0,
    marginLeft: 4,
    marginRight: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ChatRoom;
