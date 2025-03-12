"use client";
import { motion } from "framer-motion";

export default function Work() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-gray-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-200 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Manage your PG meals effortlessly with automated tracking and
            real-time expense management.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gray-900/80 rounded-xl p-8 border border-gray-700 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-white">1</span>
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-4">
              Set Up & Join
            </h3>
            <p className="text-gray-400">
              Sign up, join your PG group, and set your meal preferences. Admins
              can add and manage users easily.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gray-900/80 rounded-xl p-8 border border-gray-700 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-white">2</span>
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-4">
              Manage Meals
            </h3>
            <p className="text-gray-400">
              Toggle meal status anytime. When the admin takes attendance, your
              meal status is recorded in real-time.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gray-900/80 rounded-xl p-8 border border-gray-700 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-white">3</span>
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-4">
              Track Expenses
            </h3>
            <p className="text-gray-400">
              Users can add shared expenses, while admins track user spending.
              The system auto-calculates per-meal charges.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-gray-900/80 rounded-xl p-8 border border-gray-700 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mx-auto mb-6">
              <span className="text-2xl font-bold text-white">4</span>
            </div>
            <h3 className="text-xl font-bold text-gray-200 mb-4">
              View Monthly Records
            </h3>
            <p className="text-gray-400">
              Access only the current and next month’s summary, including meal
              records, expenses, and spending patterns.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 text-center"
        ></motion.div>
      </div>
    </section>
  );
}
