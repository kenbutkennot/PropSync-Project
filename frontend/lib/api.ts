import { Property, PropertyDraft } from "./types";
import { supabase } from "./supabaseClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function getAgentId(): Promise<string> {
  if (!supabase) return process.env.NEXT_PUBLIC_DEV_AGENT_ID ?? "";
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? process.env.NEXT_PUBLIC_DEV_AGENT_ID ?? "";
}

async function getAuthHeader(): Promise<string> {
  
  const { data } = await supabase?.auth.getSession() ?? { data: { session: null } };
  const token = data.session?.access_token;
  if (!token) throw new Error("Not signed in");
  return `Bearer ${token}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeader = await getAuthHeader();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export const api = {
  listProperties: (bbox?: BoundingBox) => {
    const params = bbox
      ? `?min_lat=${bbox.minLat}&min_lng=${bbox.minLng}&max_lat=${bbox.maxLat}&max_lng=${bbox.maxLng}`
      : "";
    return request<Property[]>(`/properties${params}`);
  },

  createProperty: (draft: PropertyDraft) =>
    request<Property>("/properties", {
      method: "POST",
      body: JSON.stringify(draft),
    }),

  updateProperty: (id: string, patch: Partial<PropertyDraft>) =>
    request<Property>(`/properties/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  deleteProperty: (id: string) =>
    request<void>(`/properties/${id}`, { method: "DELETE" }),

  extractFromText: (rawText: string) =>
    request<PropertyDraft>("/extract", {
      method: "POST",
      body: JSON.stringify({ raw_text: rawText }),
    }),

  importCsv: async (file: File) => {
    const authHeader = await getAuthHeader();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/import/csv`, {
      method: "POST",
      headers: { "Authorization": authHeader},
      body: form,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<{
      total_rows: number;
      imported: number;
      skipped: number;
      errors: string[];
    }>;
  },
  geocode: (address: string) =>
    request<{ latitude: number; longitude: number }>(`/extract/geocode?address=${encodeURIComponent(address)}`),
};
