import React from 'react';
import { FieldDayConfig, QSO, OperatorStats, StationStats, ScoreBreakdown } from '../types';
import { Printer, Download, Users, AlertCircle, Award } from 'lucide-react';
import { OFFICIAL_ARRL_SECTIONS } from '../services/geo/arrlSections';
import { BANDS_ORDER, buildBandModeMatrix, calculateSectionSweep, calculateActivityTimeline, getOperatorLeaderboard } from '../services/analytics/statsEngine';
import { exportElementToPdf } from '../services/pdf/reportGenerator';
import { StaticQsoMap } from './StaticQsoMap';
import { ArrlSectionMap } from './ArrlSectionMap';
import { ErrorBoundary } from './ErrorBoundary';

interface ReportPreviewProps {
  config: FieldDayConfig;
  score: ScoreBreakdown;
  mainQsos: QSO[];
  gotaQsos: QSO[];
  operatorStats: OperatorStats[];
  stationStats: StationStats[];
  reportType?: string;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  config,
  score,
  mainQsos,
  gotaQsos,
  operatorStats,
  stationStats,
}) => {
  const hasMainQsos = mainQsos.length > 0;
  const hasGotaQsos = gotaQsos.length > 0;
  const displayQsos = hasMainQsos ? mainQsos : gotaQsos;

  const elementId = 'main-report-print-container';
  const pdfFilename = `${config.clubCall || 'W1AW'}_2026_FieldDay_Report.pdf`;

  const sweep = calculateSectionSweep(displayQsos);
  const matrix = buildBandModeMatrix(displayQsos);
  const timeline = calculateActivityTimeline(displayQsos);
  const totalQsos = displayQsos.length || 1;

  // Mode breakdown
  const phoneCount = Object.values(matrix).reduce((sum, r) => sum + r.phone, 0);
  const cwCount = Object.values(matrix).reduce((sum, r) => sum + r.cw, 0);
  const digitalCount = Object.values(matrix).reduce((sum, r) => sum + r.digital, 0);

  const phonePct = parseFloat(((phoneCount / totalQsos) * 100).toFixed(1));
  const cwPct = parseFloat(((cwCount / totalQsos) * 100).toFixed(1));
  const digitalPct = parseFloat(((digitalCount / totalQsos) * 100).toFixed(1));

  // Active bands
  const activeBands = BANDS_ORDER.filter((b) => (matrix[b]?.total || 0) > 0);

  const rawQsoPoints = cwCount * 2 + digitalCount * 2 + phoneCount * 1;
  const mult = config.powerCategory === 'HIGH_500W' ? 1 : config.powerCategory === 'QRP_5W' ? 5 : 2;

  const uniqueOpCount = operatorStats.length || 1;
  const totalParticipants = Math.max(config.totalParticipants || 0, uniqueOpCount);
  const participationIndex = parseFloat(((uniqueOpCount / totalParticipants) * 100).toFixed(1));

  const clubCall = config.clubCall || 'W1AW';
  const combinedClass = `${config.transmitters || 1}${(config.entryClass || 'A').toUpperCase()}`;

  // GOTA Addendum Calculations
  const gotaMatrix = buildBandModeMatrix(gotaQsos);
  const gotaSweep = calculateSectionSweep(gotaQsos);
  const gotaOperators = getOperatorLeaderboard(gotaQsos);
  const totalReportPages = hasGotaQsos ? 5 : 4;

  const handleDownload = () => {
    exportElementToPdf(elementId, pdfFilename);
  };

  // Helper for Conic Gradient Pie Chart
  const phoneEnd = phonePct;
  const cwEnd = phoneEnd + cwPct;
  const modeConicGradient = `conic-gradient(#22c55e 0% ${phoneEnd}%, #3b82f6 ${phoneEnd}% ${cwEnd}%, #eab308 ${cwEnd}% 100%)`;

  // Band Pie Gradient
  const BAND_PIE_COLORS = ['#9333ea', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1', '#64748b'];
  let bandAccumulator = 0;
  const bandStops = activeBands.map((band, idx) => {
    const pct = (matrix[band].total / totalQsos) * 100;
    const start = bandAccumulator;
    bandAccumulator += pct;
    const color = BAND_PIE_COLORS[idx % BAND_PIE_COLORS.length];
    return `${color} ${start.toFixed(1)}% ${bandAccumulator.toFixed(1)}%`;
  });
  const bandConicGradient = activeBands.length > 0 ? `conic-gradient(${bandStops.join(', ')})` : `conic-gradient(#38bdf8 0% 100%)`;

  // Empty state when no log file is uploaded yet
  if (!hasMainQsos && !hasGotaQsos) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center space-y-4 max-w-xl mx-auto my-8">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <div>
          <h2 className="text-lg font-bold text-slate-100">No Log Data Available for Report</h2>
          <p className="text-xs text-slate-400 mt-1">
            Please upload your Field Day ADIF log file (`.adi` / `.adif`) on the <strong>Operations Dashboard</strong> tab to view and print your post-event report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Toolbar */}
      <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100">Field Day Operations Report</h2>
          <p className="text-xs text-slate-400">
            Click <strong className="text-sky-400">Print / Save as PDF</strong> for browser print, or <strong className="text-sky-400">Download PDF File</strong> for direct file download.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 shadow transition"
          >
            <Printer className="w-4 h-4 text-sky-400" />
            Print / Save as PDF
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition"
          >
            <Download className="w-4 h-4" />
            Download PDF File
          </button>
        </div>
      </div>

      {/* A4 Report Printable Document Container */}
      <div id={elementId} className="space-y-8 bg-slate-950 print:bg-transparent p-2 sm:p-6 rounded-xl print:p-0 print:rounded-none">
        {/* ================= PAGE 1: Executive Summary, Score Breakdown & Full Matrix ================= */}
        <div className="a4-page shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-3 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-sky-700 uppercase">
                  ARRL FIELD DAY OPERATIONS REPORT
                </span>
                <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mt-1">
                  {config.clubName}
                </h1>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 mt-2 font-mono">
                  <span>Callsign: <strong className="text-slate-950">{clubCall}</strong></span>
                  <span>•</span>
                  <span>Exchange: <strong className="text-slate-950">{combinedClass} {config.homeSection || 'CT'}</strong></span>
                  <span>•</span>
                  <span>Home Grid: <strong className="text-slate-950">{config.homeGrid || 'FN31'}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase">ARRL Field Day</div>
                <div className="text-sm font-black text-slate-900">June 27-28, 2026</div>
              </div>
            </div>

            {/* KPI Summary Grid */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="bg-slate-100 border border-slate-300 rounded p-2">
                <div className="text-[9px] font-bold text-slate-500 uppercase">Total Score</div>
                <div className="text-lg font-black text-slate-900 font-mono">
                  {score.totalScore.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-300 rounded p-2">
                <div className="text-[9px] font-bold text-slate-500 uppercase">Total QSOs</div>
                <div className="text-lg font-black text-slate-900 font-mono">{mainQsos.length.toLocaleString()}</div>
              </div>
              <div className="bg-slate-100 border border-slate-300 rounded p-2">
                <div className="text-[9px] font-bold text-slate-500 uppercase">Power Mult</div>
                <div className="text-lg font-black text-slate-900 font-mono">{mult}x</div>
              </div>
              <div className="bg-slate-100 border border-slate-300 rounded p-2">
                <div className="text-[9px] font-bold text-slate-500 uppercase">Section Count</div>
                <div className="text-lg font-black text-slate-900 font-mono">{sweep.workedCount}/86</div>
              </div>
            </div>

            {/* Participation KPI */}
            <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-950">Participation</span>
              </div>
              <div className="text-xs font-mono font-bold text-emerald-800">
                {participationIndex}% ({uniqueOpCount} operators / {totalParticipants} attendees)
              </div>
            </div>

            {/* Score Calculation Breakdown */}
            <div className="border border-slate-300 rounded p-3 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">ARRL Field Day Score Breakdown</h3>
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1 border-r border-slate-200 pr-3">
                  <div className="flex justify-between"><span>Phone QSOs ({phoneCount} × 1 pt):</span> <span>{phoneCount} pts</span></div>
                  <div className="flex justify-between"><span>CW QSOs ({cwCount} × 2 pts):</span> <span>{cwCount * 2} pts</span></div>
                  <div className="flex justify-between"><span>Digital QSOs ({digitalCount} × 2 pts):</span> <span>{digitalCount * 2} pts</span></div>
                  <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-slate-900">
                    <span>Raw QSO Points:</span> <span>{rawQsoPoints} pts</span>
                  </div>
                  <div className="flex justify-between font-bold text-sky-800">
                    <span>Multiplied QSO Points ({mult}x):</span> <span>{score.rawQsoPoints} pts</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]"><span>Claimed Bonus Points:</span> <strong className="text-emerald-700">+{score.totalBonusPoints} pts</strong></div>
                  {hasGotaQsos && (
                    <div className="flex justify-between text-[11px]"><span>GOTA Station Bonus:</span> <strong className="text-amber-700">+{score.gotaQsoBonusPoints} pts</strong></div>
                  )}
                  <div className="flex justify-between text-[11px]"><span>Participation Percentage:</span> <span>{participationIndex}%</span></div>
                  <div className="border-t-2 border-slate-900 pt-1 flex justify-between font-black text-sm text-slate-950">
                    <span>TOTAL CLAIMED SCORE:</span> <span>{score.totalScore.toLocaleString()} pts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Main Station Band & Mode Matrix Table */}
            <div className="border border-slate-300 rounded p-3 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Band & Operating Mode Matrix</h3>
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-300">
                  <tr>
                    <th className="p-1.5">Band</th>
                    <th className="p-1.5 text-right text-blue-800">CW QSOs</th>
                    <th className="p-1.5 text-right text-emerald-800">Phone (SSB)</th>
                    <th className="p-1.5 text-right text-amber-800">Digital</th>
                    <th className="p-1.5 text-right font-bold text-slate-900">Total QSOs</th>
                    <th className="p-1.5 text-right">% Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {BANDS_ORDER.map((band) => {
                    const row = matrix[band] || { cw: 0, phone: 0, digital: 0, total: 0 };
                    const pct = displayQsos.length > 0 ? ((row.total / displayQsos.length) * 100).toFixed(1) : '0.0';

                    return (
                      <tr key={band}>
                        <td className="p-1.5 font-bold text-sky-800">{band}</td>
                        <td className="p-1.5 text-right text-blue-900">{row.cw}</td>
                        <td className="p-1.5 text-right text-emerald-900">{row.phone}</td>
                        <td className="p-1.5 text-right text-amber-900">{row.digital}</td>
                        <td className="p-1.5 text-right font-bold text-slate-900">{row.total}</td>
                        <td className="p-1.5 text-right text-slate-600">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <tr>
                    <td className="p-1.5 text-slate-900">TOTALS</td>
                    <td className="p-1.5 text-right text-blue-900">{cwCount}</td>
                    <td className="p-1.5 text-right text-emerald-900">{phoneCount}</td>
                    <td className="p-1.5 text-right text-amber-900">{digitalCount}</td>
                    <td className="p-1.5 text-right text-sky-900">{displayQsos.length}</td>
                    <td className="p-1.5 text-right text-slate-900">100.0%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Page Footer */}
          <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 flex justify-between">
            <span>ARRL Field Day Operations Summary • Class {combinedClass}</span>
            <span>Page 1 of {totalReportPages}</span>
          </div>
        </div>

        {/* ================= PAGE 2: Full-Width Activity Rate Timeline & Pie Charts ================= */}
        <div className="a4-page shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase">Activity & Operating Distribution Analytics</h2>
                <p className="text-xs text-slate-600">Peak Rate: <strong>{timeline.peakHourlyRate} QSOs/hr</strong> ({timeline.peakWindowLabel})</p>
              </div>
              <div className="text-xs font-bold text-slate-700 font-mono">Callsign: {clubCall}</div>
            </div>

            {/* Full-Width Hourly Activity Velocity Timeline — SVG Bar Chart (print-safe) */}
            <div className="border border-slate-300 rounded p-4 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Activity Graph</h3>
              {(() => {
                const svgH = 120;
                const barAreaH = 80;
                const labelH = 20;
                const countH = 14;
                const bins = timeline.bins;
                const maxCount = timeline.peakHourlyRate || 1;
                const n = bins.length || 1;
                const barW = Math.max(1, Math.floor(700 / n) - 2);
                const gap = Math.max(1, Math.floor(700 / n) - barW);
                const totalW = n * (barW + gap);

                return (
                  <svg
                    viewBox={`0 0 ${totalW} ${svgH}`}
                    width="100%"
                    style={{ display: 'block', overflow: 'visible' }}
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* baseline */}
                    <line x1="0" y1={countH + barAreaH} x2={totalW} y2={countH + barAreaH} stroke="#cbd5e1" strokeWidth="1" />
                    {bins.map((bin, i) => {
                      const barH = Math.max(2, Math.round((bin.qsoCount / maxCount) * barAreaH));
                      const x = i * (barW + gap);
                      const y = countH + barAreaH - barH;
                      const label = bin.timeLabel.split(' ')[0];
                      return (
                        <g key={i}>
                          <rect x={x} y={y} width={barW} height={barH} fill="#0284c7" rx="1" />
                          {bin.qsoCount > 0 && (
                            <text x={x + barW / 2} y={y - 2} textAnchor="middle" fontSize="7" fill="#1e293b" fontFamily="monospace" fontWeight="bold">
                              {bin.qsoCount}
                            </text>
                          )}
                          <text
                            x={x + barW / 2}
                            y={countH + barAreaH + labelH}
                            textAnchor="start"
                            fontSize="6"
                            fill="#94a3b8"
                            fontFamily="monospace"
                            transform={`rotate(40, ${x + barW / 2}, ${countH + barAreaH + 4})`}
                          >
                            {label}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                );
              })()}
            </div>

            {/* Side-by-Side Mode & Band Pie Charts */}
            <div className="grid grid-cols-2 gap-6">
              {/* Operating Mode Pie Chart */}
              <div className="border border-slate-300 rounded p-4 space-y-3 flex flex-col items-center">
                <h3 className="text-xs font-bold text-slate-900 uppercase text-center">Operating Mode Share</h3>
                <div
                  className="w-36 h-36 rounded-full shadow-inner border-2 border-slate-200 my-2"
                  style={{ background: modeConicGradient }}
                />
                <div className="w-full space-y-1 text-xs font-mono pt-2 border-t border-slate-200">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Phone (SSB)</span>
                    <span><strong>{phonePct}%</strong> ({phoneCount})</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> CW</span>
                    <span><strong>{cwPct}%</strong> ({cwCount})</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Digital</span>
                    <span><strong>{digitalPct}%</strong> ({digitalCount})</span>
                  </div>
                </div>
              </div>

              {/* Band Share Pie Chart */}
              <div className="border border-slate-300 rounded p-4 space-y-3 flex flex-col items-center">
                <h3 className="text-xs font-bold text-slate-900 uppercase text-center">Band Distribution Share</h3>
                <div
                  className="w-36 h-36 rounded-full shadow-inner border-2 border-slate-200 my-2"
                  style={{ background: bandConicGradient }}
                />
                <div className="w-full space-y-1 text-xs font-mono pt-2 border-t border-slate-200">
                  {activeBands.slice(0, 4).map((band, idx) => {
                    const count = matrix[band].total;
                    const pct = ((count / totalQsos) * 100).toFixed(1);
                    const color = BAND_PIE_COLORS[idx % BAND_PIE_COLORS.length];

                    return (
                      <div key={band} className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} /> {band}</span>
                        <span><strong>{pct}%</strong> ({count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 flex justify-between">
            <span>Activity & Distribution Analytics</span>
            <span>Page 2 of {totalReportPages}</span>
          </div>
        </div>

        {/* ================= PAGE 3: 86-Section Sweep Scorecard ================= */}
        <div className="a4-page shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase">ARRL Section Sweep Scorecard (86 Sections)</h2>
                <p className="text-xs text-slate-600">Worked Sections: <strong>{sweep.workedCount} / 86</strong> ({sweep.sweepPct}%)</p>
              </div>
              <div className="text-xs font-bold text-slate-700 font-mono">Callsign: {clubCall}</div>
            </div>

            {/* 86 Section Check-Off Grid */}
            <div className="grid grid-cols-10 gap-1 text-center font-mono text-[9px]">
              {OFFICIAL_ARRL_SECTIONS.map((sec) => {
                const count = sweep.sectionCounts[sec.code] || 0;
                const isWorked = count > 0;

                return (
                  <div
                    key={sec.code}
                    className={`p-1 rounded border ${isWorked ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                  >
                    <div>{sec.code}</div>
                    <div className="text-[8px]">{isWorked ? `${count} QSO${count > 1 ? 's' : ''}` : '-'}</div>
                  </div>
                );
              })}
            </div>

            {/* Geographic Section Choropleth Map */}
            <ErrorBoundary fallbackTitle="Section Coverage Map Error">
              <div className="border border-slate-300 rounded overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">Section Coverage Map</h3>
                  <span className="text-[10px] font-mono text-slate-500">{sweep.workedCount} of 86 sections worked</span>
                </div>
                <ArrlSectionMap qsos={displayQsos} dark={false} showLabels={true} />
              </div>
            </ErrorBoundary>

            {/* Top 10 Contacted Sections */}
            <div className="border border-slate-300 rounded p-3 space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Top 10 Contacted Sections</h3>
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-1.5">Section</th>
                    <th className="p-1.5">Name</th>
                    <th className="p-1.5 text-right">QSOs</th>
                    <th className="p-1.5 text-right">% Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {sweep.topSections.map((sec) => (
                    <tr key={sec.code}>
                      <td className="p-1.5 font-bold text-sky-800">{sec.code}</td>
                      <td className="p-1.5">{sec.name}</td>
                      <td className="p-1.5 text-right font-bold text-slate-900">{sec.count}</td>
                      <td className="p-1.5 text-right text-slate-600">{sec.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 flex justify-between">
            <span>ARRL Field Day Operations Summary • Section Sweep</span>
            <span>Page 3 of {totalReportPages}</span>
          </div>
        </div>

        {/* ================= PAGE 4: Geodetic Map & Main Operator / Station Breakdown ================= */}
        <div className="a4-page shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="border-b-2 border-slate-900 pb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase">QSO Map & Operator Statistics</h2>
              </div>
              <div className="text-xs font-bold text-slate-700 font-mono">Callsign: {clubCall}</div>
            </div>

            {/* Static SVG QSO Map — print-safe, no Leaflet/tiles */}
            <ErrorBoundary fallbackTitle="QSO Propagation Map Error">
              <div className="border border-slate-300 rounded overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">QSO Propagation Map</h3>
                  <span className="text-[10px] font-mono text-slate-500">
                    Home: {config.homeGrid || 'N/A'} · {config.homeSection || 'N/A'} · {displayQsos.length} QSOs
                  </span>
                </div>
                <StaticQsoMap
                  qsos={displayQsos}
                  homeGrid={config.homeGrid}
                  homeSection={config.homeSection}
                  homeCall={clubCall}
                  dark={false}
                />
              </div>
            </ErrorBoundary>

            {/* Main Station Operator & Rig Breakdown Grids */}
            <div className="grid grid-cols-2 gap-4">
              {/* Operator Leaderboard */}
              <div className="border border-slate-300 rounded p-3 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase">Operators</h3>
                <table className="w-full text-left text-[10px] font-mono">
                  <thead className="bg-slate-100 text-slate-700 uppercase">
                    <tr>
                      <th className="p-1">Call</th>
                      <th className="p-1 text-right">QSOs</th>
                      <th className="p-1 text-right">Hrs</th>
                      <th className="p-1 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {operatorStats.slice(0, 6).map((op) => (
                      <tr key={op.callsign}>
                        <td className="p-1 font-bold text-sky-800">{op.callsign}</td>
                        <td className="p-1 text-right font-bold text-slate-900">{op.totalQsos}</td>
                        <td className="p-1 text-right text-slate-600">{op.activeHours}h</td>
                        <td className="p-1 text-right text-slate-600">{op.pctOfTotal}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Station Breakdown */}
              <div className="border border-slate-300 rounded p-3 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase">Stations</h3>
                <table className="w-full text-left text-[10px] font-mono">
                  <thead className="bg-slate-100 text-slate-700 uppercase">
                    <tr>
                      <th className="p-1">Station</th>
                      <th className="p-1 text-right">QSOs</th>
                      <th className="p-1 text-right">CW</th>
                      <th className="p-1 text-right">SSB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {stationStats.slice(0, 6).map((st) => (
                      <tr key={st.name}>
                        <td className="p-1 font-bold text-emerald-800">{st.name}</td>
                        <td className="p-1 text-right font-bold text-slate-900">{st.totalQsos}</td>
                        <td className="p-1 text-right text-blue-800">{st.cwQsos}</td>
                        <td className="p-1 text-right text-emerald-800">{st.phoneQsos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 flex justify-between">
            <span>ARRL Field Day Operations Summary • QSO Map & Operator Statistics</span>
            <span>Page 4 of {totalReportPages}</span>
          </div>
        </div>

        {/* ================= PAGE 5 (ADDENDUM): Dedicated GOTA Station Operations ================= */}
        {hasGotaQsos && (
          <div className="a4-page shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="border-b-2 border-amber-600 pb-3 flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold tracking-widest text-amber-700 uppercase flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    ARRL FIELD DAY GOTA STATION OPERATIONS
                  </span>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mt-1">
                    Get On The Air (GOTA) Station Report
                  </h2>
                  <p className="text-xs text-slate-600 mt-1 font-mono">
                    Dedicated station for novice, technician, and newly licensed operators
                  </p>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">GOTA Bonus Earned</div>
                  <div className="text-base font-black text-amber-700">+{score.gotaQsoBonusPoints} pts</div>
                </div>
              </div>

              {/* GOTA Summary Banner */}
              <div className="bg-amber-50 border border-amber-300 rounded p-3 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[9px] font-bold text-amber-900 uppercase">GOTA Total Contacts</div>
                  <div className="text-base font-black text-slate-900 font-mono">{gotaQsos.length} QSOs</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-amber-900 uppercase">GOTA Bonus Score</div>
                  <div className="text-base font-black text-amber-700 font-mono">+{score.gotaQsoBonusPoints} pts</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-amber-900 uppercase">GOTA Section Sweep</div>
                  <div className="text-base font-black text-slate-900 font-mono">{gotaSweep.workedCount}/86</div>
                </div>
              </div>

              {/* GOTA Band & Mode Matrix Table */}
              <div className="border border-slate-300 rounded p-3 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase">GOTA Station Band & Mode Matrix</h3>
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] border-b border-slate-300">
                    <tr>
                      <th className="p-1.5">Band</th>
                      <th className="p-1.5 text-right text-blue-800">CW QSOs</th>
                      <th className="p-1.5 text-right text-emerald-800">Phone (SSB)</th>
                      <th className="p-1.5 text-right text-amber-800">Digital</th>
                      <th className="p-1.5 text-right font-bold text-slate-900">Total QSOs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {BANDS_ORDER.map((band) => {
                      const row = gotaMatrix[band] || { cw: 0, phone: 0, digital: 0, total: 0 };
                      if (row.total === 0) return null;

                      return (
                        <tr key={band}>
                          <td className="p-1.5 font-bold text-amber-800">{band}</td>
                          <td className="p-1.5 text-right text-blue-900">{row.cw}</td>
                          <td className="p-1.5 text-right text-emerald-900">{row.phone}</td>
                          <td className="p-1.5 text-right text-amber-900">{row.digital}</td>
                          <td className="p-1.5 text-right font-bold text-slate-900">{row.total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* GOTA Operator Leaderboard */}
              <div className="border border-slate-300 rounded p-3 space-y-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase">GOTA Operating Participants & Mentors</h3>
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                    <tr>
                      <th className="p-1.5">Operator Callsign</th>
                      <th className="p-1.5 text-right">QSOs</th>
                      <th className="p-1.5 text-right">Active Hours</th>
                      <th className="p-1.5 text-right">Top Band</th>
                      <th className="p-1.5 text-right">% Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[11px]">
                    {gotaOperators.map((op) => (
                      <tr key={op.callsign}>
                        <td className="p-1.5 font-bold text-amber-800">{op.callsign}</td>
                        <td className="p-1.5 text-right font-bold text-slate-900">{op.totalQsos}</td>
                        <td className="p-1.5 text-right text-slate-600">{op.activeHours} hrs</td>
                        <td className="p-1.5 text-right text-sky-800">{op.topBand}</td>
                        <td className="p-1.5 text-right text-slate-600">{op.pctOfTotal}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t border-amber-400 pt-2 text-[10px] text-slate-500 flex justify-between">
              <span>ARRL Field Day Operations Summary • GOTA Addendum</span>
              <span>Page 5 of 5</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
