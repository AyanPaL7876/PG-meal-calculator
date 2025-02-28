import { NextResponse } from "next/server";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { pgId } = await req.json();
    if (!pgId) {
      return NextResponse.json({ success: false, message: "PG ID is required" }, { status: 400 });
    }

    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      return NextResponse.json({ success: false, message: "PG not found" }, { status: 404 });
    }

    const pgData = pgSnap.data();
    // Initialize currentMonth with default values if not exists
    const currentMonth = {
      attendanceSheet: [],
      expenseSheet: [],
      userSpent: [],
      masiCharge: 0,
      ...pgData.currentMonth
    };

    const users = pgData.users || [];
    const baseMealLimit = pgData.baseMeal || 0;
    // console.log("users : ", users); 
    // console.log("baseMealLimit : ", baseMealLimit);

    // Initialize counters
    let highestMeal = 0;
    let totalMeal = 0;
    let totalExpenses = 0;
    let extraMeal = 0;
    const userSummaries: any[] = [];

    // Calculate Total Meal & Highest Meal
    for (const user of users) {
      if (!user) continue; // Skip if user id is missing
      // console.log("user : ", user);
      
      const userAttendances = currentMonth.attendanceSheet
        .filter((att: { userId: string; sessions: any[] }) => att.userId === user)
        .reduce((total, att) => total + (att.sessions?.length || 0), 0);

      totalMeal += userAttendances;
      highestMeal = Math.max(highestMeal, userAttendances);
      // console.log("highestMeal : ", highestMeal,"\n totalMeal : ", totalMeal);
    }

    const baseMeal = highestMeal > 0 ? highestMeal * baseMealLimit : 0;
    // console.log("baseMeal : ", baseMeal);

    // Calculate Total Expenses safely 
    totalExpenses = currentMonth.expenseSheet.reduce((sum: number, exp: any) => {
      const amount = Number(exp?.totalMoney) || 0;
      return sum + amount;
    }, 0);
    // console.log("totalExpenses : ", totalExpenses);

    // Calculate Extra Meal
    for (const user of users) {
      if (!user?.id) continue;
      const userAttendances = currentMonth.attendanceSheet
        .filter((att: { userId: string; sessions: any[] }) => att.userId === user.id)
        .reduce((total, att) => total + (att.sessions?.length || 0), 0);
      if (userAttendances > 0 && userAttendances < baseMeal) {
        extraMeal += baseMeal - userAttendances;
      }
    }
    // console.log("extraMeal : ", extraMeal);

    // Calculate Meal Charge safely
    const mealCharge = totalMeal + extraMeal > 0 ? totalExpenses / (totalMeal + extraMeal) : 0;
    // console.log("mealCharge : ", mealCharge);

    // Generate User Summaries
    for (const user of users) {
      if (!user) continue;
      // console.log("user : ", user);

      const userAttendances = currentMonth.attendanceSheet
        .filter((att: { userId: string; sessions: any[] }) => att.userId === user)
        .reduce((total, att) => total + (att.sessions?.length || 0), 0);
      // console.log("userAttendances : ", userAttendances);

      const userSpent = currentMonth.spentSheet
        .filter((exp: any) => exp?.userId === user);
      // console.log("userSpent : ", userSpent);

      const totalAmount = userSpent.reduce((sum: number, exp: any) => {
        const amount = Number(exp?.totalMoney) || 0;
        return sum + amount;
      }, 0);
      // console.log("totalAmount : ", totalAmount);

      let userMeal = userAttendances >= baseMeal ? userAttendances : baseMeal;
      userMeal = userAttendances === 0 ? 0 : userMeal;
      // console.log("userMeal : ", userMeal);

      const khoroch = Number((userMeal * mealCharge).toFixed(2));
      const balanceWithoutMasi = Number((totalAmount - khoroch).toFixed(2));
      const balanceWithMasi = Number(
        userMeal > 0 
          ? (balanceWithoutMasi - (pgData.masiCharge || 0)).toFixed(2)
          : balanceWithoutMasi.toFixed(2)
      );
      // console.log("balanceWithMasi : ", balanceWithMasi,"\n balanceWithoutMasi : ", balanceWithoutMasi,"\n khoroch : ", khoroch);

      userSummaries.push({
        userId: user,
        userTotalMeal: userMeal,
        userSpentMoney: totalAmount,
        expense: khoroch,
        balance: balanceWithoutMasi,
        balanceWithMasi,
      });
    }

    const totalSpent = currentMonth.totalSpent;

    // console.log("Masi charge : ", pgData.masiCharge);

    // Prepare the update object with only defined values
    const updateObject = {
      currentMonth: {
        ...currentMonth,
        totalMeal,
        baseMeal,
        totalExpenses,
        totalSpent,
        extraMeal,
        mealCharge: Number(mealCharge.toFixed(2)),
        userSummaries,
      }
    };

    // Update Firestore
    await updateDoc(pgRef, updateObject);

    return NextResponse.json({
      success: true,
      userSummaries,
      totalMeal,
      totalExpenses,
      totalSpent,
      extraMeal,
      mealCharge: Number(mealCharge.toFixed(2)),
      pgBalance: Number((totalSpent - totalExpenses).toFixed(2))
    });

  } catch (error: any) {
    console.error("Error calculating meal summary:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    }, { status: 500 });
  }
}
