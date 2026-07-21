import React, { useRef, useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

interface FileUploaderProps {
  onMainLogLoaded: (content: string, filename: string) => void;
  onGotaLogLoaded: (content: string, filename: string) => void;
  mainLogName?: string;
  gotaLogName?: string;
  mainQsoCount: number;
  gotaQsoCount: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onMainLogLoaded,
  onGotaLogLoaded,
  mainLogName,
  gotaLogName,
  mainQsoCount,
  gotaQsoCount,
}) => {
  const mainInputRef = useRef<HTMLInputElement>(null);
  const gotaInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileRead = (file: File, isGota: boolean) => {
    setErrorMsg(null);
    if (!file.name.toLowerCase().endsWith('.adi') && !file.name.toLowerCase().endsWith('.adif') && !file.name.toLowerCase().endsWith('.txt')) {
      setErrorMsg(`"${file.name}" is not a recognized ADIF log file (.adi / .adif).`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        if (isGota) {
          onGotaLogLoaded(content, file.name);
        } else {
          onMainLogLoaded(content, file.name);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent, isGota: boolean) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileRead(e.dataTransfer.files[0], isGota);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Main Log Uploader */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, false)}
        onClick={() => mainInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
          mainQsoCount > 0
            ? 'border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10'
            : 'border-slate-700 bg-slate-900/60 hover:border-sky-500 hover:bg-slate-900'
        }`}
      >
        <input
          type="file"
          ref={mainInputRef}
          accept=".adi,.adif,.txt"
          onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], false)}
          className="hidden"
        />

        {mainQsoCount > 0 ? (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">{mainLogName || 'Main ADIF Log Ingested'}</h3>
            <p className="text-xs font-semibold text-emerald-400">
              {mainQsoCount} Main QSOs Successfully Parsed
            </p>
            <span className="inline-block text-[11px] text-slate-400">Click or drag to replace log</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Drop Main Field Day ADIF Log</h3>
            <p className="text-xs text-slate-400">
              Upload your main station <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">.adi</code> or <code className="text-sky-300 bg-slate-950 px-1 py-0.5 rounded">.adif</code> file
            </p>
            <span className="inline-block text-[11px] text-slate-400">Supports drag & drop or file browser</span>
          </div>
        )}
      </div>

      {/* GOTA Log Uploader */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, true)}
        onClick={() => gotaInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition ${
          gotaQsoCount > 0
            ? 'border-amber-500/50 bg-amber-500/5 hover:bg-amber-500/10'
            : 'border-slate-700 bg-slate-900/60 hover:border-amber-500 hover:bg-slate-900'
        }`}
      >
        <input
          type="file"
          ref={gotaInputRef}
          accept=".adi,.adif,.txt"
          onChange={(e) => e.target.files?.[0] && handleFileRead(e.target.files[0], true)}
          className="hidden"
        />

        {gotaQsoCount > 0 ? (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">{gotaLogName || 'GOTA ADIF Log Ingested'}</h3>
            <p className="text-xs font-semibold text-amber-400">
              {gotaQsoCount} GOTA Station QSOs Parsed
            </p>
            <span className="inline-block text-[11px] text-slate-400">Click or drag to replace GOTA log</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">Drop Optional GOTA ADIF Log</h3>
            <p className="text-xs text-slate-400">
              Upload separate Get On The Air station <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">.adi</code> or <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded">.adif</code> file
            </p>
            <span className="inline-block text-[11px] text-slate-400">Includes GOTA section in report</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="md:col-span-2 bg-rose-500/10 border border-rose-500/20 rounded-lg p-3 text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* On-device processing & privacy assurance notice */}
      <div className="md:col-span-2 flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-900/40 border border-slate-800/60 rounded-lg py-2 px-4 text-center">
        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span>
          <strong className="text-slate-200">100% On-Device & Private:</strong> All log processing and report generation happen locally in your browser. No ADIF files, logs, or operational statistics are ever uploaded or stored on any server.
        </span>
      </div>
    </div>
  );
};
