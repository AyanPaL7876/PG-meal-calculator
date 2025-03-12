"use client";
import { signInWithGoogle } from "@/services/authService";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Home as HomeIcon} from "lucide-react";


export default function HeroSection() {
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

  return (
      <section className="relative flex flex-col items-center justify-center text-center min-h-screen pt-20 px-6 bg-cover bg-center bg-no-repeat overflow-hidden"
        style={{ backgroundImage: "linear-gradient(rgba(17, 24, 39, 0.7), rgba(17, 24, 39, 0.8)), url('/design1.png')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Simplify <span className="text-blue-400">PG Living</span> with Smart Meal Management
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            The all-in-one solution for managing meals, tracking expenses, and organizing shared living in paying guest accommodations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            { !user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoogleSignIn}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all duration-300"
            >
              <FcGoogle className="text-2xl" /> Continue with Google
            </motion.button>) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all duration-300"
            >
              <HomeIcon className="text-2xl"/>  Go to Home page
            </motion.button>
            )}
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="#how-it-works"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 hover:bg-gray-600 transition-all duration-300"
            >
              Learn More
            </motion.a>
          </div>
        </motion.div>

        {/* Stats counters */}
        {/* <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 py-6 px-4 bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50"
        >
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-blue-400">5000+</p>
            <p className="text-sm md:text-base text-gray-400">Active Users</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-blue-400">₹1.2M</p>
            <p className="text-sm md:text-base text-gray-400">Expenses Tracked</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-blue-400">350+</p>
            <p className="text-sm md:text-base text-gray-400">PG Homes</p>
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-blue-400">4.9</p>
            <p className="text-sm md:text-base text-gray-400">User Rating</p>
          </div>
        </motion.div> */}
      </section>
  );
}