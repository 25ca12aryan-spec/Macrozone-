import AsyncStorage from '@react-native-async-storage/async-storage';
import { app } from './firebase';

import {
    getAuth,
    initializeAuth,
} from 'firebase/auth';

import type { Auth, Persistence } from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';

// Work around Firebase's missing TypeScript declaration.
const getReactNativePersistence = (
  FirebaseAuth as unknown as {
    getReactNativePersistence: (
      storage: typeof AsyncStorage
    ) => Persistence;
  }
).getReactNativePersistence;

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  // Reuse the existing Auth instance during Fast Refresh.
  auth = getAuth(app);
}

export { auth };
