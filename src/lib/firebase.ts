import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAZsqBsoaDx1_UUkN_RhfqLYwD_Q22Prl8",
  authDomain: "macrozone-af5f7.firebaseapp.com",
  databaseURL: "https://macrozone-af5f7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "macrozone-af5f7",
  storageBucket: "macrozone-af5f7.firebasestorage.app",
  messagingSenderId: "472312224702",
  appId: "1:472312224702:web:12b5c2b5570586ef94b7ef"
};

export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);