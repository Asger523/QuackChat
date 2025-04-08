import React, {use} from 'react';
import {useState} from 'react';
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
import {
  GoogleSignin,
  GoogleSigninButton,
} from '@react-native-google-signin/google-signin';

const SignIn = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Handle Email and Password Sign-In
  const handleSignIn = () => {
    auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        navigation.navigate('Home');
      })
      .catch(error => {
        if (error.code === 'auth/user-not-found') {
        }
        if (error.code === 'auth/wrong-password') {
        }
        Alert.alert('Error', error.message);
      });
  };

  // Handle Google Sign-In
  const onGoogleButtonPress: () => Promise<void> = async () => {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();

    // Try the new style of google-sign in result, from v13+ of that module
    let idToken = signInResult.data?.idToken;
    if (!idToken) {
      // if you are using older versions of google-signin, try old style result
      idToken = signInResult.data?.idToken;
    }
    if (!idToken) {
      throw new Error('No ID token found');
    }

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth()
      .signInWithCredential(googleCredential)
      .then(() => {
        navigation.navigate('Home');
      });
  };

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
        onChangeText={setEmail}
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        onChangeText={setPassword}
        value={password}
        secureTextEntry
      />
      {/* Sign In Button */}
      <View style={styles.buttonContainer}>
        <Button
          title="Sign in"
          onPress={() => {
            handleSignIn();
          }}
        />
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
          onPress={() => {
            onGoogleButtonPress();
          }}
        />
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
