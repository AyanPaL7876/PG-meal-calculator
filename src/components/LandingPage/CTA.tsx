"use client";
import { signInWithGoogle } from "@/services/authService";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { motion } from "framer-motion";


export default function CTA() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      alert(`Google Sign-in failed: ${(error as Error).message}`);
    }
  };

  return (
      <section className="py-20 px-6 bg-blue-900/30 ">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-gray-200 mb-6">Ready to Simplify Your PG Life?</h2>
            <p className="text-xl text-gray-300 mb-8">Join thousands of satisfied users who are saving time and reducing conflicts with smart meal management.</p>
            <button
              onClick={handleGoogleSignIn}
              className="px-8 py-4 bg-blue-600 rounded-lg text-white text-lg font-semibold hover:bg-blue-500 hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-3">
                <FcGoogle className="text-2xl" /> Get Started with Google
              </div>
            </button>
          </motion.div>
        </div>
      </section>
  );
}