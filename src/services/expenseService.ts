import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { Expense } from "@/types/pg";
import { createOrUpdateSummary } from "./summaryServices";

export const addExpense = async (pgId: string, userId: string, details: string, totalMoney: number) => {
  try {
      const pgRef = doc(db, "pgs", pgId);
      const pgSnap = await getDoc(pgRef);

      if (!pgSnap.exists()) {
          return { success: false, message: "PG not found" };
      }

      const pgData = pgSnap.data();
      
      // Check if currMonth exists in pgData
      if (!pgData.currMonth) {
          return { success: false, message: "Current month data not initialized" };
      }
      
      const currentExpense = pgData.currMonth.totalExpense || 0; // Get the current totalExpense or default to 0

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if(!userSnap.exists()) {
          return { success: false, message: "User not found" };
      }
      const userData = userSnap.data();
      
      // Create new expense object
      const newExpense = {
          date: new Date().toISOString(),
          userId,
          userName: userData.name,
          details,
          totalMoney,
      };
      
      // Check if expenseSheet array exists and handle appropriately
      if (Array.isArray(pgData.currMonth.expenseSheet)) {
          await updateDoc(pgRef, {
              "currMonth.expenseSheet": arrayUnion(newExpense),
              "currMonth.totalExpense": currentExpense + totalMoney,
          });
      } else {
          // If expenseSheet doesn't exist or isn't an array, create a new array
          await updateDoc(pgRef, {
              "currMonth.expenseSheet": [newExpense],
              "currMonth.totalExpense": currentExpense + totalMoney,
          });
      }

      await createOrUpdateSummary(pgId);

      console.log("✅ Expense added successfully!");
      return { success: true, message: "Expense added successfully" };
  } catch (error) {
      console.error("❌ Error adding expense:", error);
      return { success: false, message: "Failed to add expense" };
  }
};

export const getExpenses = async (pgId: string, currMonth: boolean) => {
    try {
        const pgRef = doc(db, "pgs", pgId);
        const pgSnapshot = await getDoc(pgRef);

        if (!pgSnapshot.exists()) {
            console.error("PG not found");
            return null;
        }

        let expenses: Expense[] = [];
        if(currMonth) {
            expenses = pgSnapshot.data()?.currMonth?.expenseSheet || [];
        } else {
            expenses = pgSnapshot.data()?.prevMonth?.expenseSheet || [];
        }
        return expenses;
    } catch (error) {
        console.error("Error fetching expenses:", error);
        return null;
    }
}

export const deleteExpense = async (pgId: string, date: string) => {
    try {
        const pgRef = doc(db, "pgs", pgId);
        const pgSnapshot = await getDoc(pgRef);

        if (!pgSnapshot.exists()) {
            console.error("PG not found");
            return { success: false, message: "PG not found" };
        }

        const pgData = pgSnapshot.data();
        if (!pgData.currMonth || !Array.isArray(pgData.currMonth.expenseSheet)) {
            return { success: false, message: "No expense data found" };
        }

        const currentExpenses = pgData.currMonth.expenseSheet;
        const expenseToDelete = currentExpenses.find((exp: Expense) => exp.date === date);

        if (!expenseToDelete) {
            return { success: false, message: "Expense not found" };
        }

        const updatedExpenses = currentExpenses.filter((exp: Expense) => exp.date !== date);
        const totalExpense = pgData.currMonth.totalExpense || 0;

        await updateDoc(pgRef, {
            "currMonth.expenseSheet": updatedExpenses,
            "currMonth.totalExpense": totalExpense - expenseToDelete.totalMoney,
        });

        await createOrUpdateSummary(pgId);
        console.log("Expense deleted successfully!");
        return { success: true, message: "Expense deleted successfully" };
    } catch (error) {
        console.error("Error deleting expense:", error);
        return { success: false, message: "Failed to delete expense" };
    }
};

export const getUserExpenses= async (pgId: string, userId: string) => {
    try {
        const pgRef = doc(db, "pgs", pgId);
        const pgSnapshot = await getDoc(pgRef);

        if (!pgSnapshot.exists()) {
            console.error("PG not found");
            return null;
        }

        const pgData = pgSnapshot.data();
        if (!pgData.currMonth || !Array.isArray(pgData.currMonth.expenseSheet)) {
            return [];
        }

        const expenses = pgData.currMonth.expenseSheet;
        const userExpenses = expenses.filter((exp: Expense) => exp.userId === userId);
        return userExpenses;
    } catch (error) {
        console.error("Error fetching user expenses:", error);
        return null;
    }
}