import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from 'react-native';
import {Divider, Button, Switch, useTheme} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import BottomBar from '../components/BottomBar';
import {useAppTheme} from '../contexts/theme.context';
import EditProfileModal from '../components/EditProfileModal';
import {useAuth} from '../contexts/auth.context';
import {useNotifications} from '../contexts/notifications.context';
import functions from '@react-native-firebase/functions';

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

  const handleTestNotification = async () => {
    // Check if running on iOS and show simulator warning
    if (Platform.OS === 'ios') {
      Alert.alert(
        'iOS Notification Testing',
        "Important: iOS push notifications only work on physical devices, not simulators.\n\nIf you're on a simulator, this test will fail with an APNs auth error.\n\nTo properly test iOS notifications:\n1. Use a physical iPhone/iPad\n2. Configure APNs in Firebase Console\n3. Run the app on the physical device",
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Continue Test', onPress: () => performTestNotification()},
        ],
      );
    } else {
      performTestNotification();
    }
  };

  const performTestNotification = async () => {
    try {
      console.log('Sending test notification...');
      const sendTestNotification = functions().httpsCallable(
        'sendTestNotification',
      );
      const result = await sendTestNotification();
      console.log('Test notification result:', result);

      const responseData = result.data as any;

      if (responseData?.success) {
        Alert.alert(
          'Test Notification Sent',
          `A test notification has been sent successfully!\nMessage ID: ${
            responseData?.messageId || 'N/A'
          }\nToken: ${responseData?.tokenPrefix || 'N/A'}...`,
          [{text: 'OK'}],
        );
      } else {
        // Handle error returned in response data
        const errorMsg = responseData?.error || 'Unknown error';

        // Check for specific iOS/APNs errors
        if (
          errorMsg.includes('messaging/third-party-auth-error') ||
          errorMsg.includes('APNs') ||
          errorMsg.includes('Auth error')
        ) {
          Alert.alert(
            'iOS APNs Configuration Required',
            `This error occurs because:\n\n1. iOS Simulators don't support push notifications\n2. Missing APNs configuration in Firebase Console\n\nTo fix:\n• Test on physical iOS device\n• Upload APNs Auth Key in Firebase Console\n\nError: ${errorMsg}`,
            [{text: 'OK'}],
          );
        } else {
          Alert.alert(
            'Test Failed',
            `Failed to send test notification:\n${errorMsg}`,
            [{text: 'OK'}],
          );
        }
      }
    } catch (error) {
      console.error('Test notification failed:', error);

      // This catch block handles network/Firebase connection errors
      let errorMessage = 'Network or connection error occurred';
      let errorCode = 'network';

      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error && typeof error === 'object') {
          errorMessage =
            (error as any).message ||
            (error as any).details ||
            (error as any).description ||
            'Firebase function call failed';
          errorCode =
            (error as any).code || (error as any).status || 'internal';
        }
      }

      console.error(
        'Parsed error - Code:',
        errorCode,
        'Message:',
        errorMessage,
      );

      Alert.alert(
        'Connection Error',
        `Failed to connect to notification service:\nCode: ${errorCode}\nMessage: ${errorMessage}`,
        [{text: 'OK'}],
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
      {/* Test Notification Button */}
      {isNotificationEnabled && (
        <>
          <View style={styles.settingRow}>
            <Text
              style={[styles.settingText, {color: theme.colors.onBackground}]}>
              Test Notifications
            </Text>
            <Button
              mode="outlined"
              style={styles.button}
              onPress={handleTestNotification}>
              Test
            </Button>
          </View>
          <Divider />
        </>
      )}
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
