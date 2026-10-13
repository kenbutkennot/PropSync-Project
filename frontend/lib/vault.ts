import { supabase } from "./supabaseClient";
import { Attachment, getOrgId } from "./attachments";

const BUCKET = "property-files";

// Storage keys reject some characters; keep the original name in the DB
// for display but use a safe version in the path.
function safeName(name: string) {
  return name.replace(/[^\w.\-]+/g, "_");
}

export async function listVaultDocs(): Promise<Attachment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("property_attachments")
    .select("*")
    .is("property_id", null)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Attachment[];
}

export async function uploadToVault(file: File): Promise<Attachment> {
  if (!supabase) throw new Error("Supabase not configured");
  const orgId = await getOrgId();
  if (!orgId) throw new Error("Could not resolve your org");

  const path = `${orgId}/vault/${Date.now()}-${safeName(file.name)}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  const { data, error } = await supabase
    .from("property_attachments")
    .insert({
      property_id: null,
      org_id: orgId,
      file_name: file.name,
      storage_path: path,
      content_type: file.type,
      is_cover: false,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Attachment;
}

export async function matchDocToProperty(docId: string, propertyId: string): Promise<void> {
  if (!supabase) return;
  const { data, error } = await supabase
    .from("property_attachments")
    .update({ property_id: propertyId })
    .eq("id", docId)
    .is("property_id", null) // only docs still in the vault
    .select("id");
  if (error) throw error;
  if (!data?.length) throw new Error("That document was already matched.");
}

export async function unmatchAttachment(attachmentId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from("property_attachments")
    .update({ property_id: null, is_cover: false }) // a cover can't live in the vault
    .eq("id", attachmentId);
  if (error) throw error;
}