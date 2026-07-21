import { latLngToGrid, isValidGrid } from './maidenhead';

export interface CallsignLookupResult {
  callsign: string;
  name?: string;
  type?: string;
  grid?: string;
  section?: string;
  state?: string;
  lat?: number;
  lng?: number;
}

/**
 * Looks up Maidenhead Grid Square from a 5-digit US ZIP code using zippopotam.us API.
 * Returns undefined if zip lookup fails.
 */
export async function lookupGridFromZip(zipInput: string): Promise<string | undefined> {
  const cleanZip = zipInput.trim().replace(/[^\d]/g, '');
  if (!cleanZip || cleanZip.length < 5) return undefined;

  const fiveDigitZip = cleanZip.substring(0, 5);
  try {
    const res = await fetch(`https://api.zippopotam.us/us/${fiveDigitZip}`);
    if (res.ok) {
      const data = await res.json();
      const place = data?.places?.[0];
      if (place && place.latitude && place.longitude) {
        const lat = parseFloat(place.latitude);
        const lng = parseFloat(place.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
          return latLngToGrid(lat, lng, 4);
        }
      }
    }
  } catch (err) {
    console.warn('ZIP code grid lookup error:', err);
  }
  return undefined;
}

export async function lookupCallsign(rawCall: string): Promise<CallsignLookupResult | null> {
  const cleanCall = rawCall.trim().toUpperCase().split('/')[0].split('-')[0];
  if (!cleanCall || cleanCall.length < 3) return null;

  try {
    const res = await fetch(`https://callook.info/${cleanCall}/json`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'VALID') {
        let grid = data.location?.gridsquare ? data.location.gridsquare.toUpperCase() : undefined;
        const name = data.name || (data.trustee?.name ? `${data.trustee.name} Club` : undefined);
        const state = data.address?.line2?.split(',')[1]?.trim()?.substring(0, 2)?.toUpperCase();
        const lat = data.location?.latitude ? parseFloat(data.location.latitude) : undefined;
        const lng = data.location?.longitude ? parseFloat(data.location.longitude) : undefined;

        // If grid square was not provided directly, calculate from lat/lng if available
        if (!grid && lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
          grid = latLngToGrid(lat, lng, 4);
        }

        // If grid square is still not available, check for ZIP code in address line
        if (!grid && data.address?.line2) {
          const zipMatch = /\b(\d{5})(?:-\d{4})?\b/.exec(data.address.line2);
          if (zipMatch) {
            grid = await lookupGridFromZip(zipMatch[1]);
          }
        }

        // Ensure grid square is valid 4-character Maidenhead (XX##)
        if (grid) {
          grid = grid.substring(0, 4);
          if (!isValidGrid(grid)) {
            grid = undefined;
          }
        }

        return {
          callsign: cleanCall,
          name: name ? name.toUpperCase() : undefined,
          type: data.type,
          grid,
          section: state,
          lat,
          lng,
        };
      }
    }
  } catch (err) {
    console.warn('Callsign API lookup error:', err);
  }

  // If lookup fails or yields no data, return callsign with details left blank
  return {
    callsign: cleanCall,
    name: undefined,
    grid: undefined,
    section: undefined,
  };
}
