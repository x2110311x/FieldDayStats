/**
 * Client-Side Amateur Radio Callsign & License Lookup Service.
 * Uses callook.info (FCC database API with CORS enabled) with offline fallback.
 */

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

const CALL_DISTRICT_FALLBACKS: Record<string, { grid: string; section: string; name: string }> = {
  '1': { grid: 'FN31', section: 'CT', name: 'New England Amateur Radio Club' },
  '2': { grid: 'FN20', section: 'NNJ', name: 'Hudson Valley Amateur Radio Club' },
  '3': { grid: 'FM19', section: 'MDC', name: 'Tri-State Amateur Radio Association' },
  '4': { grid: 'EM73', section: 'GA', name: 'Southeastern Amateur Radio Club' },
  '5': { grid: 'EM12', section: 'NTX', name: 'West Gulf Amateur Radio Club' },
  '6': { grid: 'DM04', section: 'LAX', name: 'Pacific Amateur Radio Club' },
  '7': { grid: 'CN87', section: 'WWA', name: 'Northwest Amateur Radio Society' },
  '8': { grid: 'EN91', section: 'OH', name: 'Great Lakes Amateur Radio Club' },
  '9': { grid: 'EN51', section: 'IL', name: 'Central Amateur Radio Club' },
  '0': { grid: 'EN34', section: 'MN', name: 'Midwest Amateur Radio Club' },
};

export async function lookupCallsign(rawCall: string): Promise<CallsignLookupResult | null> {
  const cleanCall = rawCall.trim().toUpperCase().split('/')[0].split('-')[0];
  if (!cleanCall || cleanCall.length < 3) return null;

  try {
    const res = await fetch(`https://callook.info/${cleanCall}/json`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'VALID') {
        const grid = data.location?.gridsquare ? data.location.gridsquare.toUpperCase() : undefined;
        const name = data.name || (data.trustee?.name ? `${data.trustee.name} Club` : undefined);
        const state = data.address?.line2?.split(',')[1]?.trim()?.substring(0, 2)?.toUpperCase();

        return {
          callsign: cleanCall,
          name: name ? name.toUpperCase() : undefined,
          type: data.type,
          grid,
          section: state,
          lat: data.location?.latitude ? parseFloat(data.location.latitude) : undefined,
          lng: data.location?.longitude ? parseFloat(data.location.longitude) : undefined,
        };
      }
    }
  } catch (err) {
    console.warn('Callsign API lookup error, using fallback:', err);
  }

  // Fallback estimation by Call District number (e.g. W8LKY -> district 8)
  const numMatch = /\d/.exec(cleanCall);
  const districtDigit = numMatch ? numMatch[0] : '1';
  const fallback = CALL_DISTRICT_FALLBACKS[districtDigit] || CALL_DISTRICT_FALLBACKS['1'];

  return {
    callsign: cleanCall,
    name: undefined,
    grid: fallback.grid,
    section: fallback.section,
  };
}
