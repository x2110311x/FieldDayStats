import React from 'react';
import { Radio, ShieldCheck, Download, RefreshCw } from 'lucide-react';

interface HeaderProps {
  onLoadSamples: () => void;
  onReset: () => void;
  onOpenDiagnostics: () => void;
  onExportPdf: (type: 'main' | 'gota') => void;
  hasQsos: boolean;
  hasGotaQsos: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onLoadSamples,
  onReset,
  onOpenDiagnostics,
  onExportPdf,
  hasQsos,
  hasGotaQsos,
}) => {
  const isTestingMode =
    import.meta.env.DEV ||
    (typeof window !== 'undefined' && window.location.search.includes('test=true'));

  return (
    <header className="no-print bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-3 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-md shadow-sky-500/20">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
              ARRL Field Day Operations & Stats Report
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                2026 Edition
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Client-Side ADIF Log Analyzer & Post-Event Club Operations Report
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {isTestingMode && (
            <>
              <button
                onClick={onLoadSamples}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                title="Load sample Field Day ADIF logs (Dev/Test mode)"
              >
                Load Sample Logs
              </button>

              <button
                onClick={onOpenDiagnostics}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 transition"
                title="Run analytics diagnostic assertion tests (Dev/Test mode)"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                Verify Analytics
              </button>
            </>
          )}

          {hasQsos && (
            <button
              onClick={() => onExportPdf('main')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/20 transition"
            >
              <Download className="w-4 h-4" />
              Download PDF Report
            </button>
          )}

          {hasGotaQsos && (
            <button
              onClick={() => onExportPdf('gota')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 transition"
            >
              <Download className="w-4 h-4" />
              GOTA Report PDF
            </button>
          )}

          {hasQsos && (
            <button
              onClick={onReset}
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              title="Reset loaded logs and settings"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
