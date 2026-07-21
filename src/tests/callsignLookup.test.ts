import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lookupCallsign, lookupGridFromZip } from '../services/geo/callsignLookup';
import { latLngToGrid, isValidGrid, formatGridInput } from '../services/geo/maidenhead';
import { isValidSection, formatSectionInput } from '../services/geo/arrlSections';

describe('maidenhead & callsignLookup service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('validates official ARRL / RAC / DX section codes', () => {
    expect(isValidSection('CT')).toBe(true);
    expect(isValidSection('MDC')).toBe(true);
    expect(isValidSection('EMA')).toBe(true);
    expect(isValidSection('DX')).toBe(true);
    expect(isValidSection('WPA')).toBe(true);
    expect(isValidSection('XYZ')).toBe(false);
    expect(isValidSection('')).toBe(false);
    expect(isValidSection(undefined)).toBe(false);
  });

  it('formats section input properly', () => {
    expect(formatSectionInput('ct')).toBe('CT');
    expect(formatSectionInput('mdc123')).toBe('MDC');
    expect(formatSectionInput('wma')).toBe('WMA');
  });

  it('validates 4-character XX## Maidenhead grid format', () => {
    expect(isValidGrid('EN90')).toBe(true);
    expect(isValidGrid('FN31')).toBe(true);
    expect(isValidGrid('DM04')).toBe(true);
    expect(isValidGrid('EN9')).toBe(false);
    expect(isValidGrid('90EN')).toBe(false);
    expect(isValidGrid('EN901')).toBe(false);
    expect(isValidGrid('')).toBe(false);
    expect(isValidGrid(undefined)).toBe(false);
  });

  it('formats input to enforce XX## pattern', () => {
    expect(formatGridInput('en90')).toBe('EN90');
    expect(formatGridInput('1234')).toBe('');
    expect(formatGridInput('EN90abc')).toBe('EN90');
    expect(formatGridInput('E1N23')).toBe('EN23');
  });

  it('converts Lat/Lng coordinates to Maidenhead grid locator correctly', () => {
    expect(latLngToGrid(41.7151, -72.7266, 4)).toBe('FN31');
    expect(latLngToGrid(34.0901, -118.4065, 4)).toBe('DM04');
    expect(latLngToGrid(41.7151, -72.7266, 6)).toBe('FN31PR');
  });

  it('returns blank details when callsign lookup fails instead of silly fallback', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify({ status: 'INVALID' }), { status: 200 });
    });

    const res = await lookupCallsign('W1AW');
    expect(res).toEqual({
      callsign: 'W1AW',
      name: undefined,
      grid: undefined,
      section: undefined,
    });
  });

  it('looks up grid square from zip code', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('zippopotam.us/us/06111')) {
        return new Response(
          JSON.stringify({
            'post code': '06111',
            places: [{ latitude: '41.7151', longitude: '-72.7266' }],
          }),
          { status: 200 }
        );
      }
      return new Response(null, { status: 404 });
    });

    const grid = await lookupGridFromZip('06111');
    expect(grid).toBe('FN31');
  });

  it('returns undefined if zip code lookup fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(null, { status: 404 });
    });

    const grid = await lookupGridFromZip('99999');
    expect(grid).toBeUndefined();
  });

  it('trims 6-character grids from callsign lookup to 4 characters', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(
        JSON.stringify({
          status: 'VALID',
          name: 'ARRL HQ',
          location: { gridsquare: 'FN31pr' },
          address: { line2: 'NEWINGTON, CT 06111' },
        }),
        { status: 200 }
      );
    });

    const res = await lookupCallsign('W1AW');
    expect(res?.grid).toBe('FN31');
  });
});
