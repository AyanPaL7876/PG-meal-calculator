"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingScreen from "@/components/Loading";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { UserCheck, MessageSquare, Calculator, Calendar } from "lucide-react";

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
    <div className="flex flex-col items-center justify-center p-4">
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
                path: "/dashboard/visit-user", 
                icon: <UserCheck className="h-6 w-6" />, 
                text: "Visit User",
                iconColor: "text-blue-400"
              },
              { 
                gradient: "from-red-500/10 to-red-600/10", 
                path: "/dashboard/request-user", 
                icon: <MessageSquare className="h-6 w-6" />, 
                text: "See Request User",
                iconColor: "text-red-400",
                adminOnly: true
              },
              { 
                gradient: "from-purple-500/10 to-purple-600/10", 
                path: "/dashboard/current-month", 
                icon: <Calculator className="h-6 w-6" />, 
                text: "Current Month Summary",
                iconColor: "text-purple-400"
              },
              { 
                gradient: "from-teal-500/10 to-teal-600/10", 
                path: "/dashboard/previous-month", 
                icon: <Calendar className="h-6 w-6" />, 
                text: "Previous Month Summary",
                iconColor: "text-teal-400"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push(item.path)}
                className={`
                  rounded-xl p-6 cursor-pointer
                  transition-all duration-300
                  hover:shadow-lg group
                  backdrop-blur-sm relative
                  w-36 h-36
                  flex flex-col items-center justify-center
                  ${item.adminOnly && user.role !== "admin" ? "hidden" : "block"}
                  ${item.iconColor}
                `}
              >
                <div className="
                  h-16 w-16 rounded-full 
                  bg-gray-900/50 
                  flex items-center justify-center
                  group-hover:scale-110 transition-transform mb-4
                ">
                  {item.icon}
                </div>
                <div className="text-center text-white font-medium text-sm mt-2">
                  {item.text}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}