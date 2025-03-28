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
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { format, parseISO } from "date-fns";
import { 
  Calendar, 
  User, 
  PlusCircle, 
  FileBarChart, 
  CupSoda,  // for Breakfast
  Utensils, // for Lunch
  Sunset    // for Dinner
} from 'lucide-react';
import { useRouter } from "next/navigation";

// Meal type to icon mapping
const mealIcons = {
  'Breakfast': CupSoda,
  'Lunch': Utensils,
  'Dinner': Sunset
};

// Meal type to color mapping
const mealColors = {
  'Breakfast': 'bg-orange-400',
  'Lunch': 'bg-blue-900',
  'Dinner': 'bg-purple-900'
};

interface MealTableProps {
  data: mealData[];
  currMonth: boolean;
}

export default function MealTable({ data, currMonth }: MealTableProps) {
  const [mealSheet, setMealSheet] = useState<mealData[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalMeals, setTotalMeals] = useState(0);
  const [totalExtra, setTotalExtra] = useState(0);
  const {user} = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function fetchMeals() {
      setLoading(true);
      try {
        if (data) {
          setMealSheet(data);
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

  // Function to format date if it's a valid ISO string
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "MMM dd");
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 text-white">
        <CardContent className="flex justify-center items-center h-32">
          <div className="text-slate-400">Loading meal data...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-7xl w-full mx-auto bg-slate-900 text-white p-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Calendar size={24} />
          Meal Records
        </CardTitle>
      </CardHeader>

      {/* edit button */}
      {currMonth && user?.role==="admin" && (
      <CardContent className="flex justify-end">
        <button 
        onClick={()=> router.push("/dashboard/editmeal")}
        className="bg-blue-700 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-all duration-200">
          Edit
        </button>
      </CardContent>)}

      <CardContent className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-800 p-3 flex items-center gap-2">
            <Calendar size={20} className="text-white" />
            <span className="font-medium text-white">Total Days</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">{dates.length}</span>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-purple-800 p-3 flex items-center gap-2">
            <PlusCircle size={20} className="text-white" />
            <span className="font-medium text-white">Total Extra Meals</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">{totalExtra}</span>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-800 p-3 flex items-center gap-2">
            <FileBarChart size={20} className="text-white" />
            <span className="font-medium text-white">Total Meals</span>
          </div>
          <div className="p-4 text-center">
            <span className="text-2xl font-bold text-white">{totalMeals + totalExtra}</span>
          </div>
        </div>
      </CardContent>
      
      <CardContent>
      {mealSheet.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No Meal data found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[70vh] rounded-lg border border-slate-700">
          <Table>
            <TableHeader className="bg-slate-800 sticky top-0 z-20">
              <TableRow>
                <TableHead className="font-semibold text-white sticky left-0 bg-slate-800 z-10">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>Name</span>
                  </div>
                </TableHead>
                {dates.map((date) => (
                  <TableHead key={date} className="text-center font-semibold text-white">
                    {formatDate(date)}
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold text-white">
                  <div className="flex items-center justify-center gap-1">
                    <PlusCircle size={16} />
                    <span>Extra</span>
                  </div>
                </TableHead>
                <TableHead className="text-center font-semibold text-white sticky right-0 bg-slate-800 z-10">
                  <div className="flex items-center justify-center gap-1">
                    <FileBarChart size={16} />
                    <span>Total</span>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mealSheet.map((user) => (
                <TableRow key={user.userId} className="border-slate-700 hover:bg-slate-800">
                  <TableCell className="font-medium text-white sticky left-0 bg-slate-900 z-10">
                    {user.userName}
                  </TableCell>
                  {dates.map((date) => {
                    const entry = user.details.find((detail) => detail.date === date);
                    return (
                      <TableCell key={date} className="text-center">
                        {entry && entry.sessions.length > 0 ? (
                          <div className="flex flex-wrap gap-1 justify-center">
                            {entry.sessions.map((session, idx) => {
                              const MealIcon = mealIcons[session as keyof typeof mealIcons] || Utensils;
                              const mealColor = mealColors[session as keyof typeof mealColors] || 'bg-gray-600';
                              return (
                                <Badge 
                                  key={idx} 
                                  variant="secondary" 
                                  className={`${mealColor} text-white flex items-center gap-1 px-1 py-1 rounded-full`}
                                >
                                  <MealIcon size={14} />
                                </Badge>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    {user.extra > 0 ? (
                      <Badge variant="secondary" className="bg-purple-700 text-white">
                        {user.extra}
                      </Badge>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-bold text-white sticky right-0 bg-slate-900 z-10">
                    <Badge className="bg-blue-700 text-white">
                      {user.details.reduce((sum, detail) => sum + detail.sessions.length, 0) + user.extra}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        )}
      </CardContent>
      
      <CardFooter className="text-sm text-center text-slate-400 italic border-t border-slate-700 pt-4 mt-2">
        * Regular meals and extra meals are both counted in the total
      </CardFooter>
    </Card>
  );
}