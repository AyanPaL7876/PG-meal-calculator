import { toast } from "react-hot-toast";

export const fetchExpenses = async (pgId: string) => {
  try {
    const res = await fetch(`/api/get/expenses?pgId=${pgId}`);
    const data = await res.json();
    if (data.success) return data.expenseSheet;
    toast.error(data.message);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    toast.error("Failed to load expenses.");
  }
  return [];
};

export const fetchAttendance = async (pgId: string) => {
  try {
    const res = await fetch(`/api/get/attendance?pgId=${pgId}`);
    const data = await res.json();
    if (data.success) return { userAttendance: data.userAttendance, mealCount: data.mealCount };
    toast.error(data.message);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    toast.error("Failed to load attendance.");
  }
  return { userAttendance: {}, mealCount: {} };
};

export const fetchSpentData = async (pgId: string) => {
  try {
    const res = await fetch(`/api/get/spent?pgId=${pgId}`);
    const data = await res.json();
    if (data.success) {
      return {
        users: data.users,
        totalSpent: data.totalSpent,
        maxExpenses: Math.max(...data.users.map((u: any) => u.expenses.length), 0),
      };
    }
  } catch (error) {
    console.error("Error fetching spent data:", error);
  }
  return { users: [], totalSpent: 0, maxExpenses: 0 };
};
