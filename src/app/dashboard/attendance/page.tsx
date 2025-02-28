"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import LoadingScreen from "@/components/Loading";

interface User {
  id: string;
  name: string;
  email: string;
  mealStatus: boolean;
  pgId: string;
  role: string;
}

interface PG {
  id: string;
  pgName: string;
}

interface Response {
  status: number;
  message: string;
  errors: string;
}


const Attendance = () => {
  const { user } = useAuth();
  const [pg, setPg] = useState<PG | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [session, setSession] = useState<string>("Breakfast");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    const fetchPGAndUsers = async () => {
      if (!user?.pgId) return;
  
      try {
        console.log("Fetching PG for:", user.pgId);
  
        // Fetch PG
        const pgRef = doc(db, "pgs", user.pgId);
        const pgSnap = await getDoc(pgRef);
  
        if (!pgSnap.exists()) {
          console.error("PG not found or insufficient permissions.");
          return;
        }
  
        const pgData = { id: pgSnap.id, ...pgSnap.data() } as PG;
        console.log("PG Data:", pgData);
        setPg(pgData);
  
        // Fetch Users
        console.log("Fetching Users for PG:", user.pgId);
        const usersRef = collection(db, "users");
        console.log("usersRef", usersRef);
        const q = query(usersRef, where("pgId", "==", user.pgId));
        console.log("Query:", q);
        const snapshot = await getDocs(q);
        console.log("Snapshot:", snapshot);
  
        if (snapshot.empty) {
          console.warn("No users found or insufficient permissions.");
        }
  
        const userList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
  
        console.log("Fetched Users:", userList);
        setUsers(userList);
  
        // Check Admin Role
        const loggedInUser = userList.find((u) => u.id === user.uid);
        setIsAdmin(loggedInUser?.role === "admin");
  
      } catch (error) {
        console.error("Error fetching PG or users:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchPGAndUsers();
  }, [user?.pgId]);
  

  const toggleAttendance = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, mealStatus: !u.mealStatus } : u))
    );
  };

  const submitAttendance = async () => {
    if (!isAdmin) return;

    const selectedUsers = users.filter((u) => u.mealStatus);
    if (selectedUsers.length === 0) {
      alert("No users selected");
      return;
    }

    const emails = selectedUsers.map((u) => u.email);
    console.log("Selected Users:", emails);
    console.log("Session:", session);

    const response = await fetch("/api/create/Attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails, session, pgId: user?.pgId }),
    });

    const responseData: Response = await response.json();
    console.log("Attendance Response:", responseData.message);
    console.log("Attendance Errors:", responseData.errors);
    alert("Attendance submitted!");
  };

  if (loading) {
    return <LoadingScreen message="Loading PG and users data..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4">
      <Card className="max-w-4xl mx-auto shadow-xl border border-gray-700/50 bg-gray-800/50 backdrop-blur-sm">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 rounded-t-lg border-b border-gray-700/50">
          <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Attendance Sheet
          </h1>
          
          {pg ? (
            <h2 className="text-xl font-semibold mt-2 text-center text-gray-400">
              PG Name: <span className="text-blue-400">{pg.pgName}</span>
            </h2>
          ) : (
            <p className="text-center animate-pulse">Loading PG...</p>
          )}
        </div>

        <div className="p-6 space-y-6">
          {isAdmin && (
            <div className="flex items-center gap-3 bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
              <label className="font-semibold text-gray-300">Select Session:</label>
              <Select value={session} onValueChange={setSession}>
                <SelectTrigger className="border-gray-600 bg-gray-700/50 text-gray-200 hover:bg-gray-700 transition-colors">
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="breakfast" className="text-gray-200 focus:bg-gray-700">Breakfast</SelectItem>
                  <SelectItem value="lunch" className="text-gray-200 focus:bg-gray-700">Lunch</SelectItem>
                  <SelectItem value="dinner" className="text-gray-200 focus:bg-gray-700">Dinner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="rounded-lg border border-gray-700/50 overflow-hidden">
            <Table className="w-full text-sm">
              <TableHeader>
                <TableRow className="bg-gray-800/80 border-b border-gray-700/50">
                  <TableHead className="text-left p-4 text-gray-300 font-semibold">Name</TableHead>
                  <TableHead className="text-left p-4 hidden sm:table-cell text-gray-300 font-semibold">Email</TableHead>
                  {isAdmin && <TableHead className="text-center p-4 text-gray-300 font-semibold">Meal Status</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center p-8 text-gray-400">
                      No users found in this PG.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow 
                      key={u.id} 
                      className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors"
                    >
                      <TableCell className="p-4 text-gray-200">{u.name}</TableCell>
                      <TableCell className="p-4 hidden sm:table-cell text-gray-400">{u.email}</TableCell>
                      {isAdmin && (
                        <TableCell className="p-4 text-center">
                          <Button
                            variant={u.mealStatus ? "default" : "secondary"}
                            className={`transition-all duration-200 px-6 ${
                              u.mealStatus 
                                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700" 
                                : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                            }`}
                            onClick={() => toggleAttendance(u.id)}
                          >
                            {u.mealStatus ? "On" : "Off"}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {isAdmin && (
            <div className="flex justify-center pt-4">
              <Button 
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-200"
                onClick={submitAttendance}
              >
                Submit Attendance
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
