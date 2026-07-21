import { ARRL_SECTION_MAP } from './arrlSections';

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Comprehensive ITU Amateur Radio Entity Prefix Database.
 * Ordered by prefix length for greedy longest-prefix matching.
 */
const ITU_PREFIX_COORDS: Record<string, LatLng> = {
  // US Territories & Dependencies
  KP4: { lat: 18.2, lng: -66.4 }, // Puerto Rico
  NP4: { lat: 18.2, lng: -66.4 },
  WP4: { lat: 18.2, lng: -66.4 },
  KP2: { lat: 18.3, lng: -64.9 }, // US Virgin Islands
  NP2: { lat: 18.3, lng: -64.9 },
  WP2: { lat: 18.3, lng: -64.9 },
  KH6: { lat: 21.3, lng: -157.8 }, // Hawaii
  NH6: { lat: 21.3, lng: -157.8 },
  WH6: { lat: 21.3, lng: -157.8 },
  KL7: { lat: 61.2, lng: -149.9 }, // Alaska
  NL7: { lat: 61.2, lng: -149.9 },
  WL7: { lat: 61.2, lng: -149.9 },
  KH2: { lat: 13.4, lng: 144.7 }, // Guam
  KH0: { lat: 15.2, lng: 145.7 }, // Mariana Is.

  // Specific Island Entities & Prefixes
  EA6: { lat: 39.6, lng: 2.9 }, // Balearic Is.
  EA8: { lat: 28.3, lng: -16.5 }, // Canary Is.
  EA9: { lat: 35.9, lng: -5.3 }, // Ceuta & Melilla
  CT3: { lat: 32.8, lng: -16.9 }, // Madeira
  CU: { lat: 37.7, lng: -25.7 }, // Azores
  IS0: { lat: 40.1, lng: 9.1 }, // Sardinia
  SV5: { lat: 36.4, lng: 28.2 }, // Dodecanese
  SV9: { lat: 35.2, lng: 24.8 }, // Crete
  OH0: { lat: 60.1, lng: 19.9 }, // Aland Is.
  P4: { lat: 12.5, lng: -69.9 }, // Aruba
  PJ2: { lat: 12.2, lng: -69.0 }, // Curacao
  PJ4: { lat: 12.2, lng: -68.3 }, // Bonaire
  PJ5: { lat: 17.6, lng: -63.2 }, // Saba / St. Eustatius
  PJ7: { lat: 18.0, lng: -63.0 }, // Sint Maarten
  ZF: { lat: 19.3, lng: -81.3 }, // Cayman Is.
  VP5: { lat: 21.7, lng: -71.8 }, // Turks & Caicos
  VP9: { lat: 32.3, lng: -64.7 }, // Bermuda
  VP2M: { lat: 16.7, lng: -62.2 }, // Montserrat
  VP2V: { lat: 18.4, lng: -64.6 }, // British Virgin Is.
  VP8: { lat: -51.7, lng: -57.8 }, // Falkland Is.
  VQ9: { lat: -7.3, lng: 72.4 }, // Chagos / Diego Garcia

  // South America
  YV: { lat: 8.0, lng: -66.5 }, // Venezuela
  YY: { lat: 8.0, lng: -66.5 },
  YW: { lat: 8.0, lng: -66.5 },
  HK: { lat: 4.5, lng: -74.3 }, // Colombia
  HJ: { lat: 4.5, lng: -74.3 },
  HC: { lat: -1.8, lng: -78.1 }, // Ecuador
  HD: { lat: -1.8, lng: -78.1 },
  OA: { lat: -9.1, lng: -75.0 }, // Peru
  OB: { lat: -9.1, lng: -75.0 },
  CP: { lat: -16.3, lng: -63.5 }, // Bolivia
  CX: { lat: -32.5, lng: -55.7 }, // Uruguay
  ZP: { lat: -23.4, lng: -58.4 }, // Paraguay
  LU: { lat: -38.4, lng: -63.6 }, // Argentina
  LW: { lat: -38.4, lng: -63.6 },
  AY: { lat: -38.4, lng: -63.6 },
  AZ: { lat: -38.4, lng: -63.6 },
  CE: { lat: -35.7, lng: -71.5 }, // Chile
  CA: { lat: -35.7, lng: -71.5 },
  CB: { lat: -35.7, lng: -71.5 },
  PY: { lat: -14.2, lng: -51.9 }, // Brazil
  PP: { lat: -14.2, lng: -51.9 },
  PR: { lat: -14.2, lng: -51.9 },
  PS: { lat: -14.2, lng: -51.9 },
  PT: { lat: -14.2, lng: -51.9 },
  PU: { lat: -14.2, lng: -51.9 },
  PV: { lat: -14.2, lng: -51.9 },
  PW: { lat: -14.2, lng: -51.9 },
  PX: { lat: -14.2, lng: -51.9 },
  ZY: { lat: -14.2, lng: -51.9 },
  ZZ: { lat: -14.2, lng: -51.9 },
  PZ: { lat: 3.9, lng: -56.0 }, // Suriname
  FY: { lat: 4.0, lng: -53.0 }, // French Guiana
  '8R': { lat: 4.8, lng: -58.9 }, // Guyana

  // Central America & Caribbean
  XE: { lat: 23.6, lng: -102.5 }, // Mexico
  XF: { lat: 23.6, lng: -102.5 },
  YS: { lat: 13.8, lng: -88.9 }, // El Salvador
  YN: { lat: 12.9, lng: -85.2 }, // Nicaragua
  TG: { lat: 15.8, lng: -90.2 }, // Guatemala
  HR: { lat: 15.2, lng: -86.2 }, // Honduras
  TI: { lat: 9.7, lng: -83.8 }, // Costa Rica
  HP: { lat: 8.5, lng: -80.1 }, // Panama
  HI: { lat: 18.7, lng: -70.2 }, // Dominican Rep.
  HH: { lat: 18.9, lng: -72.7 }, // Haiti
  CO: { lat: 21.5, lng: -78.9 }, // Cuba
  CM: { lat: 21.5, lng: -78.9 },
  V2: { lat: 17.1, lng: -61.8 }, // Antigua
  V3: { lat: 17.2, lng: -88.5 }, // Belize
  V4: { lat: 17.3, lng: -62.7 }, // St. Kitts
  J3: { lat: 12.1, lng: -61.7 }, // Grenada
  J6: { lat: 13.9, lng: -61.0 }, // St. Lucia
  J7: { lat: 15.4, lng: -61.4 }, // Dominica
  J8: { lat: 13.3, lng: -61.2 }, // St. Vincent
  '8P': { lat: 13.2, lng: -59.5 }, // Barbados
  '9Y': { lat: 10.7, lng: -61.2 }, // Trinidad

  // Europe
  G: { lat: 52.3, lng: -1.1 }, // UK
  M: { lat: 52.3, lng: -1.1 },
  '2E': { lat: 52.3, lng: -1.1 },
  GW: { lat: 52.1, lng: -3.8 }, // Wales
  GM: { lat: 56.5, lng: -4.2 }, // Scotland
  GI: { lat: 54.6, lng: -6.7 }, // Northern Ireland
  DL: { lat: 51.1, lng: 10.4 }, // Germany
  DK: { lat: 51.1, lng: 10.4 },
  DB: { lat: 51.1, lng: 10.4 },
  DG: { lat: 51.1, lng: 10.4 },
  DH: { lat: 51.1, lng: 10.4 },
  DJ: { lat: 51.1, lng: 10.4 },
  F: { lat: 46.2, lng: 2.2 }, // France
  I: { lat: 41.9, lng: 12.5 }, // Italy
  IK: { lat: 41.9, lng: 12.5 },
  IZ: { lat: 41.9, lng: 12.5 },
  EA: { lat: 40.4, lng: -3.7 }, // Spain
  EB: { lat: 40.4, lng: -3.7 },
  EC: { lat: 40.4, lng: -3.7 },
  CT: { lat: 39.4, lng: -8.2 }, // Portugal
  CS: { lat: 39.4, lng: -8.2 },
  PA: { lat: 52.1, lng: 5.3 }, // Netherlands
  PB: { lat: 52.1, lng: 5.3 },
  PE: { lat: 52.1, lng: 5.3 },
  ON: { lat: 50.5, lng: 4.4 }, // Belgium
  OZ: { lat: 56.3, lng: 9.5 }, // Denmark
  SM: { lat: 60.1, lng: 18.6 }, // Sweden
  SA: { lat: 60.1, lng: 18.6 },
  LA: { lat: 60.5, lng: 8.4 }, // Norway
  LB: { lat: 60.5, lng: 8.4 },
  OH: { lat: 61.9, lng: 25.7 }, // Finland
  HA: { lat: 47.2, lng: 19.5 }, // Hungary
  SP: { lat: 51.9, lng: 19.1 }, // Poland
  SQ: { lat: 51.9, lng: 19.1 },
  OK: { lat: 49.8, lng: 15.5 }, // Czech Rep.
  OM: { lat: 48.7, lng: 19.7 }, // Slovakia
  OE: { lat: 47.5, lng: 14.5 }, // Austria
  HB: { lat: 46.8, lng: 8.2 }, // Switzerland
  EI: { lat: 53.4, lng: -7.7 }, // Ireland
  S5: { lat: 46.2, lng: 15.0 }, // Slovenia
  '9A': { lat: 45.1, lng: 15.2 }, // Croatia
  E7: { lat: 43.9, lng: 17.7 }, // Bosnia
  YU: { lat: 44.0, lng: 21.0 }, // Serbia
  YO: { lat: 45.9, lng: 24.9 }, // Romania
  LZ: { lat: 42.7, lng: 25.5 }, // Bulgaria
  SV: { lat: 39.1, lng: 23.7 }, // Greece
  TA: { lat: 39.0, lng: 35.2 }, // Turkey
  UA: { lat: 55.7, lng: 37.6 }, // European Russia
  RA: { lat: 55.7, lng: 37.6 },
  UR: { lat: 48.4, lng: 31.2 }, // Ukraine
  US: { lat: 48.4, lng: 31.2 },
  EU: { lat: 53.7, lng: 27.9 }, // Belarus
  LY: { lat: 55.2, lng: 23.9 }, // Lithuania
  YL: { lat: 56.9, lng: 24.6 }, // Latvia
  ES: { lat: 58.6, lng: 25.0 }, // Estonia
  TF: { lat: 64.9, lng: -19.0 }, // Iceland

  // Asia & Oceania
  JA: { lat: 36.2, lng: 138.2 }, // Japan
  JH: { lat: 36.2, lng: 138.2 },
  JR: { lat: 36.2, lng: 138.2 },
  JE: { lat: 36.2, lng: 138.2 },
  JF: { lat: 36.2, lng: 138.2 },
  JG: { lat: 36.2, lng: 138.2 },
  JI: { lat: 36.2, lng: 138.2 },
  JJ: { lat: 36.2, lng: 138.2 },
  HL: { lat: 35.9, lng: 127.8 }, // South Korea
  BY: { lat: 35.8, lng: 104.2 }, // China
  BD: { lat: 35.8, lng: 104.2 },
  BG: { lat: 35.8, lng: 104.2 },
  VR: { lat: 22.3, lng: 114.2 }, // Hong Kong
  VK: { lat: -25.2, lng: 133.7 }, // Australia
  ZL: { lat: -40.9, lng: 174.8 }, // New Zealand
  DU: { lat: 12.8, lng: 121.7 }, // Philippines
  HS: { lat: 15.8, lng: 100.9 }, // Thailand
  YB: { lat: -0.7, lng: 113.9 }, // Indonesia
  '9M': { lat: 4.2, lng: 101.9 }, // Malaysia
  '9V': { lat: 1.3, lng: 103.8 }, // Singapore
  VU: { lat: 20.6, lng: 78.9 }, // India
  AP: { lat: 30.4, lng: 69.3 }, // Pakistan
  '4X': { lat: 31.0, lng: 34.8 }, // Israel
  '4Z': { lat: 31.0, lng: 34.8 },
  JY: { lat: 30.6, lng: 36.2 }, // Jordan
  HZ: { lat: 23.9, lng: 45.1 }, // Saudi Arabia
  A6: { lat: 23.4, lng: 53.8 }, // UAE
  A7: { lat: 25.4, lng: 51.2 }, // Qatar
  A9: { lat: 26.0, lng: 50.5 }, // Bahrain

  // Africa
  ZS: { lat: -30.5, lng: 22.9 }, // South Africa
  CN: { lat: 31.8, lng: -7.1 }, // Morocco
  SU: { lat: 26.8, lng: 30.8 }, // Egypt
  '7X': { lat: 28.0, lng: 1.7 }, // Algeria
  '5N': { lat: 9.1, lng: 8.7 }, // Nigeria
  '5Z': { lat: -1.3, lng: 36.8 }, // Kenya
  '5R': { lat: -18.8, lng: 46.8 }, // Madagascar
};

