"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { toast } from "react-toastify";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        toast.error("You have been logged out. Please sign in again.");
        router.push("/signin");
      } else {
        try {
          // Additional check if the user session is invalid (e.g., manually revoked)
          await user.getIdToken(true); // Refresh token to verify session
        } catch (error) {
          console.log("❌ Error verifying user session:", error);
          toast.error("Session expired. Please log in again.");
          await signOut(auth);
          router.push("/signin");
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}
