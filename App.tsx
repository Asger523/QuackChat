import React, {useEffect, useState} from 'react';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import SignIn from './app/screens/signIn';
import SignUp from './app/screens/signUp';
import Home from './app/screens/home';
import ChatRoom from './app/screens/chatRoom';
import SplashScreen from './app/screens/splashScreen';
import {AuthProvider} from './app/contexts/auth.context';
import {RoomProvider} from './app/contexts/rooms.context';
import {MessageProvider} from './app/contexts/messages.context';

GoogleSignin.configure({
  webClientId:
    '180962452617-131n57jqikkk8rcbo1gd77krvrdbmclj.apps.googleusercontent.com',
  iosClientId:
    '180962452617-de5ofae0npqag3ufmp4lhnjd56759lo8.apps.googleusercontent.com',
});

// Initialize the stack navigator
const Stack = createNativeStackNavigator();

const App = () => {
  // Default screen options
  const defaultScreenOptions = {
    headerStyle: {backgroundColor: '#23272a'},
    headerTitleStyle: {color: 'white'},
    headerBackTitleVisible: false,
    headerTintColor: 'white',
    animation: 'fade' as const,
  };

  return (
    <AuthProvider>
      <RoomProvider>
        <MessageProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={defaultScreenOptions}>
              <Stack.Screen
                name="SplashScreen"
                options={{headerShown: false}}
                component={SplashScreen}
              />
              <Stack.Screen
                name="SignIn"
                options={{
                  title: 'Sign In',
                  headerShown: false,
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
                options={{
                  title: 'Home',
                  headerShown: false,
                  gestureEnabled: false,
                }}
                component={Home}
              />
              <Stack.Screen
                name="chatRoom"
                options={{title: 'Chat'}}
                component={ChatRoom}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </MessageProvider>
      </RoomProvider>
    </AuthProvider>
  );
};

export default App;
