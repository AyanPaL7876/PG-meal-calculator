"use client";

import { useEffect, useState } from "react";
import { mealData } from "@/types/pg";
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
import { useAuth } from "@/context/AuthContext";
import { format, parseISO } from "date-fns";
import { 
  Calendar, 
  User, 
  PlusCircle, 
  FileBarChart, 
  CupSoda,
  Utensils, 
  Moon,
  Edit,
  Filter,
  // Download,
  ChevronDown
} from 'lucide-react';
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Meal type definitions with additional styling information
const mealTypes = {
  'Breakfast': { 
    icon: CupSoda, 
    color: 'bg-orange-500',
    hoverColor: 'hover:bg-orange-400', 
    label: 'Breakfast'
  },
  'Lunch': { 
    icon: Utensils, 
    color: 'bg-blue-600', 
    hoverColor: 'hover:bg-blue-500',
    label: 'Lunch'
  },
  'Dinner': { 
    icon: Moon, 
    color: 'bg-purple-600', 
    hoverColor: 'hover:bg-purple-500',
    label: 'Dinner'
  }
};

interface MealTableProps {
  data: mealData[];
  currMonth: boolean;
}

export default function MealTable({ data, currMonth }: MealTableProps) {
  const [mealSheet, setMealSheet] = useState<mealData[]>([]);
  const [filteredMealSheet, setFilteredMealSheet] = useState<mealData[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMeals, setTotalMeals] = useState(0);
  const [totalExtra, setTotalExtra] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const {user} = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchMeals() {
      setLoading(true);
      try {
        if (data) {
          setMealSheet(data);
          setFilteredMealSheet(data);
          
          const uniqueDates = Array.from(
            new Set(data.flatMap((user) => user.details.map((detail) => detail.date)))
          ).sort();
          setDates(uniqueDates);
          
          // Calculate totals
          let mealCount = 0;
          let extraCount = 0;
          
          data.forEach(user => {
            mealCount += user.details.reduce((sum, detail) => sum + detail.sessions.length, 0);
            extraCount += user.extra;
          });
          
          setTotalMeals(mealCount);
          setTotalExtra(extraCount);
        }
      } catch (error) {
        console.error("Failed to fetch meal data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMeals();
  }, [data]);

  // Filter based on search term
  useEffect(() => {
    if (searchTerm === '' && activeFilter === 'All') {
      setFilteredMealSheet(mealSheet);
      return;
    }
    
    const filtered = mealSheet.filter(user => {
      const nameMatch = user.userName.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (activeFilter === 'All') return nameMatch;
      
      if (activeFilter === 'Has Extra') {
        return nameMatch && user.extra > 0;
      }
      
      if (activeFilter === 'No Meals') {
        const totalUserMeals = user.details.reduce((sum, detail) => sum + detail.sessions.length, 0);
        return nameMatch && totalUserMeals === 0 && user.extra === 0;
      }
      
      return nameMatch;
    });
    
    setFilteredMealSheet(filtered);
  }, [searchTerm, activeFilter, mealSheet]);

  // Function to format date if it's a valid ISO string
  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return {
        dayOfWeek: format(date, "EEE"),
        dayOfMonth: format(date, "dd"),
        month: format(date, "MMM")
      };
    } catch {
      return {
        dayOfWeek: "Invalid",
        dayOfMonth: "XX",
        month: "XX"
      };
    }
  };

  // Export to CSV function
  // const exportToCSV = () => {
  //   const headers = ["Name", ...dates.map(d => formatDate(d).dayOfMonth + " " + formatDate(d).month), "Extra", "Total"];
    
  //   let csvContent = headers.join(",") + "\n";
    
  //   mealSheet.forEach(user => {
  //     const row = [
  //       user.userName,
  //       ...dates.map(date => {
  //         const entry = user.details.find(detail => detail.date === date);
  //         return entry ? entry.sessions.length : 0;
  //       }),
  //       user.extra,
  //       user.details.reduce((sum, detail) => sum + detail.sessions.length, 0) + user.extra
  //     ];
      
  //     csvContent += row.join(",") + "\n";
  //   });
    
  //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.setAttribute("href", url);
  //   link.setAttribute("download", `meal_records_${new Date().toISOString().split('T')[0]}.csv`);
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // };

  if (loading) {
    return (
      <Card className="bg-slate-900 text-white border-slate-700">
        <CardContent className="flex justify-center items-center h-48">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <div className="text-slate-400 font-medium">Loading meal data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-7xl w-full mx-auto bg-slate-900 text-white border-slate-700 shadow-xl">
      <CardHeader className="pb-2 border-b border-slate-800">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="text-blue-400" size={24} />
              Meal Records
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              {currMonth ? "Current month's meal data" : "Historical meal data"}
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {currMonth && user?.role === "admin" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={() => router.push("/dashboard/editmeal")}
                      variant="default" 
                      className="bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-2"
                    >
                      <Edit size={16} />
                      <span className="hidden sm:inline">Edit Records</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit meal records</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={exportToCSV}
                    variant="outline" 
                    className="border-slate-600 text-slate-200 bg-transparent hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Download size={16} />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export as CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
          </div>
        </div>
      </CardHeader>

      <CardContent className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-md overflow-hidden border border-slate-700">
          <div className="bg-blue-600 p-3 flex items-center gap-2">
            <Calendar size={20} className="text-white" />
            <span className="font-medium text-white">Total Days</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-3xl font-bold text-white">{dates.length}</span>
            <p className="text-slate-400 text-sm mt-1">Recorded dates</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-md overflow-hidden border border-slate-700">
          <div className="bg-purple-600 p-3 flex items-center gap-2">
            <PlusCircle size={20} className="text-white" />
            <span className="font-medium text-white">Extra Meals</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-3xl font-bold text-white">{totalExtra}</span>
            <p className="text-slate-400 text-sm mt-1">Additional meals</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-md overflow-hidden border border-slate-700">
          <div className="bg-green-600 p-3 flex items-center gap-2">
            <FileBarChart size={20} className="text-white" />
            <span className="font-medium text-white">Total Meals</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-3xl font-bold text-white">{totalMeals + totalExtra}</span>
            <p className="text-slate-400 text-sm mt-1">Regular + extra meals</p>
          </div>
        </div>
      </CardContent>
      
      <CardContent className="pt-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
          {/* Search input */}
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="search" 
              className="block w-full p-2 pl-10 text-sm border rounded-lg bg-slate-800 border-slate-600 placeholder-slate-400 text-white focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filter dropdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <span className="text-slate-400 text-sm">Filter:</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-slate-600 text-slate-200 bg-transparent hover:bg-slate-800">
                  {activeFilter}
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
                <DropdownMenuItem 
                  className={`${activeFilter === 'All' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
                  onClick={() => setActiveFilter('All')}
                >
                  All
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`${activeFilter === 'Has Extra' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
                  onClick={() => setActiveFilter('Has Extra')}
                >
                  Has Extra
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`${activeFilter === 'No Meals' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}
                  onClick={() => setActiveFilter('No Meals')}
                >
                  No Meals
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Meal type legend */}
        <div className="flex items-center gap-4 mb-4 justify-center bg-slate-800 p-2 rounded-lg">
          <div className="text-slate-400 text-sm">Legend:</div>
          {Object.entries(mealTypes).map(([type, config]) => {
            const Icon = config.icon;
            return (
              <div key={type} className="flex items-center gap-2">
                <div className={`${config.color} text-white flex items-center justify-center w-7 h-7 rounded-full`}>
                  <Icon size={16} />
                </div>
                <span className="text-sm text-slate-300">{config.label}</span>
              </div>
            );
          })}
        </div>
        
        {filteredMealSheet.length === 0 ? (
          <div className="text-center py-12 border border-slate-700 rounded-lg bg-slate-800">
            <div className="flex flex-col items-center gap-2">
              <FileBarChart size={36} className="text-slate-500" />
              <p className="text-slate-400 font-medium">No meal data found</p>
              {searchTerm && (
                <p className="text-slate-500 text-sm">Try adjusting your search criteria</p>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg border border-slate-700 shadow-inner bg-slate-950">
            <Table>
              <TableHeader className="bg-slate-800 sticky top-0 z-20">
                <TableRow className="border-slate-700">
                  <TableHead className="font-semibold text-white sticky left-0 bg-slate-800 z-10 w-36">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-blue-400" />
                      <span>Name</span>
                    </div>
                  </TableHead>
                  {dates.map((date) => {
                    const formattedDate = formatDate(date);
                    return (
                      <TableHead key={date} className="text-center font-semibold text-white p-1 min-w-16">
                        <div className="flex flex-col items-center">
                          <span className="text-xs text-slate-400">{formattedDate.dayOfWeek}</span>
                          <span className="text-sm">{formattedDate.dayOfMonth}</span>
                          <span className="text-xs text-slate-400">{formattedDate.month}</span>
                        </div>
                      </TableHead>
                    );
                  })}
                  <TableHead className="text-center font-semibold text-white">
                    <div className="flex items-center justify-center gap-1">
                      <PlusCircle size={16} className="text-purple-400" />
                      <span>Extra</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-semibold text-white sticky right-0 bg-slate-800 z-10 w-24">
                    <div className="flex items-center justify-center gap-1">
                      <FileBarChart size={16} className="text-green-400" />
                      <span>Total</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMealSheet.map((user) => {
                  const userTotalMeals = user.details.reduce((sum, detail) => sum + detail.sessions.length, 0) + user.extra;
                  return (
                    <TableRow key={user.userId} className="border-slate-700 hover:bg-slate-800 transition-colors">
                      <TableCell className="font-medium text-white sticky left-0 bg-slate-900 z-10">
                        <div className="truncate max-w-32">{user.userName}</div>
                      </TableCell>
                      {dates.map((date) => {
                        const entry = user.details.find((detail) => detail.date === date);
                        return (
                          <TableCell key={date} className="text-center p-2">
                            {entry && entry.sessions.length > 0 ? (
                              <div className="flex flex-wrap gap-1 justify-center">
                                {entry.sessions.map((session, idx) => {
                                  const mealType = session as keyof typeof mealTypes;
                                  const mealConfig = mealTypes[mealType] || { icon: Utensils, color: 'bg-gray-600', label: session };
                                  const MealIcon = mealConfig.icon;
                                  
                                  return (
                                    <TooltipProvider key={idx}>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div 
                                            className={`${mealConfig.color} text-white flex items-center justify-center w-6 h-6 rounded-full transition-transform hover:scale-110`}
                                          >
                                            <MealIcon size={14} className="text-white" />
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{session}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  );
                                })}
                              </div>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center p-2">
                        {user.extra > 0 ? (
                          <div className="bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold text-lg mx-auto">
                            {user.extra}
                          </div>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-bold text-white sticky right-0 bg-slate-900 z-10">
                        <div className={`${userTotalMeals > 0 ? 'bg-blue-600' : 'bg-slate-700'} text-white py-1 px-3 rounded-md text-sm inline-block min-w-10`}>
                          {userTotalMeals}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t border-slate-800 pt-4 mt-4 flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="text-sm text-slate-400 italic">
          * Regular meals and extra meals are both counted in the total
        </div>
        <div className="text-sm text-slate-500">
          Showing {filteredMealSheet.length} of {mealSheet.length} users
        </div>
      </CardFooter>
    </Card>
  );
}