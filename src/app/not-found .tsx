"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FaUtensils } from "react-icons/fa";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800 text-white px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Logo and title */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          className="flex items-center gap-3 mb-8"
        >
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
            <FaUtensils className="text-white text-xl" />
          </div>
          <h1 className="text-3xl font-bold text-blue-400">PG-meal Calculator</h1>
        </motion.div>

        {/* 404 display */}
        <motion.h2
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6"
        >
          404
        </motion.h2>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center max-w-md mb-10"
        >
          <h3 className="text-2xl font-semibold mb-3">Page Not Found</h3>
          <p className="text-gray-300">
            The recipe you&#x27;re looking for might have been moved or doesn&#x27;t exist. Let&#x27;s get you back to calculating your PG meals.
          </p>
        </motion.div>

        {/* Illustrated meal plate (using SVG) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-10"
        >
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="#2a3542" stroke="#3b82f6" strokeWidth="4" />
            <circle cx="100" cy="100" r="60" fill="#1f2937" stroke="#3b82f6" strokeWidth="2" />
            <path d="M70 80 C80 70, 120 70, 130 80 C140 90, 140 110, 130 120 C120 130, 80 130, 70 120 C60 110, 60 90, 70 80" fill="#ef4444" />
            <path d="M60 90 C60 80, 80 85, 75 95 C70 105, 50 100, 60 90" fill="#84cc16" />
            <path d="M140 90 C140 80, 120 85, 125 95 C130 105, 150 100, 140 90" fill="#84cc16" />
            <path d="M80 60 C85 50, 115 50, 120 60 C125 70, 75 70, 80 60" fill="#fcd34d" />
          </svg>
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-all duration-300 min-w-[180px]"
          >
            <ArrowLeft size={20} />
            <span>Go Back</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 transition-all duration-300 min-w-[180px]"
          >
            <Home size={20} />
            <span>Go Home</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}