// Sorted list of DX prefix keys by length descending for greedy matching
const SORTED_DX_PREFIXES = Object.keys(ITU_PREFIX_COORDS).sort((a, b) => b.length - a.length);

/**
 * Validates if a string is a valid 4-character Maidenhead Grid (e.g. EN90, FN31).
 * Format: 2 letters (A-R) followed by 2 digits (0-9).
 */
export function isValidGrid(grid?: string): boolean {
  if (!grid || typeof grid !== 'string') return false;
  return /^[A-R]{2}[0-9]{2}$/i.test(grid.trim());
}

/**
 * Enforces strict XX## Maidenhead grid format (2 letters A-Z + 2 numbers 0-9).
 */
export function formatGridInput(input: string): string {
  const clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  let result = '';
  for (let i = 0; i < clean.length && result.length < 4; i++) {
    const char = clean[i];
    if (result.length < 2) {
      if (/[A-Z]/.test(char)) result += char;
    } else {
      if (/[0-9]/.test(char)) result += char;
    }
  }
  return result;
}

/**
 * Converts Maidenhead Grid Locator to Lat/Lng center point.
 */
export function gridToLatLng(grid?: string): LatLng | null {
  if (!grid || typeof grid !== 'string') return null;

  const cleanGrid = grid.trim().toUpperCase();
  if (cleanGrid.length < 4) return null;

  const fieldA = cleanGrid.charCodeAt(0) - 65; // A-R
  const fieldB = cleanGrid.charCodeAt(1) - 65; // A-R
  const squareA = parseInt(cleanGrid.charAt(2), 10); // 0-9
  const squareB = parseInt(cleanGrid.charAt(3), 10); // 0-9

  if (fieldA < 0 || fieldA > 17 || fieldB < 0 || fieldB > 17) return null;
  if (isNaN(squareA) || isNaN(squareB)) return null;

  let lng = fieldA * 20 - 180 + squareA * 2 + 1.0;
  let lat = fieldB * 10 - 90 + squareB * 1 + 0.5;

  if (cleanGrid.length >= 6) {
    const subA = cleanGrid.charCodeAt(4) - 65; // A-X
    const subB = cleanGrid.charCodeAt(5) - 65; // A-X
    if (subA >= 0 && subA < 24 && subB >= 0 && subB < 24) {
      lng = fieldA * 20 - 180 + squareA * 2 + (subA * 5) / 60 + 2.5 / 60;
      lat = fieldB * 10 - 90 + squareB * 1 + (subB * 2.5) / 60 + 1.25 / 60;
    }
  }

  return {
    lat: parseFloat(lat.toFixed(4)),
    lng: parseFloat(lng.toFixed(4)),
  };
}

