import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { geoAlbersUsa } from 'd3-geo';
import { QSO } from '../types';
import { OFFICIAL_ARRL_SECTIONS } from '../services/geo/arrlSections';

// US States via AlbersUsa projection (handles AK/HI insets automatically)
const US_GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

/**
 * Maps US Census FIPS state codes → primary ARRL section code.
 * States that span multiple ARRL sections map to their primary section code.
 */
const FIPS_TO_SECTION: Record<string, string | string[]> = {
  // Call District 1
  '09': 'CT',   // Connecticut
  '25': ['EMA', 'WMA'], // Massachusetts — split (EMA / WMA)
  '23': 'ME',   // Maine
  '33': 'NH',   // New Hampshire
  '44': 'RI',   // Rhode Island
  '50': 'VT',   // Vermont
  // Call District 2
  '36': ['ENY', 'NNY', 'WNY', 'NLI'], // New York
  '34': ['NNJ', 'SNJ'], // New Jersey
  // Call District 3
  '10': 'DE',   // Delaware
  '42': ['EPA', 'WPA'], // Pennsylvania
  '24': 'MDC',  // Maryland
  '11': 'MDC',  // DC
  // Call District 4
  '01': 'AL',   // Alabama
  '13': 'GA',   // Georgia
  '21': 'KY',   // Kentucky
  '12': ['NFL', 'SFL', 'WCF'], // Florida
  '37': ['NC', 'SC'], // NC
  '45': 'SC',   // South Carolina
  '47': 'TN',   // Tennessee
  '51': ['VA', 'MDC'], // Virginia
  '54': 'WV',   // West Virginia
  // Call District 5
  '05': 'AR',   // Arkansas
  '22': 'LA',   // Louisiana
  '28': 'MS',   // Mississippi
  '35': 'NM',   // New Mexico
  '40': 'OK',   // Oklahoma
  '48': ['NTX', 'STX', 'WTX', 'ETX'], // Texas
  // Call District 6
  '06': ['EB', 'LAX', 'SB', 'SCV', 'SDG', 'SF', 'SJV', 'ORG'], // California
  // Call District 7
  '04': 'AZ',   // Arizona
  '16': 'ID',   // Idaho
  '30': 'MT',   // Montana
  '32': 'NV',   // Nevada
  '41': 'OR',   // Oregon
  '49': 'UT',   // Utah
  '53': ['WWA', 'EWA'], // Washington
  '56': 'WY',   // Wyoming
  // Call District 8
  '26': 'MI',   // Michigan
  '39': 'OH',   // Ohio
  // Call District 9
  '17': 'IL',   // Illinois
  '18': 'IN',   // Indiana
  '55': 'WI',   // Wisconsin
  // Call District 0
  '08': 'CO',   // Colorado
  '19': 'IA',   // Iowa
  '20': 'KS',   // Kansas
  '27': 'MN',   // Minnesota
  '29': 'MO',   // Missouri
  '31': 'NE',   // Nebraska
  '38': 'ND',   // North Dakota
  '46': 'SD',   // South Dakota
  // Alaska & Hawaii
  '02': 'AK',   // Alaska
  '15': 'PAC',  // Hawaii → Pacific
};

// Distinct colours per ARRL division for the worked-state choropleth
const DIVISION_COLORS: Record<string, string> = {
  'New England':   '#6366f1',
  'Hudson':        '#8b5cf6',
  'Atlantic':      '#a855f7',
  'Southeastern':  '#22c55e',
  'Delta':         '#16a34a',
  'Roanoke':       '#4ade80',
  'Great Lakes':   '#3b82f6',
  'Central':       '#06b6d4',
  'Midwest':       '#0891b2',
  'Dakota':        '#0284c7',
  'Rocky Mountain':'#f59e0b',
  'Pacific':       '#f97316',
  'Northwestern':  '#ef4444',
  'Southwestern':  '#ec4899',
  'RAC':           '#64748b',
  'International': '#94a3b8',
};

