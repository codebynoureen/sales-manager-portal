"use client";

import { useState } from "react";
import type { BookerLivePosition } from "@/types/sales";

interface TerritoryMapProps {
  positions: BookerLivePosition[];
  onExceptionClick: (booker: BookerLivePosition) => void;
}

// Lahore territory bounding box — dummy projection until Google Maps API key is registered.
// TODO: once the business is registered on Google Cloud and NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
// is available, swap this file's contents for a real @vis.gl/react-google-maps implementation.
// Keep the same props signature so territory-screen.tsx doesn't need to change.
const BOUNDS = { minLat: 31.42, maxLat: 31.56, minLng: 74.26, maxLng: 74.42 };

function project(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = 100 - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { xPct: Math.min(96, Math.max(4, x)), yPct: Math.min(92, Math.max(8, y)) };
}

export function TerritoryMap({ positions, onExceptionClick }: TerritoryMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="relative h-[420px] overflow-hidden rounded-lg bg-gradient-to-br from-[#E8EFF9] to-[#DCE7F5]">
      {/* Decorative grid lines to suggest map roads — matches mockup */}
      <div className="absolute left-0 right-0 top-[19%] h-px bg-border-strong/35" />
      <div className="absolute left-0 right-0 top-[48%] h-px bg-border-strong/35" />
      <div className="absolute left-0 right-0 top-[76%] h-px bg-border-strong/35" />
      <div className="absolute bottom-0 top-0 left-[17%] w-px bg-border-strong/35" />
      <div className="absolute bottom-0 top-0 left-[45%] w-px bg-border-strong/35" />
      <div className="absolute bottom-0 top-0 left-[74%] w-px bg-border-strong/35" />
      <div className="absolute bottom-0 top-0 left-[98%] w-px bg-border-strong/35" />

      {positions.map((booker) => {
        const { xPct, yPct } = project(booker.lat, booker.lng);
        const showLabel = hoveredId === booker.bookerUserId || booker.isException;
        return (
          <div
            key={booker.bookerUserId}
            className="absolute -translate-x-1/2 -translate-y-full cursor-pointer"
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
            onClick={() => booker.isException && onExceptionClick(booker)}
            onMouseEnter={() => setHoveredId(booker.bookerUserId)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="flex flex-col items-center">
              {showLabel && (
                <span
                  className={`mb-1 -translate-y-1 whitespace-nowrap rounded-sm px-2 py-0.5 text-[10px] font-semibold text-white ${
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
          </div>
        );
      })}

      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-md bg-white/[0.92] px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-1.5 text-sm text-text-dim">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" /> Active Booker
        </div>
        <div className="flex items-center gap-1.5 text-sm text-text-dim">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Exception Alert
        </div>
      </div>

      <div className="absolute right-4 top-4 rounded-md bg-white/[0.85] px-2.5 py-1 text-[10px] font-medium text-text-muted">
        Preview map — live GPS pending Google Maps setup
      </div>
    </div>
  );
}
