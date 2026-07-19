import { describe, it, expect } from 'vitest';
import { parseAdifLog } from '../services/parser/adifParser';
import { calculateFieldDayScore } from '../services/scoring/fieldDayScorer';
import { buildBandModeMatrix, calculateSectionSweep } from '../services/analytics/statsEngine';
import { gridToLatLng } from '../services/geo/maidenhead';
import { FieldDayConfig } from '../types';

describe('Field Day Stats Engine Unit Tests', () => {
  const sampleAdif = `
<CALL:4>W1AW <BAND:3>20M <MODE:2>CW <QSO_DATE:8>20260627 <TIME_ON:4>1805 <ARRL_SECT:2>CT <OPERATOR:4>N1MM <STATION_CALLSIGN:4>RIG1 <GRIDSQUARE:4>FN31 <EOR>
<CALL:4>K1ABC <BAND:3>40M <MODE:3>SSB <QSO_DATE:8>20260627 <TIME_ON:4>1820 <ARRL_SECT:3>EMA <OPERATOR:4>K1ABC <STATION_CALLSIGN:4>RIG1 <GRIDSQUARE:4>FN42 <EOR>
<CALL:4>N2DEF <BAND:3>80M <MODE:3>FT8 <QSO_DATE:8>20260627 <TIME_ON:4>1915 <ARRL_SECT:3>STX <OPERATOR:4>N1MM <STATION_CALLSIGN:4>RIG2 <GRIDSQUARE:4>EM12 <EOR>
  `;

  it('should parse ADIF tags correctly', () => {
    const qsos = parseAdifLog(sampleAdif);
    expect(qsos.length).toBe(3);
    expect(qsos[0].call).toBe('W1AW');
    expect(qsos[0].mode).toBe('CW');
    expect(qsos[1].mode).toBe('PHONE');
    expect(qsos[2].mode).toBe('DIGITAL');
    expect(qsos[0].section).toBe('CT');
  });

  it('should calculate matrix cell counts correctly', () => {
    const qsos = parseAdifLog(sampleAdif);
    const matrix = buildBandModeMatrix(qsos);
    expect(matrix['20M'].cw).toBe(1);
    expect(matrix['40M'].phone).toBe(1);
    expect(matrix['80M'].digital).toBe(1);
  });

  it('should compute official ARRL Field Day scores accurately', () => {
    const qsos = parseAdifLog(sampleAdif);
    const config: FieldDayConfig = {
      clubCall: 'W1AW',
      clubName: 'Test Club',
      entryClass: '2A',
      transmitters: 2,
      powerCategory: 'LOW_100W',
      powerSource: 'GENERATOR_MAINS',
      homeGrid: 'FN31',
      homeSection: 'CT',
      totalParticipants: 10,
      youthParticipants: 0,
      gotaCall: '',
      bonuses: {
        emergencyPower: true,
        mediaPublicity: false,
        publicLocation: false,
        infoBooth: false,
        smSecMessage: false,
        w1awBulletin: false,
        ntsMessagesCount: 0,
        satelliteQso: false,
        naturalPower: false,
        electedOfficialVisit: false,
        agencyOfficialVisit: false,
        educationalActivity: false,
        youthQsoCount: 0,
        webSubmission: true,
        safetyOfficer: false,
        siteResponsibilities: false,
        socialMedia: false,
        gotaCoach: false,
      },
    };

    const score = calculateFieldDayScore(qsos, [], config);
    // Raw points: CW (2) + Phone (1) + Digital (2) = 5 pts
    // 2x Multiplier -> 10 pts
    // Bonuses: Emergency power (200) + Web submission (50) = 250 pts
    // Total score = 260 pts
    expect(score.rawQsoPoints).toBe(5);
    expect(score.multipliedQsoPoints).toBe(10);
    expect(score.totalBonusPoints).toBe(250);
    expect(score.totalScore).toBe(260);
  });

  it('should calculate section sweep correctly', () => {
    const qsos = parseAdifLog(sampleAdif);
    const sweep = calculateSectionSweep(qsos);
    expect(sweep.workedCount).toBe(3);
    expect(sweep.workedSet.has('CT')).toBe(true);
    expect(sweep.workedSet.has('EMA')).toBe(true);
    expect(sweep.workedSet.has('STX')).toBe(true);
  });

  it('should convert Maidenhead grid locators to lat/lng', () => {
    const coords = gridToLatLng('FN31');
    expect(coords).not.toBeNull();
    expect(coords?.lat).toBe(41.5);
    expect(coords?.lng).toBe(-73.0);
  });
});
