import React from 'react';
import { Home, BarChart3, MapPin, ShieldCheck, Sparkles } from 'lucide-react';

export type NavTab = 'calculator' | 'regression' | 'map' | 'regulations';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onQuickSimulate: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, onQuickSimulate }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#F4EFE6]/95 backdrop-blur-md border-b border-[#E6DFD5] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Mark & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('calculator')}>
            <div className="w-10 h-10 rounded-xl bg-[#E08E6D] flex items-center justify-center text-white shadow-sm shadow-[#E08E6D]/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-lg text-[#2A2320] tracking-tight">DC Rental Intelligence</span>
                <span className="text-[11px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#E08E6D]/15 text-[#C97251]">
                  2026 Edition
                </span>
              </div>
              <p className="text-xs text-[#746B63] hidden sm:block">
                Predictive Revenue · OLS Regression · DC Registry Comparables
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => onSelectTab('calculator')}
              className={`px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 ${
                activeTab === 'calculator'
                  ? 'bg-[#FAF7F2] text-[#2A2320] shadow-sm border border-[#E6DFD5]'
                  : 'text-[#746B63] hover:text-[#2A2320] hover:bg-[#FAF7F2]/60'
              }`}
            >
              <Home className="w-4 h-4 text-[#E08E6D]" />
              <span>Revenue Calculator</span>
            </button>

            <button
              onClick={() => onSelectTab('regression')}
              className={`px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 ${
                activeTab === 'regression'
                  ? 'bg-[#FAF7F2] text-[#2A2320] shadow-sm border border-[#E6DFD5]'
                  : 'text-[#746B63] hover:text-[#2A2320] hover:bg-[#FAF7F2]/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#4A6B5D]" />
              <span>Regression Studio</span>
            </button>

            <button
              onClick={() => onSelectTab('map')}
              className={`px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 ${
                activeTab === 'map'
                  ? 'bg-[#FAF7F2] text-[#2A2320] shadow-sm border border-[#E6DFD5]'
                  : 'text-[#746B63] hover:text-[#2A2320] hover:bg-[#FAF7F2]/60'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#E08E6D]" />
              <span>Market Map</span>
            </button>

            <button
              onClick={() => onSelectTab('regulations')}
              className={`px-3.5 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-colors flex items-center space-x-2 ${
                activeTab === 'regulations'
                  ? 'bg-[#FAF7F2] text-[#2A2320] shadow-sm border border-[#E6DFD5]'
                  : 'text-[#746B63] hover:text-[#2A2320] hover:bg-[#FAF7F2]/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#4A6B5D]" />
              <span>DC Regulations & Guide</span>
            </button>
          </nav>

          {/* Quick CTA */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onQuickSimulate}
              className="px-4 py-2 bg-[#E08E6D] hover:bg-[#C97251] text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Evaluate Property</span>
              <span className="sm:hidden">Evaluate</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2.5 border-t border-[#E6DFD5]/70 space-x-2 no-scrollbar">
          <button
            onClick={() => onSelectTab('calculator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'calculator' ? 'bg-[#FAF7F2] text-[#2A2320] border border-[#E6DFD5]' : 'text-[#746B63]'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => onSelectTab('regression')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'regression' ? 'bg-[#FAF7F2] text-[#2A2320] border border-[#E6DFD5]' : 'text-[#746B63]'
            }`}
          >
            Regression Studio
          </button>
          <button
            onClick={() => onSelectTab('map')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'map' ? 'bg-[#FAF7F2] text-[#2A2320] border border-[#E6DFD5]' : 'text-[#746B63]'
            }`}
          >
            Market Map
          </button>
          <button
            onClick={() => onSelectTab('regulations')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap ${
              activeTab === 'regulations' ? 'bg-[#FAF7F2] text-[#2A2320] border border-[#E6DFD5]' : 'text-[#746B63]'
            }`}
          >
            Regulations
          </button>
        </div>
      </div>
    </header>
  );
};
