import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Timestamp} from '@react-native-firebase/firestore';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {useTheme} from 'react-native-paper';
import {useAppTheme} from '../contexts/theme.context';

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
  const theme = useTheme();
  const {isDarkMode} = useAppTheme();
  // Set default avatar in case senderAvatar is not available
  const defaultAvatar = require('../assets/DefAvatar.png');

  return (
    <View style={styles.container}>
      {/* Display sender's avatar or default avatar */}
      <Image
        source={
          message.senderAvatar ? {uri: message.senderAvatar} : defaultAvatar
        }
        style={[styles.avatar, {borderColor: theme.colors.outline}]}
      />
      {/* Message content container */}
      <View style={styles.messageContainer}>
        {/* Display sender's name */}
        <Text style={[styles.senderName, {color: theme.colors.onSurface}]}>
          {message.senderName}
        </Text>
        {/* Message bubble */}
        <View
          style={[
            styles.bubbleContainer,
            {
              backgroundColor: isDarkMode
                ? theme.colors.primaryContainer
                : theme.colors.surfaceVariant,
              borderColor: theme.colors.outline,
            },
          ]}>
          {/* Message text or image */}
          {message.text ? (
            <Text
              style={[
                styles.messageText,
                {
                  color: isDarkMode
                    ? theme.colors.onPrimaryContainer
                    : theme.colors.onSurfaceVariant,
                },
              ]}>
              {message.text}
            </Text>
          ) : message.imageUrl ? (
            <Image
              source={{uri: message.imageUrl}}
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : null}
        </View>
        {/* Display timestamp */}
        <Text
          style={[styles.timestamp, {color: theme.colors.onSurfaceVariant}]}>
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
    borderWidth: 2,
  },
  messageContainer: {
    flex: 1,
  },
  senderName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  bubbleContainer: {
    borderRadius: 18,
    padding: 12,
    maxWidth: '80%',
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  messageText: {},
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 5,
  },
});
