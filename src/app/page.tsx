"use client";

import { useEffect } from "react";
import { signInWithGoogle } from "../services/authService";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
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
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-gray-200 p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-100 animate-fade-in">Welcome to <span className="text-blue-400">PG Managment</span></h1>
        <p className="mt-3 text-lg text-gray-400">Manage meals, expenses, and users with ease.</p>
      </div>

      <div className="mt-8 p-6 bg-gray-800 shadow-xl rounded-lg w-96 text-center border border-gray-700">
        <h2 className="text-2xl font-semibold text-gray-300">Get Started</h2>
        <p className="text-gray-400 mt-2">Sign in with Google to access your dashboard.</p>

        <button
          onClick={handleGoogleSignIn}
          className="mt-6 flex items-center justify-center w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md shadow-md text-gray-300 hover:bg-gray-600 hover:scale-105 transition-all duration-300"
        >
          <FcGoogle className="text-2xl mr-3" />
          Continue with Google
        </button>
      </div>

    </main>
  );
}
