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
  ChevronRight,
  ShieldCheck,
  Search,
  ListFilter,
  CheckSquare,
  Printer,
} from 'lucide-react';
import { APP_NAME } from '../constants';

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
                Learn how to import logs, configure station parameters, claim bonus points, and generate submission reports
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
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-4 pt-2 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition border-t border-x relative ${isActive
                  ? 'bg-slate-900 border-slate-700 text-sky-400 border-b-slate-900 -mb-px z-10'
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
                  <h4 className="font-semibold text-sm text-sky-300 mb-1">Welcome to {APP_NAME}</h4>
                  <p>
                    Simply upload your log files, fill in your station setup details and bonus points, and generate print-ready Field Day summary reports.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-emerald-300 mb-1">100% On-Device & Private</h4>
                  <p>
                    All log parsing, score calculations, callsign lookups, and PDF generation occur locally inside your web browser. No QSO logs or station data are ever uploaded to an external server or saved in cloud storage.
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
                    Drag & drop your primary station <code className="text-sky-300">.adi</code> or <code className="text-sky-300">.adif</code> file. Optionally upload a separate GOTA station log.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center text-[10px]">2</span>
                    Verify Station Setup
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Check your Entry Class (A-F), Transmitter count, Power Category, Club Callsign, Home Grid Square, and ARRL Section.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center text-[10px]">3</span>
                    Select Bonus Points
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Check off all bonus point categories completed by your group (the checklist automatically adapts to your selected Entry Class).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 border border-sky-500/40 text-sky-300 flex items-center justify-center text-[10px]">4</span>
                    Print & Save Summary Report
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    Preview operational analytics, operator leaderboards, and click <strong>Download PDF Report</strong> to open your browser's print dialog to save as PDF.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Log Import */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Log File Requirements & Formatting</h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">Main Station ADIF Log</h4>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Upload your primary log created by software like N1MM, Ham Radio Deluxe, WSJT-X, or AC Log (<code className="text-slate-300">.adi</code> or <code className="text-slate-300">.adif</code>). The parser extracts QSO timestamps, bands, modes, callsigns, operator tags, sent/received exchange parameters, and satellite indicators.
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
                      If your group ran a GOTA station, drop its separate ADIF file into the GOTA uploader box. GOTA contacts are evaluated for bonus points and used to generate dedicated GOTA pages in your summary report.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Station Setup */}
          {activeTab === 'setup' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Configuring Station & Operational Setup</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400 flex items-center gap-1">
                    Station Call Sign
                    <Search className="w-3 h-3 text-slate-400" />
                  </span>
                  <p className="text-slate-400 text-[11px]">
                    The official callsign under which the entry is submitted (e.g. <code className="text-slate-300">W1AW</code>). Click the search icon to auto-lookup Club Name, Grid Square, and ARRL Section from the callsign database.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">GOTA Station Callsign</span>
                  <p className="text-slate-400 text-[11px]">
                    Optional callsign used by the GOTA station (e.g. <code className="text-slate-300">W1AW/GOTA</code>). Auto-detected if present in the GOTA log.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Club / Group Name</span>
                  <p className="text-slate-400 text-[11px]">
                    The full name of your radio club or operating group as displayed on formal submission pages.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Entry Category (A - F)</span>
                  <p className="text-slate-400 text-[11px]">
                    Select your category: <strong>A</strong> (Club 3+), <strong>B</strong> (1-2 Person), <strong>C</strong> (Mobile), <strong>D</strong> (Home Commercial Power), <strong>E</strong> (Home Emergency Power), or <strong>F</strong> (EOC).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Simultaneous Transmitters</span>
                  <p className="text-slate-400 text-[11px]">
                    Number of transmitters on the air simultaneously (1 to 20). Combined with your category letter to form your official Class code (e.g. 3 Transmitters + Class A = <code className="text-slate-300">3A</code>).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Power Category & Multiplier</span>
                  <p className="text-slate-400 text-[11px]">
                    <strong>Low Power (100W max)</strong>: 2X multiplier.<br />
                    <strong>QRP (5W max)</strong>: 5X multiplier (battery/solar) or 2X.<br />
                    <strong>High Power (&gt;100W PEP)</strong>: 1X multiplier.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Home Grid Locator</span>
                  <p className="text-slate-400 text-[11px]">
                    4-character Maidenhead grid square (e.g. <code className="text-slate-300">FN31</code>) used to compute QSO vector distances and plot propagation origin.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <span className="font-semibold text-sky-400">Home ARRL Section & Attendance</span>
                  <p className="text-slate-400 text-[11px]">
                    Home section abbreviation (e.g. <code className="text-slate-300">CT</code>, <code className="text-slate-300">MDC</code>) and physical sign-in head count for computing the Operator Participation Index %.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Bonus Points */}
          {activeTab === 'bonuses' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Class-Filtered Bonus Points Checklist</h3>

              <div className="p-3 rounded-lg bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>
                  <strong>Dynamic Rule Filtering:</strong> The bonus checklist in the Setup Form automatically hides options that are unavailable for your active Entry Class (e.g., Safety Officer is Class A only; 100% Emergency Power is excluded for Class D).
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">100% Emergency Power</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts / TX (max 2,000)</span>
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
                  <span className="text-slate-200 font-medium">Message to ARRL SM / SEC</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">NTS / ICS-213 Messages</span>
                  <span className="text-sky-400 font-mono font-bold">+10 pts / msg (max 100)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">W1AW Bulletin Received</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Satellite QSO Completed</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Natural Power (&ge;5 QSOs)</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Educational Activity</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Elected Official Visit</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Served Agency Visit</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Youth Element Bonus</span>
                  <span className="text-sky-400 font-mono font-bold">+20 pts / youth (max 100)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">GOTA Coach Bonus</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts (&ge;10 GOTA QSOs)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Web App Submission</span>
                  <span className="text-sky-400 font-mono font-bold">+50 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Social Media Promotion</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Safety Officer Bonus (Class A)</span>
                  <span className="text-sky-400 font-mono font-bold">+100 pts</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-200 font-medium">Site Responsibilities Checklist</span>
                  <span className="text-sky-400 font-mono font-bold">+50 pts (non-Class A)</span>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Analytics & PDF */}
          {activeTab === 'export' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-100 border-b border-slate-800 pb-2">Analytics & PDF Summary Reports</h3>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-sky-400" />
                    Operations Dashboard & Analytics
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    The <strong>Operations Dashboard</strong> tab provides real-time scoring totals with separate Main Station & GOTA point breakdowns, mode/band distribution charts, operator leaderboards, hourly rate velocity charts, interactive DX distance vector maps, and ARRL section sweep progress (86 sections).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                    <ListFilter className="w-4 h-4 text-sky-400" />
                    Interactive QSO Log Grid
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    Scroll to the bottom of the Operations Dashboard to inspect all loaded QSO records. Use quick filters for band (160m–6m, Satellite) and mode (CW, Phone, Digital), or search by callsign, operator, section, or frequency.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                  <h4 className="font-semibold text-slate-200 flex items-center gap-2">
                    <Printer className="w-4 h-4 text-amber-400" />
                    Printing & Saving PDF Submission Reports
                  </h4>
                  <p className="text-slate-400 text-[11px]">
                    1. Switch to <strong>Print Report Preview</strong> in the navigation bar to preview formatted multi-page summary report pages.<br />
                    2. Click the blue <strong>Download PDF Report</strong> button in the top header bar.<br />
                    3. Your browser's native print dialog will open where you can select <strong>Save as PDF</strong> or print physical copies for club records.
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

