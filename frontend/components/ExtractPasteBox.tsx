"use client";

import { useState } from "react";
import { GoogleMap, Marker, Polygon, useJsApiLoader } from "@react-google-maps/api";
import { api } from "@/lib/api";
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_LOADER_ID } from "@/lib/googleMapsLoader";
import { PropertyDraft, guessIsLand } from "@/lib/types";

interface Props {
  onSaved: () => void;
}

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const emptyDraft = (): PropertyDraft => ({
  proposal_title: "",
  listing_status: "On Market",
  area: null,
  category: null,
  vertical_proposal: null,
  horizontal_proposal: null,
  agent_name: null,
  source_info: null,
  proposed_to: null,
  lot_no: null,
  zoning: null,
  land_use: null,
  tenure: null,
  other_info_1: null,
  plot_ratio_density: null,
  hectare: null,
  acre: null,
  sqft: null,
  sqm: null,
  asking_psf: null,
  total_price: null,
  mukim: null,
  district: null,
  state: null,
  township: null,
  comm_percent: null,
  comm: null,
  other_info_2: null,
  latitude: null,
  longitude: null,
  boundary: null,
});

const mapContainerStyle = { width: "100%", height: "280px", borderRadius: "0.5rem" };
const defaultCenter = { lat: 3.139, lng: 101.6869 };

// Fields shown in the editable review grid after extraction. Add more from
// PropertyDraft here if you want the agent able to correct them pre-save.
const REVIEW_FIELDS: [keyof PropertyDraft, string][] = [
  ["proposal_title", "Proposal Title"],
  ["category", "Category"],
  ["area", "Area"],
  ["township", "Township"],
  ["district", "District"],
  ["state", "State"],
  ["total_price", "Total Price"],
  ["asking_psf", "Asking PSF"],
  ["sqft", "Sqft"],
  ["acre", "Acre"],
  ["tenure", "Tenure"],
  ["zoning", "Zoning"],
];

function buildGeocodeQuery(draft: PropertyDraft): string {
  return [draft.township, draft.area, draft.district, draft.state]
    .filter((v) => v && v.trim())
    .join(", ");
}

