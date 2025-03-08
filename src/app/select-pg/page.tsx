"use client";
import UserInfo from "@/components/dashboard/userInfo";
import CreatePg from "@/components/pg/CreatePg";
import JoinPg from "@/components/pg/JoinPg";
import RequestPgs from "@/components/pg/RequestPgs";
import { Plus } from "lucide-react";
import React, { useState } from "react";


function page() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div>
      {/* Navbar */}
      <nav className="fixed w-full bg-gray-900/95 border-b border-gray-800 shadow-lg backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <h1 className="text-2xl font-bold text-blue-400">PG-meal</h1>
          <div className="flex gap-20">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-500 hover:scale-105 transition-all duration-300"
            >
              <Plus className="text-2xl" /> Create PG
          </button>
          <button className="flex items-center gap-3 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 hover:bg-gray-600 hover:scale-105 transition-all duration-300">
            Log-out
          </button>
          </div>
        </div>
      </nav>
      <div className="pt-10">
        <UserInfo />
        <JoinPg />
        <RequestPgs />
        {isOpen && (<CreatePg isOpen={isOpen} onClose={() => setIsOpen(false)} />)}
      </div>
    </div>
  );
}

export default page;
