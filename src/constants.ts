import { FieldDayConfig } from './types';
import { SAMPLE_MAIN_ADIF, SAMPLE_GOTA_ADIF } from './services/parser/sampleLogs';

// Application Metadata
export const APP_NAME = 'Field Day Analytics';
export const APP_VERSION = '1.0.1';

// Default configuration used when the app starts or resets
export const DEFAULT_CONFIG: FieldDayConfig = {
  clubCall: '',
  clubName: '',
  entryClass: 'A',
  transmitters: 1,
  powerCategory: 'LOW_100W',
  powerSource: 'GENERATOR_MAINS',
  homeGrid: '',
  homeSection: '',
  totalParticipants: 0,
  youthParticipants: 0,
  gotaCall: '',
  bonuses: {
    emergencyPower: false,
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
    webSubmission: false,
    safetyOfficer: false,
    siteResponsibilities: false,
    socialMedia: false,
    gotaCoach: false,
  },
};

// Sample configuration used for the "Load Sample" dev button
export const SAMPLE_CONFIG: FieldDayConfig = {
  clubCall: 'W1AW',
  clubName: 'ARRL Field Day Club',
  entryClass: 'A',
  transmitters: 2,
  powerCategory: 'LOW_100W',
  powerSource: 'GENERATOR_MAINS',
  homeGrid: 'FN31',
  homeSection: 'CT',
  totalParticipants: 15,
  youthParticipants: 3,
  gotaCall: 'W1GOTA1',
  bonuses: {
    emergencyPower: true,
    mediaPublicity: true,
    publicLocation: true,
    infoBooth: true,
    smSecMessage: true,
    w1awBulletin: true,
    ntsMessagesCount: 5,
    satelliteQso: true,
    naturalPower: false,
    electedOfficialVisit: false,
    agencyOfficialVisit: false,
    educationalActivity: true,
    youthQsoCount: 2,
    webSubmission: true,
    safetyOfficer: true,
    siteResponsibilities: true,
    socialMedia: true,
    gotaCoach: true,
  },
};

// Re‑export sample ADIF strings for convenience
export { SAMPLE_MAIN_ADIF, SAMPLE_GOTA_ADIF };
