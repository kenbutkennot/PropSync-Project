"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, Polygon, useJsApiLoader } from "@react-google-maps/api";
import { Property, PropertyDraft } from "@/lib/types";
import { api } from "@/lib/api";
import { TEXT_FIELDS, NUMBER_FIELDS } from "@/components/AddPropertyModal";
import { GOOGLE_MAPS_LOADER_ID, GOOGLE_MAPS_LIBRARIES } from "@/lib/googleMapsLoader";
import AttachmentsSection from "@/components/AttachmentsSection";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const mapContainerStyle = { width: "100%", height: "100%", borderRadius: "0.5rem" };

interface Props {
  property: Property;
  onChanged: () => void;
  onClose: () => void;
}

function draftFromProperty(p: Property): PropertyDraft {
  const { id, source, ...rest } = p;
  return rest;
}

export default function PropertyWorkspace({ property, onChanged, onClose }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<PropertyDraft>(draftFromProperty(property));
  const [drawingBoundary, setDrawingBoundary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
    id: GOOGLE_MAPS_LOADER_ID,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    setDraft(draftFromProperty(property));
    setEditing(false);
    setDrawingBoundary(false);
  }, [property]);

  function update<K extends keyof PropertyDraft>(key: K, value: PropertyDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleMapClick(e: google.maps.MapMouseEvent) {
    if (!editing || !e.latLng) return;
    if (drawingBoundary) {
      const point: [number, number] = [e.latLng.lat(), e.latLng.lng()];
      update("boundary", [...(draft.boundary ?? []), point]);
    } else {
      update("latitude", e.latLng.lat());
      update("longitude", e.latLng.lng());
    }
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await api.updateProperty(property.id, draft);
      setEditing(false);
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(draftFromProperty(property));
    setEditing(false);
    setError(null);
  }

  const isNumberField = (key: keyof PropertyDraft) => NUMBER_FIELDS.some(([k]) => k === key);

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-sm text-gray-500 hover:underline">
          ← Back to properties
        </button>
        {editing ? (
          <div className="flex gap-2">
            <button onClick={handleCancel} className="text-sm text-gray-600 px-3 py-1.5">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-sm bg-green-600 text-white rounded px-3 py-1.5 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="text-sm border rounded px-3 py-1.5 hover:bg-gray-50">
            Edit
          </button>
        )}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="overflow-auto space-y-4 pr-2">
          <div>
            {editing ? (
              <input
                className="border rounded px-2 py-1 text-lg font-semibold w-full"
                value={draft.proposal_title}
                onChange={(e) => update("proposal_title", e.target.value)}
              />
            ) : (
              <h2 className="text-lg font-semibold">{property.proposal_title}</h2>
            )}
            <p className="text-xs text-gray-500">{property.listing_status ?? "—"}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[...TEXT_FIELDS, ...NUMBER_FIELDS].map(([key, label]) => (
              <div key={key} className="flex flex-col">
                <span className="text-xs text-gray-500">{label}</span>
                {editing ? (
                  <input
                    className="border rounded px-2 py-1"
                    type={isNumberField(key) ? "number" : "text"}
                    value={(draft[key] as string | number) ?? ""}
                    onChange={(e) =>
                      update(
                        key,
                        (e.target.value === "" ? null : isNumberField(key) ? Number(e.target.value) : e.target.value) as PropertyDraft[typeof key]
                      )
                    }
                  />
                ) : (
                  <span>{(property[key as keyof Property] as string | number | null) ?? "—"}</span>
                )}
              </div>
            ))}
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <AttachmentsSection propertyId={property.id} onCoverChanged={onChanged} />
        </div>

        <div className="min-h-0 flex flex-col gap-2">
          {editing && (
            <div className="flex items-center gap-3 text-xs">
              <span className="text-gray-500">
                {drawingBoundary ? "Click the map to add boundary points." : "Click the map to move the pin."}
              </span>
              <button className="text-blue-600 hover:underline" onClick={() => setDrawingBoundary((v) => !v)}>
                {drawingBoundary ? "Switch to pin mode" : "Draw/edit boundary instead"}
              </button>
              {draft.boundary && draft.boundary.length > 0 && (
                <button className="text-red-600 hover:underline" onClick={() => update("boundary", null)}>
                  Clear boundary
                </button>
              )}
            </div>
          )}

          {!GOOGLE_MAPS_KEY || !isLoaded ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm border rounded-lg">
              Loading map...
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={
                  draft.boundary?.[0]
                    ? { lat: draft.boundary[0][0], lng: draft.boundary[0][1] }
                    : draft.latitude != null
                    ? { lat: draft.latitude, lng: draft.longitude! }
                    : { lat: 3.139, lng: 101.6869 }
                }
                zoom={draft.latitude != null || draft.boundary?.length ? 15 : 6}
                onClick={handleMapClick}
                options={{ streetViewControl: false, mapTypeControl: false }}
              >
                {draft.boundary && draft.boundary.length > 0 ? (
                  <>
                    <Polygon
                      paths={draft.boundary.map(([lat, lng]) => ({ lat, lng }))}
                      options={{ fillColor: "#16a34a", fillOpacity: 0.3, strokeColor: "#16a34a" }}
                    />
                    {editing &&
                      draft.boundary.map(([lat, lng], i) => (
                        <Marker
                          key={i}
                          position={{ lat, lng }}
                          draggable
                          onDragEnd={(e) => {
                            if (!e.latLng) return;
                            const points = [...draft.boundary!];
                            points[i] = [e.latLng.lat(), e.latLng.lng()];
                            update("boundary", points);
                          }}
                        />
                      ))}
                  </>
                ) : (
                  draft.latitude != null &&
                  draft.longitude != null && (
                    <Marker
                      position={{ lat: draft.latitude, lng: draft.longitude }}
                      draggable={editing}
                      onDragEnd={(e) => {
                        if (e.latLng) {
                          update("latitude", e.latLng.lat());
                          update("longitude", e.latLng.lng());
                        }
                      }}
                    />
                  )
                )}
              </GoogleMap>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}