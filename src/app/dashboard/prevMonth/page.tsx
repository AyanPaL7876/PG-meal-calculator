"use client";

import ExpenseTable from '@/components/table/ExpanseTable';
import MealTable from '@/components/table/MealTable';
import { useAuth } from '@/context/AuthContext';
import { PG } from '@/types/pg';
import React, { useState, useEffect } from 'react';
import { getPG } from '@/services/pgService';
import SpentTable from '@/components/table/SpentTable';
import SummaryTable from '@/components/table/SummaryTable';
import { createOrUpdateSummary } from '@/services/summaryServices';

function Page() {
    const { user } = useAuth();
    const [pg, setPg] = useState<PG | null>(null);

    useEffect(() => {
        if (!user || !user.pgId) return;

        const fetchPG = async () => {
            try {
                const pgData = await getPG(user.pgId);
                console.log(pgData);
                if (pgData) {
                    setPg(pgData);
                }
            } catch (error) {
                console.error("Failed to fetch PG data:", error);
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
            const res = await createOrUpdateSummary(user.pgId);
            if (res) {
                console.log("Summary created successfully");
            } else {
                console.log("Failed to create summary");
            }
        } catch (error) {
            console.error("Error creating summary:", error);
        }
    };

    const getMonthYear = (): string => {
        const date = new Date();
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const month = monthNames[date.getMonth()-1];
        const year = date.getFullYear().toString().slice(-2); // Get last two digits of the year

        return `${month} - ${year}`;
    };

    return (
        <div className='pt-20 flex flex-col gap-10'>
            <h2 className='text-2xl pb-2 text-center'>{getMonthYear()}</h2>
            {user?.pgId && (
                <>
                    <SummaryTable pgId={user.pgId} currMonth={false} />
                    <SpentTable pgId={user.pgId} currMonth={false} />
                    <MealTable pgId={user.pgId} currMonth={false} />
                    <ExpenseTable pgId={user.pgId} currMonth={false} />
                </>
            )}
        </div>
    );
}

export default Page;
