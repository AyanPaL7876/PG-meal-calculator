"use client";
import { signInWithGoogle } from "../services/authService";
import { JSX } from "react";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { FaUtensils, FaClock, FaMoneyBillWave, FaCalculator, FaUsers, FaChartPie, FaReceipt, FaBell } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { Home as HomeIcon, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

interface Feature {
  header: string;
  details: string;
  icon: JSX.Element;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

export default function HomePage() {
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

  const features: Feature[] = [
    {
      header: "Meal Suggestions",
      details: "Get personalized meal suggestions tailored to your dietary preferences and nutritional needs.",
      icon: <FaUtensils className="text-4xl text-blue-400" />,
    },
    {
      header: "Time Management",
      details: "Efficiently manage your daily schedule and meal timings with smart reminders.",
      icon: <FaClock className="text-4xl text-blue-400" />,
    },
    {
      header: "Expense Tracking",
      details: "Keep track of your daily food expenses with detailed breakdowns and insights.",
      icon: <FaMoneyBillWave className="text-4xl text-blue-400" />,
    },
    {
      header: "Automatic Calculations",
      details: "Automatically calculate expenses, portions, and split bills among roommates.",
      icon: <FaCalculator className="text-4xl text-blue-400" />,
    },
    {
      header: "User Management",
      details: "Easily add, remove, and manage multiple users within your PG accommodation.",
      icon: <FaUsers className="text-4xl text-blue-400" />,
    },
    {
      header: "Expense Analytics",
      details: "Visualize spending patterns with intuitive charts and monthly reports.",
      icon: <FaChartPie className="text-4xl text-blue-400" />,
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Johnson",
      role: "PG Resident",
      content: "PG-meal Calculator simplified our expense sharing. No more arguments about who owes what!",
      avatar: "/avatars/avatar1.png",
    },
    {
      name: "David Chen",
      role: "Property Manager",
      content: "Managing meals for 20+ residents was a nightmare before this app. Now it's just a few clicks.",
      avatar: "/avatars/avatar2.png",
    },
    {
      name: "Priya Patel",
      role: "Student",
      content: "The meal suggestions feature has helped me save money and eat healthier while living in my PG.",
      avatar: "/avatars/avatar3.png",
    },
  ];

  return (
    <main className="flex flex-col min-h-screen bg-slate-900">
      {/* Navbar */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/95 shadow-lg backdrop-blur-sm' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
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
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoogleSignIn}
              className="flex items-center gap-3 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all duration-300"
            >
              <FcGoogle className="text-2xl" /> {user ? 'Dashboard' : 'Login'}
            </motion.button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
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
              <a href="#features" className="text-gray-300 hover:text-blue-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-blue-400 transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-300 hover:text-blue-400 transition-colors">Testimonials</a>
              
              {user && (
                <button
                  onClick={() => router.push("/dashboard")}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                >
                  <HomeIcon size={20} className="text-blue-400" />
                  <span className="text-gray-300 text-sm font-medium">Dashboard</span>
                </button>
              )}
              
              <button
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-3 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all duration-300"
              >
                <FcGoogle className="text-2xl" /> {user ? 'Dashboard' : 'Login'}
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoogleSignIn}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-all duration-300"
            >
              <FcGoogle className="text-2xl" /> Continue with Google
            </motion.button>
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

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-200 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to simplify meal management and expense tracking in shared living spaces.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-blue-900/20 hover:border-blue-900/30 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">{feature.header}</h3>
                <p className="text-gray-400">{feature.details}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-gray-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-200 mb-4">How It Works</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Simple steps to transform your PG meal management experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gray-900/80 rounded-xl p-8 border border-gray-700 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-4">Sign Up & Setup</h3>
              <p className="text-gray-400">Create your account, add your PG details, and invite roommates to join your group.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gray-900/80 rounded-xl p-8 border border-gray-700 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-4">Track Expenses</h3>
              <p className="text-gray-400">Log daily meals, add expenses, upload receipts, and let the app calculate each person's share.</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-900/80 rounded-xl p-8 border border-gray-700 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-200 mb-4">Manage & Settle</h3>
              <p className="text-gray-400">Review reports, get insights, and easily settle expenses at the end of each month.</p>
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <button
              onClick={handleGoogleSignIn}
              className="px-8 py-4 bg-blue-600 rounded-lg text-white text-lg font-semibold hover:bg-blue-500 transition-all duration-300"
            >
              Get Started Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-200 mb-4">What Users Say</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Join thousands of satisfied users who have transformed their PG living experience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-gray-700 overflow-hidden">
                    {/* You can use actual images or placeholders */}
                    <div className="w-full h-full bg-blue-500/30 flex items-center justify-center text-blue-400">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-200">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-300 italic">"{testimonial.content}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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


      {/* Footer */}
      <Footer/>
    </main>
  );
}