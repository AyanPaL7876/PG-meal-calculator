import { db } from "@/firebase";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { NextResponse } from "next/server";

interface JoinRequest {
  userId: string;
}

interface PGData {
  requests?: JoinRequest[];
  users?: string[];
  pgName?: string;
}

interface UserData {
  pgId?: string;
}

export async function POST(request: Request) {
  try {
    const { userId, pgId, action } = (await request.json()) as {
      userId: string;
      pgId: string;
      action: "accept" | "reject";
    };

    // Get PG document
    const pgRef = doc(db, "pgs", pgId);
    const pgDoc = await getDoc(pgRef);

    if (!pgDoc.exists()) {
      return NextResponse.json(
        { success: false, message: "PG not found" },
        { status: 404 }
      );
    }

    const pgData = pgDoc.data() as PGData;

    // Get user document
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    const userData = userDoc.data() as UserData;

    // Find the user's request in the PG's requests array
    const userRequest = pgData.requests?.find((req) => req.userId === userId);

    if (!userRequest) {
      return NextResponse.json(
        { success: false, message: "Request not found" },
        { status: 404 }
      );
    }

    if (action === "accept") {
      // Check if user is already in another PG
      if (userData.pgId) {
        const currentPgRef = doc(db, "pgs", userData.pgId);
        const currentPgDoc = await getDoc(currentPgRef);
        const currentPgName = currentPgDoc.exists()
          ? (currentPgDoc.data() as PGData).pgName || "another PG"
          : "another PG";

        return NextResponse.json(
          {
            success: false,
            message: `User is already a member of ${currentPgName}. They must leave their current PG before joining a new one.`,
          },
          { status: 400 }
        );
      }

      // Accept the request
      await updateDoc(pgRef, {
        requests: arrayRemove(userRequest),
        users: arrayUnion(userId),
      });

      // Update user's PG membership
      await updateDoc(userRef, {
        pgId,
        joinedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        success: true,
        message: "Request accepted successfully",
      });
    }

    if (action === "reject") {
      // Remove the request from PG
      await updateDoc(pgRef, {
        requests: arrayRemove(userRequest),
      });

      return NextResponse.json({
        success: true,
        message: "Request rejected successfully",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating join request:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update request" },
      { status: 500 }
    );
  }
}
