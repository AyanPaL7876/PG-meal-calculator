"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingScreen from "@/components/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { Users, Receipt, Calculator, MessageSquare, Calendar } from "lucide-react";

export default function ActionBtn() {
  const { user } = useAuth();
  const router = useRouter();
  const [pgName, setPgName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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
          setPgName(pgSnapshot.data()?.name);
        }
      }
      setLoading(false);
    };

    fetchPGName();
  }, [user]);

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
    <div className="flex flex-col items-center justify-center p-4 ">
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
            className="flex gap-6 px-4 flex-wrap justify-center"
            id="action-buttons"
          >
            {[
              { 
                gradient: "from-blue-500/10 to-blue-600/10", 
                path: "/dashboard/pg-users", 
                icon: <Users className="h-6 w-6" />, 
                text: "All users",
                iconColor: "text-blue-400"
              },
              { 
                gradient: "from-green-500/10 to-green-600/10", 
                path: "/dashboard/addspent", 
                icon: <Receipt className="h-6 w-6" />, 
                text: "Add Spent",
                iconColor: "text-green-400"
              },
              { 
                gradient: "from-purple-500/10 to-purple-600/10", 
                path: "/dashboard/currentMonth", 
                icon: <Calculator className="h-6 w-6" />, 
                text: "Meal Summary",
                iconColor: "text-purple-400"
              },
              { 
                gradient: "from-red-500/10 to-red-600/10", 
                path: "/dashboard/request", 
                icon: <MessageSquare className="h-6 w-6" />, 
                text: "Request",
                iconColor: "text-red-400"
              },
              { 
                gradient: "from-teal-500/10 to-teal-600/10", 
                path: "/dashboard/previousmonthsummary", 
                icon: <Calendar className="h-6 w-6" />, 
                text: "Previous Month Summary",
                iconColor: "text-teal-400"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(item.path)}
                className={`
                  rounded-xl p-4 cursor-pointer
                  transition-all duration-300
                  hover:shadow-lg group
                  backdrop-blur-sm relative
                  ${item.iconColor}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className="
                    h-12 w-12 rounded-full 
                    bg-gray-900/50 
                    flex items-center justify-center
                    group-hover:scale-110 transition-transform
                  ">
                    {item.icon}
                  </div>
                </div>
                <motion.div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center bg-black/50 text-white text-sm rounded px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  {item.text}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}
