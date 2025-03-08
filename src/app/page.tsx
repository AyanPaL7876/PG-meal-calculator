"use client";
import { signInWithGoogle } from "../services/authService";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaUtensils, FaClock, FaMoneyBillWave, FaCalculator } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Home as HomeIcon } from "lucide-react";

interface Feature {
  header: string;
  details: string;
  icon: JSX.Element;
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      alert(`Google Sign-in failed: ${(error as Error).message}`);
    }
  };

  const features: Feature[] = [
    {
      header: "Meal Suggestions",
      details: "Get personalized meal suggestions tailored to your needs.",
      icon: <FaUtensils className="text-4xl text-blue-400" />,
    },
    {
      header: "Time Management",
      details: "Efficiently manage your daily schedule and meal timings.",
      icon: <FaClock className="text-4xl text-blue-400" />,
    },
    {
      header: "Expense Tracking",
      details: "Keep track of your daily expenses with ease.",
      icon: <FaMoneyBillWave className="text-4xl text-blue-400" />,
    },
    {
      header: "Automatic Calculations",
      details: "Automatically calculate expenses and meal costs.",
      icon: <FaCalculator className="text-4xl text-blue-400" />,
    },
  ];

  return (
    <main className="flex flex-col min-h-screen bg-gray-900 text-gray-200">
      {/* Navbar */}
      <nav className="fixed w-full bg-gray-900/95 border-b border-gray-800 shadow-lg backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <h1 className="text-2xl font-bold text-blue-400">PG-meal</h1>
          <div className="flex gap-6">
            {user && (
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              <HomeIcon size={20} className="text-blue-400" />
              <span className="text-gray-300 text-sm font-medium">Dashboard</span>
            </motion.button>
            )}
            <button
              onClick={handleGoogleSignIn}
              className="flex items-center gap-3 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 hover:bg-gray-600 hover:scale-105 transition-all duration-300"
            >
              <FcGoogle className="text-2xl" /> Login
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center h-screen pt-20 gap-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/design1.png')" }}>
        <h1 className="text-5xl font-extrabold animate-fade-in">
          Welcome to <span className="text-blue-400">PG-meal</span>
        </h1>
        <p className="text-lg text-gray-400">
          Manage meals, expenses, and users with ease.
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="flex items-center gap-3 px-6 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-500 hover:scale-105 transition-all duration-300"
        >
          <FcGoogle className="text-2xl" /> Continue with Google
        </button>
      </section>

      {/* Why Section */}
      <section className="flex flex-col items-center justify-center text-center min-h-screen pt-20 gap-6 bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/design2.png')" }}>
        <h2 className="text-4xl font-bold text-gray-300">Why Choose PG-meal?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="w-80 bg-gray-700/40 border border-gray-600 rounded-lg p-6 shadow-lg text-center hover:bg-gray-600 hover:scale-105 transition-all duration-300 flex flex-col items-center gap-4"
            >
              {feature.icon}
              <h3 className="text-2xl font-semibold text-blue-400">{feature.header}</h3>
              <p className="mt-3 text-gray-400">{feature.details}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