/**
 * Converts Lat/Lng coordinates to Maidenhead Grid Locator (4 or 6 characters).
 */
export function latLngToGrid(lat: number, lng: number, precision: 4 | 6 = 4): string {
  const adjLng = lng + 180;
  const adjLat = lat + 90;

  const fieldA = Math.floor(adjLng / 20);
  const fieldB = Math.floor(adjLat / 10);

  const charA = String.fromCharCode(65 + Math.min(Math.max(fieldA, 0), 17));
  const charB = String.fromCharCode(65 + Math.min(Math.max(fieldB, 0), 17));

  const remLng = adjLng - fieldA * 20;
  const remLat = adjLat - fieldB * 10;

  const squareA = Math.floor(remLng / 2);
  const squareB = Math.floor(remLat / 1);

  const numA = Math.min(Math.max(squareA, 0), 9);
  const numB = Math.min(Math.max(squareB, 0), 9);

  let grid = `${charA}${charB}${numA}${numB}`;

  if (precision === 6) {
    const remSubLng = remLng - numA * 2;
    const remSubLat = remLat - numB * 1;

    const subA = Math.floor(remSubLng * 12);
    const subB = Math.floor(remSubLat * 24);

    const charSubA = String.fromCharCode(65 + Math.min(Math.max(subA, 0), 23));
    const charSubB = String.fromCharCode(65 + Math.min(Math.max(subB, 0), 23));

    grid += `${charSubA}${charSubB}`;
  }

  return grid;
}

