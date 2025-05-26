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
import {useMessages} from '../contexts/messages.context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {MessageItem} from '../components/MessageItem';
import {launchImageLibrary} from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

const ChatRoom = ({route, navigation}) => {
  const {messages, loadMessages, addMessage} = useMessages();
  const {roomId, roomName} = route.params;
  const [messageText, setMessageText] = useState('');

  // Set the title of the navbar to the room name
  useEffect(() => {
    navigation.setOptions({title: roomName});
  }, [navigation, roomName]);

  // Load messages when entering the chat room
  useEffect(() => {
    if (!roomId) return;
    loadMessages(roomId);
  }, []);

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
        addMessage(roomId, newMessage).then(() => {
          setMessageText('');
        });
      } catch (error) {
        console.error('Error sending message: ', error);
        Alert.alert(error.message);
      }
    }
  };

  //Send image function
  const sendImage = async () => {
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
    <SafeAreaView style={styles.container}>
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
          <View style={styles.footerContainer}>
            {/* Gallery button*/}
            <Button
              title="Gallery"
              onPress={() => {
                sendImage();
                console.log('Open gallery');
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
