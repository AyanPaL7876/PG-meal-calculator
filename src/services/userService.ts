import { db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const addUser = async (user: any) => {
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      name: user.displayName,
      email: user.email,
      mealStatus: "off",
      role: "user",
      pgId: null
    }, { merge: true });
    console.log("User added successfully!");
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

export const getUser = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};
