"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useProperties } from "@/lib/PropertiesProvider";
import PropertyCardGrid from "@/components/PropertyCardGrid";
import PropertyWorkspace from "@/components/PropertyWorkspace";


function DashboardInner() {
  const { properties, loading, refresh } = useProperties();
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("")
  const searchParams = useSearchParams();
  const router = useRouter();

  // Deep link support: /dashboard?property=<id> (used when navigating in from Properties tab)
  useEffect(() => {
    const propertyParam = searchParams.get("property");
    if (propertyParam) setOpenId(propertyParam);
  }, [searchParams]);

  function closeWorkspace() {
    setOpenId(null);
    router.replace("/dashboard");
  }

  const openProperty = properties.find((p) => p.id === openId) ?? null;

  return (
    <main className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        {!openProperty && (
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm w-64"
          />
        )}
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : openProperty ? (
        <PropertyWorkspace property={openProperty} onChanged={refresh} onClose={closeWorkspace} />
      ) : (
        <PropertyCardGrid
          properties={properties.filter((p) =>
            `${p.proposal_title} ${p.area ?? ""} ${p.district ?? ""} ${p.state ?? ""}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )}
          onOpen={(id) => router.push(`/dashboard?property=${id}`)}
        />
      )}
    </main>
  );
}

export default function DashboardPage() {
  // useSearchParams requires a Suspense boundary in the Next.js App Router
  return (
    <Suspense fallback={<div className="p-4 text-gray-500 text-sm">Loading…</div>}>
      <DashboardInner />
    </Suspense>
  );
}