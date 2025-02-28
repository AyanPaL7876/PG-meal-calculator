import { NextResponse } from "next/server";
import { addExpense } from "@/services/expenseService";

export async function POST(req: Request) {
  try {
    const { pgId, email, details, totalMoney } = await req.json();

    // Input validation
    if (!pgId || !email || !details || totalMoney === undefined) {
      return NextResponse.json(
        { success: false, message: "All fields are required." },
        { status: 400 }
      );
    }

    await addExpense(pgId, email, details, totalMoney);

    return NextResponse.json({
      success: true,
      message: "Expense added successfully!",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
