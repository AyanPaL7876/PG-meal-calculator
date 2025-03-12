"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { PG } from "@/types/pg";
import { useAuth } from "@/context/AuthContext";
import { StoreUser } from "@/types/User";

interface PgContextType {
  pg: PG | null;
  users: StoreUser[];
  loading: boolean;
  fetchPGData: (pgId: string) => Promise<void>;
  getPGusers: (pgId: string) => Promise<void>;
  setUsers: React.Dispatch<React.SetStateAction<StoreUser[]>>; 
}

const PgContext = createContext<PgContextType | undefined>(undefined);

export function PgProvider({ children }: { children: React.ReactNode }) {
  const [pg, setPg] = useState<PG | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<StoreUser[]>([]);
  const { user } = useAuth();

  // 📌 Fetch PG Data
  const fetchPGData = async (pgId: string) => {
    setLoading(true);
    try {
      const pgRef = doc(db, "pgs", pgId);
      const pgSnap = await getDoc(pgRef);
      if (pgSnap.exists()) {
        setPg(pgSnap.data() as PG);
      } else {
        setPg(null);
      }
    } catch (error) {
      console.error("❌ Error fetching PG data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 📌 Fetch PG Users
  const getPGusers = async (pgId: string) => {
    if (!pgId) return;

    setLoading(true);
    try {
      const usersList: StoreUser[] = [];
      const pgRef = doc(db, "pgs", pgId);
      const pgSnap = await getDoc(pgRef);

      if (!pgSnap.exists()) {
        console.error("❌ PG not found!");
        return;
      }

      const pgData = pgSnap.data();
      const userIds: string[] = pgData?.users ?? [];

      for (const uId of userIds) {
        const userRef = doc(db, "users", uId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          usersList.push(userSnap.data() as StoreUser);
        }
      }

      setUsers(usersList);
    } catch (e) {
      console.error("❌ Error fetching PG users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.pgId) {
      fetchPGData(user.pgId);
      getPGusers(user.pgId);
    }
  }, [user?.pgId]);

  return (
    <PgContext.Provider
      value={{
        pg,
        users,
        loading,
        fetchPGData,
        getPGusers,
        setUsers,
      }}
    >
      {children}
    </PgContext.Provider>
  );
}

export function usePg() {
  const context = useContext(PgContext);
  if (!context) throw new Error("❌ usePg must be used within a PgProvider");
  return context;
}
