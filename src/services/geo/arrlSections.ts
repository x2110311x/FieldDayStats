import { ArrlSection } from '../../types';

export const OFFICIAL_ARRL_SECTIONS: ArrlSection[] = [
  // Call District 1 (7)
  { code: 'CT', name: 'Connecticut', division: 'New England', callDistrict: '1', country: 'US', defaultGrid: 'FN31', lat: 41.6, lng: -72.7 },
  { code: 'EMA', name: 'Eastern Massachusetts', division: 'New England', callDistrict: '1', country: 'US', defaultGrid: 'FN42', lat: 42.3, lng: -71.1 },
  { code: 'ME', name: 'Maine', division: 'New England', callDistrict: '1', country: 'US', defaultGrid: 'FN54', lat: 45.2, lng: -69.4 },
  { code: 'NH', name: 'New Hampshire', division: 'New England', callDistrict: '1', country: 'US', defaultGrid: 'FN43', lat: 43.7, lng: -71.5 },
  { code: 'RI', name: 'Rhode Island', division: 'New England', callDistrict: '1', country: 'US', defaultGrid: 'FN41', lat: 41.6, lng: -71.5 },
  { code: 'VT', name: 'Vermont', division: 'New England', callDistrict: '1', country: 'US', defaultGrid: 'FN34', lat: 44.0, lng: -72.7 },
  { code: 'WMA', name: 'Western Massachusetts', division: 'New England', callDistrict: '1', country: 'US', defaultGrid: 'FN32', lat: 42.3, lng: -72.6 },

  // Call District 2 (6)
  { code: 'ENY', name: 'Eastern New York', division: 'Hudson', callDistrict: '2', country: 'US', defaultGrid: 'FN32', lat: 42.6, lng: -73.8 },
  { code: 'NLI', name: 'NYC / Long Island', division: 'Hudson', callDistrict: '2', country: 'US', defaultGrid: 'FN30', lat: 40.7, lng: -73.7 },
  { code: 'NNJ', name: 'Northern New Jersey', division: 'Hudson', callDistrict: '2', country: 'US', defaultGrid: 'FN20', lat: 40.8, lng: -74.4 },
  { code: 'NNY', name: 'Northern New York', division: 'Hudson', callDistrict: '2', country: 'US', defaultGrid: 'FN34', lat: 44.5, lng: -74.0 },
  { code: 'SNJ', name: 'Southern New Jersey', division: 'Atlantic', callDistrict: '2', country: 'US', defaultGrid: 'FM29', lat: 39.8, lng: -74.8 },
  { code: 'WNY', name: 'Western New York', division: 'Atlantic', callDistrict: '2', country: 'US', defaultGrid: 'FN12', lat: 42.9, lng: -77.6 },

  // Call District 3 (4)
  { code: 'DE', name: 'Delaware', division: 'Atlantic', callDistrict: '3', country: 'US', defaultGrid: 'FM29', lat: 39.0, lng: -75.5 },
  { code: 'EPA', name: 'Eastern Pennsylvania', division: 'Atlantic', callDistrict: '3', country: 'US', defaultGrid: 'FN20', lat: 40.4, lng: -75.9 },
  { code: 'MDC', name: 'Maryland – DC', division: 'Atlantic', callDistrict: '3', country: 'US', defaultGrid: 'FM19', lat: 39.0, lng: -76.8 },
  { code: 'WPA', name: 'Western Pennsylvania', division: 'Atlantic', callDistrict: '3', country: 'US', defaultGrid: 'FN00', lat: 40.4, lng: -79.9 },

  // Call District 4 (12)
  { code: 'AL', name: 'Alabama', division: 'Southeastern', callDistrict: '4', country: 'US', defaultGrid: 'EM63', lat: 32.8, lng: -86.8 },
  { code: 'GA', name: 'Georgia', division: 'Southeastern', callDistrict: '4', country: 'US', defaultGrid: 'EM73', lat: 32.6, lng: -83.4 },
  { code: 'KY', name: 'Kentucky', division: 'Great Lakes', callDistrict: '4', country: 'US', defaultGrid: 'EM77', lat: 37.8, lng: -84.3 },
  { code: 'NC', name: 'North Carolina', division: 'Roanoke', callDistrict: '4', country: 'US', defaultGrid: 'FM05', lat: 35.6, lng: -79.8 },
  { code: 'NFL', name: 'Northern Florida', division: 'Southeastern', callDistrict: '4', country: 'US', defaultGrid: 'EM90', lat: 30.3, lng: -84.3 },
  { code: 'SC', name: 'South Carolina', division: 'Roanoke', callDistrict: '4', country: 'US', defaultGrid: 'EM94', lat: 33.8, lng: -80.9 },
  { code: 'SFL', name: 'Southern Florida', division: 'Southeastern', callDistrict: '4', country: 'US', defaultGrid: 'EL96', lat: 26.1, lng: -80.3 },
  { code: 'TN', name: 'Tennessee', division: 'Delta', callDistrict: '4', country: 'US', defaultGrid: 'EM65', lat: 35.5, lng: -86.6 },
  { code: 'VA', name: 'Virginia', division: 'Roanoke', callDistrict: '4', country: 'US', defaultGrid: 'FM17', lat: 37.5, lng: -78.7 },
  { code: 'WCF', name: 'West Central Florida', division: 'Southeastern', callDistrict: '4', country: 'US', defaultGrid: 'EL87', lat: 27.9, lng: -82.4 },
  { code: 'PR', name: 'Puerto Rico', division: 'Southeastern', callDistrict: '4', country: 'US', defaultGrid: 'FK68', lat: 18.2, lng: -66.4 },
  { code: 'VI', name: 'US Virgin Islands', division: 'Southeastern', callDistrict: '4', country: 'US', defaultGrid: 'FK77', lat: 18.3, lng: -64.9 },

  // Call District 5 (8)
  { code: 'AR', name: 'Arkansas', division: 'Delta', callDistrict: '5', country: 'US', defaultGrid: 'EM34', lat: 34.7, lng: -92.3 },
  { code: 'LA', name: 'Louisiana', division: 'Delta', callDistrict: '5', country: 'US', defaultGrid: 'EM30', lat: 31.0, lng: -92.0 },
  { code: 'MS', name: 'Mississippi', division: 'Delta', callDistrict: '5', country: 'US', defaultGrid: 'EM42', lat: 32.7, lng: -89.7 },
  { code: 'NM', name: 'New Mexico', division: 'Rocky Mountain', callDistrict: '5', country: 'US', defaultGrid: 'DM65', lat: 34.4, lng: -106.1 },
  { code: 'OK', name: 'Oklahoma', division: 'West Gulf', callDistrict: '5', country: 'US', defaultGrid: 'EM15', lat: 35.5, lng: -97.5 },
  { code: 'NTX', name: 'North Texas', division: 'West Gulf', callDistrict: '5', country: 'US', defaultGrid: 'EM12', lat: 32.8, lng: -96.8 },
  { code: 'STX', name: 'South Texas', division: 'West Gulf', callDistrict: '5', country: 'US', defaultGrid: 'EL29', lat: 29.7, lng: -95.4 },
  { code: 'WTX', name: 'West Texas', division: 'West Gulf', callDistrict: '5', country: 'US', defaultGrid: 'DM81', lat: 31.8, lng: -102.3 },

  // Call District 6 (10)
  { code: 'EB', name: 'East Bay', division: 'Pacific', callDistrict: '6', country: 'US', defaultGrid: 'CM87', lat: 37.8, lng: -122.2 },
  { code: 'LAX', name: 'Los Angeles', division: 'Southwestern', callDistrict: '6', country: 'US', defaultGrid: 'DM04', lat: 34.0, lng: -118.2 },
  { code: 'ORG', name: 'Orange', division: 'Southwestern', callDistrict: '6', country: 'US', defaultGrid: 'DM13', lat: 33.7, lng: -117.8 },
  { code: 'SB', name: 'Santa Barbara', division: 'Southwestern', callDistrict: '6', country: 'US', defaultGrid: 'DM04', lat: 34.4, lng: -119.7 },
  { code: 'SCV', name: 'Santa Clara Valley', division: 'Pacific', callDistrict: '6', country: 'US', defaultGrid: 'CM87', lat: 37.3, lng: -121.9 },
  { code: 'SDG', name: 'San Diego', division: 'Southwestern', callDistrict: '6', country: 'US', defaultGrid: 'DM12', lat: 32.7, lng: -117.1 },
  { code: 'SF', name: 'San Francisco', division: 'Pacific', callDistrict: '6', country: 'US', defaultGrid: 'CM87', lat: 37.7, lng: -122.4 },
  { code: 'SJV', name: 'San Joaquin Valley', division: 'Pacific', callDistrict: '6', country: 'US', defaultGrid: 'DM06', lat: 36.7, lng: -119.7 },
  { code: 'SV', name: 'Sacramento Valley', division: 'Pacific', callDistrict: '6', country: 'US', defaultGrid: 'CM98', lat: 38.5, lng: -121.5 },
  { code: 'PAC', name: 'Pacific', division: 'Pacific', callDistrict: '6', country: 'US', defaultGrid: 'BL11', lat: 21.3, lng: -157.8 },

  // Call District 7 (10)
  { code: 'AK', name: 'Alaska', division: 'Northwestern', callDistrict: '7', country: 'US', defaultGrid: 'BP51', lat: 61.2, lng: -149.9 },
  { code: 'AZ', name: 'Arizona', division: 'Southwestern', callDistrict: '7', country: 'US', defaultGrid: 'DM33', lat: 33.4, lng: -112.0 },
  { code: 'EWA', name: 'Eastern Washington', division: 'Northwestern', callDistrict: '7', country: 'US', defaultGrid: 'DN17', lat: 47.6, lng: -117.4 },
  { code: 'ID', name: 'Idaho', division: 'Northwestern', callDistrict: '7', country: 'US', defaultGrid: 'DN13', lat: 43.6, lng: -116.2 },
  { code: 'MT', name: 'Montana', division: 'Northwestern', callDistrict: '7', country: 'US', defaultGrid: 'DN36', lat: 46.5, lng: -112.0 },
  { code: 'NV', name: 'Nevada', division: 'Pacific', callDistrict: '7', country: 'US', defaultGrid: 'DM06', lat: 36.1, lng: -115.1 },
  { code: 'OR', name: 'Oregon', division: 'Northwestern', callDistrict: '7', country: 'US', defaultGrid: 'CN85', lat: 45.5, lng: -122.6 },
  { code: 'UT', name: 'Utah', division: 'Rocky Mountain', callDistrict: '7', country: 'US', defaultGrid: 'DN30', lat: 40.7, lng: -111.8 },
  { code: 'WWA', name: 'Western Washington', division: 'Northwestern', callDistrict: '7', country: 'US', defaultGrid: 'CN87', lat: 47.6, lng: -122.3 },
  { code: 'WY', name: 'Wyoming', division: 'Rocky Mountain', callDistrict: '7', country: 'US', defaultGrid: 'DN71', lat: 41.1, lng: -104.8 },

  // Call District 8 (3)
  { code: 'MI', name: 'Michigan', division: 'Great Lakes', callDistrict: '8', country: 'US', defaultGrid: 'EN72', lat: 42.7, lng: -84.5 },
  { code: 'OH', name: 'Ohio', division: 'Great Lakes', callDistrict: '8', country: 'US', defaultGrid: 'EM79', lat: 39.9, lng: -82.9 },
  { code: 'WV', name: 'West Virginia', division: 'Roanoke', callDistrict: '8', country: 'US', defaultGrid: 'FM08', lat: 38.3, lng: -81.6 },

  // Call District 9 (3)
  { code: 'IL', name: 'Illinois', division: 'Central', callDistrict: '9', country: 'US', defaultGrid: 'EN51', lat: 40.6, lng: -89.6 },
  { code: 'IN', name: 'Indiana', division: 'Central', callDistrict: '9', country: 'US', defaultGrid: 'EM69', lat: 39.7, lng: -86.1 },
  { code: 'WI', name: 'Wisconsin', division: 'Central', callDistrict: '9', country: 'US', defaultGrid: 'EN53', lat: 43.0, lng: -89.4 },

  // Call District 0 (8)
  { code: 'CO', name: 'Colorado', division: 'Rocky Mountain', callDistrict: '0', country: 'US', defaultGrid: 'DM79', lat: 39.7, lng: -104.9 },
  { code: 'IA', name: 'Iowa', division: 'Midwest', callDistrict: '0', country: 'US', defaultGrid: 'EN31', lat: 41.6, lng: -93.6 },
  { code: 'KS', name: 'Kansas', division: 'Midwest', callDistrict: '0', country: 'US', defaultGrid: 'EM18', lat: 38.5, lng: -98.3 },
  { code: 'MN', name: 'Minnesota', division: 'Dakota', callDistrict: '0', country: 'US', defaultGrid: 'EN34', lat: 44.9, lng: -93.2 },
  { code: 'MO', name: 'Missouri', division: 'Midwest', callDistrict: '0', country: 'US', defaultGrid: 'EM38', lat: 38.5, lng: -92.3 },
  { code: 'NE', name: 'Nebraska', division: 'Midwest', callDistrict: '0', country: 'US', defaultGrid: 'EN10', lat: 40.8, lng: -96.6 },
  { code: 'ND', name: 'North Dakota', division: 'Dakota', callDistrict: '0', country: 'US', defaultGrid: 'DN96', lat: 46.8, lng: -100.7 },
  { code: 'SD', name: 'South Dakota', division: 'Dakota', callDistrict: '0', country: 'US', defaultGrid: 'DN84', lat: 44.3, lng: -100.3 },

  // RAC Canada (14)
  { code: 'AB', name: 'Alberta', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'DO31', lat: 51.0, lng: -114.0 },
  { code: 'BC', name: 'British Columbia', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'CN89', lat: 49.2, lng: -123.1 },
  { code: 'GH', name: 'Golden Horseshoe (formerly GTA)', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'FN03', lat: 43.6, lng: -79.3 },
  { code: 'MB', name: 'Manitoba', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'EN19', lat: 49.8, lng: -97.1 },
  { code: 'NB', name: 'New Brunswick', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'FN65', lat: 45.9, lng: -66.6 },
  { code: 'NL', name: 'Newfoundland/Labrador', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'GN37', lat: 47.5, lng: -52.7 },
  { code: 'NS', name: 'Nova Scotia', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'FN84', lat: 44.6, lng: -63.5 },
  { code: 'ONE', name: 'Ontario East', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'FN25', lat: 45.4, lng: -75.7 },
  { code: 'ONN', name: 'Ontario North', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'EN86', lat: 46.5, lng: -80.9 },
  { code: 'ONS', name: 'Ontario South', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'EN92', lat: 42.9, lng: -81.2 },
  { code: 'PE', name: 'Prince Edward Island', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'FN76', lat: 46.2, lng: -63.1 },
  { code: 'QC', name: 'Quebec', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'FN35', lat: 45.5, lng: -73.5 },
  { code: 'SK', name: 'Saskatchewan', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'DO60', lat: 50.4, lng: -104.6 },
  { code: 'TER', name: 'Territories (NT/YT/NU)', division: 'RAC', callDistrict: 'VE', country: 'RAC', defaultGrid: 'DP22', lat: 62.4, lng: -114.3 },

  // DX Category (1)
  { code: 'DX', name: 'DX / Outside US & Canada', division: 'International', callDistrict: 'DX', country: 'DX', defaultGrid: 'JJ00', lat: 0.0, lng: 0.0 }
];

export const ARRL_SECTION_MAP = new Map<string, ArrlSection>(
  OFFICIAL_ARRL_SECTIONS.map((sec) => [sec.code.toUpperCase(), sec])
);
