"use client";

import { useEffect, useState } from "react";
import { getSpentSheet, deleteSpentDetails } from "@/services/spentService";
import { toast } from "react-hot-toast";
import { Trash2, Receipt, User, Calendar, DollarSign, FileBarChart2 } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface SpentDetail {
  date: string;
  money: number;
}

interface SpentUser {
  userId: string;
  userName?: string;
  totalMoney: number;
  details: SpentDetail[];
}

interface SpentTableProps {
  pgId: string;
  isAdmin?: boolean;
  currMonth: boolean;
}

export default function SpentTable({ pgId, isAdmin = true,currMonth }: SpentTableProps) {
  const [spentSheet, setSpentSheet] = useState<SpentUser[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; date: string } | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    async function fetchSpentData() {
      setLoading(true);
      try {
        const data = await getSpentSheet(pgId,currMonth);
        if (data) {
          setSpentSheet(data);
          const uniqueDates = Array.from(
            new Set(data.flatMap((user) => user.details.map((detail) => detail.date)))
          ).sort();
          setDates(uniqueDates);
          
          // Calculate total spent
          const total = data.reduce((acc, user) => acc + user.totalMoney, 0);
          setTotalSpent(total);
        }
      } catch (error) {
        console.error("Failed to fetch spent data:", error);
        toast.error("Failed to load spent data");
      } finally {
        setLoading(false);
      }
    }
    fetchSpentData();
  }, [pgId]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const success = await deleteSpentDetails(pgId, deleteConfirm.userId, deleteConfirm.date);
      if (success) {
        toast.success("Expense deleted successfully");
        
        // Update the spent sheet by removing the deleted expense
        const updatedSpentSheet = spentSheet.map((user) => {
          if (user.userId === deleteConfirm.userId) {
            const deletedExpense = user.details.find(d => d.date === deleteConfirm.date);
            const deletedAmount = deletedExpense ? deletedExpense.money : 0;
            
            return {
              ...user,
              totalMoney: user.totalMoney - deletedAmount,
              details: user.details.filter((detail) => detail.date !== deleteConfirm.date),
            };
          }
          return user;
        });
        
        setSpentSheet(updatedSpentSheet);
        
        // Recalculate total spent
        const newTotal = updatedSpentSheet.reduce((acc, user) => acc + user.totalMoney, 0);
        setTotalSpent(newTotal);
        
        // Recalculate dates
        const remainingDates = Array.from(
          new Set(updatedSpentSheet.flatMap((user) => 
            user.details.map(detail => detail.date)
          ))
        ).sort();
        setDates(remainingDates);
      } else {
        toast.error("Failed to delete expense");
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense");
    } finally {
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 text-white">
        <CardContent className="flex justify-center items-center h-32">
          <Skeleton className="w-full h-12 bg-slate-700" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-7xl w-full mx-auto bg-slate-900 text-white p-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Receipt size={24} />
          Spent Records
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow>
                <TableHead className="font-semibold text-white sticky left-0 bg-slate-800 z-10">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>Name</span>
                  </div>
                </TableHead>
                {dates.map((date) => (
                  <TableHead key={date} className="text-center font-semibold text-white">
                    <div className="flex flex-col items-center justify-center">
                      <Calendar size={14} className="mb-1" />
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold text-white sticky right-0 bg-slate-800 z-10">
                  <div className="flex items-center justify-center gap-1">
                    <FileBarChart2 size={16} />
                    <span>Total</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {spentSheet.map((user) => (
                <TableRow key={user.userId} className="border-slate-700 hover:bg-slate-800">
                  <TableCell className="font-medium text-white sticky left-0 bg-slate-900 z-10">
                    {user.userName ?? "Unknown User"}
                  </TableCell>
                  
                  {dates.map((date) => {
                    const expense = user.details.find((detail) => detail.date === date);
                    return (
                      <TableCell key={date} className="text-center p-2">
                        {expense ? (
                          <div className="flex flex-col items-center justify-center gap-1 bg-slate-800 p-2 rounded-lg">
                            <Badge variant="secondary" className="bg-green-700 text-white font-medium">
                              ₹{expense.money.toFixed(2)}
                            </Badge>
                            
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 mt-1 text-red-400 hover:text-red-500 hover:bg-slate-700"
                                onClick={() =>
                                  setDeleteConfirm({ userId: user.userId, date: expense.date })
                                }
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        ) : null}
                      </TableCell>
                    );
                  })}
                  
                  <TableCell className="text-center font-bold sticky right-0 bg-slate-900 z-10">
                    <Badge className="bg-blue-700 text-white px-3 py-1">
                      ₹{user.totalMoney.toFixed(2)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <CardContent className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-800 p-3 flex items-center gap-2">
            <User size={20} className="text-white" />
            <span className="font-medium text-white">Total Members</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">{spentSheet.length}</span>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-800 p-3 flex items-center gap-2">
            <Calendar size={20} className="text-white" />
            <span className="font-medium text-white">Total Expense Entries</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">
              {spentSheet.reduce((acc, user) => acc + user.details.length, 0)}
            </span>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-800 p-3 flex items-center gap-2">
            <DollarSign size={20} className="text-white" />
            <span className="font-medium text-white">Total Spent</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">₹{totalSpent.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="text-sm text-center text-slate-400 italic border-t border-slate-700 pt-4 mt-2">
        {isAdmin ? 
          "* Click the delete button under each expense to remove it" : 
          "* Contact an admin to make corrections to expense records"}
      </CardFooter>

      {deleteConfirm && (
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent className="bg-slate-800 border border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Expense</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-300">
                Are you sure you want to delete this expense? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                className="bg-red-600 text-white hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}