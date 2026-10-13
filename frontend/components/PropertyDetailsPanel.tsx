"use client";

import { useState } from "react";
import { GoogleMap, Marker, Polygon, useJsApiLoader } from "@react-google-maps/api";
import { Property, PropertyDraft } from "@/lib/types";
import { api } from "@/lib/api";
import { TEXT_FIELDS, NUMBER_FIELDS } from "@/components/AddPropertyModal";
import { GOOGLE_MAPS_LOADER_ID, GOOGLE_MAPS_LIBRARIES } from "@/lib/googleMapsLoader";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const mapContainerStyle = { width: "100%", height: "240px", borderRadius: "0.5rem" };


interface Props {
    property: Property;
    onClose: () => void;
    onChanged: () => void;
}

function EditableField({
    value: initialValue,
    propertyId,
    field,
    onSaved,
    type = "text",
}: {
    value: string | number | null | undefined;
    propertyId: string;
    field: string;
    onSaved: () => void;
    type?: "text" | "number";
}) {
    const [value, setValue] = useState(initialValue ?? "");

    async function commit() {
            if (value === (initialValue ?? "")) return;
            await api.updateProperty(propertyId, {
            [field]: type === "number" ? (value === "" ? null : Number(value)) : value || null,
            });
            onSaved();
    }

    return (
        <input
            className="w-full border rounded px-2 py-1 text-sm"
            value={value}
            type={type}
            onChange={(e) => setValue(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        />
    );
}

export default function PropertyDetailsPanel({ property, onClose, onChanged }: Props) {
    const [editingBoundary, setEditingBoundary] = useState(false);
    const [boundaryDraft, setBoundaryDraft] = useState<[number, number][]>(property.boundary ?? []);
    const [saving, setSaving] = useState(false);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
        id: GOOGLE_MAPS_LOADER_ID,
        libraries: GOOGLE_MAPS_LIBRARIES,
    });

    function handleMapClick(e: google.maps.MapMouseEvent) {
        if (!e.latLng) return;
        setBoundaryDraft((pts) => [...pts, [e.latLng!.lat(), e.latLng!.lng()]]);
    }

    function handlePointDrag(index: number, e: google.maps.MapMouseEvent) {
        if (!e.latLng) return;
        setBoundaryDraft((pts) => pts.map((p, i) => (i === index ? [e.latLng!.lat(), e.latLng!.lng()] : p)));
    }

    function handlePointRemove(index: number) {
        setBoundaryDraft((pts) => pts.filter((_, i) => i !== index));
    }
    

    async function saveBoundary() {
        if (boundaryDraft.length < 3) return;
        setSaving(true);
        try {
        await api.updateProperty(property.id, { boundary: boundaryDraft, latitude: null, longitude: null });
        setEditingBoundary(false);
        onChanged();
        } finally {
        setSaving(false);
        }
    }

    async function clearBoundary() {
        setSaving(true);
        try {
            await api.updateProperty(property.id, { boundary: null });
            setBoundaryDraft([]);
            setEditingBoundary(false);
            onChanged();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex justify-end">
            <div className="bg-white h-full w-full max-w-md p-5 space-y-4 overflow-auto shadow-xl">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="font-semibold text-lg">{property.proposal_title}</h2>
                        <p className="text-xs text-gray-500">{property.listing_status ?? "—"}</p>
                    </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl leading-none">
                    &times;
                </button>
                </div>

                <div className="space-y-3 text-sm">
                <label className="flex flex-col">
                    <span className="text-xs text-gray-500">Proposal Title</span>
                    <EditableField
                    value={property.proposal_title}
                    propertyId={property.id}
                    field="proposal_title"
                    onSaved={onChanged}
                    />
                </label>

                {TEXT_FIELDS.map(([key, label]) => (
                    <label key={key} className="flex flex-col">
                    <span className="text-xs text-gray-500">{label}</span>
                    <EditableField
                        value={property[key as keyof Property] as string | null}
                        propertyId={property.id}
                        field={key}
                        onSaved={onChanged}
                    />
                    </label>
                ))}

                {NUMBER_FIELDS.map(([key, label]) => (
                    <label key={key} className="flex flex-col">
                    <span className="text-xs text-gray-500">{label}</span>
                    <EditableField
                        value={property[key as keyof Property] as number | null}
                        propertyId={property.id}
                        field={key}
                        onSaved={onChanged}
                        type="number"
                    />
                    </label>
                ))}

                <label className="flex flex-col">
                    <span className="text-xs text-gray-500">Other Info</span>
                    <EditableField
                    value={property.other_info_1}
                    propertyId={property.id}
                    field="other_info_1"
                    onSaved={onChanged}
                    />
                </label>
                <label className="flex flex-col">
                    <span className="text-xs text-gray-500">Notes</span>
                    <EditableField
                    value={property.other_info_2}
                    propertyId={property.id}
                    field="other_info_2"
                    onSaved={onChanged}
                    />
                </label>

                <div className="pt-2 border-t space-y-2">
                    <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                        {property.boundary?.length
                        ? `Land parcel — ${property.boundary.length} boundary points`
                        : property.latitude != null
                        ? `Pin at ${property.latitude.toFixed(5)}, ${property.longitude!.toFixed(5)}`
                        : "No location set"}
                    </span>
                    {!editingBoundary && (
                        <button
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => {
                            setBoundaryDraft(property.boundary ?? []);
                            setEditingBoundary(true);
                        }}
                        >
                        {property.boundary?.length ? "Edit boundary" : "Add boundary"}
                        </button>
                    )}
                    </div>

                    {editingBoundary && (
                    <>
                        <p className="text-xs text-gray-500">
                        Click the map to add a point, drag a point to move it, double-click a point to remove it.
                        </p>
                        {!GOOGLE_MAPS_KEY || !isLoaded ? (
                        <div className="h-[240px] flex items-center justify-center text-gray-400 text-sm border rounded-lg">
                            Loading map...
                        </div>
                        ) : (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={
                            boundaryDraft[0]
                                ? { lat: boundaryDraft[0][0], lng: boundaryDraft[0][1] }
                                : property.latitude != null
                                ? { lat: property.latitude, lng: property.longitude! }
                                : { lat: 3.139, lng: 101.6869 }
                            }
                            zoom={16}
                            onClick={handleMapClick}
                            options={{ streetViewControl: false, mapTypeControl: false }}
                        >
                            { property.latitude != null && property.longitude != null && (
                                <Marker
                                    position={{ lat: property.latitude, lng: property.longitude }}
                                    icon={{
                                        path: google.maps.SymbolPath.CIRCLE,
                                        scale: 8,
                                        fillColor: "#2563eb",
                                        fillOpacity: 1,
                                        strokeColor: "#fff",
                                        strokeWeight: 2,
                                    }}
                                />
                            )}
                            {boundaryDraft.map(([lat, lng], index) => (
                            <Marker
                                key={index}
                                position={{ lat, lng }}
                                draggable
                                onDragEnd={(e) => handlePointDrag(index, e)}
                                onDblClick={() => handlePointRemove(index)}
                                label={{ text: String(index + 1), color: "#fff", fontSize: "11px", fontWeight: "700" }}
                                icon={{
                                path: google.maps.SymbolPath.CIRCLE,
                                scale: 9,
                                fillColor: "#16a34a",
                                fillOpacity: 1,
                                strokeColor: "#fff",
                                strokeWeight: 2,
                                }}
                            />
                            ))}
                            {boundaryDraft.length >= 3 && (
                            <Polygon
                                paths={boundaryDraft.map(([lat, lng]) => ({ lat, lng }))}
                                options={{ fillColor: "#16a34a", fillOpacity: 0.3, strokeColor: "#16a34a" }}
                            />
                            )}
                        </GoogleMap>
                        )}
                        <div className="flex justify-between items-center">
                            <button
                                className="text-xs text-red-600 hover:underline disabled:opacity-50"
                                disabled={saving || !property.boundary?.length}
                                onClick={clearBoundary}
                            >
                                {saving ? "Clearing..." : "Clear boundary"}
                            </button>
                            <div className="flex gap-2">
                                <button
                                    className="text-xs text-gray-600 px-2 py-1"
                                    onClick={() => {
                                        setEditingBoundary(false);
                                        setBoundaryDraft(property.boundary ?? []);
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="text-xs bg-green-600 text-white rounded px-3 py-1 disabled:opacity-50"
                                    disabled={boundaryDraft.length < 3 || saving}
                                    onClick={saveBoundary}
                                >
                                    {saving ? "Saving..." : "Save boundary"}
                                </button>
                            </div>
                        </div>
                    </>
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
}