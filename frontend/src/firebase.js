// Firebase client SDK initialisation.
// All values come from Vite env vars (frontend/.env.local).

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Keep the user signed in across browser refreshes / restarts.
// (browserLocalPersistence is Firebase's default but we set it explicitly
//  so the behaviour is obvious in the code.)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Could not set Firebase persistence:", err);
});
