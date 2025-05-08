import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
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
        source={message.senderAvatar ? message.senderAvatar : defaultAvatar}
        style={styles.avatar}
      />
      <View style={styles.innerContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.senderName}>{message.senderName}</Text>
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
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  textContainer: {
    flexDirection: 'column',
  },
  senderName: {
    fontWeight: 'bold',
  },
  messageText: {
    color: '#555',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-end', // Align timestamp to the right
  },
});
