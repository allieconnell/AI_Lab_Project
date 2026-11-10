import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  UserPropertyInput,
  RegressionModelResult,
  LongTermComparable,
} from '../types/rental';
import {
  CANONICAL_NEIGHBORHOOD_LIST,
  calculateCanonicalScenario,
  getCanonicalNeighborhood,
  CanonicalNeighborhood,
} from '../utils/canonicalMarketData';
import { RegressionModal } from './RegressionModal';
import {
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Scale,
  ExternalLink,
  Shield,
  Building,
  Check,
} from 'lucide-react';

interface HomeIntakeHubProps {
  propertyInput: UserPropertyInput;
  onChangeInput: (updated: Partial<UserPropertyInput>) => void;
  priceModel: RegressionModelResult | null;
  longTermListings: LongTermComparable[];
  onNavigateTab: (tab: 'home' | 'map' | 'advisor') => void;
}

export const HomeIntakeHub: React.FC<HomeIntakeHubProps> = ({
  propertyInput,
  onChangeInput,
  priceModel,
  onNavigateTab,
}) => {
  // Typeahead search state for Neighborhood
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Advanced inputs disclosure
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Regression modal state
  const [showRegressionModal, setShowRegressionModal] = useState(false);

  // Active Canonical Scenario calculation (Single Source of Truth)
  const scenario = useMemo(() => {
    return calculateCanonicalScenario({
      neighborhoodName: propertyInput.neighbourhood,
      bedrooms: propertyInput.bedrooms,
      spaceType: propertyInput.room_type,
      isPrimaryResidence: propertyInput.isPrimaryResidence,
      isHoaAllowed: propertyInput.hasHoaApproval,
    });
  }, [
    propertyInput.neighbourhood,
    propertyInput.bedrooms,
    propertyInput.room_type,
    propertyInput.isPrimaryResidence,
    propertyInput.hasHoaApproval,
  ]);

  // Sync ward if neighborhood changes
  useEffect(() => {
    if (scenario.ward !== propertyInput.ward) {
      onChangeInput({ ward: scenario.ward });
    }
  }, [scenario.ward, propertyInput.ward, onChangeInput]);

  // Filtered neighborhoods for typeahead
  const filteredNeighborhoods = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return CANONICAL_NEIGHBORHOOD_LIST;
    return CANONICAL_NEIGHBORHOOD_LIST.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.shortName.toLowerCase().includes(q) ||
        n.ward.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Close typeahead dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectNeighborhood = (n: CanonicalNeighborhood) => {
    onChangeInput({
      neighbourhood: n.name,
      ward: n.ward,
    });
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. THREE-STEP INPUTS CARD */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6DFD5] pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#2A2320] tracking-tight">
              Your Property Profile
            </h2>
            <p className="text-xs text-[#5A524C]">
              Configure your home parameters to instantly generate Washington D.C. rental intelligence.
            </p>
          </div>
          <div className="text-xs font-medium text-[#5A524C] flex items-center space-x-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-[#4A6B5D]" />
            <span>Live DC 2026 Regulations Calibrated</span>
          </div>
        </div>

        {/* The Ordered Inputs (Requirement 3):
            1. Neighborhood (Typeahead search)
            2. Primary Residence
            3. HOA/Lease Allowed
            4. Space Offered
            5. Bedrooms
            6. Advanced Disclosure
        */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* STEP 1: Neighborhood Typeahead (md:col-span-12 or 6) */}
          <div className="md:col-span-6 space-y-1.5 relative" ref={searchContainerRef}>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2320]">
              1. Neighborhood Corridor
            </label>
            <div className="relative">
              <div
                className="w-full bg-[#FFFFFF] border border-[#E6DFD5] hover:border-[#E08E6D] rounded-2xl px-3.5 py-2.5 flex items-center justify-between cursor-pointer transition-all shadow-xs"
                onClick={() => setIsSearchOpen(true)}
              >
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <Search className="w-4 h-4 text-[#E08E6D] shrink-0" />
                  <div className="truncate">
                    <span className="text-sm font-semibold text-[#2A2320] block truncate">
                      {scenario.neighborhood.shortName}
                    </span>
                    <span className="text-[11px] text-[#5A524C] block truncate">
                      {scenario.neighborhood.ward} · {scenario.neighborhood.name}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-[#5A524C] shrink-0" />
              </div>

              {/* Typeahead Dropdown */}
              {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl shadow-xl overflow-hidden max-h-72 flex flex-col animate-in fade-in slide-in-from-top-1">
                  <div className="p-2.5 border-b border-[#E6DFD5] bg-[#FFFFFF]">
                    <div className="flex items-center space-x-2 px-2 py-1 bg-[#F4EFE6] rounded-xl">
                      <Search className="w-4 h-4 text-[#5A524C]" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Type neighborhood name (e.g. Dupont, Petworth, Capitol Hill)..."
                        autoFocus
                        className="w-full bg-transparent text-xs text-[#2A2320] focus:outline-none placeholder-[#5A524C]"
                      />
                    </div>
                  </div>

                  <div className="overflow-y-auto divide-y divide-[#E6DFD5]/50 flex-1">
                    {filteredNeighborhoods.map((n) => {
                      const isSelected = n.name === propertyInput.neighbourhood;
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleSelectNeighborhood(n)}
                          className={`px-4 py-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#FAF0EB] text-[#2A2320] font-semibold'
                              : 'hover:bg-[#FFFFFF] text-[#4A423D]'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-[#2A2320] flex items-center space-x-1.5">
                              <span>{n.shortName}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E08E6D]/15 text-[#C97251] font-mono">
                                {n.ward}
                              </span>
                            </div>
                            <span className="text-[11px] text-[#5A524C] truncate block max-w-xs">
                              {n.name}
                            </span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#E08E6D]" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[11px] text-[#5A524C] flex items-center space-x-1">
              <span>Benchmark 1BR lease:</span>
              <strong className="text-[#2A2320] font-mono">
                ${scenario.neighborhood.baseMonthlyRent.toLocaleString()}/mo
              </strong>
            </span>
          </div>

          {/* STEP 2: Primary Residence */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2320]">
              2. Primary Residence?
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#E6DFD5]">
              <button
                type="button"
                onClick={() => onChangeInput({ isPrimaryResidence: true })}
                className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  propertyInput.isPrimaryResidence
                    ? 'bg-[#FAF0EB] text-[#C97251] border border-[#E08E6D]/40 shadow-xs'
                    : 'text-[#5A524C] hover:text-[#2A2320]'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onChangeInput({ isPrimaryResidence: false })}
                className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center leading-tight ${
                  !propertyInput.isPrimaryResidence
                    ? 'bg-[#2A2320] text-white shadow-xs'
                    : 'text-[#5A524C] hover:text-[#2A2320]'
                }`}
                title="Second home, pure investment property, or LLC owned"
              >
                No – Investment
              </button>
            </div>
            <span className="text-[11px] text-[#5A524C] block truncate">
              {propertyInput.isPrimaryResidence
                ? 'Homestead deduction qualifies'
                : 'Second home or investment'}
            </span>
          </div>

          {/* STEP 3: HOA / Lease Allowed */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2320]">
              3. HOA / Lease Allowed?
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#E6DFD5]">
              <button
                type="button"
                onClick={() => onChangeInput({ hasHoaApproval: true })}
                className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  propertyInput.hasHoaApproval
                    ? 'bg-[#FAF0EB] text-[#C97251] border border-[#E08E6D]/40 shadow-xs'
                    : 'text-[#5A524C] hover:text-[#2A2320]'
                }`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => onChangeInput({ hasHoaApproval: false })}
                className={`py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer text-center leading-tight ${
                  !propertyInput.hasHoaApproval
                    ? 'bg-[#2A2320] text-white shadow-xs'
                    : 'text-[#5A524C] hover:text-[#2A2320]'
                }`}
                title="Bylaws or master lease prohibit short-term rental"
              >
                No – Prohibited
              </button>
            </div>
            <span className="text-[11px] text-[#5A524C] block truncate">
              {propertyInput.hasHoaApproval ? 'Permitted by building rules' : 'Prohibited by HOA / lease'}
            </span>
          </div>

          {/* STEP 4: Space Offered */}
          <div className="md:col-span-6 space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2320]">
              4. Space Offered
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#E6DFD5]">
              <button
                type="button"
                onClick={() => onChangeInput({ room_type: 'Entire home/apt' })}
                className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  propertyInput.room_type === 'Entire home/apt'
                    ? 'bg-[#FAF0EB] text-[#C97251] border border-[#E08E6D]/40 shadow-xs'
                    : 'text-[#5A524C] hover:text-[#2A2320]'
                }`}
              >
                Entire Home / Apt
              </button>
              <button
                type="button"
                onClick={() => onChangeInput({ room_type: 'Private room' })}
                className={`py-2 px-3 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  propertyInput.room_type === 'Private room'
                    ? 'bg-[#FAF0EB] text-[#C97251] border border-[#E08E6D]/40 shadow-xs'
                    : 'text-[#5A524C] hover:text-[#2A2320]'
                }`}
              >
                Private Room
              </button>
            </div>
            <span className="text-[11px] text-[#5A524C] block">
              {propertyInput.room_type === 'Entire home/apt'
                ? 'Full private dwelling unit'
                : 'Dedicated room in hosted home'}
            </span>
          </div>

          {/* STEP 5: Bedrooms (spelling out "Studio" for 0) */}
          <div className="md:col-span-6 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#2A2320]">
                5. Bedrooms
              </label>
              <button
                type="button"
                onClick={() => setShowRegressionModal(true)}
                className="text-[11px] text-[#E08E6D] hover:underline flex items-center space-x-1 cursor-pointer font-medium"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>How we estimate nightly rate</span>
              </button>
            </div>

            <div className="flex space-x-1.5 bg-[#FFFFFF] p-1.5 rounded-2xl border border-[#E6DFD5]">
              {[0, 1, 2, 3, 4].map((beds) => {
                const label = beds === 0 ? 'Studio' : beds >= 4 ? '4+ Beds' : `${beds} Bed${beds > 1 ? 's' : ''}`;
                const isSelected = propertyInput.bedrooms === beds;
                return (
                  <button
                    key={beds}
                    type="button"
                    onClick={() =>
                      onChangeInput({
                        bedrooms: beds,
                        accommodates: Math.max(1, beds === 0 ? 2 : beds * 2),
                      })
                    }
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E08E6D] text-white shadow-xs'
                        : 'text-[#5A524C] hover:bg-[#F4EFE6] hover:text-[#2A2320]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#5A524C]">
              <span>
                Estimated Airbnb Rate:{' '}
                <strong className="text-[#E08E6D] font-mono text-xs">
                  ${scenario.adjustedNightlyRate}
                </strong>
                /night
              </span>
              <span>
                Source: <strong className="text-[#2A2320]">Open Airbnb Data (2025–2026)</strong>
              </span>
            </div>
          </div>
        </div>

        {/* STEP 6: Advanced Disclosure (Collapsible) */}
        <div className="pt-2 border-t border-[#E6DFD5]/70">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="text-xs font-semibold text-[#5A524C] hover:text-[#2A2320] flex items-center space-x-1.5 cursor-pointer py-1"
          >
            <span>Advanced Parameters (Guest Capacity, Reviews, Minimum Nights)</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-4 bg-[#FFFFFF] rounded-2xl border border-[#E6DFD5] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#5A524C] block">Guest Capacity</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={propertyInput.accommodates}
                    onChange={(e) => onChangeInput({ accommodates: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl px-3 py-1.5 text-xs text-[#2A2320] font-mono"
                  />
                  <span className="text-[#5A524C] text-[11px]">guests</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#5A524C] block">Reviews in Past 12 Months</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={propertyInput.reviews_ltm}
                    onChange={(e) => onChangeInput({ reviews_ltm: Math.max(0, parseInt(e.target.value) || 0) })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl px-3 py-1.5 text-xs text-[#2A2320] font-mono"
                  />
                  <span className="text-[#5A524C] text-[11px]">reviews</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#5A524C] block">Minimum Nights Rule</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={propertyInput.minimum_nights}
                    onChange={(e) => onChangeInput({ minimum_nights: Math.max(1, parseInt(e.target.value) || 1) })}
                    className="w-full bg-[#FAF7F2] border border-[#E6DFD5] rounded-xl px-3 py-1.5 text-xs text-[#2A2320] font-mono"
                  />
                  <span className="text-[#5A524C] text-[11px]">nights</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. STICKY VERDICT STRIP (Requirement 4)
          Updates live, sticky under the inputs as the user scrolls
      */}
      <div className="sticky top-18 z-30 bg-[#2A2320] text-white p-3.5 sm:p-4 rounded-2xl shadow-md border border-[#4A423D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white ${
              !scenario.isEligible
                ? 'bg-rose-600'
                : scenario.unhostedNetDelta > 0
                ? 'bg-[#4A6B5D]'
                : 'bg-[#E08E6D]'
            }`}
          >
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs sm:text-sm font-bold tracking-tight">
              {scenario.verdictSummary}
            </div>
            <div className="text-[11px] text-[#D8D0C5] flex items-center space-x-2">
              <span>{scenario.neighborhood.shortName} ({scenario.ward})</span>
              <span>·</span>
              <span>Lease: ${scenario.adjustedMonthlyRent.toLocaleString()}/mo</span>
              <span>·</span>
              <span>Airbnb: ${scenario.adjustedNightlyRate}/nt</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigateTab('advisor')}
          className="px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#FAF0EB] text-[#2A2320] text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 self-end sm:self-auto"
        >
          Ask Advisor Why →
        </button>
      </div>

      {/* 3. INELIGIBLE STATE BANNER (Requirement 3)
          If Primary Residence = No or HOA = Prohibited, show clear notice and HIDE profit comparison!
      */}
      {!scenario.isEligible ? (
        <div className="bg-[#FAF0EB] border-2 border-[#E08E6D] rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm animate-in fade-in">
          <div className="flex items-start space-x-3.5 text-[#C97251]">
            <XCircle className="w-7 h-7 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#2A2320]">
                Not Eligible for Short-Term Rental in Washington D.C.
              </h3>
              <p className="text-xs sm:text-sm text-[#4A423D] leading-relaxed">
                {scenario.ineligibilityReason}
              </p>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E6DFD5] space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#2A2320] flex items-center space-x-1.5">
              <Building className="w-4 h-4 text-[#4A6B5D]" />
              <span>Recommended Path: Long-Term Residential Lease</span>
            </h4>
            <p className="text-xs text-[#5A524C] leading-relaxed">
              Standard residential leasing (12+ months) in {scenario.neighborhood.shortName} is 100% legal, exempt from the 90-day short-term cap, and generates predictable monthly cashflow.
            </p>
            <div className="pt-2 flex items-center justify-between text-xs border-t border-[#E6DFD5]">
              <span className="text-[#5A524C]">Estimated Annual Gross Income:</span>
              <strong className="text-base font-bold font-mono text-[#4A6B5D]">
                ${scenario.longTerm.grossAnnual.toLocaleString()} / year
              </strong>
            </div>
          </div>
        </div>
      ) : (
        /* 4. THREE-COLUMN COMPARISON & BREAKEVEN BAR (Requirement 5)
            Visible only when eligible!
        */
        <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E6DFD5] pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#2A2320]">
                Three-Way Revenue Comparison: Gross & Net Projections
              </h3>
              <p className="text-xs text-[#5A524C]">
                Calculated after subtracting D.C. 14.95% Transient Lodging Tax (<abbr title="14.95% D.C. Transient Lodging Tax">TLT</abbr>), $138 annual <abbr title="Department of Licensing and Consumer Protection">DLCP</abbr> license fee, platform fees, cleaning, and maintenance.
              </p>
            </div>

            <span className="text-[11px] text-[#5A524C] self-start sm:self-auto font-mono">
              Dupont Circle & All Wards Synchronized
            </span>
          </div>

          {/* Side-by-side 3 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* COLUMN 1: Long-Term Lease */}
            <div className="bg-[#FFFFFF] border-2 border-[#4A6B5D]/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 relative">
              <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A6B5D] text-white">
                12-Month Tenancy
              </span>

              <div className="space-y-2 pt-1">
                <h4 className="text-sm font-bold text-[#2A2320]">Long-Term Lease</h4>
                <p className="text-xs text-[#5A524C] leading-snug">
                  Continuous 365-day rental to verified tenant under standard D.C. lease.
                </p>

                <div className="pt-2 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#5A524C]">Gross Revenue:</span>
                    <span className="text-base font-bold font-mono text-[#2A2320]">
                      ${scenario.longTerm.grossAnnual.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-[#5A524C]">
                    <span>Monthly Rate:</span>
                    <span className="font-mono">${scenario.longTerm.monthlyRent.toLocaleString()}/mo</span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-[#5A524C]">
                    <span>Maint. Reserve (8%):</span>
                    <span className="font-mono">-${scenario.longTerm.managementAndMaintCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A524C] block">
                  Net Annual Cashflow
                </span>
                <div className="text-xl font-bold font-mono text-[#4A6B5D]">
                  ${scenario.longTerm.netAnnual.toLocaleString()}
                </div>
                <span className="text-[10px] text-[#5A524C] block">
                  Zero night cap · No guest turnover
                </span>
              </div>
            </div>

            {/* COLUMN 2: Airbnb Unhosted (90 Nights Cap) */}
            <div className="bg-[#FFFFFF] border-2 border-[#E08E6D]/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 relative">
              <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C97251] text-white">
                90-Day Legal Cap
              </span>

              <div className="space-y-2 pt-1">
                <h4 className="text-sm font-bold text-[#2A2320]">Airbnb Unhosted</h4>
                <p className="text-xs text-[#5A524C] leading-snug">
                  Host is away. Strictly limited to 90 nights/year under D.C. Law 22-307.
                </p>

                <div className="pt-2 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#5A524C]">Gross Revenue (90d):</span>
                    <span className="text-base font-bold font-mono text-[#2A2320]">
                      ${scenario.airbnbUnhosted.grossAnnual.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-[#5A524C]">
                    <span>14.95% TLT + 3% Host Fee:</span>
                    <span className="font-mono">
                      -${(scenario.airbnbUnhosted.tltTax + scenario.airbnbUnhosted.platformFees).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-[#5A524C]">
                    <span>Cleaning & DLCP License:</span>
                    <span className="font-mono">
                      -${(scenario.airbnbUnhosted.cleaningAndOps + scenario.airbnbUnhosted.dlcpLicenseAnnual).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF0EB] rounded-xl border border-[#E08E6D]/40 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A524C] block">
                  Net Annual Cashflow
                </span>
                <div className="text-xl font-bold font-mono text-[#C97251]">
                  ${scenario.airbnbUnhosted.netAnnual.toLocaleString()}
                </div>
                <span className="text-[10px] text-[#5A524C] block">
                  {scenario.unhostedNetDelta > 0
                    ? `Lease leads by +$${scenario.unhostedNetDelta.toLocaleString()} net`
                    : `Unhosted leads by +$${Math.abs(scenario.unhostedNetDelta).toLocaleString()} net`}
                </span>
              </div>
            </div>

            {/* COLUMN 3: Airbnb Hosted (365 Days Allowed) */}
            <div className="bg-[#FFFFFF] border-2 border-[#E08E6D]/30 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 relative">
              <span className="absolute -top-3 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E08E6D] text-white">
                365-Day Exemption
              </span>

              <div className="space-y-2 pt-1">
                <h4 className="text-sm font-bold text-[#2A2320]">Airbnb Hosted</h4>
                <p className="text-xs text-[#5A524C] leading-snug">
                  Host is on-site overnight (English basement / ADU / guest suite).
                </p>

                <div className="pt-2 space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#5A524C]">Gross (210d typical):</span>
                    <span className="text-base font-bold font-mono text-[#2A2320]">
                      ${scenario.airbnbHosted.grossAnnual.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-[#5A524C]">
                    <span>14.95% TLT + 3% Host Fee:</span>
                    <span className="font-mono">
                      -${(scenario.airbnbHosted.tltTax + scenario.airbnbHosted.platformFees).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-xs text-[#5A524C]">
                    <span>Cleaning & DLCP License:</span>
                    <span className="font-mono">
                      -${(scenario.airbnbHosted.cleaningAndOps + scenario.airbnbHosted.dlcpLicenseAnnual).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E6DFD5] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A524C] block">
                  Net Annual Cashflow
                </span>
                <div className="text-xl font-bold font-mono text-[#E08E6D]">
                  ${scenario.airbnbHosted.netAnnual.toLocaleString()}
                </div>
                <span className="text-[10px] text-[#5A524C] block">
                  {scenario.hostedNetDelta > 0
                    ? `Hosted leads by +$${scenario.hostedNetDelta.toLocaleString()} net`
                    : `Lease leads by +$${Math.abs(scenario.hostedNetDelta).toLocaleString()} net`}
                </span>
              </div>
            </div>
          </div>

          {/* Visual Breakeven Bar (Requirement 5) */}
          <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E6DFD5] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
              <div>
                <span className="font-bold text-[#2A2320]">Breakeven Occupancy Gauge</span>
                <span className="text-[#5A524C] text-[11px] ml-2">
                  Nights required at ${scenario.adjustedNightlyRate}/nt to match a 1-year lease net
                </span>
              </div>
              <span className="font-mono font-bold text-sm text-[#2A2320]">
                {scenario.breakevenNights} Nights Needed
              </span>
            </div>

            {/* Gauge bar with ticks at 90 nights, breakeven, and 365 nights */}
            <div className="relative pt-6 pb-4">
              <div className="w-full bg-[#EFE9DE] h-3 rounded-full relative overflow-hidden">
                <div
                  className="bg-[#E08E6D] h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (scenario.breakevenNights / 365) * 100)}%`,
                  }}
                />
              </div>

              {/* Tick 1: 90 Nights (Unhosted Cap) */}
              <div
                className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                style={{ left: `${(90 / 365) * 100}%` }}
              >
                <span className="text-[10px] font-bold text-[#C97251] bg-[#FAF0EB] px-1.5 py-0.2 rounded border border-[#E08E6D]/30 whitespace-nowrap">
                  90d Unhosted Cap
                </span>
                <div className="w-0.5 h-3 bg-[#C97251] mt-1" />
              </div>

              {/* Tick 2: Breakeven Point */}
              <div
                className="absolute top-0 flex flex-col items-center -translate-x-1/2"
                style={{ left: `${Math.min(95, Math.max(5, (scenario.breakevenNights / 365) * 100))}%` }}
              >
                <span className="text-[10px] font-bold text-[#2A2320] bg-white px-1.5 py-0.2 rounded border border-[#2A2320] whitespace-nowrap shadow-xs">
                  Breakeven: {scenario.breakevenNights}d
                </span>
                <div className="w-0.5 h-3 bg-[#2A2320] mt-1" />
              </div>

              {/* Tick 3: 365 Nights */}
              <div className="absolute top-0 right-0 flex flex-col items-end">
                <span className="text-[10px] font-bold text-[#5A524C] whitespace-nowrap">
                  365d Max
                </span>
                <div className="w-0.5 h-3 bg-[#5A524C] mt-1 mr-1" />
              </div>
            </div>

            <p className="text-[11px] text-[#5A524C] leading-relaxed">
              {scenario.breakevenNights > 90
                ? `Because your breakeven point (${scenario.breakevenNights} nights) exceeds D.C.'s 90-day unhosted ceiling, an unhosted Airbnb mathematically underperforms a standard 12-month lease by $${scenario.unhostedNetDelta.toLocaleString()}/year net.`
                : `Your breakeven point is ${scenario.breakevenNights} nights, which is within the 90-day unhosted allowance.`}
            </p>
          </div>
        </div>
      )}

      {/* 5. DYNAMIC PROS & CONS CARD (Requirement 6) */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-[#E6DFD5] pb-3">
          <Scale className="w-5 h-5 text-[#E08E6D]" />
          <div>
            <h3 className="text-base font-bold text-[#2A2320]">
              Strategic Trade-offs for {scenario.neighborhood.shortName}
            </h3>
            <p className="text-xs text-[#5A524C]">
              Generated dynamically from your property profile and D.C. housing laws.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Lease Pros/Cons */}
          <div className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-3">
            <span className="font-bold text-[#4A6B5D] block text-sm">Long-Term Lease</span>
            <div className="space-y-1.5">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#375347] block">
                Pros
              </span>
              <ul className="space-y-1 text-[#2A2320]">
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>Guaranteed 12-month continuous rent</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>No 90-day statutory calendar cap</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>Tenant pays utility & internet bills</span>
                </li>
              </ul>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-[#E6DFD5]">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#C97251] block">
                Cons
              </span>
              <ul className="space-y-1 text-[#2A2320]">
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#C97251] font-bold shrink-0">✕</span>
                  <span>D.C. Landlord-Tenant eviction court (6–12 mos)</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#C97251] font-bold shrink-0">✕</span>
                  <span>TOPA tenant purchase notice rules upon sale</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Airbnb Unhosted Pros/Cons */}
          <div className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-3">
            <span className="font-bold text-[#C97251] block text-sm">Airbnb Unhosted</span>
            <div className="space-y-1.5">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#375347] block">
                Pros
              </span>
              <ul className="space-y-1 text-[#2A2320]">
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>Peak surge pricing (Cherry Blossom, Inauguration)</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>Full calendar flexibility to use home</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>Guests never acquire tenant possession rights</span>
                </li>
              </ul>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-[#E6DFD5]">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#C97251] block">
                Cons
              </span>
              <ul className="space-y-1 text-[#2A2320]">
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#C97251] font-bold shrink-0">✕</span>
                  <span>Strict 90-day unhosted annual ceiling</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#C97251] font-bold shrink-0">✕</span>
                  <span>14.95% D.C. Transient Lodging Tax (<abbr title="14.95% DC Transient Lodging Tax">TLT</abbr>)</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#C97251] font-bold shrink-0">✕</span>
                  <span>Turnover cleaning overhead & guest messaging</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Airbnb Hosted Pros/Cons */}
          <div className="p-4 rounded-2xl bg-white border border-[#E6DFD5] space-y-3">
            <span className="font-bold text-[#E08E6D] block text-sm">Airbnb Hosted (ADU)</span>
            <div className="space-y-1.5">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#375347] block">
                Pros
              </span>
              <ul className="space-y-1 text-[#2A2320]">
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>Exempt from 90-day cap (365 days permitted)</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>Highest earning upside in D.C. market</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>Host is on-site to resolve noise/issues quickly</span>
                </li>
              </ul>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-[#E6DFD5]">
              <span className="font-semibold text-[11px] uppercase tracking-wider text-[#C97251] block">
                Cons
              </span>
              <ul className="space-y-1 text-[#2A2320]">
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#C97251] font-bold shrink-0">✕</span>
                  <span>Host must physically reside on-site overnight</span>
                </li>
                <li className="flex items-start space-x-1.5">
                  <span className="text-[#C97251] font-bold shrink-0">✕</span>
                  <span>Shared building space & sound transmission</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 6. REGULATION ACTION CHECKLIST (Requirement 7)
          Neutral status icon, action list with external links, no pre-checked false completions
      */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-3xl p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center space-x-2.5 border-b border-[#E6DFD5] pb-3">
          <Shield className="w-5 h-5 text-[#5A524C]" />
          <div>
            <h3 className="text-base font-bold text-[#2A2320]">
              D.C. Short-Term Rental Compliance Action List
            </h3>
            <p className="text-xs text-[#5A524C]">
              Mandatory legal requirements under D.C. Law 22-307 before accepting your first guest.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <a
            href="https://dlcp.dc.gov/page/operating-short-term-rental-district-columbia"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-white border border-[#E6DFD5] hover:border-[#E08E6D] transition-all flex items-start space-x-3 group"
          >
            <div className="w-6 h-6 rounded-lg bg-[#FAF0EB] text-[#C97251] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              1
            </div>
            <div className="flex-1">
              <span className="font-bold text-[#2A2320] group-hover:text-[#E08E6D] flex items-center space-x-1">
                <span>Apply for DLCP Short-Term License</span>
                <ExternalLink className="w-3 h-3" />
              </span>
              <p className="text-[11px] text-[#5A524C] mt-0.5">
                Official DLCP regulations guide &amp; application via <span className="font-semibold text-[#2A2320]">boss.dc.gov</span> ($99 biennial fee).
              </p>
            </div>
          </a>

          <a
            href="https://mytax.dc.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-white border border-[#E6DFD5] hover:border-[#E08E6D] transition-all flex items-start space-x-3 group"
          >
            <div className="w-6 h-6 rounded-lg bg-[#FAF0EB] text-[#C97251] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              2
            </div>
            <div className="flex-1">
              <span className="font-bold text-[#2A2320] group-hover:text-[#E08E6D] flex items-center space-x-1">
                <span>Verify D.C. Homestead Deduction</span>
                <ExternalLink className="w-3 h-3" />
              </span>
              <p className="text-[11px] text-[#5A524C] mt-0.5">
                Confirm your property has an active primary residence homestead deduction with D.C. OTR.
              </p>
            </div>
          </a>

          <a
            href="https://otr.cfo.dc.gov/page/certificate-clean-hands"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-white border border-[#E6DFD5] hover:border-[#E08E6D] transition-all flex items-start space-x-3 group"
          >
            <div className="w-6 h-6 rounded-lg bg-[#FAF0EB] text-[#C97251] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              3
            </div>
            <div className="flex-1">
              <span className="font-bold text-[#2A2320] group-hover:text-[#E08E6D] flex items-center space-x-1">
                <span>Obtain Clean Hands Certificate</span>
                <ExternalLink className="w-3 h-3" />
              </span>
              <p className="text-[11px] text-[#5A524C] mt-0.5">
                Certify no outstanding taxes, fines, or fees exceeding $100 owed to District government.
              </p>
            </div>
          </a>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E6DFD5] flex items-start space-x-3">
            <div className="w-6 h-6 rounded-lg bg-[#FAF0EB] text-[#C97251] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
              4
            </div>
            <div className="flex-1">
              <span className="font-bold text-[#2A2320]">
                Install Safety Equipment & $500k Liability
              </span>
              <p className="text-[11px] text-[#5A524C] mt-0.5">
                Requires interconnected smoke/CO alarms, fire extinguisher, posted evacuation map, and $500k insurance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Regression Modal (Requirement 2) */}
      <RegressionModal
        isOpen={showRegressionModal}
        onClose={() => setShowRegressionModal(false)}
        model={priceModel}
        predictedRate={scenario.adjustedNightlyRate}
        neighborhood={scenario.neighborhood.name}
      />
    </div>
  );
};
