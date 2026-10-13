"use client";

import { useEffect, useMemo, useState } from "react";
import { useProperties } from "@/lib/PropertiesProvider";
import { Attachment, attachmentUrl, deleteAttachment } from "@/lib/attachments";
import { listVaultDocs, uploadToVault, matchDocToProperty } from "@/lib/vault";
import { Property } from "@/lib/types";

// Custom drag type so property rows only react to vault docs, not to
// random text or files dragged in from elsewhere.
const DRAG_TYPE = "application/x-vault-doc";

export default function VaultPage() {
  const { properties, loading: propsLoading } = useProperties();
  const [docs, setDocs] = useState<Attachment[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverPropertyId, setHoverPropertyId] = useState<string | null>(null);
  const [flashPropertyId, setFlashPropertyId] = useState<string | null>(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  async function refreshDocs() {
    try {
      setDocs(await listVaultDocs());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load vault");
    } finally {
      setDocsLoading(false);
    }
  }

  useEffect(() => {
    refreshDocs();
  }, []);

  async function handleFiles(files: FileList | File[]) {
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await uploadToVault(file);
      }
      await refreshDocs();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function assign(doc: Attachment, property: Property) {
    setDocs((prev) => prev.filter((d) => d.id !== doc.id)); // optimistic
    try {
      await matchDocToProperty(doc.id, property.id);
      setFlashPropertyId(property.id);
      setToast(`Attached "${doc.file_name}" to ${property.proposal_title}`);
      setTimeout(() => setFlashPropertyId(null), 1200);
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      setDocs((prev) => [doc, ...prev]); // roll back
      setError(e instanceof Error ? e.message : "Could not match document");
    }
  }

  const filteredProperties = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return properties;
    return properties.filter((p) =>
      `${p.proposal_title} ${p.lot_no ?? ""} ${p.district ?? ""} ${p.state ?? ""}`.toLowerCase().includes(q)
    );
  }, [properties, search]);

  function rowClasses(id: string) {
    const base =
      "border rounded-lg px-3 py-2 bg-white transition-all duration-150 flex items-center justify-between";
    if (flashPropertyId === id)
      return `${base} border-green-500 ring-2 ring-green-400 shadow-[0_0_14px_rgba(34,197,94,0.55)] bg-green-50`;
    if (hoverPropertyId === id)
      return `${base} border-indigo-500 ring-2 ring-indigo-400 shadow-[0_0_14px_rgba(99,102,241,0.55)] bg-indigo-50 scale-[1.01]`;
    if (draggingId) return `${base} border-dashed border-indigo-300`;
    return base;
  }

  return (
    <main className="h-full flex flex-col p-4 gap-4">
      <div>
        <h1 className="text-xl font-semibold">Document Vault</h1>
        <p className="text-sm text-gray-500">
          Document matching: drag a document onto a property to attach it.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</div>
      )}

      <div className="flex-1 grid grid-cols-[2fr_3fr] gap-4 min-h-0">
        {/* Left: vault */}
        <section className="flex flex-col gap-3 min-h-0">
          <div
            onDragOver={(e) => {
              if (!Array.from(e.dataTransfer.types).includes("Files")) return;
              e.preventDefault();
              setFileDragOver(true);
            }}
            onDragLeave={() => setFileDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setFileDragOver(false);
              if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-lg p-4 text-center text-sm transition-all ${
              fileDragOver
                ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-400 shadow-[0_0_14px_rgba(99,102,241,0.55)]"
                : "border-gray-300 text-gray-500"
            }`}
          >
            {uploading ? (
              "Uploading…"
            ) : (
              <>
                Drop files here or{" "}
                <label className="text-indigo-600 hover:underline cursor-pointer">
                  browse
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                  />
                </label>
              </>
            )}
          </div>

          <div className="flex-1 overflow-auto space-y-2">
            {docsLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : docs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">
                Vault is empty. Upload documents to match them to properties.
              </p>
            ) : (
              docs.map((doc) => {
                const isImage = doc.content_type?.startsWith("image/");
                const ext = doc.file_name.split(".").pop()?.toUpperCase() ?? "FILE";
                return (
                  <div
                    key={doc.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData(DRAG_TYPE, doc.id);
                      e.dataTransfer.effectAllowed = "move";
                      setDraggingId(doc.id);
                    }}
                    onDragEnd={() => {
                      setDraggingId(null);
                      setHoverPropertyId(null);
                    }}
                    className={`flex items-center gap-3 border rounded-lg bg-white p-2 cursor-grab active:cursor-grabbing select-none ${
                      draggingId === doc.id ? "opacity-40" : ""
                    }`}
                  >
                    {isImage ? (
                      <img
                        src={attachmentUrl(doc.storage_path)}
                        alt=""
                        draggable={false}
                        className="w-10 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-[10px] font-semibold text-gray-500">
                        {ext.slice(0, 4)}
                      </div>
                    )}
                    <span className="flex-1 truncate text-sm">{doc.file_name}</span>
                    <select
                      className="text-xs border rounded px-1 py-0.5 bg-white max-w-[9rem]"
                      value=""
                      onChange={(e) => {
                        const property = properties.find((p) => p.id === e.target.value);
                        if (property) assign(doc, property);
                      }}
                    >
                      <option value="">Assign to…</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.proposal_title}
                          {p.lot_no ? ` (Lot ${p.lot_no})` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={async () => {
                        if (!confirm(`Delete "${doc.file_name}"?`)) return;
                        await deleteAttachment(doc);
                        refreshDocs();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right: property drop targets */}
        <section className="flex flex-col gap-3 min-h-0">
          <input
            type="text"
            placeholder="Search properties by title, lot no, district…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-md px-3 py-1.5 text-sm"
          />
          <div className="flex-1 overflow-auto space-y-2 p-3 -m-3">
            {propsLoading ? (
              <p className="text-sm text-gray-400">Loading…</p>
            ) : (
              filteredProperties.map((p) => (
                <div
                  key={p.id}
                  onDragOver={(e) => {
                    if (!Array.from(e.dataTransfer.types).includes(DRAG_TYPE)) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (hoverPropertyId !== p.id) setHoverPropertyId(p.id);
                  }}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHoverPropertyId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const docId = e.dataTransfer.getData(DRAG_TYPE);
                    const doc = docs.find((d) => d.id === docId);
                    // Reset here, not only in onDragEnd: the dragged card is removed
                    // from the list on drop, and dragend doesn't fire on removed elements.
                    setHoverPropertyId(null);
                    setDraggingId(null);
                    if (doc) assign(doc, p);
                  }}
                  className={rowClasses(p.id)}
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{p.proposal_title}</div>
                    <div className="text-xs text-gray-500 truncate">
                      {[p.lot_no && `Lot ${p.lot_no}`, p.district, p.state].filter(Boolean).join(" · ") || "—"}
                    </div>
                  </div>
                  {hoverPropertyId === p.id && (
                    <span className="text-xs text-indigo-600 shrink-0 ml-2">Drop to attach</span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white text-sm rounded-md px-4 py-2 shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}