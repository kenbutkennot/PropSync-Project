"use client";

import { useAuth } from "@/lib/AuthProvider";

export default function SettingsPage() {
  const { session, signOut } = useAuth();

  return (
    <main className="h-full p-4 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="bg-white rounded-lg border p-4 max-w-md space-y-3 text-sm">
        <div>
          <span className="text-xs text-gray-500 block">Signed in as</span>
          {session?.user.email}
        </div>
        <button onClick={signOut} className="text-red-600 text-sm hover:underline">
          Sign out
        </button>
      </div>
    </main>
  );
}