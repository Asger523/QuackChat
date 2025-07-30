import React, {useEffect} from 'react';
import {SafeAreaView, ImageBackground, StyleSheet} from 'react-native';
import {useTheme} from 'react-native-paper';
import {useAuth} from '../contexts/auth.context';

const SplashScreen = ({navigation}) => {
  const {user, initializing} = useAuth();
  const theme = useTheme();

  // Pause for 1 second to simulate loading
  // Then navigate based on user state
  useEffect(() => {
    if (!initializing) {
      const timeout = setTimeout(() => {
        if (!user) {
          navigation.replace('SignIn');
        } else {
          navigation.replace('Home');
        }
      }, 1000);

      return () => clearTimeout(timeout); // Cleanup timeout on unmount
    }
  }, [initializing, user, navigation]);

  return (
    <SafeAreaView
      style={[{flex: 1}, {backgroundColor: theme.colors.background}]}>
      <ImageBackground
        source={require('../assets/SplashScreen.png')}
        resizeMode="cover"
        style={styles.image}></ImageBackground>
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
