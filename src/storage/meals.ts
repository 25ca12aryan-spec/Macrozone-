
import { API_URL } from '@/lib/api';
import { auth } from '@/lib/firebaseAuth';
import { signInAnonymously } from 'firebase/auth';

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

const getUserIdToken = async (): Promise<string> => {
  await auth.authStateReady();

  if (auth.currentUser) {
    return auth.currentUser.getIdToken();
  }

  if (!signInPromise) {
    signInPromise = signInAnonymously(auth)
      .then(async (credential) => {
        return credential.user.getIdToken();
      })
      .finally(() => {
        signInPromise = null;
      });
  }

  return signInPromise;
};

// Send authenticated requests to the MacroZone API.
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = await getUserIdToken();

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong.');
  }

  return data as T;
};

// READ: Get all meals, newest first.
export const getMeals = async (): Promise<Meal[]> => {
  const data = await apiRequest<{
    success: boolean;
    meals: Meal[];
  }>('/api/meals');

  return data.meals;
};

// CREATE: Add a meal.
export const addMeal = async (
  meal: Omit<Meal, 'id' | 'createdAt'>,
): Promise<Meal> => {
  const data = await apiRequest<{
    success: boolean;
    meal: Meal;
  }>('/api/meals', {
    method: 'POST',
    body: JSON.stringify(meal),
  });

  return data.meal;
};

// DELETE: Remove one meal.
export const deleteMeal = async (id: string): Promise<void> => {
  await apiRequest(`/api/meals/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
};

// DELETE: Remove all meals.
export const clearAllMeals = async (): Promise<void> => {
  await apiRequest('/api/meals', {
    method: 'DELETE',
  });
};
