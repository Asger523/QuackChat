import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, Alert} from 'react-native';
import {
  Modal,
  Portal,
  TextInput,
  Button,
  useTheme,
  Divider,
} from 'react-native-paper';
import {useAuth} from '../contexts/auth.context';

interface EditProfileModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onDismiss,
}) => {
  const {
    user,
    reauthenticateUser,
    updateDisplayName,
    updateEmail,
    updatePassword,
  } = useAuth();
  const theme = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setEmail(user.email || '');
    }
  }, [user]);

  // Reset form when modal closes
  const handleDismiss = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    onDismiss();
  };

  // Handle form submission
  const handleSave = async () => {
    setLoading(true);

    try {
      const updates: string[] = [];

      // Check what needs to be updated
      const needsDisplayNameUpdate =
        displayName.trim() !== (user?.displayName || '');
      const needsEmailUpdate = email !== user?.email;
      const needsPasswordUpdate = newPassword.trim() !== '';

      // Validate that current password is provided for sensitive operations
      if ((needsEmailUpdate || needsPasswordUpdate) && !currentPassword) {
        throw new Error(
          'Current password is required to update email or password',
        );
      }

      // Update display name
      if (needsDisplayNameUpdate) {
        await updateDisplayName(displayName);
        updates.push('display name');
      }

      // Update email
      if (needsEmailUpdate) {
        await updateEmail(email, currentPassword);
        updates.push('email');
      }

      // Update password
      if (needsPasswordUpdate) {
        await updatePassword(newPassword, confirmPassword, currentPassword);
        updates.push('password');
      }

      if (updates.length > 0) {
        Alert.alert('Success', `Successfully updated: ${updates.join(', ')}`, [
          {text: 'OK', onPress: handleDismiss},
        ]);
      } else {
        Alert.alert('Info', 'No changes were made');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          {backgroundColor: theme.colors.surface},
          {borderColor: theme.colors.outline},
        ]}>
        <View style={styles.container}>
          <Text style={[styles.title, {color: theme.colors.onSurface}]}>
            Edit Profile
          </Text>

          <Divider style={styles.divider} />

          {/* Display Name Input */}
          <TextInput
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          {/* Email Input */}
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          <Divider style={styles.divider} />

          <Text style={[styles.sectionTitle, {color: theme.colors.onSurface}]}>
            Change Password
          </Text>

          {/* Current Password Input */}
          <TextInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            disabled={loading}
            placeholder="Required for email or password changes"
          />

          {/* New Password Input */}
          <TextInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            disabled={loading}
            placeholder="Leave blank to keep current password"
          />

          {/* Confirm New Password Input */}
          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            mode="outlined"
            style={styles.input}
            disabled={loading}
          />

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              loading={loading}
              disabled={loading}
              style={styles.saveButton}
              icon="content-save">
              Save Changes
            </Button>

            <Button
              mode="outlined"
              onPress={handleDismiss}
              disabled={loading}
              style={styles.cancelButton}
              icon="cancel">
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
    marginHorizontal: 12,
  },
  divider: {
    marginVertical: 16,
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
    marginBottom: 12,
  },
  saveButton: {
    marginHorizontal: 0,
  },
  cancelButton: {
    marginHorizontal: 0,
  },
});

export default EditProfileModal;
