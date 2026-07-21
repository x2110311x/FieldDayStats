import React from 'react';
import { FieldDayConfig, QSO, OperatorStats, StationStats, ScoreBreakdown } from '../types';
import { Printer, Users, AlertCircle, Award } from 'lucide-react';
import { OFFICIAL_ARRL_SECTIONS } from '../services/geo/arrlSections';
import { BANDS_ORDER, buildBandModeMatrix, calculateSectionSweep, calculateActivityTimeline, getOperatorLeaderboard } from '../services/analytics/statsEngine';
import { StaticQsoMap } from './StaticQsoMap';
import { ArrlSectionMap } from './ArrlSectionMap';
import { ErrorBoundary } from './ErrorBoundary';
import { APP_NAME } from '../constants';

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
  const allQsos = [...mainQsos, ...gotaQsos];
  const displayQsos = allQsos.length > 0 ? allQsos : mainQsos;

  const elementId = 'main-report-print-container';
  const pdfFilename = `${config.clubCall || 'W1AW'}_2026_FieldDay_Report.pdf`;

  const sweep = calculateSectionSweep(displayQsos);
  const matrix = buildBandModeMatrix(displayQsos);
  const mainMatrix = buildBandModeMatrix(mainQsos);
  const gotaMatrix = buildBandModeMatrix(gotaQsos);

  const timeline = calculateActivityTimeline(displayQsos);
  const totalQsos = displayQsos.length || 1;

  // Active bands
  const activeBands = BANDS_ORDER.filter((b) => (matrix[b]?.total || 0) > 0 || (mainMatrix[b]?.total || 0) > 0);

  const mult = config.powerCategory === 'HIGH_500W' ? 1 : config.powerCategory === 'QRP_5W' ? 5 : 2;

  const uniqueOpCount = operatorStats.length || 1;
  const totalParticipants = Math.max(config.totalParticipants || 0, uniqueOpCount);
  const participationIndex = parseFloat(((uniqueOpCount / totalParticipants) * 100).toFixed(1));

  const clubCall = config.clubCall || 'W1AW';
  const combinedClass = `${config.transmitters || 1}${(config.entryClass || 'A').toUpperCase()}`;

  // GOTA Addendum Calculations
  const gotaSweep = calculateSectionSweep(gotaQsos);
  const gotaOperators = getOperatorLeaderboard(gotaQsos);
  const totalReportPages = hasGotaQsos ? 5 : 4;

  const powerCategoryLabel = config.powerCategory === 'HIGH_500W'
    ? 'High Power (>100W, 1X Mult)'
    : config.powerCategory === 'QRP_5W'
    ? 'QRP (5W, 5X Mult)'
    : 'Low Power (100W, 2X Mult)';

  // Total Bonus Points (All bonuses including GOTA per-QSO bonus)
  const arrlTotalBonusPoints = score.totalBonusPoints + score.gotaQsoBonusPoints;

  // Mode breakdown for charts
  const phoneCount = score.phoneQsos;
  const cwCount = score.cwQsos;
  const digitalCount = score.digitalQsos;

  const phonePct = parseFloat(((phoneCount / totalQsos) * 100).toFixed(1));
  const cwPct = parseFloat(((cwCount / totalQsos) * 100).toFixed(1));
  const digitalPct = parseFloat(((digitalCount / totalQsos) * 100).toFixed(1));

  // Mode Conic Gradient Pie Chart
  const phoneEnd = phonePct;
  const cwEnd = phoneEnd + cwPct;
  const modeConicGradient = `conic-gradient(#22c55e 0% ${phoneEnd}%, #3b82f6 ${phoneEnd}% ${cwEnd}%, #eab308 ${cwEnd}% 100%)`;

  // Band Pie Gradient
  const BAND_PIE_COLORS = ['#9333ea', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#6366f1', '#64748b'];
  let bandAccumulator = 0;
  const bandStops = activeBands.map((band, idx) => {
    const pct = ((matrix[band]?.total || 0) / totalQsos) * 100;
    const start = bandAccumulator;
    bandAccumulator += pct;
    const color = BAND_PIE_COLORS[idx % BAND_PIE_COLORS.length];
    return `${color} ${start.toFixed(1)}% ${bandAccumulator.toFixed(1)}%`;
  });
  const bandConicGradient = activeBands.length > 0 ? `conic-gradient(${bandStops.join(', ')})` : `conic-gradient(#38bdf8 0% 100%)`;

  // GOTA Mode breakdown for pie charts
  const gotaTotalQsos = gotaQsos.length || 1;
  const gotaPhonePct = parseFloat(((score.gotaPhoneQsos / gotaTotalQsos) * 100).toFixed(1));
  const gotaCwPct = parseFloat(((score.gotaCwQsos / gotaTotalQsos) * 100).toFixed(1));
  const gotaDigitalPct = parseFloat(((score.gotaDigitalQsos / gotaTotalQsos) * 100).toFixed(1));

  const gotaPhoneEnd = gotaPhonePct;
  const gotaCwEnd = gotaPhoneEnd + gotaCwPct;
  const gotaModeConicGradient = `conic-gradient(#22c55e 0% ${gotaPhoneEnd}%, #3b82f6 ${gotaPhoneEnd}% ${gotaCwEnd}%, #eab308 ${gotaCwEnd}% 100%)`;

  // GOTA Band Pie Gradient
  const gotaActiveBands = BANDS_ORDER.filter((b) => (gotaMatrix[b]?.total || 0) > 0);
  let gotaBandAccumulator = 0;
  const gotaBandStops = gotaActiveBands.map((band, idx) => {
    const pct = ((gotaMatrix[band]?.total || 0) / gotaTotalQsos) * 100;
    const start = gotaBandAccumulator;
    gotaBandAccumulator += pct;
    const color = BAND_PIE_COLORS[idx % BAND_PIE_COLORS.length];
    return `${color} ${start.toFixed(1)}% ${gotaBandAccumulator.toFixed(1)}%`;
  });
  const gotaBandConicGradient = gotaActiveBands.length > 0 ? `conic-gradient(${gotaBandStops.join(', ')})` : `conic-gradient(#38bdf8 0% 100%)`;

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
      <div className="no-print bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Printer className="w-4 h-4 text-sky-400" />
            Field Day Operations Report
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formatted for 1-to-1 comparison with official ARRL web submissions. Click <strong className="text-sky-400 font-semibold">Print / Save as PDF</strong> to generate.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-extrabold bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 transition hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        >
          <Printer className="w-4 h-4" />
          Print / Save as PDF
        </button>
      </div>

      {/* A4 Report Printable Document Container */}
      <div id={elementId} className="space-y-8 bg-slate-950 print:bg-transparent p-2 sm:p-6 rounded-xl print:p-0 print:rounded-none">
        
        {/* ================= PAGE 1: ARRL-Style Executive Summary & Matrix ================= */}
        <div className="a4-page shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Header */}
            <div className="border-b-2 border-slate-900 pb-2 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold tracking-widest text-sky-700 uppercase">
                  ARRL FIELD DAY OPERATIONS REPORT
                </span>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mt-0.5">
                  {config.clubName}
                </h1>
                <div className="flex items-center gap-2 text-[10.5px] font-semibold text-slate-700 mt-1 font-mono">
                  <span>Call: <strong className="text-slate-950">{clubCall}</strong></span>
                  <span>•</span>
                  <span>GOTA Call: <strong className="text-slate-950">{config.gotaCall || '(NONE)'}</strong></span>
                  <span>•</span>
                  <span>Class: <strong className="text-slate-950">{combinedClass} {config.homeSection || 'CT'}</strong></span>
                  <span>•</span>
                  <span className="text-sky-800 font-bold">{powerCategoryLabel}</span>
                  <span>•</span>
                  <span>Grid: <strong className="text-slate-950">{config.homeGrid || 'FN31'}</strong></span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-500 uppercase">ARRL Field Day</div>
                <div className="text-xs font-black text-slate-900">June 27-28, 2026</div>
              </div>
            </div>

            {/* Top KPI Bar (Combined Totals) */}
            <div className="grid grid-cols-4 gap-2.5 text-center">
              <div className="bg-slate-100 border border-slate-300 rounded p-1.5">
                <div className="text-[8.5px] font-bold text-slate-500 uppercase">Preliminary Total Score</div>
                <div className="text-base font-black text-slate-950 font-mono">
                  {score.totalScore.toLocaleString()}
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-300 rounded p-1.5">
                <div className="text-[8.5px] font-bold text-slate-500 uppercase">Total QSOs (Main + GOTA)</div>
                <div className="text-base font-black text-slate-900 font-mono">
                  {score.totalQsos.toLocaleString()}
                  <span className="text-[9px] font-normal text-slate-600 block mt-0.5">({score.mainTotalQsos} Main + {score.gotaTotalQsos} GOTA)</span>
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-300 rounded p-1.5">
                <div className="text-[8.5px] font-bold text-slate-500 uppercase">Participation Rate</div>
                <div className="text-base font-black text-emerald-800 font-mono">
                  {participationIndex}%
                  <span className="text-[9px] font-normal text-slate-600 block mt-0.5">({uniqueOpCount} ops / {totalParticipants} attendees)</span>
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-300 rounded p-1.5">
                <div className="text-[8.5px] font-bold text-slate-500 uppercase">Sections Contacted</div>
                <div className="text-base font-black text-slate-900 font-mono">{sweep.workedCount}/86</div>
              </div>
            </div>

            {/* Score Summary & Itemized Bonus Breakdown (2 Columns) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Left Box: Score Calculation Summary */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1.5 font-mono text-[10.5px] bg-slate-50 flex flex-col justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-900 uppercase border-b border-slate-200 pb-1">
                    ARRL Score Summary
                  </h3>
                  <div className="space-y-1 pt-1.5">
                    <div className="flex justify-between"><span>CW QSOs ({score.cwQsos} × 2 pts):</span> <span className="font-bold text-blue-900">{score.cwPoints} pts</span></div>
                    <div className="flex justify-between"><span>Digital QSOs ({score.digitalQsos} × 2 pts):</span> <span className="font-bold text-amber-900">{score.digitalPoints} pts</span></div>
                    <div className="flex justify-between"><span>Phone QSOs ({score.phoneQsos} × 1 pt):</span> <span className="font-bold text-emerald-900">{score.phonePoints} pts</span></div>
                    <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-slate-900">
                      <span>Total Raw QSO Points:</span> <span>{score.rawQsoPoints} pts</span>
                    </div>
                    <div className="border-t border-slate-200 pt-1 space-y-0.5">
                      <div className="flex justify-between font-bold text-sky-800">
                        <span>Claimed QSO Score:</span> <span>{score.multipliedQsoPoints.toLocaleString()} pts</span>
                      </div>
                      <div className="text-[9px] text-sky-700 font-normal text-right">
                        ({score.rawQsoPoints} raw pts × {mult}X • {powerCategoryLabel})
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-1.5 text-[9.5px] text-slate-600 space-y-0.5">
                  <div className="flex justify-between font-semibold">
                    <span>Main Station ({score.mainTotalQsos} QSOs × {mult}X):</span>
                    <span>{score.mainMultipliedQsoPoints.toLocaleString()} pts</span>
                  </div>
                  {score.gotaTotalQsos > 0 && (
                    <div className="flex justify-between font-semibold text-amber-900">
                      <span>GOTA Station ({score.gotaTotalQsos} QSOs × {mult}X):</span>
                      <span>{score.gotaMultipliedQsoPoints.toLocaleString()} pts</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Box: Itemized Bonus Points Checklist (Fully Visible, No Scrollbar) */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1 font-mono text-[9.5px] flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                    <h3 className="text-[10px] font-bold text-slate-900 uppercase">Itemized Claimed Bonuses</h3>
                    <span className="text-[10px] font-bold text-emerald-800">+{arrlTotalBonusPoints} pts</span>
                  </div>
                  <div className="space-y-0.5 pt-1">
                    {score.bonusPointsItemized.map((b, idx) => (
                      <div key={idx} className="flex justify-between border-b border-slate-100 py-0.5">
                        <span className="text-slate-700 truncate pr-1">{b.label}</span>
                        <strong className="text-emerald-800 shrink-0">+{b.points}</strong>
                      </div>
                    ))}
                    {score.gotaQsoBonusPoints > 0 && (
                      <div className="flex justify-between border-b border-slate-100 py-0.5 text-amber-900 font-semibold">
                        <span className="truncate pr-1">GOTA bonus ({score.gotaQsoCount} QSOs × 5 pts)</span>
                        <strong className="text-amber-800 shrink-0">+{score.gotaQsoBonusPoints}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Band & Operating Mode Matrix Table (Combined + Separate GOTA Row) */}
            <div className="border border-slate-300 rounded p-2.5 space-y-1">
              <h3 className="text-[10px] font-bold text-slate-900 uppercase">Band & Operating Mode Breakdown</h3>
              <table className="w-full text-left text-[10.5px] font-mono">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[9.5px] border-b border-slate-300">
                  <tr>
                    <th className="p-1">Band</th>
                    <th className="p-1 text-right text-blue-800">CW QSOs</th>
                    <th className="p-1 text-right text-amber-800">Digital</th>
                    <th className="p-1 text-right text-emerald-800">Phone (SSB)</th>
                    <th className="p-1 text-right font-bold text-slate-900">Total QSOs</th>
                    <th className="p-1 text-right">% Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[10.5px]">
                  {activeBands.map((band) => {
                    const row = mainMatrix[band] || { cw: 0, phone: 0, digital: 0, total: 0 };
                    if (row.total === 0) return null;
                    const pct = ((row.total / totalQsos) * 100).toFixed(1);

                    return (
                      <tr key={band}>
                        <td className="p-1 font-bold text-sky-800">{band}</td>
                        <td className="p-1 text-right text-blue-900">{row.cw}</td>
                        <td className="p-1 text-right text-amber-900">{row.digital}</td>
                        <td className="p-1 text-right text-emerald-900">{row.phone}</td>
                        <td className="p-1 text-right font-bold text-slate-900">{row.total}</td>
                        <td className="p-1 text-right text-slate-600">{pct}%</td>
                      </tr>
                    );
                  })}
                  {score.gotaTotalQsos > 0 && (
                    <tr className="bg-amber-50 font-semibold border-t-2 border-amber-300">
                      <td className="p-1 font-bold text-amber-900">GOTA Station</td>
                      <td className="p-1 text-right text-blue-900">{score.gotaCwQsos}</td>
                      <td className="p-1 text-right text-amber-900">{score.gotaDigitalQsos}</td>
                      <td className="p-1 text-right text-emerald-900">{score.gotaPhoneQsos}</td>
                      <td className="p-1 text-right font-bold text-amber-950">{score.gotaTotalQsos}</td>
                      <td className="p-1 text-right text-amber-900">{((score.gotaTotalQsos / totalQsos) * 100).toFixed(1)}%</td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400">
                  <tr>
                    <td className="p-1 text-slate-900">TOTALS</td>
                    <td className="p-1 text-right text-blue-900">{score.cwQsos}</td>
                    <td className="p-1 text-right text-amber-900">{score.digitalQsos}</td>
                    <td className="p-1 text-right text-emerald-900">{score.phoneQsos}</td>
                    <td className="p-1 text-right text-slate-950">{score.totalQsos}</td>
                    <td className="p-1 text-right text-slate-900">100.0%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Page Footer */}
          <div className="border-t border-slate-300 pt-1.5 text-[9.5px] text-slate-500 flex justify-between font-mono">
            <span>ARRL Field Day Operations Summary • Class {combinedClass} • Created with {APP_NAME} (fdstats.ke8vxg.radio)</span>
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

            {/* Stacked Mode & Band Pie Charts (Vertical Stack with Right-Side Legends) */}
            <div className="space-y-5">
              {/* Operating Mode Pie Chart */}
              <div className="border border-slate-300 rounded p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">
                  Operating Mode Distribution
                </h3>
                <div className="flex items-center justify-between gap-8 pt-1">
                  <div
                    className="w-48 h-48 rounded-full shadow-inner border-2 border-slate-300 shrink-0"
                    style={{ background: modeConicGradient }}
                  />
                  <div className="flex-1 space-y-2.5 font-mono border-l border-slate-200 pl-6">
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className="w-3.5 h-3.5 rounded bg-emerald-500 shadow-sm" />
                        Phone (SSB)
                      </span>
                      <span className="text-slate-900">
                        <strong className="text-sm font-bold text-emerald-700">{phonePct}%</strong>{' '}
                        <span className="text-slate-500">({phoneCount} QSOs)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className="w-3.5 h-3.5 rounded bg-blue-500 shadow-sm" />
                        CW (Morse Code)
                      </span>
                      <span className="text-slate-900">
                        <strong className="text-sm font-bold text-blue-700">{cwPct}%</strong>{' '}
                        <span className="text-slate-500">({cwCount} QSOs)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                      <span className="flex items-center gap-2 font-semibold">
                        <span className="w-3.5 h-3.5 rounded bg-amber-500 shadow-sm" />
                        Digital (FT8 / RTTY)
                      </span>
                      <span className="text-slate-900">
                        <strong className="text-sm font-bold text-amber-700">{digitalPct}%</strong>{' '}
                        <span className="text-slate-500">({digitalCount} QSOs)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Band Share Pie Chart */}
              <div className="border border-slate-300 rounded p-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">
                  Band Distribution
                </h3>
                <div className="flex items-center justify-between gap-8 pt-1">
                  <div
                    className="w-48 h-48 rounded-full shadow-inner border-2 border-slate-300 shrink-0"
                    style={{ background: bandConicGradient }}
                  />
                  <div className="flex-1 space-y-1.5 font-mono border-l border-slate-200 pl-6">
                    {activeBands.map((band, idx) => {
                      const count = matrix[band].total;
                      const pct = ((count / totalQsos) * 100).toFixed(1);
                      const color = BAND_PIE_COLORS[idx % BAND_PIE_COLORS.length];

                      return (
                        <div key={band} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-100">
                          <span className="flex items-center gap-2 font-semibold">
                            <span className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                            {band} Band
                          </span>
                          <span className="text-slate-900">
                            <strong className="font-bold text-slate-900">{pct}%</strong>{' '}
                            <span className="text-slate-500">({count} QSOs)</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 flex justify-between">
            <span>Activity & Distribution Analytics • Created with {APP_NAME} (fdstats.ke8vxg.radio)</span>
            <span>Page 2 of {totalReportPages}</span>
          </div>
        </div>

        {/* ================= PAGE 3: 86-Section Sweep Scorecard ================= */}
        <div className="a4-page shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between">
          <div className="flex-1 flex flex-col justify-between pb-3">
            <div className="border-b-2 border-slate-900 pb-2.5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase">ARRL Section Scorecard</h2>
                <p className="text-xs text-slate-600">Worked Sections: <strong>{sweep.workedCount} / 86</strong> ({sweep.sweepPct}%)</p>
              </div>
              <div className="text-xs font-bold text-slate-700 font-mono">Callsign: {clubCall}</div>
            </div>

            {/* 86 Section Check-Off Grid (Condensed 1-line flex cells) */}
            <div className="grid grid-cols-10 sm:grid-cols-12 gap-1 text-center font-mono text-[8.5px]">
              {OFFICIAL_ARRL_SECTIONS.map((sec) => {
                const count = sweep.sectionCounts[sec.code] || 0;
                const isWorked = count > 0;

                return (
                  <div
                    key={sec.code}
                    className={`py-0.5 px-1 rounded border flex items-center justify-between transition ${
                      isWorked
                        ? 'bg-emerald-100 border-emerald-400 font-bold text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-[8.5px]">{sec.code}</span>
                    <span className="text-[7.5px] font-mono leading-none">
                      {isWorked ? count : '-'}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Geographic Section Choropleth Map */}
            <ErrorBoundary fallbackTitle="Section Coverage Map Error">
              <div className="border border-slate-300 rounded overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1 border-b border-slate-200 bg-slate-50">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">Section Coverage Map</h3>
                  <span className="text-[10px] font-mono text-slate-500">{sweep.workedCount} of 86 sections worked</span>
                </div>
                <ArrlSectionMap qsos={displayQsos} dark={false} showLabels={true} />
              </div>
            </ErrorBoundary>

            {/* Top 10 Contacted Sections */}
            <div className="border border-slate-300 rounded p-2.5 space-y-1.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase">Top 10 Contacted Sections</h3>
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 text-slate-700 uppercase text-[10px]">
                  <tr>
                    <th className="p-1">Section</th>
                    <th className="p-1">Name</th>
                    <th className="p-1 text-right">QSOs</th>
                    <th className="p-1 text-right">% Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[10.5px]">
                  {sweep.topSections.map((sec) => (
                    <tr key={sec.code}>
                      <td className="p-1 font-bold text-sky-800">{sec.code}</td>
                      <td className="p-1">{sec.name}</td>
                      <td className="p-1 text-right font-bold text-slate-900">{sec.count}</td>
                      <td className="p-1 text-right text-slate-600">{sec.pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 flex justify-between shrink-0">
            <span>ARRL Section Scorecard • Created with {APP_NAME} (fdstats.ke8vxg.radio)</span>
            <span>Page 3 of {totalReportPages}</span>
          </div>
        </div>

        {/* ================= PAGE 4: Geodetic Map & Main Operator / Station Breakdown ================= */}
        <div className="a4-page shadow-2xl rounded-sm text-slate-900 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="border-b-2 border-slate-900 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase">QSO Map & Operator Statistics</h2>
              </div>
              <div className="text-xs font-bold text-slate-700 font-mono">Callsign: {clubCall}</div>
            </div>

            {/* Static SVG QSO Map — print-safe, no Leaflet/tiles */}
            <ErrorBoundary fallbackTitle="QSO Propagation Map Error">
              <div className="border border-slate-300 rounded overflow-hidden">
                <div className="flex items-center justify-between px-3 py-1 border-b border-slate-200 bg-slate-50">
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

            {/* Main Station Operator & Rig Breakdown Grids — Full-Width 100% Sections */}
            <div className="space-y-2.5">
              {/* Operator Leaderboard & Band/Mode Breakdown (Full-Width, 10+ Operators) */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">
                    {operatorStats.length > 10 ? 'Top 10 Operators & Activity Breakdown' : 'Operator Leaderboard & Activity Breakdown'}
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">
                    {operatorStats.length > 10 ? `Top 10 of ${operatorStats.length} Operators` : `${operatorStats.length} Operators Total`}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[9.5px] font-mono border-collapse">
                    <thead className="bg-slate-100 text-slate-700 uppercase border-b border-slate-300">
                      <tr>
                        <th className="p-1 font-bold text-slate-900 w-[110px]">Operator Call</th>
                        <th className="p-1 text-right font-bold text-slate-900 w-[55px] pr-2">QSOs</th>
                        <th className="p-1 text-right text-slate-700 w-[80px] whitespace-nowrap pr-3">Active Hours</th>
                        <th className="p-1 text-right text-slate-700 w-[65px] whitespace-nowrap pr-4">% Share</th>
                        <th className="p-1 text-left text-slate-700 pl-3">Bands Worked</th>
                        <th className="p-1 text-left text-slate-700 w-[130px] pl-2">Modes Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {operatorStats.slice(0, 10).map((op) => (
                        <tr key={op.callsign} className="hover:bg-slate-50">
                          <td className="p-1 font-bold text-sky-800 whitespace-nowrap">{op.callsign}</td>
                          <td className="p-1 text-right font-bold text-slate-900 pr-2">{op.totalQsos}</td>
                          <td className="p-1 text-right text-slate-600 pr-3">{op.activeHours} hrs</td>
                          <td className="p-1 text-right text-slate-600 pr-4 font-semibold">{op.pctOfTotal}%</td>
                          <td className="p-1 text-left pl-3">
                            <div className="flex flex-wrap gap-0.5 items-center leading-none">
                              {op.workedBands.map((b) => {
                                const bCount = op.bandCounts ? op.bandCounts[b] : undefined;
                                return (
                                  <span key={b} className="px-1 py-0.5 text-[8px] font-bold rounded bg-slate-200 text-slate-800 border border-slate-300 whitespace-nowrap">
                                    {b}{bCount !== undefined ? ` (${bCount})` : ''}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-1 text-left">
                            <div className="flex flex-wrap gap-0.5 items-center leading-none">
                              {op.cwQsos > 0 && (
                                <span className="px-1 py-0.5 text-[7.5px] font-bold rounded bg-blue-100 text-blue-900 border border-blue-300 whitespace-nowrap">
                                  CW ({op.cwQsos})
                                </span>
                              )}
                              {op.phoneQsos > 0 && (
                                <span className="px-1 py-0.5 text-[7.5px] font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap">
                                  SSB ({op.phoneQsos})
                                </span>
                              )}
                              {op.digitalQsos > 0 && (
                                <span className="px-1 py-0.5 text-[7.5px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                                  DIG ({op.digitalQsos})
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Station Breakdown (Full-Width) */}
              <div className="border border-slate-300 rounded p-2.5 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">Station Breakdown</h3>
                  <span className="text-[10px] font-mono text-slate-500">{stationStats.length} Active Stations</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[9.5px] font-mono border-collapse">
                    <thead className="bg-slate-100 text-slate-700 uppercase border-b border-slate-300">
                      <tr>
                        <th className="p-1 font-bold text-slate-900 w-[110px]">Station Name</th>
                        <th className="p-1 text-right font-bold text-slate-900 w-[55px]">Total QSOs</th>
                        <th className="p-1 text-right text-blue-800 w-[50px]">CW QSOs</th>
                        <th className="p-1 text-right text-emerald-800 w-[65px]">Phone (SSB)</th>
                        <th className="p-1 text-right text-amber-800 w-[50px]">Digital</th>
                        <th className="p-1 text-right text-slate-700 w-[55px] pr-3">% Share</th>
                        <th className="p-1 text-left text-slate-700 pl-2">Bands Worked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {stationStats.map((st) => (
                        <tr key={st.name} className="hover:bg-slate-50">
                          <td className="p-1 font-bold text-emerald-800 whitespace-nowrap">{st.name}</td>
                          <td className="p-1 text-right font-bold text-slate-900">{st.totalQsos}</td>
                          <td className="p-1 text-right text-blue-900">{st.cwQsos}</td>
                          <td className="p-1 text-right text-emerald-900">{st.phoneQsos}</td>
                          <td className="p-1 text-right text-amber-900">{st.digitalQsos}</td>
                          <td className="p-1 text-right text-slate-600 pr-3">{st.pctOfTotal}%</td>
                          <td className="p-1 text-left pl-2">
                            <div className="flex flex-wrap gap-0.5 items-center leading-none">
                              {st.workedBands?.map((b) => {
                                const bCount = st.bandCounts ? st.bandCounts[b] : undefined;
                                return (
                                  <span key={b} className="px-1 py-0.5 text-[8px] font-bold rounded bg-slate-200 text-slate-800 border border-slate-300 whitespace-nowrap">
                                    {b}{bCount !== undefined ? ` (${bCount})` : ''}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-300 pt-2 text-[10px] text-slate-500 flex justify-between shrink-0">
            <span>ARRL Field Day Operations Summary • QSO Map & Operator Statistics • Created with {APP_NAME} (fdstats.ke8vxg.radio)</span>
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
                  <div className="flex items-center gap-3 text-xs font-semibold text-slate-700 mt-2 font-mono">
                    <span>GOTA Call: <strong className="text-amber-900 font-bold">{config.gotaCall || clubCall + '/GOTA'}</strong></span>
                    <span>•</span>
                    <span>Host Club: <strong className="text-slate-950">{clubCall}</strong></span>
                    <span>•</span>
                    <span>GOTA Coach: <strong className={config.bonuses.gotaCoach ? "text-emerald-700 font-bold" : "text-slate-500"}>{config.bonuses.gotaCoach ? "CLAIMED (+100 pts)" : "Not Claimed"}</strong></span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">GOTA Total Score</div>
                  <div className="text-lg font-black text-amber-700">+{score.gotaTotalPoints.toLocaleString()} pts</div>
                </div>
              </div>

              {/* GOTA Summary Grid */}
              <div className="bg-amber-50 border border-amber-300 rounded p-2.5 grid grid-cols-5 gap-2 text-center font-mono">
                <div>
                  <div className="text-[8.5px] font-bold text-amber-900 uppercase">GOTA Contacts</div>
                  <div className="text-sm font-black text-slate-900">{score.gotaTotalQsos} QSOs</div>
                </div>
                <div>
                  <div className="text-[8.5px] font-bold text-amber-900 uppercase">GOTA Operators</div>
                  <div className="text-sm font-black text-amber-950">{gotaOperators.length} Ops</div>
                </div>
                <div>
                  <div className="text-[8.5px] font-bold text-amber-900 uppercase">QSO Credit ({mult}X)</div>
                  <div className="text-sm font-black text-sky-800">+{score.gotaMultipliedQsoPoints.toLocaleString()} pts</div>
                </div>
                <div>
                  <div className="text-[8.5px] font-bold text-amber-900 uppercase">Per-QSO Bonus (5 pt)</div>
                  <div className="text-sm font-black text-amber-800">+{score.gotaQsoBonusPoints.toLocaleString()} pts</div>
                </div>
                <div>
                  <div className="text-[8.5px] font-bold text-amber-900 uppercase">GOTA Coach Bonus</div>
                  <div className="text-sm font-black text-emerald-800">{config.bonuses.gotaCoach ? '+100 pts' : '0 pts'}</div>
                </div>
              </div>

              {/* GOTA Visual Distribution Pie Charts */}
              <div className="grid grid-cols-2 gap-3">
                {/* Mode Distribution Pie Chart */}
                <div className="border border-slate-300 rounded p-2.5 space-y-1.5 font-mono text-xs">
                  <h3 className="text-[10px] font-bold text-slate-900 uppercase">GOTA Operating Mode Distribution</h3>
                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="w-14 h-14 rounded-full shrink-0 shadow-sm border border-slate-200" style={{ background: gotaModeConicGradient }} />
                    <div className="space-y-0.5 text-[9.5px] w-full">
                      <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"/>Phone (SSB)</span><strong>{score.gotaPhoneQsos} ({gotaPhonePct}%)</strong></div>
                      <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"/>CW</span><strong>{score.gotaCwQsos} ({gotaCwPct}%)</strong></div>
                      <div className="flex justify-between items-center"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"/>Digital</span><strong>{score.gotaDigitalQsos} ({gotaDigitalPct}%)</strong></div>
                    </div>
                  </div>
                </div>

                {/* Band Distribution Pie Chart */}
                <div className="border border-slate-300 rounded p-2.5 space-y-1.5 font-mono text-xs">
                  <h3 className="text-[10px] font-bold text-slate-900 uppercase">GOTA Band Distribution</h3>
                  <div className="flex items-center gap-3 pt-0.5">
                    <div className="w-14 h-14 rounded-full shrink-0 shadow-sm border border-slate-200" style={{ background: gotaBandConicGradient }} />
                    <div className="space-y-0.5 text-[9.5px] w-full max-h-[60px] overflow-y-auto">
                      {gotaActiveBands.map((b, idx) => (
                        <div key={b} className="flex justify-between items-center">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: BAND_PIE_COLORS[idx % BAND_PIE_COLORS.length] }} />
                            {b}
                          </span>
                          <strong>{gotaMatrix[b].total} ({(((gotaMatrix[b].total / gotaTotalQsos) * 100)).toFixed(1)}%)</strong>
                        </div>
                      ))}
                    </div>
                  </div>
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
              <div className="border border-slate-300 rounded p-2.5 space-y-1">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                  <h3 className="text-xs font-bold text-slate-900 uppercase">GOTA Operating Participants & Mentors</h3>
                  <span className="text-[10px] font-mono text-amber-900 font-bold">{gotaOperators.length} Operators Total</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[9.5px] font-mono border-collapse">
                    <thead className="bg-slate-100 text-slate-700 uppercase border-b border-slate-300">
                      <tr>
                        <th className="p-1 font-bold text-slate-900 w-[110px]">Operator Call</th>
                        <th className="p-1 text-right font-bold text-slate-900 w-[55px] pr-2">QSOs</th>
                        <th className="p-1 text-right text-slate-700 w-[80px] whitespace-nowrap pr-3">Active Hours</th>
                        <th className="p-1 text-right text-slate-700 w-[65px] whitespace-nowrap pr-4">% Share</th>
                        <th className="p-1 text-left text-slate-700 pl-3">Bands Worked</th>
                        <th className="p-1 text-left text-slate-700 w-[130px] pl-2">Modes Used</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {gotaOperators.map((op) => (
                        <tr key={op.callsign} className="hover:bg-slate-50">
                          <td className="p-1 font-bold text-amber-800 whitespace-nowrap">{op.callsign}</td>
                          <td className="p-1 text-right font-bold text-slate-900 pr-2">{op.totalQsos}</td>
                          <td className="p-1 text-right text-slate-600 pr-3">{op.activeHours} hrs</td>
                          <td className="p-1 text-right text-slate-600 pr-4 font-semibold">{op.pctOfTotal}%</td>
                          <td className="p-1 text-left pl-3">
                            <div className="flex flex-wrap gap-0.5 items-center leading-none">
                              {op.workedBands.map((b) => {
                                const bCount = op.bandCounts ? op.bandCounts[b] : undefined;
                                return (
                                  <span key={b} className="px-1 py-0.5 text-[8px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                                    {b}{bCount !== undefined ? ` (${bCount})` : ''}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-1 text-left">
                            <div className="flex flex-wrap gap-0.5 items-center leading-none">
                              {op.cwQsos > 0 && (
                                <span className="px-1 py-0.5 text-[7.5px] font-bold rounded bg-blue-100 text-blue-900 border border-blue-300 whitespace-nowrap">
                                  CW ({op.cwQsos})
                                </span>
                              )}
                              {op.phoneQsos > 0 && (
                                <span className="px-1 py-0.5 text-[7.5px] font-bold rounded bg-emerald-100 text-emerald-900 border border-emerald-300 whitespace-nowrap">
                                  SSB ({op.phoneQsos})
                                </span>
                              )}
                              {op.digitalQsos > 0 && (
                                <span className="px-1 py-0.5 text-[7.5px] font-bold rounded bg-amber-100 text-amber-900 border border-amber-300 whitespace-nowrap">
                                  DIG ({op.digitalQsos})
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="border-t border-amber-400 pt-2 text-[10px] text-slate-500 flex justify-between">
              <span>ARRL Field Day Operations Summary • GOTA Report • Created with {APP_NAME} (fdstats.ke8vxg.radio)</span>
              <span>Page 5 of 5</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
