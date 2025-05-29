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
          {message.text ? (
            <Text style={styles.messageText}>{message.text}</Text>
          ) : message.imageUrl ? (
            <Image
              source={{uri: message.imageUrl}}
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : null}
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
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    color: '#fff',
    marginBottom: 5,
  },
  bubbleContainer: {
    backgroundColor: '#b2ebf2',
    borderRadius: 15,
    padding: 10,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#37474f',
  },
  messageText: {
    color: 'black',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
});
