import React, { useMemo } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { geoAlbersUsa } from 'd3-geo';
import { QSO } from '../types';
import { OFFICIAL_ARRL_SECTIONS } from '../services/geo/arrlSections';
import { getSectionFromCountyFips } from '../services/geo/countySectionMap';

// US and Canada TopoJSON / GeoJSON datasets
const US_COUNTIES_GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json';
const US_STATES_GEO_URL   = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';
const CANADA_GEO_URL      = 'https://raw.githubusercontent.com/codeforgermany/click_that_hood/master/public/data/canada.geojson';

// Mapping Canadian GeoJSON Province names to RAC/ARRL Section codes
const CAN_PROVINCE_SECTIONS: Record<string, string> = {
  'Alberta':                   'AB',
  'British Columbia':          'BC',
  'Manitoba':                  'MB',
  'New Brunswick':             'NB',
  'Newfoundland and Labrador': 'NL',
  'Nova Scotia':               'NS',
  'Ontario':                   'ONE',
  'Prince Edward Island':      'PE',
  'Quebec':                    'QC',
  'Saskatchewan':              'SK',
  'Yukon Territory':           'TER',
  'Northwest Territories':     'TER',
  'Nunavut':                   'TER',
};

// Mapping ARRL/RAC Section codes to US Call Sign Area Districts (0-9, Canada, DX)
const SECTION_CALL_AREA: Record<string, string> = {
  // Call Area 1 (New England)
  'CT': '1', 'EMA': '1', 'ME': '1', 'NH': '1', 'RI': '1', 'VT': '1', 'WMA': '1',

  // Call Area 2 (NY / NJ)
  'ENY': '2', 'NLI': '2', 'NNJ': '2', 'NNY': '2', 'SNJ': '2', 'WNY': '2',

  // Call Area 3 (PA / DE / MD)
  'DE': '3', 'EPA': '3', 'MDC': '3', 'WPA': '3',

  // Call Area 4 (South / Southeast)
  'AL': '4', 'GA': '4', 'KY': '4', 'NC': '4', 'NFL': '4', 'PR': '4', 'SC': '4', 'SFL': '4', 'TN': '4', 'VA': '4', 'VI': '4', 'WCF': '4',

  // Call Area 5 (South / Central)
  'AR': '5', 'LA': '5', 'MS': '5', 'NM': '5', 'NTX': '5', 'OK': '5', 'STX': '5', 'WTX': '5',

  // Call Area 6 (California & Pacific)
  'EB': '6', 'LAX': '6', 'ORG': '6', 'PAC': '6', 'SB': '6', 'SCV': '6', 'SDG': '6', 'SF': '6', 'SJV': '6', 'SV': '6',

  // Call Area 7 (Northwest & West)
  'AK': '7', 'AZ': '7', 'EWA': '7', 'ID': '7', 'MT': '7', 'NV': '7', 'OR': '7', 'UT': '7', 'WWA': '7', 'WY': '7',

  // Call Area 8 (Great Lakes - MI, OH, WV)
  'MI': '8', 'OH': '8', 'WV': '8',

  // Call Area 9 (Midwest - IL, IN, WI)
  'IL': '9', 'IN': '9', 'WI': '9',

  // Call Area 0 (Plains - CO, IA, KS, MN, MO, ND, NE, SD)
  'CO': '0', 'IA': '0', 'KS': '0', 'MN': '0', 'MO': '0', 'ND': '0', 'NE': '0', 'SD': '0',

  // Canada / RAC
  'AB': 'Canada', 'BC': 'Canada', 'GH': 'Canada', 'MB': 'Canada', 'NB': 'Canada',
  'NL': 'Canada', 'NS': 'Canada', 'ONE': 'Canada', 'ONN': 'Canada', 'ONS': 'Canada',
  'PE': 'Canada', 'QC': 'Canada', 'SK': 'Canada', 'TER': 'Canada',
};

