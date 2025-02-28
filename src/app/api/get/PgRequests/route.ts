import { db } from "@/firebase";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const pgId = url.searchParams.get("pgId");

    if (!pgId) {
      return NextResponse.json({ 
        success: false, 
        message: "PG ID is required" 
      }, { status: 400 });
    }

    // Get PG document to access requests array
    const pgRef = doc(db, "pgs", pgId);
    const pgDoc = await getDoc(pgRef);

    if (!pgDoc.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: "PG not found" 
      }, { status: 404 });
    }

    const pgData = pgDoc.data();
    const requests = pgData.requests || [];

    // Get user details for each request
    const usersRef = collection(db, "users");
    const requestUsers = await Promise.all(
      requests.map(async (request) => {
        const userDoc = await getDoc(doc(db, "users", request.userId));
        if (userDoc.exists()) {
          return {
            ...userDoc.data(),
            requestedAt: request.requestedAt,
            status: request.status
          };
        }
        return null;
      })
    );

    // Filter out any null values (in case a user was deleted)
    const validRequestUsers = requestUsers.filter(user => user !== null);

    return NextResponse.json({ 
      success: true, 
      requests: validRequestUsers 
    });

  } catch (error) {
    console.error("Error fetching PG requests:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to fetch requests" 
    }, { status: 500 });
  }
} 