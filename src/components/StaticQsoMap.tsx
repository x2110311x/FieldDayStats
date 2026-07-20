import React, { useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
} from 'react-simple-maps';
import { QSO } from '../types';
import { resolveQsoCoordinates, gridToLatLng } from '../services/geo/maidenhead';
import { ARRL_SECTION_MAP } from '../services/geo/arrlSections';

// Natural Earth TopoJSON — world countries
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const BAND_ORDER = ['160M', '80M', '40M', '20M', '15M', '10M', '6M', '2M', '70CM', 'OTH'];

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

export type ModeGroup = 'CW' | 'PHONE' | 'DIGITAL';

export const normalizeModeGroup = (rawMode?: string): ModeGroup => {
  if (!rawMode) return 'PHONE';
  const m = rawMode.toUpperCase();
  if (m === 'CW') return 'CW';
  if (m === 'PHONE' || m === 'SSB' || m === 'FM' || m === 'AM' || m === 'PH') return 'PHONE';
  return 'DIGITAL';
};

interface StaticQsoMapProps {
  qsos: QSO[];
  homeGrid?: string;
  homeSection?: string;
  homeCall?: string;
  /** dark=true applies the dark dashboard palette; false = light/print palette */
  dark?: boolean;
}

export const StaticQsoMap: React.FC<StaticQsoMapProps> = ({
  qsos,
  homeGrid,
  homeSection,
  homeCall,
  dark = false,
}) => {
  // ── Home station coords ──────────────────────────────────────────────────────
  const homeLatLng = useMemo(() => {
    return (
      gridToLatLng(homeGrid) ||
      (homeSection && ARRL_SECTION_MAP.has(homeSection.toUpperCase())
        ? {
            lat: ARRL_SECTION_MAP.get(homeSection.toUpperCase())!.lat,
            lng: ARRL_SECTION_MAP.get(homeSection.toUpperCase())!.lng,
          }
        : { lat: 41.6, lng: -72.7 })
    );
  }, [homeGrid, homeSection]);

  // ── Aggregate QSO contacts by location, band, & mode ──────────────────────────
  const contacts = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; band: string; modeGroup: ModeGroup; count: number; isDx: boolean }>();
    for (const qso of qsos) {
      const coords = resolveQsoCoordinates(qso.grid, qso.section, qso.call);
      if (!coords) continue;
      const isDx = qso.section?.toUpperCase() === 'DX';
      const modeGroup = normalizeModeGroup(qso.mode);
      const key = `${coords.lat.toFixed(1)}_${coords.lng.toFixed(1)}_${qso.band}_${modeGroup}`;
      if (!map.has(key)) {
        map.set(key, { lat: coords.lat, lng: coords.lng, band: qso.band, modeGroup, count: 1, isDx });
      } else {
        map.get(key)!.count++;
      }
    }
    return Array.from(map.values());
  }, [qsos]);

  // Sort active bands in standard lowest-to-highest frequency ham band order
  const activeBands = useMemo(() => {
    const bandSet = new Set(contacts.map(c => c.band));
    return BAND_ORDER.filter(b => bandSet.has(b));
  }, [contacts]);

  // ── Dynamic bounds auto-fit using Mercator projection math ────────────────────
  const { center, scale } = useMemo(() => {
    // Helper: Mercator latitude <-> Y projection
    const latToY = (lat: number) => {
      const rad = (Math.max(-85, Math.min(85, lat)) * Math.PI) / 180;
      return Math.log(Math.tan(Math.PI / 4 + rad / 2));
    };
    const yToLat = (y: number) => {
      return (2 * Math.atan(Math.exp(y)) - Math.PI / 2) * (180 / Math.PI);
    };

    // Filter non-DX contacts for primary framing so DX outliers don't shrink US map
    const mapContacts = contacts.filter(c => !c.isDx);
    const targetContacts = mapContacts.length > 0 ? mapContacts : contacts;

    const allLats = [homeLatLng.lat, ...targetContacts.map(c => c.lat)];
    const allLngs = [homeLatLng.lng, ...targetContacts.map(c => c.lng)];

    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);

    // Mercator Y midpoint latitude
    const yMin = latToY(minLat);
    const yMax = latToY(maxLat);
    const yMid = (yMin + yMax) / 2;
    const centerLat = yToLat(yMid);
    const centerLng = (minLng + maxLng) / 2;

    const ySpan = Math.max(yMax - yMin, 0.25);
    const xSpan = Math.max(((maxLng - minLng) * Math.PI) / 180, 0.35);

    // Scale to fit inside 800x340 viewport with ~18% padding
    const scaleY = 270 / ySpan;
    const scaleX = 660 / xSpan;
    const calculatedScale = Math.min(Math.max(Math.min(scaleX, scaleY), 160), 950);

    return {
      center: [centerLng, centerLat] as [number, number],
      scale: calculatedScale,
    };
  }, [homeLatLng, contacts]);

  // ── Colour palette ───────────────────────────────────────────────────────────
  const bg         = dark ? '#0f172a' : '#dbeafe';   // ocean colour
  const landFill   = dark ? '#1e293b' : '#f1f5f9';
  const landStroke = dark ? '#334155' : '#94a3b8';
  const textColor  = dark ? '#94a3b8' : '#475569';

  return (
    <div style={{ position: 'relative', background: bg, borderRadius: 4, overflow: 'hidden' }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          center,
          scale,
        }}
        width={800}
        height={340}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'hidden' }}
      >
        <defs>
          <clipPath id="qso-map-bounds">
            <rect x={0} y={0} width={800} height={340} />
          </clipPath>
        </defs>

        {/* Geographic backdrop */}
        <Geographies geography={GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill={landFill}
                stroke={landStroke}
                strokeWidth={0.5}
                style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
              />
            ))
          }
        </Geographies>

        {/* Plotted lines and markers strictly clipped to the 800x340 map bounds */}
        <g clipPath="url(#qso-map-bounds)">
          {/* Great-circle lines (home → each US/VE contact) */}
          {contacts.filter(c => !c.isDx).map((c, i) => {
            const color = BAND_COLORS[c.band] || '#38bdf8';
            return (
              <Line
                key={`line-${i}`}
                from={[homeLatLng.lng, homeLatLng.lat]}
                to={[c.lng, c.lat]}
                stroke={color}
                strokeWidth={0.8}
                strokeOpacity={dark ? 0.4 : 0.5}
              />
            );
          })}

          {/* DX lines — dashed, matched to band color */}
          {contacts.filter(c => c.isDx).map((c, i) => {
            const color = BAND_COLORS[c.band] || '#38bdf8';
            return (
              <Line
                key={`dxline-${i}`}
                from={[homeLatLng.lng, homeLatLng.lat]}
                to={[c.lng, c.lat]}
                stroke={color}
                strokeWidth={1.2}
                strokeOpacity={0.8}
                strokeDasharray="5,3"
              />
            );
          })}

          {/* Contact Markers (Distinct SVG Shapes per Mode: Phone = Circle, CW = Square, Digital = Triangle) */}
          {contacts.map((c, i) => {
            const color = BAND_COLORS[c.band] || '#38bdf8';
            const r = Math.min(5.5, 2.8 + Math.log2(c.count + 1) * 0.8);

            return (
              <Marker key={`dot-${i}`} coordinates={[c.lng, c.lat]}>
                {c.modeGroup === 'CW' ? (
                  // CW = Square
                  <rect x={-r} y={-r} width={r * 2} height={r * 2} rx={1} fill={color} stroke="white" strokeWidth={0.8} opacity={0.9} />
                ) : c.modeGroup === 'DIGITAL' ? (
                  // Digital = Triangle
                  <polygon
                    points={`0,${-r * 1.3} ${r * 1.15},${r * 0.85} ${-r * 1.15},${r * 0.85}`}
                    fill={color}
                    stroke="white"
                    strokeWidth={0.8}
                    opacity={0.9}
                  />
                ) : (
                  // Phone = Circle (default)
                  <circle r={r} fill={color} stroke="white" strokeWidth={0.8} opacity={0.9} />
                )}
              </Marker>
            );
          })}

          {/* Home station marker */}
          <Marker coordinates={[homeLatLng.lng, homeLatLng.lat]}>
            <circle r={10} fill="none" stroke="#38bdf8" strokeWidth={1.5} opacity={0.5} />
            <circle r={5} fill="#38bdf8" stroke="white" strokeWidth={1.5} />
            {homeCall && (
              <text
                y={-14}
                textAnchor="middle"
                fontSize={9}
                fontWeight="bold"
                fontFamily="monospace"
                fill={dark ? '#38bdf8' : '#0f172a'}
              >
                {homeCall}
              </text>
            )}
          </Marker>
        </g>
      </ComposableMap>

      {/* Legend Stack (Bottom-Left Corner: Mode legend on top, Band legend below) */}
      <div style={{
        position: 'absolute', bottom: 6, left: 6,
        display: 'flex', flexDirection: 'column', gap: 3,
        background: dark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        padding: '4px 8px', borderRadius: 4, backdropFilter: 'blur(4px)',
        border: dark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
      }}>
        {/* Row 1: Mode shapes legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 9, fontFamily: 'monospace', color: textColor }}>
          <span style={{ fontWeight: 'bold' }}>Mode:</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width={8} height={8} viewBox="-5 -5 10 10"><circle r={4} fill={textColor} /></svg> Phone
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width={8} height={8} viewBox="-5 -5 10 10"><rect x={-4} y={-4} width={8} height={8} rx={1} fill={textColor} /></svg> CW
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <svg width={8} height={8} viewBox="-5 -5 10 10"><polygon points="0,-4.5 4.5,4 -4.5,4" fill={textColor} /></svg> Digital
          </span>
        </div>

        {/* Row 2: Band colors legend (Sorted 160M -> 80M -> 40M -> 20M -> 15M -> 10M -> 6M -> 2M -> 70CM) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 9, fontFamily: 'monospace', color: textColor }}>
          <span style={{ fontWeight: 'bold' }}>Band:</span>
          {activeBands.map(band => (
            <span key={band} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <span style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 2, background: BAND_COLORS[band] }} />
              {band}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
