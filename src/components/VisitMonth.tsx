"use client";

import ExpenseTable from '@/components/table/ExpanseTable';
import MealTable from '@/components/table/MealTable';
import { useAuth } from '@/context/AuthContext';
import { Expense, mealData, Month, PG, spent } from '@/types/pg';
import React, { useState, useEffect } from 'react';
import { getPG, moveToPreviousMonth } from '@/services/pgService';
import SpentTable from '@/components/table/SpentTable';
import SummaryTable from '@/components/table/SummaryTable';
import { createOrUpdateSummary } from '@/services/summaryServices';
import LoadingScreen from '@/components/Loading';

function VisitMonth({currMonth}:{currMonth:boolean}) {
    const { user } = useAuth();
    const [pg, setPg] = useState<PG | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.pgId) {
            setLoading(false);
            return;
        }

        const fetchPG = async () => {
            try {
                setLoading(true);
                const pgData = await getPG(user?.pgId as string);
                console.log(pgData);
                if (pgData) {
                    setPg(pgData);
                }
            } catch (error) {
                console.error("Failed to fetch PG data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPG();
    }, [user]);

    const handleClick = async () => {
        if (!user || !user.pgId) {
            console.log("PG ID is missing");
            return;
        }

        try {
            setLoading(true);
            const res = await createOrUpdateSummary(user.pgId);
            if (res) {
                console.log("Summary created successfully");
                // Refresh PG data after summary creation
                const pgData = await getPG(user.pgId);
                if (pgData) {
                    setPg(pgData);
                }
            } else {
                console.log("Failed to create summary");
            }
        } catch (error) {
            console.error("Error creating summary:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMonth = async () => {
        if (!user || !user.pgId) {
            console.log("PG ID is missing");
            return;
        }

        try {
            setLoading(true);
            const res = await moveToPreviousMonth(user.pgId);
            if (res) {
                console.log("Month moved successfully");
                // Refresh PG data after moving to previous month
                const pgData = await getPG(user.pgId);
                if (pgData) {
                    setPg(pgData);
                }
            } else {
                console.log("Failed to move to next month");
            }
        } catch (error) {
            console.error("Error moving to next month:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <LoadingScreen message="Loading current month data..." />
    );

    return (
        <div className='pt-20 flex flex-col gap-10'>
            <h2 className='text-2xl pb-2 text-center font-bold'>{pg?.currMonth?.month}</h2>
            {pg?.currMonth &&  user?.role==="admin" && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                    onClick={handleClick}
                    className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 font-medium flex items-center justify-center gap-2'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Calculate Summary
                </button>
                
                <button
                    onClick={handleMonth}
                    className='bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-6 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 font-medium flex items-center justify-center gap-2'
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                        <path d="M10 6a1 1 0 011 1v2a1 1 0 11-2 0V7a1 1 0 011-1z" />
                    </svg>
                    Move to Next Month
                </button>
            </div>
            )}
            
            {user?.pgId && pg && currMonth &&(
                <>
                    <SummaryTable data={pg.currMonth as Month} />
                    <SpentTable data={pg.currMonth?.spentSheet as spent[]} currMonth={currMonth} />
                    <MealTable data={pg.currMonth?.mealSheet as mealData[]} currMonth={currMonth} />
                    <ExpenseTable data={pg.currMonth?.expenseSheet as Expense[]} currMonth={currMonth} />
                </>
            )}
            {user?.pgId && pg && !currMonth &&(
                <>
                    <SummaryTable data={pg.prevMonth as Month} />
                    <SpentTable data={pg.prevMonth?.spentSheet as spent[]} currMonth={currMonth} />
                    <MealTable data={pg.prevMonth?.mealSheet as mealData[]} currMonth={currMonth} />
                    <ExpenseTable data={pg.prevMonth?.expenseSheet as Expense[]} currMonth={currMonth} />
                </>
            )}
        </div>
    );
}

export default VisitMonth;