"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, X, UserPlus, Mail, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StoreUser } from "@/types";
import { getPGrequest, acceptRequest, rejectRequest } from "@/services/pgService";

export default function RequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<StoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    if (!user?.pgId) return;

    const fetchRequests = async () => {
      try {
        setLoading(true);
        const requestsData = await getPGrequest(user?.pgId as string);
        setRequests(requestsData);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [user?.pgId]);

  const handleRequestAction = async (userId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        await acceptRequest(user?.pgId as string, userId);
        toast.success("Tenant request accepted! They've been notified.");
      } else {
        await rejectRequest(user?.pgId as string, userId);
        toast.success("Request declined. No worries, we'll handle it discreetly.");
      }
      
      // Animate removal then update state
      setTimeout(() => {
        const updatedRequests = requests.filter(req => req.uid !== userId);
        setRequests(updatedRequests);
      }, 300);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    }
  };

  // Format request date
  const formatRequestDate = (dateString: string) => {
    if (!dateString) return "";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Get request date for a specific user
  const getRequestDate = (storeUser: StoreUser) => {
    const requestForThisPg = storeUser.requestedId?.find(req => req.pgId === user?.pgId);
    return requestForThisPg?.date || "";
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 py-8 pt-20">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 mb-3"
          >
            Tenant Join Requests
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-indigo-200 max-w-2xl mx-auto"
          >
            Review and manage potential tenants who want to join your PG accommodation
          </motion.p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-indigo-900/30 backdrop-blur-sm p-1 rounded-xl border border-indigo-700/40">
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                className={`px-6 py-2 rounded-lg font-medium ${activeTab === "pending" ? "bg-indigo-600 text-white" : "text-indigo-300 hover:text-white hover:bg-indigo-800/50"}`}
                onClick={() => setActiveTab("pending")}
              >
                Pending
              </Button>
              <Button 
                variant="ghost" 
                className={`px-6 py-2 rounded-lg font-medium ${activeTab === "previous" ? "bg-indigo-600 text-white" : "text-indigo-300 hover:text-white hover:bg-indigo-800/50"}`}
                onClick={() => setActiveTab("previous")}
              >
                Previous
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden bg-indigo-950/60 border-indigo-700/30 backdrop-blur-sm">
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                    <Skeleton className="h-20 w-20 rounded-full bg-indigo-800/30" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-40 bg-indigo-800/30" />
                      <Skeleton className="h-4 w-60 bg-indigo-800/30" />
                      <Skeleton className="h-4 w-32 bg-indigo-800/30" />
                    </div>
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-24 rounded-md bg-indigo-800/30" />
                      <Skeleton className="h-10 w-24 rounded-md bg-indigo-800/30" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center py-16"
          >
            <div className="bg-indigo-900/20 border border-indigo-700/30 backdrop-blur-sm rounded-xl p-8 max-w-lg mx-auto">
              <UserPlus size={48} className="mx-auto text-indigo-400 mb-4 opacity-60" />
              <h3 className="text-xl font-semibold text-indigo-100 mb-2">No pending requests</h3>
              <p className="text-indigo-300">When someone requests to join your PG, they&#x27;ll appear here for your review.</p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 gap-6">
              {requests.map((request, index) => (
                <motion.div
                  key={request.uid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-indigo-700/30 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-900/20 transition-all">
                    <CardContent className="p-0">
                      <div className="p-6 flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex flex-col items-center md:items-start">
                          <Avatar className="h-20 w-20 ring-2 ring-indigo-500/50 ring-offset-2 ring-offset-indigo-950">
                            <AvatarImage src={request.photoURL || ""} alt={request.name} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-lg">
                              {request.name?.charAt(0).toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <Badge variant="outline" className="mt-2 bg-indigo-800/30 text-indigo-300 border-indigo-600/50">
                            {request.role === "admin" ? "Admin" : "Resident"}
                          </Badge>
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 space-y-3">
                          <h3 className="text-xl font-semibold text-white">{request.name}</h3>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-indigo-200">
                            <div className="flex items-center gap-2">
                              <Mail size={16} className="text-indigo-400" />
                              <span className="text-sm">{request.email}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Clock size={16} className="text-indigo-400" />
                              <span className="text-sm">Requested: {formatRequestDate(getRequestDate(request))}</span>
                            </div>
                          </div>
                          
                          {/* Statistics */}
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="bg-indigo-900/30 rounded-lg p-2 text-center">
                              <p className="text-xs text-indigo-300">Meals</p>
                              <p className="text-lg font-semibold text-white">{request.mealCount}</p>
                            </div>
                            <div className="bg-indigo-900/30 rounded-lg p-2 text-center">
                              <p className="text-xs text-indigo-300">Balance</p>
                              <p className="text-lg font-semibold text-white">₹{request.balance}</p>
                            </div>
                            <div className="bg-indigo-900/30 rounded-lg p-2 text-center">
                              <p className="text-xs text-indigo-300">Status</p>
                              <div className="flex justify-center mt-1">
                                <Badge className={request.mealStatus ? "bg-green-600" : "bg-red-600"}>
                                  {request.mealStatus ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex flex-row md:flex-col gap-3 self-center md:self-end">
                          <Button 
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border-none"
                            onClick={() => handleRequestAction(request.uid, 'accept')}
                          >
                            <Check className="mr-1 h-4 w-4" /> Accept
                          </Button>
                          <Button 
                            variant="outline"
                            className="border-indigo-700 bg-indigo-950/50 text-indigo-300 hover:bg-indigo-900/30 hover:text-white"
                            onClick={() => handleRequestAction(request.uid, 'reject')}
                          >
                            <X className="mr-1 h-4 w-4" /> Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}