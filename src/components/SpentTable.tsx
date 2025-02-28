"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import AlertBox from "@/components/AlertBox";

const SpentTable = () => {
  const { user } = useAuth();
  const [spentData, setSpentData] = useState<{ name: string; expenses: any[]; total: number }[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [maxExpenses, setMaxExpenses] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; date: string } | null>(null);

  const fetchSpentData = async () => {
    if (!user?.pgId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/get/spent?pgId=${user.pgId}`);
      const data = await res.json();
      if (data.success) {
        setSpentData(data.users);
        setTotalSpent(data.totalSpent);
        setMaxExpenses(Math.max(...data.users.map((u: any) => u.expenses.length), 0));
      } else {
        toast.error(data.message || "Failed to fetch spent data");
      }
    } catch (error) {
      console.error("Error fetching spent data:", error);
      toast.error("Failed to load spent data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpentData();
  }, [user?.pgId]);

  const handleDelete = async () => {
    if (!deleteConfirm || !user?.pgId) return;

    try {
      const response = await fetch("/api/delete/SpentDetails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pgId: user.pgId,
          userId: deleteConfirm.userId,
          date: deleteConfirm.date,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        await fetchSpentData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <Card className="bg-gray-900/95 border-gray-700 text-gray-100 shadow-xl">
      <CardHeader className="border-b border-gray-700/50">
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Spent Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full bg-gray-800" />
            <Skeleton className="h-12 w-full bg-gray-800" />
            <Skeleton className="h-12 w-full bg-gray-800" />
            <Skeleton className="h-12 w-full bg-gray-800" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300 font-semibold">Name</TableHead>
                    {Array.from({ length: maxExpenses }).map((_, i) => (
                      <TableHead key={i} className="text-gray-300 font-semibold">
                        {" "}
                      </TableHead>
                    ))}
                    <TableHead className="text-gray-300 font-semibold text-right">
                      Total Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spentData.length > 0 ? (
                    spentData.map((userData, index) => (
                      <TableRow 
                        key={index}
                        className="border-gray-700/50 hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-200">
                          {userData.name}
                        </TableCell>
                        {userData.expenses.map((expense, idx) => (
                          <TableCell key={idx} className="text-gray-300">
                            <div className="flex items-center justify-center gap-3">
                              <div className="flex flex-col">
                                <span className="font-medium text-green-400">
                                  ₹{expense.amount.toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(expense.date).toLocaleDateString()}
                                </span>
                              </div>
                              {user?.role === 'admin' && (
                                <button
                                  onClick={() => setDeleteConfirm({ 
                                    userId: userData.userId, 
                                    date: expense.date 
                                  })}
                                  className="p-1.5 rounded-full hover:bg-red-500/20 text-red-400 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </TableCell>
                        ))}
                        {Array.from({ length: maxExpenses - userData.expenses.length }).map((_, idx) => (
                          <TableCell key={idx} className="text-gray-500">—</TableCell>
                        ))}
                        <TableCell className="text-right font-bold text-blue-400">
                          ₹{userData.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={maxExpenses + 2} 
                        className="text-center text-gray-400 py-8"
                      >
                        No spent records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {spentData.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-800 rounded-lg p-4 text-center space-y-2">
                  <p className="text-sm text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-green-400">
                    ₹{totalSpent.toFixed(2)}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center space-y-2">
                  <p className="text-sm text-gray-400">Total Members</p>
                  <p className="text-2xl font-bold text-gray-100">
                    {spentData.length}
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 text-center space-y-2 md:col-span-1 col-span-2">
                  <p className="text-sm text-gray-400">Average Spent</p>
                  <p className="text-2xl font-bold text-blue-400">
                    ₹{(totalSpent / spentData.length || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AlertBox
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Expense"
        description="Are you sure you want to delete this money? This action cannot be undo."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </Card>
  );
};

export default SpentTable;
