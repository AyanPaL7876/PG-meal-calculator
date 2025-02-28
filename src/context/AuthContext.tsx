"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase"; // Firebase auth instance
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Define user type based on Firestore schema
interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  mealStatus: boolean;
  role: "user" | "admin";
  pgId?: string;
}

interface AuthContextType {
  user: FirestoreUser | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirestoreUser | null>(null);

  // 📌 Handle Google Login & Store User in Firestore
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      if (!googleUser) throw new Error("Google Login Failed");

      const userRef = doc(db, "users", googleUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // If user does not exist, store in Firestore
        const newUser: FirestoreUser = {
          uid: googleUser.uid,
          name: googleUser.displayName || "Unknown User",
          email: googleUser.email || "",
          photoURL: googleUser.photoURL || "",
          mealStatus: false,
          role: "user",
          pgId: null,
        };

        await setDoc(userRef, newUser);
        setUser(newUser);
      } else {
        // If user exists, fetch and set data
        setUser(userSnap.data() as FirestoreUser);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // 📌 Handle Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // 📌 Listen for Auth Changes & Fetch Firestore User Data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUser(userSnap.data() as FirestoreUser);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
