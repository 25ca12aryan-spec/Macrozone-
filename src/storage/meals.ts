
import { db } from '@/lib/firebase';
import { auth } from '@/lib/firebaseAuth';
import { signInAnonymously } from 'firebase/auth';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  writeBatch,
} from 'firebase/firestore';

export type Meal = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  createdAt: string;
};

// Prevent multiple simultaneous anonymous sign-in requests.
let signInPromise: Promise<string> | null = null;

const getUserId = async (): Promise<string> => {
  // Wait until Firebase has restored any saved login session.
  await auth.authStateReady();

  if (auth.currentUser) {
    return auth.currentUser.uid;
  }

  if (!signInPromise) {
    signInPromise = signInAnonymously(auth)
      .then((credential) => credential.user.uid)
      .finally(() => {
        signInPromise = null;
      });
  }

  return signInPromise;
};

// Get the current user's private meals collection.
const getMealsCollection = async () => {
  const userId = await getUserId();

  return collection(db, 'users', userId, 'meals');
};

// READ: Get all meals, newest first.
export const getMeals = async (): Promise<Meal[]> => {
  const mealsRef = await getMealsCollection();

  const mealsQuery = query(
    mealsRef,
    orderBy('createdAt', 'desc'),
  );

  const snapshot = await getDocs(mealsQuery);

  return snapshot.docs.map((mealDoc) => ({
    id: mealDoc.id,
    ...mealDoc.data(),
  })) as Meal[];
};

// CREATE: Add a meal to Firestore.
export const addMeal = async (
  meal: Omit<Meal, 'id' | 'createdAt'>,
): Promise<Meal> => {
  const mealsRef = await getMealsCollection();

  const newMeal = {
    ...meal,
    createdAt: new Date().toISOString(),
  };

  const docRef = await addDoc(mealsRef, newMeal);

  return {
    id: docRef.id,
    ...newMeal,
  };
};

// DELETE: Remove one meal.
export const deleteMeal = async (id: string): Promise<void> => {
  const mealsRef = await getMealsCollection();

  await deleteDoc(doc(mealsRef, id));
};

// DELETE: Remove all meals belonging to the current user.
export const clearAllMeals = async (): Promise<void> => {
  const mealsRef = await getMealsCollection();
  const snapshot = await getDocs(mealsRef);

  for (let start = 0; start < snapshot.docs.length; start += 500) {
    const batch = writeBatch(db);
    const chunk = snapshot.docs.slice(start, start + 500);

    chunk.forEach((mealDoc) => {
      batch.delete(mealDoc.ref);
    });

    await batch.commit();
  }
};
