import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { StoreUser } from "@/types/User";

type AuthErrorType = {
  code: string;
  message: string;
};

export const signInWithGoogle = async (): Promise<StoreUser | null> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const googleUser = result.user;

    if (!googleUser) throw new Error("Google Login Failed");

    const userRef = doc(db, "users", googleUser.uid);
    const userSnap = await getDoc(userRef);

    let userData: StoreUser;

    if (!userSnap.exists()) {
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
      userData = userSnap.data() as StoreUser;
    }

    // 📌 Call Next.js API route to generate and store JWT token
    await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: userData.uid,
        role: userData.role,
        email: userData.email,
      }),
    });

    return userData;
  } catch (error: unknown) {
    const authError = error as AuthErrorType; // Type casting error

    if (authError.code === "auth/popup-closed-by-user") {
      console.warn("User closed the login popup before completing authentication.");
    } else {
      console.error("Login error:", authError.message);
    }
    return null;
  }
};
