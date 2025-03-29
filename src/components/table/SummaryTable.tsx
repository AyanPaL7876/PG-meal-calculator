"use client";

import { useEffect, useState } from "react";
import { Month, userSummarie } from "@/types/pg";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calculator, Utensils, Wallet, Receipt, Coins, Search } from 'lucide-react';
import CardLoading from "./CardLoading";
import { Input } from "@/components/ui/input";

interface SummaryTableProps {
  data: Month;
}

export default function SummaryTable({ data }: SummaryTableProps) {
  const [summaries, setSummaries] = useState<userSummarie[]>([]);
  const [filteredSummaries, setFilteredSummaries] = useState<userSummarie[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [mealCharge, setMealCharge] = useState(0);
  const [masiCharge, setMasiCharge] = useState(0);
  const [baseMeal, setBaseMeal] = useState(0);
  const [calculator, setCalculator] = useState({
    totalMeal: 0,
    totalExpenses: 0,
    totalSpent: 0,
  });

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      try {
        if (data?.userSummaries) {
          setSummaries(data.userSummaries);
          setFilteredSummaries(data.userSummaries);
          setMealCharge(data?.mealCharge as number);
          setMasiCharge(data.masiCharge);
          setBaseMeal(data?.baseMeal as number);
        } else {
          console.warn("⚠️ No summaries found for this PG.");
        }
      } catch (error) {
        console.error("❌ Error fetching user summary:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [data]);

  useEffect(() => {
    if (summaries.length > 0) {
      setCalculator({
        totalMeal: summaries.reduce((acc, user) => acc + user.userTotalMeal, 0),
        totalExpenses: summaries.reduce(
          (acc, user) => acc + user.userTotalExpense,
          0
        ),
        totalSpent: summaries.reduce((acc, user) => acc + user.userTotalSpent, 0),
      });
    }
  }, [summaries]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredSummaries(summaries);
    } else {
      const filtered = summaries.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSummaries(filtered);
    }
  }, [searchQuery, summaries]);

  // const exportToCSV = () => {
  //   if (filteredSummaries.length === 0) return;
    
  //   const headers = ["Name", "Total Meals", "Total Spent", "Total Expense", "Balance", "Balance (After Masi)"];
  //   const csvData = filteredSummaries.map(user => [
  //     user.name,
  //     user.userTotalMeal,
  //     user.userTotalSpent.toFixed(2),
  //     user.userTotalExpense.toFixed(2),
  //     user.balance.toFixed(2),
  //     user.balanceWithAnti.toFixed(2)
  //   ]);
    
  //   const csvContent = [
  //     headers.join(","),
  //     ...csvData.map(row => row.join(","))
  //   ].join("\n");
    
  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  //   const link = document.createElement("a");
  //   const url = URL.createObjectURL(blob);
  //   link.setAttribute("href", url);
  //   link.setAttribute("download", `monthly-summary-${new Date().toLocaleDateString()}.csv`);
  //   link.style.visibility = "hidden";
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  if (loading) {
    return (
      <CardLoading heading="Monthly Summary" rowCount={2} tableDataRow={4} footer=" Balance is calculated without Masi charge"/>
    );
  }

  return (
    <Card className="md:max-w-7xl w-full mx-auto bg-gradient-to-br from-slate-900 to-slate-800 text-white p-2 shadow-xl">
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Receipt size={24} className="text-blue-400" />
            Monthly Summary
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
              />
            </div>
            {/* <button
              onClick={exportToCSV}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <Download size={16} />
              Export
            </button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
      {filteredSummaries.length === 0 ? (
          <div className="text-center py-8 text-gray-400 bg-slate-800 rounded-lg border border-slate-700">
            <p>No summaries found for {searchQuery}.</p>
          </div>
        ) : (
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-slate-700 shadow-inner">
          <Table>
            <TableHeader className="bg-slate-800 sticky top-0 z-10">
              <TableRow>
                <TableHead className="font-semibold text-blue-300">Name</TableHead>
                <TableHead className="text-center font-semibold text-blue-300">Total Meals</TableHead>
                <TableHead className="text-center font-semibold text-blue-300">Total Spent</TableHead>
                <TableHead className="text-center font-semibold text-blue-300">Total Expense</TableHead>
                <TableHead className="text-center font-semibold text-blue-300">Balance</TableHead>
                <TableHead className="text-center font-semibold text-blue-300">Balance (After Masi)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSummaries.map((user) => (
                <TableRow 
                  key={user.name} 
                  className={`border-slate-700 hover:bg-slate-800 transition-colors ${user.balance < 0 ? "bg-red-900/30" : ""}`}
                >
                  <TableCell className="font-medium text-white">{user.name}</TableCell>
                  <TableCell className="text-center font-medium text-white">
                    {user.userTotalMeal}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-slate-700 text-white font-medium">
                      ₹{user.userTotalSpent.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-slate-700 text-white font-medium">
                      ₹{user.userTotalExpense.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={user.balance < 0 ? "bg-red-600 text-white font-medium" : "bg-green-600 text-white font-medium"}>
                      ₹{user.balance.toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={user.balanceWithAnti < 0 ? "bg-red-600 text-white font-medium" : "bg-green-600 text-white font-medium"}>
                      ₹{user.balanceWithAnti.toFixed(2)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </CardContent>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:from-blue-800 hover:to-blue-700 transition-all">
          <div className="bg-blue-800/50 p-3 flex items-center gap-2 border-b border-blue-700">
            <Utensils size={20} className="text-blue-300" />
            <span className="font-medium text-white">Meal Charge</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">₹{mealCharge.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-900 to-green-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:from-green-800 hover:to-green-700 transition-all">
          <div className="bg-green-800/50 p-3 flex items-center gap-2 border-b border-green-700">
            <Wallet size={20} className="text-green-300" />
            <span className="font-medium text-white">Masi Charge</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">₹{masiCharge.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-900 to-purple-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:from-purple-800 hover:to-purple-700 transition-all">
          <div className="bg-purple-800/50 p-3 flex items-center gap-2 border-b border-purple-700">
            <Calculator size={20} className="text-purple-300" />
            <span className="font-medium text-white">Total Meals</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">
                {calculator.totalMeal} Meals
                {baseMeal > 0 && <span className="block text-sm text-purple-300 mt-1">({baseMeal} Base)</span>}
            </span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-900 to-yellow-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:from-yellow-800 hover:to-yellow-700 transition-all">
          <div className="bg-yellow-800/50 p-3 flex items-center gap-2 border-b border-yellow-700">
            <Receipt size={20} className="text-yellow-300" />
            <span className="font-medium text-white">Total Expenses</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">₹{calculator.totalExpenses.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-red-900 to-red-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:from-red-800 hover:to-red-700 transition-all">
          <div className="bg-red-800/50 p-3 flex items-center gap-2 border-b border-red-700">
            <Coins size={20} className="text-red-300" />
            <span className="font-medium text-white">Total Spent</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">₹{calculator.totalSpent.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-900 to-teal-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg hover:from-teal-800 hover:to-teal-700 transition-all">
          <div className="bg-teal-800/50 p-3 flex items-center gap-2 border-b border-teal-700">
            <Coins size={20} className="text-teal-300" />
            <span className="font-medium text-white">Balance</span>
          </div>
          <div className="p-4 text-center">
            <span className={`text-2xl font-bold ${(calculator.totalSpent > calculator.totalExpenses) ? "text-white" : "text-red-400"}`}>
              ₹{((calculator.totalSpent)-(calculator.totalExpenses)).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-sm text-center text-slate-400 italic border-t border-slate-700 pt-4 mt-2">
        * Balance is calculated without Masi charge. {filteredSummaries.length > 0 && `Showing ${filteredSummaries.length} of ${summaries.length} users.`}
      </CardFooter>
    </Card>
  );
}