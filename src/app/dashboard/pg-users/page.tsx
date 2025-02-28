"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { MdDeleteForever } from "react-icons/md";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  name: string;
  email: string;
  photoURL: string;
  role: string;
  joinedAt: string;
}

export default function PGUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteEmail, setDeleteEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.pgId) return;

      try {
        const response = await fetch(`/api/get/Users?pgId=${user.pgId}`);
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
        } else {
          toast.error(data.message || 'Failed to fetch users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user?.pgId]);

  const handleDelete = async () => {
    if (!deleteEmail || !user?.pgId) return;

    try {
      const response = await fetch('/api/delete/user', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: deleteEmail,
          pgId: user.pgId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers(users.filter(u => u.email !== deleteEmail));
        toast.success('User removed successfully', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#10B981',
            color: '#fff',
            padding: '16px',
          },
        });
      } else {
        toast.error(data.message || 'Failed to remove user', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#EF4444',
            color: '#fff',
            padding: '16px',
          },
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to remove user');
    }

    setDeleteEmail(null);
  };

  return (
    <div className="pt-20 px-4 max-w-full mx-auto min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Card className="bg-gray-900/40 backdrop-blur-sm border-gray-700/50 text-gray-100 shadow-2xl max-w-7xl mx-auto">
        <CardHeader className="border-b border-gray-700/50">
          <CardTitle className="text-4xl font-bold text-center bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent tracking-tight font-logo">
            PG Members Directory
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 w-full bg-gray-800/50" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {users.map((pgUser) => (
                <Card 
                  key={pgUser.email} 
                  className="bg-gray-800/30 backdrop-blur-sm border-gray-700/50 hover:bg-gray-800/50 transition-all duration-300 relative group hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
                >
                  {user?.role === 'admin' && pgUser.email !== user.email && (
                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-1">
                      <div className="p-2 bg-transparent border-2 border-red-500 rounded-full shadow-lg hover:shadow-red-500/20 backdrop-blur-sm">
                        <MdDeleteForever
                          onClick={() => setDeleteEmail(pgUser.email)}
                          size={20}
                          className="text-red-500 hover:text-red-400 cursor-pointer transition-colors"
                          role="button"
                          tabIndex={0}
                          aria-label="Delete user"
                        />
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-6">
                      <div className="relative w-28 h-28 transform transition-all duration-300 group-hover:scale-105">
                        {pgUser.photoURL ? (
                          <div className="relative w-28 h-28">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse" />
                            <Image
                              src={pgUser.photoURL}
                              alt={pgUser.name}
                              fill
                              className="rounded-full object-cover border-4 border-gray-800 group-hover:border-blue-500/50 transition-colors z-10"
                            />
                          </div>
                        ) : (
                          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-gray-800 group-hover:border-blue-500/50 transition-all duration-300 shadow-lg group-hover:shadow-blue-500/20">
                            <span className="text-4xl font-bold text-white">
                              {pgUser.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-center space-y-3">
                        <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 group-hover:to-pink-400 transition-colors">
                          {pgUser.name}
                        </h3>
                        <p className="text-gray-400 font-medium tracking-wide">
                          {pgUser.email}
                        </p>
                        <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider ${
                          pgUser.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-300 group-hover:bg-purple-500/20 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-300 group-hover:bg-blue-500/20 border border-blue-500/20'
                        } transition-all duration-300`}>
                          {pgUser.role.toUpperCase()}
                        </span>
                        <p className="text-gray-500 text-sm font-medium tracking-wide">
                          Joined: {new Date(pgUser.joinedAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteEmail} onOpenChange={(open) => !open && setDeleteEmail(null)}>
        <AlertDialogContent className="bg-gray-800/95 backdrop-blur-sm border-gray-700/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
              Confirm User Removal
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to remove this user from the PG? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-700/50 text-gray-100 hover:bg-gray-600/50 border-gray-600"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30"
            >
              Remove User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}