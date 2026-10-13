"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase isn't configured — check NEXT_PUBLIC_SUPABASE_URL/ANON_KEY.");
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="h-full flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white rounded-lg shadow-md p-8 w-full max-w-sm space-y-4">
        <h1 className="text-xl font-semibold text-center">PropSync</h1>
        <label className="flex flex-col text-sm">
          <span className="text-xs text-gray-500 mb-1">Email</span>
          <input
            type="email"
            required
            className="border rounded px-3 py-2"
            value={email}
            onChange={(e) => {
              const val = e.target.value;
              setEmail(val);
              if (/^\S+@\S+\.\S+$/.test(val)) {
                router.prefetch("/dashboard");
              }
            }}
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="text-xs text-gray-500 mb-1">Password</span>
          <input type="password" required className="border rounded px-3 py-2" value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white rounded py-2 text-sm disabled:opacity-50">
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}