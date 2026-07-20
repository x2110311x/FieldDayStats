import React from 'react';
import { QSO } from '../types';
import { resolveQsoCoordinates, gridToLatLng } from '../services/geo/maidenhead';
import { OFFICIAL_ARRL_SECTIONS, ARRL_SECTION_MAP } from '../services/geo/arrlSections';

// Viewport: focused on North America + nearby DX. Out-of-bounds contacts are clamped to edge.
const LON_MIN = -168;
const LON_MAX = -45;
const LAT_MIN = 10;
const LAT_MAX = 72;

const SVG_W = 720;
const SVG_H = 300;
const LABEL_PAD = 16; // bottom padding for time labels

const BAND_COLORS: Record<string, string> = {
  '160M': '#9333ea',
  '80M':  '#3b82f6',
  '40M':  '#06b6d4',
  '20M':  '#10b981',
  '15M':  '#f59e0b',
  '10M':  '#ef4444',
  '6M':   '#ec4899',
  '2M':   '#8b5cf6',
  '70CM': '#6366f1',
  'OTH':  '#64748b',
};

function project(lat: number, lng: number): [number, number] {
  // Clamp to viewport
  const clampedLat = Math.max(LAT_MIN, Math.min(LAT_MAX, lat));
  const clampedLng = Math.max(LON_MIN, Math.min(LON_MAX, lng));
  const x = ((clampedLng - LON_MIN) / (LON_MAX - LON_MIN)) * SVG_W;
  const y = ((LAT_MAX - clampedLat) / (LAT_MAX - LAT_MIN)) * SVG_H;
  return [x, y];
}

function isInViewport(lat: number, lng: number): boolean {
  return lat >= LAT_MIN - 5 && lat <= LAT_MAX + 5 && lng >= LON_MIN - 5 && lng <= LON_MAX + 5;
}

interface StaticQsoMapProps {
  qsos: QSO[];
  homeGrid?: string;
  homeSection?: string;
  homeCall?: string;
  /** If true, renders with a dark background suitable for the dashboard. Default = false (light/print). */
  dark?: boolean;
}

