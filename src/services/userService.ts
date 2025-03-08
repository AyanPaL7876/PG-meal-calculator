import { db } from "../firebase";
import { doc, setDoc, getDoc, writeBatch } from "firebase/firestore";
import { StoreUser, RequestPgs } from "@/types/User";
import { PG } from "@/types/pg";

export const addUser = async (user: StoreUser) => {
  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      name: user.name,
      email: user.email,
      mealStatus: "off",
      role: "user",
      pgId: null
    }, { merge: true });
    console.log("User added successfully!");
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

export const getUser = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const sendPgJoinRequest = async (pgId: string, userId: string): Promise<{success: boolean, message: string}> => {
  try {
    // Validate inputs
    if (!pgId || !userId) {
      return { success: false, message: "Invalid PG ID or User ID" };
    }

    const pgRef = doc(db, "pgs", pgId);
    const pgSnap = await getDoc(pgRef);
    if (!pgSnap.exists()) return { success: false, message: "PG not found" };

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return { success: false, message: "User not found" };

    // Get user data and cast to StoreUser for type safety
    const userData = userSnap.data() as StoreUser;
    
    // Check if user has already requested this PG
    const existingRequest = userData.requestedId?.find(req => req.pgId === pgId);
    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return { success: false, message: "You already have a pending request for this PG" };
      } else if (existingRequest.status === "accepted") {
        return { success: false, message: "You are already a member of this PG" };
      }
      // If rejected, we'll allow them to request again
    }

    // Update PG's request list
    const requestIds: string[] = Array.isArray(pgSnap.data()?.request) ? pgSnap.data()?.request : [];
    if (!requestIds.includes(userId)) {
      requestIds.push(userId);
    }

    // Create new request object
    const requestPgs: RequestPgs = {
      pgId,
      status: "pending",
      date: new Date().toISOString(),
    };

    // Update user's requested PGs
    const updatedRequestedId = Array.isArray(userData.requestedId) 
      ? userData.requestedId.filter(req => req.pgId !== pgId).concat(requestPgs) 
      : [requestPgs];
    
    // Update both documents in a batch for atomicity
    const batch = writeBatch(db);
    batch.update(pgRef, { request: requestIds });
    batch.update(userRef, { requestedId: updatedRequestedId });
    await batch.commit();

    console.log("✅ Request sent successfully!");
    return { success: true, message: "Request to join PG sent successfully!" };

  } catch (error) {
    console.error("❌ Error sending request:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return { success: false, message: `Failed to send request: ${errorMessage}` };
  }
};

export const getRequestPgs = async (userId: string): Promise<PG[]> => {
  try {
    // Validate input
    if (!userId) {
      console.error("Invalid user ID provided");
      return [];
    }

    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.error(`User with ID ${userId} not found`);
      return [];
    }

    const userData = userSnap.data() as StoreUser;
    
    // If no requested PGs, return early
    if (!userData.requestedId || userData.requestedId.length === 0) {
      return [];
    }
    
    const pgIds = userData.requestedId.map(req => req.pgId);
    const requestPgs: PG[] = [];

    // Use Promise.all for parallel fetching instead of sequential
    const pgSnapshots = await Promise.all(
      pgIds.map(pgId => getDoc(doc(db, "pgs", pgId)))
    );

    // Process results
    pgSnapshots.forEach(pgSnap => {
      if (pgSnap.exists()) {
        const pgData = pgSnap.data();
        requestPgs.push({ 
          id: pgSnap.id, 
          ...pgData 
        } as PG);
      }
    });

    return requestPgs;
  } catch (error) {
    console.error("Error fetching requested PGs:", error);
    // Provide more specific error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Details: ${errorMessage}`);
    return [];
  }
}

export const changeMealStatus = async (userId: string, status: boolean) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { mealStatus: status }, { merge: true });
    console.log(`Meal status updated to ${status}`);
    return true;
  } catch (error) {
    console.error("Error updating meal status:", error);
    return false;
  }
};