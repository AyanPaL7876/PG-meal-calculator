"use client";

import { useEffect, useState } from "react";
import { deleteSpentDetails } from "@/services/spentService";
import { toast } from "react-hot-toast";
import { 
  Trash2, 
  Receipt, 
  User, 
  Calendar, 
  DollarSign, 
  FileBarChart2, 
  Search,
  ChevronDown,
  // Download,
  SlidersHorizontal,
  X
} from "lucide-react";
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
  CardDescription,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { spent } from "@/types/pg";
import { useAuth } from "@/context/AuthContext";

interface SpentTableProps {
  data: spent[];
  currMonth: boolean;
}

export default function SpentTable({ data, currMonth }: SpentTableProps) {
  const [spentSheet, setSpentSheet] = useState<spent[]>([]);
  const [filteredSheet, setFilteredSheet] = useState<spent[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ userId: string; date: string } | null>(null);
  const [totalSpent, setTotalSpent] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"all" | "highToLow" | "lowToHigh">("all");
  const { user } = useAuth();

  useEffect(() => {
    async function fetchSpentData() {
      setLoading(true);
      try {
        if (data) {
          setSpentSheet(data);
          setFilteredSheet(data);
          
          // Group dates by day, regardless of time
          const uniqueDatesMap = new Map();
          
          data.forEach((user) => {
            user.details.forEach((detail) => {
              // Extract just the date part (without time) for grouping
              const dateObj = new Date(detail.date);
              const dateKey = dateObj.toISOString().split('T')[0];
              
              // Use a single date string for each day
              uniqueDatesMap.set(dateKey, dateKey);
            });
          });
          
          // Convert to array and sort
          const uniqueDates = Array.from(uniqueDatesMap.values()).sort();
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
  }, [data]);

  // Apply search and filters
  useEffect(() => {
    if (!spentSheet.length) return;
    
    let filtered = [...spentSheet];
    
    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    if (filterBy === "highToLow") {
      filtered.sort((a, b) => b.totalMoney - a.totalMoney);
    } else if (filterBy === "lowToHigh") {
      filtered.sort((a, b) => a.totalMoney - b.totalMoney);
    }
    
    setFilteredSheet(filtered);
  }, [searchTerm, filterBy, spentSheet]);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const success = await deleteSpentDetails(user?.pgId as string, deleteConfirm.userId, deleteConfirm.date);
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
        }).filter(user => user.details.length > 0);
        
        setSpentSheet(updatedSpentSheet);
        
        // Recalculate total spent
        const newTotal = updatedSpentSheet.reduce((acc, user) => acc + user.totalMoney, 0);
        setTotalSpent(newTotal);
        
        // Recalculate dates (now using the normalized date keys)
        const remainingDatesMap = new Map();
        updatedSpentSheet.forEach(user => {
          user.details.forEach(detail => {
            const dateObj = new Date(detail.date);
            const dateKey = dateObj.toISOString().split('T')[0];
            remainingDatesMap.set(dateKey, dateKey);
          });
        });
        
        setDates(Array.from(remainingDatesMap.values()).sort());
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

  // Helper function to find all expenses for a user on a specific date
  const findExpensesForDate = (user: spent, dateKey: string) => {
    return user.details.filter(detail => {
      const detailDate = new Date(detail.date);
      const detailDateKey = detailDate.toISOString().split('T')[0];
      return detailDateKey === dateKey;
    });
  };

  // const exportToCSV = () => {
  //   // Create CSV content
  //   let csvContent = "Name,";
    
  //   // Add date headers
  //   dates.forEach(date => {
  //     csvContent += new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ",";
  //   });
    
  //   csvContent += "Total\n";
    
  //   // Add user data
  //   filteredSheet.forEach(user => {
  //     csvContent += (user.userName || "Unknown") + ",";
      
  //     // Add expenses for each date
  //     dates.forEach(dateKey => {
  //       const expenses = findExpensesForDate(user, dateKey);
  //       const totalForDate = expenses.reduce((sum, exp) => sum + exp.money, 0);
  //       csvContent += (totalForDate > 0 ? totalForDate.toFixed(2) : "") + ",";
  //     });
      
  //     // Add total
  //     csvContent += user.totalMoney.toFixed(2) + "\n";
  //   });
    
  //   // Create and download the file
  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.setAttribute("href", url);
  //   link.setAttribute("download", "expense_records.csv");
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  if (loading) {
    return (
      <Card className="bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Spent Records</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-24 bg-slate-800" />
            <Skeleton className="h-24 bg-slate-800" />
            <Skeleton className="h-24 bg-slate-800" />
          </div>
          <Skeleton className="h-64 bg-slate-800" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-7xl w-full mx-auto bg-slate-900 text-white border-slate-700">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold mb-1">
              <span className="flex items-center gap-2">
                <Receipt size={20} />
                Spent Records
              </span>
            </CardTitle>
            <CardDescription className="text-slate-400">
              {currMonth ? "Current month expenses" : "Previous expense history"}
            </CardDescription>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-8 h-9 bg-slate-800 border-slate-700 text-white"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-7 w-7 text-slate-400 hover:text-white"
                  onClick={() => setSearchTerm("")}
                >
                  <X size={14} />
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="bg-slate-800 border-slate-700 h-9"
                  >
                    <SlidersHorizontal size={14} className="mr-1" />
                    <span>{filterBy === "all" ? "Sort" : 
                           filterBy === "highToLow" ? "Highest First" : "Lowest First"}</span>
                    <ChevronDown size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                  <DropdownMenuItem onClick={() => setFilterBy("all")}>
                    Default Order
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy("highToLow")}>
                    Highest to Lowest
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy("lowToHigh")}>
                    Lowest to Highest
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* <Button 
                variant="outline" 
                size="sm"
                className="bg-slate-800 border-slate-700 h-9"
                onClick={exportToCSV}
              >
                <Download size={14} className="mr-1" />
                Export
              </Button> */}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-white">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-blue-400" />
                  <span className="font-medium ">Members</span>
                </div>
                <span className="text-2xl font-bold">{spentSheet.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-purple-400" />
                  <span className="font-medium">Entries</span>
                </div>
                <span className="text-2xl font-bold">
                  {spentSheet.reduce((acc, user) => acc + user.details.length, 0)}
                </span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700 text-white">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-green-400" />
                  <span className="font-medium">Total Spent</span>
                </div>
                <span className="text-2xl font-bold">₹{totalSpent.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {filteredSheet.length === 0 ? (
          <div className="text-center py-10 bg-slate-800 rounded-lg">
            <FileBarChart2 size={40} className="mx-auto text-slate-600 mb-2" />
            <p className="text-slate-400">No expense data found</p>
            {searchTerm && (
              <p className="text-slate-500 text-sm mt-1">Try adjusting your search term</p>
            )}
          </div>
        ) : (
          <div className="border border-slate-700 rounded-lg overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
              <Table>
                <TableHeader className="bg-slate-800 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="font-medium text-white sticky left-0 bg-slate-800 z-20 w-32">
                      <div className="flex items-center gap-2">
                        <User size={14} />
                        <span>Name</span>
                      </div>
                    </TableHead>
                    {dates.map((date) => (
                      <TableHead key={date} className="text-center font-medium text-white">
                        <div className="flex flex-col items-center">
                          <span>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-medium text-white sticky right-0 bg-slate-800 z-20 w-28">
                      <div className="flex items-center justify-center gap-1">
                        <FileBarChart2 size={14} />
                        <span>Total</span>
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredSheet.map((u) => (
                    <TableRow key={u.userId} className="border-slate-700 hover:bg-slate-800">
                      <TableCell className="font-medium text-white sticky left-0 bg-slate-900 z-10">
                        {u.userName ?? "Unknown User"}
                      </TableCell>
                      
                      {dates.map((dateKey) => {
                        const expenses = findExpensesForDate(u, dateKey);
                        const totalForDate = expenses.reduce((sum, exp) => sum + exp.money, 0);
                        
                        return (
                          <TableCell key={dateKey} className="text-center p-1">
                            {expenses.length > 0 && (
                              <div className="flex flex-row items-center justify-center gap-1">
                                <Badge 
                                  variant="secondary" 
                                  className="bg-slate-700 text-white"
                                >
                                  ₹{totalForDate.toFixed(2)}
                                </Badge>
                                
                                {user?.role === "admin" && currMonth && expenses.map((expense, idx) => (
                                  <Button
                                    key={idx}
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 mt-1 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                                    onClick={() =>
                                      setDeleteConfirm({ userId: u.userId, date: expense.date })
                                    }
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                ))}
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                      
                      <TableCell className="text-center font-bold sticky right-0 bg-slate-900 z-10">
                        <Badge className="bg-blue-900 text-white">
                          ₹{u.totalMoney.toFixed(2)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
      
      {user?.role === "admin" && (
        <CardFooter className="text-sm text-center text-slate-400 border-t border-slate-700 pt-4">
          Click the delete button beside each expense to remove it
        </CardFooter>
      )}

      {deleteConfirm && (
        <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <AlertDialogContent className="bg-slate-800 border-slate-700 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Expense</AlertDialogTitle>
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