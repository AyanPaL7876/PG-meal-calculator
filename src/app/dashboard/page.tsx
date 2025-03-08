"use client";

import ActionBtn from '@/components/dashboard/ActionBtn'
import UserInfo from '@/components/dashboard/userInfo'
import React from 'react'
import { useAuth } from '@/context/AuthContext'
import ExpenseGraph from '@/components/graph/ExpenseGraph';
import UserMealGraph from '@/components/graph/UserMealGraph';
import MealTable from '@/components/table/MealTable';

function Page() {
  
  const { user } = useAuth();
  return (
    <div>
      <UserInfo/>
      {user?.role==="admin" && <ActionBtn/>}
      <div className='max-w-full mx-auto px-4 sm:px-6 lg:px-8'>
        <div className=''>
          <UserMealGraph pgId={user?.pgId}/>
        </div>
        <div className=''>
          <ExpenseGraph pgId={user?.pgId}/>
        </div>
      </div>
    </div>
  )
}

export default Page