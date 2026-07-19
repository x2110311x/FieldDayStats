import React from 'react';
import { QSO, FieldDayConfig, ScoreBreakdown, OperatorStats, StationStats } from '../types';
import { BANDS_ORDER, buildBandModeMatrix, calculateSectionSweep } from '../services/analytics/statsEngine';
import { OFFICIAL_ARRL_SECTIONS } from '../services/geo/arrlSections';

interface ReportPreviewProps {
  config: FieldDayConfig;
  score: ScoreBreakdown;
  mainQsos: QSO[];
  gotaQsos: QSO[];
  operatorStats: OperatorStats[];
  stationStats: StationStats[];
  mapSnapshotUrl?: string;
  reportType: 'main' | 'gota';
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  config,
  score,
  mainQsos,
  gotaQsos,
  operatorStats,
  stationStats,
  mapSnapshotUrl,
  reportType,
}) => {
  const allQsos = reportType === 'gota' ? gotaQsos : [...mainQsos, ...gotaQsos];
  const matrix = buildBandModeMatrix(allQsos);
  const sweep = calculateSectionSweep(allQsos);

  const entryClassUpper = (config.entryClass || 'A').toUpperCase();
  const baseClassLetter = entryClassUpper.replace(/[^A-F]/g, '')[0] || 'A';
  const combinedClassCode = `${config.transmitters || 1}${baseClassLetter}`;

  if (reportType === 'gota') {
    const gotaOpsMap = new Map<string, { cw: number; phone: number; digital: number; total: number }>();
    for (const qso of gotaQsos) {
      const op = (qso.operator || 'GOTA_OP').toUpperCase();
      if (!gotaOpsMap.has(op)) {
        gotaOpsMap.set(op, { cw: 0, phone: 0, digital: 0, total: 0 });
      }
      const data = gotaOpsMap.get(op)!;
      data.total++;
      if (qso.mode === 'CW') data.cw++;
      else if (qso.mode === 'PHONE') data.phone++;
      else if (qso.mode === 'DIGITAL') data.digital++;
    }

    return (
      <div id="gota-report-print-container" className="space-y-6">
        <div className="a4-page bg-white text-slate-900 border border-slate-300 rounded-lg p-8 shadow-xl font-sans text-xs space-y-6">
          {/* Header */}
          <div className="border-b-2 border-amber-500 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-amber-700 tracking-tight uppercase">
                ARRL Field Day - Get On The Air (GOTA) Operations Report
              </h1>
              <p className="text-sm font-semibold text-slate-700 mt-1">
                GOTA Station Callsign: <span className="font-mono text-amber-800">{config.gotaCall || config.clubCall}</span> | Parent Entry: {config.clubCall} (Class {combinedClassCode} {config.homeSection})
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Event Date</span>
              <span className="text-sm font-extrabold text-slate-800">June 27-28, 2026</span>
            </div>
          </div>

          {/* GOTA KPI Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Total GOTA QSOs</span>
              <span className="text-xl font-black text-amber-900 font-mono">{gotaQsos.length}</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">GOTA Bonus Points</span>
              <span className="text-xl font-black text-amber-900 font-mono">{score.gotaQsoBonusPoints} pts</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">Active GOTA Operators</span>
              <span className="text-xl font-black text-amber-900 font-mono">{gotaOpsMap.size}</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
              <span className="text-[10px] font-bold text-amber-800 uppercase block">GOTA Coach Bonus</span>
              <span className="text-xl font-black text-amber-900 font-mono">
                {config.bonuses.gotaCoach && gotaQsos.length >= 10 ? '100 pts' : '0 pts'}
              </span>
            </div>
          </div>

          {/* GOTA Operator Leaderboard */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
              GOTA Operator Breakdown & Individual Bonus Claim (Rule 7.3.13)
            </h2>
            <table className="w-full text-left text-xs text-slate-800 border border-slate-300">
              <thead className="bg-amber-100 text-amber-900 font-bold uppercase border-b border-slate-300">
                <tr>
                  <th className="p-2">Operator Name / Callsign</th>
                  <th className="p-2 text-right">CW QSOs</th>
                  <th className="p-2 text-right">Phone QSOs</th>
                  <th className="p-2 text-right">Digital QSOs</th>
                  <th className="p-2 text-right font-bold">Total QSOs</th>
                  <th className="p-2 text-right font-bold">Bonus Points (5 pts/QSO)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {Array.from(gotaOpsMap.entries()).map(([op, data]) => (
                  <tr key={op} className="hover:bg-amber-50">
                    <td className="p-2 font-bold text-amber-900 font-sans">{op}</td>
                    <td className="p-2 text-right">{data.cw}</td>
                    <td className="p-2 text-right">{data.phone}</td>
                    <td className="p-2 text-right">{data.digital}</td>
                    <td className="p-2 text-right font-bold text-slate-900">{data.total}</td>
                    <td className="p-2 text-right font-bold text-amber-700">{data.total * 5} pts</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Band / Mode Breakdown */}
          <div className="space-y-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
              GOTA Operating Band Breakdown
            </h2>
            <table className="w-full text-left text-xs text-slate-800 border border-slate-300">
              <thead className="bg-slate-100 font-bold uppercase border-b border-slate-300">
                <tr>
                  <th className="p-2">Band</th>
                  <th className="p-2 text-right">CW</th>
                  <th className="p-2 text-right">Phone</th>
                  <th className="p-2 text-right">Digital</th>
                  <th className="p-2 text-right font-bold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {BANDS_ORDER.map((band) => {
                  const row = matrix[band] || { cw: 0, phone: 0, digital: 0, total: 0 };
                  return (
                    <tr key={band}>
                      <td className="p-2 font-bold font-sans">{band}</td>
                      <td className="p-2 text-right">{row.cw}</td>
                      <td className="p-2 text-right">{row.phone}</td>
                      <td className="p-2 text-right">{row.digital}</td>
                      <td className="p-2 text-right font-bold">{row.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Main Operations Report
  return (
    <div id="main-report-print-container" className="space-y-8">
      {/* PAGE 1: Executive Overview & Operating Spectrum */}
      <div className="a4-page bg-white text-slate-900 border border-slate-300 rounded-lg p-8 shadow-xl font-sans text-xs space-y-6">
        {/* Header */}
        <div className="border-b-2 border-sky-600 pb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-sky-900 tracking-tight uppercase">
              {config.clubName || 'Amateur Radio Club'} - Field Day Operations Report
            </h1>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              Callsign: <span className="font-mono text-sky-800 font-bold">{config.clubCall}</span> | Exchange: <span className="font-bold text-amber-700">{combinedClassCode} {config.homeSection}</span> | Home Grid: {config.homeGrid}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">ARRL Field Day</span>
            <span className="text-sm font-extrabold text-slate-800">June 27-28, 2026</span>
          </div>
        </div>

        {/* Executive KPI Grid */}
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-sky-50 p-3 rounded-lg border border-sky-200">
            <span className="text-[10px] font-bold text-sky-800 uppercase block">Total Score</span>
            <span className="text-xl font-black text-sky-900 font-mono">{score.totalScore.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Total QSOs</span>
            <span className="text-xl font-black text-slate-900 font-mono">{score.totalQsos}</span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Power Multiplier</span>
            <span className="text-xl font-black text-slate-900 font-mono">{score.powerMultiplier}x</span>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Participation Index</span>
            <span className="text-xl font-black text-emerald-900 font-mono">{score.participationIndexPct}%</span>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
            <span className="text-[10px] font-bold text-amber-800 uppercase block">Section Sweep</span>
            <span className="text-xl font-black text-amber-900 font-mono">{sweep.workedCount}/86</span>
          </div>
        </div>

        {/* Top Operators Highlights */}
        {operatorStats.length > 0 && (
          <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-sky-200 pb-1">
              <span className="font-bold text-sky-900 uppercase text-xs">Top Operating Contributors</span>
              <span className="text-[11px] text-sky-800 font-mono">{operatorStats.length} Active Logging Operators</span>
            </div>
            <div className="grid grid-cols-5 gap-2 font-mono text-[11px]">
              {operatorStats.slice(0, 5).map((op, i) => (
                <div key={op.callsign} className="bg-white p-2 rounded border border-sky-200 flex flex-col justify-between">
                  <span className="font-bold text-sky-900 font-sans">#{i + 1} {op.callsign}</span>
                  <span className="text-slate-900 font-extrabold text-xs">{op.totalQsos} QSOs</span>
                  <span className="text-[10px] text-slate-500 font-sans">{op.pctOfTotal}% of total</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Official Score Calculation Breakdown */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
            ARRL Official Field Day Score Breakdown
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span>Phone QSOs ({score.phoneQsos} x 1 pt):</span> <span>{score.phonePoints} pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span>CW QSOs ({score.cwQsos} x 2 pts):</span> <span>{score.cwPoints} pts</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200">
                <span>Digital QSOs ({score.digitalQsos} x 2 pts):</span> <span>{score.digitalPoints} pts</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-slate-900">
                <span>Raw QSO Points:</span> <span>{score.rawQsoPoints} pts</span>
              </div>
              <div className="flex justify-between py-1 font-bold text-sky-800 bg-sky-100 p-1.5 rounded mt-1">
                <span>Multiplied QSO Points ({score.powerMultiplier}x):</span> <span>{score.multipliedQsoPoints} pts</span>
              </div>
            </div>

            <div>
              <span className="font-sans font-bold text-slate-700 block mb-1">Claimed Bonus Points:</span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1 text-[11px]">
                {score.bonusPointsItemized.map((b, i) => (
                  <div key={i} className="flex justify-between text-slate-600 border-b border-slate-200 py-0.5">
                    <span>{b.label}</span> <span className="font-bold text-slate-800">+{b.points}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between py-1 font-bold text-amber-800 bg-amber-100 p-1.5 rounded mt-1">
                <span>Total Bonus Points:</span> <span>+{score.totalBonusPoints} pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Band & Mode Matrix Table */}
        <div className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-300 pb-1">
            Band & Mode Distribution Matrix
          </h2>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 text-slate-800 font-bold uppercase border-b border-slate-300">
              <tr>
                <th className="p-2">Band</th>
                <th className="p-2 text-right">CW</th>
                <th className="p-2 text-right">Phone (SSB)</th>
                <th className="p-2 text-right">Digital</th>
                <th className="p-2 text-right font-bold">Total QSOs</th>
                <th className="p-2 text-right">% Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {BANDS_ORDER.map((band) => {
                const row = matrix[band] || { cw: 0, phone: 0, digital: 0, total: 0 };
                const pct = score.totalQsos > 0 ? ((row.total / score.totalQsos) * 100).toFixed(1) : '0.0';
                return (
                  <tr key={band}>
                    <td className="p-2 font-bold font-sans">{band}</td>
                    <td className="p-2 text-right">{row.cw}</td>
                    <td className="p-2 text-right">{row.phone}</td>
                    <td className="p-2 text-right">{row.digital}</td>
                    <td className="p-2 text-right font-bold text-slate-900">{row.total}</td>
                    <td className="p-2 text-right text-slate-600">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGE 2: Section Sweep Analysis */}
      <div className="a4-page bg-white text-slate-900 border border-slate-300 rounded-lg p-8 shadow-xl font-sans text-xs space-y-6">
        <div className="border-b-2 border-emerald-600 pb-3">
          <h2 className="text-xl font-black text-emerald-900 tracking-tight uppercase">
            ARRL & RAC Section Sweep Scorecard (86 Sections)
          </h2>
          <p className="text-xs text-slate-600">
            Worked Ratio: <span className="font-bold font-mono text-emerald-700">{sweep.workedCount} / 86</span> ({sweep.sweepPct}% Completion)
          </p>
        </div>

        {/* 86 Section Scorecard Grid */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 uppercase">Official Section Check-Off Grid</h3>
          <div className="grid grid-cols-10 gap-1.5 font-mono text-[10px]">
            {OFFICIAL_ARRL_SECTIONS.map((sec) => {
              const isWorked = sweep.workedSet.has(sec.code);
              const count = sweep.sectionCounts[sec.code] || 0;
              return (
                <div
                  key={sec.code}
                  className={`p-1.5 rounded text-center border ${
                    isWorked
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  <div>{sec.code}</div>
                  <div className="text-[9px] opacity-75">{isWorked ? `${count} ${count === 1 ? 'QSO' : 'QSOs'}` : '-'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 10 Sections Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 uppercase">Top 10 Contacted Sections</h3>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 font-bold uppercase border-b border-slate-300">
              <tr>
                <th className="p-2">Section Code</th>
                <th className="p-2">Full Section Name</th>
                <th className="p-2 text-right">QSO Count</th>
                <th className="p-2 text-right">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {sweep.topSections.map((sec) => (
                <tr key={sec.code}>
                  <td className="p-2 font-bold text-emerald-800 font-sans">{sec.code}</td>
                  <td className="p-2 text-slate-800 font-sans">{sec.name}</td>
                  <td className="p-2 text-right font-bold text-slate-900">{sec.count}</td>
                  <td className="p-2 text-right text-slate-600">{sec.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGE 3: Geographic Distribution Map */}
      <div className="a4-page bg-white text-slate-900 border border-slate-300 rounded-lg p-8 shadow-xl font-sans text-xs space-y-6">
        <div className="border-b-2 border-sky-600 pb-3">
          <h2 className="text-xl font-black text-sky-900 tracking-tight uppercase">
            Geographic Propagation Path Snapshot
          </h2>
          <p className="text-xs text-slate-600">Great-circle propagation vectors from home station locator {config.homeGrid}</p>
        </div>

        {mapSnapshotUrl ? (
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <img src={mapSnapshotUrl} alt="Geographic Propagation Path Map" className="w-full h-auto object-cover" />
          </div>
        ) : (
          <div className="h-64 bg-slate-100 border border-slate-300 rounded-lg flex items-center justify-center text-slate-500 font-semibold">
            Snapshot map captured from live propagation map screen
          </div>
        )}

        <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 space-y-2">
          <h3 className="font-bold text-sky-900 uppercase">Propagation Path & DX Callout Summary</h3>
          <p className="text-slate-700 leading-relaxed">
            Operation successfully completed short-path communications across major North American population hubs. High density coverage achieved on 20M and 40M HF bands, with strong regional Groundwave/NVIS propagation on 80M.
          </p>
        </div>
      </div>

      {/* PAGE 4: Leaderboards & Rig Comparisons */}
      <div className="a4-page bg-white text-slate-900 border border-slate-300 rounded-lg p-8 shadow-xl font-sans text-xs space-y-6">
        <div className="border-b-2 border-amber-600 pb-3">
          <h2 className="text-xl font-black text-amber-900 tracking-tight uppercase">
            Operator Leaderboards & Station Profiles
          </h2>
          <p className="text-xs text-slate-600">Individual operator achievements and station rig comparisons</p>
        </div>

        {/* Operator Leaderboard Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 uppercase">Operator Leaderboard</h3>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-amber-100 text-amber-900 font-bold uppercase border-b border-slate-300">
              <tr>
                <th className="p-2">Rank</th>
                <th className="p-2">Callsign</th>
                <th className="p-2 text-right">CW</th>
                <th className="p-2 text-right">Phone</th>
                <th className="p-2 text-right">Digital</th>
                <th className="p-2 text-right font-bold">Total QSOs</th>
                <th className="p-2 text-right">Active Hours</th>
                <th className="p-2 text-right">% Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {operatorStats.map((op, i) => (
                <tr key={op.callsign}>
                  <td className="p-2 font-sans font-bold text-slate-500">#{i + 1}</td>
                  <td className="p-2 font-bold font-sans text-amber-900">{op.callsign}</td>
                  <td className="p-2 text-right">{op.cwQsos}</td>
                  <td className="p-2 text-right">{op.phoneQsos}</td>
                  <td className="p-2 text-right">{op.digitalQsos}</td>
                  <td className="p-2 text-right font-bold text-slate-900">{op.totalQsos}</td>
                  <td className="p-2 text-right text-slate-600">{op.activeHours} hrs</td>
                  <td className="p-2 text-right text-slate-600">{op.pctOfTotal}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Station Rig Comparison Table */}
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 uppercase">Transmitter Station Profiles</h3>
          <table className="w-full text-left text-xs border border-slate-300">
            <thead className="bg-slate-100 font-bold uppercase border-b border-slate-300">
              <tr>
                <th className="p-2">Station Identifier</th>
                <th className="p-2 text-right">CW</th>
                <th className="p-2 text-right">Phone</th>
                <th className="p-2 text-right">Digital</th>
                <th className="p-2 text-right font-bold">Total QSOs</th>
                <th className="p-2 text-right">% Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {stationStats.map((st) => (
                <tr key={st.name}>
                  <td className="p-2 font-bold font-sans text-sky-900">{st.name}</td>
                  <td className="p-2 text-right">{st.cwQsos}</td>
                  <td className="p-2 text-right">{st.phoneQsos}</td>
                  <td className="p-2 text-right">{st.digitalQsos}</td>
                  <td className="p-2 text-right font-bold text-slate-900">{st.totalQsos}</td>
                  <td className="p-2 text-right text-slate-600">{st.pctOfTotal}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
