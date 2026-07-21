import React, { useState } from 'react';
import { FieldDayConfig } from '../types';
import { Award, Users, Zap, ExternalLink, Search, Loader2 } from 'lucide-react';
import { lookupCallsign } from '../services/geo/callsignLookup';
import { formatGridInput, isValidGrid } from '../services/geo/maidenhead';
import { formatSectionInput, isValidSection } from '../services/geo/arrlSections';

interface ScoringFormProps {
  config: FieldDayConfig;
  onChange: (updated: FieldDayConfig) => void;
  uniqueOpCount: number;
  participationIndexPct: number;
}

export const ScoringForm: React.FC<ScoringFormProps> = ({
  config,
  onChange,
  uniqueOpCount,
  participationIndexPct,
}) => {
  const [isSearching, setIsSearching] = useState(false);

  const updateConfig = (field: keyof FieldDayConfig, value: any) => {
    onChange({ ...config, [field]: value });
  };

  const updateBonus = (field: keyof FieldDayConfig['bonuses'], value: any) => {
    onChange({
      ...config,
      bonuses: { ...config.bonuses, [field]: value },
    });
  };

  const handleCallsignLookup = async (call: string) => {
    if (!call || call.length < 3) return;
    setIsSearching(true);
    const info = await lookupCallsign(call);
    setIsSearching(false);

    if (info) {
      onChange({
        ...config,
        clubCall: info.callsign,
        clubName: info.name || config.clubName,
        homeGrid: info.grid || config.homeGrid,
        homeSection: info.section || config.homeSection,
      });
    }
  };

  const entryClassUpper = (config.entryClass || 'A').toUpperCase();
  const baseClassLetter = entryClassUpper.replace(/[^A-F]/g, '')[0] || 'A';
  const combinedClassCode = `${config.transmitters || 1}${baseClassLetter}`;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-slate-100">Operation & Entry Setup</h2>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://www.arrl.org/field-day#rules"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 transition flex items-center gap-1"
            title="Open official ARRL Field Day Rules in a new tab"
          >
            ARRL Rules 2026 <ExternalLink className="w-3 h-3 text-amber-400" />
          </a>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 font-mono">
            Class {combinedClassCode}
          </span>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Station Callsign <span className="text-rose-400 font-bold">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              required
              value={config.clubCall}
              onChange={(e) => updateConfig('clubCall', e.target.value.toUpperCase())}
              onBlur={(e) => handleCallsignLookup(e.target.value)}
              placeholder="e.g. W1AW"
              className={`w-full bg-slate-950 border rounded-md pl-3 pr-8 py-1.5 text-sm font-semibold text-slate-200 focus:outline-none ${
                !config.clubCall?.trim()
                  ? 'border-amber-500/60 focus:border-amber-500'
                  : 'border-slate-800 focus:border-sky-500'
              }`}
            />
            <button
              type="button"
              onClick={() => handleCallsignLookup(config.clubCall)}
              className="absolute right-2 text-slate-400 hover:text-sky-400 p-0.5 transition"
              title="Lookup Club Name & Home Grid from Callsign Database"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-sky-400" /> : <Search className="w-4 h-4" />}
            </button>
          </div>
          {!config.clubCall?.trim() && (
            <span className="text-[10px] text-amber-400/90 mt-1 block font-medium">
              Required for Field Day entry
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            GOTA Station Callsign <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={config.gotaCall || ''}
            onChange={(e) => updateConfig('gotaCall', e.target.value.toUpperCase())}
            placeholder="e.g. W1AW/GOTA or W1GOTA"
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-sm font-semibold text-amber-400 focus:outline-none focus:border-amber-500"
          />
          <span className="text-[10px] text-slate-500 mt-1 block font-medium">
            Displayed on ARRL submission report
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Club / Group Name <span className="text-rose-400 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            value={config.clubName}
            onChange={(e) => updateConfig('clubName', e.target.value)}
            placeholder="e.g. ARRL HQ"
            className={`w-full bg-slate-950 border rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none ${
              !config.clubName?.trim()
                ? 'border-amber-500/60 focus:border-amber-500'
                : 'border-slate-800 focus:border-sky-500'
            }`}
          />
          {!config.clubName?.trim() && (
            <span className="text-[10px] text-amber-400/90 mt-1 block font-medium">
              Required for Field Day entry
            </span>
          )}
        </div>

        {/* Entry Class Category Dropdown */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Entry Category <span className="text-rose-400 font-bold">*</span>
          </label>
          <select
            required
            value={baseClassLetter}
            onChange={(e) => updateConfig('entryClass', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-sm font-semibold text-amber-400 focus:outline-none focus:border-amber-500"
          >
            <option value="A">Class A - Club / Group Portable (3+ ops)</option>
            <option value="B">Class B - 1 or 2 Person Portable</option>
            <option value="C">Class C - Mobile</option>
            <option value="D">Class D - Home Station (Commercial AC Power)</option>
            <option value="E">Class E - Home Station (Emergency Power)</option>
            <option value="F">Class F - Emergency Operations Center (EOC)</option>
          </select>
        </div>

        {/* Transmitter Count Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Simultaneous Transmitters <span className="text-rose-400 font-bold">*</span>
          </label>
          <input
            type="number"
            required
            min={1}
            max={20}
            value={config.transmitters || ''}
            onChange={(e) => updateConfig('transmitters', parseInt(e.target.value, 10) || 1)}
            placeholder="e.g. 2"
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-sm font-semibold text-sky-400 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Power Output Level <span className="text-rose-400 font-bold">*</span>
          </label>
          <select
            required
            value={config.powerCategory}
            onChange={(e) => updateConfig('powerCategory', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="LOW_100W">Low Power (100W max, 2X Multiplier)</option>
            <option value="QRP_5W">QRP (5W max, 5X Multiplier)</option>
            <option value="HIGH_500W">High Power (Over 100W PEP, 1X Multiplier)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Power Source <span className="text-rose-400 font-bold">*</span>
          </label>
          <select
            required
            value={config.powerSource}
            onChange={(e) => updateConfig('powerSource', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="GENERATOR_MAINS">Generator / Commercial AC Mains</option>
            <option value="BATTERY_SOLAR">Battery / Solar / Alternate Natural Power</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Home Grid Locator <span className="text-rose-400 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={4}
            value={config.homeGrid || ''}
            onChange={(e) => updateConfig('homeGrid', formatGridInput(e.target.value))}
            placeholder="e.g. FN31"
            className={`w-full bg-slate-950 border rounded-md px-3 py-1.5 text-sm font-semibold text-sky-400 focus:outline-none ${
              !isValidGrid(config.homeGrid)
                ? 'border-rose-500/80 focus:border-rose-500'
                : 'border-slate-800 focus:border-sky-500'
            }`}
          />
          {!isValidGrid(config.homeGrid) && (
            <span className="text-[10px] text-rose-400 mt-1 block font-medium">
              Required XX## format (e.g. FN31)
            </span>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Home ARRL Section <span className="text-rose-400 font-bold">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={4}
            value={config.homeSection || ''}
            onChange={(e) => updateConfig('homeSection', formatSectionInput(e.target.value))}
            placeholder="e.g. CT"
            className={`w-full bg-slate-950 border rounded-md px-3 py-1.5 text-sm font-semibold text-slate-200 focus:outline-none ${
              !isValidSection(config.homeSection)
                ? 'border-rose-500/80 focus:border-rose-500'
                : 'border-slate-800 focus:border-sky-500'
            }`}
          />
          {!isValidSection(config.homeSection) && (
            <span className="text-[10px] text-rose-400 mt-1 block font-medium">
              Required valid section (e.g. CT, MDC, DX)
            </span>
          )}
        </div>
      </div>

      {/* Attendance & Participation Index Row */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Club Attendance & Participation</h3>
            <p className="text-xs text-slate-400">
              Enter total physical sign-ins to calculate the active operator participation percentage.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              On-Site Attendees <span className="text-rose-400 font-bold">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              value={config.totalParticipants || ''}
              onChange={(e) => updateConfig('totalParticipants', parseInt(e.target.value, 10) || 0)}
              placeholder="e.g. 25"
              className={`w-28 bg-slate-900 border rounded-md px-2.5 py-1 text-sm font-semibold text-emerald-400 focus:outline-none ${
                !config.totalParticipants || config.totalParticipants < 1
                  ? 'border-amber-500/60 focus:border-amber-500'
                  : 'border-slate-700 focus:border-emerald-500'
              }`}
            />
            {(!config.totalParticipants || config.totalParticipants < 1) && (
              <span className="text-[10px] text-amber-400/90 mt-1 block font-medium">
                Required
              </span>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-center">
            <div className="text-xs text-slate-400">Participation</div>
            <div className="text-base font-extrabold text-emerald-400 font-mono">
              {participationIndexPct}%
              <span className="text-[10px] font-normal text-slate-400 block">
                ({uniqueOpCount} ops / {Math.max(config.totalParticipants, uniqueOpCount)} attendees)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Class-Filtered Bonus Points Checklist */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">
              Bonus Points Checklist for Class {combinedClassCode}
            </h3>
          </div>
        </div>

        <div className="p-4 bg-slate-950/30 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Emergency Power (Classes A, B, C, E, F - NOT D) */}
            {baseClassLetter !== 'D' && (
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bonuses.emergencyPower}
                  onChange={(e) => updateBonus('emergencyPower', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">100% Emergency Power</span>
                  <span className="block text-[11px] text-slate-400">100 pts / TX (max 2,000 pts)</span>
                </div>
              </label>
            )}

            {/* 2. Media Publicity (All Classes) */}
            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bonuses.mediaPublicity}
                onChange={(e) => updateBonus('mediaPublicity', e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200">Media Publicity</span>
                <span className="block text-[11px] text-slate-400">100 pts (local TV/radio/paper)</span>
              </div>
            </label>

            {/* 3. Public Location (Classes A, B, F) */}
            {['A', 'B', 'F'].includes(baseClassLetter) && (
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bonuses.publicLocation}
                  onChange={(e) => updateBonus('publicLocation', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">Public Location</span>
                  <span className="block text-[11px] text-slate-400">100 pts (park, mall, public space)</span>
                </div>
              </label>
            )}

            {/* 4. Information Booth (Classes A, B, F) */}
            {['A', 'B', 'F'].includes(baseClassLetter) && (
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bonuses.infoBooth}
                  onChange={(e) => updateBonus('infoBooth', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">Information Booth / Table</span>
                  <span className="block text-[11px] text-slate-400">100 pts (visitor handouts)</span>
                </div>
              </label>
            )}

            {/* 5. Message to ARRL SM / SEC (All Classes) */}
            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bonuses.smSecMessage}
                onChange={(e) => updateBonus('smSecMessage', e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200">Message to ARRL SM / SEC</span>
                <span className="block text-[11px] text-slate-400">100 pts (originated over RF)</span>
              </div>
            </label>

            {/* 6. Message Handling NTS/ICS-213 (All Classes) */}
            <div className="flex flex-col text-xs text-slate-300">
              <span className="font-semibold text-slate-200 mb-1">NTS / ICS-213 Messages Handled</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={config.bonuses.ntsMessagesCount || ''}
                  onChange={(e) => updateBonus('ntsMessagesCount', parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200"
                />
                <span className="text-[11px] text-slate-400">10 pts / msg (max 100 pts)</span>
              </div>
            </div>

            {/* 7. W1AW Bulletin Copy (All Classes) */}
            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bonuses.w1awBulletin}
                onChange={(e) => updateBonus('w1awBulletin', e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200">W1AW Bulletin Copy</span>
                <span className="block text-[11px] text-slate-400">100 pts (copied over the air)</span>
              </div>
            </label>

            {/* 8. Satellite QSO (Classes A, B, F) */}
            {['A', 'B', 'F'].includes(baseClassLetter) && (
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bonuses.satelliteQso}
                  onChange={(e) => updateBonus('satelliteQso', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">Satellite QSO</span>
                  <span className="block text-[11px] text-slate-400">100 pts (auto-detected from log)</span>
                </div>
              </label>
            )}

            {/* 9. Natural Power (Classes A, B, E, F) */}
            {['A', 'B', 'E', 'F'].includes(baseClassLetter) && (
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bonuses.naturalPower}
                  onChange={(e) => updateBonus('naturalPower', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">Natural Power QSOs</span>
                  <span className="block text-[11px] text-slate-400">100 pts (&ge; 5 solar/wind QSOs)</span>
                </div>
              </label>
            )}

            {/* 10. Educational Activity (Classes A, D, E, F) */}
            {['A', 'D', 'E', 'F'].includes(baseClassLetter) && (
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bonuses.educationalActivity}
                  onChange={(e) => updateBonus('educationalActivity', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">Educational Activity</span>
                  <span className="block text-[11px] text-slate-400">100 pts</span>
                </div>
              </label>
            )}

            {/* 11. Elected Official Visit (All Classes) */}
            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bonuses.electedOfficialVisit}
                onChange={(e) => updateBonus('electedOfficialVisit', e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200">Elected Official Visit</span>
                <span className="block text-[11px] text-slate-400">100 pts (invited elected official)</span>
              </div>
            </label>

            {/* 12. Served Agency Visit (All Classes) */}
            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bonuses.agencyOfficialVisit}
                onChange={(e) => updateBonus('agencyOfficialVisit', e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200">Served Agency Visit</span>
                <span className="block text-[11px] text-slate-400">100 pts (Red Cross/ARES/FEMA)</span>
              </div>
            </label>

            {/* 13. Youth Element Bonus (All Classes) */}
            <div className="flex flex-col text-xs text-slate-300">
              <span className="font-semibold text-slate-200 mb-1">Youth Element Bonus (Age &le; 18)</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={config.bonuses.youthQsoCount || ''}
                  onChange={(e) => updateBonus('youthQsoCount', parseInt(e.target.value, 10) || 0)}
                  placeholder="0"
                  className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-slate-200"
                />
                <span className="text-[11px] text-slate-400">20 pts / youth with QSO (max 100 pts)</span>
              </div>
            </div>

            {/* 14. GOTA Coach Bonus (Classes A & F) */}
            {['A', 'F'].includes(baseClassLetter) && (
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bonuses.gotaCoach}
                  onChange={(e) => updateBonus('gotaCoach', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">GOTA Coach Bonus</span>
                  <span className="block text-[11px] text-slate-400">100 pts (&ge; 10 GOTA QSOs coached)</span>
                </div>
              </label>
            )}

            {/* 15. Web App Entry Submission (All Classes) */}
            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bonuses.webSubmission}
                onChange={(e) => updateBonus('webSubmission', e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200">Web App Entry Submission</span>
                <span className="block text-[11px] text-slate-400">50 pts (field-day.arrl.org)</span>
              </div>
            </label>

            {/* 16. Social Media Promotion (All Classes) */}
            <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.bonuses.socialMedia}
                onChange={(e) => updateBonus('socialMedia', e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-slate-200">Social Media Promotion</span>
                <span className="block text-[11px] text-slate-400">100 pts</span>
              </div>
            </label>

            {/* 17. Safety Officer Bonus (Class A ONLY) */}
            {baseClassLetter === 'A' && (
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bonuses.safetyOfficer}
                  onChange={(e) => updateBonus('safetyOfficer', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">Safety Officer Bonus (Class A)</span>
                  <span className="block text-[11px] text-slate-400">100 pts (signed safety checklist)</span>
                </div>
              </label>
            )}

            {/* 18. Site Responsibilities Checklist (Classes B, C, D, E, F) */}
            {baseClassLetter !== 'A' && (
              <label className="flex items-start gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.bonuses.siteResponsibilities}
                  onChange={(e) => updateBonus('siteResponsibilities', e.target.checked)}
                  className="mt-0.5 rounded border-slate-700 text-sky-500 focus:ring-0"
                />
                <div>
                  <span className="font-semibold text-slate-200">Site Responsibilities Bonus</span>
                  <span className="block text-[11px] text-slate-400">50 pts (signed checklist)</span>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>
    );
};
