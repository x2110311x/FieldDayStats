import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import html2canvas from 'html2canvas';
import { QSO } from '../types';
import { gridToLatLng, resolveQsoCoordinates, calculateGreatCircleDistance, LatLng } from '../services/geo/maidenhead';
import { ARRL_SECTION_MAP } from '../services/geo/arrlSections';
import { MapPin } from 'lucide-react';

interface PropagationMapProps {
  qsos: QSO[];
  homeGrid?: string;
  homeCall?: string;
  onSnapshotCaptured?: (url: string) => void;
}

const BAND_COLORS: Record<string, string> = {
  '160M': '#9333ea',
  '80M': '#3b82f6',
  '40M': '#06b6d4',
  '20M': '#10b981',
  '15M': '#f59e0b',
  '10M': '#ef4444',
  '6M': '#ec4899',
  '2M': '#8b5cf6',
  '70CM': '#6366f1',
  SAT: '#f43f5e',
  OTH: '#64748b',
};

export const PropagationMap: React.FC<PropagationMapProps> = ({
  qsos,
  homeGrid,
  homeCall,
  onSnapshotCaptured,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const homeCoords: LatLng =
    gridToLatLng(homeGrid) ||
    (homeGrid && ARRL_SECTION_MAP.has(homeGrid.toUpperCase())
      ? { lat: ARRL_SECTION_MAP.get(homeGrid.toUpperCase())!.lat, lng: ARRL_SECTION_MAP.get(homeGrid.toUpperCase())!.lng }
      : { lat: 41.5, lng: -81.5 }); // Default Great Lakes / US Center

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [homeCoords.lat, homeCoords.lng],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Dark-mode CartoDB tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
      subdomains: 'abcd',
    }).addTo(map);

    // Home Station Marker
    const homeIcon = L.divIcon({
      className: 'custom-home-marker',
      html: `<div style="background-color: #38bdf8; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px #38bdf8;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    L.marker([homeCoords.lat, homeCoords.lng], { icon: homeIcon })
      .addTo(map)
      .bindPopup(`<b>HOME STATION (${homeCall || 'MY SITE'})</b><br/>Grid: ${homeGrid || 'N/A'}`);

    // Track bounding box coordinates across all QSOs
    const bounds = L.latLngBounds([homeCoords.lat, homeCoords.lng]);

    // Map each contact to coordinates
    const targetMap = new Map<string, { lat: number; lng: number; call: string; band: string; section: string; count: number; dist: number }>();

    for (const qso of qsos) {
      const coords = resolveQsoCoordinates(qso.grid, qso.section, qso.call);
      if (coords) {
        bounds.extend([coords.lat, coords.lng]);

        const key = `${coords.lat.toFixed(2)}_${coords.lng.toFixed(2)}`;
        const dist = calculateGreatCircleDistance(homeCoords.lat, homeCoords.lng, coords.lat, coords.lng);

        if (!targetMap.has(key)) {
          targetMap.set(key, {
            lat: coords.lat,
            lng: coords.lng,
            call: qso.call,
            band: qso.band,
            section: qso.section,
            count: 1,
            dist,
          });
        } else {
          targetMap.get(key)!.count++;
        }
      }
    }

    // Draw Great Circle arcs & markers
    targetMap.forEach((target) => {
      const isDx = target.section === 'DX' || target.dist > 3000;
      const lineColor = BAND_COLORS[target.band] || '#38bdf8';

      // Draw polyline arc
      L.polyline(
        [
          [homeCoords.lat, homeCoords.lng],
          [target.lat, target.lng],
        ],
        {
          color: isDx ? '#f59e0b' : lineColor,
          weight: isDx ? 2 : 1.2,
          opacity: isDx ? 0.8 : 0.4,
          dashArray: isDx ? '4, 4' : undefined,
        }
      ).addTo(map);

      // Target Marker
      const markerIcon = L.divIcon({
        className: 'custom-target-marker',
        html: `<div style="background-color: ${isDx ? '#f59e0b' : lineColor}; width: ${isDx ? '10px' : '7px'}; height: ${isDx ? '10px' : '7px'}; border-radius: 50%; border: 1px solid #ffffff;"></div>`,
        iconSize: [8, 8],
        iconAnchor: [4, 4],
      });

      L.marker([target.lat, target.lng], { icon: markerIcon })
        .addTo(map)
        .bindPopup(`<b>${target.call}</b> (${target.section})<br/>Band: ${target.band}<br/>Distance: ${target.dist} km`);
    });

    // Fit map view bounds so ALL QSOs fit on screen without being cut off
    if (targetMap.size > 0) {
      map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 7,
      });
    }

    // Auto-capture map snapshot after tile rendering & fitBounds completes
    const captureTimer = setTimeout(async () => {
      if (!mapContainerRef.current) return;
      try {
        const canvas = await html2canvas(mapContainerRef.current, { useCORS: true, logging: false });
        const url = canvas.toDataURL('image/png');
        if (onSnapshotCaptured) {
          onSnapshotCaptured(url);
        }
      } catch (e) {
        console.error('Auto snapshot capture error:', e);
      }
    }, 1200);

    return () => {
      clearTimeout(captureTimer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [qsos, homeGrid, homeCall]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="text-base font-bold text-slate-100">QSO Map</h2>
          </div>
        </div>
      </div>

      <div className="h-80 w-full rounded-lg overflow-hidden border border-slate-800 relative shadow-inner">
        <div ref={mapContainerRef} className="h-full w-full bg-slate-950" />
      </div>
    </div>
  );
};
