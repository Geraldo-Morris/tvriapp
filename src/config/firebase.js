// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa8EyjkOO4_QTySQW8j7xZpj8oFm93UdI",
  authDomain: "kerjapraktik-73563.firebaseapp.com",
  projectId: "kerjapraktik-73563",
  storageBucket: "kerjapraktik-73563.appspot.com",
  messagingSenderId: "36255564527",
  appId: "1:36255564527:android:25483ade547bdbd271911a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
