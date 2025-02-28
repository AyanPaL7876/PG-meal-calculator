import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Define Firestore user schema
interface FirestoreUser {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  mealStatus: boolean;
  role: "user" | "admin";
  pgId?: string;
}

// 📌 Google Sign-In and Firestore Storage
export const signInWithGoogle = async (): Promise<FirestoreUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    if (!googleUser) throw new Error("Google Login Failed");

    const userRef = doc(db, "users", googleUser.uid);
    const userSnap = await getDoc(userRef);

    let userData: FirestoreUser;

    if (!userSnap.exists()) {
      // If user does not exist, create a new entry in Firestore
      userData = {
        uid: googleUser.uid,
        name: googleUser.displayName || "Unknown User",
        email: googleUser.email || "",
        photoURL: googleUser.photoURL || "",
        mealStatus: false,
        role: "user",
        pgId: null,
      };

      await setDoc(userRef, userData);
    } else {
      // Fetch existing user data
      userData = userSnap.data() as FirestoreUser;
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
export const listenForAuthChanges = (callback: (user: FirestoreUser | null) => void) => {
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        callback(userSnap.data() as FirestoreUser);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};
