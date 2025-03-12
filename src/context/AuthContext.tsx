"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase"; // Firebase auth instance
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { StoreUser } from "@/types/User";
import { destroyCookie } from "nookies"; // Import nookies for cookie management
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/Loading";

interface AuthContextType {
  user: StoreUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 📌 Handle Google Login & Store User in Firestore
  const loginWithGoogle = async () => {
    setLoading(true); // Set loading to true at the beginning of login process
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      if (!googleUser) throw new Error("Google Login Failed");

      const userRef = doc(db, "users", googleUser.uid);
      const userSnap = await getDoc(userRef);

      let userData: StoreUser;

      if (!userSnap.exists()) {
        // If user does not exist, store in Firestore
        userData = {
          uid: googleUser.uid,
          name: googleUser.displayName || "Unknown User",
          email: googleUser.email || "",
          photoURL: googleUser.photoURL || "",
          mealStatus: false,
          role: "user",
          pgId: "",
        };

        await setDoc(userRef, userData);
      } else {
        // If user exists, use existing data
        userData = userSnap.data() as StoreUser;
      }
      
      // Explicitly set the user data here after Firestore operations complete
      setUser(userData);
      setLoading(false); // Set loading to false after user data is set
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  // 📌 Handle Logout
  const logout = async () => {
    setLoading(true); // Set loading state during logout
    try {
      await signOut(auth);
      destroyCookie(null, "token"); // Remove the authentication token
      setUser(null); // Clear user state before navigation
      router.push("/signin"); // Redirect to the login page
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false); // Ensure loading is set to false when complete
    }
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
            // Handle case where user exists in Firebase Auth but not in Firestore
            // This could happen if Firestore write failed during registration
            const newUser: StoreUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || "Unknown User",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || "",
              mealStatus: false,
              role: "user",
              pgId: "",
            };
            
            await setDoc(userRef, newUser);
            setUser(newUser);
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
      {loading ? (
        // You can replace this with a proper loading component
        <LoadingScreen message="Checking user authentication..." />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}