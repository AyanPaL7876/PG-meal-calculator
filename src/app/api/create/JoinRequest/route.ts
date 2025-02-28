import { db } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, pgId } = body;

    // First check if user has already requested to join
    const pgRef = doc(db, "pgs", pgId);
    const pgDoc = await getDoc(pgRef);

    if (!pgDoc.exists()) {
      return NextResponse.json({ 
        success: false, 
        message: "PG not found" 
      }, { status: 404 });
    }

    const pgData = pgDoc.data();
    const existingRequests = pgData.requests || [];

    // Check if user has already requested by checking userId in request objects
    if (existingRequests.some(request => request.userId === userId)) {
      return NextResponse.json({ 
        success: false, 
        message: "You have already requested to join this PG" 
      }, { status: 400 });
    }

    // Create request object with userId and timestamp
    const requestData = {
      userId,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Add request object to the requests array
    await updateDoc(pgRef, {
      requests: arrayUnion(requestData)
    });

    return NextResponse.json({ 
      success: true, 
      message: "Join request sent successfully"
    });

  } catch (error) {
    console.error("Error creating join request:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Failed to send join request" 
    }, { status: 500 });
  }
}
