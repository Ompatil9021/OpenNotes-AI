import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ⚠️ REPLACE THIS WITH YOUR ACTUAL FIREBASE CONFIG KEYS ⚠️
// You can find these in Firebase Console -> Project Settings -> General -> Your Apps
  const firebaseConfig = {
    apiKey: "AIzaSyBxFeqOox4sXp-HIaJ9IQeTa5nd-aAyyx4",
    authDomain: "opennotes-ai.firebaseapp.com",
    projectId: "opennotes-ai",
    storageBucket: "opennotes-ai.firebasestorage.app",
    messagingSenderId: "962984182326",
    appId: "1:962984182326:web:192680a7404eefd4e64e97",
    measurementId: "G-04CCLQVJ8E"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Auth and Database to be used in other files
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;