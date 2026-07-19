import React from 'react';
import { QSO } from '../types';
import { calculateSectionSweep } from '../services/analytics/statsEngine';
import { OFFICIAL_ARRL_SECTIONS } from '../services/geo/arrlSections';
import { MapPin, CheckCircle, XCircle } from 'lucide-react';

interface SectionMapProps {
  qsos: QSO[];
}

export const SectionMap: React.FC<SectionMapProps> = ({ qsos }) => {
  const sweep = calculateSectionSweep(qsos);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">86-Section Sweep Scorecard (2026 Edition)</h2>
            <p className="text-xs text-slate-400">
              Official ARRL & RAC Section completion scorecard and geographic distribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Sweep Worked</span>
            <span className="text-base font-extrabold text-emerald-400 font-mono">
              {sweep.workedCount} / {sweep.totalAvailable}
            </span>
          </div>
          <div className="h-7 w-px bg-slate-800"></div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completion Ratio</span>
            <span className="text-base font-extrabold text-sky-400 font-mono">
              {sweep.sweepPct}%
            </span>
          </div>
        </div>
      </div>

      {/* Top 10 Sections Ranking Bar Chart */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Top Contacted Geographic Sections
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono">
          {sweep.topSections.map((sec) => (
            <div
              key={sec.code}
              className="bg-slate-950 border border-slate-800 rounded-md p-2 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400">{sec.code}</span>
                <span className="text-slate-400 text-[11px]">{sec.pct}%</span>
              </div>
              <div className="text-sm font-extrabold text-slate-100 mt-1">{sec.count} {sec.count === 1 ? 'QSO' : 'QSOs'}</div>
              <span className="text-[10px] text-slate-500 font-sans truncate">{sec.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 86 Section Scorecard Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
          <span>Official Section Check-Off Grid ({OFFICIAL_ARRL_SECTIONS.length} Total)</span>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle className="w-3.5 h-3.5" /> Worked
            </span>
            <span className="flex items-center gap-1 text-slate-500">
              <XCircle className="w-3.5 h-3.5" /> Missing
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 font-mono text-xs">
          {OFFICIAL_ARRL_SECTIONS.map((sec) => {
            const isWorked = sweep.workedSet.has(sec.code);
            const count = sweep.sectionCounts[sec.code] || 0;

            return (
              <div
                key={sec.code}
                title={`${sec.code} - ${sec.name} (${sec.division})`}
                className={`p-1.5 rounded text-center border transition ${
                  isWorked
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold shadow-sm shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-600 font-normal'
                }`}
              >
                <div className="text-xs">{sec.code}</div>
                <div className="text-[9px] opacity-90 mt-0.5 font-sans">
                  {isWorked ? `${count} ${count === 1 ? 'QSO' : 'QSOs'}` : '-'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