// Vibrant colors per Call Sign District
const CALL_AREA_COLORS: Record<string, string> = {
  '1':      '#6366f1', // Indigo
  '2':      '#8b5cf6', // Purple
  '3':      '#f97316', // Orange (WPA, EPA, MDC, DE - distinct contrast against NY/NJ purple & OH blue)
  '4':      '#10b981', // Emerald
  '5':      '#22c55e', // Green
  '6':      '#ec4899', // Pink
  '7':      '#ef4444', // Red
  '8':      '#3b82f6', // Blue
  '9':      '#06b6d4', // Cyan
  '0':      '#0284c7', // Sky Blue
  'Canada': '#eab308', // Warm Yellow
  'DX':     '#f59e0b', // Amber
};

// Exact merged cartographic coastline outline SVG Path for Puerto Rico
const PUERTO_RICO_REAL_PATH = "M46.36723910171804,28.89630521152958L45.059445178335864,29.35158767417647L43.39498018494078,28.66866398020636L41.96829590488824,29.20931190459919L41.136063408190694,28.83939490369869L39.1149273447827,28.156471209728807L36.49933949801925,29.74995982899236L36.02377807133462,29.57922890549969L35.78599735799253,29.60768405941519L34.002642007926625,29.835325290738524L33.52708058124199,30.518248984708634L31.743725231176086,29.66459436724608L31.624834874504813,29.1808567506838L29.12813738441264,28.95321551936047L27.463672391018008,29.892235598569414L25.561426684280832,29.32313252026097L24.13474240422738,29.66459436724608L24.253632760898654,28.156471209728807L25.44253632760956,27.27436143835064L24.13474240422738,26.932899591365526L24.491413474240744,25.08331458686314L25.085865257596197,24.65648727813175L25.20475561426747,22.522350734475253L26.036988110964558,21.640240963097085L24.96697490092538,19.250008034201755L23.659180977543656,18.254077647162035L22.113606340819388,16.09148594958981L23.183619550859476,15.66465864085842L25.799207397622922,14.327266406833587L25.561426684280832,12.250040171007981L26.39365918097792,11.339475245714539L27.701453104360098,11.05492370656009L30.435931307794363,11.168744322221869L32.57595772787363,11.880123170107481L34.35931307793953,12.050854093599924L36.49933949801925,11.937033477938371L38.87714663144061,12.050854093599924L40.779392338177786,12.449226248415812L43.63276089828332,11.709392246614811L44.82166446499423,12.022398939684422L46.60501981506013,12.136219555346202L48.74504623513894,12.563046864077592L49.69616908850776,11.993943785769261L52.66842800528411,11.993943785769261L53.85733157199502,12.363860786669534L55.284015852048014,12.193129863177091L57.66182298546937,12.648412325823983L58.969616908851094,13.075239634555146L60.03963011889073,12.449226248415812L63.01188903566754,13.189060250216812L64.55746367239135,12.932963864978092L67.41083223249734,13.160605096301424L69.90752972258952,14.071170021594867L71.09643328930042,14.099625175510255L72.52311756935296,15.35165194778881L75.25759577278723,16.063030795674422L76.68428005284068,15.266286486042759L76.44649933949859,16.57522356615209L76.8031704095115,18.538629186316257L78.34874504623531,19.8191111125102L77.51651254953777,21.042682730873253L76.20871862615604,20.50203480648031L76.5653896961694,21.298779116111973L75.49537648612977,21.24186880828131L74.54425363276141,22.152433733574753L73.5931307793926,21.782516732674253L72.87978863936632,22.351619810982584L71.69088507265542,23.802832660669196L70.97754293262915,25.79469343474875L69.90752972258952,26.335341359141694L69.19418758256325,27.70118874708203L67.1730515191548,28.725574288037137L65.03302509907553,29.15240159676864L63.60634081902299,28.81093974978353L62.774108322325446,29.57922890549969L61.94187582562745,29.20931190459919L59.08850726552237,30.432883522962584L57.89960369881146,30.176787137723522L57.06737120211392,30.888165985609135L56.235138705416375,30.945076293440025L55.521796565390105,29.920690752484802L53.025099075297476,28.86785005761419L51.47952443857366,30.11987682989286L49.339498018494396,28.64020882629086L48.03170409511267,28.412567594967527ZM86.1955085865261,16.546768412236702L87.50330250990783,17.144326644460534L88.92998678996037,16.774409643560034L90.00000000000045,17.798795184515143L87.978863936592,18.823180725470365L86.55217965653901,18.282532801077195ZM0.23778071334299966,24.40039089289303L2.615587846764356,24.05892904590803L3.210039630119354,25.282500664271083L1.4266842800534505,26.363796513057196L4.547473508864641e-13,25.453231587763753ZM78.34874504623531,24.25811512331586L84.17437252311811,22.721536811883198L88.33553500660491,23.632101737176527L86.1955085865261,24.37193573897764L83.69881109643347,24.57112181638547L82.39101717305175,25.25404551035558L81.43989431968294,24.912583663370583L79.41875825627494,25.396321279932863ZM77.75429326287986,15.09555556255009L78.58652575957785,15.493927717365978L78.58652575957785,16.745954489644532Z";

