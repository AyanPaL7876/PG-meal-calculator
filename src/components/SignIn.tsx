"use client";

import { signInWithGoogle } from "../services/authService";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function SignIn() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure auth state is properly loaded
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (user) {
        router.push("/dashboard");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      
      // Force a hard refresh after sign-in to ensure data is loaded
      window.location.href = "/dashboard";
    } catch (error) {
      setIsLoading(false);
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
          disabled={isLoading}
          className={`flex items-center justify-center w-full px-5 py-3 bg-blue-600 border border-blue-500 rounded-lg shadow-md text-white hover:bg-blue-500 hover:scale-105 transition-all duration-300 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </>
          ) : (
            <>
              <FcGoogle className="text-3xl mr-3" />
              Continue with Google
            </>
          )}
        </button>
      </div>
    </div>
  );
}