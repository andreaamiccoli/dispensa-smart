import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAPhivhluM-fueTIRgAW9V6PY0yK7jR8u0",
  authDomain: "dispensa-smart-ad615.firebaseapp.com",
  projectId: "dispensa-smart-ad615",
  storageBucket: "dispensa-smart-ad615.firebasestorage.app",
  messagingSenderId: "520014323149",
  appId: "1:520014323149:web:7c89766693de43ad437884"
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
