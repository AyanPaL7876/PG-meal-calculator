import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pgId = url.searchParams.get("pgId");

    if (!pgId) {
      return NextResponse.json({ success: false, message: "Missing PG ID" }, { status: 400 });
    }

    // 🔹 Fetch PG Attendance
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      return NextResponse.json({ success: false, message: "PG not found" }, { status: 404 });
    }

    const attendanceSheet = pgSnap.data()?.currentMonth?.attendanceSheet || [];

    // 🔹 Fetch All Users and Map userId -> userName
    const usersRef = collection(db, "users");
    const usersSnap = await getDocs(usersRef);
    const usersData: Record<string, string> = {};

    usersSnap.forEach((doc) => {
      usersData[doc.id] = doc.data().name;
    });

    // 🔹 Convert userId to userName and count meals
    const userAttendance: Record<string, Record<string, string[]>> = {};
    const mealCount: Record<string, number> = {};

    attendanceSheet.forEach((entry: any) => {
      const userName = usersData[entry.userId] || "Unknown";
      if (!userAttendance[userName]) userAttendance[userName] = {};
      if (!mealCount[userName]) mealCount[userName] = 0;

      if (!userAttendance[userName][entry.date]) {
        userAttendance[userName][entry.date] = [];
      }

      userAttendance[userName][entry.date].push(...entry.sessions);
      mealCount[userName] += entry.sessions.length;
    });

    return NextResponse.json({ success: true, userAttendance, mealCount });
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
