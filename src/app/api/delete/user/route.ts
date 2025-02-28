import { NextResponse } from 'next/server';
import { db } from '@/firebase';
import { doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';

export async function DELETE(request: Request) {
  try {
    const { email, pgId } = await request.json();

    if (!email || !pgId) {
      return NextResponse.json({ success: false, message: 'Missing required fields' });
    }

    // Remove user from PG's users collection
    const pgRef = doc(db, 'pgs', pgId);
    const pgDoc = await getDoc(pgRef);
    
    if (!pgDoc.exists()) {
      return NextResponse.json({ success: false, message: 'PG not found' });
    }

    const users = pgDoc.data().users || [];
    await updateDoc(pgRef, {
      users: users.filter((u: string) => u !== email)
    });

    return NextResponse.json({ success: true, message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user:', error);
    return NextResponse.json({ success: false, message: 'Failed to remove user' });
  }
} 