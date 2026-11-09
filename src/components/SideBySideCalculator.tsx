import React from 'react';
import { UserPropertyInput, RegressionModelResult, LongTermComparable } from '../types/rental';
import { calculateRevenueComparison } from '../utils/comparisonEngine';
import { predictPropertyMetric } from '../utils/regression';
import { NEIGHBORHOOD_BOUNDARIES, getNeighborhoodBoundary } from '../utils/dcNeighborhoodPolygons';
import { ArrowUpRight, ArrowDownRight, AlertCircle, Info, Calendar, Sparkles, Building2 } from 'lucide-react';

interface SideBySideCalculatorProps {
  propertyInput: UserPropertyInput;
  onChangeInput: (updated: Partial<UserPropertyInput>) => void;
  priceModel: RegressionModelResult;
  longTermListings: LongTermComparable[];
  onOpenRegulations: () => void;
  onOpenRegression: () => void;
}

export const SideBySideCalculator: React.FC<SideBySideCalculatorProps> = ({
  propertyInput,
  onChangeInput,
  priceModel,
  longTermListings,
  onOpenRegulations,
  onOpenRegression,
}) => {
  // Compute predicted nightly price using fitted OLS model
  const predictedNightlyRate = predictPropertyMetric(propertyInput, priceModel);

  // Run financial comparison
  const comparison = calculateRevenueComparison(
    propertyInput,
    predictedNightlyRate,
    longTermListings
  );

  const isAirbnbAhead = comparison.higherEarningOption === 'airbnb';

  const dcWards = [
    'Ward 1',
    'Ward 2',
    'Ward 3',
    'Ward 4',
    'Ward 5',
    'Ward 6',
    'Ward 7',
    'Ward 8',
  ];

  const dcNeighborhoods = [
    'Dupont Circle, Connecticut Avenue',
    'Capitol Hill',
    'Georgetown, Burleith',
    'Shaw, Logan Circle',
    'Navy Yard, Near Southeast',
    'Kalorama Heights, Adams Morgan, Lanier Heights',
    'Columbia Heights, Mt. Pleasant, Pleasant Plains',
    'Brightwood Park, Crestwood, Petworth',
    'Downtown, Foggy Bottom, GWU',
    'NoMa, Near Northeast',
    'Woodley Park, Cleveland Park, Van Ness',
    'Southwest Waterfront',
    'Brookland, Brentwood, Langdon',
    'Congress Heights, Bellevue, Washington Highlands',
    'Deanwood, Burrville, Grant Park',
    'Takoma, Manor Park',
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Notice */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#E08E6D] mb-1">
              <span>Empirical Revenue Comparison</span>
              <span>·</span>
              <span>Washington D.C.</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#2A2320] tracking-tight">
              Short-Term Airbnb vs. Long-Term Lease
            </h1>
            <p className="text-sm text-[#746B63] mt-1 max-w-2xl leading-relaxed">
              Estimate your nightly rate using multiple linear regression trained on 500+ verified DC listings and compare your gross earnings directly with registered DC residential lease data.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-stretch md:self-auto">
            <button
              onClick={onOpenRegression}
              className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-[#E6DFD5] bg-[#F4EFE6] hover:bg-[#EFE9DE] text-xs font-medium text-[#2A2320] transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
            >
              <span>Model Factors: {priceModel.selectedFeatures.length} active</span>
              <span className="text-[#4A6B5D] font-mono">({Math.round(priceModel.rSquared * 100)}% R²)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Property Builder */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-4">
              <h2 className="text-lg font-semibold text-[#2A2320] flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#E08E6D]" />
                <span>Property Parameters</span>
              </h2>
              <span className="text-xs text-[#746B63]">Real-time Model Inputs</span>
            </div>

            {/* Neighborhood / Area */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-[#746B63] uppercase tracking-wider">
                  Neighborhood / Corridor
                </label>
                <span className="text-xs font-medium text-[#4A6B5D] bg-[#4A6B5D]/10 px-2 py-0.5 rounded-full">
                  {propertyInput.ward} Lease Baseline
                </span>
              </div>
              <select
                value={propertyInput.neighbourhood}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const boundary = getNeighborhoodBoundary(selectedName);
                  onChangeInput({
                    neighbourhood: selectedName,
                    ward: boundary.ward,
                  });
                }}
                className="w-full bg-[#FDFBF7] border border-[#E6DFD5] rounded-xl px-3.5 py-2.5 text-sm text-[#2A2320] focus:outline-none focus:ring-2 focus:ring-[#E08E6D]/40 transition-all cursor-pointer font-medium"
              >
                {Object.keys(NEIGHBORHOOD_BOUNDARIES).map((n) => (
                  <option key={n} value={n}>
                    {NEIGHBORHOOD_BOUNDARIES[n].shortName} — {NEIGHBORHOOD_BOUNDARIES[n].ward}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-[#746B63] mt-1.5">
                Automatically loads local long-term lease comparables from the D.C. Rent Registry for {propertyInput.ward}.
              </p>
            </div>

            {/* Room Type */}
            <div>
              <label className="block text-xs font-semibold text-[#746B63] uppercase tracking-wider mb-1.5">
                Room Type
              </label>
              <select
                value={propertyInput.room_type}
                onChange={(e) => onChangeInput({ room_type: e.target.value as any })}
                className="w-full bg-[#FDFBF7] border border-[#E6DFD5] rounded-xl px-3.5 py-2.5 text-sm text-[#2A2320] focus:outline-none focus:ring-2 focus:ring-[#E08E6D]/40 transition-all cursor-pointer"
              >
                <option value="Entire home/apt">Entire Home / Apt</option>
                <option value="Private room">Private Room</option>
              </select>
            </div>

            {/* Bedrooms & Accommodates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-[#746B63] uppercase tracking-wider">
                    Bedrooms
                  </label>
                  <span className="text-xs font-mono font-medium text-[#2A2320]">
                    {propertyInput.bedrooms === 0 ? 'Studio' : `${propertyInput.bedrooms} BR`}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={0}
                    max={5}
                    step={1}
                    value={propertyInput.bedrooms}
                    onChange={(e) => onChangeInput({ bedrooms: parseInt(e.target.value) })}
                    className="w-full accent-[#E08E6D] cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-[#746B63] uppercase tracking-wider">
                    Guest Capacity
                  </label>
                  <span className="text-xs font-mono font-medium text-[#2A2320]">
                    {propertyInput.accommodates} Guests
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={1}
                    max={10}
                    step={1}
                    value={propertyInput.accommodates}
                    onChange={(e) => onChangeInput({ accommodates: parseInt(e.target.value) })}
                    className="w-full accent-[#E08E6D] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Hosting Arrangement (Hosted vs Unhosted) */}
            <div className="pt-2 border-t border-[#E6DFD5]/80 space-y-3">
              <label className="block text-xs font-semibold text-[#746B63] uppercase tracking-wider">
                Hosting Arrangement (DC Legal Endorsement)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onChangeInput({ isHosted: false })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    !propertyInput.isHosted
                      ? 'border-[#E08E6D] bg-[#E08E6D]/10 text-[#2A2320] ring-1 ring-[#E08E6D]'
                      : 'border-[#E6DFD5] bg-[#FDFBF7] text-[#746B63] hover:border-[#D9CEBE]'
                  }`}
                >
                  <div className="font-medium text-xs text-[#2A2320]">Unhosted (Vacation)</div>
                  <div className="text-[11px] text-[#746B63] mt-0.5">
                    Subject to 90-day DC annual cap
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onChangeInput({ isHosted: true })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    propertyInput.isHosted
                      ? 'border-[#4A6B5D] bg-[#4A6B5D]/10 text-[#2A2320] ring-1 ring-[#4A6B5D]'
                      : 'border-[#E6DFD5] bg-[#FDFBF7] text-[#746B63] hover:border-[#D9CEBE]'
                  }`}
                >
                  <div className="font-medium text-xs text-[#2A2320]">Hosted (Owner Present)</div>
                  <div className="text-[11px] text-[#746B63] mt-0.5">
                    Unlimited days (up to 365)
                  </div>
                </button>
              </div>

              {!propertyInput.isHosted && (
                <div className="p-3 rounded-xl bg-[#FAF0EB] border border-[#E08E6D]/30 flex items-start space-x-2 text-xs text-[#746B63]">
                  <AlertCircle className="w-4 h-4 text-[#E08E6D] shrink-0 mt-0.5" />
                  <span>
                    Under the <strong className="text-[#2A2320]">DC Short-Term Rental Act of 2026</strong>, unhosted vacation rentals are legally capped at <strong className="text-[#2A2320]">90 days per calendar year</strong> unless a DLCP cumulative endorsement exemption is granted.
                  </span>
                </div>
              )}
            </div>

            {/* Occupancy Days Slider */}
            <div className="pt-2 border-t border-[#E6DFD5]/80">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <label className="text-xs font-semibold text-[#746B63] uppercase tracking-wider block">
                    Target Booked Nights / Year
                  </label>
                  <span className="text-[11px] text-[#746B63]">
                    {propertyInput.isHosted ? 'Custom host calendar capacity' : 'Capped at 90 days for unhosted'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-mono font-semibold text-[#2A2320]">
                    {comparison.airbnb.effectiveNights} nights
                  </span>
                  <span className="text-xs text-[#746B63] block">
                    ({Math.round((comparison.airbnb.effectiveNights / 365) * 100)}% occupancy)
                  </span>
                </div>
              </div>

              <input
                type="range"
                min={10}
                max={propertyInput.isHosted ? 330 : 90}
                step={5}
                value={comparison.airbnb.effectiveNights}
                onChange={(e) => onChangeInput({ customOccupancyNights: parseInt(e.target.value) })}
                className="w-full accent-[#E08E6D] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#746B63] mt-1 font-mono">
                <span>10 nights</span>
                <span>{propertyInput.isHosted ? '180 nights (avg)' : '90 nights (max unhosted)'}</span>
                <span>{propertyInput.isHosted ? '330 nights' : '90 nights'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Comparative Revenue Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Comparison Hero Card */}
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-[#746B63] uppercase tracking-wider">
                  Side-By-Side Projection
                </span>
                <h3 className="text-xl font-semibold text-[#2A2320]">Gross Annual Revenue Potential</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#746B63] block">Annual Revenue Delta</span>
                <span
                  className={`text-lg font-bold font-mono inline-flex items-center space-x-1 ${
                    isAirbnbAhead ? 'text-[#4A6B5D]' : 'text-[#E08E6D]'
                  }`}
                >
                  {isAirbnbAhead ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                  <span>
                    {isAirbnbAhead ? '+' : ''}${Math.abs(comparison.deltaGrossAnnual).toLocaleString()}
                  </span>
                  <span className="text-xs font-medium font-sans">
                    ({isAirbnbAhead ? '+' : ''}{comparison.deltaPercent}%)
                  </span>
                </span>
              </div>
            </div>

            {/* Twin Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Short-Term Airbnb Box */}
              <div className="rounded-xl border border-[#E08E6D]/40 bg-[#FAF0EB]/60 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-semibold text-[#C97251] uppercase tracking-wider block">
                      Short-Term Rental
                    </span>
                    <h4 className="text-base font-semibold text-[#2A2320]">Airbnb Projection</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#E08E6D]/20 text-[#C97251]">
                    OLS Regression
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold font-mono text-[#2A2320]">
                      ${comparison.airbnb.grossAnnualRevenue.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#746B63]">/ gross year</span>
                  </div>
                  <div className="text-xs text-[#746B63] mt-1 flex items-center space-x-2">
                    <span className="font-medium text-[#2A2320]">${comparison.airbnb.predictedNightlyRate}/night</span>
                    <span>·</span>
                    <span>{comparison.airbnb.effectiveNights} nights booked</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#E6DFD5]/80 text-xs">
                  <div className="flex justify-between text-[#746B63]">
                    <span>DC Transient Lodging Tax (14.95%)</span>
                    <span className="font-mono text-[#2A2320]">
                      -${Math.round(comparison.airbnb.grossAnnualRevenue * 0.1495).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#746B63]">
                    <span>Cleaning & Platform (~15%)</span>
                    <span className="font-mono text-[#2A2320]">
                      -${Math.round(comparison.airbnb.grossAnnualRevenue * 0.15).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E6DFD5]/60 font-medium">
                    <span className="text-[#2A2320]">Estimated Net Take-Home</span>
                    <span className="font-mono text-[#4A6B5D] font-bold">
                      ~${comparison.airbnb.netEstimate.toLocaleString()}/yr
                    </span>
                  </div>
                </div>
              </div>

              {/* Long-Term Lease Box */}
              <div className="rounded-xl border border-[#4A6B5D]/40 bg-[#EEF3F0]/60 p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[11px] font-semibold text-[#4A6B5D] uppercase tracking-wider block">
                      Long-Term Lease
                    </span>
                    <h4 className="text-base font-semibold text-[#2A2320]">DC Registry Baseline</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#4A6B5D]/20 text-[#375347]">
                    {propertyInput.ward} Baseline
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold font-mono text-[#2A2320]">
                      ${comparison.longTerm.grossAnnualRevenue.toLocaleString()}
                    </span>
                    <span className="text-xs text-[#746B63]">/ gross year</span>
                  </div>
                  <div className="text-xs text-[#746B63] mt-1 flex items-center space-x-2">
                    <span className="font-medium text-[#2A2320]">
                      ${comparison.longTerm.medianMonthlyRent.toLocaleString()}/month
                    </span>
                    <span>·</span>
                    <span>12 months full lease</span>
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#E6DFD5]/80 text-xs">
                  <div className="flex justify-between text-[#746B63]">
                    <span>Property Management (~8%)</span>
                    <span className="font-mono text-[#2A2320]">
                      -${Math.round(comparison.longTerm.grossAnnualRevenue * 0.08).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#746B63]">
                    <span>Tenant Turnover & Maintenance</span>
                    <span className="font-mono text-[#2A2320]">
                      -${Math.round(comparison.longTerm.grossAnnualRevenue * 0.02).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E6DFD5]/60 font-medium">
                    <span className="text-[#2A2320]">Estimated Net Take-Home</span>
                    <span className="font-mono text-[#4A6B5D] font-bold">
                      ~${comparison.longTerm.netEstimate.toLocaleString()}/yr
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Break-Even Insight Box */}
            <div className="mt-6 p-4 rounded-xl bg-[#F4EFE6] border border-[#E6DFD5] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-[#4A6B5D]/15 text-[#4A6B5D] flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold text-[#2A2320] block">
                    Break-Even Occupancy: {comparison.breakEvenNights} nights/year
                  </span>
                  <span className="text-[#746B63]">
                    At ${predictedNightlyRate}/night, you need at least {comparison.breakEvenNights} booked nights on Airbnb to equal a 12-month lease.
                  </span>
                </div>
              </div>

              {!propertyInput.isHosted && comparison.breakEvenNights > 90 && (
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF0EB] text-[#C97251] font-medium border border-[#E08E6D]/30 shrink-0">
                  Exceeds 90-day unhosted cap
                </span>
              )}
            </div>
          </div>

          {/* Quick Regulatory Snapshot Card */}
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#4A6B5D]/15 text-[#4A6B5D] flex items-center justify-center shrink-0 mt-0.5">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#2A2320]">
                  Are you legally allowed to host in DC?
                </h4>
                <p className="text-xs text-[#746B63] mt-0.5 leading-relaxed">
                  Verify primary residence status, DLCP Short-Term Rental endorsement, and building lease/condo restrictions before listing.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenRegulations}
              className="px-4 py-2 bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#2A2320] border border-[#E6DFD5] text-xs font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              Check Regulations & Requirements →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
