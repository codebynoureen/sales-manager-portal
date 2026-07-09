"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { useState } from "react";
import type { BookerLivePosition } from "@/types/sales";

interface TerritoryMapProps {
  positions: BookerLivePosition[];
  onExceptionClick: (booker: BookerLivePosition) => void;
}

// Center on Lahore territory; swap for tenant's configured HQ coords in production.
const DEFAULT_CENTER = { lat: 31.5204, lng: 74.3587 };

export function TerritoryMap({ positions, onExceptionClick }: TerritoryMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-lg bg-gradient-to-br from-[#E8EFF9] to-[#DCE7F5] text-sm text-text-muted">
        Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      </div>
    );
  }

  return (
    <div className="relative h-[420px] overflow-hidden rounded-lg">
      <APIProvider apiKey={apiKey}>
        <Map
          mapId="distributeos-territory-map"
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={12}
          disableDefaultUI
          gestureHandling="greedy"
        >
          {positions.map((booker) => (
            <AdvancedMarker
              key={booker.bookerUserId}
              position={{ lat: booker.lat, lng: booker.lng }}
              onClick={() => booker.isException && onExceptionClick(booker)}
              onMouseEnter={() => setHoveredId(booker.bookerUserId)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="relative flex flex-col items-center">
                {(hoveredId === booker.bookerUserId || booker.isException) && (
                  <span
                    className={`mb-1 whitespace-nowrap rounded-sm px-2 py-0.5 text-[10px] font-semibold text-white ${
                      booker.isException ? "bg-danger" : "bg-secondary"
                    }`}
                  >
                    {booker.isException ? `⚠ ${booker.bookerName} — ${booker.exceptionLabel}` : booker.bookerName}
                  </span>
                )}
                <span
                  className={`h-3.5 w-3.5 -rotate-45 rounded-[50%_50%_50%_0] shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-transform hover:scale-125 ${
                    booker.isException ? "animate-pulse bg-danger" : "bg-primary"
                  }`}
                />
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-md bg-white/[0.92] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-1.5 text-sm text-text-dim">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Active Booker
        </div>
        <div className="flex items-center gap-1.5 text-sm text-text-dim">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Exception Alert
        </div>
      </div>
    </div>
  );
}