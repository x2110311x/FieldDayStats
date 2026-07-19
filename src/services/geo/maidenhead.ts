import { ARRL_SECTION_MAP } from './arrlSections';

export interface LatLng {
  lat: number;
  lng: number;
}

/**
 * Converts a Maidenhead grid locator (e.g. FN31, EM12, FM19, FN31pr) to Latitude and Longitude.
 */
export function gridToLatLng(grid: string): LatLng | null {
  if (!grid || typeof grid !== 'string') return null;
  const cleanGrid = grid.trim().toUpperCase();
  if (cleanGrid.length < 4) return null;

  const char1 = cleanGrid.charCodeAt(0) - 65; // A-R
  const char2 = cleanGrid.charCodeAt(1) - 65; // A-R
  const num3 = parseInt(cleanGrid[2], 10);   // 0-9
  const num4 = parseInt(cleanGrid[3], 10);   // 0-9

  if (char1 < 0 || char1 > 17 || char2 < 0 || char2 > 17 || isNaN(num3) || isNaN(num4)) {
    return null;
  }

  let lng = char1 * 20 - 180 + num3 * 2;
  let lat = char2 * 10 - 90 + num4 * 1;

  if (cleanGrid.length >= 6) {
    const char5 = cleanGrid.toLowerCase().charCodeAt(4) - 97; // a-x
    const char6 = cleanGrid.toLowerCase().charCodeAt(5) - 97; // a-x
    if (char5 >= 0 && char5 <= 23 && char6 >= 0 && char6 <= 23) {
      lng += char5 * (2 / 24) + 1 / 24;
      lat += char6 * (1 / 24) + 1 / 48;
      return { lat, lng };
    }
  }

  // Center of 4-char square
  lng += 1.0;
  lat += 0.5;

  return { lat, lng };
}

/**
 * Converts Lat/Lng to 4-character Maidenhead grid locator.
 */
export function latLngToGrid(lat: number, lng: number): string {
  let adjustedLng = lng + 180;
  let adjustedLat = lat + 90;

  const char1 = String.fromCharCode(65 + Math.floor(adjustedLng / 20));
  const char2 = String.fromCharCode(65 + Math.floor(adjustedLat / 10));

  adjustedLng %= 20;
  adjustedLat %= 10;

  const num3 = Math.floor(adjustedLng / 2);
  const num4 = Math.floor(adjustedLat / 1);

  return `${char1}${char2}${num3}${num4}`;
}

/**
 * Fallback coordinate resolver based on Section code or Callsign prefix.
 */
export function resolveQsoCoordinates(grid?: string, section?: string, callsign?: string): LatLng {
  // 1. Explicit Grid
  if (grid) {
    const parsed = gridToLatLng(grid);
    if (parsed) return parsed;
  }

  // 2. Section Code match
  if (section) {
    const sec = ARRL_SECTION_MAP.get(section.trim().toUpperCase());
    if (sec && (sec.lat !== 0 || sec.lng !== 0)) {
      return { lat: sec.lat, lng: sec.lng };
    }
  }

  // 3. Callsign Prefix match
  if (callsign) {
    const cleanCall = callsign.trim().toUpperCase();
    if (cleanCall.startsWith('KH6') || cleanCall.startsWith('WH6') || cleanCall.startsWith('NH6')) {
      return { lat: 21.3, lng: -157.8 }; // Hawaii
    }
    if (cleanCall.startsWith('KL7') || cleanCall.startsWith('AL7') || cleanCall.startsWith('WL7')) {
      return { lat: 61.2, lng: -149.9 }; // Alaska
    }
    if (cleanCall.startsWith('KP4') || cleanCall.startsWith('NP4') || cleanCall.startsWith('WP4')) {
      return { lat: 18.2, lng: -66.4 }; // Puerto Rico
    }
    if (cleanCall.startsWith('KP2') || cleanCall.startsWith('NP2') || cleanCall.startsWith('WP2')) {
      return { lat: 18.3, lng: -64.9 }; // Virgin Islands
    }
    if (cleanCall.startsWith('VE1') || cleanCall.startsWith('VA1')) return { lat: 44.6, lng: -63.5 };
    if (cleanCall.startsWith('VE2') || cleanCall.startsWith('VA2')) return { lat: 45.5, lng: -73.5 };
    if (cleanCall.startsWith('VE3') || cleanCall.startsWith('VA3')) return { lat: 43.6, lng: -79.3 };
    if (cleanCall.startsWith('VE4') || cleanCall.startsWith('VA4')) return { lat: 49.8, lng: -97.1 };
    if (cleanCall.startsWith('VE5') || cleanCall.startsWith('VA5')) return { lat: 50.4, lng: -104.6 };
    if (cleanCall.startsWith('VE6') || cleanCall.startsWith('VA6')) return { lat: 51.0, lng: -114.0 };
    if (cleanCall.startsWith('VE7') || cleanCall.startsWith('VA7')) return { lat: 49.2, lng: -123.1 };
    if (cleanCall.startsWith('VE8') || cleanCall.startsWith('VY0')) return { lat: 62.4, lng: -114.3 };
  }

  // Default to US Midwest center
  return { lat: 39.5, lng: -98.3 };
}

/**
 * Calculates Great-Circle distance between two lat/lng points in miles.
 */
export function calculateDistanceMiles(p1: LatLng, p2: LatLng): number {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
  const dLng = (p2.lng - p1.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat * (Math.PI / 180)) *
      Math.cos(p2.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
