
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const LAST_LUNCH_KEY = 'lastLunchReminder';
const LAST_DINNER_KEY = 'lastDinnerReminder';

let webReminderInterval: ReturnType<typeof setInterval> | null = null;

// Android notification configuration
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

// Request permission
export const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'web') {
    if (
      typeof window === 'undefined' ||
      !('Notification' in window)
    ) {
      return false;
    }

    const permission = await window.Notification.requestPermission();
    return permission === 'granted';
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

// Show a browser notification
const showWebNotification = (title: string, body: string) => {
  if (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    window.Notification.permission === 'granted'
  ) {
    new window.Notification(title, {
      body,
    });
  }
};

// Check whether a web reminder is due
const checkWebReminders = async () => {
  const now = new Date();
  const today = now.toLocaleDateString('en-CA');

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Lunch reminder: 12:00 PM
  if (currentMinutes >= 12 * 60) {
    const lastLunch = await AsyncStorage.getItem(LAST_LUNCH_KEY);

    if (lastLunch !== today) {
      showWebNotification(
        'MacroZone',
        "Don't forget to log your lunch!",
      );

      await AsyncStorage.setItem(LAST_LUNCH_KEY, today);
    }
  }

  // Dinner reminder: 6:00 PM
  if (currentMinutes >= 18 * 60) {
    const lastDinner = await AsyncStorage.getItem(LAST_DINNER_KEY);

    if (lastDinner !== today) {
      showWebNotification(
        'MacroZone',
        'Time to log your dinner!',
      );

      await AsyncStorage.setItem(LAST_DINNER_KEY, today);
    }
  }
};

// Start reminders
export const scheduleMealReminders = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    if (webReminderInterval) {
      clearInterval(webReminderInterval);
    }

    await checkWebReminders();

    webReminderInterval = setInterval(() => {
      void checkWebReminders().catch((error) => {
        console.error('Error checking web reminders:', error);
      });
    }, 30000);

    return;
  }

  // Existing Android scheduling
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'MacroZone',
      body: "Don't forget to log your lunch!",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    },
  });

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'MacroZone',
      body: 'Time to log your dinner!',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
};

// Cancel reminders
export const cancelMealReminders = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    if (webReminderInterval) {
      clearInterval(webReminderInterval);
      webReminderInterval = null;
    }
    return;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();
};
