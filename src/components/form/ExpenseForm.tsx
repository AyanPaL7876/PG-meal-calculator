"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { addExpense } from "@/services/expenseService";
import { Response } from "@/types/pg";

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const ExpenseForm = ({ isOpen, onClose }: ExpenseFormProps) => {
  const { user } = useAuth();
  const [details, setDetails] = useState("");
  const [totalMoney, setTotalMoney] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.pgId) {
      toast.error("PG ID not found. Please log in again.");
      return;
    }

    if (!details.trim() || !totalMoney.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res: Response = await addExpense(user?.pgId , user.uid, details, parseFloat(totalMoney));

      if (res?.success) {
        toast.success("Expense added successfully!");
        setDetails("");
        setTotalMoney("");
        onClose();
      } else {
        toast.error(res?.message);
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      toast.error("Something went wrong. Please try again.");
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            Add New Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Expense Details
            </label>
            <Textarea
              placeholder="Enter expense details..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="min-h-[100px] bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Total Amount
            </label>
            <Input
              type="number"
              placeholder="Enter amount..."
              value={totalMoney}
              onChange={(e) => setTotalMoney(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 text-gray-100 hover:bg-blue-700 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
              {submitting ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseForm;
