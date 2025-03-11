"use client";

import { useEffect, useState } from "react";
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
import { PG } from "@/types/pg";
import { createPG } from "@/services/pgService";
import { useRouter } from "next/navigation";

interface CreatePgProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePg = ({ isOpen, onClose }: CreatePgProps) => {
  const { user } = useAuth();
  const [pgName, setPgName] = useState("");
  const [address, setAddress] = useState("");
  const [masiCharge, setMasiCharge] = useState("");
  const [baseMeal, setBaseMeal] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log(user)
    setPgName("");
    setAddress("");
    setMasiCharge("");
    setBaseMeal("");
  }, [isOpen,user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pgName.trim() || !address.trim() || !masiCharge.trim() || !baseMeal.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    const pgData: PG = {
      name: pgName,
      address,
      masiCharge: Number(masiCharge),
      baseMeal: Number(baseMeal),
      users: [user?.uid as string],
      currMonth:{
        month: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
        totalExpense:0,
        totalMeal:0,
        totalSpent:0,
        masiCharge:Number(masiCharge),
      }
    };

    try {
      const res = await createPG(pgData, user?.uid as string);

      if (res.success) {
        toast.success("PG created successfully!");
        setPgName("");
        setAddress("");
        setMasiCharge("");
        setBaseMeal("");
        onClose();

        router.push("/dashboard");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Error creating PG:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-gray-900 border border-gray-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-100">
            Create New PG
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            placeholder="Enter PG Name"
            value={pgName}
            onChange={(e) => setPgName(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600"
          />

          <Textarea
            placeholder="Enter Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600 resize-none"
          />

          <Input
            type="number"
            placeholder="Masi Charge"
            value={masiCharge}
            onChange={(e) => setMasiCharge(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600"
          />

          <Input
            type="number"
            placeholder="Base Meal"
            value={baseMeal}
            onChange={(e) => setBaseMeal(e.target.value)}
            className="bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-gray-600 focus:ring-gray-600"
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button 
            type="button" 
            variant="outline" 
            className="bg-transparent text-gray-50 border-none"
            onClick={onClose}>
              Cancel
            </Button>
            <Button 
            type="submit"
            onClick={()=>setBtnLoading(true)}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 hover:text-gray-950"
            >
              {btnLoading ? "Creating..." : "Create PG"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePg;
