"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { usePg } from "@/context/PgContext";
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
import { ChangeAdmin } from "@/services/pgService";
// import { StoreUser } from "@/types/User";

interface ChangeAdminProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChangeAdminPopup = ({ isOpen, onClose }: ChangeAdminProps) => {
  const { user } = useAuth();
  const { pg, users } = usePg();
  const [newAdminId, setNewAdminId] = useState("");

  const handleChangeAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminId) {
      toast.error("Please select a new admin.");
      return;
    }

    try {
      await ChangeAdmin(user?.pgId as string, user?.uid as string, newAdminId);
      toast.success("Admin changed successfully!");
      onClose();
    } catch (error) {
      console.error("Error changing admin:", error);
      toast.error("Failed to change admin.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            Change Admin ({(pg?.name)?.toUpperCase()})
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-400">
            Select a new admin to replace the current admin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleChangeAdmin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Select New Admin</label>
            <Select onValueChange={setNewAdminId} value={newAdminId}>
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

export default ChangeAdminPopup;
