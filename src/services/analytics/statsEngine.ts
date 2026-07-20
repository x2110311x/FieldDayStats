import { QSO, BandModeMatrixCell, OperatorStats, StationStats, VelocityBin } from '../../types';
import { OFFICIAL_ARRL_SECTIONS, ARRL_SECTION_MAP } from '../geo/arrlSections';

export const BANDS_ORDER = ['160M', '80M', '40M', '20M', '15M', '10M', '6M', '2M', '1.25M', '70CM', 'OTH'];

/**
 * Builds the multi-dimensional Band & Mode matrix cross-tabulation table.
 */
export function buildBandModeMatrix(qsos: QSO[]): Record<string, BandModeMatrixCell> {
  const matrix: Record<string, BandModeMatrixCell> = {};

  for (const band of BANDS_ORDER) {
    matrix[band] = { cw: 0, phone: 0, digital: 0, total: 0 };
  }

  for (const qso of qsos) {
    const bandKey = BANDS_ORDER.includes(qso.band) ? qso.band : 'OTH';
    if (!matrix[bandKey]) {
      matrix[bandKey] = { cw: 0, phone: 0, digital: 0, total: 0 };
    }

    if (qso.mode === 'CW') matrix[bandKey].cw++;
    else if (qso.mode === 'PHONE') matrix[bandKey].phone++;
    else if (qso.mode === 'DIGITAL') matrix[bandKey].digital++;

    matrix[bandKey].total++;
  }

  return matrix;
}

/**
 * Ranks top 20 Band/Mode combinations.
 */
