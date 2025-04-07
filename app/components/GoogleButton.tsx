import React from 'react';
import {Button} from 'react-native';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

async function onGoogleButtonPress() {
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

  // Link the user's account with the Google credential
  const firebaseUserCredential = await auth().currentUser.linkWithCredential(
    googleCredential,
  );

  //  Handle the linked account as needed in your app
  return;
}

export default function GoogleSignIn() {
  return (
    <Button
      title="Google Sign-In"
      onPress={() =>
        onGoogleButtonPress().then(() => console.log('Signed in with Google!'))
      }
    />
  );
}
