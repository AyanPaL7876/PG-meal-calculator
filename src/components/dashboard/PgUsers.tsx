"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getPGusers } from '@/services/pgService';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { MdDeleteForever } from 'react-icons/md';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { StoreUser } from '@/types/User';

export default function PGUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<StoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.pgId) return;

    const fetchUsers = async () => {
      try {
        const usersData = await getPGusers(user.pgId as string);
        setUsers(usersData || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch users.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.pgId]);

  const handleDelete = async () => {
    toast.error("Delete functionality is not yet implemented.");
    setDeleteEmail(null);
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-900 text-white">
      <div className="container mx-auto py-10">
        <h1 className="text-4xl font-extrabold text-center mb-10 bg-gradient-to-r from-blue-500 to-purple-400 bg-clip-text text-transparent">
          PG Members
        </h1>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-xl bg-gray-800/50" />
              ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {users.map((pgUser) => (
              <div
                key={pgUser.email}
                className="rounded-xl overflow-hidden shadow-lg bg-gray-800/50 backdrop-blur-md transition-transform transform hover:-translate-y-2 hover:shadow-xl relative"
              >
                {user?.role === "admin" && pgUser.email !== user.email && (
                  <button
                    onClick={() => setDeleteEmail(pgUser.email)}
                    className="absolute top-4 right-4 text-red-400 hover:text-red-300 focus:outline-none"
                    aria-label="Delete user"
                  >
                    <MdDeleteForever size={24} />
                  </button>
                )}
                <div className="p-6 text-center">
                  {pgUser.photoURL ? (
                    <Image
                      src={pgUser.photoURL}
                      alt={pgUser.name}
                      width={100}
                      height={100}
                      className="rounded-full mx-auto mb-4 border-4 border-blue-500/50 shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold">
                      {pgUser.name[0]?.toUpperCase()}
                    </div>
                  )}
                  <h3 className="text-xl font-semibold">{pgUser.name}</h3>
                  <p className="text-gray-400">{pgUser.email}</p>
                  <span
                    className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-semibold ${
                      pgUser.role === "admin"
                        ? "bg-purple-500/20 text-purple-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {pgUser.role.toUpperCase()}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    Joined: {new Date(pgUser?.joinedAt as Date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!deleteEmail} onOpenChange={() => setDeleteEmail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}