import React, {useEffect, useMemo, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  Button,
  View,
} from 'react-native';
import {useMessages} from '../contexts/messages.context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {MessageItem} from '../components/MessageItem';

const ChatRoom = ({route, navigation}) => {
  const {messages, loadMessages, loadMoreMessages, addMessage} = useMessages();
  const {roomId} = route.params;
  const [messageText, setMessageText] = useState('');

  // Load messages when entering the chat room
  useMemo(() => {
    loadMessages(roomId);
  }, []);

  const currentUser = auth().currentUser;
  // Sort the messages in the correct order once
  const sortedMessages = useMemo(() => [...messages.reverse()], [messages]);

  const handleSend = () => {
    if (currentUser && messageText.trim()) {
      const newMessage = {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        senderAvatar: currentUser.photoURL,
        text: messageText,
        timestamp: firestore.Timestamp.now(),
      };

      try {
        addMessage(roomId, newMessage).then(() => {
          setMessageText('');
        });
      } catch (error) {
        console.error('Error sending message: ', error);
        Alert.alert(error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      {/* List of messages */}
      <FlatList
        data={sortedMessages}
        renderItem={({item}) => (
          <MessageItem message={{...item}} roomId={roomId} />
        )}
      />
      {/* Footer container */}
      <View style={styles.footerContainer}>
        <Button
          title="Gallery"
          onPress={() => {
            Alert.alert('Gallery button pressed');
          }}
        />
        <View style={styles.input}>
          <TextInput
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
            style={{flex: 1}}
          />
        </View>
        <Button
          title="Send"
          onPress={handleSend}
          disabled={!messageText.trim()}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#fff',
  },
  footerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
});

export default ChatRoom;
