import { db } from "../firebase";
import { doc, updateDoc, arrayUnion, getDoc, deleteDoc } from "firebase/firestore";

export const addExpense = async (pgId: string, email: string, details: string, totalMoney: number) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    await updateDoc(pgRef, {
      "currentMonth.expenseSheet": arrayUnion({
        date: new Date().toISOString(),
        email,
        details,
        totalMoney,
      }),
    });
    console.log("Expense added successfully!");
  } catch (error) {
    console.error("Error adding expense:", error);
  }
};

interface Expense {
  date: string;
  email: string;
  details: string;
  totalMoney: number;
}

export const deleteExpense = async (pgId: string, date: string) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnapshot = await getDoc(pgRef);

    if (!pgSnapshot.exists()) {
      console.error("PG not found");
      return { success: false, message: "PG not found" };
    }

    const currentExpenses = pgSnapshot.data()?.currentMonth?.expenseSheet || [];
    const expenseToDelete = currentExpenses.find((exp: Expense) => exp.date === date);
    
    if (!expenseToDelete) {
      return { success: false, message: "Expense not found" };
    }

    const updatedExpenses = currentExpenses.filter((exp: Expense) => exp.date !== date);
    const totalExpense = pgSnapshot.data()?.currentMonth?.totalExpense || 0;

    await updateDoc(pgRef, {
      "currentMonth.expenseSheet": updatedExpenses,
      "currentMonth.totalExpense": totalExpense - expenseToDelete.totalMoney,
    });

    console.log("Expense deleted successfully!");
    return { success: true, message: "Expense deleted successfully" };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { success: false, message: "Failed to delete expense" };
  }
};
