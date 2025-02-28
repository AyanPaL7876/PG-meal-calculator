import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const markAttendance = async (pgId: string, userId: string, date: string, newSessions: string[]) => {
  if (!pgId || !userId || !date || !newSessions.length) {
    throw new Error("Invalid attendance data. Please provide pgId, userId, date, and sessions.");
  }

  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      throw new Error(`PG not found: ${pgId}`);
    }

    const attendanceSheet = pgSnap.data()?.currentMonth?.attendanceSheet || [];

    // 🔹 Find existing attendance entry
    const existingEntryIndex = attendanceSheet.findIndex(
      (entry: any) => entry.userId === userId && entry.date === date
    );

    if (existingEntryIndex !== -1) {
      // 🔹 Update sessions if needed
      const existingEntry = attendanceSheet[existingEntryIndex];
      const updatedSessions = Array.from(new Set([...existingEntry.sessions, ...newSessions]));

      if (updatedSessions.length === existingEntry.sessions.length) {
        console.log("✅ No changes needed, all sessions already exist.");
        return;
      }

      // 🔹 Replace the old entry with the updated one
      attendanceSheet[existingEntryIndex] = { ...existingEntry, sessions: updatedSessions };
    } else {
      // 🔹 Add a new attendance entry
      attendanceSheet.push({ userId, date, sessions: newSessions });
    }

    // 🔹 Update Firestore document
    await updateDoc(pgRef, { "currentMonth.attendanceSheet": attendanceSheet });
    console.log("✅ Attendance updated successfully!");
  } catch (error) {
    console.error("❌ Error updating attendance:", error);
    throw error;
  }
};
