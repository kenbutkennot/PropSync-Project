"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface Props {
  onImported: () => void;
}

export default function ImportCsvModal({ onImported }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    total_rows: number;
    imported: number;
    skipped: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.importCsv(file);
      setResult(res);
      onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
      >
        Import CSV
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-5 space-y-3">
        <h2 className="font-semibold text-lg">Import properties from CSV</h2>
        <p className="text-xs text-gray-500">
          Needs at least a Proposal Title column. Category, Total Price, Sqft, Acre, Tenure,
          Zoning, District/State/Township and the rest are picked up automatically if present —
          rows with a Coordinate column are pinned directly, others are geocoded from
          Township/Area/District/State.
        </p>

        <input
          type="file"
          accept=".csv"
          disabled={loading}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="text-sm"
        />

        {loading && <p className="text-sm text-gray-500">Importing…</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}

        {result && (
          <div className="text-sm bg-gray-50 rounded-md p-3 space-y-1">
            <p>
              Imported <strong>{result.imported}</strong> of {result.total_rows} rows
              {result.skipped > 0 && ` (${result.skipped} skipped)`}.
            </p>
            {result.errors.length > 0 && (
              <ul className="text-xs text-amber-600 list-disc pl-4 max-h-32 overflow-auto">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm text-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}