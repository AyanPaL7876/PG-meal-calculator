import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const moveToPreviousMonth = async (pgId: string) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) return console.error("PG not found!");

    const pgData = pgSnap.data();
    const currentMonth = pgData.currentMonth;

    // Move current month to previous month and reset data
    await updateDoc(pgRef, {
      previousMonth: currentMonth,
      currentMonth: {
        month: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        attendanceSheet: [],
        expenseSheet: [],
        totalMeal: 0,
        totalExpenses: 0,
        mealCharge: 0,
        baseMeal: 0,
        extraMeal: 0,
        masiCharge: pgData.masiCharge,
        userSummaries: [],
      },
    });

    console.log("Month reset successfully!");
  } catch (error) {
    console.error("Error resetting month:", error);
  }
};
