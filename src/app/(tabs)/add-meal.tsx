import { addMeal } from '@/storage/meals';
import { colors, globalStyles } from '@/styles/global';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AddMealScreen() {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddMeal = async () => {
    if (!name.trim() || !calories.trim()) {
      Alert.alert('Error', 'Please enter a meal name and calories.');
      return;
    }

    const calorieValue = Number(calories);
    const proteinValue = Number(protein) || 0;
    const carbsValue = Number(carbs) || 0;
    const fatValue = Number(fat) || 0;

    if (
      !Number.isFinite(calorieValue) ||
      calorieValue < 0 ||
      ![proteinValue, carbsValue, fatValue].every(
        (value) => Number.isFinite(value) && value >= 0,
      )
    ) {
      Alert.alert('Error', 'Please enter valid non-negative nutrition values.');
      return;
    }

    try {
      setSaving(true);

      await addMeal({
        name: name.trim(),
        calories: calorieValue,
        protein: proteinValue,
        carbs: carbsValue,
        fat: fatValue,
      });

      setName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');

      Alert.alert('Success', 'Meal saved to Firebase!');
      router.push('/');
    } catch (error) {
      console.error('Error adding meal:', error);
      Alert.alert('Error', 'Could not save the meal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.title}>Add Meal</Text>

      <TextInput
        style={styles.input}
        placeholder='Meal name'
        placeholderTextColor={colors.textSecondary}
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder='Calories'
        placeholderTextColor={colors.textSecondary}
        keyboardType='numeric'
        value={calories}
        onChangeText={setCalories}
      />

      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder='Protein (g)'
          placeholderTextColor={colors.textSecondary}
          keyboardType='numeric'
          value={protein}
          onChangeText={setProtein}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder='Carbs (g)'
          placeholderTextColor={colors.textSecondary}
          keyboardType='numeric'
          value={carbs}
          onChangeText={setCarbs}
        />
        <TextInput
          style={[styles.input, styles.rowInput]}
          placeholder='Fat (g)'
          placeholderTextColor={colors.textSecondary}
          keyboardType='numeric'
          value={fat}
          onChangeText={setFat}
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleAddMeal}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Saving...' : 'Add Meal'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowInput: {
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
