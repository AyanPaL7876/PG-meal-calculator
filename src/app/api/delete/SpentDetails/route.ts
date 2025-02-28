import { NextResponse } from "next/server";
import { deleteSpentDetails } from "@/services/spentService";

export async function POST(req: Request) {
  try {
      const { pgId, userId, date } = await req.json();
      console.log("delete spent details API called");
      console.log(pgId, userId, date);
      
      // Validate required fields
      if (!pgId || !userId || !date) {
        console.log("missing required fields");
          return NextResponse.json(
              { success: false, message: "Missing required fields" },
              { status: 400 }
            );
        }
        
    // Call the deleteSpentDetails service
    const success = await deleteSpentDetails(pgId, userId, date);

    if (success) {
      return NextResponse.json(
        { success: true, message: "Expense detail deleted successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Failed to delete expense detail" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in delete spent details API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
} 