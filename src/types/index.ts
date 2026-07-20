export type ModeType = 'CW' | 'PHONE' | 'DIGITAL';

export interface QSO {
  id: string;
  call: string;
  band: string;
  freq: number;
  mode: ModeType;
  rawMode: string;
  date: string;
  time: string;
  timestamp: number;
  operator: string;
  station: string;
  section: string;
  classSent: string;
  classRcvd: string;
  grid: string;
  isGota: boolean;
  notes?: string;
}

export interface ArrlSection {
  code: string;
  name: string;
  division: string;
  callDistrict: string;
  country: 'US' | 'RAC' | 'DX';
  defaultGrid: string;
  lat: number;
  lng: number;
}

export interface BonusClaim {
  emergencyPower: boolean;
  mediaPublicity: boolean;
  publicLocation: boolean;
  infoBooth: boolean;
  smSecMessage: boolean;
  w1awBulletin: boolean;
  ntsMessagesCount: number; // max 10
  satelliteQso: boolean;
  naturalPower: boolean;
  electedOfficialVisit: boolean;
  agencyOfficialVisit: boolean;
  educationalActivity: boolean;
  youthQsoCount: number; // max 5 (100 pts)
  webSubmission: boolean;
  safetyOfficer: boolean;
  siteResponsibilities: boolean;
  socialMedia: boolean;
  gotaCoach: boolean;
}

export interface FieldDayConfig {
  clubCall: string;
  clubName: string;
  entryClass: string;
  transmitters: number;
  powerCategory: 'QRP_5W' | 'LOW_100W' | 'HIGH_500W';
  powerSource: 'BATTERY_SOLAR' | 'GENERATOR_MAINS';
  homeGrid: string;
  homeSection: string;
  totalParticipants: number;
  youthParticipants: number;
  gotaCall: string;
  bonuses: BonusClaim;
}

export interface ScoreBreakdown {
  phoneQsos: number;
  cwQsos: number;
  digitalQsos: number;
  totalQsos: number;

  phonePoints: number;
  cwPoints: number;
  digitalPoints: number;
  rawQsoPoints: number;

  powerMultiplier: number;
  multipliedQsoPoints: number;

  gotaQsoCount: number;
  gotaQsoBonusPoints: number;
  
  bonusPointsItemized: { label: string; points: number }[];
  totalBonusPoints: number;
  
  totalScore: number;

  uniqueOperators: number;
  totalAttendance: number;
  participationIndexPct: number;

  sectionsWorked: number;
  sweepPercentage: number;
}

export interface BandModeMatrixCell {
  cw: number;
  phone: number;
  digital: number;
  total: number;
}

export interface OperatorStats {
  callsign: string;
  totalQsos: number;
  cwQsos: number;
  phoneQsos: number;
  digitalQsos: number;
  activeHours: number;
  topBand: string;
  workedBands: string[];
  workedModes: string;
  pctOfTotal: number;
}

export interface StationStats {
  name: string;
  totalQsos: number;
  cwQsos: number;
  phoneQsos: number;
  digitalQsos: number;
  topBand: string;
  pctOfTotal: number;
}

export interface VelocityBin {
  timeLabel: string;
  timestamp: number;
  qsoCount: number;
  cwCount: number;
  phoneCount: number;
  digitalCount: number;
  bandCountMap: Record<string, number>;
  primaryBand: string;
}

export interface DiagnosticResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details: string;
}
