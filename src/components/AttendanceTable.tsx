"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "./ui/skeleton";
import { toast } from "react-hot-toast";

const AttendanceTable = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<Record<string, Record<string, string[]>>>({});
  const [mealCount, setMealCount] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.pgId) return;

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/get/attendance?pgId=${user.pgId}`);
        const data = await res.json();

        if (data.success) {
          setAttendance(data.userAttendance);
          setMealCount(data.mealCount);
        } else {
          toast.error(data.message || "Failed to fetch attendance");
        }
      } catch (error) {
        console.error("Error fetching attendance:", error);
        toast.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user?.pgId]);

  const allDates = new Set<string>();
  Object.values(attendance).forEach((records) => {
    Object.keys(records).forEach((date) => allDates.add(date));
  });
  const sortedDates = Array.from(allDates).sort();

  const filteredUsers = Object.keys(attendance).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card className="bg-gray-900/95 border-gray-700 text-gray-100 shadow-xl">
      <CardHeader className="border-b border-gray-700/50">
        <CardTitle className="text-2xl font-bold text-center text-blue-200">
          Attendance Records
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <Input
            type="text"
            placeholder="Search by Name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-400"
          />

          <div className="overflow-x-auto rounded-lg border border-gray-700">
            {loading ? (
              <div className="space-y-3 p-4">
                <Skeleton className="h-8 w-full bg-gray-800" />
                <Skeleton className="h-12 w-full bg-gray-800" />
                <Skeleton className="h-12 w-full bg-gray-800" />
                <Skeleton className="h-12 w-full bg-gray-800" />
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-gray-800">
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300 font-semibold">Name</TableHead>
                    {sortedDates.map((date) => (
                      <TableHead key={date} className="text-gray-300 font-semibold">
                        {date}
                      </TableHead>
                    ))}
                    <TableHead className="text-gray-300 font-semibold text-right">
                      Total Meals
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((name) => (
                      <TableRow 
                        key={name}
                        className="border-gray-700/50 hover:bg-gray-800/50 transition-colors"
                      >
                        <TableCell className="font-medium text-gray-200">
                          {name}
                        </TableCell>
                        {sortedDates.map((date) => (
                          <TableCell 
                            key={date}
                            className="text-gray-300"
                          >
                            {attendance[name][date]?.join(", ") || "—"}
                          </TableCell>
                        ))}
                        <TableCell className="font-bold text-right text-blue-400">
                          {mealCount[name]}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={sortedDates.length + 2} 
                        className="text-center text-gray-400 py-8"
                      >
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {!loading && filteredUsers.length > 0 && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gray-800 rounded-lg p-4 text-center space-y-2">
                <p className="text-sm text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-100">
                  {filteredUsers.length}
                </p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center space-y-2">
                <p className="text-sm text-gray-400">Total Days</p>
                <p className="text-2xl font-bold text-gray-100">
                  {sortedDates.length}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTable;
