
import { colors } from '@/styles/global';
import {
  cancelMealReminders,
  requestPermissions,
  scheduleMealReminders,
} from '@/utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

const REMINDERS_KEY = 'remindersEnabled';

const showMessage = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function ReminderToggle() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Restore the saved preference when MacroZone opens
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const value = await AsyncStorage.getItem(REMINDERS_KEY);

        if (!mounted) return;

        const isEnabled = value === 'true';
        setEnabled(isEnabled);

        // Web reminders use an in-memory timer, so restart it after reload
        if (isEnabled && Platform.OS === 'web') {
          await scheduleMealReminders();
        }
      } catch (error) {
        console.error('Error loading meal reminders:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const toggle = async (value: boolean) => {
    if (updating) return;

    setUpdating(true);

    try {
      if (value) {
        const granted = await requestPermissions();

        if (!granted) {
          showMessage(
            'Notifications disabled',
            'Please allow notifications in your browser or device settings to enable meal reminders.',
          );
          return;
        }

        await scheduleMealReminders();
      } else {
        await cancelMealReminders();
      }

      await AsyncStorage.setItem(REMINDERS_KEY, String(value));
      setEnabled(value);
    } catch (error) {
      console.error('Error updating meal reminders:', error);

      showMessage(
        'Error',
        'Could not update meal reminders. Please try again.',
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Meal Reminders</Text>

      <Switch
        accessibilityLabel="Meal reminders"
        value={enabled}
        disabled={loading || updating}
        onValueChange={toggle}
        trackColor={{
          false: colors.surface,
          true: colors.primary,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 30,
    minHeight: 44,
  },
  label: {
    color: colors.text,
    fontSize: 16,
  },
});
