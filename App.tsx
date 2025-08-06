import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import {useEffect} from 'react';
import SignIn from './app/screens/signIn';
import SignUp from './app/screens/signUp';
import Home from './app/screens/home';
import ChatRoom from './app/screens/chatRoom';
import SplashScreen from './app/screens/splashScreen';
import Settings from './app/screens/settings';
import {AuthProvider} from './app/contexts/auth.context';
import {RoomProvider} from './app/contexts/rooms.context';
import {MessageProvider} from './app/contexts/messages.context';
import {ThemeProvider} from './app/contexts/theme.context';
import {NotificationProvider} from './app/contexts/notifications.context';
import {navigationRef} from './app/services/navigationService';

// Initialize the stack navigator
const Stack = createNativeStackNavigator();

const App = () => {
  // Register for remote messages at the app level
  useEffect(() => {
    const initializeMessaging = async () => {
      try {
        await messaging().registerDeviceForRemoteMessages();
        console.log('Device registered for remote messages at app level');
      } catch (error) {
        console.warn(
          'Failed to register device at app level (likely missing iOS entitlements):',
          error,
        );
        // App will continue to work without push notifications
      }
    };

    initializeMessaging();
  }, []);

  // Default screen options
  const defaultScreenOptions = {
    headerStyle: {backgroundColor: '#23272a'},
    headerTitleStyle: {color: 'white'},
    headerBackTitleVisible: false,
    headerTintColor: 'white',
    animation: 'none' as const,
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <RoomProvider>
          <MessageProvider>
            <ThemeProvider>
              <NavigationContainer ref={navigationRef}>
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
                    name="Settings"
                    options={{
                      title: 'Settings',
                      headerShown: false,
                      gestureEnabled: false,
                    }}
                    component={Settings}
                  />
                  <Stack.Screen
                    name="chatRoom"
                    options={{title: 'Chat'}}
                    component={ChatRoom}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </ThemeProvider>
          </MessageProvider>
        </RoomProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
