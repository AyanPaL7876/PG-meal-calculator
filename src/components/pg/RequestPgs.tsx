"use client";
import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";
import { getRequestPgs } from "@/services/userService";
import { PG } from "@/types/pg";
import LoadingScreen from "../Loading";

export default function RequestPgs() {
  const { user } = useAuth();
  // const router = useRouter();
  const [pgs, setPgs] = useState<PG[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPGs = async () => {
      if (user?.uid) {
        const Pgs = await getRequestPgs(user.uid);
        setPgs(Pgs);
      }
    };

    fetchPGs();
    setLoading(false);
  }, [user]);

  if (loading) {
    return <LoadingScreen message="Fetching User and PG details..." />;
  }

  if (!user) {
    // router.push("/signin")
    return <LoadingScreen message="Redirecting to Sign In..." />;
  }

  const filteredPgs = pgs.filter((pg) =>
    pg.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center justify-start p-8 pb-32 bg-gradient-to-b from-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-8"
      >
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-blue-500">
          Requested PGs
        </h1>

        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-200">Available PGs</CardTitle>
            <div className="relative mt-4">
              <input
                type="text"
                placeholder="Search PG by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500/50 text-gray-200 placeholder-gray-400"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            {filteredPgs.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                {searchQuery ? "No PGs found matching your search" : "No PGs available."}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPgs.map((pg) => (
                  <motion.div
                    key={pg.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-xl p-4 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-200">{pg.name}</h3>
                        <p className="text-gray-400 text-sm">{pg.address}</p>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Users className="h-4 w-4" />
                          <span>{pg.users?.length || 0} members</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}