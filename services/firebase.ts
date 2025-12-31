import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { getDatabase, ref, set, push, onValue, serverTimestamp, onDisconnect, off, DatabaseReference } from 'firebase/database';

// Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBxKizilGAMW1IKWnxZzWlNlk2njveBA3s",
  authDomain: "lorenzomorse-default-rtdb.firebaseapp.com", // Inferred standard pattern
  databaseURL: "https://lorenzomorse-default-rtdb.firebaseio.com",
  projectId: "lorenzomorse-default-rtdb",
  storageBucket: "lorenzomorse-default-rtdb.appspot.com",
  messagingSenderId: "1234567890", // Generic placeholder format, required structure
  appId: "1:1234567890:web:abcdef123456" // Generic placeholder format
};

// Initialize
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged,
  signOut,
  ref,
  set,
  push,
  onValue,
  serverTimestamp,
  onDisconnect,
  off
};
export type { User, DatabaseReference };