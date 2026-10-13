"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";
import Sidebar from "@/components/Sidebar";
import { PropertiesProvider } from '@/lib/PropertiesProvider';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      router.replace("/login");
    }
  }, [loading, session, router]);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-gray-500">Loading...</div>;
  }
  if (!session) {
    return null; // redirecting
  }

  return (
    <div className="h-full flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <PropertiesProvider>
          {children}
        </PropertiesProvider>
      </div>
    </div>
  );
}