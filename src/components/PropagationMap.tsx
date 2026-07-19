import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import html2canvas from 'html2canvas';
import { QSO } from '../types';
import { gridToLatLng, resolveQsoCoordinates, calculateDistanceMiles } from '../services/geo/maidenhead';
import { Camera, Compass, MapPin } from 'lucide-react';

interface PropagationMapProps {
  qsos: QSO[];
  homeGrid: string;
  homeCall: string;
  onSnapshotCaptured?: (dataUrl: string) => void;
}

const BAND_COLORS: Record<string, string> = {
  '160M': '#a855f7',
  '80M': '#6366f1',
  '40M': '#3b82f6',
  '20M': '#22c55e',
  '15M': '#eab308',
  '10M': '#f97316',
  '6M': '#ef4444',
  '2M': '#ec4899',
  '1.25M': '#d946ef',
  '70CM': '#8b5cf6',
  OTH: '#94a3b8',
};

export const PropagationMap: React.FC<PropagationMapProps> = ({
  qsos,
  homeGrid,
  homeCall,
  onSnapshotCaptured,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const [colorMode, setColorMode] = useState<'band' | 'mode'>('band');
  const [maxDistance, setMaxDistance] = useState(0);
  const [farthestCall, setFarthestCall] = useState('');
  const [isSnapshotting, setIsSnapshotting] = useState(false);

  const homeCoords = gridToLatLng(homeGrid) || { lat: 41.6, lng: -72.7 };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map
    if (!leafletMapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([homeCoords.lat, homeCoords.lng], 4);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      leafletMapRef.current = map;
    }

    const map = leafletMapRef.current;
    map.setView([homeCoords.lat, homeCoords.lng], map.getZoom());

    // Clear existing markers & layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer);
      }
    });

    // Home Station Marker
    const homeIcon = L.divIcon({
      className: 'custom-home-icon',
      html: `<div style="background-color: #ef4444; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 12px #ef4444;"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });

    L.marker([homeCoords.lat, homeCoords.lng], { icon: homeIcon })
      .addTo(map)
      .bindPopup(`<b>${homeCall || 'HOME STATION'}</b><br/>Grid: ${homeGrid}`);

    let maxDist = 0;
    let maxCallStr = 'N/A';

    // Group QSOs by Grid / Coordinates
    const targetMap = new Map<string, { lat: number; lng: number; qsos: QSO[] }>();

    for (const qso of qsos) {
      const targetCoords = resolveQsoCoordinates(qso.grid, qso.section, qso.call);
      const key = `${targetCoords.lat.toFixed(2)}_${targetCoords.lng.toFixed(2)}`;

      if (!targetMap.has(key)) {
        targetMap.set(key, { lat: targetCoords.lat, lng: targetCoords.lng, qsos: [] });
      }
      targetMap.get(key)!.qsos.push(qso);

      const dist = calculateDistanceMiles(homeCoords, targetCoords);
      if (dist > maxDist) {
        maxDist = dist;
        maxCallStr = `${qso.call} (${dist} mi)`;
      }
    }

    setMaxDistance(maxDist);
    setFarthestCall(maxCallStr);

    // Draw Geodetic Arcs & Target Markers
    targetMap.forEach(({ lat, lng, qsos: groupQsos }) => {
      const firstQso = groupQsos[0];

      let lineColor = BAND_COLORS[firstQso.band] || '#38bdf8';
      if (colorMode === 'mode') {
        if (firstQso.mode === 'CW') lineColor = '#3b82f6';
        else if (firstQso.mode === 'PHONE') lineColor = '#22c55e';
        else lineColor = '#eab308';
      }

      // Draw Polyline Arc
      const latlngs: L.LatLngExpression[] = [
        [homeCoords.lat, homeCoords.lng],
        [(homeCoords.lat + lat) / 2 + 1.5, (homeCoords.lng + lng) / 2], // Subtle curvature
        [lat, lng],
      ];

      L.polyline(latlngs, {
        color: lineColor,
        weight: Math.min(1.5 + groupQsos.length * 0.3, 4),
        opacity: 0.65,
        smoothFactor: 1,
      }).addTo(map);

      // Target Circle Marker
      L.circleMarker([lat, lng], {
        radius: Math.min(4 + groupQsos.length, 10),
        color: lineColor,
        fillColor: lineColor,
        fillOpacity: 0.7,
      })
        .addTo(map)
        .bindPopup(
          `<b>${groupQsos.map((q) => q.call).join(', ')}</b><br/>Contacts: ${groupQsos.length}<br/>Section: ${firstQso.section}`
        );
    });
  }, [qsos, homeGrid, homeCall, colorMode]);

  const captureMapSnapshot = async () => {
    if (!mapContainerRef.current) return;
    setIsSnapshotting(true);

    try {
      const canvas = await html2canvas(mapContainerRef.current, {
        useCORS: true,
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      if (onSnapshotCaptured) {
        onSnapshotCaptured(dataUrl);
      }
    } catch (err) {
      console.error('Map snapshot failed:', err);
    } finally {
      setIsSnapshotting(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
      {/* Map Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">Geographic Propagation Path Map</h2>
            <p className="text-xs text-slate-400">
              Great-circle paths from Home Grid ({homeGrid}) to contacted stations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Color Coding Toggle */}
          <div className="bg-slate-950 p-1 rounded-md border border-slate-800 flex text-xs font-medium">
            <button
              onClick={() => setColorMode('band')}
              className={`px-2.5 py-1 rounded transition ${
                colorMode === 'band' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Band
            </button>
            <button
              onClick={() => setColorMode('mode')}
              className={`px-2.5 py-1 rounded transition ${
                colorMode === 'mode' ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              By Mode
            </button>
          </div>

          <button
            onClick={captureMapSnapshot}
            disabled={isSnapshotting}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-medium border border-slate-700 transition"
            title="Rasterize map view for report embedding"
          >
            <Camera className="w-3.5 h-3.5 text-sky-400" />
            {isSnapshotting ? 'Capturing...' : 'Snapshot Map'}
          </button>
        </div>
      </div>

      {/* Map Container Frame */}
      <div id="propagation-map-frame" className="relative w-full h-80 rounded-xl overflow-hidden border border-slate-800">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] z-10 text-slate-300 space-y-1">
          <div className="font-semibold text-slate-100 mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-rose-500" /> Home: {homeCall} ({homeGrid})
          </div>
          {colorMode === 'band' ? (
            <div className="flex flex-wrap gap-x-2 gap-y-1 font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: BAND_COLORS['20M'] }}></span> 20M</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: BAND_COLORS['40M'] }}></span> 40M</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: BAND_COLORS['80M'] }}></span> 80M</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: BAND_COLORS['15M'] }}></span> 15M</span>
            </div>
          ) : (
            <div className="flex gap-2 font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> CW</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Phone</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Digital</span>
            </div>
          )}
        </div>

        {/* Distance Stats Callout */}
        {maxDistance > 0 && (
          <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] z-10 text-slate-300">
            <span className="text-slate-400 font-medium">Max Short-Path DX:</span>{' '}
            <span className="font-bold text-emerald-400 font-mono">{farthestCall}</span>
          </div>
        )}
      </div>
    </div>
  );
};
