"use client";
import { signInWithGoogle } from "@/services/authService";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaUtensils } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Home as HomeIcon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingNav() {
  const router = useRouter();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll event for navbar transparency
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      alert(`Google Sign-in failed: ${(error as Error).message}`);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/95 shadow-lg backdrop-blur-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
            <FaUtensils className="text-white text-xl" />
          </div>
          <h1 className="text-2xl font-bold text-blue-400">PG-meal Calculator</h1>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">Features</a>
          <a href="#how-it-works" className="text-gray-300 hover:text-blue-400 transition-colors">How It Works</a>
          <a href="#testimonials" className="text-gray-300 hover:text-blue-400 transition-colors">Testimonials</a>
          
          {user ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              <HomeIcon size={20} className="text-blue-400" />
              <span className="text-gray-300 text-sm font-medium">Dashboard</span>
            </motion.button>
          ):(
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGoogleSignIn}
            className="flex items-center gap-3 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all duration-300"
          >
            <FcGoogle className="text-2xl" /> {user ? 'Dashboard' : 'Login'}
          </motion.button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-gray-800 border-t border-gray-700"
        >
          <div className="flex flex-col px-6 py-4 space-y-4">
            <a href="#features" 
              className="text-gray-300 hover:text-blue-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >Features</a>
            <a href="#how-it-works" 
              className="text-gray-300 hover:text-blue-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >How It Works</a>
            <a href="#testimonials" 
              className="text-gray-300 hover:text-blue-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >Testimonials</a>
            
            {user ? (
              <button
                onClick={() => {
                  router.push("/dashboard");
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
              >
                <HomeIcon size={20} className="text-blue-400" />
                <span className="text-gray-300 text-sm font-medium">Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  handleGoogleSignIn();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-3 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all duration-300"
              >
                <FcGoogle className="text-2xl" />Login
              </button>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}