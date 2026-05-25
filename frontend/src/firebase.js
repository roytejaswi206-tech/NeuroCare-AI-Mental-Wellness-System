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

// If Firebase env vars are missing in the deployed build, initializeApp throws
// during module load and the app mounts as a blank white screen. Surface a
// readable message in the DOM and console so the failure mode is debuggable
// on Vercel without dev tools.
const missing = Object.entries(firebaseConfig)
  .filter(([, v]) => !v)
  .map(([k]) => k);

if (missing.length) {
  const msg =
    `Missing Firebase env vars: ${missing.join(", ")}. ` +
    `Set the matching VITE_FIREBASE_* variables in your Vercel project ` +
    `(Settings → Environment Variables) and redeploy.`;
  console.error(msg);
  if (typeof document !== "undefined") {
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML =
        `<pre style="padding:24px;font-family:ui-monospace,monospace;` +
        `white-space:pre-wrap;color:#b91c1c;">${msg}</pre>`;
    }
  }
  throw new Error(msg);
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Keep the user signed in across browser refreshes / restarts.
// (browserLocalPersistence is Firebase's default but we set it explicitly
//  so the behaviour is obvious in the code.)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Could not set Firebase persistence:", err);
});
