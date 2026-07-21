# Field Day Analytics Architecture

This document provides a technical overview of the system architecture, component design, data flows, and design decisions behind **Field Day Analytics**.

---

## 🏛️ High-Level Architecture

Field Day Analytics is structured as a client-side Single Page Application (SPA) built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

```
                           ┌──────────────────────────┐
                           │   ADIF File Input        │
                           │   (Main & GOTA Logs)     │
                           └─────────────┬────────────┘
                                         │
                                         ▼
                           ┌──────────────────────────┐
                           │  services/parser/        │
                           │  adifParser.ts           │
                           └─────────────┬────────────┘
                                         │  (Parsed QSO[] + Log Metadata)
                                         ▼
                           ┌──────────────────────────┐
                           │       App State          │
                           │   (React useState/Memo)  │
                           └──────┬────────────┬──────┘
                                  │            │
             ┌────────────────────┘            └────────────────────┐
             ▼                                                      ▼
┌──────────────────────────┐                              ┌──────────────────────────┐
│ services/scoring/        │                              │ services/geo/            │
│ fieldDayScorer.ts        │                              │ arrlSections.ts          │
└────────────┬─────────────┘                              └────────────┬─────────────┘
             │                                                         │
             ▼                                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────┐
│                               React UI Dashboard                                   │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌────────────────────────┐  │
│  │   Score Summary &    │   │  ARRL Section &      │   │ Band, Mode, Hourly     │  │
│  │   Bonus Checklist    │   │  Propagation Maps    │   │ Charts & Leaderboards  │  │
│  ├──────────────────────┼───┴──────────────────────┼───┴────────────────────────┤  │
│  │   User Guide Modal   │   Diagnostics Modal      │   Donation / Tip Modal     │  │
│  └──────────────────────┴──────────────────────────┴────────────────────────────┘  │
└──────────────────────────────────────────┬─────────────────────────────────────────┘
                                           │
                                           ▼
                             ┌──────────────────────────┐
                             │   services/pdf/          │
                             │   reportGenerator.ts     │
                             │   (window.print Engine)  │
                             └──────────────────────────┘
```

---

## 📁 Core Directory Layout

```
.github/
└── workflows/            # CI/CD automation
    ├── build.yml         # GitHub Actions Vite build verification workflow
    └── test.yml          # GitHub Actions Vitest test runner workflow

src/
├── components/           # UI Presentation Layer
│   ├── Header.tsx        # Top navigation, version badge, user guide trigger, export buttons
│   ├── Footer.tsx        # Author credits, issue reporting email link, social & Ko-fi widget
│   ├── FileUploader.tsx  # Dropzone component for uploading Main and GOTA ADIF logs
│   ├── ScoringForm.tsx   # Entry configuration & interactive ARRL bonus points selector
│   ├── Charts.tsx         # Chart.js visualization for bands, modes, and hourly QSO rates
│   ├── SectionMap.tsx    # Leaflet-based interactive geographic section map
│   ├── ArrlSectionMap.tsx# SVG TopoJSON ARRL/RAC section sweep choropleth map
│   ├── StaticQsoMap.tsx  # Maidenhead grid & propagation bearing map
│   ├── LogGrid.tsx       # Paginated, searchable table for QSO inspection & management
│   ├── ReportPreview.tsx # Printable A4/Letter formatted summary report view
│   ├── InstructionsModal.tsx # Multi-tab step-by-step user guide & field day help modal
│   ├── DonationModal.tsx      # Post-print open-source appreciation & tip modal
│   └── DiagnosticsModal.tsx   # Browser capabilities diagnostics & system check tool
├── services/             # Core Business Logic (Framework Agnostic)
│   ├── parser/           # ADIF parsing & metadata extraction
│   ├── scoring/          # Official ARRL Field Day scoring rules engine
│   ├── geo/              # Call sign lookup, grid locator math, ARRL section database
│   ├── analytics/        # Operator leaderboard & station statistics computation
│   └── pdf/              # Native window.print() export wrapper
├── types/                # TypeScript interfaces (QSO, FieldDayConfig, ScoreBreakdown)
└── constants.ts          # Application metadata (APP_NAME, APP_VERSION), sample logs, section DB
```

