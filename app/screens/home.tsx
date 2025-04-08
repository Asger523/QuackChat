import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import auth from '@react-native-firebase/auth';

const Home = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, {auth().currentUser?.email}!</Text>
      <Button
        title="Sign Out"
        onPress={() => {
          auth()
            .signOut()
            .then(() => navigation.replace('SignIn'))
            .catch(error => console.error('Sign out error: ', error));
        }}
      />
    </View>
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
});

export default Home;
