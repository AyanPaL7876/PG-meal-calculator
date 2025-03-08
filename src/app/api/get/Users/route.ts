// import { NextResponse } from "next/server";
// import { db } from "@/firebase";
// import { collection, query, where, getDocs } from "firebase/firestore";

// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const pgId = url.searchParams.get("pgId");

//     if (!pgId) {
//       return NextResponse.json({ success: false, message: "Missing PG ID" }, { status: 400 });
//     }

//     const usersRef = collection(db, "users");
//     const q = query(usersRef, where("pgId", "==", pgId));
//     const userSnapshots = await getDocs(q);

//     const users = userSnapshots.docs.map((doc) => ({
//       ...doc.data(),
//     }));

//     // console.log("users : ", users);

//     return NextResponse.json({ success: true, users });
//   } catch (error) {
//     console.error("Error fetching users:", error);
//     return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
//   }
// }

