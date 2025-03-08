import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { spent } from "@/types/pg";

// Add Expense
export const addSpent = async (pgId: string, userId: string, money: number) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("❌ PG document not found!");
      return;
    }

    const pg = pgSnap.data();
    const spentSheet: spent[] = pg?.currMonth?.spentSheet ?? [];
    const totalSpent = pg?.currMonth?.totalSpent ?? 0;

    const userIndex = spentSheet.findIndex((entry) => entry.userId === userId);

    if (userIndex !== -1) {
      // Update existing user
      spentSheet[userIndex].totalMoney = (spentSheet[userIndex].totalMoney ?? 0) + money;
      spentSheet[userIndex].details.push({
        date: new Date().toISOString(),
        money
      });
    } else {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      // Add new user entry
      spentSheet.push({ 
        userId,
        userName: userData?.name ?? "not Found",
        totalMoney: money,
        details: [{ date: new Date().toISOString(), money}],
      });
    }

    // Update Firestore
    await updateDoc(pgRef, {
      "currMonth.spentSheet": spentSheet,
      "currMonth.totalSpent": totalSpent + money,
    });

    console.log("✅ Expense added successfully!");
  } catch (error) {
    console.error("❌ Error adding expense:", error);
  }
};

export const getSpentSheet = async (pgId: string, currMonth: boolean) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("❌ PG document not found!");
      return null;
    }
    let spentSheet: spent[];

    if(currMonth){
      spentSheet= pgSnap.data()?.currMonth?.spentSheet ?? [];
    }else{
      spentSheet= pgSnap.data()?.PrevMonth?.spentSheet ?? [];
    }

    return spentSheet;
  } catch (error) {
    console.error("❌ Error fetching spent sheet:", error);
    return null;
  }
}

// Delete Expense
export const deleteSpentDetails = async (
  pgId: string,
  userId: string,
  date: string
): Promise<boolean> => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("❌ PG document not found!");
      return false;
    }

    const pg = pgSnap.data();
    const spentSheet: spent[] = pg?.currMonth?.spentSheet ?? [];
    const totalSpent = pg?.currMonth?.totalSpent ?? 0;

    const userIndex = spentSheet.findIndex((entry) => entry.userId === userId);

    if (userIndex === -1) {
      console.error("❌ User not found in spent sheet!");
      return false;
    }

    const user = spentSheet[userIndex];
    const detailIndex = user.details.findIndex((detail) => detail.date === date);

    if (detailIndex === -1) {
      console.error("❌ Expense detail not found!");
      return false;
    }

    const amountToSubtract = user.details[detailIndex].money;
    user.details.splice(detailIndex, 1);
    user.totalMoney -= amountToSubtract;

    if (user.details.length === 0) {
      spentSheet.splice(userIndex, 1);
    } else {
      spentSheet[userIndex] = user;
    }

    // Update Firestore
    await updateDoc(pgRef, {
      "currMonth.spentSheet": spentSheet,
      "currMonth.totalSpent": totalSpent - amountToSubtract,
    });

    console.log("✅ Expense detail deleted successfully!");
    return true;
  } catch (error) {
    console.error("❌ Error deleting expense detail:", error);
    return false;
  }
};
