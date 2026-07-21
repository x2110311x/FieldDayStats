import React from 'react';
import { Github, Globe, Coffee } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-950 border-t border-slate-800/80 py-8 px-4 mt-12 text-slate-400 no-print">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: Author & Call sign credit */}
          <div className="text-sm text-slate-300">
            <div className="font-semibold text-slate-100">
              Created by{' '}
              <a
                href="https://ke8vxg.radio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-400 hover:underline font-bold"
              >
                Alex Sweeney (KE8VXG)
              </a>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Open source Field Day analytics & PDF report generator ·{' '}
              <a
                href="https://fdstats.ke8vxg.radio"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-sky-400 transition font-mono"
              >
                fdstats.ke8vxg.radio
              </a>
            </p>
          </div>

          {/* Right: Quick Links & Ko-fi Support */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* GitHub Repo */}
            <a
              href="https://github.com/x2110311x/FieldDayStats"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 hover:border-slate-700 transition shadow-sm"
            >
              <Github className="w-4 h-4 text-slate-300" />
              <span>GitHub</span>
            </a>

            {/* Main Website */}
            <a
              href="https://ke8vxg.radio"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-800 hover:border-slate-700 transition shadow-sm"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              <span>ke8vxg.radio</span>
            </a>

            {/* Ko-fi Support Button */}
            <a
              href="https://ko-fi.com/alexsweeney"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block transition hover:opacity-90 hover:scale-105 active:scale-95"
            >
              <img
                src="https://storage.ko-fi.com/cdn/brandasset/v2/support_me_on_kofi_red.png"
                alt="Support me on Ko-Fi"
                className="h-9 w-auto"
              />
            </a>
          </div>
        </div>

        {/* ARRL Non-Affiliation Disclaimer */}
        <div className="pt-4 border-t border-slate-900 text-center text-xs text-slate-500">
          This community project is independent and is not affiliated with, sponsored by, or endorsed by the ARRL (American Radio Relay League).
        </div>
      </div>
    </footer>
  );
};
