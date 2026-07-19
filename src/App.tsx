import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ScoringForm } from './components/ScoringForm';
import { FileUploader } from './components/FileUploader';
import { LogGrid } from './components/LogGrid';
import { Charts } from './components/Charts';
import { SectionMap } from './components/SectionMap';
import { PropagationMap } from './components/PropagationMap';
import { DiagnosticsModal } from './components/DiagnosticsModal';
import { ReportPreview } from './components/ReportPreview';
import { QSO, FieldDayConfig } from './types';
import { parseAdifLog, extractLogMetadata } from './services/parser/adifParser';
import { calculateFieldDayScore } from './services/scoring/fieldDayScorer';
import { getOperatorLeaderboard, getStationBreakdown } from './services/analytics/statsEngine';
import { SAMPLE_MAIN_ADIF, SAMPLE_GOTA_ADIF } from './services/parser/sampleLogs';
import { exportElementToPdf } from './services/pdf/reportGenerator';
import { Radio, FileText, BarChart3, Award } from 'lucide-react';

const DEFAULT_CONFIG: FieldDayConfig = {
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
    webSubmission: true,
    safetyOfficer: false,
    siteResponsibilities: false,
    socialMedia: false,
    gotaCoach: false,
  },
};

const SAMPLE_CONFIG: FieldDayConfig = {
  clubCall: 'W1AW',
  clubName: 'ARRL Demonstrator Club',
  entryClass: 'A',
  transmitters: 2,
  powerCategory: 'LOW_100W',
  powerSource: 'GENERATOR_MAINS',
  homeGrid: 'FN31',
  homeSection: 'CT',
  totalParticipants: 25,
  youthParticipants: 2,
  gotaCall: 'W1AW/GOTA',
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
    agencyOfficialVisit: true,
    educationalActivity: true,
    youthQsoCount: 2,
    webSubmission: true,
    safetyOfficer: true,
    siteResponsibilities: false,
    socialMedia: true,
    gotaCoach: true,
  },
};