interface ArrlSectionMapProps {
  qsos: QSO[];
  dark?: boolean;
  /** Show section code labels on map */
  showLabels?: boolean;
}

export const ArrlSectionMap: React.FC<ArrlSectionMapProps> = ({
  qsos,
  dark = false,
  showLabels = true,
}) => {
  // ── Compute worked sections ─────────────────────────────────────────────────
  const workedSections = useMemo(() => {
    const set = new Set<string>();
    for (const qso of qsos) {
      if (qso.section) {
        set.add(qso.section.toUpperCase());
      }
    }
    return set;
  }, [qsos]);

  // Standard AlbersUsa projection — automatically places Alaska & Hawaii in bottom-left inset boxes
  const projection = useMemo(() => {
    return geoAlbersUsa().scale(900).translate([480, 250]);
  }, []);

  // ── Theme ───────────────────────────────────────────────────────────────────
  const bg           = dark ? '#0f172a' : '#f1f5f9';
  const unworkedFill = dark ? '#1e293b' : '#ffffff';
  const strokeColor  = dark ? '#475569' : '#64748b';

  const getSectionColor = (sectionCode: string) => {
    const code = sectionCode.toUpperCase();
    const area = SECTION_CALL_AREA[code] || 'DX';
    return CALL_AREA_COLORS[area] || '#94a3b8';
  };

  const isDxWorked = workedSections.has('DX');

  return (
    <div style={{ background: bg, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
      <ComposableMap
        projection="geoAlbersUsa"
        projectionConfig={{ scale: 900 }}
        width={960}
        height={500}
        style={{ width: '100%', height: 'auto', display: 'block' }}
      >
        <defs>
          {/* Clips Canada layer to top portion of map so it never bleeds down into Alaska/Hawaii insets */}
          <clipPath id="canada-top-map-clip">
            <rect x={0} y={0} width={960} height={340} />
          </clipPath>

          {/* Smooth Section Clip Paths for Ontario's 4 ARRL Sections (ONN, ONE, ONS, GH) */}
          <clipPath id="clip-ONN">
            <rect x={0} y={0} width={960} height={132} />
          </clipPath>
          <clipPath id="clip-ONE">
            <polygon points="685,132 960,132 960,340 685,340" />
          </clipPath>
          <clipPath id="clip-GH">
            {/* Smooth crescent hugging western Lake Ontario (Hamilton, Toronto, Halton, Peel, York, Durham) */}
            <polygon points="665,150 685,146 688,154 676,165 660,165 660,156" />
          </clipPath>
          <clipPath id="clip-ONS">
            {/* Southwestern Ontario peninsula */}
            <polygon points="500,132 685,132 685,340 500,340" />
          </clipPath>
        </defs>

        {/* Top-Left DX Section Inset Badge */}
        <g transform="translate(18, 18)">
          <rect
            x={0}
            y={0}
            width={64}
            height={28}
            rx={5}
            fill={isDxWorked ? CALL_AREA_COLORS['DX'] : unworkedFill}
            stroke={strokeColor}
            strokeWidth={1}
          />
          {/* Text Halo Outline */}
          <text
            x={32}
            y={18}
            textAnchor="middle"
            fontSize={9}
            fontWeight="bold"
            fontFamily="monospace"
            fill="none"
            stroke={dark ? '#0f172a' : '#ffffff'}
            strokeWidth={2.5}
            strokeLinejoin="round"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            DX
          </text>
          {/* Text Fill */}
          <text
            x={32}
            y={18}
            textAnchor="middle"
            fontSize={9}
            fontWeight="bold"
            fontFamily="monospace"
            fill={isDxWorked ? (dark ? '#ffffff' : '#0f172a') : (dark ? '#cbd5e1' : '#334155')}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            DX
          </text>
        </g>

        {/* Layer 1: Southern Canada Provinces Layer (Clipped to top map region, with Ontario split into 4 sections) */}
        <g clipPath="url(#canada-top-map-clip)">
          <Geographies geography={CANADA_GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo: any) => {
                const provName: string = geo.properties?.name ?? '';
                const sectionCode = CAN_PROVINCE_SECTIONS[provName];

                // Exclude Yukon, Northwest Territories, Nunavut to keep map clean
                if (provName === 'Yukon Territory' || provName === 'Northwest Territories' || provName === 'Nunavut' || sectionCode === 'TER') {
                  return null;
                }

                // Subdivide Ontario into its 4 distinct ARRL sections (ONN, ONE, ONS, GH)
                if (provName === 'Ontario') {
                  const ontSections = [
                    { code: 'ONN', clip: 'url(#clip-ONN)' },
                    { code: 'ONE', clip: 'url(#clip-ONE)' },
                    { code: 'ONS', clip: 'url(#clip-ONS)' },
                    { code: 'GH',  clip: 'url(#clip-GH)'  },
                  ];

                  return (
                    <g key={`can-${geo.rsmKey}`}>
                      {ontSections.map(sec => {
                        const worked = workedSections.has(sec.code);
                        const fill = worked ? CALL_AREA_COLORS['Canada'] : unworkedFill;

                        return (
                          <g key={sec.code} clipPath={sec.clip}>
                            <Geography
                              geography={geo}
                              fill={fill}
                              stroke={strokeColor}
                              strokeWidth={0.8}
                              style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                            />
                          </g>
                        );
                      })}
                    </g>
                  );
                }

                const worked = sectionCode ? workedSections.has(sectionCode) : false;
                const fill = worked ? CALL_AREA_COLORS['Canada'] : unworkedFill;

                return (
                  <Geography
                    key={`can-${geo.rsmKey}`}
                    geography={geo}
                    fill={fill}
                    stroke={strokeColor}
                    strokeWidth={0.8}
                    style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                  />
                );
              })
            }
          </Geographies>
        </g>

        {/* Layer 2: US Counties mapped to ARRL Sections */}
        <Geographies geography={US_COUNTIES_GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const fips: string = geo.id?.toString().padStart(5, '0') ?? '';
              const sectionCode = getSectionFromCountyFips(fips);
              const worked = sectionCode ? workedSections.has(sectionCode) : false;
              const fill = worked ? getSectionColor(sectionCode!) : unworkedFill;

              // Shift Alaska (-82px) and Hawaii (-70px) left so their inset boxes sit completely clear of California & CONUS
              const isAK = fips.startsWith('02');
              const isHI = fips.startsWith('15');
              const transform = isAK ? 'translate(-82, 15)' : isHI ? 'translate(-70, 15)' : undefined;

              const element = (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={fill}
                  stroke={fill}
                  strokeWidth={0.5}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              );

              return transform ? <g key={`g-${geo.rsmKey}`} transform={transform}>{element}</g> : element;
            })
          }
        </Geographies>

        {/* Layer 3: US State Outlines */}
        <Geographies geography={US_STATES_GEO_URL}>
          {({ geographies }: { geographies: any[] }) =>
            geographies.map((geo: any) => {
              const stFips = geo.id?.toString().padStart(2, '0');
              const isAK = stFips === '02';
              const isHI = stFips === '15';
              const transform = isAK ? 'translate(-82, 15)' : isHI ? 'translate(-70, 15)' : undefined;

              const element = (
                <Geography
                  key={`state-${geo.rsmKey}`}
                  geography={geo}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={1}
                  style={{ default: { outline: 'none' }, hover: { outline: 'none' }, pressed: { outline: 'none' } }}
                />
              );

              return transform ? <g key={`stg-${geo.rsmKey}`} transform={transform}>{element}</g> : element;
            })
          }
        </Geographies>

        {/* Alaska Inset Frame (Shifted Left - 75px clear of California & CONUS, encloses Ketchikan panhandle tip) */}
        <rect x={15} y={350} width={192} height={142} fill="none" stroke={strokeColor} strokeWidth={0.8} opacity={0.6} rx={3} />

        {/* Hawaii Inset Frame (Encloses all islands Niihau through Big Island with zero overflow) */}
        <rect x={215} y={398} width={105} height={88} fill="none" stroke={strokeColor} strokeWidth={0.8} opacity={0.6} rx={3} />

        {/* Puerto Rico Inset Frame (Bottom-Right) */}
        <rect x={790} y={395} width={160} height={95} fill="none" stroke={strokeColor} strokeWidth={0.8} opacity={0.6} rx={3} />

        {/* Puerto Rico Real Cartographic Coastline Path */}
        <g transform="translate(825, 420)">
          <path
            d={PUERTO_RICO_REAL_PATH}
            fill={workedSections.has('PR') ? getSectionColor('PR') : unworkedFill}
            stroke={strokeColor}
            strokeWidth={1}
          />
        </g>

        {/* Section code labels — BOTH worked and unworked sections labeled across US & Canada */}
        {showLabels && OFFICIAL_ARRL_SECTIONS.map(sec => {
          const code = sec.code.toUpperCase();
          const worked = workedSections.has(code);

          let pos = projection([sec.lng, sec.lat]);

          // Precise label positioning for Ontario & Inset sections
          if (code === 'GH') {
            pos = [672, 156]; // Centered inside the GH crescent in Toronto/Hamilton
          } else if (code === 'ONS') {
            pos = [645, 172]; // Centered in Southwestern Ontario (London/Kitchener)
          } else if (code === 'ONE') {
            pos = [715, 138]; // Centered in Eastern Ontario (Ottawa/Kingston)
          } else if (code === 'ONN') {
            pos = [610, 105]; // Centered in Northern Ontario (Sudbury/Thunder Bay)
          } else if (code === 'AK' && pos) {
            pos = [pos[0] - 82, pos[1] + 15];
          } else if (code === 'PAC' && pos) {
            pos = [pos[0] - 70, pos[1] + 15];
          } else if (code === 'PR') {
            pos = [872, 440]; // Centered over Puerto Rico island in bottom-right inset box
          }

          if (!pos || isNaN(pos[0]) || isNaN(pos[1])) return null;

          const fontColor = worked
            ? (dark ? '#ffffff' : '#0f172a')
            : (dark ? '#cbd5e1' : '#334155');

          const haloColor = dark ? '#0f172a' : '#ffffff';

          return (
            <g key={sec.code} transform={`translate(${pos[0]}, ${pos[1]})`}>
              {/* Text outline / halo for 100% legibility against dark & light backgrounds */}
              <text
                textAnchor="middle"
                fontSize={worked ? 8 : 7}
                fontWeight="bold"
                fontFamily="monospace"
                fill="none"
                stroke={haloColor}
                strokeWidth={2.5}
                strokeLinejoin="round"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {sec.code}
              </text>
              {/* High contrast text fill */}
              <text
                textAnchor="middle"
                fontSize={worked ? 8 : 7}
                fontWeight="bold"
                fontFamily="monospace"
                fill={fontColor}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {sec.code}
              </text>
            </g>
          );
        })}
      </ComposableMap>
    </div>
  );
};
