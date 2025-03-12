"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-hot-toast";
import LoadingScreen from "./Loading";
import { useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

// Define protected routes outside the component to prevent recreating on each render
const protectedRoutes = ["/dashboard", "/select-pg"];
const adminRoutes = ["/dashboard/attendance", "/dashboard/request-user"];

interface ProtectedRouteProps {
  children: ReactNode; // ✅ Type for children
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    // Only run the navigation logic once authentication status is determined
    if (!loading) {
      // Redirect unauthenticated users from protected routes
      if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
        toast.error("Unauthorized access. Please sign in.");
        router.refresh(); // Refresh the page to avoid showing the protected content
        router.push("/signin");
        return;
      }

      // Redirect non-admin users from admin routes
      if (user && user.role !== "admin" && adminRoutes.some(route => pathname.startsWith(route))) {
        toast.error("Unauthorized access. Please sign in as admin.");
        router.push("/dashboard"); // Redirect to a user-accessible page
        return;
      }
    }
  }, [user, loading, router, pathname]);

  // Show loading screen during authentication check
  if (loading) {
    return <LoadingScreen message="Checking user authentication..." />;
  }

  // Render children once authentication is verified
  return children;
}
