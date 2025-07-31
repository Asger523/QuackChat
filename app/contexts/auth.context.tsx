import React, {createContext, useContext, useEffect, useState} from 'react';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

// Configure Google Sign-In
GoogleSignin.configure({
  webClientId:
    '180962452617-131n57jqikkk8rcbo1gd77krvrdbmclj.apps.googleusercontent.com',
  iosClientId:
    '180962452617-de5ofae0npqag3ufmp4lhnjd56759lo8.apps.googleusercontent.com',
});

// Define the context interface
interface AuthContextInterface {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    username: string,
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextInterface>({
  user: null,
  initializing: true,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

// Create a provider component
export const AuthProvider = ({children}) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Handle user state changes
  const onAuthStateChanged = (user: FirebaseAuthTypes.User | null) => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  // Listener for auth state changes
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, [initializing]);

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        throw new Error('No user found with this email address');
      }
      if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      }
      throw new Error(error.message);
    }
  };

  // Sign up with email, username, and password
  const signUpWithEmail = async (
    email: string,
    password: string,
    username: string,
  ) => {
    try {
      // Create a new user with email and password
      const userCredential = await auth().createUserWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredential.user;

      // Update the user's profile with the username
      await user.updateProfile({displayName: username});
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('That email address is already in use');
      }
      if (error.code === 'auth/invalid-email') {
        throw new Error('That email address is invalid');
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('Password is too weak');
      }
      throw new Error(error.message);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      // Check if the device supports Google Play
      await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

      // Get the user's ID token
      const signInResult = await GoogleSignin.signIn();

      // Try the new style of google-sign in result, from v13+ of that module
      let idToken = signInResult.data?.idToken;
      if (!idToken) {
        // if using older versions of google-signin, try old style result
        idToken = signInResult.data?.idToken;
      }
      if (!idToken) {
        throw new Error('No ID token found');
      }

      // Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign-in with the credential
      await auth().signInWithCredential(googleCredential);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await auth().signOut();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => useContext(AuthContext);
