import { supabase } from "./supabaseClient";

export interface Attachment {
  id: string;
  property_id: string | null;
  file_name: string;
  storage_path: string;
  content_type: string | null;
  is_cover: boolean;
  created_at: string;
}

const BUCKET = "property-files";

export async function getOrgId(): Promise<string | null> {
  if (!supabase) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) return null;
  const { data } = await supabase.from("agents").select("org_id").eq("id", userId).single();
  return data?.org_id ?? null;
}

export function attachmentUrl(path: string): string {
  return supabase!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function listAttachments(propertyId: string): Promise<Attachment[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("property_attachments")
    .select("*")
    .eq("property_id", propertyId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data as Attachment[];
}

export async function uploadAttachment(propertyId: string, file: File, setCover = false): Promise<Attachment> {
  if (!supabase) throw new Error("Supabase not configured");
  const orgId = await getOrgId();
  if (!orgId) throw new Error("Could not resolve your org");

  const path = `${orgId}/${propertyId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadError) throw uploadError;

  if (setCover) {
    await supabase
      .from("property_attachments")
      .update({ is_cover: false })
      .eq("property_id", propertyId)
      .eq("is_cover", true);
  }

  const { data, error } = await supabase
    .from("property_attachments")
    .insert({
      property_id: propertyId,
      org_id: orgId,
      file_name: file.name,
      storage_path: path,
      content_type: file.type,
      is_cover: setCover,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Attachment;
}

export async function setCoverAttachment(propertyId: string, attachmentId: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("property_attachments").update({ is_cover: false }).eq("property_id", propertyId).eq("is_cover", true);
  await supabase.from("property_attachments").update({ is_cover: true }).eq("id", attachmentId);
}

export async function deleteAttachment(attachment: Attachment): Promise<void> {
  if (!supabase) return;
  await supabase.storage.from(BUCKET).remove([attachment.storage_path]);
  await supabase.from("property_attachments").delete().eq("id", attachment.id);
}

export async function getCoverUrls(propertyIds: string[]): Promise<Record<string, string>> {
  if (!supabase || propertyIds.length === 0) return {};
  const { data, error } = await supabase
    .from("property_attachments")
    .select("property_id, storage_path")
    .in("property_id", propertyIds)
    .eq("is_cover", true);
  if (error || !data) return {};
  const map: Record<string, string> = {};
  for (const row of data) map[row.property_id] = attachmentUrl(row.storage_path);
  return map;
}