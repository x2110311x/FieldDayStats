import { QSO, ModeType } from '../../types';
import { ARRL_SECTION_MAP } from '../geo/arrlSections';

/**
 * Standardizes frequency in MHz into canonical amateur radio band label.
 */
export function normalizeBand(bandStr?: string, freqMHz?: number): string {
  if (bandStr) {
    const cleanBand = bandStr.trim().toUpperCase();
    if (cleanBand.endsWith('M') || cleanBand.endsWith('CM')) return cleanBand;
    if (cleanBand === '160' || cleanBand === '80' || cleanBand === '40' || cleanBand === '20' || cleanBand === '15' || cleanBand === '10' || cleanBand === '6' || cleanBand === '2' || cleanBand === '70') {
      return cleanBand === '70' ? '70CM' : `${cleanBand}M`;
    }
  }

  if (freqMHz && freqMHz > 0) {
    if (freqMHz >= 1.8 && freqMHz <= 2.0) return '160M';
    if (freqMHz >= 3.5 && freqMHz <= 4.0) return '80M';
    if (freqMHz >= 7.0 && freqMHz <= 7.3) return '40M';
    if (freqMHz >= 14.0 && freqMHz <= 14.35) return '20M';
    if (freqMHz >= 21.0 && freqMHz <= 21.45) return '15M';
    if (freqMHz >= 28.0 && freqMHz <= 29.7) return '10M';
    if (freqMHz >= 50.0 && freqMHz <= 54.0) return '6M';
    if (freqMHz >= 144.0 && freqMHz <= 148.0) return '2M';
    if (freqMHz >= 222.0 && freqMHz <= 225.0) return '1.25M';
    if (freqMHz >= 420.0 && freqMHz <= 450.0) return '70CM';
  }

  return 'OTH';
}

/**
 * Maps raw operating mode to standard Field Day mode category (CW, PHONE, DIGITAL).
 */
export function normalizeMode(rawMode?: string, submode?: string): { mode: ModeType; rawMode: string } {
  const m = (submode || rawMode || 'PHONE').trim().toUpperCase();

  if (m === 'CW') {
    return { mode: 'CW', rawMode: 'CW' };
  }

  const phoneModes = ['SSB', 'PHONE', 'PH', 'FM', 'AM', 'USB', 'LSB'];
  if (phoneModes.includes(m)) {
    return { mode: 'PHONE', rawMode: m };
  }

  return { mode: 'DIGITAL', rawMode: m };
}

/**
 * Extracts ARRL/RAC Section from exchange string or explicit section tag.
 */
export function extractSection(arrlSect?: string, srxString?: string, state?: string): string {
  if (arrlSect && ARRL_SECTION_MAP.has(arrlSect.trim().toUpperCase())) {
    return arrlSect.trim().toUpperCase();
  }

  if (srxString) {
    const parts = srxString.trim().toUpperCase().split(/\s+/);
    for (const part of parts) {
      if (ARRL_SECTION_MAP.has(part)) {
        return part;
      }
    }
  }

  if (state && ARRL_SECTION_MAP.has(state.trim().toUpperCase())) {
    return state.trim().toUpperCase();
  }

  return 'DX';
}

/**
 * Robust ADIF file string parser.
 */
