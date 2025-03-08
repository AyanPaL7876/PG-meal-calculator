"use client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPGusers } from "@/services/pgService";
import { StoreUser } from "@/types";

interface SpentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const SpentForm = ({ isOpen, onClose }: SpentFormProps) => {
  const { user } = useAuth();
  const [totalMoney, setTotalMoney] = useState("");
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (!user?.pgId) return;

    const fetchUsers = async () => {
      try {
        const usersData = await getPGusers(user?.pgId);
        console.log("usersData", usersData);

        if (usersData && usersData.length > 0) {
          setUsers(usersData);
        } else {
          toast.error("Users Not Found.");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      }
    };

    fetchUsers();
  }, [user?.pgId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.pgId) {
      toast.error("PG ID not found. Please log in again.");
      return;
    }

    if (!totalMoney.trim() || Number(totalMoney) <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (!selectedId) {
      toast.error("Please select a user.");
      return;
    }

    const spentData = {
      pgId: user.pgId,
      userId: selectedId,
      totalMoney: parseFloat(totalMoney),
    };

    try {
      const res = await fetch("/api/create/Spent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spentData),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Spent money added successfully!");
        setTotalMoney("");
        setSelectedId("");
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error submitting spent money:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            Add Spent Money
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Fill out the form below to add a spent money record.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">
              Select User
            </label>
            <Select onValueChange={setSelectedId} value={selectedId}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {users.map(({ name, uid }) => (
                  <SelectItem
                    key={uid}
                    value={uid}
                    className="text-gray-100 focus:bg-gray-700 focus:text-gray-100"
                  >
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Amount</label>
            <Input
              type="number"
              placeholder="Enter amount..."
              value={totalMoney}
              onChange={(e) => setTotalMoney(e.target.value)}
              className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500"
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
            <Button type="submit" className="bg-blue-600 text-gray-100 hover:bg-blue-700">
              Submit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SpentForm;
