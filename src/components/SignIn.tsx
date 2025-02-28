"use client";

import { signInWithGoogle } from "../services/authService";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      alert("Google Sign-in failed: " + (error as Error).message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 shadow-xl rounded-lg p-8 w-96 text-center">
        <h1 className="text-3xl font-bold text-gray-200">Welcome Back!</h1>
        <p className="text-gray-400 mt-2">Sign in to continue</p>

        <button
          onClick={handleGoogleSignIn}
          className="mt-6 flex items-center justify-center w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-md text-gray-300 hover:bg-gray-600 hover:scale-105 transition-all duration-300"
        >
          <FcGoogle className="text-2xl mr-3" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
