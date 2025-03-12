"use client";

import { useEffect, useState, useCallback } from "react";
import { deleteExpense } from "@/services/expenseService";
import { useAuth } from "../../context/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { Calendar, DollarSign, Trash2, FileBarChart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Expense } from "@/types/pg";


interface ExpenseTableProps {
  data : Expense[];
  currMonth: boolean;
}

export default function ExpenseTable({ data, currMonth }: ExpenseTableProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [totalExpense, setTotalExpense] = useState(0);
  const [uniqueUsers, setUniqueUsers] = useState(0);
  const { user } = useAuth();

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (data) {
        // Sort expenses by date in descending order (newest first)
        const sortedExpenses = [...data].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setExpenses(sortedExpenses);
        
        // Calculate totals
        const total = data.reduce((sum, expense) => sum + expense.totalMoney, 0);
        setTotalExpense(total);
        
        // Count unique users
        const uniqueUserNames = new Set(data.map(expense => expense.userName));
        setUniqueUsers(uniqueUserNames.size);
      } else {
        setExpenses([]);
        setTotalExpense(0);
        setUniqueUsers(0);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch expenses";
      console.error(errorMessage, error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleDelete = async (date: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteExpense(user?.pgId as string, date);
      if (result.success) {
        toast.success(result.message || "Expense deleted successfully");
        setExpenses(expenses.filter((expense) => expense.date !== date));
        
        // Recalculate totals
        const updatedExpenses = expenses.filter((expense) => expense.date !== date);
        const total = updatedExpenses.reduce((sum, expense) => sum + expense.totalMoney, 0);
        setTotalExpense(total);
        
        // Recalculate unique users
        const uniqueUserNames = new Set(updatedExpenses.map(expense => expense.userName));
        setUniqueUsers(uniqueUserNames.size);
      
      } else {
        toast.error(result.message || "Failed to delete expense");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete expense";
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return format(parseISO(dateString), "MMM dd, yyyy");
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number') return "₹0";
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 text-white">
        <CardContent className="flex justify-center items-center h-32">
          <div className="text-slate-400">Loading expense data...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="max-w-7xl mx-auto bg-slate-900 text-white w-full">
        <CardContent className="flex flex-col justify-center items-center h-32 gap-2">
          <div className="flex items-center text-red-400">
            <span>Error loading expenses</span>
          </div>
          <Button onClick={fetchExpenses} variant="outline" size="sm">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-7xl w-full mx-auto bg-slate-900 text-white p-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <DollarSign size={24} />
          Expense Records
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-800 p-3 flex items-center gap-2">
            <Calendar size={20} className="text-white" />
            <span className="font-medium text-white">Total Entries</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">{expenses.length}</span>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-800 p-3 flex items-center gap-2">
            <FileBarChart size={20} className="text-white" />
            <span className="font-medium text-white">Unique Users</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">{uniqueUsers}</span>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-800 p-3 flex items-center gap-2">
            <DollarSign size={20} className="text-white" />
            <span className="font-medium text-white">Total Expenses</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">{formatCurrency(totalExpense)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardContent>
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No expenses found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-700">
            <Table>
              <TableHeader className="bg-slate-800">
                <TableRow>
                  <TableHead className="font-semibold text-white sticky left-0 bg-slate-800 z-10">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>Date</span>
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    <span>User Name</span>
                  </TableHead>
                  <TableHead className="font-semibold text-white">
                    <span>Details</span>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-white">
                    <span>Amount</span>
                  </TableHead>
                  {user?.role === "admin"&& currMonth  && (
                  <TableHead className="text-center font-semibold text-white sticky right-0 bg-slate-800 z-10">
                    <span>Action</span>
                  </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense, index) => (
                  <TableRow key={`${expense.date}-${index}`} className="border-slate-700 hover:bg-slate-800">
                    <TableCell className="font-medium text-white sticky left-0 bg-slate-900 z-10">
                      <Badge variant="outline" className="border-slate-600 text-white">
                        {formatDate(expense.date)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">
                      {expense.userName || "Unknown"}
                    </TableCell>
                    <TableCell className="text-white">
                      {expense.details || "No details"}
                    </TableCell>
                    <TableCell className="text-right text-white font-medium">
                      <Badge variant="secondary" className="bg-green-700 text-white">
                        {formatCurrency(expense.totalMoney)}
                      </Badge>
                    </TableCell>
                    {user?.role === "admin"&& currMonth  && (
                    <TableCell className="text-center sticky right-0 bg-slate-900 z-10">
                      <Dialog open={deleteConfirm === expense.date} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-1"
                            onClick={() => setDeleteConfirm(expense.date)}
                          >
                            <Trash2 size={16} />
                            Delete
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-800 text-white">
                          <DialogHeader>
                            <DialogTitle>Confirm Deletion</DialogTitle>
                          </DialogHeader>
                          <div className="py-4">
                            Are you sure you want to delete this expense record?
                            <div className="mt-2 p-3 bg-slate-700 rounded">
                              <p><strong>Date:</strong> {formatDate(expense.date)}</p>
                              <p><strong>User:</strong> {expense.userName || "Unknown"}</p>
                              <p><strong>Amount:</strong> {formatCurrency(expense.totalMoney)}</p>
                              <p><strong>Details:</strong> {expense.details || "No details"}</p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="outline" 
                              onClick={() => setDeleteConfirm(null)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleDelete(expense.date)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? "Deleting..." : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="text-sm text-center text-slate-400 italic border-t border-slate-700 pt-4 mt-2">
        * Expenses are listed in reverse chronological order (newest first)
      </CardFooter>
    </Card>
  );
}