"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import UserCard from "@/components/UserCard";
import { toast } from "react-hot-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.pgId) return;

    const fetchRequests = async () => {
      try {
        const response = await fetch(`/api/get/PgRequests?pgId=${user.pgId}`);
        const data = await response.json();

        if (data.success) {
          setRequests(data.requests);
        } else {
          toast.error(data.message);
        }
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
      const response = await fetch('/api/update/JoinRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          pgId: user?.pgId,
          action
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Request ${action}ed successfully`);
        // Refresh requests
        const updatedRequests = requests.filter(req => req.userId !== userId);
        setRequests(updatedRequests);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-8 pt-20">
      <Card className="max-w-4xl mx-auto bg-gray-800/50 border-gray-700/50 backdrop-blur-sm mt-5">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            Join Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full bg-gray-700/50" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <p className="text-center text-gray-400">No pending requests</p>
          ) : (
            <div className="grid gap-4">
              {requests.map((request) => (
                <UserCard
                  key={request.email}
                  user={request}
                  onAction={handleRequestAction}
                  isRequest={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 