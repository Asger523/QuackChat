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

const SignIn = ({navigation}) => {
  return (
    <SafeAreaView style={styles.background}>
      {/* Header Text */}
      <Text style={styles.headerText}>QuackChat</Text>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#ccc"
        keyboardType="email-address"
      />
      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#ccc"
        secureTextEntry
      />
      {/* Sign In Button */}
      <View style={styles.buttonContainer}>
        <Button title="Sign in" onPress={() => {}} />
      </View>
      {/* Sign Up Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Sign up"
          onPress={() => {
            navigation.navigate('SignUp');
          }}
        />
      </View>

      <View style={styles.buttonContainer}>
        <GoogleButton />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#3b3b3b',
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  spacer: {
    height: 20,
    backgroundColor: '#FFD700',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    color: '#000',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignIn;
