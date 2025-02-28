import { db } from "../../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { userId, pgId } = await req.json();

  if (!userId || !pgId) {
    return NextResponse.json({ error: "Missing userId or pgId" }, { status: 400 });
  }

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { pgId });

  return NextResponse.json({ message: "User PG updated successfully" });
}
