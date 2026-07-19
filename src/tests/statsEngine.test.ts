import { describe, it, expect } from 'vitest';
import { parseAdifLog, extractLogMetadata } from '../services/parser/adifParser';
import { calculateFieldDayScore } from '../services/scoring/fieldDayScorer';
import { buildBandModeMatrix, calculateSectionSweep } from '../services/analytics/statsEngine';

const SAMPLE_N3FJP_ADIF = `
ADIF Export from N3FJP's ARRL Field Day Contest Log
<LOG_PGM:34>N3FJP's ARRL Field Day Contest Log
<EOH>
<Call:4>K2AA<QSO_Date:8>20260627<Time_On:6>181538<Band:3>40M<Class:2>1D<Mode:2>CW<OPERATOR:6>KE8YBZ<ARRL_Sect:3>EPA<Station_Callsign:5>W8LKY<N3FJP_COMPUTERNAME:10>W8LKY-MAIN<eor>
<Call:4>WX3B<QSO_Date:8>20260627<Time_On:6>181807<Band:3>20M<Class:2>1D<Mode:3>SSB<OPERATOR:5>K8DXR<ARRL_Sect:3>MDC<Station_Callsign:5>W8LKY<N3FJP_COMPUTERNAME:7>W8LKY-2<eor>
<Call:3>K5K<QSO_Date:8>20260627<Time_On:6>184328<Band:3>15M<Class:2>5A<Mode:3>SSB<OPERATOR:6>KE8OWD<ARRL_Sect:2>MS<Station_Callsign:5>W8LKY<N3FJP_COMPUTERNAME:7>W8LKY-3<eor>
`;

describe('Field Day Stats Engine & ADIF Parser', () => {
  it('parses N3FJP ADIF logs and extracts station metadata and 3 transmitters', () => {
    const qsos = parseAdifLog(SAMPLE_N3FJP_ADIF, false);
    expect(qsos).toHaveLength(3);

    const meta = extractLogMetadata(qsos, SAMPLE_N3FJP_ADIF);
    expect(meta.discoveredCall).toBe('W8LKY');
    expect(meta.discoveredTransmitters).toBe(3);
    expect(meta.discoveredSection).toBe('OH');

    expect(qsos[0].operator).toBe('KE8YBZ');
    expect(qsos[1].operator).toBe('K8DXR');
    expect(qsos[2].operator).toBe('KE8OWD');
  });

  it('calculates band and mode matrix properly', () => {
    const qsos = parseAdifLog(SAMPLE_N3FJP_ADIF, false);
    const matrix = buildBandModeMatrix(qsos);
    expect(matrix['40M'].cw).toBe(1);
    expect(matrix['20M'].phone).toBe(1);
    expect(matrix['15M'].phone).toBe(1);
  });

  it('calculates section sweep against 86 available sections', () => {
    const qsos = parseAdifLog(SAMPLE_N3FJP_ADIF, false);
    const sweep = calculateSectionSweep(qsos);
    expect(sweep.workedCount).toBe(3);
    expect(sweep.totalAvailable).toBe(86);
  });
});
