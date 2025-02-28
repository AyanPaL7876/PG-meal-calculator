"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Home, ShoppingCart, Calendar, Receipt, 
  Settings, LogOut, ChevronDown, Users, Utensils 
} from "lucide-react";
import Link from "next/link";
import ExpenseForm from "@/components/ExpenseForm";
import SpentForm from "@/components/SpentForm";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [spentFormOpen, setSpentFormOpen] = useState(false);

  if (!user) return null;

  const menuItems = [
    { 
      title: "Dashboard", 
      icon: <Home size={20} />, 
      path: "/dashboard",
      color: "text-blue-400",
      showAlways: true
    },
    { 
      title: "Take Attendance", 
      icon: <Calendar size={20} />, 
      path: "/dashboard/attendance",
      color: "text-green-400",
      adminOnly: true
    },
    { 
      title: "Add Expense", 
      icon: <ShoppingCart size={20} />, 
      action: () => setExpenseFormOpen(true),
      color: "text-purple-400",
      showAlways: true
    },
    { 
      title: "Add Spent", 
      icon: <Receipt size={20} />, 
      action: () => setSpentFormOpen(true),
      color: "text-pink-400",
      showAlways: true
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.showAlways || (item.adminOnly && user.role === "admin")
  );

  const handleMenuItemClick = (item: any) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      router.push(item.path);
    }
    setMenuOpen(false);
  };

  return (
    <>
      <div className="bg-gray-900/95 border-b border-gray-800 backdrop-blur-sm fixed w-full z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="relative w-8 h-8">
                  <Utensils className="w-8 h-8 text-blue-500" />
                </div>
                <span className="font-logo text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Meal Management
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {filteredMenuItems.map((item) => (
                <motion.button
                  key={item.title}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMenuItemClick(item)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  <span className={item.color}>{item.icon}</span>
                  <span className="text-gray-300 text-sm font-medium">{item.title}</span>
                </motion.button>
              ))}

              {/* User Profile Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
                >
                  {user.photoURL ? (
                    <Image 
                      src={user.photoURL} 
                      alt="Profile" 
                      width={32} 
                      height={32} 
                      className="rounded-full border-2 border-gray-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.email?.[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <ChevronDown size={16} className="text-gray-400" />
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 rounded-lg bg-gray-800 border border-gray-700 shadow-lg py-1"
                    >
                      <button
                        onClick={() => router.push("/dashboard/settings")}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full"
                      >
                        <Settings size={16} />
                        <span>Settings</span>
                      </button>
                      <button
                        onClick={logout}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700 w-full"
                      >
                        <LogOut size={16} />
                        <span>Logout</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              {menuOpen ? <X size={24} className="text-gray-400" /> : <Menu size={24} className="text-gray-400" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-800 border-t border-gray-700"
            >
              <div className="px-4 py-3 space-y-3">
                {filteredMenuItems.map((item) => (
                  <motion.button
                    key={item.title}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMenuItemClick(item)}
                    className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg hover:bg-gray-700 transition-all duration-200"
                  >
                    <span className={item.color}>{item.icon}</span>
                    <span className="text-gray-300 text-sm font-medium">{item.title}</span>
                  </motion.button>
                ))}
                
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg hover:bg-gray-700 text-red-400 transition-all duration-200"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ExpenseForm isOpen={expenseFormOpen} onClose={() => setExpenseFormOpen(false)} />
      <SpentForm isOpen={spentFormOpen} onClose={() => setSpentFormOpen(false)} />
    </>
  );
}
