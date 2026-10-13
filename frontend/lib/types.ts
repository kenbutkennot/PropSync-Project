export interface Property {
  id: string;
  proposal_title: string;
  listing_status?: string | null;
  area?: string | null;
  category?: string | null;
  vertical_proposal?: string | null;
  horizontal_proposal?: string | null;
  agent_name?: string | null;
  source_info?: string | null;
  proposed_to?: string | null;
  lot_no?: string | null;
  zoning?: string | null;
  land_use?: string | null;
  tenure?: string | null;
  other_info_1?: string | null;
  plot_ratio_density?: string | null;
  hectare?: number | null;
  acre?: number | null;
  sqft?: number | null;
  sqm?: number | null;
  asking_psf?: number | null;
  total_price?: number | null;
  mukim?: string | null;
  district?: string | null;
  state?: string | null;
  township?: string | null;
  comm_percent?: number | null;
  comm?: number | null;
  other_info_2?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  boundary?: [number, number][] | null; // land parcels: [[lat, lng], ...]
  source: string;
}

export type PropertyDraft = Omit<Property, "id" | "source"> & {
  confidence_notes?: string | null;
};

// A listing counts as "land" (boundary-drawing UI) when its free-text
// Category mentions land/lot/plot rather than a built structure. Used to
// pre-select the location mode in the forms; the agent can always override it.
export function guessIsLand(category?: string | null): boolean {
  if (!category) return false;
  const normalized = category.trim().toLowerCase();
  return ["land", "lot", "plot", "parcel"].some((kw) => normalized.includes(kw));
}