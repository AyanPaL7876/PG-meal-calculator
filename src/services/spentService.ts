import { db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const addSpent = async (pgId: string, userId: string, totalMoney: number) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    
    // Get current PG data
    const pgSnap = await getDoc(pgRef);
    
    if (!pgSnap.exists()) {
      console.error("PG document not found!");
      return;
    }

    const currentData = pgSnap.data();
    let spentSheet = currentData?.currentMonth?.spentSheet || [];
    let totalSpent = currentData?.currentMonth?.totalSpent || 0;

    // Find if user already exists in spentSheet
    const userIndex = spentSheet.findIndex((entry: any) => entry.userId === userId);

    if (userIndex !== -1) {
      // User exists, update details array & totalMoney
      const updatedUser = { 
        ...spentSheet[userIndex], 
        totalMoney: spentSheet[userIndex].totalMoney + totalMoney, 
        details: [
          ...spentSheet[userIndex].details,
          { date: new Date().toISOString(), totalMoney }
        ]
      };

      // Create a new array with updated user
      spentSheet = [
        ...spentSheet.slice(0, userIndex),
        updatedUser,
        ...spentSheet.slice(userIndex + 1)
      ];
    } else {
      // User does not exist, add a new entry
      spentSheet.push({
        userId,
        totalMoney,
        details: [{
          date: new Date().toISOString(),
          totalMoney,
        }]
      });
    }

    // Update Firestore
    await updateDoc(pgRef, {
      "currentMonth.spentSheet": spentSheet,
      "currentMonth.totalSpent": totalSpent + totalMoney,
    });

    console.log("Expense added successfully!");
  } catch (error) {
    console.error("Error adding expense:", error);
  }
};

export const deleteSpentDetails = async (pgId: string, userId: string, date: string) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    
    // Get current PG data
    const pgSnap = await getDoc(pgRef);
    
    if (!pgSnap.exists()) {
      console.error("PG document not found!");
      return false;
    }

    const currentData = pgSnap.data();
    const spentSheet = currentData?.currentMonth?.spentSheet || [];
    
    // Find the user in spentSheet
    const userIndex = spentSheet.findIndex((entry: any) => entry.userId === userId);
    
    if (userIndex === -1) {
      console.error("User not found in spent sheet!");
      return false;
    }

    const user = spentSheet[userIndex];
    
    // Find the detail to delete
    const detailIndex = user.details.findIndex((detail: any) => detail.date === date);
    
    if (detailIndex === -1) {
      console.error("Expense detail not found!");
      return false;
    }

    // Calculate amount to subtract from total
    const amountToSubtract = user.details[detailIndex].totalMoney;

    // Remove the detail
    const updatedDetails = user.details.filter((detail: any) => detail.date !== date);
    
    // Update user's total money
    const updatedUser = {
      ...user,
      details: updatedDetails,
      totalMoney: user.totalMoney - amountToSubtract
    };

    // Update the spentSheet array
    const updatedSpentSheet = [
      ...spentSheet.slice(0, userIndex),
      updatedUser,
      ...spentSheet.slice(userIndex + 1)
    ];

    // Update Firestore
    await updateDoc(pgRef, {
      "currentMonth.spentSheet": updatedSpentSheet,
      "currentMonth.totalSpent": currentData.currentMonth.totalSpent - amountToSubtract
    });

    console.log("Expense detail deleted successfully!");
    return true;
  } catch (error) {
    console.error("Error deleting expense detail:", error);
    return false;
  }
};