export function getTopBandModeCombinations(qsos: QSO[], limit = 20): { combo: string; count: number; pct: number }[] {
  const counts: Record<string, number> = {};
  const total = qsos.length || 1;

  for (const qso of qsos) {
    let modeLabel = 'SSB';
    if (qso.mode === 'CW') modeLabel = 'CW';
    else if (qso.mode === 'DIGITAL') modeLabel = 'DIG';
    else if (qso.rawMode) modeLabel = qso.rawMode.toUpperCase();

    const comboKey = `${qso.band}|${modeLabel}`;
    counts[comboKey] = (counts[comboKey] || 0) + 1;
  }

  return Object.entries(counts)
    .map(([combo, count]) => ({
      combo,
      count,
      pct: parseFloat(((count / total) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Calculates hourly QSO velocity timeline formatted in the user's local timezone.
 */
export function calculateActivityTimeline(qsos: QSO[]): {
  bins: VelocityBin[];
  peakHourlyRate: number;
  peakWindowLabel: string;
} {
  if (qsos.length === 0) {
    return { bins: [], peakHourlyRate: 0, peakWindowLabel: 'N/A' };
  }

  const sorted = [...qsos].sort((a, b) => a.timestamp - b.timestamp);
  const minTime = sorted[0].timestamp;
  const maxTime = sorted[sorted.length - 1].timestamp;

  const startHour = Math.floor(minTime / 3600000) * 3600000;
  const endHour = Math.ceil((maxTime + 1) / 3600000) * 3600000;

  const binsMap = new Map<number, VelocityBin>();

  for (let t = startHour; t <= endHour; t += 3600000) {
    const dateObj = new Date(t);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const dayStr = dateObj.getDate();
    const timeLabel = `${timeStr} (${dayStr}th)`;

    binsMap.set(t, {
      timeLabel,
      timestamp: t,
      qsoCount: 0,
      cwCount: 0,
      phoneCount: 0,
      digitalCount: 0,
      bandCountMap: {},
      primaryBand: '20M',
    });
  }

  for (const qso of sorted) {
    const hourBinKey = Math.floor(qso.timestamp / 3600000) * 3600000;
    const bin = binsMap.get(hourBinKey);
    if (bin) {
      bin.qsoCount++;
      if (qso.mode === 'CW') bin.cwCount++;
      else if (qso.mode === 'PHONE') bin.phoneCount++;
      else if (qso.mode === 'DIGITAL') bin.digitalCount++;

      bin.bandCountMap[qso.band] = (bin.bandCountMap[qso.band] || 0) + 1;
    }
  }

  const bins = Array.from(binsMap.values());

  let peakHourlyRate = 0;
  let peakWindowLabel = 'N/A';

  for (const bin of bins) {
    let maxBand = '20M';
    let maxBandCount = -1;
    for (const [band, count] of Object.entries(bin.bandCountMap)) {
      if (count > maxBandCount) {
        maxBandCount = count;
        maxBand = band;
      }
    }
    bin.primaryBand = maxBand;

    if (bin.qsoCount > peakHourlyRate) {
      peakHourlyRate = bin.qsoCount;
      peakWindowLabel = bin.timeLabel;
    }
  }

  return { bins, peakHourlyRate, peakWindowLabel };
}

/**
 * Computes Operator Leaderboard statistics.
 */
export function getOperatorLeaderboard(qsos: QSO[]): OperatorStats[] {
  const map = new Map<
    string,
    {
      total: number;
      cw: number;
      phone: number;
      digital: number;
      hoursSet: Set<string>;
      bandCounts: Record<string, number>;
    }
  >();

  const totalQsos = qsos.length || 1;

  for (const qso of qsos) {
    const op = (qso.operator || 'MAIN_OP').toUpperCase();
    if (!map.has(op)) {
      map.set(op, {
        total: 0,
        cw: 0,
        phone: 0,
        digital: 0,
        hoursSet: new Set(),
        bandCounts: {},
      });
    }

    const data = map.get(op)!;
    data.total++;
    if (qso.mode === 'CW') data.cw++;
    else if (qso.mode === 'PHONE') data.phone++;
    else if (qso.mode === 'DIGITAL') data.digital++;

    const hourKey = `${qso.date}_${qso.time.substring(0, 2)}`;
    data.hoursSet.add(hourKey);

    data.bandCounts[qso.band] = (data.bandCounts[qso.band] || 0) + 1;
  }

  return Array.from(map.entries())
    .map(([callsign, data]) => {
      let topBand = '20M';
      let maxCount = -1;
      for (const [b, count] of Object.entries(data.bandCounts)) {
        if (count > maxCount) {
          maxCount = count;
          topBand = b;
        }
      }

      // Bands sorted by standard order
      const workedBands = BANDS_ORDER.filter((b) => (data.bandCounts[b] || 0) > 0);

      // Compact mode string
      const modeLabels: string[] = [];
      if (data.cw > 0) modeLabels.push('CW');
      if (data.phone > 0) modeLabels.push('SSB');
      if (data.digital > 0) modeLabels.push('DIG');
      const workedModes = modeLabels.join(' / ') || '—';

      return {
        callsign,
        totalQsos: data.total,
        cwQsos: data.cw,
        phoneQsos: data.phone,
        digitalQsos: data.digital,
        activeHours: Math.max(data.hoursSet.size, 1),
        topBand,
        workedBands,
        workedModes,
        bandCounts: data.bandCounts,
        pctOfTotal: parseFloat(((data.total / totalQsos) * 100).toFixed(1)),
      };
    })
    .sort((a, b) => b.totalQsos - a.totalQsos);
}

/**
 * Computes Station / Rig comparative breakdown statistics.
 */
export function getStationBreakdown(qsos: QSO[]): StationStats[] {
  const map = new Map<
    string,
    {
      total: number;
      cw: number;
      phone: number;
      digital: number;
      bandCounts: Record<string, number>;
    }
  >();

  const totalQsos = qsos.length || 1;

  for (const qso of qsos) {
    const st = (qso.station || 'STATION_1').toUpperCase();
    if (!map.has(st)) {
      map.set(st, { total: 0, cw: 0, phone: 0, digital: 0, bandCounts: {} });
    }

    const data = map.get(st)!;
    data.total++;
    if (qso.mode === 'CW') data.cw++;
    else if (qso.mode === 'PHONE') data.phone++;
    else if (qso.mode === 'DIGITAL') data.digital++;

    data.bandCounts[qso.band] = (data.bandCounts[qso.band] || 0) + 1;
  }

  return Array.from(map.entries())
    .map(([name, data]) => {
      let topBand = '20M';
      let maxCount = -1;
      for (const [b, count] of Object.entries(data.bandCounts)) {
        if (count > maxCount) {
          maxCount = count;
          topBand = b;
        }
      }

      const workedBands = BANDS_ORDER.filter((b) => (data.bandCounts[b] || 0) > 0);

      return {
        name,
        totalQsos: data.total,
        cwQsos: data.cw,
        phoneQsos: data.phone,
        digitalQsos: data.digital,
        topBand,
        workedBands,
        bandCounts: data.bandCounts,
        pctOfTotal: parseFloat(((data.total / totalQsos) * 100).toFixed(1)),
      };
    })
    .sort((a, b) => b.totalQsos - a.totalQsos);
}

/**
 * Computes 86-Section Sweep analytics.
 */
export function calculateSectionSweep(qsos: QSO[]) {
  const sectionCounts: Record<string, number> = {};
  for (const qso of qsos) {
    const sec = qso.section.toUpperCase();
    sectionCounts[sec] = (sectionCounts[sec] || 0) + 1;
  }

  const officialCodes = OFFICIAL_ARRL_SECTIONS.map((s) => s.code);
  const workedSet = new Set<string>();
  const missingList: string[] = [];

  for (const code of officialCodes) {
    if (sectionCounts[code] && sectionCounts[code] > 0) {
      workedSet.add(code);
    } else {
      missingList.push(code);
    }
  }

  const workedCount = workedSet.size;
  const totalAvailable = 86;
  const sweepPct = parseFloat(((workedCount / totalAvailable) * 100).toFixed(1));

  const topSections = Object.entries(sectionCounts)
    .map(([code, count]) => ({
      code,
      name: ARRL_SECTION_MAP.get(code)?.name || code,
      count,
      pct: parseFloat(((count / (qsos.length || 1)) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    workedCount,
    totalAvailable,
    sweepPct,
    sectionCounts,
    workedSet,
    missingList,
    topSections,
  };
}
