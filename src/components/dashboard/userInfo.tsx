"use client";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingScreen from "@/components/Loading";
import Image from "next/image";
import { motion } from "framer-motion";
import { currentMealOn } from "@/services/pgService";
import { getUserExpenses } from "@/services/expenseService";
import { getUserMeals } from "@/services/mealService";
import { Circle, Utensils, DollarSign, CalendarDays, TrendingUp, CreditCard } from "lucide-react";
import { PG, userSummarie, Expense } from "@/types/pg";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function UserInfo() {
  const { user } = useAuth();
  const router = useRouter();
  const [pgDetails, setPgDetails] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalMeals, setTotalMeals] = useState<number>(0);
  const [userStats, setUserStats] = useState<userSummarie | null>(null);
  // const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      router.push("/signin");
    } else if (!user.pgId) {
      router.push("/select-pg");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.pgId || !user?.uid) return;
      
      try {
        // Fetch PG details
        const pgRef = doc(db, "pgs", user.pgId);
        const pgSnapshot = await getDoc(pgRef);
        
        if (pgSnapshot.exists()) {
          setPgDetails(pgSnapshot.data() as PG);
        }
        
        // Fetch current meal count
        const mealCount = await currentMealOn(user.pgId);
        setTotalMeals(mealCount);
        
        // Get user's meals
        const userMeals = await getUserMeals(user.pgId, user.uid);
        console.log("🍲 User meals:", userMeals);
        
        // Get user's expenses
        const userExpenses = await getUserExpenses(user.pgId, user.uid);
        console.log("💸 User expenses:", userExpenses);
        
        // Fetch user summary if available
        if (pgSnapshot.exists()) {
          const pgData = pgSnapshot.data() as PG;
          const currentMonth = pgData.currMonth;
          if (currentMonth) {
            const userSummary = currentMonth?.userSummaries?.find(s => s.name === user.name);
            if (userSummary) {
              setUserStats(userSummary);
            }
          }
        }
        
        // Create recent activities timeline
        const activities = [];
        
        // Add recent meals
        if (userMeals && Array.isArray(userMeals.details) && userMeals.details.length > 0) {
          const flattenedMeals = userMeals.details.map(detail => ({
            type: 'meal',
            date: detail.date,
            sessions: detail.sessions,
          }));
        
          activities.push(...flattenedMeals);
        }
        
        
        // Add recent expenses
        if (userExpenses && userExpenses.length > 0) {
          const expenseActivities = userExpenses.map((expense : Expense) => ({
            // type: 'expense',
            date: expense.date,
            amount: expense.totalMoney,
            details: expense.details
          }));
          activities.push(...expenseActivities);
        }
        
        // Sort by date (newest first) and limit to 5
        // const sortedActivities = activities.sort((a, b) => 
        //   new Date(b.date).getTime() - new Date(a.date).getTime()
        // ).slice(0, 5);
        
        // setRecentActivities(sortedActivities);
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return <LoadingScreen message="Fetching user profile..." />;
  }

  if (!user) {
    return <LoadingScreen message="Redirecting to Sign In..." />;
  }

  // const formatDate = (dateString: string) => {
  //   try {
  //     const date = new Date(dateString);
  //     return new Intl.DateTimeFormat('en-US', { 
  //       month: 'short', 
  //       day: 'numeric',
  //       year: 'numeric' 
  //     }).format(date);
  //   } catch {
  //     return dateString;
  //   }
  // };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return "₹0";
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex pt-20 flex-col items-center justify-center p-4 bg-gray-900">
      <div className="w-full max-w-7xl space-y-6">
        {/* Profile Header Card */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-slate-800/90 backdrop-blur-sm rounded-lg shadow-xl p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative flex-shrink-0">
              {user.photoURL ? (
                <div className="relative">
                  <Image
                    src={user.photoURL}
                    alt="Profile"
                    width={112}
                    height={112}
                    className={`w-28 h-28 rounded-full object-cover border-4 ${user.mealStatus ? "border-green-400" : "border-red-400"}`}
                  />
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipContent side="right">
                        <p>{user.mealStatus ? "Meal Status: Active" : "Meal Status: Inactive"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-blue-800 flex items-center justify-center border-4 border-blue-500">
                    <span className="text-4xl font-bold text-white">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute -top-1 -right-1">
                          <Circle
                            size={20}
                            className={`${user.mealStatus ? "text-green-400" : "text-red-400"} animate-ping absolute`}
                            fill={user.mealStatus ? "#22c55e" : "#ef4444"}
                          />
                          <Circle
                            size={20}
                            className={`${user.mealStatus ? "text-green-500" : "text-red-500"} absolute`}
                            fill={user.mealStatus ? "#22c55e" : "#ef4444"}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{user.mealStatus ? "Meal Status: Active" : "Meal Status: Inactive"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-2">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{user.name}</h1>
                  <p className="text-slate-400 text-sm md:text-base">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                  <span className={`px-2 py-0.5 text-sm rounded ${user.role === "admin" ? "bg-purple-700 text-white" : "bg-blue-700 text-white"}`}>
                    {user.role === "admin" ? "Admin" : "Member"}
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-300 flex items-center">
                    <Utensils size={16} className="mr-1" />
                    {user.mealCount} meals
                  </span>
                </div>
              </div>
              
              {pgDetails && (
                <div className="bg-slate-700/30 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-200">{pgDetails.name}</h2>
                    <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
                    <span className="text-slate-300">{pgDetails.address}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex items-center gap-1">
                      <Utensils size={14} />
                      Total Active Meals: <span className="font-semibold text-white">{totalMeals}</span>
                    </span>
                    <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
                    <span className="flex items-center gap-1">
                      Base Meal: <span className="font-semibold text-white">{(pgDetails.baseMeal)}</span>
                    </span>
                    <span className="h-1 w-1 bg-slate-400 rounded-full"></span>
                    <span className="flex items-center gap-1">
                      <CalendarDays size={14} />
                      Rent: <span className="font-semibold text-white">{formatCurrency(pgDetails.masiCharge)}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Stats Cards */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="bg-gradient-to-br from-blue-900 to-blue-700 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Utensils className="h-5 w-5" />
                Total Meals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {userStats?.userTotalMeal || user.mealCount || 0}
              </div>
              <p className="text-blue-200 text-sm mt-1">Includes regular and extra meals</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-900 to-green-700 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(user?.expense || 0)}
              </div>
              <p className="text-green-200 text-sm mt-1">Your shared expenses this month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-900 to-purple-700 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(user?.spent || 0)}
              </div>
              <p className="text-purple-200 text-sm mt-1">Your contributions to PG</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-900 to-amber-700 border-0 shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {formatCurrency(user?.balance)}
              </div>
              <p className="text-amber-200 text-sm mt-1">
                {userStats?.balance && userStats.balance > 0 
                  ? "You're in credit" 
                  : "Due amount"}
              </p>
            </CardContent>
          </Card>
        </motion.div>


      </div>
    </div>
  );
}