import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAcYB2iEE3F_xfGPtMvXmOQjF59YAq2mws",
  authDomain: "helprapp-89c1f.firebaseapp.com",
  projectId: "helprapp-89c1f",
  storageBucket: "helprapp-89c1f.firebasestorage.app",
  messagingSenderId: "536749840104",
  appId: "1:536749840104:web:cb988587425aac301c9b5d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
