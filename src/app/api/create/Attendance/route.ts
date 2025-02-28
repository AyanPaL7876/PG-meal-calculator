import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { markAttendance } from "@/services/attendanceService";

export async function POST(req: Request) {
  try {
    const { emails, session } = await req.json();

    // 🔹 Validate input
    if (!Array.isArray(emails) || emails.length === 0 || !session) {
      return NextResponse.json(
        { success: false, message: "Invalid input: Emails array and session are required" },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // 🔹 Fetch users by emails
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "in", emails));
    const userSnapshots = await getDocs(q);

    if (userSnapshots.empty) {
      return NextResponse.json(
        { success: false, message: "No users found for the given emails" },
        { status: 404 }
      );
    }

    let successCount = 0;
    let errors: string[] = [];

    for (const userDoc of userSnapshots.docs) {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const pgId = userData.pgId;

      if (!pgId) {
        errors.push(`User ${userData.email} is not assigned to any PG.`);
        continue;
      }

      if (!userId || !today || !session) {
        errors.push(`Invalid data for user: ${userData.email}`);
        continue;
      }

      try {
        // 🔹 Call markAttendance only with valid data
        await markAttendance(pgId, userId, today, [session]);
        successCount++;
      } catch (error) {
        console.error("Error marking attendance:", error);
        errors.push(`Failed to mark attendance for ${userData.email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: successCount > 0,
      message: `Successfully updated attendance for ${successCount} users.`,
      errors: errors.length > 0 ? errors : undefined,
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: (error as any).message },
      { status: 500 }
    );
  }
}
