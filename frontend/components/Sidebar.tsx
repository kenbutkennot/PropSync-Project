"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/vault", label: "Document Vault" },
  { href: "/settings", label: "Settings" },
  
];

export default function Sidebar() {
  const pathname = usePathname();
  const { session, signOut } = useAuth();

  return (
    <aside className="w-56 shrink-0 bg-white border-r h-full flex flex-col">
      <div className="p-4 font-semibold text-lg border-b">PropSync</div>
      <nav className="flex-1 p-2 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`block px-3 py-2 rounded-md text-sm ${
              pathname === item.href ? "bg-indigo-50 text-indigo-700 font-medium" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t text-xs text-gray-500">
        <div className="truncate mb-2">{session?.user.email}</div>
        <button onClick={signOut} className="text-red-600 hover:underline">
          Sign out
        </button>
      </div>
    </aside>
  );
}