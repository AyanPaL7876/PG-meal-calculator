"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import AttendanceTable from "@/components/AttendanceTable";
import SpentTable from "@/components/SpentTable";
import ExpensesTable from "@/components/ExpensesTable";
import LoadingScreen from "@/components/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import MealSummary from "@/components/MealSummary";
import { motion } from "framer-motion";
import { Users, Receipt, Calculator } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [pgName, setPgName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTable, setActiveTable] = useState<number>(0);
  const [showTables, setShowTables] = useState<boolean[]>([false, false, false, false]);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
    } else if (!user.pgId) {
      router.push("/select-pg");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchPGName = async () => {
      if (user && user.pgId) {
        const pgRef = doc(db, "pgs", user.pgId);
        const pgSnapshot = await getDoc(pgRef);
        
        if (pgSnapshot.exists()) {
          setPgName(pgSnapshot.data()?.pgName);
        }
      }
      setLoading(false);
    };

    fetchPGName();
  }, [user]);

  // Sequential loading of tables
  useEffect(() => {
    const loadNextTable = () => {
      if (activeTable < 4) {
        setShowTables(prev => {
          const newState = [...prev];
          newState[activeTable] = true;
          return newState;
        });
        
        // Load next table after a delay
        setTimeout(() => {
          setActiveTable(prev => prev + 1);
        }, 1000); // 1 second delay between table loads
      }
    };

    if (pgName && !loading) {
      loadNextTable();
    }
  }, [activeTable, pgName, loading]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (!user) {
    return <LoadingScreen message={"Fetching User and PG details ...."} />;
  }

  return (
    <div className="flex pt-20 flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mb-8 bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl p-6"
        id="profile-section"
      >
        <div className="flex items-center gap-8">
          <div className="relative">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-500">
                <span className="text-3xl font-bold text-blue-500">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-100">{user.name}</h1>
            <p className="text-gray-300 mt-2">Email: {user.email}</p>
            {pgName && (
              <p className="text-gray-300">
                PG: <span className="font-semibold">{pgName}</span>
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {loading ? (
        <Skeleton className="h-8 w-1/2 bg-gray-300 rounded" />
      ) : pgName ? (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-7xl mx-auto"
          id="dashboard-content"
        >
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4"
            id="action-buttons"
          >
            {[
              { 
                gradient: "from-blue-500/10 to-blue-600/10", 
                path: "/dashboard/pg-users", 
                icon: <Users className="h-6 w-6" />, 
                text: "All users",
                borderColor: "border-blue-500/20",
                hoverBorder: "hover:border-blue-500/40",
                iconColor: "text-blue-400"
              },
              { 
                gradient: "from-green-500/10 to-green-600/10", 
                path: "/dashboard/addspent", 
                icon: <Receipt className="h-6 w-6" />, 
                text: "Add Spent",
                borderColor: "border-green-500/20",
                hoverBorder: "hover:border-green-500/40",
                iconColor: "text-green-400"
              },
              { 
                gradient: "from-purple-500/10 to-purple-600/10", 
                path: "/dashboard/mealsummary", 
                icon: <Calculator className="h-6 w-6" />, 
                text: "Meal Summary",
                borderColor: "border-purple-500/20",
                hoverBorder: "hover:border-purple-500/40",
                iconColor: "text-purple-400"
              },
              { 
                gradient: "from-purple-500/10 to-purple-600/10", 
                path: "/dashboard/mealsummary", 
                icon: <Calculator className="h-6 w-6" />, 
                text: "Change Admin",
                borderColor: "border-purple-500/20",
                hoverBorder: "hover:border-purple-500/40",
                iconColor: "text-purple-400"
              },
              { 
                gradient: "from-purple-500/10 to-purple-600/10", 
                path: "/dashboard/request", 
                icon: <Calculator className="h-6 w-6" />, 
                text: "Request",
                borderColor: "border-purple-500/20",
                hoverBorder: "hover:border-purple-500/40",
                iconColor: "text-purple-400"
              },
              { 
                gradient: "from-purple-500/10 to-purple-600/10", 
                path: "/dashboard/mealsummary", 
                icon: <Calculator className="h-6 w-6" />, 
                text: "Previous Month Summary",
                borderColor: "border-purple-500/20",
                hoverBorder: "hover:border-purple-500/40",
                iconColor: "text-purple-400"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(item.path)}
                className={`
                  bg-gradient-to-br ${item.gradient} 
                  ${item.borderColor} border 
                  ${item.hoverBorder}
                  rounded-xl p-4 cursor-pointer
                  transition-all duration-300
                  hover:shadow-lg group
                  backdrop-blur-sm
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    h-12 w-12 rounded-full 
                    bg-gray-900/50 
                    flex items-center justify-center
                    group-hover:scale-110 transition-transform
                    ${item.iconColor}
                  `}>
                    {item.icon}
                  </div>
                  <span className="text-gray-200 font-medium">
                    {item.text}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            variants={containerVariants}
            className="mt-8 w-full flex flex-col gap-10 px-4"
            id="tables-section"
          >
            {[
              { 
                component: <MealSummary />, 
                condition: showTables[0],
                id: "meal-summary-container"
              },
              { 
                component: <AttendanceTable />, 
                condition: showTables[1],
                id: "attendance-container"
              },
              { 
                component: <SpentTable/>, 
                condition: showTables[2],
                id: "spent-container"
              },
              { 
                component: <ExpensesTable/>, 
                condition: showTables[3],
                id: "expenses-container"
              }
            ].map((item, index) => (
              item.condition && (
                <motion.div
                  key={index}
                  id={item.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ 
                    opacity: activeTable >= index ? 1 : 0,
                    y: activeTable >= index ? 0 : 50
                  }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="transition-all duration-500"
                >
                  {item.component}
                </motion.div>
              )
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}
