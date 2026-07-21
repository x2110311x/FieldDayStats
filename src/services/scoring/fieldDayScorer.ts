import { QSO, FieldDayConfig, ScoreBreakdown } from '../../types';

export function calculateFieldDayScore(
  mainQsos: QSO[],
  gotaQsos: QSO[],
  config: FieldDayConfig
): ScoreBreakdown {
  // 1. Main Station QSO Breakdown
  let mainPhoneQsos = 0;
  let mainCwQsos = 0;
  let mainDigitalQsos = 0;

  for (const qso of mainQsos) {
    if (qso.mode === 'PHONE') mainPhoneQsos++;
    else if (qso.mode === 'CW') mainCwQsos++;
    else if (qso.mode === 'DIGITAL') mainDigitalQsos++;
  }

  const mainTotalQsos = mainPhoneQsos + mainCwQsos + mainDigitalQsos;
  const mainRawQsoPoints = mainPhoneQsos * 1 + mainCwQsos * 2 + mainDigitalQsos * 2;

  // 2. GOTA Station QSO Breakdown
  let gotaPhoneQsos = 0;
  let gotaCwQsos = 0;
  let gotaDigitalQsos = 0;

  for (const qso of gotaQsos) {
    if (qso.mode === 'PHONE') gotaPhoneQsos++;
    else if (qso.mode === 'CW') gotaCwQsos++;
    else if (qso.mode === 'DIGITAL') gotaDigitalQsos++;
  }

  const gotaTotalQsos = gotaPhoneQsos + gotaCwQsos + gotaDigitalQsos;
  const gotaRawQsoPoints = gotaPhoneQsos * 1 + gotaCwQsos * 2 + gotaDigitalQsos * 2;

  // 3. Combined QSO Totals
  const phoneQsos = mainPhoneQsos + gotaPhoneQsos;
  const cwQsos = mainCwQsos + gotaCwQsos;
  const digitalQsos = mainDigitalQsos + gotaDigitalQsos;
  const totalQsos = mainTotalQsos + gotaTotalQsos;

  const phonePoints = phoneQsos * 1;
  const cwPoints = cwQsos * 2;
  const digitalPoints = digitalQsos * 2;
  const rawQsoPoints = mainRawQsoPoints + gotaRawQsoPoints;

  // 4. Power Multiplier (Rule 7.2)
  let powerMultiplier = 2;
  if (config.powerCategory === 'QRP_5W') {
    powerMultiplier = config.powerSource === 'BATTERY_SOLAR' ? 5 : 2;
  } else if (config.powerCategory === 'HIGH_500W') {
    powerMultiplier = 1;
  } else {
    powerMultiplier = 2; // LOW_100W
  }

  const mainMultipliedQsoPoints = mainRawQsoPoints * powerMultiplier;
  const gotaMultipliedQsoPoints = gotaRawQsoPoints * powerMultiplier;
  const multipliedQsoPoints = rawQsoPoints * powerMultiplier;

  // 5. GOTA Station Bonus Points (Rule 7.3.13.1 - 5 pts / QSO, uncapped)
  const gotaQsoCount = gotaTotalQsos;
  const gotaQsoBonusPoints = gotaQsoCount * 5;
  const gotaTotalPoints = gotaMultipliedQsoPoints + gotaQsoBonusPoints;

  // 6. Claimed Bonus Points Checklist (Excludes GOTA per-QSO bonus)
  const bonusItems: { label: string; points: number }[] = [];
  const b = config.bonuses;

  if (b.emergencyPower) {
    const txCount = Math.min(Math.max(config.transmitters, 1), 20);
    bonusItems.push({ label: `100% Emergency Power (${txCount} TX)`, points: txCount * 100 });
  }

  if (b.mediaPublicity) {
    bonusItems.push({ label: 'Media Publicity', points: 100 });
  }

  if (b.publicLocation) {
    bonusItems.push({ label: 'Set-up in Public Location', points: 100 });
  }

  if (b.infoBooth) {
    bonusItems.push({ label: 'Information Booth / Table', points: 100 });
  }

  if (b.smSecMessage) {
    bonusItems.push({ label: 'Message to ARRL SM / SEC', points: 100 });
  }

  if (b.w1awBulletin) {
    bonusItems.push({ label: 'W1AW Field Day Bulletin Copy', points: 100 });
  }

  if (b.ntsMessagesCount > 0) {
    const msgCount = Math.min(b.ntsMessagesCount, 10);
    bonusItems.push({ label: `NTS / ICS-213 Messages Handled (${msgCount})`, points: msgCount * 10 });
  }

  if (b.satelliteQso) {
    bonusItems.push({ label: 'Satellite QSO Completed', points: 100 });
  }

  if (b.naturalPower) {
    bonusItems.push({ label: 'Natural Power QSOs (>= 5 QSOs)', points: 100 });
  }

  if (b.electedOfficialVisit) {
    bonusItems.push({ label: 'Site Visit by Elected Official', points: 100 });
  }

  if (b.agencyOfficialVisit) {
    bonusItems.push({ label: 'Site Visit by Served Agency Representative', points: 100 });
  }

  if (b.educationalActivity) {
    bonusItems.push({ label: 'Educational Activity Bonus', points: 100 });
  }

  if (b.youthQsoCount > 0) {
    const youthCount = Math.min(b.youthQsoCount, 5);
    bonusItems.push({ label: `Youth Element Bonus (${youthCount} Youth)`, points: youthCount * 20 });
  }

  if (b.gotaCoach && gotaQsoCount >= 10) {
    bonusItems.push({ label: 'GOTA Coach Bonus', points: 100 });
  }

  if (b.webSubmission) {
    bonusItems.push({ label: 'Web Entry Submission', points: 50 });
  }

  if (b.safetyOfficer && config.entryClass.toUpperCase().includes('A')) {
    bonusItems.push({ label: 'Safety Officer Bonus (Class A)', points: 100 });
  }

  if (b.siteResponsibilities && !config.entryClass.toUpperCase().includes('A')) {
    bonusItems.push({ label: 'Site Responsibilities Checklist Bonus', points: 50 });
  }

  if (b.socialMedia) {
    bonusItems.push({ label: 'Social Media Promotion Bonus', points: 100 });
  }

  // Claimed Bonus Points total (strictly separate from GOTA QSO bonus)
  const totalBonusPoints = bonusItems.reduce((sum, item) => sum + item.points, 0);

  // Total Score = Main Multiplied + Claimed Bonuses + GOTA Total (GOTA Multiplied + GOTA Bonus)
  const totalScore = mainMultipliedQsoPoints + totalBonusPoints + gotaTotalPoints;

  // 7. Participation Index
  const allQsos = [...mainQsos, ...gotaQsos];
  const uniqueOperatorsSet = new Set<string>();
  for (const qso of allQsos) {
    if (qso.operator && qso.operator !== 'MAIN_OP') {
      uniqueOperatorsSet.add(qso.operator.toUpperCase());
    }
  }
  const uniqueOperators = Math.max(uniqueOperatorsSet.size, 1);
  const totalAttendance = Math.max(config.totalParticipants, uniqueOperators);
  const participationIndexPct = parseFloat(((uniqueOperators / totalAttendance) * 100).toFixed(1));

  // 8. Section Sweep (86 ARRL sections total)
  const uniqueSectionsSet = new Set<string>();
  for (const qso of allQsos) {
    if (qso.section && qso.section.trim() !== '') {
      uniqueSectionsSet.add(qso.section.toUpperCase().trim());
    }
  }
  const sectionsWorked = uniqueSectionsSet.size;
  const sweepPercentage = parseFloat(((sectionsWorked / 86) * 100).toFixed(1));

  return {
    mainPhoneQsos,
    mainCwQsos,
    mainDigitalQsos,
    mainTotalQsos,
    mainRawQsoPoints,
    mainMultipliedQsoPoints,
    gotaPhoneQsos,
    gotaCwQsos,
    gotaDigitalQsos,
    gotaTotalQsos,
    gotaRawQsoPoints,
    gotaMultipliedQsoPoints,
    gotaQsoCount,
    gotaQsoBonusPoints,
    gotaTotalPoints,
    phoneQsos,
    cwQsos,
    digitalQsos,
    totalQsos,
    phonePoints,
    cwPoints,
    digitalPoints,
    rawQsoPoints,
    powerMultiplier,
    multipliedQsoPoints,
    bonusPointsItemized: bonusItems,
    totalBonusPoints,
    totalScore,
    uniqueOperators,
    totalAttendance,
    participationIndexPct,
    sectionsWorked,
    sweepPercentage,
  };
}
