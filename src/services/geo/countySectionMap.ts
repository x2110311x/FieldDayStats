/**
 * ARRL Section County FIPS Mapping
 * Resolves 5-digit US County FIPS code to its exact ARRL Section code.
 * For single-section states, resolves state FIPS prefix to section code.
 */

// Single-section state FIPS (2-digit prefix) -> Section code
const STATE_FIPS_TO_SECTION: Record<string, string> = {
  '01': 'AL',
  '02': 'AK',
  '04': 'AZ',
  '05': 'AR',
  '08': 'CO',
  '09': 'CT',
  '10': 'DE',
  '11': 'MDC',
  '13': 'GA',
  '15': 'PAC',
  '16': 'ID',
  '17': 'IL',
  '18': 'IN',
  '19': 'IA',
  '20': 'KS',
  '21': 'KY',
  '22': 'LA',
  '23': 'ME',
  '24': 'MDC',
  '26': 'MI',
  '27': 'MN',
  '28': 'MS',
  '29': 'MO',
  '30': 'MT',
  '31': 'NE',
  '32': 'NV',
  '33': 'NH',
  '35': 'NM',
  '37': 'NC',
  '38': 'ND',
  '39': 'OH',
  '40': 'OK',
  '41': 'OR',
  '44': 'RI',
  '45': 'SC',
  '46': 'SD',
  '47': 'TN',
  '49': 'UT',
  '50': 'VT',
  '51': 'VA',
  '54': 'WV',
  '55': 'WI',
  '56': 'WY',
  '72': 'PR', // Puerto Rico
  '78': 'VI', // US Virgin Islands
};

