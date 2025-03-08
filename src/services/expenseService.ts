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
      const currentExpense = pgData?.currMonth?.totalExpense || 0; // Get the current totalExpense or default to 0

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if(!userSnap.exists()) {
          return { success: false, message: "User not found" };
      }
      const userData = userSnap.data();
      await updateDoc(pgRef, {
          "currMonth.expenseSheet": arrayUnion({
              date: new Date().toISOString(),
              userId,
              userName : userData.name,
              details,
              totalMoney,
          }),
          "currMonth.totalExpense": currentExpense + totalMoney, // Add new expense to the existing total
      });

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
            expenses = pgSnapshot.data()?.PrevMonth?.expenseSheet || [];
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

        const currentExpenses = pgSnapshot.data()?.currMonth?.expenseSheet || [];
        const expenseToDelete = currentExpenses.find((exp: Expense) => exp.date === date);

        if (!expenseToDelete) {
            return { success: false, message: "Expense not found" };
        }

        const updatedExpenses = currentExpenses.filter((exp: Expense) => exp.date !== date);
        const totalExpense = pgSnapshot.data()?.currMonth?.totalExpense || 0;

        await updateDoc(pgRef, {
            "currMonth.expenseSheet": updatedExpenses,
            "currMonth.totalExpense": totalExpense - expenseToDelete.totalMoney,
        });

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

        const expenses = pgSnapshot.data()?.currMonth?.expenseSheet || [];
        const userExpenses = expenses.filter((exp: Expense) => exp.userId === userId);
        return userExpenses;
    } catch (error) {
        console.error("Error fetching user expenses:", error);
        return null;
    }
}