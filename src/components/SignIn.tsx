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
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="bg-gray-800 shadow-2xl rounded-xl p-10 w-96 text-center transform hover:scale-105 transition-all duration-500">
        <h1 className="text-4xl font-extrabold text-blue-400 mb-4">Welcome Back!</h1>
        <p className="text-gray-400 mb-6">Sign in to continue and manage your meals with ease</p>
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center justify-center w-full px-5 py-3 bg-blue-600 border border-blue-500 rounded-lg shadow-md text-white hover:bg-blue-500 hover:scale-105 transition-all duration-300"
        >
          <FcGoogle className="text-3xl mr-3" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}