// Specific County FIPS overrides for multi-section split states
const COUNTY_FIPS_OVERRIDES: Record<string, string> = {
  // --- CALIFORNIA (06) ---
  '06037': 'LAX', // Los Angeles
  '06059': 'ORG', // Orange
  '06073': 'SDG', // San Diego
  '06025': 'SDG', // Imperial
  '06083': 'SB',  // Santa Barbara
  '06079': 'SB',  // San Luis Obispo
  '06111': 'SB',  // Ventura
  '06085': 'SCV', // Santa Clara
  '06081': 'SCV', // San Mateo
  '06087': 'SCV', // Santa Cruz
  '06053': 'SCV', // Monterey
  '06069': 'SCV', // San Benito
  '06001': 'EB',  // Alameda
  '06013': 'EB',  // Contra Costa
  '06075': 'SF',  // San Francisco
  '06041': 'SF',  // Marin
  '06097': 'SF',  // Sonoma
  '06055': 'SF',  // Napa
  '06049': 'SF',  // Mendocino
  '06023': 'SF',  // Humboldt
  '06015': 'SF',  // Del Norte
  '06019': 'SJV', // Fresno
  '06029': 'SJV', // Kern
  '06031': 'SJV', // Kings
  '06039': 'SJV', // Madera
  '06047': 'SJV', // Merced
  '06099': 'SJV', // Stanislaus
  '06107': 'SJV', // Tulare
  '06109': 'SJV', // Tuolumne
  '06043': 'SJV', // Mariposa
  '06051': 'SJV', // Mono
  '06027': 'SJV', // Inyo
  '06065': 'SJV', // Riverside
  '06071': 'SJV', // San Bernardino

  // --- MASSACHUSETTS (25) ---
  '25003': 'WMA', // Berkshire
  '25015': 'WMA', // Hampshire
  '25013': 'WMA', // Hampden
  '25011': 'WMA', // Franklin
  '25027': 'WMA', // Worcester

  // --- NEW JERSEY (34) ---
  '34001': 'SNJ', // Atlantic
  '34005': 'SNJ', // Burlington
  '34007': 'SNJ', // Camden
  '34009': 'SNJ', // Cape May
  '34011': 'SNJ', // Cumberland
  '34015': 'SNJ', // Gloucester
  '34021': 'SNJ', // Mercer
  '34023': 'SNJ', // Middlesex
  '34025': 'SNJ', // Monmouth
  '34029': 'SNJ', // Ocean
  '34033': 'SNJ', // Salem

  // --- NEW YORK (36) ---
  '36061': 'NLI', // New York / Manhattan
  '36047': 'NLI', // Kings / Brooklyn
  '36081': 'NLI', // Queens
  '36005': 'NLI', // Bronx
  '36085': 'NLI', // Richmond / Staten Island
  '36059': 'NLI', // Nassau
  '36103': 'NLI', // Suffolk
  '36001': 'ENY', // Albany
  '36027': 'ENY', // Dutchess
  '36079': 'ENY', // Putnam
  '36087': 'ENY', // Rockland
  '36119': 'ENY', // Westchester
  '36071': 'ENY', // Orange
  '36105': 'ENY', // Sullivan
  '36111': 'ENY', // Ulster
  '36039': 'ENY', // Greene
  '36021': 'ENY', // Columbia
  '36091': 'ENY', // Saratoga
  '36083': 'ENY', // Rensselaer
  '36093': 'ENY', // Schenectady
  '36095': 'ENY', // Schoharie
  '36019': 'NNY', // Clinton
  '36031': 'NNY', // Essex
  '36033': 'NNY', // Franklin
  '36045': 'NNY', // Fulton
  '36041': 'NNY', // Hamilton
  '36043': 'NNY', // Herkimer
  '36089': 'NNY', // St. Lawrence
  '36113': 'NNY', // Warren
  '36115': 'NNY', // Washington

  // --- FLORIDA (12) ---
  '12057': 'WCF', // Hillsborough
  '12101': 'WCF', // Pasco
  '12103': 'WCF', // Pinellas
  '12081': 'WCF', // Manatee
  '12115': 'WCF', // Sarasota
  '12017': 'WCF', // Citrus
  '12053': 'WCF', // Hernando
  '12027': 'WCF', // DeSoto
  '12049': 'WCF', // Hardee
  '12055': 'WCF', // Highlands
  '12093': 'WCF', // Polk
  '12086': 'SFL', // Miami-Dade
  '12011': 'SFL', // Broward
  '12099': 'SFL', // Palm Beach
  '12087': 'SFL', // Monroe
  '12021': 'SFL', // Collier
  '12071': 'SFL', // Lee
  '12015': 'SFL', // Charlotte
  '12043': 'SFL', // Glades
  '12051': 'SFL', // Hendry
  '12085': 'SFL', // Martin
  '12111': 'SFL', // St. Lucie
  '12095': 'SFL', // Orange
  '12117': 'SFL', // Seminole
  '12009': 'SFL', // Brevard
  '12097': 'SFL', // Osceola
  '12061': 'SFL', // Indian River
  '12047': 'SFL', // Hamilton/Okeechobee

  // --- WASHINGTON (53) ---
  '53033': 'WWA', // King / Seattle
  '53053': 'WWA', // Pierce
  '53061': 'WWA', // Snohomish
  '53073': 'WWA', // Whatcom
  '53057': 'WWA', // Skagit
  '53029': 'WWA', // Island
  '53055': 'WWA', // San Juan
  '53009': 'WWA', // Clallam
  '53031': 'WWA', // Jefferson
  '53027': 'WWA', // Grays Harbor
  '53045': 'WWA', // Mason
  '53067': 'WWA', // Thurston
  '53041': 'WWA', // Lewis
  '53015': 'WWA', // Cowlitz
  '53011': 'WWA', // Clark
  '53069': 'WWA', // Wahkiakum
  '53049': 'WWA', // Pacific
  '53059': 'WWA', // Skamania
};

// Default section per state FIPS for split states if county not explicitly listed
const SPLIT_STATE_DEFAULTS: Record<string, string> = {
  '06': 'SV',  // CA -> Sacramento Valley
  '12': 'NFL', // FL -> Northern Florida
  '25': 'EMA', // MA -> Eastern MA
  '34': 'NNJ', // NJ -> Northern NJ
  '36': 'WNY', // NY -> Western NY
  '42': 'EPA', // PA -> Eastern PA
  '48': 'NTX', // TX -> North Texas
  '53': 'EWA', // WA -> Eastern WA
};

/**
 * Resolves a county FIPS string (e.g. "06037" or 6037) to its exact ARRL section code.
 */
export function getSectionFromCountyFips(fipsInput: string | number): string | null {
  if (!fipsInput) return null;
  const fips = fipsInput.toString().padStart(5, '0');
  const stateFips = fips.substring(0, 2);

  // 1. Check exact 5-digit county override
  if (COUNTY_FIPS_OVERRIDES[fips]) {
    return COUNTY_FIPS_OVERRIDES[fips];
  }

  // 2. Check single-section state mapping
  if (STATE_FIPS_TO_SECTION[stateFips]) {
    return STATE_FIPS_TO_SECTION[stateFips];
  }

  // 3. Fallback for split state defaults
  if (SPLIT_STATE_DEFAULTS[stateFips]) {
    return SPLIT_STATE_DEFAULTS[stateFips];
  }

  return null;
}
