import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
} from 'react-native';
import GoogleButton from '../components/GoogleButton';

const SignIn = route => {
  return (
    <SafeAreaView style={styles.background}>
      <Text style={styles.header}>QuackChat</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
      />
      <Button title="Sign in" onPress={() => {}} />
      <View style={styles.createUserContainer}>
        <Button title="Create user" onPress={() => {}} />
      </View>
      <GoogleButton />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#3b3b3b',
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#555',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  createUserContainer: {
    marginTop: 16,
    marginBottom: 32,
  },
});

export default SignIn;
