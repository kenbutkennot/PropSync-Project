"use client";

import { useState } from "react";
import { GoogleMap, Marker, Polygon, useJsApiLoader } from "@react-google-maps/api";
import { api } from "@/lib/api";
import { PropertyDraft, guessIsLand } from "@/lib/types";
import { GOOGLE_MAPS_LOADER_ID, GOOGLE_MAPS_LIBRARIES } from "@/lib/googleMapsLoader";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface Props {
  onCreated: () => void;
}

const LISTING_STATUSES = ["On Market", "Under Offer", "Sold", "Withdrawn"];

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
const defaultCenter = { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur

// Text fields rendered generically below — [key, label]
export const TEXT_FIELDS: [keyof PropertyDraft, string][] = [
  ["area", "Area"],
  ["category", "Category"],
  ["vertical_proposal", "Vertical Proposal"],
  ["horizontal_proposal", "Horizontal Proposal"],
  ["agent_name", "Agent"],
  ["source_info", "Source Info"],
  ["proposed_to", "Proposed To"],
  ["lot_no", "Lot No"],
  ["zoning", "Zoning"],
  ["land_use", "Land Use"],
  ["tenure", "Tenure"],
  ["plot_ratio_density", "Plot Ratio / Density"],
  ["mukim", "Mukim"],
  ["district", "District"],
  ["state", "State"],
  ["township", "Township"],
];

export const NUMBER_FIELDS: [keyof PropertyDraft, string][] = [
  ["hectare", "Hectare"],
  ["acre", "Acre"],
  ["sqft", "Sqft"],
  ["sqm", "Sqm"],
  ["asking_psf", "Asking PSF"],
  ["total_price", "Total Price"],
  ["comm_percent", "Comm (%)"],
  ["comm", "Comm"],
];

function buildGeocodeQuery(draft: PropertyDraft): string {
  return [draft.township, draft.area, draft.district, draft.state]
    .filter((v) => v && v.trim())
    .join(", ");
}

export default function AddPropertyModal({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<PropertyDraft>(emptyDraft());
  const [locationMode, setLocationMode] = useState<"pin" | "land">("pin");
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
    id: GOOGLE_MAPS_LOADER_ID,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  function update<K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function reset() {
    setDraft(emptyDraft());
    setLocationMode("pin");
    setError(null);
  }

  async function handleLocate() {
    const query = buildGeocodeQuery(draft);
    if (!query) {
      setError("Fill in at least Township/Area/District/State first.");
      return;
    }
    setGeocoding(true);
    setError(null);
    try {
      const { latitude, longitude } = await api.geocode(query);
      update("latitude", latitude);
      update("longitude", longitude);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Geocoding failed");
    } finally {
      setGeocoding(false);
    }
  }

  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!e.latLng) return;
    const point = [e.latLng.lat(), e.latLng.lng()] as [number, number];
    setDraft((current) => ({ ...current, boundary: [...(current.boundary ?? []), point] }));
  }

  async function handleSave() {
    if (!draft.proposal_title.trim()) {
      setError("Proposal title is required.");
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
    setError(null);
    try {
      const toSave: PropertyDraft =
        locationMode === "land"
          ? { ...draft, latitude: null, longitude: null }
          : { ...draft, boundary: null };
      await api.createProperty(toSave);
      setOpen(false);
      reset();
      onCreated();
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
        className="px-3 py-1.5 rounded-md border text-sm hover:bg-gray-50"
      >
        Add property
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-5 space-y-4 max-h-[90vh] overflow-auto">
        <h2 className="font-semibold text-lg">Add property</h2>

        <div className="space-y-3 text-sm">
          <label className="flex flex-col">
            <span className="text-xs text-gray-500">Proposal Title</span>
            <input
              className="border rounded px-2 py-1"
              value={draft.proposal_title}
              onChange={(e) => update("proposal_title", e.target.value)}
            />
          </label>

          <label className="flex flex-col w-48">
            <span className="text-xs text-gray-500">Listing Status</span>
            <select
              className="border rounded px-2 py-1 bg-white"
              value={draft.listing_status ?? ""}
              onChange={(e) => update("listing_status", e.target.value || null)}
            >
              {LISTING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            {TEXT_FIELDS.map(([key, label]) => (
              <label key={key} className="flex flex-col">
                <span className="text-xs text-gray-500">{label}</span>
                <input
                  className="border rounded px-2 py-1"
                  value={(draft[key] as string) ?? ""}
                  onChange={(e) => update(key, (e.target.value || null) as PropertyDraft[typeof key])}
                />
              </label>
            ))}
            {NUMBER_FIELDS.map(([key, label]) => (
              <label key={key} className="flex flex-col">
                <span className="text-xs text-gray-500">{label}</span>
                <input
                  className="border rounded px-2 py-1"
                  type="number"
                  value={(draft[key] as number) ?? ""}
                  onChange={(e) =>
                    update(key, (e.target.value === "" ? null : Number(e.target.value)) as PropertyDraft[typeof key])
                  }
                />
              </label>
            ))}
          </div>
        </div>

        {/* Location: explicit pin vs. drawn-boundary toggle, independent of Category text */}
        <div className="space-y-2 border-t pt-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-xs text-gray-500">Location type:</span>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={locationMode === "pin"}
                onChange={() => setLocationMode("pin")}
              />
              Pin
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={locationMode === "land"}
                onChange={() => setLocationMode("land")}
              />
              Land (draw boundary)
            </label>
          </div>

          {locationMode === "land" ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Click points on the map to build the boundary. Clear to restart.
                </span>
                {draft.boundary && (
                  <button
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => update("boundary", null)}
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
                        update("latitude", e.latLng.lat());
                        update("longitude", e.latLng.lng());
                      }
                    }}
                  />
                </GoogleMap>
              )}
            </>
          )}
        </div>

        <label className="flex flex-col text-sm">
          <span className="text-xs text-gray-500">Other Info</span>
          <textarea
            className="border rounded px-2 py-1"
            value={draft.other_info_1 ?? ""}
            onChange={(e) => update("other_info_1", e.target.value || null)}
          />
        </label>
        <label className="flex flex-col text-sm">
          <span className="text-xs text-gray-500">Notes</span>
          <textarea
            className="border rounded px-2 py-1"
            value={draft.other_info_2 ?? ""}
            onChange={(e) => update("other_info_2", e.target.value || null)}
          />
        </label>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setOpen(false);
              reset();
            }}
            className="px-3 py-1.5 text-sm text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save property"}
          </button>
        </div>
      </div>
    </div>
  );
}