import React from 'react';
import { Heart, X, ExternalLink, Coffee } from 'lucide-react';
import { APP_NAME } from '../constants';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Support {APP_NAME}
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </h2>
              <p className="text-xs text-slate-400">
                Hope your report printed successfully!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            aria-label="Close donation modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Informational Message */}
        <p className="text-xs text-slate-300 leading-relaxed flex-shrink-0">
          {APP_NAME} is 100% free and open-source for the amateur radio community. If this app helped generate your club's report, consider leaving a tip on Ko-fi to support continuous development and hosting!
        </p>

        {/* Embedded Ko-Fi Tip Panel */}
        <div className="flex-1 min-h-[400px] overflow-hidden rounded-xl border border-slate-800 bg-white/5 relative">
          <iframe
            id="kofiframe"
            src="https://ko-fi.com/alexsweeney/?hidefeed=true&widget=true&embed=true&preview=true"
            style={{ border: 'none', width: '100%', height: '100%', minHeight: '440px', padding: '4px', background: '#f9f9f9' }}
            title="alexsweeney"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-shrink-0 gap-3">
          <a
            href="https://ko-fi.com/alexsweeney"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:underline"
          >
            <span>Open Ko-fi in new window</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
