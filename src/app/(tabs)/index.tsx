import HomeHeader from '@/components/HomeHeader';
import MacroGrid from '@/components/MacroGrid';
import CopyButton from '@/components/CopyButton';
import ReminderToggle from '@/components/ReminderToggle';
import RecentMeals from '@/components/RecentMeals';
import ShareButton from '@/components/ShareButton';
import { getMeals, Meal } from '@/storage/meals';
import { globalStyles } from '@/styles/global';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  const [meals, setMeals] = useState<Meal[]>([]);

  const loadMeals = useCallback(async () => {
    try {
      const data = await getMeals();
      setMeals(data);
    } catch (error) {
      console.error('Error loading meals:', error);
      Alert.alert('Error', 'Could not load meals from Firebase.');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals]),
  );

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.header}>
        <Text style={globalStyles.title}>MacroZone</Text>
        <ShareButton meals={meals} />
      </View>
      <HomeHeader />
      <MacroGrid meals={meals} />
      <CopyButton meals={meals} />
      <ReminderToggle />
      <RecentMeals meals={meals} onDelete={loadMeals} />
    </ScrollView>
  );
}
