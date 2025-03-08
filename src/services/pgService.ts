import { StoreUser } from "@/types";
import { db } from "../firebase";
import { PG } from "@/types/pg";
import { doc, getDoc, updateDoc, collection, getDocs, addDoc, runTransaction } from "firebase/firestore";

// Move current month data to previous month
export const moveToPreviousMonth = async (pgId: string) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("PG not found!");
      return;
    }

    const pgData = pgSnap.data();
    const currMonth = pgData?.currMonth;

    await updateDoc(pgRef, {
      preMonth: currMonth,
      currMonth: {
        month: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        mealSheet: [],
        expenseSheet: [],
        totalMeal: 0,
        totalExpenses: 0,
        mealCharge: 0,
        baseMeal: 0,
        extraMeal: 0,
        masiCharge: pgData?.masiCharge ?? 0,
        userSummaries: [],
      },
    });

    console.log("✅ Month reset successfully!");
  } catch (error) {
    console.error("❌ Error resetting month:", error);
  }
};

// Fetch all PGs
export const getPGs = async (): Promise<PG[]> => {
  try {
    const pgCollection = collection(db, "pgs");
    const pgSnapshot = await getDocs(pgCollection);

    const pgs: PG[] = pgSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as PG),
    }));

    return pgs;
  } catch (e) {
    console.error("❌ Error fetching PGs:", e);
    return [];
  }
};

export const getPG = async (pgId: string): Promise<PG | null> => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("❌ PG not found!");
      return null;
    }

    return pgSnap.data() as PG;
  }
  catch (e) {
    console.error("❌ Error fetching PG:", e);
    return null;
  }
};
// Fetch PG Users
export const getPGusers = async (pgId: string): Promise<StoreUser[]> => {
  try {
    const users: StoreUser[] = [];
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("PG not found!");
      return [];
    }

    const pgData = pgSnap.data();
    const userIds: string[] = pgData?.users ?? [];

    for (const uId of userIds) {
      const userRef = doc(db, "users", uId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        users.push(userSnap.data() as StoreUser);
      }
    }

    return users;
  } catch (e) {
    console.error("❌ Error fetching PG users:", e);
    return [];
  }
};

// Fetch PG Requests
export const getPGrequest = async (pgId: string): Promise<StoreUser[]> => {
  try {
    const users: StoreUser[] = [];
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("PG not found!");
      return [];
    }

    const pgData = pgSnap.data();
    const userIds: string[] = pgData?.request ?? [];

    for (const uId of userIds) {
      const userRef = doc(db, "users", uId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        users.push(userSnap.data() as StoreUser);
      }
    }

    return users;
  } catch (e) {
    console.error("❌ Error fetching PG requests:", e);
    return [];
  }
};

export const acceptRequest = async (pgId: string, userId: string) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("❌ PG not found!");
      return;
    }
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error("❌ User not found!");
      return;
    }
    const pgData = pgSnap.data();
    const userIds: string[] = pgData?.user ?? [];
    const requestIds: string[] = pgData?.request ?? [];
    
    const userIndex = requestIds.findIndex((id) => id === userId);
    
    if (userIndex !== -1) {
      userIds.push(userId);
      requestIds.splice(userIndex, 1);
    }

    const userData = userSnap.data();
    userData.pgId = pgId;
    userData.requestStatus = "accepted";

    await updateDoc(pgRef, { user: userIds, request: requestIds });
    await updateDoc(userRef, userData);
    console.log("✅ Request accepted successfully!");
  } catch (error) {
    console.error("❌ Error accepting request:", error);
  }
}

export const rejectRequest = async (pgId: string, userId: string) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("❌ PG not found!");
      return;
    }
    
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error("❌ User not found!");
      return;
    }
    const pgData = pgSnap.data();
    const requestIds: string[] = pgData?.request ?? [];
    
    const userIndex = requestIds.findIndex((id) => id === userId);
    
    if (userIndex !== -1) {
      requestIds.splice(userIndex, 1);
    }

    const userData = userSnap.data();
    userData.requestStatus = "rejected";

    await updateDoc(pgRef, { request: requestIds });
    await updateDoc(userRef, userData);
    console.log("✅ Request rejected successfully!");
  } catch (error) {
    console.error("❌ Error rejecting request:", error);
  }
}

export const deletePG = async (pgId: string) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    await updateDoc(pgRef, { isDeleted: true });
    console.log("✅ PG deleted successfully!");
  } catch (error) {
    console.error("❌ Error deleting PG:", error);
  }
};

export const updatePG = async (pgId: string, pgData: Partial<PG>) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    await updateDoc(pgRef, pgData);
    console.log("✅ PG updated successfully!");
  } catch (error) {
    console.error("❌ Error updating PG:", error);
  }
};

export const createPG = async (pgData : PG, user:string) => {
  try {
    const pgCollection = collection(db, "pgs");
    const userRef = doc(db, "users", user);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        success: false,
        message: "User not found",
      };
    }

    const newPgDoc = await addDoc(pgCollection, pgData); // Create PG document and get reference
    const userData = userSnap.data();

    userData.pgId = newPgDoc.id; // Assign PG ID to user data
    userData.role = "admin"; // Assign admin role to user
    userData.mealStatus= true // Assign meal status to user
    await updateDoc(userRef, userData); // Update user document

    console.log("✅ PG created successfully!");
    return {
      success: true,
      message: "PG created successfully",
    };
  } catch (error) {
    console.error("❌ Error creating PG:", error);
    return {
      success: false,
      message: "Error creating PG",
    };
  }
};

export const currentMealOn = async (pgId: string): Promise<number> => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);

    if (!pgSnap.exists()) {
      console.error("❌ PG not found!");
      return 0;
    }

    const pgData = pgSnap.data();
    const users = pgData?.users ?? [];
    let totalMeal = 0;

    for (const user of users) {
      const userRef = doc(db, "users", user);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        console.error(`❌ User ${user} not found!`);
        continue;
      }

      const userData = userSnap.data();

      if (userData?.mealStatus === true) {
        totalMeal++;
      }
    }

    return totalMeal;
  } catch (error) {
    console.error("❌ Error turning on current meal:", error);
    return 0; // Always return a number as expected
  }
};

export const ChangeAdmin = async (pgId: string, currUserId: string, newUserId: string) => {
  try {
    const pgRef = doc(db, "pgs", pgId);
    const currUserRef = doc(db, "users", currUserId);
    const newUserRef = doc(db, "users", newUserId);

    await runTransaction(db, async (transaction) => {
      const pgSnap = await transaction.get(pgRef);
      if (!pgSnap.exists()) {
        throw new Error("PG not found!");
      }

      const pgData = pgSnap.data();
      const users = pgData?.users ?? [];

      if (!users.includes(currUserId)) {
        throw new Error("Current User not found in PG!");
      }
      if (!users.includes(newUserId)) {
        throw new Error("New User not found in PG!");
      }

      const currUserSnap = await transaction.get(currUserRef);
      const newUserSnap = await transaction.get(newUserRef);

      if (!currUserSnap.exists()) {
        throw new Error("Current User not found!");
      }
      if (!newUserSnap.exists()) {
        throw new Error("New User not found!");
      }

      // Update roles
      transaction.update(currUserRef, { role: "user" });
      transaction.update(newUserRef, { role: "admin" });

      console.log("✅ Admin changed successfully!");
    });
  } catch (error) {
    console.error("❌ Error changing admin:", error);
  }
};

