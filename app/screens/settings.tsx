import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Switch, useTheme} from 'react-native-paper';
import BottomBar from '../components/BottomBar';
import {useAppTheme} from '../contexts/theme.context';

const Settings = ({navigation}) => {
  const {isDarkMode, toggleTheme} = useAppTheme();
  const theme = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header Text */}
      <Text style={[styles.title, {color: theme.colors.onBackground}]}>
        Settings
      </Text>
      {/* Dark Mode Switch */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingLabel, {color: theme.colors.onBackground}]}>
          Dark Mode
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>
      {/* Bottom Navigation Bar */}
      <BottomBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    flex: 1,
    fontSize: 18,
  },
});

export default Settings;
