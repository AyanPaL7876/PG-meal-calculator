"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingScreen from "@/components/Loading";
import { toast } from "react-hot-toast";
import { usePg } from "@/context/PgContext";
import { getMealSheet, markMeal, removeMealMark } from "@/services/mealService";
import { UserMealStatus } from "@/types/pg";


const UpdateMealAttendance = () => {
  const { user } = useAuth();
  const pgId = user?.pgId;
  const { pg, users } = usePg();
  const [session, setSession] = useState<string>("Select session");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [userMealStatuses, setUserMealStatuses] = useState<UserMealStatus[]>([]);
  // const [existingMeals, setExistingMeals] = useState<mealData[]>([]);
  const [dataFetched, setDataFetched] = useState(false);

  // Fetch meal data when date and session are selected
  const fetchMealData = async () => {
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
      const preparedUserStatuses = users.map(user => {
        // Check if this user has a meal marked for the selected date and session
        const userMeal = mealSheet.find(meal => meal.userId === user.uid);
        const isMarked = userMeal?.details.some(
          detail => detail.date === date && detail.sessions.includes(session)
        );

        return {
          ...user,
          selectedForMeal: isMarked
        };
      });

      // setExistingMeals(mealSheet);
      setUserMealStatuses(preparedUserStatuses);
      setDataFetched(true);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching meal data:", error);
      toast.error("Failed to fetch meal data");
      setLoading(false);
    }
  };

  // Toggle meal status for a specific user
  const toggleUserMeal = (userId: string) => {
    setUserMealStatuses(prev => 
      prev.map(user => 
        user.uid === userId 
          ? { ...user, selectedForMeal: !user.selectedForMeal } 
          : user
      )
    );
  };

  // Submit updated meal attendance
  const submitAttendance = async () => {
    if (!pgId) {
      toast.error("Please select a PG");
      return;
    }

    if (session === "Select session") {
      toast.error("Please select a session");
      return;
    }

    const selectedUsers = userMealStatuses.filter(u => u.selectedForMeal);
    
    if (selectedUsers.length === 0) {
      console.log(users);
      for(const user of users){
        const res = await removeMealMark(pgId, user.uid, date, session);
        if (res.success) {
          toast.success(`${user.name}'s meal updated successfully`);
        } else {
          toast.error(`Failed to update ${user.name}'s meal`);
        }
      }
      toast.error("No users selected");
      return;
    }

    try {
      for (const user of selectedUsers) {
        const res = await markMeal(pgId, user.uid, date, session);
        if (res.success) {
          toast.success(`${user.name}'s meal updated successfully`);
        } else {
          toast.error(`Failed to update ${user.name}'s meal`);
        }
      }
      // Refresh data after submission
      fetchMealData();
    } catch (error) {
      console.error("Error submitting meals:", error);
      toast.error("Failed to submit meal attendance");
    }
  };

  // Reset form
  const resetForm = () => {
    setSession("Select session");
    setDate(new Date().toISOString().split("T")[0]);
    setUserMealStatuses([]);
    setDataFetched(false);
  };

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
                      <TableCell>{user.mealCount}</TableCell>
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
                  Submit Attendance
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