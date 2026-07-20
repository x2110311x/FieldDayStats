import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FileUploader } from './components/FileUploader';
import { ScoringForm } from './components/ScoringForm';
import { Charts } from './components/Charts';
import { SectionMap } from './components/SectionMap';
import { ArrlSectionMap } from './components/ArrlSectionMap';
import { StaticQsoMap } from './components/StaticQsoMap';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LogGrid } from './components/LogGrid';
import { ReportPreview } from './components/ReportPreview';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { FieldDayConfig, QSO } from './types';
import { DEFAULT_CONFIG, SAMPLE_CONFIG, SAMPLE_MAIN_ADIF, SAMPLE_GOTA_ADIF } from './constants';
import { parseAdifLog, extractLogMetadata } from './services/parser/adifParser';
import { calculateFieldDayScore } from './services/scoring/fieldDayScorer';
import { getOperatorLeaderboard, getStationBreakdown } from './services/analytics/statsEngine';
import { lookupCallsign } from './services/geo/callsignLookup';
import { exportElementToPdf } from './services/pdf/reportGenerator';
import { BarChart3, FileText, Radio, Award } from 'lucide-react';

export function App() {
  const [mainQsos, setMainQsos] = useState<QSO[]>([]);
  const [gotaQsos, setGotaQsos] = useState<QSO[]>([]);
  const [config, setConfig] = useState<FieldDayConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'report'>('dashboard');
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  const handleMainLogLoaded = async (content: string, filename: string) => {
    const parsed = parseAdifLog(content, false);
    setMainQsos(parsed);

    // Auto-populate setup metadata from log file
    const meta = extractLogMetadata(parsed, content);

    const callToLookup = meta.discoveredCall || config.clubCall;
    let lookedUpName: string | undefined;
    let lookedUpGrid: string | undefined;
    let lookedUpSection: string | undefined;

    if (callToLookup) {
      const lookupResult = await lookupCallsign(callToLookup);
      if (lookupResult) {
        lookedUpName = lookupResult.name;
        lookedUpGrid = lookupResult.grid;
        lookedUpSection = lookupResult.section;
      }
    }

    setConfig((prev) => ({
      ...prev,
      clubCall: callToLookup || prev.clubCall,
      clubName: lookedUpName || prev.clubName,
      homeGrid: meta.discoveredGrid || lookedUpGrid || prev.homeGrid,
      homeSection: meta.discoveredSection || lookedUpSection || prev.homeSection,
      entryClass: meta.discoveredClassLetter || prev.entryClass || 'A',
      transmitters: meta.discoveredTransmitters || prev.transmitters || 1,
      bonuses: {
        ...prev.bonuses,
        satelliteQso: meta.hasSatelliteQso || prev.bonuses.satelliteQso,
      },
    }));
  };

  const handleGotaLogLoaded = (content: string, filename: string) => {
    const parsed = parseAdifLog(content, true);
    setGotaQsos(parsed);
  };

  const handleLoadSamples = () => {
    const parsedMain = parseAdifLog(SAMPLE_MAIN_ADIF, false);
    const parsedGota = parseAdifLog(SAMPLE_GOTA_ADIF, true);
    setMainQsos(parsedMain);
    setGotaQsos(parsedGota);
    setConfig(SAMPLE_CONFIG);
  };

  const handleReset = () => {
    setMainQsos([]);
    setGotaQsos([]);
    setConfig(DEFAULT_CONFIG);
  };

  const handleDeleteQso = (id: string) => {
    setMainQsos((prev) => prev.filter((q) => q.id !== id));
    setGotaQsos((prev) => prev.filter((q) => q.id !== id));
  };

  const handleDeleteSelected = (ids: string[]) => {
    const idSet = new Set(ids);
    setMainQsos((prev) => prev.filter((q) => !idSet.has(q.id)));
    setGotaQsos((prev) => prev.filter((q) => !idSet.has(q.id)));
  };

  // Main station stats strictly separated from GOTA stats
  const mainOperatorStats = useMemo(() => getOperatorLeaderboard(mainQsos), [mainQsos]);
  const mainStationStats = useMemo(() => getStationBreakdown(mainQsos), [mainQsos]);

  const score = useMemo(
    () => calculateFieldDayScore(mainQsos, gotaQsos, config),
    [mainQsos, gotaQsos, config]
  );

  const handleExportPdf = async () => {
    setActiveTab('report');
    setTimeout(async () => {
      const filename = `${config.clubCall || 'W1AW'}_2026_FieldDay_Report.pdf`;
      await exportElementToPdf('main-report-print-container', filename);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header
        onLoadSamples={handleLoadSamples}
        onReset={handleReset}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onExportPdf={handleExportPdf}
        hasQsos={mainQsos.length > 0}
        hasGotaQsos={gotaQsos.length > 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="no-print flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'dashboard'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
          >
            <BarChart3 className="w-4 h-4" />
            Operations Dashboard
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'report'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
          >
            <FileText className="w-4 h-4" />
            Print Report Preview (A4 Portrait)
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Top Row: Log File Uploaders */}
            <FileUploader
              onMainLogLoaded={handleMainLogLoaded}
              onGotaLogLoaded={handleGotaLogLoaded}
              hasMainLog={mainQsos.length > 0}
              hasGotaLog={gotaQsos.length > 0}
              mainLogCount={mainQsos.length}
              gotaLogCount={gotaQsos.length}
            />

            {/* Quick KPI Overview Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Score
                </span>
                <span className="text-xl font-black text-sky-400 font-mono">
                  {score.totalScore.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  Class {config.transmitters || 1}{(config.entryClass || 'A').toUpperCase()} ({score.powerMultiplier}x Mult)
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total QSOs
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {mainQsos.length.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  {score.rawQsoPoints} Multiplied Points
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  86 Section Sweep
                </span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {score.sectionsWorked} / 86
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  {score.sweepPercentage}% Completion
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Participation
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {score.participationIndexPct}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  {score.uniqueOperators} Operators / {score.totalAttendance} Attendees
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Claimed Bonuses
                </span>
                <span className="text-xl font-black text-amber-300 font-mono">
                  +{score.totalBonusPoints}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {score.bonusPointsItemized.length} Categories Claimed
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  GOTA Contacts
                </span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {score.gotaQsoCount}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  +{score.gotaQsoBonusPoints} Bonus Pts
                </span>
              </div>
            </div>

            {/* Config & Scoring Setup Form */}
            <ScoringForm
              config={config}
              onChange={setConfig}
              uniqueOpCount={score.uniqueOperators}
              participationIndexPct={score.participationIndexPct}
            />

            {/* Charts & Matrix Section strictly using Main Station QSOs */}
            {mainQsos.length > 0 ? (
              <>
                <Charts
                  qsos={mainQsos}
                  operatorStats={mainOperatorStats}
                  stationStats={mainStationStats}
                />

                {/* Section Scorecard Grid */}
                <SectionMap qsos={mainQsos} />

                {/* Geographic ARRL Section Map */}
                <ErrorBoundary fallbackTitle="ARRL Section Map Error">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-100">ARRL Section Map</h2>
                        <p className="text-xs text-slate-400">Sections worked highlighted by division</p>
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-slate-800">
                      <ArrlSectionMap qsos={mainQsos} dark={true} showLabels={true} />
                    </div>
                  </div>
                </ErrorBoundary>

                {/* Static SVG Propagation Map */}
                <ErrorBoundary fallbackTitle="QSO Propagation Map Error">
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
                    <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                      <div>
                        <h2 className="text-base font-bold text-slate-100">QSO Map</h2>
                        <p className="text-xs text-slate-400">
                          {mainQsos.length} contacts plotted · Home: {config.homeGrid || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-lg overflow-hidden border border-slate-800">
                      <StaticQsoMap
                        qsos={mainQsos}
                        homeGrid={config.homeGrid}
                        homeSection={config.homeSection}
                        homeCall={config.clubCall}
                        dark={true}
                      />
                    </div>
                  </div>
                </ErrorBoundary>

                {/* Interactive Main Station Log Table */}
                <LogGrid
                  qsos={mainQsos}
                  onDeleteQso={handleDeleteQso}
                  onDeleteSelected={handleDeleteSelected}
                />
              </>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center space-y-3">
                <Radio className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">No Main Log File Ingested Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Upload your main station Field Day ADIF log file (`.adi` / `.adif`) above to process your club's operations report.
                </p>
                {import.meta.env.DEV && (
                  <button
                    onClick={handleLoadSamples}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold shadow-md transition inline-block mt-2"
                  >
                    Load Sample Field Day Log (Dev Only)
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <ReportPreview
            config={config}
            score={score}
            mainQsos={mainQsos}
            gotaQsos={gotaQsos}
            operatorStats={mainOperatorStats}
            stationStats={mainStationStats}
            reportType="main"
          />
        )}
      </main>

      {/* Diagnostics Modal (Dev Only) */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        mainQsos={mainQsos}
        gotaQsos={gotaQsos}
        config={config}
      />
    </div>
  );
}

export default App;
