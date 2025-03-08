import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// 🔹 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyARZEnzUd3IQdq6croBBzL4bsw_uQtXCnk",
  authDomain: "pg-managment.firebaseapp.com",
  projectId: "pg-managment",
  storageBucket: "pg-managment.firebasestorage.app",
  messagingSenderId: "805057852491",
  appId: "1:805057852491:web:c7c527ef04dd71140309ce",
  measurementId: "G-GX8V8GVXNN"
};
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
// };

// console.log("apiKey", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
// console.log("authDomain", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
// console.log("projectId", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
// console.log("storageBucket", process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET);
// console.log("messagingSenderId", process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID);
// console.log("appId", process.env.NEXT_PUBLIC_FIREBASE_APP_ID);
// console.log("measurementId", process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID);


// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// 🔹 Enable Auth State Persistence (Keeps user logged in)
setPersistence(auth, browserLocalPersistence);

// 🔹 Google Auth Provider with Custom Parameters
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export default app;
