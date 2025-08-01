import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Alert} from 'react-native';
import {useTheme, TextInput, Button} from 'react-native-paper';
import {useAuth} from '../contexts/auth.context';

const SignUp = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const {signUpWithEmail} = useAuth();
  const theme = useTheme();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!username.trim()) {
      Alert.alert('Error', 'Username is required');
      return;
    }

    try {
      await signUpWithEmail(email, password, username);
      console.log('User account created & signed in!');
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error(error);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header Text */}
      <Text style={[styles.title, {color: theme.colors.onBackground}]}>
        Sign up for QuackChat
      </Text>
      {/* Input field for email */}
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
        style={styles.input}
      />
      {/* Input field for username */}
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        style={styles.input}
      />
      {/* Input field for password */}
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />
      {/* Input field for confirm password */}
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSignUp}
          style={styles.signUpButton}
          icon="account-plus">
          Sign Up
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          textColor={theme.colors.error}
          icon="cancel">
          Cancel
        </Button>
      </View>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  buttonContainer: {
    marginTop: 16,
    gap: 12,
  },
  signUpButton: {
    marginHorizontal: 16,
  },
  cancelButton: {
    marginHorizontal: 16,
  },
});
