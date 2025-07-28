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
import {useAuth} from '../contexts/auth.context';
import {useRooms} from '../contexts/rooms.context';
import RoomItem from '../components/RoomItem';

const Home = ({navigation}) => {
  const {user, signOut} = useAuth();
  const {rooms, fetchRooms} = useRooms();
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>
        Hello, {user?.displayName || user?.email}!
      </Text>
      <Button title="Sign Out" onPress={handleSignOut} />
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
            tintColor="#ffffff"
            colors={['#ffffff']}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3b3b3b',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f5f5f5',
  },
  list: {
    width: '100%',
    paddingHorizontal: 10,
  },
});

export default Home;
