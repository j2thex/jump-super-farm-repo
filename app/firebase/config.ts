import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAhASm0v0iLnrrwErulRfggiHzsu5cgxvw",
  authDomain: "jump-super-farm.firebaseapp.com",
  projectId: "jump-super-farm",
  storageBucket: "jump-super-farm.firebasestorage.app",
  messagingSenderId: "423325180141",
  appId: "1:423325180141:web:a2df913d48d4b2cec1ece4"
  // We don't need measurementId for now
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); 