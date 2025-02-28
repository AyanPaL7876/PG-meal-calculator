"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "./ui/skeleton";
import { toast } from "react-hot-toast";
import AlertBox from "@/components/AlertBox";
import { MdDeleteForever } from "react-icons/md";

interface Expense {
  date: string;
  name: string;
  details: string;
  totalMoney: number;
}

interface ApiError {
  message: string;
}

const ExpensesTable = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);
  const [deleteDate, setDeleteDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.pgId) return;

    const fetchExpenses = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/get/expenses?pgId=${user.pgId}`);
        const data = await res.json();

        if (data.success) {
          setExpenses(data.expenseSheet);
          const total = data.expenseSheet.reduce(
            (sum: number, exp: any) => sum + Number(exp.totalMoney),
            0
          );
          setTotalExpense(total);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
        toast.error("Failed to load expenses.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user?.pgId]);

  const filteredExpenses = expenses.filter((entry) => {
    const searchLower = search.toLowerCase();
    const dateStr = new Date(entry.date).toLocaleDateString();
    return entry.name.toLowerCase().includes(searchLower) || dateStr.includes(searchLower);
  });

  const handleDelete = async () => {
    if (!deleteDate || !user?.pgId) return;

    try {
      const res = await fetch(`/api/delete/expense`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: deleteDate,
          pgId: user.pgId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const updatedExpenses = expenses.filter((exp) => exp.date !== deleteDate);
        setExpenses(updatedExpenses);
        const newTotal = updatedExpenses.reduce((sum, exp) => sum + Number(exp.totalMoney), 0);
        setTotalExpense(newTotal);
        toast.success("Expense deleted successfully", {
          duration: 3000,
          position: "top-center",
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
          },
        });
      } else {
        toast.error(data.message || "Failed to delete expense", {
          duration: 3000,
          position: "top-center",
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
          },
        });
      }
    } catch (error: ApiError) {
      console.error("Delete error:", error);
      toast.error(error.message || "Failed to delete expense", {
        duration: 3000,
        position: "top-center",
        style: {
          background: '#EF4444',
          color: '#fff',
          padding: '16px',
        },
      });
    }

    setDeleteDate(null);
  };

  return (
    <Card className="bg-gray-900/95 border-gray-700 text-gray-100 shadow-xl">
      <CardHeader className="border-b border-gray-700/50">
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Expenses Records
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <Input
            type="text"
            placeholder="Search by Name or Date"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
          />

          <div className="overflow-x-auto rounded-lg border border-gray-700 max-h-[calc(100vh-400px)] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-8 w-full bg-gray-800" />
                <Skeleton className="h-12 w-full bg-gray-800" />
                <Skeleton className="h-12 w-full bg-gray-800" />
                <Skeleton className="h-12 w-full bg-gray-800" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-800 sticky top-0">
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300 font-semibold">Date</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Name</TableHead>
                    <TableHead className="text-gray-300 font-semibold">Details</TableHead>
                    <TableHead className="text-gray-300 font-semibold text-right">Amount</TableHead>
                    {user?.role === "admin" && (
                      <TableHead className="text-gray-300 font-semibold text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((expense) => (
                      <TableRow key={expense.date} className="border-gray-700/50 hover:bg-gray-800/50 transition-colors">
                        <TableCell className="font-medium text-gray-200">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-gray-300">{expense.name}</TableCell>
                        <TableCell className="text-gray-300">{expense.details}</TableCell>
                        <TableCell className="text-right font-bold text-green-400">
                          ₹{Number(expense.totalMoney).toFixed(2)}
                        </TableCell>
                        {user?.role === "admin" && (
                          <TableCell className="flex justify-end">
                            <MdDeleteForever
                              onClick={() => {
                                console.log("Delete button clicked for Date:", expense.date);
                                setDeleteDate(expense.date);
                              }}
                              size={25}
                              className="text-red-500 hover:text-red-800 cursor-pointer transition-colors"
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  setDeleteDate(expense.date);
                                }
                              }}
                            />
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                        No expenses found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <AlertBox
            isOpen={!!deleteDate}
            onClose={() => setDeleteDate(null)}
            onConfirm={() => {
              console.log("Confirm delete for Date:", deleteDate);
              handleDelete();
            }}
            title="Confirm Deletion"
            description="Are you sure you want to delete this expense? This action cannot be undone."
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpensesTable;
