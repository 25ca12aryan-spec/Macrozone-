import MealItem from '@/components/MealItem';
import {
  clearAllMeals,
  getMeals,
  Meal,
} from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AllMealsScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = useCallback(async () => {
    try {
      setMeals(await getMeals());
    } catch (error) {
      console.error('Error loading meals:', error);
      Alert.alert('Error', 'Could not load meals from Firebase.');
    }
  }, []);

  
const handleClearAll = () => {
  const performClearAll = async () => {
    try {
      await clearAllMeals();
      await loadMeals();
    } catch (error) {
      console.error('Error clearing meals:', error);
      Alert.alert('Error', 'Could not clear meals from Firebase.');
    }
  };

  if (Platform.OS === 'web') {
    if (
      window.confirm(
        'Are you sure you want to permanently delete all your meals?',
      )
    ) {
      void performClearAll();
    }
  } else {
    Alert.alert(
      'Clear All Meals',
      'Are you sure you want to permanently delete all your meals?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => void performClearAll(),
        },
      ],
    );
  }
};

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals]),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>All Meals</Text>
        <TouchableOpacity
          onPress={handleClearAll}
          disabled={meals.length === 0}
        >
          <Text style={styles.clearButton}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <View style={{ marginTop: 30 }}>
        {meals.length === 0 ? (
          <Text style={globalStyles.empty}>No meals logged yet.</Text>
        ) : (
          meals.map((meal) => (
            <MealItem
              key={meal.id}
              id={meal.id}
              name={meal.name}
              calories={meal.calories}
              protein={meal.protein}
              carbs={meal.carbs}
              fat={meal.fat}
              onDelete={loadMeals}
            />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = {
  clearButton: {
    color: 'red',
    fontSize: 16,
  },
};