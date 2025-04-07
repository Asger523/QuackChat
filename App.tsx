import React from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignIn from './app/screens/signIn';
import splashScreen from './app/screens/splashScreen';

GoogleSignin.configure({
  webClientId:
    '180962452617-131n57jqikkk8rcbo1gd77krvrdbmclj.apps.googleusercontent.com',
  iosClientId:
    '180962452617-de5ofae0npqag3ufmp4lhnjd56759lo8.apps.googleusercontent.com',
});
//Initialize the stack navigator
const Stack = createNativeStackNavigator();

const App = () => {
  // Default options for all screens under this navigator.
  const scrOptions = {
    headerStyle: {backgroundColor: '#6200ee'},
    headerTitleStyle: {color: 'white'},
    headerBackTitleVisible: false,
    headerTintColor: 'white',
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={scrOptions}>
        <Stack.Screen
          name="SplashScreen"
          options={{headerShown: false}}
          component={splashScreen}
        />
        <Stack.Screen
          name="SignIn"
          options={{
            title: 'Sign In',
            headerShown: false,
            animation: 'none',
            gestureEnabled: false,
          }}
          component={SignIn}
        />
        {/*Add screens here*/}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
