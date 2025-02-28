import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pgId = url.searchParams.get("pgId");

    if (!pgId) {
      return NextResponse.json({ success: false, message: "Missing PG ID" }, { status: 400 });
    }

    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      return NextResponse.json({ success: false, message: "PG not found" }, { status: 404 });
    }

    const currentData = pgSnap.data()?.currentMonth || {};
    const spentSheet = currentData.spentSheet || [];
    const totalSpent = currentData.totalSpent || 0;

    if (spentSheet.length === 0) {
      return NextResponse.json({ success: true, users: [], totalSpent });
    }

    // Fetch user details in one go
    const userIds = spentSheet.map((entry: any) => entry.userId);
    const usersQuery = query(collection(db, "users"), where("__name__", "in", userIds));
    const usersSnap = await getDocs(usersQuery);

    // Create a map of userId -> name
    const userMap: Record<string, string> = {};
    usersSnap.docs.forEach((doc) => {
      userMap[doc.id] = doc.data().name || "Unknown";
    });

    const userExpenses = spentSheet.map((entry: any) => ({
      name: userMap[entry.userId] || "Unknown",
      userId: entry.userId,
      total: entry.totalMoney,
      expenses: entry.details.map((detail: any) => ({
        date: detail.date,
        amount: detail.totalMoney,
      })),
    }));

    return NextResponse.json({ success: true, users: userExpenses, totalSpent });
  } catch (error) {
    console.error("Error fetching spent data:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
