import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  GestureResponderEvent,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import {Timestamp} from '@react-native-firebase/firestore';

export const RoomItem = (props: {
  room: {
    id: string;
    title: string;
    description: string;
    lastMessageTimestamp: Timestamp;
  };
  onPressGoToRoom: any;
}) => {
  const {room, onPressGoToRoom} = props;
  const theme = useTheme();

  // Get logo based on room name
  const getLogo = (roomName: string) => {
    switch (roomName) {
      case 'The Pond':
        return require('../assets/ThePondLogo.png');
      case 'Lakeside':
        return require('../assets/Lakeside.png');
      case 'The Quack Shack':
        return require('../assets/TheQuackShack.png');
    }
  };

  return (
    <TouchableOpacity
      onPress={onPressGoToRoom}
      style={[styles.container, {borderBottomColor: theme.colors.outline}]}>
      <View style={styles.innerContainer}>
        <Image source={getLogo(room.title)} style={styles.logo} />
        <View style={styles.textContainer}>
          <Text style={[styles.title, {color: theme.colors.onBackground}]}>
            {room.title}
          </Text>
          <Text
            style={[
              styles.description,
              {color: theme.colors.onSurfaceVariant},
            ]}>
            {room.description}
          </Text>
        </View>
        <Text style={[styles.chevron, {color: theme.colors.onSurfaceVariant}]}>
          {'>'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
    borderRadius: 20,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 18,
    marginLeft: 10,
  },
});

export default RoomItem;
