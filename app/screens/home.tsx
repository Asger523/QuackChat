import React, {useState} from 'react';
import {Text, StyleSheet, Button, SafeAreaView, FlatList} from 'react-native';
import auth from '@react-native-firebase/auth';
import {useRooms} from '../contexts/rooms.context';
import RoomItem from '../components/RoomItem';

const Home = ({navigation}) => {
  const {rooms, fetchRooms} = useRooms();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      fetchRooms();
      console.log('Refreshing rooms...');
    } catch (error) {
      console.error('Error refreshing rooms:', error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.greeting}>
        Hello, {auth().currentUser?.displayName}!
      </Text>
      <Button
        title="Sign Out"
        onPress={() => {
          auth()
            .signOut()
            .then(() => navigation.replace('SignIn'))
            .catch(error => console.error('Sign out error: ', error));
        }}
      />
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
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    width: '100%',
    paddingHorizontal: 10,
  },
});

export default Home;
