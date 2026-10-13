"use client";

import { useEffect, useState } from "react";
import { Property } from "@/lib/types";
import { getCoverUrls } from "@/lib/attachments";

interface Props {
  properties: Property[];
  onOpen: (id: string) => void;
}

export default function PropertyCardGrid({ properties, onOpen }: Props) {
  const [covers, setCovers] = useState<Record<string, string>>({});

  useEffect(() => {
    if (properties.length === 0) return;
    getCoverUrls(properties.map((p) => p.id)).then(setCovers);
  }, [properties]);

  return (
    <div className="h-full overflow-auto">
      <div className="grid grid-cols-4 gap-4">
        {properties.map((p) => (
          <button
            key={p.id}
            onClick={() => onOpen(p.id)}
            className="text-left bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow" 
          >
            <div className="aspect-[1/1.2] bg-gray-100 flex items-center justify-center">
              {covers[p.id] ? (
                <img src={covers[p.id]} alt={p.proposal_title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400 text-xs">No cover photo</span>
              )}
            </div>
            <div className="p-3 space-y-1">
              <div className="font-medium text-sm truncate">{p.proposal_title}</div>
              <div className="text-xs text-gray-500">{p.listing_status ?? "—"}</div>
              {p.total_price != null && <div className="text-sm font-semibold">RM{p.total_price.toLocaleString()}</div>}
            </div>
          </button>
        ))}
        {properties.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 py-12 text-sm">No properties yet.</p>
        )}
      </div>
    </div>
  );
}