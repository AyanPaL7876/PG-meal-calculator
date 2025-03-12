"use client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUtensils } from "react-icons/fa";
import { 
  Menu, X, Home, ShoppingCart, ListChecks, Receipt, 
  UserCog, ToggleLeft, ToggleRight, LogOut, ChevronDown, Utensils, Clock, AlertCircle
} from "lucide-react";
import ExpenseForm from "@/components/form/ExpenseForm";
import SpentForm from "@/components/form/SpentForm";
import ChangeAdminPopup from "@/components/form/ChangeAdmin";
import { changeMealStatus } from "@/services/userService";
import { toast } from "react-hot-toast";
import { usePg } from "@/context/PgContext";

const slideInOut = {
  initial: { opacity: 0, y: -10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const staggeredContainer = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  },
  exit: { opacity: 0 }
};

const staggeredItem = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pg } = usePg();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [expenseFormOpen, setExpenseFormOpen] = useState(false);
  const [spentFormOpen, setSpentFormOpen] = useState(false);
  const [adminChangeFormOpen, setAdminChangeFormOpen] = useState(false);
  const [mealStatus, setMealStatus] = useState(false);
  // const [lastUpdated, setLastUpdated] = useState(null);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');

  // Initialize meal status from user data
  useEffect(() => {
    if (user) {
      setMealStatus(user.mealStatus || false);
      // setLastUpdated(user?.mealStatusLastUpdated || new Date().toISOString());
    }
  }, [user]);

  // Set active item based on current path
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('/dashboard/attendance')) {
      setActiveItem('attendance');
    } else if (path === '/dashboard') {
      setActiveItem('dashboard');
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (dropdownOpen) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Format the last updated time
  // const formatLastUpdated = (timestamp) => {
  //   if (!timestamp) return "Never updated";
    
  //   const date = new Date(timestamp);
  //   return new Intl.DateTimeFormat('en-US', {
  //     month: 'short',
  //     day: 'numeric',
  //     hour: '2-digit',
  //     minute: '2-digit'
  //   }).format(date);
  // };

  // Memoized toggle function to prevent unnecessary re-renders
  const handleMealStatus = useCallback(async () => {
    if (!user) return;
    
    setIsUpdating(true);
    
    try {
      const res = await changeMealStatus(user.uid, !mealStatus);
      if (res) {
        setMealStatus(!mealStatus);
        // setLastUpdated(new Date().toISOString() as string);
        toast.success(`Meal ${!mealStatus ? 'enabled' : 'disabled'} successfully`, {
          icon: !mealStatus ? '🍽️' : '⏸️',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
        setStatusNote(''); // Clear note after successful update
      } else {
        toast.error("Failed to change meal status");
      }
    } catch (e) {
      console.error("Meal status change error:", e);
      toast.error("Failed to change meal status");
    } finally {
      setIsUpdating(false);
    }
  }, [user, mealStatus]);

  // Guard clause - return null if no user
  if (!user) return null;

  // Define menu items
  const menuItems = [
    { 
      id: "dashboard",
      title: "Dashboard", 
      icon: <Home size={20} />, 
      path: "/dashboard",
      color: "text-blue-400",
      activeBg: "bg-blue-900/30",
      showAlways: true
    },
    { 
      id: "attendance",
      title: "Take Attendance", 
      icon: <ListChecks size={20} />, 
      path: "/dashboard/attendance",
      color: "text-green-400",
      activeBg: "bg-green-900/30",
      adminOnly: true
    },
    { 
      id: "expense",
      title: "Add Expense", 
      icon: <ShoppingCart size={20} />, 
      action: () => setExpenseFormOpen(true),
      color: "text-purple-400",
      activeBg: "bg-purple-900/30",
      showAlways: true
    },
    { 
      id: "spent",
      title: "Add Spent", 
      icon: <Receipt size={20} />, 
      action: () => setSpentFormOpen(true),
      color: "text-pink-400",
      activeBg: "bg-pink-900/30",
      adminOnly: true
    },
    { 
      id: "admin",
      title: "Change Admin",
      icon: <UserCog size={20} />, 
      action: () => setAdminChangeFormOpen(true),
      color: "text-yellow-400",
      activeBg: "bg-yellow-900/30",
      adminOnly: true
    },
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
    item.showAlways || (item.adminOnly && user.role === "admin")
  );

  type MenuItem = {
    id: string | number; // Unique identifier for the item
    action?: () => void; // Optional function to execute when clicked
    path?: string; // Optional path for navigation
  };
  
  const handleMenuItemClick = (item : MenuItem) => {
    setActiveItem(item.id as string);
    if (item.action) {
      item.action();
    } else if (item.path) {
      router.push(item.path);
    }
    setMenuOpen(false);
  };

  // Render meal status card component
  const MealStatusCard = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full py-2' : 'p-3'} border-b border-gray-700`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Utensils size={16} className={`mr-2 ${mealStatus ? 'text-green-400' : 'text-red-400'}`} />
          <h3 className="text-sm font-medium text-gray-300">Meal Status</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${mealStatus ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
          {mealStatus ? 'Active' : 'Inactive'}
        </div>
      </div>
      
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Clock size={12} className="mr-1" />
        <span>Last updated: {new Date().toISOString()}</span>
        {/* <span>Last updated: {formatLastUpdated(lastUpdated)}</span> */}
      </div>
      
      <div className="mb-3">
        <input
          type="text"
          placeholder={mealStatus ? "Reason for disabling meal?" : "Special instructions?"}
          value={statusNote}
          onChange={(e) => setStatusNote(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-gray-700 border border-gray-600 rounded-md text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>
      
      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMealStatus}
          disabled={isUpdating}
          className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-all ${
            mealStatus 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          } ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isUpdating ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Updating...
            </span>
          ) : (
            <span className="flex items-center">
              {mealStatus ? (
                <>
                  <ToggleLeft size={16} className="mr-2" />
                  Turn Off
                </>
              ) : (
                <>
                  <ToggleRight size={16} className="mr-2" />
                  Turn On
                </>
              )}
            </span>
          )}
        </motion.button>
      </div>
      
      {mealStatus && (
        <div className="mt-3 flex items-start text-xs text-amber-400 bg-amber-900/30 p-2 rounded-md">
          <AlertCircle size={14} className="mr-1 mt-0.5 flex-shrink-0" />
          <p>Turning off your meal means you won&#x27;t be charged for upcoming meals until you turn it back on.</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="bg-gray-900/95 border-b border-gray-800 backdrop-blur-sm fixed w-full z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <motion.div 
                whileHover={{ rotate: 20, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg"
              >
                <FaUtensils className="text-white text-xl" />
              </motion.div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 text-transparent bg-clip-text">
                {pg?.name}
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              {filteredMenuItems.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMenuItemClick(item)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeItem === item.id 
                      ? `${item.activeBg} border border-${item.color.split('-')[1]}-500/30` 
                      : 'hover:bg-gray-800'
                  }`}
                  aria-label={item.title}
                >
                  <span className={item.color}>{item.icon}</span>
                  <span className={`text-sm font-medium ${activeItem === item.id ? item.color : 'text-gray-300'}`}>
                    {item.title}
                  </span>
                </motion.button>
              ))}

              {/* User Profile Dropdown */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="relative">
                    {user.photoURL ? (
                      <Image 
                        src={user.photoURL} 
                        alt={`${user.name || 'User'}'s profile`}
                        width={32} 
                        height={32} 
                        className="rounded-full border-2 border-gray-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
                        <span className="text-white text-sm font-medium">
                          {user.email?.[0].toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    
                    {/* Status indicator with pulse animation */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                      mealStatus ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {mealStatus && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75"></span>
                      )}
                    </div>
                  </div>
                  
                  <span className="text-gray-300 text-sm font-medium hidden sm:inline">
                    {user.name || user.email?.split('@')[0] || 'User'}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      {...slideInOut}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-64 rounded-lg bg-gray-800 border border-gray-700 shadow-lg overflow-hidden z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-700">
                        <p className="text-sm text-gray-300 font-medium truncate">{user.email}</p>
                        <div className="flex items-center mt-1">
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            user.role === "admin" 
                              ? "bg-yellow-900/50 text-yellow-400" 
                              : "bg-blue-900/50 text-blue-400"
                          }`}>
                            {user.role === "admin" ? "Administrator" : "Member"}
                          </span>
                        </div>
                      </div>
                      
                      {/* Enhanced Meal Status UI */}
                      <MealStatusCard />
                      
                      <button
                        onClick={logout}
                        className="flex items-center space-x-2 px-4 py-3 text-sm text-red-400 hover:bg-gray-700 w-full transition-colors"
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
              aria-expanded={menuOpen}
              aria-label="Menu"
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
              transition={{ duration: 0.2 }}
              className="md:hidden bg-gray-800 border-t border-gray-700"
            >
              <motion.div 
                variants={staggeredContainer}
                initial="initial"
                animate="animate"
                exit="exit"
                className="px-4 py-3 space-y-1"
              >
                {/* User info in mobile menu */}
                <motion.div 
                  variants={staggeredItem}
                  className="flex items-center space-x-3 p-3 border-b border-gray-700 mb-2"
                >
                  <div className="relative">
                    {user.photoURL ? (
                      <Image 
                        src={user.photoURL} 
                        alt="Profile" 
                        width={40} 
                        height={40} 
                        className="rounded-full border-2 border-gray-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.email?.[0].toUpperCase() || 'U'}
                        </span>
                      </div>
                    )}
                    
                    {/* Status indicator with pulse animation */}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                      mealStatus ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {mealStatus && (
                        <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-75"></span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">{user.name || user.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </motion.div>
                
                {/* Enhanced Meal Status UI for mobile */}
                <motion.div variants={staggeredItem}>
                  <MealStatusCard isMobile={true} />
                </motion.div>

                {/* Menu items */}
                {filteredMenuItems.map((item) => (
                  <motion.button
                    key={item.id}
                    variants={staggeredItem}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleMenuItemClick(item)}
                    className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg transition-all duration-200 ${
                      activeItem === item.id 
                        ? `${item.activeBg} border border-${item.color.split('-')[1]}-500/30` 
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <span className={item.color}>{item.icon}</span>
                    <span className={`text-sm font-medium ${activeItem === item.id ? item.color : 'text-gray-300'}`}>
                      {item.title}
                    </span>
                  </motion.button>
                ))}
                
                <motion.button
                  variants={staggeredItem}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg hover:bg-gray-700 text-red-400 transition-all duration-200 mt-4"
                >
                  <LogOut size={20} />
                  <span className="text-sm font-medium">Logout</span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal Components */}
      <AnimatePresence>
        {expenseFormOpen && (
          <ExpenseForm isOpen={expenseFormOpen} onClose={() => setExpenseFormOpen(false)} />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {spentFormOpen && (
          <SpentForm isOpen={spentFormOpen} onClose={() => setSpentFormOpen(false)} />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {adminChangeFormOpen && (
          <ChangeAdminPopup isOpen={adminChangeFormOpen} onClose={() => setAdminChangeFormOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}