import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PASTE YOUR CONFIG HERE (From Firebase Console)
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
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };