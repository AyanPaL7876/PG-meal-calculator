"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingScreen from "@/components/Loading";
import { StoreUser } from "@/types/User";
import { toast } from "react-hot-toast";
import { getPGusers } from "@/services/pgService";
import { markMeal } from "@/services/mealService";

const TakeAttendance = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [session, setSession] = useState<string>("Select session");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [mealmarking, setMealMarking] = useState(false);


  useEffect(() => {
    if (!user?.pgId) return;

    const fetchUsers = async () => {
      try {
        const usersData = await getPGusers(user?.pgId as string);
        console.log("usersData", usersData);

        if (usersData && usersData.length > 0) {
          setUsers(usersData);
        } else {
          toast.error("Users Not Found.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      }
    };

    fetchUsers();
    setIsAdmin(user?.role === "admin");
    setLoading(false);
  }, [user]);

  const toggleAttendance = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.uid === id ? { ...u, mealStatus: !u.mealStatus } : u)));
  };

  const submitAttendance = async () => {
    if (!isAdmin) return;
    if (session === "Select session") {
      toast.error("Please select a session.");
      return;
    }
    setMealMarking(true);

    const selectedUsers = users.filter((u) => u.mealStatus);
    if (selectedUsers.length === 0) return alert("No users selected");

    for(const user of selectedUsers){
      const res = await markMeal(user.pgId as string, user.uid, date, session);
      if(res.success){
        toast.success(`${user.name}'s Meal marked successfully!`);
      }else{
        alert(`${user.name}'s Failed to mark meal`);
      }
    }
    setMealMarking(false);
}

  if (loading || user?.role !== "admin") return <LoadingScreen message="Loading data..." />;

  return (
    <div className="p-8 min-h-screen bg-gray-900 max-w-6xl mx-auto">
      <Card className="bg-slate-700/10 text-white mt-20">
        <CardHeader>
          <CardTitle className="text-center text-3xl font-bold text-white">Attendance Sheet</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="w-80 flex flex-col md:flex-row justify-evenly items-center gap-5 mb-6">
              <Select onValueChange={setSession} defaultValue={session}>
                <SelectTrigger>
                  <SelectValue>{session}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Breakfast">Breakfast</SelectItem>
                  <SelectItem value="Lunch">Lunch</SelectItem>
                  <SelectItem value="Dinner">Dinner</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="date"
                className="w-52 p-1 bg-slate-700 text-white rounded text-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Total meal</TableHead>
                <TableHead>Meal Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.uid}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.mealCount}</TableCell>
                    <TableCell>
                      <Button className={`bg-${u.mealStatus ? "green-500" : "red-500"}`} onClick={() => toggleAttendance(u.uid)}>
                        {u.mealStatus ? "On" : "Off"}
                      </Button>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

            <div className="text-center mt-6">
              <Button className="bg-blue-500 hover:bg-blue-700" onClick={submitAttendance}>
                {mealmarking ? "Marking Meals..." : "Submit Attendance"}
              </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TakeAttendance;