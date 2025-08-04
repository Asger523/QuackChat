import React, {useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Alert} from 'react-native';
import {Divider, Button, Switch, useTheme} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import BottomBar from '../components/BottomBar';
import {useAppTheme} from '../contexts/theme.context';
import EditProfileModal from '../components/EditProfileModal';
import {useAuth} from '../contexts/auth.context';
import {useNotifications} from '../contexts/notifications.context';

const Settings = ({navigation}) => {
  const {isDarkMode, toggleTheme} = useAppTheme();
  const {signOut} = useAuth(); // Get signOut from useAuth hook
  const theme = useTheme();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const {requestPermission, isNotificationEnabled, checkPermissionStatus} =
    useNotifications();

  // Check notification permission status when component mounts
  useEffect(() => {
    checkPermissionStatus();
  }, []);

  // Also check when screen comes into focus (e.g., returning from system settings)
  useFocusEffect(
    React.useCallback(() => {
      checkPermissionStatus();
    }, []),
  );

  const handleSignOut = () => {
    signOut();
    navigation.replace('SignIn'); // Navigate to SignIn screen after sign out
  };

  const handleNotificationToggle = async () => {
    if (!isNotificationEnabled) {
      // User wants to enable notifications
      const granted = await requestPermission();
      if (!granted) {
        // If permission was denied, check current status and show helpful message
        await checkPermissionStatus();
        Alert.alert(
          'Permission Required',
          'To receive notifications, please allow permissions in your device settings. Go to Settings > Apps > QuackChat > Notifications.',
          [{text: 'OK'}],
        );
      }
    } else {
      // User wants to disable notifications
      // Note: We can't programmatically revoke permissions, but we can guide the user
      Alert.alert(
        'Disable Notifications',
        'To disable notifications, please go to your device Settings > Apps > QuackChat > Notifications and turn them off. You can also toggle this setting back on later.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => {
              // On React Native, we can't directly open app settings
              // But we can provide clear instructions
              Alert.alert(
                'How to Disable',
                'Go to: Settings > Apps > QuackChat > Notifications > Turn off',
                [{text: 'Got it'}],
              );
            },
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.colors.background}]}>
      {/* Header Text */}
      <Text style={[styles.title, {color: theme.colors.onBackground}]}>
        Settings
      </Text>
      {/* Dark Mode Switch */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, {color: theme.colors.onBackground}]}>
          Dark Mode
        </Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>
      <Divider />
      {/* Edit profile button */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, {color: theme.colors.onBackground}]}>
          Edit Profile
        </Text>
        <Button
          mode="outlined"
          style={styles.button}
          onPress={() => setEditModalVisible(true)}>
          Edit
        </Button>
      </View>
      <Divider />
      {/* Sign out button */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, {color: theme.colors.onBackground}]}>
          Sign out
        </Text>
        <Button
          mode="outlined"
          style={styles.button}
          onPress={() => {
            handleSignOut();
          }}>
          Sign out
        </Button>
      </View>
      <Divider />
      {/* Notifications Switch */}
      <View style={styles.settingRow}>
        <Text style={[styles.settingText, {color: theme.colors.onBackground}]}>
          Push Notifications
        </Text>
        <Switch
          value={isNotificationEnabled}
          onValueChange={handleNotificationToggle}
        />
      </View>
      <Divider />
      {/* Add more settings here as needed */}

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editModalVisible}
        onDismiss={() => setEditModalVisible(false)}
      />
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
    marginVertical: 16,
    marginHorizontal: 16,
  },
  settingText: {
    flex: 1,
    fontSize: 18,
  },
  button: {
    minWidth: 80,
  },
});

export default Settings;
