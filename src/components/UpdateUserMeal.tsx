"use client";

import { useState, useCallback, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import LoadingScreen from "@/components/Loading";
import { toast } from "react-hot-toast";
import { usePg } from "@/context/PgContext";
import { getMealSheet, markMeal, removeMealMark } from "@/services/mealService";
import { MealSheetEntry } from "@/types/pg";
import { createOrUpdateSummary } from "@/services/summaryServices";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  Coffee, 
  Utensils, 
  Moon, 
  Calendar as CalendarIcon, 
  User, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Save, 
  RefreshCw, 
  Search 
} from "lucide-react";

interface MealSession {
  name: string;
  selected: boolean;
  icon: ReactNode; // Changed from JSX.Element to ReactNode
}

const MealUpdatePopup = () => {
  const { user } = useAuth();
  const pgId = user?.pgId;
  const { users } = usePg();
  const [selectedUser, setSelectedUser] = useState<string>("Select user");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [mealSessions, setMealSessions] = useState<MealSession[]>([
    { name: "Breakfast", selected: false, icon: <Coffee className="h-5 w-5 mr-2" /> },
    { name: "Lunch", selected: false, icon: <Utensils className="h-5 w-5 mr-2" /> },
    { name: "Dinner", selected: false, icon: <Moon className="h-5 w-5 mr-2" /> }
  ]);
  const [calendarOpen, setCalendarOpen] = useState<boolean>(false);
  
  // Fetch user's meal data for the selected date
  const fetchUserMealData = useCallback(async () => {
    if (!pgId) {
      toast.error("PG not selected");
      return;
    }

    if (selectedUser === "Select user") {
      toast.error("Please select a user");
      return;
    }

    setLoading(true);
    try {
      // Fetch meal sheet
      const mealSheet = await getMealSheet(pgId, true);
      
      // Find the selected user's meal entry
      const userMealEntry = mealSheet?.find((meal: MealSheetEntry) => meal.userId === selectedUser);
      
      // Find meal details for the selected date
      const dateDetails = userMealEntry?.details.find(detail => detail.date === date);
      
      // Update meal sessions based on fetched data
      const updatedMealSessions = [
        { name: "Breakfast", selected: dateDetails?.sessions.includes("Breakfast") || false, icon: <Coffee className="h-5 w-5 mr-2" /> },
        { name: "Lunch", selected: dateDetails?.sessions.includes("Lunch") || false, icon: <Utensils className="h-5 w-5 mr-2" /> },
        { name: "Dinner", selected: dateDetails?.sessions.includes("Dinner") || false, icon: <Moon className="h-5 w-5 mr-2" /> }
      ];
      
      setMealSessions(updatedMealSessions);
      setLoading(false);
      setIsDialogOpen(true);
    } catch (error) {
      console.error("Error fetching user meal data:", error);
      toast.error("Failed to fetch meal data");
      setLoading(false);
    }
  }, [pgId, selectedUser, date]);

  // Toggle meal session selection
  const toggleMealSession = useCallback((sessionName: string) => {
    setMealSessions(prev => 
      prev.map(session => 
        session.name === sessionName 
          ? { ...session, selected: !session.selected } 
          : session
      )
    );
  }, []);

  // Update meal attendance for the selected user and date
  const updateMealAttendance = useCallback(async () => {
    if (!pgId) {
      toast.error("PG not selected");
      return;
    }

    if (selectedUser === "Select user") {
      toast.error("Please select a user");
      return;
    }

    setUpdating(true);
    try {
      // First, remove all meal marks for this user on this date
      for (const session of mealSessions) {
        await removeMealMark(pgId, selectedUser, date, session.name);
      }
      
      // Then, add marks for the selected sessions
      const selectedSessions = mealSessions.filter(session => session.selected);
      
      for (const session of selectedSessions) {
        const res = await markMeal(pgId, selectedUser, date, session.name);
        if (!res.success) {
          toast.error(`Failed to mark ${session.name}`);
        }
      }
      
      // Update summary
      await createOrUpdateSummary(pgId);
      
      toast.success("Meal attendance updated successfully");
      setUpdating(false);
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error updating meal attendance:", error);
      toast.error("Failed to update meal attendance");
      setUpdating(false);
    }
  }, [pgId, selectedUser, date, mealSessions]);

  // Reset form
  const resetForm = useCallback(() => {
    setSelectedUser("Select user");
    setDate(new Date().toISOString().split("T")[0]);
    setMealSessions([
      { name: "Breakfast", selected: false, icon: <Coffee className="h-5 w-5 mr-2" /> },
      { name: "Lunch", selected: false, icon: <Utensils className="h-5 w-5 mr-2" /> },
      { name: "Dinner", selected: false, icon: <Moon className="h-5 w-5 mr-2" /> }
    ]);
    setIsDialogOpen(false);
  }, []);

  // Get selected user's name
  const selectedUserName = useCallback(() => {
    const foundUser = users.find(u => u.uid === selectedUser);
    return foundUser ? foundUser.name : "Unknown User";
  }, [selectedUser, users]);

  // Handle date change from calendar
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate.toISOString().split("T")[0]);
      setCalendarOpen(false);
    }
  };

  // Access control
  if (user?.role !== "admin") return <div>Access Denied</div>;

  return (
    <div>
      <Card className="bg-slate-800 border-slate-700 shadow-lg">
        <CardHeader className="border-b border-slate-700">
          <CardTitle className="text-xl font-bold text-white flex items-center justify-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            Single User Meal Update
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 flex-wrap">
            {/* User Selector */}
            <div className="relative w-full md:w-auto">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Select 
                onValueChange={setSelectedUser} 
                value={selectedUser}
              >
                <SelectTrigger className="w-full md:w-[220px] pl-10 bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600 text-white">
                  {users.map(u => (
                    <SelectItem key={u.uid} value={u.uid} className="hover:bg-slate-600">
                      {u.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Calendar Date Picker */}
            <div className="relative w-full md:w-auto">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full md:w-[200px] justify-start text-left font-normal bg-slate-700 text-white border-slate-600 hover:bg-slate-600"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(new Date(date), "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700">
                  <Calendar
                    mode="single"
                    selected={date ? new Date(date) : undefined}
                    onSelect={handleDateChange}
                    initialFocus
                    className="bg-slate-800 text-white"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              {/* Fetch Data Button */}
              <Button 
                onClick={fetchUserMealData}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-auto"
              >
                <Search className="mr-2 h-4 w-4" />
                Fetch Meal Data
              </Button>
              
              {/* Reset Button */}
              <Button 
                variant="outline" 
                className="text-white border-slate-600 bg-transparent hover:bg-slate-700 flex-1 md:flex-auto"
                onClick={resetForm}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && <LoadingScreen message="Fetching meal data..." />}

          {/* Meal Update Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-slate-800 text-white border-slate-600 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-center">
                  Update Meals
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <div className="bg-slate-700 p-4 rounded-lg mb-6">
                  <div className="flex items-center mb-2">
                    <User className="mr-2 h-5 w-5 text-blue-400" />
                    <span className="font-semibold">{selectedUserName()}</span>
                  </div>
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 h-5 w-5 text-blue-400" />
                    <span>{format(new Date(date), "PPPP")}</span>
                  </div>
                </div>
                
                <h3 className="text-sm uppercase text-slate-400 font-semibold mb-3">Toggle Meal Attendance</h3>
                
                <div className="space-y-3">
                  {mealSessions.map((session) => (
                    <Button
                      key={session.name}
                      className={`w-full justify-start text-left p-4 h-auto transition-all duration-200 ${
                        session.selected 
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500" 
                          : "bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500"
                      }`}
                      variant="outline"
                      onClick={() => toggleMealSession(session.name)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          {session.icon}
                          <span>{session.name}</span>
                        </div>
                        {session.selected ? 
                          <CheckCircle className="h-5 w-5 text-green-400" /> : 
                          <XCircle className="h-5 w-5 text-red-400" />
                        }
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
              
              <DialogFooter className="sm:justify-center gap-3">
                <Button 
                  variant="outline"
                  className="text-white border-slate-600 hover:bg-slate-700"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={updateMealAttendance}
                  disabled={updating}
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealUpdatePopup;