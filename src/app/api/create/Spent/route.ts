import { NextResponse } from "next/server";
import { addSpent } from "@/services/spentService"; 

export async function POST(req: Request) {
  try {
    const { pgId, userId, totalMoney } = await req.json();

    if (!pgId || !userId || !totalMoney || totalMoney <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid input data" },
        { status: 400 }
      );
    }

    await addSpent(pgId, userId, totalMoney);

    return NextResponse.json({ success: true, message: "Expense added successfully!" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: (error as Error).message },
      { status: 500 }
    );
  }
}
