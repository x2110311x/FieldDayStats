import React, { useState } from 'react';
import {
  HelpCircle,
  X,
  Upload,
  Sliders,
  Award,
  BarChart2,
  FileDown,
  CheckCircle2,
  BookOpen,
  Info,
  ChevronRight
} from 'lucide-react';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'start' | 'logs' | 'setup' | 'bonuses' | 'export'>('start');

  if (!isOpen) return null;

  const tabs = [
    { id: 'start', label: '1. Overview', icon: BookOpen },
    { id: 'logs', label: '2. Log Import', icon: Upload },
    { id: 'setup', label: '3. Station Setup', icon: Sliders },
    { id: 'bonuses', label: '4. Bonus Points', icon: Award },
    { id: 'export', label: '5. Analytics & PDF', icon: FileDown },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                User Guide & Field Day Instructions
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  Help Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Learn how to import logs, configure scoring options, and export summary reports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title="Close instructions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 overflow-x-auto gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-t border-x ${
                  isActive
                    ? 'bg-slate-900 border-slate-700 text-sky-400 border-b-slate-900 -mb-[1px]'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-slate-300 text-xs leading-relaxed">
          {/* Tab 1: Overview */}
          {activeTab === 'start' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-200 flex gap-3">
                <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-sky-300 mb-1">Welcome to Field Day Analytics</h4>
                  <p>
                    This application analyzes your amateur radio station's Standard ADIF log files, calculates estimated ARRL Field Day contest scores, displays operational analytics, and generates print-ready summary reports.
                  </p>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Quick 4-Step Workflow</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center text-[10px]">1</span>
                    Upload Log Files
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Drag & drop your main station <code className="text-sky-300">.adi</code> or <code className="text-sky-300">.adif</code> file. Optionally upload a separate GOTA station log.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center text-[10px]">2</span>
                    Verify Station Setup
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Ensure your Entry Class, Transmitter count, Club Callsign, Home Grid Square, and ARRL Section match your entry.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center text-[10px]">3</span>
                    Select Bonus Points
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Check off all bonus point categories completed by your group (e.g. 100% Emergency Power, Media Publicity, Safety Officer).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center text-[10px]">4</span>
                    Print & Save Summary Report
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Preview analytics charts, operator leaderboards, and click <strong>Download PDF Report</strong> to open your browser's print dialog to print or save as a PDF.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Log Import */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Log File Requirements & Auto-Extraction</h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">Main Station ADIF Log</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Upload your primary log created by software like N1MM, Ham Radio Deluxe, WSJT-X, or AC Log. The parser automatically extracts QSO dates, bands, modes, callsigns, and sent/received exchange parameters.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">Get On The Air (GOTA) Log</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      If your station ran a GOTA station, upload its separate ADIF file into the GOTA uploader box. GOTA QSOs are evaluated under standard GOTA rules and generate dedicated operator metrics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <span className="text-slate-200 font-semibold block">Automatic Metadata Discovery:</span>
                <p>
                  When you upload a main log, the app automatically inspects header fields and QSO records to infer your Station Call Sign, Entry Class, Transmitter count, Home Grid Square, and ARRL Section. You can review and adjust these in the Setup Form.
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Station Setup */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Fields to Fill in the Setup Form</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Club / Station Call Sign</span>
                  <p className="text-slate-400 text-[11px]">
                    The primary callsign under which the Field Day entry is registered (e.g., <code className="text-slate-300">W1AW</code>).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Club / Group Name</span>
                  <p className="text-slate-400 text-[11px]">
                    The full name of your radio club or operating group for printable reports.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Entry Class (A - F)</span>
                  <p className="text-slate-400 text-[11px]">
                    Select your ARRL Entry Class: <strong>A</strong> (Club/Group 3+), <strong>B</strong> (1-2 person), <strong>C</strong> (Mobile), <strong>D</strong> (Home Commercial Power), <strong>E</strong> (Home Emergency Power), or <strong>F</strong> (EOC).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Number of Transmitters</span>
                  <p className="text-slate-400 text-[11px]">
                    The maximum number of transmitters simultaneously transmitting on air (e.g. 3 Transmitters + Class A = 3A).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Home Grid Square</span>
                  <p className="text-slate-400 text-[11px]">
                    Enter your 4-character Maidenhead grid square (e.g., <code className="text-slate-300">FN31</code>) to calculate distances and plot propagation maps.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Home ARRL Section</span>
                  <p className="text-slate-400 text-[11px]">
                    Your station's home ARRL section abbreviation (e.g., <code className="text-slate-300">CT</code>, <code className="text-slate-300">STX</code>, <code className="text-slate-300">EPA</code>) for map visualization.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Bonus Points */}
          {activeTab === 'bonuses' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Configuring Field Day Bonus Points</h3>

              <p className="text-slate-400">
                Standard ARRL Field Day rules grant bonus points for specific public service, safety, and outreach activities. Check each box in the <strong>Field Day Setup & Bonus Checklist</strong> section to include them:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">100% Emergency Power</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts / transmitter</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Media Publicity</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Public Location</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Information Booth</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">NTS Messages Originated/Relayed</span>
                  <span className="text-sky-400 font-mono font-bold">+10 pts / message</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">W1AW Bulletin Received</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Educational Activity Completed</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Safety Officer Appointed</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Web Submission Completed</span>
                  <span className="text-sky-400 font-mono font-bold">+50 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Youth QSOs Bonus</span>
                  <span className="text-sky-400 font-mono font-bold">+20 pts / youth QSO</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Analytics & PDF */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Analytics & Printing PDF Reports</h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-sky-400" />
                    Operations Dashboard
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Scroll down the <strong>Operations Dashboard</strong> tab to view QSO breakdowns by band and mode, operator leaderboard rankings, hourly rate charts, interactive DX distance vector maps, and ARRL section coverage maps.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                    <FileDown className="w-4 h-4 text-sky-400" />
                    Printing & Saving PDF Reports
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    1. Click <strong>Print Report Preview</strong> in the navigation sub-bar to review the formatted summary report layout.<br />
                    2. Click the blue <strong>Download PDF Report</strong> button in the top header bar.<br />
                    3. Your browser's native print dialog will open where you can select <strong>Save as PDF</strong> or print a physical copy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/90">
          <div className="flex items-center gap-2">
            {activeTab !== 'start' && (
              <button
                onClick={() => {
                  const idx = tabs.findIndex((t) => t.id === activeTab);
                  if (idx > 0) setActiveTab(tabs[idx - 1].id);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Previous
              </button>
            )}

            {activeTab !== 'export' && (
              <button
                onClick={() => {
                  const idx = tabs.findIndex((t) => t.id === activeTab);
                  if (idx >= 0 && idx < tabs.length - 1) setActiveTab(tabs[idx + 1].id);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Got It, Let's Go!
          </button>
        </div>
      </div>
    </div>
  );
};
