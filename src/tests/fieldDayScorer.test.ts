import { describe, it, expect } from 'vitest';
import { calculateFieldDayScore } from '../services/scoring/fieldDayScorer';
import { FieldDayConfig, QSO } from '../types';

describe('calculateFieldDayScore', () => {
  const baseConfig: FieldDayConfig = {
    clubCall: 'K1FD',
    clubName: 'Tri-County Radio Club',
    entryClass: '2A',
    transmitters: 2,
    powerCategory: 'LOW_100W',
    powerSource: 'GENERATOR_MAINS',
    homeGrid: 'EN90',
    homeSection: 'OH',
    totalParticipants: 15,
    youthParticipants: 2,
    gotaCall: 'K1FD/GOTA',
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
      safetyOfficer: true, // 100 pts
      siteResponsibilities: false,
      socialMedia: false,
      gotaCoach: false,
    },
  };

  const createMockQso = (id: string, mode: 'PHONE' | 'CW' | 'DIGITAL', isGota = false): QSO => ({
    id,
    call: `K8${id}`,
    band: '20M',
    freq: 14.2,
    mode,
    rawMode: mode,
    date: '2026-06-27',
    time: '18:00',
    timestamp: 1782583200000,
    operator: 'N8OP',
    station: isGota ? 'K1FD/GOTA' : 'K1FD',
    classSent: '2A',
    classRcvd: '2A',
    section: 'OH',
    grid: 'EN90',
    isGota,
    notes: '',
  });

  it('correctly separates Main Station raw points, GOTA station total, and claimed bonuses', () => {
    const mainQsos: QSO[] = [
      createMockQso('1', 'PHONE'), // 1 pt
      createMockQso('2', 'CW'),    // 2 pts
      createMockQso('3', 'DIGITAL')// 2 pts
    ];
    // Main Raw = 5 pts. Main Multiplied (2x) = 10 pts.

    const gotaQsos: QSO[] = [
      createMockQso('4', 'PHONE', true), // 1 pt
      createMockQso('5', 'DIGITAL', true)// 2 pts
    ];
    // GOTA Raw = 3 pts. GOTA Multiplied (2x) = 6 pts.
    // GOTA Bonus (2 * 5) = 10 pts.
    // GOTA Total = 6 + 10 = 16 pts.

    const result = calculateFieldDayScore(mainQsos, gotaQsos, baseConfig);

    expect(result.mainRawQsoPoints).toBe(5);
    expect(result.mainMultipliedQsoPoints).toBe(10);
    expect(result.gotaRawQsoPoints).toBe(3);
    expect(result.gotaMultipliedQsoPoints).toBe(6);
    expect(result.gotaQsoBonusPoints).toBe(10);
    expect(result.gotaTotalPoints).toBe(16);

    // Claimed Bonus = 200 (Emerg) + 100 (Media) + 50 (Web) + 100 (Safety) = 450 pts.
    expect(result.totalBonusPoints).toBe(450);

    // Total Score = 10 (Main Mult) + 450 (Claimed) + 16 (GOTA Total) = 476 pts.
    expect(result.totalScore).toBe(476);
  });

  it('applies 5x multiplier for QRP Battery/Solar', () => {
    const qrpConfig: FieldDayConfig = {
      ...baseConfig,
      powerCategory: 'QRP_5W',
      powerSource: 'BATTERY_SOLAR',
    };

    const mainQsos = [createMockQso('1', 'PHONE')]; // 1 pt
    const gotaQsos = [createMockQso('2', 'PHONE', true)]; // 1 pt

    const result = calculateFieldDayScore(mainQsos, gotaQsos, qrpConfig);

    expect(result.powerMultiplier).toBe(5);
    expect(result.mainMultipliedQsoPoints).toBe(5); // 1 * 5
    expect(result.gotaMultipliedQsoPoints).toBe(5); // 1 * 5
    expect(result.gotaTotalPoints).toBe(10); // 5 mult + 5 bonus (1 QSO * 5)
  });
});
