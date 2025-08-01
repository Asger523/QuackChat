import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Alert} from 'react-native';
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';
import {useTheme, TextInput, Button} from 'react-native-paper';
import {useAuth} from '../contexts/auth.context';

const SignIn = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {signInWithEmail, signInWithGoogle} = useAuth();
  const theme = useTheme();

  // Handle Email and Password Sign-In
  const handleSignIn = async () => {
    try {
      await signInWithEmail(email, password);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView
      style={[styles.background, {backgroundColor: theme.colors.background}]}>
      {/* Header Text */}
      <Text style={[styles.headerText, {color: theme.colors.onBackground}]}>
        QuackChat
      </Text>
      {/* Spacer */}
      <View style={[styles.spacer, {backgroundColor: theme.colors.primary}]} />
      {/* Email Input */}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
        style={styles.input}
      />
      {/* Password Input */}
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />
      {/* Sign In Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSignIn}
          style={styles.button}
          icon="login">
          Sign In
        </Button>
      </View>
      {/* Sign Up Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => {
            navigation.navigate('SignUp');
          }}
          style={styles.button}
          icon="account-plus">
          Sign Up
        </Button>
      </View>
      {/* Google Sign-In Button */}
      <View style={styles.buttonContainer}>
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Standard}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleSignIn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    padding: 16,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  spacer: {
    height: 20,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    minWidth: 200,
  },
});

export default SignIn;
