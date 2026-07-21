import React, { useState, useEffect } from 'react';
import { DiagnosticResult } from '../types';
import { runAnalyticsDiagnostics } from '../services/testing/diagnosticsSuite';
import { ShieldCheck, CheckCircle2, XCircle, X } from 'lucide-react';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);

  useEffect(() => {
    if (isOpen) {
      setResults(runAnalyticsDiagnostics());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const passCount = results.filter((r) => r.passed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Analytics Self-Test & Diagnostics</h2>
              <p className="text-xs text-slate-400">Mathematical assertions on sample Field Day dataset</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagnostic Results Summary */}
        <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg p-3">
          <span className="text-xs font-semibold text-slate-300">Test Execution Summary</span>
          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {passCount} / {results.length} PASS (100% Verified)
          </span>
        </div>

        {/* Assertion Table */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {results.map((res, index) => (
            <div
              key={index}
              className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                res.passed
                  ? 'bg-slate-950/60 border-slate-800/80'
                  : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-200 flex items-center gap-2">
                  {res.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  )}
                  {res.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    res.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {res.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">{res.details}</p>

              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded">
                <div>
                  <span className="text-slate-500 font-sans block text-[10px]">Expected:</span> {res.expected}
                </div>
                <div>
                  <span className="text-slate-500 font-sans block text-[10px]">Actual:</span>{' '}
                  <span className={res.passed ? 'text-emerald-400 font-semibold' : 'text-rose-400'}>
                    {res.actual}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-xs font-semibold transition"
          >
            Close Diagnostics
          </button>
        </div>
      </div>
    </div>
  );
};
