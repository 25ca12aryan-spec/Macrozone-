
import { deleteMeal } from '@/storage/meals';
import { colors } from '@/styles/global';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type MealItemProps = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  onDelete: () => void;
};

export default function MealItem({
  id,
  name,
  calories,
  protein,
  carbs,
  fat,
  onDelete,
}: MealItemProps) {
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (deleting) return;

    setDeleting(true);

    try {
      await deleteMeal(id);

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        );
      }

      onDelete();
    } catch (error) {
      console.error('Error deleting meal:', error);

      if (Platform.OS === 'web') {
        window.alert('Could not delete this meal. Please try again.');
      } else {
        Alert.alert('Error', 'Could not delete this meal.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePress = () => {
    if (deleting) return;

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
        void confirmDelete();
      }
    } else {
      Alert.alert(
        'Delete Meal',
        `Are you sure you want to delete "${name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => void confirmDelete(),
          },
        ],
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mealInfo}>
        <Text style={styles.name}>{name}</Text>

        <Text style={styles.macros}>
          {calories} cal • {protein}g P • {carbs}g C • {fat}g F
        </Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDeletePress}
        disabled={deleting}
        accessibilityRole="button"
        accessibilityLabel={`Delete ${name}`}
      >
        <Ionicons
          name="trash-outline"
          size={21}
          color="#FF5C5C"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealInfo: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  macros: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
