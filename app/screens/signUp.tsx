import React, {useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  Button,
  View,
  Alert,
} from 'react-native';
import {useTheme, TextInput} from 'react-native-paper';
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
      <Text style={[styles.title, {color: theme.colors.onBackground}]}>
        Sign up for QuackChat
      </Text>

      <Text style={[styles.inputText, {color: theme.colors.onBackground}]}>
        Enter your email adress
      </Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
        style={styles.input}
      />

      <Text style={[styles.inputText, {color: theme.colors.onBackground}]}>
        Enter your username
      </Text>
      <TextInput
        label="Username"
        value={username}
        onChangeText={setUsername}
        mode="outlined"
        style={styles.input}
      />

      <Text style={[styles.inputText, {color: theme.colors.onBackground}]}>
        Enter your password
      </Text>
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />
      <Text style={[styles.inputText, {color: theme.colors.onBackground}]}>
        Confirm your password
      </Text>
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        mode="outlined"
        style={styles.input}
      />

      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={handleSignUp} />
        <Button
          title="Cancel"
          onPress={() => navigation.goBack()}
          color={theme.colors.error}
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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputText: {
    fontSize: 16,
    textAlign: 'left',
    marginLeft: 16,
    marginTop: 8,
  },
  input: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  buttonContainer: {
    marginTop: 16,
  },
});
