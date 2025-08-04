import React, {useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {Divider, Button, Switch, useTheme} from 'react-native-paper';
import BottomBar from '../components/BottomBar';
import {useAppTheme} from '../contexts/theme.context';
import EditProfileModal from '../components/EditProfileModal';
import {useAuth} from '../contexts/auth.context';

const Settings = ({navigation}) => {
  const {isDarkMode, toggleTheme} = useAppTheme();
  const {signOut} = useAuth(); // Get signOut from useAuth hook
  const theme = useTheme();
  const [editModalVisible, setEditModalVisible] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigation.replace('SignIn'); // Navigate to SignIn screen after sign out
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
