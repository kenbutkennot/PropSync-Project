"use client";

import { useEffect, useState } from "react";
import {
  Attachment,
  listAttachments,
  uploadAttachment,
  setCoverAttachment,
  deleteAttachment,
  attachmentUrl,
} from "@/lib/attachments";
import { unmatchAttachment } from "@/lib/vault";

interface Props {
  propertyId: string;
  onCoverChanged?: () => void;
}

export default function AttachmentsSection({ propertyId, onCoverChanged }: Props) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      setAttachments(await listAttachments(propertyId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load attachments");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, [propertyId]);

  async function handleUpload(file: File, asCover: boolean) {
    setUploading(true);
    setError(null);
    try {
      await uploadAttachment(propertyId, file, asCover);
      await refresh();
      if (asCover) onCoverChanged?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2 border-t pt-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium">Attachments</span>
        <label className="text-xs text-blue-600 hover:underline cursor-pointer">
          {uploading ? "Uploading..." : "Upload file"}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], attachments.length === 0)}
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {loading ? (
        <p className="text-xs text-gray-400">Loading…</p>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-gray-400">No files yet — upload a photo or brochure.</p>
      ) : (
        <ul className="space-y-1">
          {attachments.map((a) => (
            <li key={a.id} className="flex items-center justify-between text-xs border rounded px-2 py-1">
              <a href={attachmentUrl(a.storage_path)} target="_blank" rel="noreferrer" className="truncate text-blue-600 hover:underline">
                {a.file_name}
              </a>
              <div className="flex items-center gap-2 shrink-0 ml-2">
                {a.is_cover ? (
                  <span className="text-green-600">Cover</span>
                ) : (
                  <button
                    className="text-gray-500 hover:underline"
                    onClick={async () => {
                      await setCoverAttachment(propertyId, a.id);
                      await refresh();
                      onCoverChanged?.();
                    }}
                  >
                    Set as cover
                  </button>
                )}
                <button
                  className="text-gray-500 hover:underline"
                  title="Send back to the vault"
                  onClick={async () => {
                    await unmatchAttachment(a.id);
                    await refresh();
                    if (a.is_cover) onCoverChanged?.();
                  }}
                >
                  Unmatch
                </button>
                <button
                  className="text-red-600 hover:underline"
                  onClick={async () => {
                    await deleteAttachment(a);
                    await refresh();
                    if (a.is_cover) onCoverChanged?.();
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}