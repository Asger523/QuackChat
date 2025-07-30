import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  Button,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import {useMessages} from '../contexts/messages.context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {MessageItem} from '../components/MessageItem';

const ChatRoom = ({route, navigation}) => {
  const {messages, loadMessages, addMessage, sendImage} = useMessages();
  const {roomId, roomName} = route.params;
  const [messageText, setMessageText] = useState('');
  const theme = useTheme();

  // Set the title of the navbar to the room name
  useEffect(() => {
    navigation.setOptions({title: roomName});
  }, [navigation, roomName]);

  // Load messages when entering the chat room
  useEffect(() => {
    if (!roomId) return;
    const unsubscribe = loadMessages(roomId);
    return () => {
      unsubscribe(); // Clean up the listener on unmount
    };
  }, [roomId]);

  const currentUser = auth().currentUser;

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
        addMessage(roomId, newMessage);
        setMessageText('');
      } catch (error) {
        console.error('Error sending message: ', error);
        Alert.alert(error.message);
      }
    }
  };

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
            {/* Gallery button*/}
            <Button title="Gallery" onPress={handleGallery} />
            <View
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.outline,
                },
              ]}>
              <TextInput
                placeholder="Type a message..."
                value={messageText}
                onChangeText={setMessageText}
                style={[{flex: 1}, {color: theme.colors.onSurface}]}
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
            </View>
            <Button
              title="Send"
              onPress={handleSend}
              disabled={!messageText.trim()}
            />
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
});

export default ChatRoom;
