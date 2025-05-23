import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Timestamp} from '@react-native-firebase/firestore';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';

export const MessageItem = (props: {
  message: {
    id: string;
    senderId: FirebaseAuthTypes.User['uid'];
    senderName: FirebaseAuthTypes.User['displayName'];
    senderAvatar?: FirebaseAuthTypes.User['photoURL'];
    text: string;
    imageUrl?: string;
    timestamp: Timestamp;
  };
  roomId: string;
}) => {
  const {message} = props;
  // Set default avatar in case senderAvatar is not available
  const defaultAvatar = require('../assets/DefAvatar.png');

  return (
    <View style={styles.container}>
      <Image
        source={
          message.senderAvatar ? {uri: message.senderAvatar} : defaultAvatar
        }
        style={styles.avatar}
      />
      <View style={styles.messageContainer}>
        <Text style={styles.senderName}>{message.senderName}</Text>
        <View style={styles.bubbleContainer}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
        <Text style={styles.timestamp}>
          {message.timestamp.toDate().toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the top
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  messageContainer: {
    flex: 1,
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bubbleContainer: {
    backgroundColor: '#e0f7fa', // Light blue bubble color
    borderRadius: 15,
    padding: 10,
    maxWidth: '80%',
    alignSelf: 'flex-start', // Align bubble to the left
    borderWidth: 1,
    borderColor: '#b2ebf2', // Slightly darker border
  },
  messageText: {
    color: '#555',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
