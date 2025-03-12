"use client";
import { JSX } from "react";
import { FaHandHoldingUsd, FaClipboardCheck, FaCalculator, FaUserShield, FaCalendarAlt, FaUsersCog, FaToggleOn } from "react-icons/fa";
import { motion } from "framer-motion";


interface Feature {
  header: string;
  details: string;
  icon: JSX.Element;
}


export default function Features() {
  const features: Feature[] = [
    {
      header: "Meal Status Control",
      details: "Users can toggle their meal status anytime, helping manage attendance easily.",
      icon: <FaToggleOn className="text-4xl text-blue-400" />,
    },
    {
      header: "Meal Attendance",
      details: "Admins can take meal attendance and view users' meal status in real-time.",
      icon: <FaClipboardCheck className="text-4xl text-blue-400" />,
    },
    {
      header: "Shared Expense Management",
      details: "Anyone in the PG can add shared expenses for easy tracking and transparency.",
      icon: <FaHandHoldingUsd className="text-4xl text-blue-400" />,
    },
    {
      header: "Admin-Controlled User Spend",
      details: "Only admins can add user-specific spending records to maintain financial accuracy.",
      icon: <FaUserShield className="text-4xl text-blue-400" />,
    },
    {
      header: "Automated Cost Calculations",
      details: "Per-meal charges and user balances are calculated automatically for accuracy.",
      icon: <FaCalculator className="text-4xl text-blue-400" />,
    },
    {
      header: "User Management",
      details: "Easily add, remove, and manage multiple users within your PG accommodation.",
      icon: <FaUsersCog className="text-4xl text-blue-400" />,
    },
    {
      header: "Monthly Records Overview",
      details: "View only the current and next month’s summaries, expenses, and meal records.",
      icon: <FaCalendarAlt className="text-4xl text-blue-400" />,
    }
  ];
  

  return (
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-200 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to simplify meal management and expense tracking in shared living spaces.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg hover:shadow-blue-900/20 hover:border-blue-900/30 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-blue-400 mb-3">{feature.header}</h3>
                <p className="text-gray-400">{feature.details}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
  );
}