export const StaticQsoMap: React.FC<StaticQsoMapProps> = ({
  qsos,
  homeGrid,
  homeSection,
  homeCall,
  dark = false,
}) => {
  // ---- Home station coords ----
  const homeLatLng =
    gridToLatLng(homeGrid) ||
    (homeSection && ARRL_SECTION_MAP.has(homeSection.toUpperCase())
      ? {
          lat: ARRL_SECTION_MAP.get(homeSection.toUpperCase())!.lat,
          lng: ARRL_SECTION_MAP.get(homeSection.toUpperCase())!.lng,
        }
      : { lat: 41.6, lng: -72.7 }); // Default: CT

  const [homeX, homeY] = project(homeLatLng.lat, homeLatLng.lng);

  // ---- Aggregate QSO contacts by location ----
  const contactMap = new Map<
    string,
    { lat: number; lng: number; band: string; count: number; isDx: boolean }
  >();

  for (const qso of qsos) {
    const coords = resolveQsoCoordinates(qso.grid, qso.section, qso.call);
    if (!coords) continue;

    const isDx =
      qso.section?.toUpperCase() === 'DX' ||
      coords.lng < LON_MIN ||
      coords.lng > LON_MAX ||
      coords.lat < LAT_MIN ||
      coords.lat > LAT_MAX;

    const key = `${coords.lat.toFixed(1)}_${coords.lng.toFixed(1)}`;
    if (!contactMap.has(key)) {
      contactMap.set(key, {
        lat: coords.lat,
        lng: coords.lng,
        band: qso.band,
        count: 1,
        isDx,
      });
    } else {
      contactMap.get(key)!.count++;
    }
  }

  const contacts = Array.from(contactMap.values());

  // ---- Colour palette ----
  const bg        = dark ? '#0f172a' : '#f8fafc';
  const gridColor = dark ? '#1e293b' : '#e2e8f0';
  const textColor = dark ? '#475569' : '#94a3b8';
  const sectionDot= dark ? '#1e293b' : '#e2e8f0';
  const sectionStroke= dark ? '#334155' : '#cbd5e1';

  // ---- Lat/Lng reference grid lines ----
  const gridLines: React.ReactNode[] = [];
  for (let lat = 20; lat < LAT_MAX; lat += 10) {
    const [x1, y1] = project(lat, LON_MIN);
    const [x2]     = project(lat, LON_MAX);
    gridLines.push(
      <line key={`lat${lat}`} x1={x1} y1={y1} x2={x2} y2={y1}
        stroke={gridColor} strokeWidth="0.6" />,
      <text key={`lat${lat}t`} x={x1 + 2} y={y1 - 2}
        fontSize="7" fill={textColor} fontFamily="monospace">{lat}°N</text>
    );
  }
  for (let lng = -160; lng < LON_MAX; lng += 20) {
    const [x1, y1] = project(LAT_MAX, lng);
    const [, y2]   = project(LAT_MIN, lng);
    gridLines.push(
      <line key={`lng${lng}`} x1={x1} y1={y1} x2={x1} y2={y2}
        stroke={gridColor} strokeWidth="0.6" />,
      <text key={`lng${lng}t`} x={x1} y={y2 + 8}
        fontSize="7" fill={textColor} fontFamily="monospace" textAnchor="middle">{lng}°</text>
    );
  }

  // ---- Active bands for legend ----
  const activeBands = [...new Set(contacts.map(c => c.band))].filter(b => BAND_COLORS[b]);

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H + LABEL_PAD}`}
      width="100%"
      style={{ display: 'block', borderRadius: 4, background: bg }}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background */}
      <rect x={0} y={0} width={SVG_W} height={SVG_H + LABEL_PAD} fill={bg} />

      {/* Lat/lng grid */}
      {gridLines}

      {/* ARRL section centroids as geographic reference — gives the "shape" of North America */}
      {OFFICIAL_ARRL_SECTIONS.map((sec) => {
        if (!isInViewport(sec.lat, sec.lng)) return null;
        const [x, y] = project(sec.lat, sec.lng);
        return (
          <circle key={`sec-${sec.code}`} cx={x} cy={y} r={4}
            fill={sectionDot} stroke={sectionStroke} strokeWidth="0.5" opacity="0.7" />
        );
      })}

      {/* Great-circle lines from home to in-viewport contacts */}
      {contacts.filter(c => !c.isDx && isInViewport(c.lat, c.lng)).map((c, i) => {
        const [cx, cy] = project(c.lat, c.lng);
        const color = BAND_COLORS[c.band] || '#38bdf8';
        return (
          <line key={`line-${i}`}
            x1={homeX} y1={homeY} x2={cx} y2={cy}
            stroke={color} strokeWidth="0.8" opacity={dark ? 0.35 : 0.4} />
        );
      })}

      {/* DX lines — dashed amber */}
      {contacts.filter(c => c.isDx && isInViewport(c.lat, c.lng)).map((c, i) => {
        const [cx, cy] = project(c.lat, c.lng);
        return (
          <line key={`dxline-${i}`}
            x1={homeX} y1={homeY} x2={cx} y2={cy}
            stroke="#f59e0b" strokeWidth="1.2" opacity="0.7" strokeDasharray="4,3" />
        );
      })}

      {/* Contact dots */}
      {contacts.filter(c => isInViewport(c.lat, c.lng)).map((c, i) => {
        const [cx, cy] = project(c.lat, c.lng);
        const color = c.isDx ? '#f59e0b' : (BAND_COLORS[c.band] || '#38bdf8');
        const r = Math.min(5, 2.5 + Math.log2(c.count + 1) * 0.8);
        return (
          <circle key={`dot-${i}`} cx={cx} cy={cy} r={r}
            fill={color} stroke="white" strokeWidth="0.8" opacity="0.9" />
        );
      })}

      {/* Home station marker */}
      <circle cx={homeX} cy={homeY} r={9} fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.5" />
      <circle cx={homeX} cy={homeY} r={5} fill="#38bdf8" stroke="white" strokeWidth="1.5" />
      {homeCall && (
        <text x={homeX} y={homeY - 12}
          textAnchor="middle" fontSize="8" fill={dark ? '#38bdf8' : '#0f172a'}
          fontWeight="bold" fontFamily="monospace">
          {homeCall}
        </text>
      )}

      {/* Legend */}
      {activeBands.slice(0, 8).map((band, i) => {
        const color = BAND_COLORS[band];
        const lx = 8 + i * 62;
        const ly = SVG_H + 10;
        if (lx + 55 > SVG_W) return null;
        return (
          <g key={`leg-${band}`}>
            <rect x={lx} y={ly - 6} width={8} height={8} fill={color} rx="1" />
            <text x={lx + 10} y={ly + 1} fontSize="7" fill={textColor} fontFamily="monospace">{band}</text>
          </g>
        );
      })}
      {/* DX legend entry */}
      {contacts.some(c => c.isDx) && (() => {
        const i = Math.min(activeBands.length, 7);
        const lx = 8 + i * 62;
        const ly = SVG_H + 10;
        if (lx + 55 > SVG_W) return null;
        return (
          <g key="leg-dx">
            <rect x={lx} y={ly - 6} width={8} height={8} fill="#f59e0b" rx="1" />
            <text x={lx + 10} y={ly + 1} fontSize="7" fill={textColor} fontFamily="monospace">DX</text>
          </g>
        );
      })()}
    </svg>
  );
};