export function App() {
  const [mainQsos, setMainQsos] = useState<QSO[]>([]);
  const [gotaQsos, setGotaQsos] = useState<QSO[]>([]);
  const [mainLogName, setMainLogName] = useState<string>('');
  const [gotaLogName, setGotaLogName] = useState<string>('');
  const [config, setConfig] = useState<FieldDayConfig>(DEFAULT_CONFIG);
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'report' | 'gota-report'>('dashboard');
  const [mapSnapshotUrl, setMapSnapshotUrl] = useState<string>('');

  const handleMainLogLoaded = (content: string, filename: string) => {
    const parsed = parseAdifLog(content, false);
    setMainQsos(parsed);
    setMainLogName(filename);

    // Auto-populate setup metadata from log file
    const meta = extractLogMetadata(parsed, content);
    setConfig((prev) => ({
      ...prev,
      clubCall: meta.discoveredCall || prev.clubCall,
      homeGrid: meta.discoveredGrid || prev.homeGrid,
      homeSection: meta.discoveredSection || prev.homeSection,
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
    setGotaLogName(filename);
  };

  const handleLoadSamples = () => {
    const parsedMain = parseAdifLog(SAMPLE_MAIN_ADIF, false);
    const parsedGota = parseAdifLog(SAMPLE_GOTA_ADIF, true);
    setMainQsos(parsedMain);
    setGotaQsos(parsedGota);
    setMainLogName('sample_fieldday_main.adi');
    setGotaLogName('sample_fieldday_gota.adi');
    setConfig(SAMPLE_CONFIG);
  };

  const handleReset = () => {
    setMainQsos([]);
    setGotaQsos([]);
    setMainLogName('');
    setGotaLogName('');
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

  const allQsos = useMemo(() => [...mainQsos, ...gotaQsos], [mainQsos, gotaQsos]);

  const score = useMemo(
    () => calculateFieldDayScore(mainQsos, gotaQsos, config),
    [mainQsos, gotaQsos, config]
  );

  const operatorStats = useMemo(() => getOperatorLeaderboard(allQsos), [allQsos]);
  const stationStats = useMemo(() => getStationBreakdown(allQsos), [allQsos]);

  const handleExportPdf = async (type: 'main' | 'gota') => {
    setActiveTab(type === 'main' ? 'report' : 'gota-report');
    setTimeout(async () => {
      const elementId = type === 'main' ? 'main-report-print-container' : 'gota-report-print-container';
      const filename =
        type === 'main'
          ? `${config.clubCall || 'FieldDay'}_2026_Report.pdf`
          : `${config.clubCall || 'FieldDay'}_GOTA_2026_Report.pdf`;
      await exportElementToPdf(elementId, filename);
    }, 300);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header
        onLoadSamples={handleLoadSamples}
        onReset={handleReset}
        onOpenDiagnostics={() => setIsDiagnosticsOpen(true)}
        onExportPdf={handleExportPdf}
        hasQsos={allQsos.length > 0}
        hasGotaQsos={gotaQsos.length > 0}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dashboard'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Operations Dashboard
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'report'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Print Report Preview (A4 Portrait)
          </button>

          {gotaQsos.length > 0 && (
            <button
              onClick={() => setActiveTab('gota-report')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'gota-report'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4 text-amber-300" />
              GOTA Report Preview
            </button>
          )}
        </div>

        {activeTab === 'dashboard' ? (
          <div className="space-y-6">
            {/* Top Row: File Uploaders */}
            <FileUploader
              onMainLogLoaded={handleMainLogLoaded}
              onGotaLogLoaded={handleGotaLogLoaded}
              mainLogName={mainLogName}
              gotaLogName={gotaLogName}
              mainQsoCount={mainQsos.length}
              gotaQsoCount={gotaQsos.length}
            />

            {/* Score Summary Overview Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Official Score
                </span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {score.totalScore.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  ({score.multipliedQsoPoints} QSO + {score.totalBonusPoints} Bonus)
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Contacts
                </span>
                <span className="text-xl font-black text-sky-400 font-mono">
                  {score.totalQsos}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  {score.phoneQsos} PH / {score.cwQsos} CW / {score.digitalQsos} DIG
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Power Multiplier
                </span>
                <span className="text-xl font-black text-slate-100 font-mono">
                  {score.powerMultiplier}x
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {config.powerCategory.replace('_', ' ')}
                </span>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-md">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Participation Index
                </span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {score.participationIndexPct}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                  {score.uniqueOperators} Ops / {score.totalAttendance} Attendees
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

            {/* Charts & Matrix Section */}
            {allQsos.length > 0 ? (
              <>
                <Charts
                  qsos={allQsos}
                  operatorStats={operatorStats}
                  stationStats={stationStats}
                />

                {/* Section Scorecard Grid */}
                <SectionMap qsos={allQsos} />

                {/* Leaflet Propagation Map */}
                <PropagationMap
                  qsos={allQsos}
                  homeGrid={config.homeGrid}
                  homeCall={config.clubCall}
                  onSnapshotCaptured={(url) => setMapSnapshotUrl(url)}
                />

                {/* Interactive Log Table */}
                <LogGrid
                  qsos={allQsos}
                  onDeleteQso={handleDeleteQso}
                  onDeleteSelected={handleDeleteSelected}
                />
              </>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center space-y-3">
                <Radio className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-slate-200">No Log File Ingested Yet</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Upload your main station Field Day ADIF log file (.adi / .adif) above to process your club's operations report.
                </p>
                {(import.meta.env.DEV || (typeof window !== 'undefined' && window.location.search.includes('test=true'))) && (
                  <button
                    onClick={handleLoadSamples}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-md text-xs font-semibold shadow-md transition inline-block mt-2"
                  >
                    Load Sample Field Day Log
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
            operatorStats={operatorStats}
            stationStats={stationStats}
            mapSnapshotUrl={mapSnapshotUrl}
            reportType={activeTab === 'gota-report' ? 'gota' : 'main'}
          />
        )}
      </main>

      {/* Diagnostics Modal */}
      <DiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
      />
    </div>
  );
}
