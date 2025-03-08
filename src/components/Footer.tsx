"use client";
import { FaUtensils} from "react-icons/fa";

const Footer = () => {

  return (
          <footer className="py-12 pb-2 px-6 bg-gray-900 border-t border-gray-800 mt-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                    <FaUtensils className="text-white text-xl" />
                  </div>
                  <h2 className="text-2xl font-bold text-blue-400">PG-meal Calculator</h2>
                </div>
                <p className="text-gray-400 max-w-md">Simplifying meal management and expense tracking for PG accommodations.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Resources</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Tutorials</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">FAQs</a></li>
                  </ul>
                </div>
                
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Company</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                    <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
                  </ul>
                </div>
                
                <div className="text-center md:text-left col-span-2 md:col-span-1">
                  <h3 className="text-lg font-semibold text-gray-200 mb-4">Contact</h3>
                  <ul className="space-y-2 text-gray-400">
                    <li>support@pgmeal.app</li>
                    <li>+91 98765 43210</li>
                    <li>Bangalore, India</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-12 pt-6 border-t border-gray-800 text-center">
              <p className="text-gray-500">&copy; {new Date().getFullYear()} PG-meal Calculator. All rights reserved.</p>
            </div>
          </div>
        </footer>
  );
};

export default Footer;
