"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase"; // Firebase auth instance
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { StoreUser } from "@/types/User";
import { destroyCookie } from "nookies"; // Import nookies for cookie management
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: StoreUser | null;
  loading: boolean; // Add loading state
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(true); // Initialize loading as true
  const router = useRouter();

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
        const newUser: StoreUser = {
          uid: googleUser.uid,
          name: googleUser.displayName || "Unknown User",
          email: googleUser.email || "",
          photoURL: googleUser.photoURL || "",
          mealStatus: false,
          role: "user",
          pgId: "",
        };

        await setDoc(userRef, newUser);
        setUser(newUser);
      } else {
        // If user exists, fetch and set data
        setUser(userSnap.data() as StoreUser);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  // 📌 Handle Logout
  const logout = async () => {
    await signOut(auth);
    destroyCookie(null, "token"); // Remove the authentication token
    router.push("/signin"); // Redirect to the login page
    setUser(null);
  };

  // 📌 Listen for Auth Changes & Fetch Firestore User Data
  useEffect(() => {
    setLoading(true); // Set loading to true when starting the auth check
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser(userSnap.data() as StoreUser);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
        setUser(null);
      } finally {
        setLoading(false); // Set loading to false when auth check completes
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}