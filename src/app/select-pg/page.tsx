"use client";
import CreatePg from "@/components/pg/CreatePg";
import JoinPg from "@/components/pg/JoinPg";
import RequestPgs from "@/components/pg/RequestPgs";
import { Plus, LogOut } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/Loading";

function Page() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.pgId !== "") {
      router.push("/dashboard");
      return;
    }

    setLoading(false);
  }, [user, router]);

  if (loading) {
    return <LoadingScreen message="Fetching User and PG details..." />;
  }

  return (
    <div>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full bg-gray-900/95 border-b border-gray-800 shadow-lg backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          {/* Logo */}
          <h1 className="text-2xl font-bold text-blue-400">PG-Meal</h1>

          {/* Buttons (Desktop) */}
          <div className="hidden md:flex gap-6">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 hover:scale-105 transition-all duration-300"
            >
              <Plus size={18} /> Create PG
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 hover:bg-gray-600 hover:scale-105 transition-all duration-300"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 hover:scale-105 transition-all duration-300"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <div className="pt-16 px-4">
        <JoinPg />
        <RequestPgs />
        {isOpen && <CreatePg isOpen={isOpen} onClose={() => setIsOpen(false)} />}
      </div>
    </div>
  );
}

export default Page;
