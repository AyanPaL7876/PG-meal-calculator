"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { FaWallet, FaUtensils, FaMoneyBillWave, FaUserFriends } from 'react-icons/fa';
import { BsArrowUpRight, BsArrowDownRight } from 'react-icons/bs';
import { RefreshCw } from "lucide-react";

interface UserSummary {
  userId: string;
  name: string;
  userTotalMeal: number;
  userSpentMoney: number;
  expense: number;
  balance: number;
  balanceWithMasi: number;
}

interface User {
  uid: string;
  name: string;
  email: string;
}

const MealSummary = () => {
  const { user } = useAuth();
  const [mealSummary, setMealSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const fetchUserNames = async () => {
    if (!user?.pgId) return;
    
    try {
      const res = await fetch(`/api/get/Users?pgId=${user.pgId}`);
      const data = await res.json();
      
      if (data.success) {
        const namesMap: Record<string, string> = {};
        data.users.forEach((user: User) => {
          namesMap[user.uid] = user.name;
        });
        setUserNames(namesMap);
      } else {
        toast.error("Failed to fetch user names");
      }
    } catch (error) {
      console.error("Error fetching user names:", error);
      toast.error("Failed to load user names");
    }
  };

  const fetchMealSummary = async () => {
    if (!user?.pgId) return;

    try {
      setLoading(true);
      
      // First fetch user names
      await fetchUserNames();

      // Then fetch meal summary
      const res = await fetch("/api/calculatemealsummary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pgId: user.pgId }),
      });

      const data = await res.json();
      if (data.success) {
        setMealSummary(data);
      } else {
        toast.error(data.message || "Failed to fetch meal summary");
      }
    } catch (error) {
      console.error("Error fetching meal summary:", error);
      toast.error("Failed to load meal summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMealSummary();
  }, [user?.pgId]); // Changed dependency to user.pgId

  const getUserName = (userId: string): string => {
    return userNames[userId] || "Unknown User";
  };

  return (
    <Card className="bg-gray-900/95 border-gray-700/50 text-gray-100 shadow-2xl backdrop-blur-sm">
      <CardContent className="p-8">
        {loading ? (
          <div className="space-y-8 animate-pulse">
            {/* Main Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i} className="bg-gray-800/30 border-gray-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="h-4 w-24 bg-gray-700/50 rounded" />
                        <div className="h-8 w-32 bg-gray-700/50 rounded" />
                      </div>
                      <div className="h-14 w-14 rounded-full bg-gray-700/50" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* PG Balance Card Skeleton */}
            <Card className="bg-gray-800/30 border-gray-700/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-5 w-40 bg-gray-700/50 rounded" />
                    <div className="h-10 w-48 bg-gray-700/50 rounded" />
                  </div>
                  <div className="h-20 w-20 rounded-full bg-gray-700/50" />
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-gray-800/30 border-gray-700/50">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="h-12 w-12 rounded-full bg-gray-700/50" />
                      <div className="text-center space-y-2">
                        <div className="h-4 w-20 bg-gray-700/50 rounded mx-auto" />
                        <div className="h-8 w-24 bg-gray-700/50 rounded mx-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Table Skeleton */}
            <div className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/20">
              <div className="p-4">
                <div className="grid grid-cols-6 gap-4 mb-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-6 bg-gray-700/50 rounded" />
                  ))}
                </div>
                {[1, 2, 3, 4].map((row) => (
                  <div key={row} className="grid grid-cols-6 gap-4 mb-4">
                    {[1, 2, 3, 4, 5, 6].map((col) => (
                      <div key={col} className="h-6 bg-gray-700/50 rounded" />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Button Skeleton - replace with Icon Skeleton */}
            <div className="flex justify-end">
              <div className="w-12 h-12 rounded-full bg-gray-700/50" />
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group">
                <CardContent className="py-2 px-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400 font-medium">Total resived money </p>
                      <p className="text-2xl font-bold text-green-400 group-hover:scale-105 transition-transform">
                        ₹{mealSummary?.totalSpent?.toFixed(2)}
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BsArrowUpRight className="h-7 w-7 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500/10 to-red-500/10 border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 group">
                <CardContent className="py-2 px-5">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400 font-medium">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-400 group-hover:scale-105 transition-transform">
                        ₹{mealSummary?.totalExpenses?.toFixed(2)}
                      </p>
                    </div>
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <BsArrowDownRight className="h-7 w-7 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* PG Balance Card */}
            <Card className="bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group">
              <CardContent className="py-2 px-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-300">Current PG Balance</h3>
                    <p className={`text-3xl font-bold group-hover:scale-105 transition-transform ${
                      mealSummary?.pgBalance >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ₹{mealSummary?.pgBalance?.toFixed(2)}
                    </p>
                  </div>
                  <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FaWallet className="h-10 w-10 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatsCard 
                icon={<FaUtensils className="h-6 w-6" />}
                title="Total Meals"
                value={mealSummary?.totalMeal}
                color="blue"
              />
              <StatsCard 
                icon={<FaMoneyBillWave className="h-6 w-6" />}
                title="Meal Charge"
                value={`₹${mealSummary?.mealCharge?.toFixed(2)}`}
                color="purple"
              />
              <StatsCard 
                icon={<FaUserFriends className="h-6 w-6" />}
                title="Extra Meals"
                value={mealSummary?.extraMeal}
                color="pink"
              />
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-xl border border-gray-700/50 bg-gray-800/20 backdrop-blur-sm">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700/50 hover:bg-gray-700/20">
                    <TableHead className="text-gray-300 font-medium">Name</TableHead>
                    <TableHead className="text-gray-300 text-right">Total Meals</TableHead>
                    <TableHead className="text-gray-300 text-right">Spent Money</TableHead>
                    <TableHead className="text-gray-300 text-right">Expense</TableHead>
                    <TableHead className="text-gray-300 text-right">Balance</TableHead>
                    <TableHead className="text-gray-300 text-right">Balance (With Masi)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mealSummary?.userSummaries.map((summary: UserSummary) => (
                    <TableRow 
                      key={summary.userId} 
                      className="border-gray-700/50 hover:bg-gray-700/20"
                    >
                      <TableCell className="font-medium text-gray-200">
                        {getUserName(summary.userId)}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        {summary.userTotalMeal}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        ₹{summary.userSpentMoney.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-gray-300">
                        ₹{summary.expense.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        summary.balance >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        ₹{summary.balance.toFixed(2)}
                      </TableCell>
                      <TableCell className={`text-right font-medium ${
                        summary.balanceWithMasi >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        ₹{summary.balanceWithMasi.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Replace Button with Icon */}
            <div className="flex justify-end">
              <div
                onClick={fetchMealSummary}
                className="p-3 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 group border border-blue-500/20 hover:border-blue-500/40"
              >
                <RefreshCw 
                  className="w-6 h-6 text-blue-400 group-hover:rotate-180 transition-transform duration-500" 
                  aria-label="Recalculate Summary"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Helper component for stats cards
const StatsCard = ({ icon, title, value, color }: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  color: 'blue' | 'purple' | 'pink' 
}) => {
  const colors = {
    blue: 'from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:border-blue-500/40 text-blue-400',
    purple: 'from-purple-500/10 to-purple-600/10 border-purple-500/20 hover:border-purple-500/40 text-purple-400',
    pink: 'from-pink-500/10 to-pink-600/10 border-pink-500/20 hover:border-pink-500/40 text-pink-400'
  };

  return (
    <Card className={`bg-gradient-to-br ${colors[color]} transition-all duration-300 hover:shadow-lg group`}>
      <CardContent className="p-2">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-800 to-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400 font-medium mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-100 group-hover:scale-105 transition-transform">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealSummary;
