// Auth state, powered by Firebase.
//
// - register / login / Google sign-in / logout all go through the Firebase
//   client SDK.
// - `onAuthStateChanged` keeps `user` in sync with whatever Firebase has
//   cached locally, so a page refresh keeps you signed in.
// - After Firebase succeeds we POST the Firebase ID token to the Flask
//   backend (/api/auth/firebase) to get a short-lived Flask JWT. That JWT
//   is what /moods uses for per-user storage.

import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";

import { auth, googleProvider } from "../firebase";
import api from "../services/api";

const AuthContext = createContext(null);

// Translate Firebase's error codes into friendlier messages.
function friendlyError(err) {
  const code = err?.code || "";
  const map = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/missing-password": "Please enter a password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/invalid-login-credentials": "Invalid email or password.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
    "auth/popup-blocked": "Your browser blocked the sign-in popup.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
  };
  return map[code] || err?.message || "Something went wrong.";
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Exchange the current Firebase ID token for a Flask JWT and store it.
  // Called whenever Firebase auth state changes.
  async function syncBackend(firebaseUser) {
    if (!firebaseUser) {
      localStorage.removeItem("nc_token");
      return;
    }
    try {
      const idToken = await firebaseUser.getIdToken();
      const res = await api.post("/auth/firebase", { id_token: idToken });
      localStorage.setItem("nc_token", res.data.token);
    } catch (err) {
      // The Flask backend might be down - we still keep the user signed in
      // on the client. Mood saving will fail loudly until the backend is up.
      console.warn("Backend sync failed:", err.friendlyMessage || err.message);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await syncBackend(firebaseUser);
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0],
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
        localStorage.removeItem("nc_token");
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function register(name, email, password) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      // onAuthStateChanged will fire and finish the wiring (syncBackend + setUser).
      return cred.user;
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  }

  async function login(email, password) {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  }

  async function loginWithGoogle() {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      return cred.user;
    } catch (err) {
      throw new Error(friendlyError(err));
    }
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem("nc_token");
  }

  const value = { user, loading, register, login, loginWithGoogle, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
