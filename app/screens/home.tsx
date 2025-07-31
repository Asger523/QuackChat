import React, {useState} from 'react';
import {
  Text,
  StyleSheet,
  Button,
  SafeAreaView,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import {useTheme} from 'react-native-paper';
import {useAuth} from '../contexts/auth.context';
import {useRooms} from '../contexts/rooms.context';
import RoomItem from '../components/RoomItem';
import BottomBarItem from '../components/BottomBarItem';

const Home = ({navigation}) => {
  const {user, signOut} = useAuth();
  const {rooms, fetchRooms} = useRooms();
  const theme = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      fetchRooms();
    } catch (error) {
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.replace('SignIn');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Greeting message */}
      <Text style={[styles.greeting, {color: theme.colors.onBackground}]}>
        Hello, {user?.displayName}!
      </Text>
      {/* Sign out button */}
      <Button title="Sign Out" onPress={handleSignOut} />
      {/* List of chat rooms */}
      <FlatList
        data={rooms}
        renderItem={({item}) => (
          <RoomItem
            room={item}
            onPressGoToRoom={() => {
              navigation.navigate('chatRoom', {
                roomName: item.title,
                roomId: item.id,
              });
            }}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
            colors={[theme.colors.primary]}
          />
        }
      />
      {/* Bottom navigation bar */}
      <BottomBarItem />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  list: {
    width: '100%',
    paddingHorizontal: 10,
  },
});

export default Home;
