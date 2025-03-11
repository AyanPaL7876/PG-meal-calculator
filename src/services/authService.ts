import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import jwt from "jsonwebtoken";
import { setCookie } from "nookies";
import { StoreUser } from "@/types/User";

const SECRET_KEY = "your-secret-key"; // Replace with a secure key (store in .env)

// 📌 Google Sign-In with Token Generation
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
        requestedId: [{ pgId: "", status: "", date: "" }],
      };

      await setDoc(userRef, userData);
    } else {
      // Fetch existing user data
      userData = userSnap.data() as StoreUser;
    }

    // 📌 Generate a JWT token
    const token = jwt.sign(
      { uid: userData.uid, role: userData.role, email: userData.email },
      SECRET_KEY,
      { expiresIn: "7d" } // Token valid for 7 days
    );

    // 📌 Store token in cookies
    setCookie(null, "token", token, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
      httpOnly: true, // Secure cookie
    });

    return userData;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
};
