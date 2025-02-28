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

    const expenseSheet = pgSnap.data()?.currentMonth?.expenseSheet || [];

    // Fetch user names for each expense
    const userNames: Record<string, string> = {};
    for (const expense of expenseSheet) {
      if (!userNames[expense.email]) {
        const userQuery = query(collection(db, "users"), where("email", "==", expense.email));
        const userSnap = await getDocs(userQuery);

        if (!userSnap.empty) {
          userNames[expense.email] = userSnap.docs[0].data().name;
        } else {
          userNames[expense.email] = "Unknown"; // Fallback if user not found
        }
      }
    }

    // Replace emails with names in the expense sheet
    const updatedExpenseSheet = expenseSheet.map((expense: any) => ({
      ...expense,
      name: userNames[expense.email] || "Unknown",
    }));

    // console.log(updatedExpenseSheet);
    return NextResponse.json({ success: true, expenseSheet: updatedExpenseSheet });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
