import React, {useEffect, useState} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import SignIn from './app/screens/signIn';
import SignUp from './app/screens/signUp';
import Home from './app/screens/home';
import SplashScreen from './app/screens/splashScreen';

GoogleSignin.configure({
  webClientId:
    '180962452617-131n57jqikkk8rcbo1gd77krvrdbmclj.apps.googleusercontent.com',
  iosClientId:
    '180962452617-de5ofae0npqag3ufmp4lhnjd56759lo8.apps.googleusercontent.com',
});
//Initialize the stack navigator
const Stack = createNativeStackNavigator();

const App = () => {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  const onAuthStateChanged = user => {
    setUser(user);
    if (initializing) setInitializing(false);
  };

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  // Default options for all screens under this navigator.
  const scrOptions = {
    headerStyle: {backgroundColor: '#FFD700'},
    headerTitleStyle: {color: 'white'},
    headerBackTitleVisible: false,
    headerTintColor: 'white',
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={scrOptions}>
        <Stack.Screen
          name="SplashScreen"
          options={{headerShown: false, animation: 'fade'}}
          children={props => (
            <SplashScreen {...props} user={user} initializing={initializing} />
          )}
        />
        <Stack.Screen
          name="SignIn"
          options={{
            title: 'Sign In',
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
          component={SignIn}
        />
        <Stack.Screen
          name="SignUp"
          options={{title: 'Sign Up'}}
          component={SignUp}
        />
        <Stack.Screen
          name="Home"
          options={{title: 'Home', headerShown: false, animation: 'fade'}}
          component={Home}
        />
        {/*Add screens here*/}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