interface ArrlSectionMapProps {
  qsos: QSO[];
  dark?: boolean;
  /** Show section code labels on worked sections */
  showLabels?: boolean;
}

export const ArrlSectionMap: React.FC<ArrlSectionMapProps> = ({
  qsos,
  dark = false,
  showLabels = true,
}) => {
  // ── Compute worked sections ─────────────────────────────────────────────────
  const workedSections = useMemo(() => {
    const set = new Set<string>();
    for (const qso of qsos) {
      if (qso.section && qso.section.toUpperCase() !== 'DX') {
        set.add(qso.section.toUpperCase());
      }
    }
    return set;
  }, [qsos]);

  // Projection instance matching ComposableMap scale & translate
  const projection = useMemo(() => {
    return geoAlbersUsa().scale(900).translate([480, 250]);
  }, []);

  // Section code → division
  const sectionMeta = useMemo(() => {
    const map = new Map<string, { division: string; name: string }>();
    for (const sec of OFFICIAL_ARRL_SECTIONS) {
      map.set(sec.code.toUpperCase(), { division: sec.division, name: sec.name });
    }
    return map;
  }, []);

  // ── Theme ───────────────────────────────────────────────────────────────────
  const bg           = dark ? '#0f172a' : '#f1f5f9';
  const unworkedFill = dark ? '#1e293b' : '#e2e8f0';
  const strokeColor  = dark ? '#334155' : '#94a3b8';
  const labelColor   = dark ? '#f8fafc' : '#0f172a';

  const getSectionColor = (sectionCode: string) => {
    const meta = sectionMeta.get(sectionCode);
    if (!meta) return unworkedFill;
    return DIVISION_COLORS[meta.division] || '#94a3b8';
  };

  const fipsToSectionCode = (fips: string): string | null => {
    const val = FIPS_TO_SECTION[fips];
    if (!val) return null;
    if (Array.isArray(val)) return val[0];
    return val;
  };

  return (
    <div style={{ background: bg, borderRadius: 4, overflow: 'hidden' }}>
      {/* US States (AlbersUsa projection — includes AK/HI insets) */}
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 900 }}
        width={960}
        height={500}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <Geographies geography={US_GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const fips: string = geo.id?.toString().padStart(2, '0') ?? '';
              const sectionCode = fipsToSectionCode(fips);
              const worked = sectionCode ? workedSections.has(sectionCode) : false;
              const fill = worked ? getSectionColor(sectionCode!) : unworkedFill;

              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={strokeColor}
                  strokeWidth={0.5}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              );
            })
          }
        </Geographies>

        {/* Section code labels safely projected (skips PR, VI, RAC, DX or unprojectable coordinates) */}
        {showLabels && OFFICIAL_ARRL_SECTIONS
          .filter(sec => workedSections.has(sec.code.toUpperCase()))
          .map(sec => {
            const pos = projection([sec.lng, sec.lat]);
            if (!pos || isNaN(pos[0]) || isNaN(pos[1])) return null; // Safe guard against null projection

            return (
              <g key={sec.code} transform={`translate(${pos[0]}, ${pos[1]})`}>
                <text
                  textAnchor="middle"
                  fontSize={7}
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill={labelColor}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {sec.code}
                </text>
              </g>
            );
          })
        }
      </ComposableMap>

      {/* Legend */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '6px 12px',
        padding: '4px 8px',
        borderTop: `1px solid ${strokeColor}`,
        fontSize: 9,
        fontFamily: 'monospace',
        color: dark ? '#64748b' : '#475569',
      }}>
        <span style={{ fontWeight: 'bold', color: dark ? '#94a3b8' : '#334155' }}>
          Worked: {workedSections.size} / 86 sections
        </span>
        {Object.entries(DIVISION_COLORS).slice(0, 8).map(([div, color]) => (
          <span key={div} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: color }} />
            {div}
          </span>
        ))}
      </div>
    </div>
  );
};
