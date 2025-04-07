import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import GoogleButton from './app/components/GoogleButton';

GoogleSignin.configure({
  webClientId:
    '180962452617-131n57jqikkk8rcbo1gd77krvrdbmclj.apps.googleusercontent.com',
  iosClientId:
    '180962452617-de5ofae0npqag3ufmp4lhnjd56759lo8.apps.googleusercontent.com',
});

const App = () => {
  return (
    <SafeAreaView style={styles.background}>
      <GoogleButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#3b3b3b',
    flex: 1,
  },
});

export default App;
