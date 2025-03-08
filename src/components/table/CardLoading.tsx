"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Calculator, Utensils, Wallet, Receipt, Coins } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CardLoadingProps {
  heading: string;
  rowCount?: number;
  tableDataRow?: number;
  footer?: string;
}

function CardLoading({ heading, rowCount = 5, tableDataRow = 6, footer = "" }: CardLoadingProps) {
  return (
    <Card className="max-w-7xl w-full mx-auto bg-slate-900 text-white p-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
          <Receipt size={24} />
          {heading}
        </CardTitle>
      </CardHeader>

      {/* Table Loading */}
      <CardContent>
        <div className="overflow-x-auto rounded-lg mb-6 border border-slate-700">
          <Table>
            <TableHeader className="bg-slate-800">
              <TableRow>
                {["Name", "Total Meals", "Total Spent", "Total Expense", "Balance", "Balance (After Masi)"].map(
                  (header, index) => (
                    <TableHead key={index} className="font-semibold text-white">
                      {header}
                    </TableHead>
                  )
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, i) => (
                <TableRow key={i} className="border-slate-700">
                  {Array.from({ length: tableDataRow }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full bg-slate-700 rounded" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Summary Cards Loading */}
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { icon: Utensils, title: "Meal Charge" },
          { icon: Wallet, title: "Masi Charge" },
          { icon: Calculator, title: "Total Meals" },
          { icon: Receipt, title: "Total Expenses" },
          { icon: Coins, title: "Total Spent" },
        ].map(({ icon: Icon, title }, index) => (
          <div key={index} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-700 p-3 flex items-center gap-2">
              <Icon size={20} className="text-white" />
              <span className="font-medium text-white">{title}</span>
            </div>
            <div className="p-4 text-center">
              <Skeleton className="h-6 w-3/4 mx-auto bg-gray-600 rounded" />
            </div>
          </div>
        ))}
      </CardContent>

      <CardFooter className="text-sm text-center text-slate-400 italic border-t border-slate-700 pt-4 mt-2">
        * {footer}
      </CardFooter>
    </Card>
  );
}

export default CardLoading;
