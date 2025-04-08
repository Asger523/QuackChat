import React, {useState, useEffect} from 'react';
import {SafeAreaView, ImageBackground, StyleSheet} from 'react-native';
import auth from '@react-native-firebase/auth';

const SplashScreen = ({navigation}) => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);
  useEffect(() => {
    if (!initializing) {
      const timeout = setTimeout(() => {
        if (!user) {
          navigation.replace('SignIn');
        } else {
          // Navigate to another screen if the user is authenticated
          // navigation.navigate('Home');
        }
      }, 1000); // Pause for 1 second

      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }
  }, [initializing, user, navigation]);

  if (initializing) {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#3b3b3b'}}>
        <ImageBackground
          source={require('../assets/SplashScreen.png')}
          resizeMode="cover"
          style={styles.image}></ImageBackground>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#3b3b3b'}}>
      <ImageBackground
        source={require('../assets/SplashScreen.png')}
        resizeMode="cover"
        style={styles.image}></ImageBackground>
    </SafeAreaView>
  );
};
export default SplashScreen;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'center',
  },
});
