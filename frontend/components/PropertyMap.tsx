"use client";

import { Fragment, useCallback, useRef } from "react";
import { GoogleMap, Marker, Polygon, InfoWindow, useJsApiLoader } from "@react-google-maps/api";
import { GOOGLE_MAPS_LOADER_ID, GOOGLE_MAPS_LIBRARIES } from "@/lib/googleMapsLoader";
import { Property } from "@/lib/types";

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

interface Props {
  properties: Property[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// Adjust these to match whatever values LISTING_STATUSES in PropertyGrid.tsx uses.
const statusColor: Record<string, string> = {
  "On Market": "#16a34a",
  "Under Offer": "#eab308",
  Sold: "#dc2626",
  Withdrawn: "#6b7280",
};
const fallbackColor = "#2563eb";

const containerStyle = { width: "100%", height: "100%", borderRadius: "0.5rem" };
const defaultCenter = { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur - adjust if your agents work elsewhere
const defaultZoom = 6;

export default function PropertyMap({ properties, selectedId, onSelect }: Props) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY ?? "",
    id: GOOGLE_MAPS_LOADER_ID,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  // Pin vs polygon is decided purely by which data the property actually
  // has, not by a type label — a listing with a drawn boundary always
  // renders as a polygon, everything else with coordinates gets a pin.
  const parcels = properties.filter((p) => p.boundary && p.boundary.length > 0);
  const pinned = properties.filter(
    (p) => (!p.boundary || p.boundary.length === 0) && p.latitude != null && p.longitude != null
  );

  const selected = properties.find((p) => p.id === selectedId) ?? null;

  const getLandCenter = useCallback((p: Property) => {
    if (!p.boundary || p.boundary.length === 0) return null;
    const total = p.boundary.reduce(
      (acc, [lat, lng]) => {
        acc.lat += lat;
        acc.lng += lng;
        return acc;
      },
      { lat: 0, lng: 0 }
    );
    return { lat: total.lat / p.boundary.length, lng: total.lng / p.boundary.length };
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  // Sheet -> map sync: pan/zoom to whichever row was clicked in the grid.
  const flyTo = useCallback((p: Property) => {
    if (!mapRef.current) return;
    if (p.boundary?.length) {
      const bounds = new google.maps.LatLngBounds();
      p.boundary.forEach(([lat, lng]) => bounds.extend({ lat, lng }));
      mapRef.current.fitBounds(bounds, 40);
    } else if (p.latitude != null && p.longitude != null) {
      mapRef.current.panTo({ lat: p.latitude, lng: p.longitude });
      mapRef.current.setZoom(15);
    }
  }, []);

  const handleSelect = (p: Property) => {
    onSelect(p.id);
    flyTo(p);
  };

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 border rounded-lg bg-gray-50 text-sm p-4 text-center">
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local to render the map.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 border rounded-lg bg-gray-50 text-sm">
        Loading map...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={defaultZoom}
      onLoad={onLoad}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {pinned.map((p) => (
        <Marker
          key={p.id}
          position={{ lat: p.latitude!, lng: p.longitude! }}
          onClick={() => handleSelect(p)}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: p.id === selectedId ? 9 : 6,
            fillColor: statusColor[p.listing_status ?? ""] ?? fallbackColor,
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          }}
        />
      ))}

      {parcels.map((p) => {
        const landCenter = getLandCenter(p);
        const color = statusColor[p.listing_status ?? ""] ?? fallbackColor;

        return (
          <Fragment key={p.id}>
            <Polygon
              paths={p.boundary!.map(([lat, lng]) => ({ lat, lng }))}
              onClick={() => handleSelect(p)}
              options={{
                fillColor: color,
                fillOpacity: p.id === selectedId ? 0.45 : 0.25,
                strokeColor: color,
                strokeWeight: p.id === selectedId ? 3 : 2,
              }}
            />
            {landCenter && (
              <Marker
                position={landCenter}
                onClick={() => handleSelect(p)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: p.id === selectedId ? 9 : 6,
                  fillColor: color,
                  fillOpacity: 1,
                  strokeColor: "#ffffff",
                  strokeWeight: 2,
                }}
              />
            )}
          </Fragment>
        );
      })}

      {selected && (
        <InfoWindow
          position={
            selected.boundary?.length
              ? getLandCenter(selected)!
              : { lat: selected.latitude!, lng: selected.longitude! }
          }
          onCloseClick={() => onSelect("")}
        >
          <div className="text-sm cursor-pointer select-none" onClick={() => handleSelect(selected)}>
            <div className="font-medium">{selected.proposal_title}</div>
            {selected.total_price != null && <div>RM{selected.total_price.toLocaleString()}</div>}
            <div className="text-gray-500">{selected.listing_status ?? "—"}</div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}