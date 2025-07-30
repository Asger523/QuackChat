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
import {GoogleSigninButton} from '@react-native-google-signin/google-signin';
import {useTheme} from 'react-native-paper';
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
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          },
        ]}
        placeholder="Email"
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Password Input */}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.onSurface,
          },
        ]}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      {/* Sign In Button */}
      <View style={styles.buttonContainer}>
        <Button title="Sign in" onPress={handleSignIn} />
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
