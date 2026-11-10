import React, { useState } from 'react';
import { Home, MapPin, Scale, Share2, Check } from 'lucide-react';

export type NavTab = 'home' | 'map' | 'advisor';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onShareScenario?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onShareScenario,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShareClick = () => {
    if (onShareScenario) {
      onShareScenario();
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#F4EFE6]/95 backdrop-blur-md border-b border-[#E6DFD5] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Brand Mark & Simplified Subtitle */}
            <div
              className="flex items-center space-x-3 cursor-pointer select-none"
              onClick={() => onSelectTab('home')}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E08E6D] flex items-center justify-center text-white shadow-xs">
                <Home className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base sm:text-lg text-[#2A2320] tracking-tight">
                    DC Rental Intelligence
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#E08E6D]/15 text-[#C97251]">
                    2026 Edition
                  </span>
                </div>
                <p className="text-xs text-[#5A524C] hidden sm:block">
                  Washington D.C. Short-Term vs. Long-Term Rental Strategy
                </p>
              </div>
            </div>

            {/* Exactly 3 Navigation Tabs: Home Hub, Market Map, Pro/Con Advisor */}
            <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
              <button
                type="button"
                onClick={() => onSelectTab('home')}
                className={`px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 cursor-pointer ${
                  activeTab === 'home'
                    ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs border border-[#E6DFD5] font-semibold'
                    : 'text-[#5A524C] hover:text-[#2A2320] hover:bg-[#FAF7F2]/60'
                }`}
              >
                <Home className="w-4 h-4 text-[#E08E6D]" />
                <span>Home Hub</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('map')}
                className={`px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 cursor-pointer ${
                  activeTab === 'map'
                    ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs border border-[#E6DFD5] font-semibold'
                    : 'text-[#5A524C] hover:text-[#2A2320] hover:bg-[#FAF7F2]/60'
                }`}
              >
                <MapPin className="w-4 h-4 text-[#E08E6D]" />
                <span>Market Map</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('advisor')}
                className={`px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 cursor-pointer ${
                  activeTab === 'advisor'
                    ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs border border-[#E6DFD5] font-semibold'
                    : 'text-[#5A524C] hover:text-[#2A2320] hover:bg-[#FAF7F2]/60'
                }`}
              >
                <Scale className="w-4 h-4 text-[#4A6B5D]" />
                <span>Pro/Con Advisor</span>
              </button>
            </nav>

            {/* Clean Single-line Share Button (No wrapping) */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleShareClick}
                className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#FAF0EB] text-[#2A2320] border border-[#E6DFD5] text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer whitespace-nowrap active:scale-95"
                title="Share current scenario link"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#4A6B5D]" />
                    <span className="text-[#4A6B5D]">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-[#E08E6D]" />
                    <span>Share Scenario</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (Requirement 10: bottom tab bar on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-t border-[#E6DFD5] px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'home'
              ? 'text-[#E08E6D] font-bold'
              : 'text-[#5A524C] hover:text-[#2A2320]'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home Hub</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'map'
              ? 'text-[#E08E6D] font-bold'
              : 'text-[#5A524C] hover:text-[#2A2320]'
          }`}
        >
          <MapPin className="w-5 h-5 mb-0.5" />
          <span>Market Map</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('advisor')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl text-xs font-medium transition-all ${
            activeTab === 'advisor'
              ? 'text-[#4A6B5D] font-bold'
              : 'text-[#5A524C] hover:text-[#2A2320]'
          }`}
        >
          <Scale className="w-5 h-5 mb-0.5" />
          <span>Advisor</span>
        </button>
      </nav>
    </>
  );
};