/**
 * Robust coordinate resolver for any callsign, prefix, section, or grid worldwide.
 */
export function resolveQsoCoordinates(grid?: string, section?: string, callsign?: string): LatLng | null {
  // 1. Precise Maidenhead Grid Square (if available)
  const fromGrid = gridToLatLng(grid);
  if (fromGrid) return fromGrid;

  // 2. Callsign Prefix Lookup (greedy longest prefix match)
  if (callsign) {
    // Strip trailing modifiers like /P, /M, /QRP, /MM, -1
    let cleanCall = callsign.toUpperCase().trim();
    if (cleanCall.includes('/')) {
      const parts = cleanCall.split('/');
      // Pick the part that looks like an entity prefix or main call
      cleanCall = parts.find((p) => p.length >= 2 && p !== 'P' && p !== 'M' && p !== 'QRP' && p !== 'MM' && p !== 'GOTA') || parts[0];
    }

    for (const prefix of SORTED_DX_PREFIXES) {
      if (cleanCall.startsWith(prefix)) {
        return ITU_PREFIX_COORDS[prefix];
      }
    }
  }

  // 3. ARRL / RAC Section Lookup (for US and Canada)
  if (section && ARRL_SECTION_MAP.has(section.toUpperCase()) && section.toUpperCase() !== 'DX') {
    const secObj = ARRL_SECTION_MAP.get(section.toUpperCase())!;
    return { lat: secObj.lat, lng: secObj.lng };
  }

  // 4. Default fallback for unknown DX entities (mid-Atlantic ocean transit line)
  if (section?.toUpperCase() === 'DX') {
    return { lat: 25.0, lng: -45.0 };
  }

  return null;
}

/**
 * Calculates Great Circle distance between two coordinates in kilometers.
 */
export function calculateGreatCircleDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
