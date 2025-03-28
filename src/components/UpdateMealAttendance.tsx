"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingScreen from "@/components/Loading";
import { toast } from "react-hot-toast";
import { usePg } from "@/context/PgContext";
import { getMealSheet, markMeal, removeMealMark } from "@/services/mealService";
import { MealSheetEntry } from "@/types/pg";
import { StoreUser } from "@/types/User";
import { createOrUpdateSummary } from "@/services/summaryServices";

interface UserWithMealStatus extends StoreUser {
  selectedForMeal: boolean;
}

const UpdateMealAttendance = () => {
  const { user } = useAuth();
  const pgId = user?.pgId;
  const { pg, users } = usePg();
  const [session, setSession] = useState<string>("Select session");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState<boolean>(false);
  const [update, setUpdate] = useState<boolean>(false);
  const [userMealStatuses, setUserMealStatuses] = useState<UserWithMealStatus[]>([]);
  const [dataFetched, setDataFetched] = useState<boolean>(false);

  // Memoized fetch meal data function to prevent unnecessary re-renders
  const fetchMealData = useCallback(async () => {
    // Validate PG, date, and session selection
    if (!pgId) {
      toast.error("Please select a PG");
      return;
    }

    if (session === "Select session") {
      toast.error("Please select a meal session");
      return;
    }

    setLoading(true);
    try {
      // Fetch meal sheet
      const mealSheet = await getMealSheet(pgId, true);
      
      // Prepare user statuses based on existing meal data
      const preparedUserStatuses: UserWithMealStatus[] = users.map(user => {
        // Safely find user's meal entry
        const userMeal = mealSheet?.find((meal: MealSheetEntry) => meal.userId === user.uid);
        
        // Check if the user has a meal marked for the selected date and session
        const isMarked = userMeal?.details.some(
          detail => detail.date === date && detail.sessions.includes(session)
        ) || false;

        return {
          ...user,
          selectedForMeal: isMarked
        };
      });

      setUserMealStatuses(preparedUserStatuses);
      setDataFetched(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching meal data:", error);
      toast.error("Failed to fetch meal data");
      setLoading(false);
    }
  }, [pgId, session, date, users]);

  // Toggle meal status for a specific user
  const toggleUserMeal = useCallback((userId: string) => {
    setUserMealStatuses(prev => 
      prev.map(user => 
        user.uid === userId 
          ? { ...user, selectedForMeal: !user.selectedForMeal } 
          : user
      )
    );
  }, []);

  // Submit updated meal attendance
  const submitAttendance = useCallback(async () => {
    if (!pgId) {
      toast.error("Please select a PG");
      return;
    }

    if (session === "Select session") {
      toast.error("Please select a session");
      return;
    }

    setUpdate(true);
    const selectedUsers = userMealStatuses.filter(u => u.selectedForMeal);
    
    if (selectedUsers.length === 0) {
      markAllOff();
      toast.error(`marked off all users`);
      return;
    }

    try {
      await markAllOff();
      for (const user of selectedUsers) {
        const res = await markMeal(pgId, user.uid, date, session);
        if (res.success) {
          console.log(`${user.name}'s meal updated successfully`);
        } else {
          toast.error(`Failed to update ${user.name}'s meal`);
        }
      }
      toast.success(`update successfully`);
      // Refresh data after submission
      await createOrUpdateSummary(pgId);
      fetchMealData();
      setUpdate(false);
    } catch (error) {
      console.error("Error submitting meals:", error);
      toast.error("Failed to submit meal attendance");
    }
  }, [pgId, session, date, users, userMealStatuses, fetchMealData]);

  // mark all off
  const markAllOff = async() =>{
    for(const user of users){
      const res = await removeMealMark(pgId as string, user.uid, date, session);
      if (res.success) {
        console.log(`${user.name}'s meal updated successfully`);
      } else {
        toast.error(`Failed to update ${user.name}'s meal`);
      }
    }
    toast.success(`off successfully`);
  }

  // Reset form
  const resetForm = useCallback(() => {
    setSession("Select session");
    setDate(new Date().toISOString().split("T")[0]);
    setUserMealStatuses([]);
    setDataFetched(false);
  }, []);

  // Render
  if (user?.role !== "admin") return <div>Access Denied</div>;

  return (
    <div className="p-8 min-h-screen bg-gray-900 max-w-6xl mx-auto">
      <Card className="bg-slate-700/10 text-white mt-20">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-white">
            Update Meal Attendance ({pg?.name?.toUpperCase() || 'NO PG SELECTED'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex flex-col md:flex-row justify-center items-center gap-5 mb-6">
            {/* Session Selector */}
            <Select 
              onValueChange={setSession} 
              value={session}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Breakfast">Breakfast</SelectItem>
                <SelectItem value="Lunch">Lunch</SelectItem>
                <SelectItem value="Dinner">Dinner</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Picker */}
            <input
              type="date"
              className="w-52 p-2 bg-slate-700 text-white rounded text-sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />

            {/* Fetch Data Button */}
            <Button 
              onClick={fetchMealData}
              className="bg-green-500 hover:bg-green-600"
            >
              Fetch Meal Data
            </Button>

            {/* all not marked Button */}
            {dataFetched && (
              <Button 
                variant="outline" 
                className="bg-red-500 hover:bg-red-600"
                onClick={() => setUserMealStatuses(users.map(user => ({ ...user, selectedForMeal: false })))}
              >
                All Not Marked
              </Button>
            )}
            
            <Button 
              variant="outline" 
              className="text-white border-white bg-transparent hover:bg-slate-700"
              onClick={resetForm}
            >
              Reset
            </Button>
          </div>

          {/* Loading State */}
          {loading && <LoadingScreen message="Fetching meal data..." />}

          {/* Meal Data Table */}
          {dataFetched && !loading && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Total Meals</TableHead>
                    <TableHead>Meal Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userMealStatuses.map((user) => (
                    <TableRow key={user.uid}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.mealCount || 0}</TableCell>
                      <TableCell>
                        <Button
                          className={`${
                            user.selectedForMeal 
                              ? "bg-green-500 hover:bg-green-600" 
                              : "bg-red-500 hover:bg-red-600"
                          }`}
                          onClick={() => toggleUserMeal(user.uid)}
                        >
                          {user.selectedForMeal ? "Marked" : "Not Marked"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Submit Button */}
              <div className="text-center mt-6">
                <Button 
                  className="bg-blue-500 hover:bg-blue-700"
                  onClick={submitAttendance}
                >
                  {update ? "Updating..." : "Submit Attendance"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpdateMealAttendance;