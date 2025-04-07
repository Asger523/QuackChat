import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SignIn from './app/screens/signIn';

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
          name="SignIn"
          options={{headerShown: false}}
          component={SignIn}
        />
        {/*Add screens here*/}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#3b3b3b',
    flex: 1,
  },
});

export default App;