export default function ExtractPasteBox({ onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [rawText, setRawText] = useState("");
  const [draft, setDraft] = useState<PropertyDraft | null>(null);
  const [locationMode, setLocationMode] = useState<"pin" | "land">("pin");
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
    id: GOOGLE_MAPS_LOADER_ID,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  function updateDraft<K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  async function handleExtract() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.extractFromText(rawText);
      const merged = { ...emptyDraft(), ...result };
      setDraft(merged);
      setLocationMode(guessIsLand(merged.category) ? "land" : "pin");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLocate() {
    if (!draft) return;
    const query = buildGeocodeQuery(draft);
    if (!query) {
      setError("Need at least a Township/Area/District/State to locate it.");
      return;
    }
    setGeocoding(true);
    setError(null);
    try {
      const { latitude, longitude } = await api.geocode(query);
      updateDraft("latitude", latitude);
      updateDraft("longitude", longitude);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Geocoding failed");
    } finally {
      setGeocoding(false);
    }
  }

  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!e.latLng || !draft) return;
    const point = [e.latLng.lat(), e.latLng.lng()] as [number, number];
    setDraft((current) =>
      current ? { ...current, boundary: [...(current.boundary ?? []), point] } : current
    );
  }

  async function handleSave() {
    if (!draft || !draft.proposal_title.trim()) {
      setError("Proposal title is required before saving.");
      return;
    }
    if (locationMode === "land" && (!draft.boundary || draft.boundary.length < 3)) {
      setError("Draw the land boundary on the map before saving.");
      return;
    }
    if (locationMode === "pin" && (draft.latitude == null || draft.longitude == null)) {
      setError("Locate the property on the map before saving.");
      return;
    }

    setLoading(true);
    try {
      const toSave: PropertyDraft =
        locationMode === "land" ? { ...draft, latitude: null, longitude: null } : { ...draft, boundary: null };
      await api.createProperty(toSave);
      setOpen(false);
      setRawText("");
      setDraft(null);
      setLocationMode("pin");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700"
      >
        Paste owner message
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-5 space-y-3 max-h-[90vh] overflow-auto">
        <h2 className="font-semibold text-lg">Extract listing from text</h2>

        {!draft ? (
          <>
            <textarea
              className="w-full border rounded-md p-2 text-sm h-32"
              placeholder="Paste the owner's WhatsApp message here..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-3 py-1.5 text-sm text-gray-600">
                Cancel
              </button>
              <button
                onClick={handleExtract}
                disabled={loading || !rawText.trim()}
                className="px-3 py-1.5 rounded-md bg-indigo-600 text-white text-sm disabled:opacity-50"
              >
                {loading ? "Extracting..." : "Extract"}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-xs text-gray-500">
              Review before saving - nothing here is written to the database yet.
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm max-h-64 overflow-auto pr-1">
              {REVIEW_FIELDS.map(([key, label]) => (
                <label key={key} className="flex flex-col col-span-1">
                  <span className="text-xs text-gray-500">{label}</span>
                  <input
                    className="border rounded px-2 py-1"
                    value={(draft[key] as string | number | null) ?? ""}
                    onChange={(e) =>
                      updateDraft(key, (e.target.value === "" ? null : e.target.value) as PropertyDraft[typeof key])
                    }
                  />
                </label>
              ))}
              <label className="flex flex-col col-span-2">
                <span className="text-xs text-gray-500">Notes</span>
                <textarea
                  className="border rounded px-2 py-1"
                  value={draft.other_info_2 ?? ""}
                  onChange={(e) => updateDraft("other_info_2", e.target.value || null)}
                />
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-xs text-gray-500">Location type:</span>
                <label className="flex items-center gap-1">
                  <input type="radio" checked={locationMode === "pin"} onChange={() => setLocationMode("pin")} />
                  Pin
                </label>
                <label className="flex items-center gap-1">
                  <input type="radio" checked={locationMode === "land"} onChange={() => setLocationMode("land")} />
                  Land (draw boundary)
                </label>
              </div>

              {locationMode === "land" ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Click points on the map to build the land boundary. Clear boundary to restart.
                    </span>
                    {draft.boundary && (
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => updateDraft("boundary", null)}
                      >
                        Clear boundary
                      </button>
                    )}
                  </div>
                  {!GOOGLE_MAPS_KEY || !isLoaded ? (
                    <div className="h-[280px] flex items-center justify-center text-gray-400 text-sm border rounded-lg">
                      Loading map...
                    </div>
                  ) : (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={draft.boundary?.[0] ? { lat: draft.boundary[0][0], lng: draft.boundary[0][1] } : defaultCenter}
                      zoom={draft.boundary ? 16 : 12}
                      onClick={handleMapClick}
                      options={{ streetViewControl: false, mapTypeControl: false }}
                    >
                      {draft.boundary?.map(([lat, lng], index) => (
                        <Marker
                          key={`${lat}-${lng}-${index}`}
                          position={{ lat, lng }}
                          label={{ text: String(index + 1), color: "#ffffff", fontSize: "11px", fontWeight: "700" }}
                          icon={{
                            path: google.maps.SymbolPath.CIRCLE,
                            scale: 9,
                            fillColor: "#16a34a",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                          }}
                        />
                      ))}
                      {draft.boundary && draft.boundary.length >= 3 && (
                        <Polygon
                          paths={draft.boundary.map(([lat, lng]) => ({ lat, lng }))}
                          options={{ fillColor: "#16a34a", fillOpacity: 0.3, strokeColor: "#16a34a" }}
                        />
                      )}
                    </GoogleMap>
                  )}
                </>
              ) : (
                <>
                  <div className="flex gap-2">
                    <button
                      onClick={handleLocate}
                      disabled={geocoding}
                      className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {geocoding ? "Locating..." : "Locate on map"}
                    </button>
                    {draft.latitude != null && (
                      <span className="text-xs text-gray-500 self-center">
                        {draft.latitude.toFixed(5)}, {draft.longitude!.toFixed(5)} - drag the pin to adjust
                      </span>
                    )}
                  </div>
                  {GOOGLE_MAPS_KEY && isLoaded && draft.latitude != null && draft.longitude != null && (
                    <GoogleMap
                      mapContainerStyle={mapContainerStyle}
                      center={{ lat: draft.latitude, lng: draft.longitude }}
                      zoom={15}
                      options={{ streetViewControl: false, mapTypeControl: false }}
                    >
                      <Marker
                        position={{ lat: draft.latitude, lng: draft.longitude }}
                        draggable
                        onDragEnd={(e) => {
                          if (e.latLng) {
                            updateDraft("latitude", e.latLng.lat());
                            updateDraft("longitude", e.latLng.lng());
                          }
                        }}
                      />
                    </GoogleMap>
                  )}
                </>
              )}
            </div>

            {(draft as any).confidence_notes && (
              <p className="text-xs text-amber-600">Model flagged: {(draft as any).confidence_notes}</p>
            )}
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <div className="flex justify-end gap-2">
              <button onClick={() => setDraft(null)} className="px-3 py-1.5 text-sm text-gray-600">
                Back
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save property"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}