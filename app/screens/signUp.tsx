import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Button,
  View,
  Alert,
} from 'react-native';
import auth from '@react-native-firebase/auth';

const SignUp = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async () => {
    auth()
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        console.log('User account created & signed in!');
        navigation.navigate('Home');
      })
      .catch(error => {
        if (error.code === 'auth/email-already-in-use') {
          console.log('That email address is already in use!');
        }

        if (error.code === 'auth/invalid-email') {
          console.log('That email address is invalid!');
        }

        Alert.alert('Error', error.message);
        console.error(error);
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create User</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        <Button title="Create User" onPress={handleSignUp} />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          color="red"
        />
      </View>
    </SafeAreaView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#3b3b3b', // Match background color from SignIn
  },
  title: {
    fontSize: 32, // Match header font size from SignIn
    fontWeight: 'bold',
    color: '#fff', // Match text color from SignIn
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff', // Match input background color from SignIn
    color: '#000', // Match input text color from SignIn
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
