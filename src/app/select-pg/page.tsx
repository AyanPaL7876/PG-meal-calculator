"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Building,
  MapPin,
  Coins,
  Coffee,
  Search,
  Users,
  UserPlus,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function Page() {
  const { user } = useAuth();
  const router = useRouter();
  const [pgs, setPgs] = useState<any[]>([]);
  const [pgName, setPgName] = useState("");
  const [address, setAddress] = useState("");
  const [masiCharge, setMasiCharge] = useState("");
  const [baseMeal, setBaseMeal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPGs = async () => {
      const pgCollection = collection(db, "pgs");
      const pgSnapshot = await getDocs(pgCollection);
      setPgs(pgSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    fetchPGs();
  }, []);

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-900">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardContent className="p-6 text-center space-y-4">
            <p className="text-gray-300">Please login to continue.</p>
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              onClick={() => router.push("/signin")}
            >
              Sign In
            </button>
          </CardContent>
        </Card>
      </div>
    );

  const filteredPGs = pgs.filter((pg) =>
    pg.pgName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const requestToJoin = async (pgId: string) => {
    if (!user) return;

    try {
      const response = await fetch("/api/create/JoinRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          pgId: pgId,
          status: "pending",
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Join request sent successfully!");
      } else {
        toast.error(data.message || "Failed to send request");
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      toast.error("Failed to send request");
    }
  };

  const createPG = async () => {
    if (!pgName || !address || !masiCharge || !baseMeal) {
      return alert("Please fill in all fields");
    }
    if (!user) return;

    const pgRef = await addDoc(collection(db, "pgs"), {
      pgName,
      address,
      masiCharge: Number(masiCharge),
      baseMeal: Number(baseMeal),
      users: [user.uid],
      requests: []
    });

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { pgId: pgRef.id, role: "admin" });
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl space-y-8"
      >
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          Select or Create a PG
        </h1>

        {/* Existing PGs */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-200">
              Available PGs
            </CardTitle>
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
            {filteredPGs.length === 0 ? (
              <p className="text-gray-400 text-center py-4">
                {searchQuery
                  ? "No PGs found matching your search"
                  : "No PGs available."}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPGs.map((pg) => (
                  <motion.div
                    key={pg.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 rounded-xl p-4 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-gray-200">
                          {pg.pgName}
                        </h3>
                        <p className="text-gray-400 text-sm">{pg.address}</p>
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                          <Users className="h-4 w-4" />
                          <span>{pg.users?.length || 0} members</span>
                        </div>
                      </div>
                      <button
                        onClick={() => requestToJoin(pg.id)}
                        className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-lg transition-all duration-300 flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" />
                        Request
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create New PG */}
        <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-200">
              Create New PG
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Enter PG Name"
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500/50 text-gray-200 placeholder-gray-400"
                value={pgName}
                onChange={(e) => setPgName(e.target.value)}
              />
            </div>

            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
              <input
                type="text"
                placeholder="Enter Address"
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500/50 text-gray-200 placeholder-gray-400"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="number"
                  placeholder="Masi Charge"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500/50 text-gray-200 placeholder-gray-400"
                  value={masiCharge}
                  onChange={(e) => setMasiCharge(e.target.value)}
                />
              </div>

              <div className="relative">
                <Coffee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-5 w-5" />
                <input
                  type="number"
                  placeholder="Base Meal"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg focus:border-blue-500/50 text-gray-200 placeholder-gray-400"
                  value={baseMeal}
                  onChange={(e) => setBaseMeal(e.target.value)}
                />
              </div>
            </div>

            <button
              className="w-full px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
              onClick={createPG}
            >
              Create PG
            </button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
