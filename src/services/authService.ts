import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {StoreUser } from "@/types/User";

// 📌 Google Sign-In and Firestore Storage
export const signInWithGoogle = async (): Promise<StoreUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    if (!googleUser) throw new Error("Google Login Failed");

    const userRef = doc(db, "users", googleUser.uid);
    const userSnap = await getDoc(userRef);

    let userData: StoreUser;

    if (!userSnap.exists()) {
      // If user does not exist, create a new entry in Firestore
      userData = {
        uid: googleUser.uid,
        name: googleUser.displayName || "Unknown User",
        email: googleUser.email || "",
        photoURL: googleUser.photoURL || "",
        mealStatus: false,
        mealCount: 0,
        role: "user",
        pgId: "",
        requestedId: [{pgId: "", status: "", date: ""}],
      };

      await setDoc(userRef, userData);
    } else {
      // Fetch existing user data
      userData = userSnap.data() as StoreUser;
    }

    return userData;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};

// 📌 Logout function
export const logOut = async () => {
  await signOut(auth);
};

// 📌 Listen for auth state changes & fetch Firestore user
export const listenForAuthChanges = (callback: (user: StoreUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        callback(userSnap.data() as StoreUser);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};