export function parseAdifLog(adifContent: string, isGotaFile = false): QSO[] {
  if (!adifContent || typeof adifContent !== 'string') return [];

  let body = adifContent;
  const eohIndex = adifContent.search(/<EOH>/i);
  if (eohIndex !== -1) {
    body = adifContent.substring(eohIndex + 5);
  }

  const rawRecords = body.split(/<EOR>/i);
  const qsos: QSO[] = [];

  let recordCounter = 1;

  for (const rawRecord of rawRecords) {
    if (!rawRecord.trim()) continue;

    const recordData: Record<string, string> = {};

    const tagRegex = /<([A-Z0-9_]+):(\d+)(?::[A-Z0-9_]+)?>([^<]*)/gi;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(rawRecord)) !== null) {
      const tagName = match[1].toUpperCase();
      const length = parseInt(match[2], 10);
      let val = match[3];

      if (!isNaN(length) && val.length > length) {
        val = val.substring(0, length);
      }
      recordData[tagName] = val.trim();
    }

    if (!recordData['CALL']) continue;

    const freqMHz = recordData['FREQ'] ? parseFloat(recordData['FREQ']) : 0;
    const band = normalizeBand(recordData['BAND'], freqMHz);
    const { mode, rawMode } = normalizeMode(recordData['MODE'], recordData['SUBMODE']);

    let rawDate = recordData['QSO_DATE'] || recordData['DATE'] || '20260627';
    rawDate = rawDate.replace(/\D/g, '');
    let formattedDate = '2026-06-27';
    if (rawDate.length === 8) {
      formattedDate = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
    }

    let rawTime = recordData['TIME_ON'] || recordData['TIME_OFF'] || recordData['TIME'] || '1800';
    rawTime = rawTime.replace(/\D/g, '');
    let formattedTime = '18:00';
    if (rawTime.length >= 4) {
      formattedTime = `${rawTime.substring(0, 2)}:${rawTime.substring(2, 4)}`;
    }

    const timestamp = new Date(`${formattedDate}T${formattedTime}:00Z`).getTime();

    const operator = recordData['OPERATOR'] || recordData['STATION_CALLSIGN'] || 'MAIN_OP';
    const station = recordData['STATION_CALLSIGN'] || recordData['RIG'] || recordData['MY_RIG'] || 'STATION_1';
    const section = extractSection(recordData['ARRL_SECT'], recordData['SRX_STRING'], recordData['STATE']);
    const grid = recordData['GRIDSQUARE'] || recordData['MY_GRIDSQUARE'] || '';

    let classRcvd = recordData['CLASS'] || recordData['CONTEST_CLASS'] || '';
    if (!classRcvd && recordData['SRX_STRING']) {
      const parts = recordData['SRX_STRING'].trim().split(/\s+/);
      if (parts.length > 0 && /^\d+[A-F]$/i.test(parts[0])) {
        classRcvd = parts[0].toUpperCase();
      }
    }

    const isSat =
      recordData['PROP_MODE'] === 'SAT' ||
      !!recordData['SAT_NAME'] ||
      recordData['BAND'] === 'SAT' ||
      recordData['COMMENT']?.toLowerCase().includes('satellite');

    qsos.push({
      id: `qso_${recordCounter++}_${Date.now()}`,
      call: recordData['CALL'].toUpperCase(),
      band: isSat ? 'SAT' : band,
      freq: freqMHz,
      mode,
      rawMode,
      date: formattedDate,
      time: formattedTime,
      timestamp: isNaN(timestamp) ? Date.now() : timestamp,
      operator: operator.toUpperCase(),
      station: station.toUpperCase(),
      section,
      classSent: recordData['STX_STRING'] || recordData['CLASS_SENT'] || '',
      classRcvd: classRcvd.toUpperCase(),
      grid: grid.toUpperCase(),
      isGota: isGotaFile || recordData['STATION_CALLSIGN']?.includes('GOTA') || false,
      notes: recordData['COMMENT'] || recordData['NOTES'] || ''
    });
  }

  return qsos;
}

/**
 * Discovers setup metadata (station callsign, home grid, section, class, transmitter count, satellite QSOs) from log file.
 */
export function extractLogMetadata(qsos: QSO[], adifContent: string): {
  discoveredCall?: string;
  discoveredGrid?: string;
  discoveredSection?: string;
  discoveredClassLetter?: string;
  discoveredTransmitters?: number;
  hasSatelliteQso: boolean;
} {
  let discoveredCall: string | undefined;
  let discoveredGrid: string | undefined;
  let discoveredSection: string | undefined;
  let discoveredClassLetter: string | undefined;
  let discoveredTransmitters: number | undefined;
  let hasSatelliteQso = false;

  // Extract from tags in raw ADIF
  const myCallMatch = /<MY_CALL:\d+>([^<]+)/i.exec(adifContent) || /<STATION_CALLSIGN:\d+>([^<]+)/i.exec(adifContent);
  if (myCallMatch) discoveredCall = myCallMatch[1].trim().toUpperCase();

  const myGridMatch = /<MY_GRIDSQUARE:\d+>([^<]+)/i.exec(adifContent) || /<MY_GRID:\d+>([^<]+)/i.exec(adifContent);
  if (myGridMatch) discoveredGrid = myGridMatch[1].trim().toUpperCase();

  const mySectMatch = /<MY_ARRL_SECT:\d+>([^<]+)/i.exec(adifContent) || /<MY_SECTION:\d+>([^<]+)/i.exec(adifContent);
  if (mySectMatch) discoveredSection = mySectMatch[1].trim().toUpperCase();

  const classSentMatch = /<STX_STRING:\d+>([^<]+)/i.exec(adifContent) || /<CLASS_SENT:\d+>([^<]+)/i.exec(adifContent);
  if (classSentMatch) {
    const exchange = classSentMatch[1].trim().toUpperCase();
    const parts = exchange.split(/\s+/);
    if (parts.length >= 1) {
      const classPart = parts[0]; // e.g. "3A"
      const m = /^(\d+)([A-F])$/i.exec(classPart);
      if (m) {
        discoveredTransmitters = parseInt(m[1], 10);
        discoveredClassLetter = m[2].toUpperCase();
      }
    }
    if (parts.length >= 2 && !discoveredSection) {
      if (ARRL_SECTION_MAP.has(parts[1])) {
        discoveredSection = parts[1];
      }
    }
  }

  // Check for Satellite QSOs
  for (const qso of qsos) {
    if (qso.band === 'SAT' || qso.notes?.toLowerCase().includes('satellite') || qso.notes?.toLowerCase().includes('sat')) {
      hasSatelliteQso = true;
      break;
    }
  }

  return {
    discoveredCall,
    discoveredGrid,
    discoveredSection,
    discoveredClassLetter,
    discoveredTransmitters,
    hasSatelliteQso,
  };
}
