import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import GoogleButton from '../components/GoogleButton';

const SignIn = () => {
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
export default SignIn;
