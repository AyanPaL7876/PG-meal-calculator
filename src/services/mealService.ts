import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { mealData } from "@/types/pg";

export const markMeal = async (pgId: string, userId: string, date: string, newSession: string) => {
  if (!pgId || !userId || !date || !newSession) {
    throw new Error("Invalid meal data. Please provide pgId, userId, date, and session.");
  }

  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      throw new Error(`PG not found: ${pgId}`);
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    const user = userSnap.data();

    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    const pg = pgSnap.data();
    const mealSheet: mealData[] = pg?.currMonth?.mealSheet || [];
    const totalMeal = pg?.currMonth?.totalMeal || 0;
    let mealAdded = false;

    const existingEntryIndex = mealSheet.findIndex((entry) => entry.userId === userId);

    if (existingEntryIndex !== -1) {
      const existingEntry = mealSheet[existingEntryIndex];
      const dateIndex = existingEntry.details.findIndex((detail) => detail.date === date);

      if (dateIndex !== -1) {
        const existingSessions = existingEntry.details[dateIndex].sessions;
        if (!existingSessions.includes(newSession)) {
          existingSessions.push(newSession);
          mealAdded = true;
        }
      } else {
        existingEntry.details.push({ date, sessions: [newSession] });
        mealAdded = true;
      }

      mealSheet[existingEntryIndex] = existingEntry;
    } else {
      mealSheet.push({
        userId,
        userName: user.name,
        details: [{ date, sessions: [newSession] }],
        extra: 0,
      });
      mealAdded = true;
    }

    if (mealAdded) {
      pg.currMonth.totalMeal = totalMeal + 1;
      user.mealCount += 1;
    }

    await updateDoc(pgRef, { "currMonth.mealSheet": mealSheet, "currMonth.totalMeal": pg.currMonth.totalMeal });
    await updateDoc(userRef, { mealCount: user.mealCount });

    console.log("✅ Meal marked successfully!");
    return { success: true, message: "Meal marked successfully!" };
  } catch (error) {
    console.error("❌ Error marking meal:", error);
    return { success: false, message: "Failed to mark meal" };
  }
};

export const getMealSheet = async (pgId: string, currMonth: boolean) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      throw new Error(`PG not found: ${pgId}`);
    }

    const pg = pgSnap.data();
    let mealSheet: mealData[];
    if(currMonth) {
      mealSheet = pg?.currMonth?.mealSheet || [];
    }else {
      mealSheet = pg?.prevMonth?.mealSheet || [];
    }
    return mealSheet;
  } catch (error) {
    console.error("❌ Error fetching meal sheet:", error);
    return null;
  }
}

export const getUserMeals = async (pgId: string, userId: string) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      throw new Error(`PG not found: ${pgId}`);
    }

    const pg = pgSnap.data();
    const mealSheet: mealData[] = pg?.currMonth?.mealSheet || [];
    const userMeals = mealSheet.find((entry) => entry.userId === userId);
    console.log("🍽️ User Meals:", userMeals);
    return userMeals;
  } catch (error) {
    console.error("❌ Error fetching user meals:", error);
    return null;
  }
}