---

## 🔬 Subsystem Deep Dive

### 1. ADIF Log Parsing (`src/services/parser/adifParser.ts`)
- **RegEx-Based Tokenization**: Parses standard `<FIELD:LENGTH[:TYPE]>VALUE` ADIF tags without external heavy parser dependencies.
- **Field Normalization**: Normalizes band strings (e.g. `20M` $\rightarrow$ `20m`), modes (e.g. `FT8`, `JS8` $\rightarrow$ `Digital`), timestamp formatting, and callsign casing.
- **Metadata Extraction**: Scans ADIF header tags (`<STATION_CALLSIGN>`, `<OPERATOR>`, `<MY_GRIDSQUARE>`, `<ARRL_SECT>`) to auto-populate club information.

### 2. ARRL Scoring Engine (`src/services/scoring/fieldDayScorer.ts`)
- **QSO Point Logic**:
  - CW / Digital = 2 Points per QSO
  - Phone (SSB / AM / FM) = 1 Point per QSO
- **Power Multipliers**:
  - QRP ($\le$ 5 Watts) = 5x multiplier (5x for Battery/Solar, 2x for standard power)
  - Low Power ($\le$ 100 Watts) = 2x multiplier
  - High Power (> 100 Watts) = 1x multiplier
- **GOTA Station Rules**:
  - Tracks GOTA QSOs separately from main station entries.
  - GOTA operators earn 100 bonus points per 20 QSOs completed (up to 100 points per operator, max 500 total GOTA bonus points).
  - Optional 20-point GOTA coach bonus.
- **Section Sweep Calculation**: Computes unique ARRL/RAC sections worked out of 86 max sections.

### 3. Geographic & Section Mapping (`src/services/geo/`)
- **ARRL Section Mapping (`arrlSections.ts`)**: Maintains an authoritative dictionary of all US and Canadian RAC sections with abbreviation matching and state/province associations.
- **Maidenhead Grid Calculations (`maidenhead.ts`)**: Calculates latitude/longitude coordinates from 4-character and 6-character Maidenhead grid squares, computing great-circle distance bearings.
- **Callsign Lookup (`callsignLookup.ts`)**: Fallback prefix lookup engine mapping US call sign prefixes (W, K, N, AA-AL) and Canadian prefixes (VE, VA, VY) to likely ARRL sections and Maidenhead grids when unlisted in logs.

### 4. Interactive User Guide & Support Modals (`src/components/`)
- **Instructions Modal (`InstructionsModal.tsx`)**: Provides structured 5-tab user documentation inside the UI covering log import, station setup, bonus checklist, and PDF export.
- **Diagnostics Modal (`DiagnosticsModal.tsx`)**: Executes diagnostic checks on local storage, browser memory, canvas rendering, and screen viewport boundaries.
- **Donation Modal (`DonationModal.tsx`)**: Displays an embedded Ko-fi tipping widget to support open-source development after users view/print their report.

### 5. Report Generation & Native Print Engine (`src/services/pdf/reportGenerator.ts`)
- **Native Browser Mechanics**: Relies 100% on standard browser print capabilities (`window.print()`) combined with tailored CSS print rules (`@media print`, `.no-print`, print layout styling).
- **Zero Heavy PDF Dependencies**: Does not rely on external PDF generation libraries (such as `html2pdf` or `jsPDF`), keeping the application fast, lightweight, and 100% faithful to native vector rendering and browser PDF export.

---

## 🔒 Security & Privacy Guarantees

1. **Zero External Requests**: ADIF logs parsed via browser JavaScript FileReader API. No network payload containing user QSOs is dispatched.
2. **Pure Functional State**: Scoring computations are pure functions of `(mainQsos, gotaQsos, config)`. Changes in user input update React state instantly via `useMemo`.

---

## ⚡ Performance Optimizations

- **Memoized Calculations**: All analytical computations (leaderboards, section sweep percentages, chart data arrays) are wrapped in `useMemo` hooks to avoid re-computation during unrelated UI state changes.
- **Dynamic Imports & Canvas Rendering**: Heavy map topologies (TopoJSON) and charts rendered efficiently via HTML5 Canvas and SVG without blocking main thread interactions.
