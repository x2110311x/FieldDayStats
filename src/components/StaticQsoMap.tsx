import React, { useMemo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Line,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { QSO } from '../types';
import { resolveQsoCoordinates, gridToLatLng } from '../services/geo/maidenhead';
import { ARRL_SECTION_MAP } from '../services/geo/arrlSections';

// Natural Earth TopoJSON — world countries
const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

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

  // ── Aggregate QSO contacts by location ───────────────────────────────────────
  const contacts = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; band: string; count: number; isDx: boolean }>();
    for (const qso of qsos) {
      const coords = resolveQsoCoordinates(qso.grid, qso.section, qso.call);
      if (!coords) continue;
      const isDx = qso.section?.toUpperCase() === 'DX';
      const key = `${coords.lat.toFixed(1)}_${coords.lng.toFixed(1)}`;
      if (!map.has(key)) {
        map.set(key, { lat: coords.lat, lng: coords.lng, band: qso.band, count: 1, isDx });
      } else {
        map.get(key)!.count++;
      }
    }
    return Array.from(map.values());
  }, [qsos]);

  const activeBands = useMemo(
    () => [...new Set(contacts.map(c => c.band))].filter(b => BAND_COLORS[b]),
    [contacts]
  );

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
  const textColor  = dark ? '#64748b' : '#64748b';

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

          {/* DX lines — dashed amber */}
          {contacts.filter(c => c.isDx).map((c, i) => (
            <Line
              key={`dxline-${i}`}
              from={[homeLatLng.lng, homeLatLng.lat]}
              to={[c.lng, c.lat]}
              stroke="#f59e0b"
              strokeWidth={1.2}
              strokeOpacity={0.7}
              strokeDasharray="5,3"
            />
          ))}

          {/* Contact dots */}
          {contacts.map((c, i) => {
            const color = c.isDx ? '#f59e0b' : (BAND_COLORS[c.band] || '#38bdf8');
            const r = Math.min(6, 3 + Math.log2(c.count + 1) * 0.8);
            return (
              <Marker key={`dot-${i}`} coordinates={[c.lng, c.lat]}>
                <circle r={r} fill={color} stroke="white" strokeWidth={0.8} opacity={0.9} />
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

      {/* Band legend overlay */}
      <div style={{
        position: 'absolute', bottom: 4, left: 6,
        display: 'flex', gap: 8, flexWrap: 'wrap',
      }}>
        {activeBands.slice(0, 10).map(band => (
          <span key={band} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, fontFamily: 'monospace', color: textColor }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: BAND_COLORS[band] }} />
            {band}
          </span>
        ))}
        {contacts.some(c => c.isDx) && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, fontFamily: 'monospace', color: textColor }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#f59e0b' }} />
            DX
          </span>
        )}
      </div>
    </div>
  );
};
