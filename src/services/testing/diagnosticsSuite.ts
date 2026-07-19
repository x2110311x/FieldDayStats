import { DiagnosticResult, FieldDayConfig } from '../../types';
import { parseAdifLog } from '../parser/adifParser';
import { calculateFieldDayScore } from '../scoring/fieldDayScorer';
import { buildBandModeMatrix, calculateSectionSweep, calculateActivityTimeline } from '../analytics/statsEngine';
import { gridToLatLng } from '../geo/maidenhead';

export function runAnalyticsDiagnostics(): DiagnosticResult[] {
  const results: DiagnosticResult[] = [];

  // Sample Synthetic ADIF Log
  const sampleAdif = `
<CALL:4>W1AW <BAND:3>20M <MODE:2>CW <QSO_DATE:8>20260627 <TIME_ON:4>1805 <ARRL_SECT:2>CT <OPERATOR:4>N1MM <STATION_CALLSIGN:4>RIG1 <GRIDSQUARE:4>FN31 <EOR>
<CALL:4>K1ABC <BAND:3>40M <MODE:3>SSB <QSO_DATE:8>20260627 <TIME_ON:4>1820 <ARRL_SECT:3>EMA <OPERATOR:4>K1ABC <STATION_CALLSIGN:4>RIG1 <GRIDSQUARE:4>FN42 <EOR>
<CALL:4>N2DEF <BAND:3>80M <MODE:3>FT8 <QSO_DATE:8>20260627 <TIME_ON:4>1915 <ARRL_SECT:3>STX <OPERATOR:4>N1MM <STATION_CALLSIGN:4>RIG2 <GRIDSQUARE:4>EM12 <EOR>
<CALL:4>VE3XYZ <BAND:3>20M <MODE:2>CW <QSO_DATE:8>20260627 <TIME_ON:4>1945 <ARRL_SECT:3>ONE <OPERATOR:4>W1BXY <STATION_CALLSIGN:4>RIG2 <GRIDSQUARE:4>FN25 <EOR>
<CALL:4>W6GHI <BAND:3>15M <MODE:3>SSB <QSO_DATE:8>20260627 <TIME_ON:4>2010 <ARRL_SECT:3>LAX <OPERATOR:4>W1BXY <STATION_CALLSIGN:4>RIG1 <GRIDSQUARE:4>DM04 <EOR>
  `;

  const sampleGotaAdif = `
<CALL:5>W1GOTA <BAND:3>40M <MODE:3>SSB <QSO_DATE:8>20260627 <TIME_ON:4>1830 <ARRL_SECT:2>CT <OPERATOR:6>YOUTH1 <STATION_CALLSIGN:5>GOTA1 <EOR>
<CALL:5>K2GOTA <BAND:3>20M <MODE:3>SSB <QSO_DATE:8>20260627 <TIME_ON:4>1845 <ARRL_SECT:3>EMA <OPERATOR:6>YOUTH1 <STATION_CALLSIGN:5>GOTA1 <EOR>
  `;

  // Test 1: Parser Output Count
  const parsedMain = parseAdifLog(sampleAdif, false);
  const parsedGota = parseAdifLog(sampleGotaAdif, true);

  results.push({
    name: 'ADIF Parser Record Extraction',
    passed: parsedMain.length === 5 && parsedGota.length === 2,
    expected: 'Main: 5 QSOs, GOTA: 2 QSOs',
    actual: `Main: ${parsedMain.length} QSOs, GOTA: ${parsedGota.length} QSOs`,
    details: 'Parsed standard tags (CALL, BAND, MODE, OPERATOR, ARRL_SECT, GRIDSQUARE).',
  });

  // Test 2: Matrix Cell Sum
  const matrix = buildBandModeMatrix([...parsedMain, ...parsedGota]);
  let matrixSum = 0;
  for (const cell of Object.values(matrix)) {
    matrixSum += cell.cw + cell.phone + cell.digital;
  }

  results.push({
    name: 'Band & Mode Matrix Sum Integrity',
    passed: matrixSum === 7,
    expected: '7 Total QSOs',
    actual: `${matrixSum} Total QSOs`,
    details: 'Ensures sum of all Band/Mode matrix cells equals total ingested QSOs.',
  });

  // Test 3: Field Day Official Score Math
  const defaultConfig: FieldDayConfig = {
    clubCall: 'W1AW',
    clubName: 'ARRL Test Club',
    entryClass: '2A',
    transmitters: 2,
    powerCategory: 'LOW_100W',
    powerSource: 'GENERATOR_MAINS',
    homeGrid: 'FN31',
    homeSection: 'CT',
    totalParticipants: 10,
    youthParticipants: 2,
    gotaCall: 'W1AW/GOTA',
    bonuses: {
      emergencyPower: true, // 2 TX * 100 = 200 pts
      mediaPublicity: true, // 100 pts
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
      webSubmission: true, // 50 pts
      safetyOfficer: true, // 100 pts (Class A)
      siteResponsibilities: false,
      socialMedia: false,
      gotaCoach: false,
    },
  };

  const score = calculateFieldDayScore(parsedMain, parsedGota, defaultConfig);
  // Main: CW (4 pts) + Phone (2 pts) + Digital (2 pts) = 8 raw pts.
  // GOTA: Phone (2 pts) = 2 raw pts.
  // Total Raw QSO Points = 10 pts.
  // Power Multiplier: 2x -> Multiplied QSO Points = 20 pts.
  // GOTA Contact Bonus: 2 GOTA QSOs * 5 = 10 pts.
  // Bonus Points: Emergency Power (200) + Media (100) + Web (50) + Safety Officer (100) + GOTA QSOs (10) = 460 pts.
  // Total Score = 20 + 460 = 480 pts.

  results.push({
    name: 'Official ARRL Score Calculation',
    passed: score.totalScore === 480 && score.multipliedQsoPoints === 20,
    expected: '480 Total Points (20 Multiplied QSO + 460 Bonus)',
    actual: `${score.totalScore} Total Points (${score.multipliedQsoPoints} Multiplied QSO + ${score.totalBonusPoints} Bonus)`,
    details: 'Verified QSO points (Phone=1, CW=2, Digital=2), 2x power multiplier, and itemized bonus points.',
  });

  // Test 4: Active Operator Participation Index
  // Unique ops in sample: N1MM, K1ABC, W1BXY, YOUTH1 -> 4 unique ops.
  // Total attendance: 10.
  // Participation Index %: (4 / 10) * 100% = 40.0%
  results.push({
    name: 'Participation Index Formula',
    passed: score.participationIndexPct === 40.0 && score.uniqueOperators === 4,
    expected: '40.0% Participation (4 Unique Ops / 10 Attendees)',
    actual: `${score.participationIndexPct}% Participation (${score.uniqueOperators} Unique Ops / ${score.totalAttendance} Attendees)`,
    details: 'Verified ratio of unique logging operators to total physical attendance.',
  });

  // Test 5: Section Sweep Calculation
  const sweep = calculateSectionSweep(parsedMain);
  results.push({
    name: '86-Section Sweep Tracker',
    passed: sweep.workedCount === 5,
    expected: '5 Worked Sections (CT, EMA, STX, ONE, LAX)',
    actual: `${sweep.workedCount} Worked Sections`,
    details: 'Calculated unique ARRL/RAC section sweep ratio out of 85 official sections.',
  });

  // Test 6: Maidenhead Coordinates Resolution
  const coords = gridToLatLng('FN31');
  const isCoordsValid = coords !== null && Math.abs(coords.lat - 41.5) < 0.1 && Math.abs(coords.lng - (-73.0)) < 0.1;
  results.push({
    name: 'Maidenhead Grid Math (FN31)',
    passed: isCoordsValid,
    expected: 'Lat: 41.5, Lng: -73.0',
    actual: coords ? `Lat: ${coords.lat.toFixed(1)}, Lng: ${coords.lng.toFixed(1)}` : 'Invalid Grid',
    details: 'Verified 4-character Maidenhead locator to lat/lng geodetic conversion.',
  });

  return results;
}
