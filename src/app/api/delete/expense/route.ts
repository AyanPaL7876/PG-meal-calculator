import { NextResponse } from 'next/server';
import { deleteExpense } from '@/services/expenseService';

export async function DELETE(request: Request) {
  try {
    const { date, pgId } = await request.json();

    if (!date || !pgId) {
      return NextResponse.json({ success: false, message: 'Missing required fields' });
    }

    const result = await deleteExpense(pgId, date);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete expense' });
  }
} 