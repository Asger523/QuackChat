import React, {useState, useEffect} from 'react';
import {SafeAreaView, ImageBackground, StyleSheet} from 'react-native';

const SplashScreen = ({navigation, user, initializing}) => {
  useEffect(() => {
    if (!initializing) {
      const timeout = setTimeout(() => {
        if (!user) {
          navigation.replace('SignIn');
        } else {
          navigation.replace('Home');
        }
      }, 1000); // Pause for 1 second

      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }
  }, [initializing, user, navigation]);

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
