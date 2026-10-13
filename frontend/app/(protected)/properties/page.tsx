"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProperties } from "@/lib/PropertiesProvider";
import PropertyGrid from "@/components/PropertyGrid";
import ImportCsvModal from "@/components/ImportCsvModal";
import ExtractPasteBox from "@/components/ExtractPasteBox";
import AddPropertyModal from "@/components/AddPropertyModal";

const LISTING_STATUSES = ["On Market", "Under Offer", "Sold", "Withdrawn"];

export default function PropertiesPage() {
  const { properties, loading, refresh } = useProperties();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const router = useRouter();

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (statusFilter && p.listing_status !== statusFilter) return false;
      if (!search) return true;
      const haystack = `${p.proposal_title} ${p.category ?? ""} ${p.area ?? ""} ${p.district ?? ""} ${p.state ?? ""} ${p.agent_name ?? ""}`.toLowerCase();
      return haystack.includes(search.toLowerCase());
    });
  }, [properties, search, statusFilter]);

  return (
    <main className="h-full flex flex-col p-4 gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Properties</h1>
        <div className="flex gap-2">
          <ImportCsvModal onImported={refresh} />
          <ExtractPasteBox onSaved={refresh} />
          <AddPropertyModal onCreated={refresh} />
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search properties..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm flex-1 max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-md px-3 py-1.5 text-sm bg-white"
        >
          <option value="">All statuses</option>
          {LISTING_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading…</p>
      ) : (
        <div className="flex-1 min-h-0">
          <PropertyGrid
            properties={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChanged={refresh}
            onView={(id) => router.push(`/dashboard?property=${id}`)}
          />
        </div>
      )}
    </main>
  );
}