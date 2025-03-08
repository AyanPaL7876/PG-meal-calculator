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
import { Calculator, Utensils, Wallet, Receipt, Coins } from 'lucide-react';
import CardLoading from "./CardLoading";

interface SummaryTableProps {
  data: Month;
}

export default function SummaryTable({ data }: SummaryTableProps) {
  const [summaries, setSummaries] = useState<userSummarie[]>([]);
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
        console.log(data);
        if (data?.userSummaries) {
          setSummaries(data.userSummaries);
          setMealCharge(data.mealCharge);
          setMasiCharge(data.masiCharge);
          setBaseMeal(data.baseMeal);
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

  if (loading) {
    return (
      <CardLoading heading="Monthly Summary" rowCount={2} tableDataRow={4} footer=" Balance is calculated without Masi charge"/>
    );
  }

  return (
    <Card className="max-w-7xl w-full mx-auto bg-slate-900 text-white p-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Receipt size={24} />
          Monthly Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg mb-6 border border-slate-700">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow>
                <TableHead className="font-semibold text-white">Name</TableHead>
                <TableHead className="text-center font-semibold text-white">Total Meals</TableHead>
                <TableHead className="text-center font-semibold text-white">Total Spent</TableHead>
                <TableHead className="text-center font-semibold text-white">Total Expense</TableHead>
                <TableHead className="text-center font-semibold text-white">Balance</TableHead>
                <TableHead className="text-center font-semibold text-white">Balance (After Masi)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((user) => (
                <TableRow key={user.name} className="border-slate-700 hover:bg-slate-800">
                  <TableCell className="font-medium text-white">{user.name}</TableCell>
                  <TableCell className="text-center font-medium text-white">
                    {user.userTotalMeal}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-slate-700 text-white font-medium">
                      ₹{user.userTotalSpent}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="bg-slate-700 text-white font-medium">
                      ₹{user.userTotalExpense}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={user.balance < 0 ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                      ₹{user.balance}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={user.balanceWithAnti < 0 ? "bg-red-600 text-white" : "bg-green-600 text-white"}>
                      ₹{user.balanceWithAnti}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-blue-900 rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-800 p-3 flex items-center gap-2">
            <Utensils size={20} className="text-white" />
            <span className="font-medium text-white">Meal Charge</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">₹{mealCharge}</span>
          </div>
        </div>
        
        <div className="bg-green-900 rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-800 p-3 flex items-center gap-2">
            <Wallet size={20} className="text-white" />
            <span className="font-medium text-white">Masi Charge</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">₹{masiCharge}</span>
          </div>
        </div>
        
        <div className="bg-purple-900 rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-800 p-3 flex items-center gap-2">
            <Calculator size={20} className="text-white" />
            <span className="font-medium text-white">Total Meals</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">
                {calculator.totalMeal} Meals
                {baseMeal > 0 && ` (${baseMeal} Base)`}
            </span>
          </div>
        </div>
        
        <div className="bg-yellow-900 rounded-lg shadow-md overflow-hidden">
          <div className="bg-yellow-800 p-3 flex items-center gap-2">
            <Receipt size={20} className="text-white" />
            <span className="font-medium text-white">Total Expenses</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">₹{calculator.totalExpenses}</span>
          </div>
        </div>
        
        <div className="bg-red-900 rounded-lg shadow-md overflow-hidden">
          <div className="bg-red-800 p-3 flex items-center gap-2">
            <Coins size={20} className="text-white" />
            <span className="font-medium text-white">Total Spent</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">₹{calculator.totalSpent}</span>
          </div>
        </div>

        <div className="bg-teal-700 rounded-lg shadow-md overflow-hidden">
          <div className="bg-teal-600 p-3 flex items-center gap-2">
            <Coins size={20} className="text-white" />
            <span className="font-medium text-white">Balance</span>
          </div>
          <div className="p-4 text-center">
            <span className={`text-2xl font-bold ${(calculator.totalSpent)>(calculator.totalExpenses)?"text-white": "text-red-500"}`}>₹{(calculator.totalSpent)-(calculator.totalExpenses)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-sm text-center text-slate-400 italic border-t border-slate-700 pt-4 mt-2">
        * Balance is calculated without Masi charge
      </CardFooter>
    </Card>
  );
}