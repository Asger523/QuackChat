import React, {useEffect, useState} from 'react';
import {StyleSheet} from 'react-native';
import {BottomNavigation, useTheme} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';

export const BottomBar = () => {
  const [index, setIndex] = useState(0);
  const {bottom} = useSafeAreaInsets();
  const theme = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute();

  // Sync the tab index with current route
  useEffect(() => {
    if (route.name === 'Home') {
      setIndex(0);
    } else if (route.name === 'Settings') {
      setIndex(1);
    }
  }, [route.name]);

  // Define the routes for the bottom navigation
  const routes = [
    {
      key: 'home',
      title: 'Home',
      focusedIcon: 'home',
      unfocusedIcon: 'home-outline',
    },
    {
      key: 'settings',
      title: 'Settings',
      focusedIcon: 'cog',
      unfocusedIcon: 'cog-outline',
    },
  ];
  // Handle index change and navigate to the corresponding screen
  const handleIndexChange = (newIndex: number) => {
    setIndex(newIndex);
    if (newIndex === 0) {
      navigation.navigate('Home');
    } else if (newIndex === 1) {
      navigation.navigate('Settings');
    }
  };
  // Define the scenes as empty components since we use navigation to switch screens
  const renderScene = BottomNavigation.SceneMap({
    home: () => null,
    settings: () => null,
  });

  return (
    <BottomNavigation
      navigationState={{index, routes}}
      onIndexChange={handleIndexChange}
      renderScene={renderScene}
      style={[
        styles.bottom,
        {
          paddingBottom: bottom,
          backgroundColor: theme.colors.elevation.level2,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  bottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default BottomBar;
