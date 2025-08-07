import React, {useEffect} from 'react';
import {SafeAreaView, ImageBackground, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import {useAuth} from '../contexts/auth.context';
import {useNotifications} from '../hooks/use.notifications';

const SplashScreen = ({navigation}) => {
  const {user, initializing} = useAuth();
  const theme = useTheme();
  const {pendingNavigation, checkInitialNotification, clearPendingNavigation} =
    useNotifications();

  // Check for initial notification when component mounts
  useEffect(() => {
    checkInitialNotification();
  }, [checkInitialNotification]);

  // Pause for 1 second to simulate loading
  // Then navigate based on user state and pending notification
  useEffect(() => {
    if (!initializing) {
      const timeout = setTimeout(() => {
        if (!user) {
          navigation.replace('SignIn');
        } else {
          // Check if we have a pending notification navigation
          if (pendingNavigation) {
            console.log(
              'Navigating to chat room from notification:',
              pendingNavigation,
            );
            navigation.replace('chatRoom', {
              roomId: pendingNavigation.roomId,
              roomName: pendingNavigation.roomName,
            });
            // Clear the pending navigation after using it
            clearPendingNavigation();
          } else {
            navigation.replace('Home');
          }
        }
      }, 1000);

      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }
  }, [
    initializing,
    user,
    navigation,
    pendingNavigation,
    clearPendingNavigation,
  ]);

  return (
    <SafeAreaView
      style={[{flex: 1}, {backgroundColor: theme.colors.background}]}>
      {/* Background Image */}
      <ImageBackground
        source={require('../assets/SplashScreen.png')}
        resizeMode="cover"
        style={styles.image}
      />
    </SafeAreaView>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  image: {
    flex: 1,
    justifyContent: 'center',
  },
});
