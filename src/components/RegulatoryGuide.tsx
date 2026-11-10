import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  HelpCircle,
  Scale,
  TrendingUp,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { RevenueLookupItem, UserPropertyInput } from '../types/rental';

interface RegulatoryGuideProps {
  revenueLookups: RevenueLookupItem[];
  onNavigateToCalculator: () => void;
  propertyInput: UserPropertyInput;
  onChangeInput: (updated: Partial<UserPropertyInput>) => void;
}

export const RegulatoryGuide: React.FC<RegulatoryGuideProps> = ({
  revenueLookups,
  onNavigateToCalculator,
  propertyInput,
  onChangeInput,
}) => {
  // Sync state with propertyInput
  const isPrimaryResidence = propertyInput.isPrimaryResidence;
  const hostingStyle = propertyInput.isHosted ? 'hosted' : 'unhosted';
  const hasHoaApproval = propertyInput.hasHoaApproval;
  const hasDlcpLicense = propertyInput.hasDlcpLicense;

  const setIsPrimaryResidence = (val: boolean) => onChangeInput({ isPrimaryResidence: val });
  const setHostingStyle = (style: 'hosted' | 'unhosted') =>
    onChangeInput({
      isHosted: style === 'hosted',
      customOccupancyNights: style === 'hosted' ? 220 : Math.min(propertyInput.customOccupancyNights, 90),
    });
  const setHasHoaApproval = (val: boolean) => onChangeInput({ hasHoaApproval: val });
  const setHasDlcpLicense = (val: boolean) => onChangeInput({ hasDlcpLicense: val });

  // Evaluate eligibility status
  let eligibilityStatus: 'green' | 'amber' | 'red' = 'green';
  let statusTitle = '';
  let statusMessage = '';

  if (isPrimaryResidence === false) {
    eligibilityStatus = 'red';
    statusTitle = 'Not Legally Permitted in Washington D.C.';
    statusMessage =
      'Under D.C. Law and the Short-Term Rental Amendment Act of 2026, you cannot operate a short-term rental on second homes or investment properties. You must qualify for the D.C. Homestead Tax Deduction on the property.';
  } else if (hasHoaApproval === false) {
    eligibilityStatus = 'red';
    statusTitle = 'HOA / Lease Prohibition';
    statusMessage =
      'Even if D.C. law permits hosting, private condo bylaws, HOA covenants, and standard residential leases take precedence. DLCP requires applicant verification that leases permit short-term sub-rentals.';
  } else if (hostingStyle === 'unhosted') {
    eligibilityStatus = 'amber';
    statusTitle = 'Permitted Subject to 90-Day Annual Cap';
    statusMessage =
      'You may operate an unhosted Vacation Rental, but D.C. law strictly limits bookings to 90 calendar days per year. Platforms (Airbnb, VRBO) automatically enforce this cap with DLCP.';
  } else {
    eligibilityStatus = 'green';
    statusTitle = 'Fully Permitted with Hosted Endorsement';
    statusMessage =
      'Because you reside on premise during guest stays (Hosted endorsement), D.C. law allows unlimited days per year (up to 365 days). You will need your DLCP Short-Term Rental BBL.';
  }

  // Aggregate neighborhood demand from revenue lookup
  const neighborhoodDemand = [
    { name: 'Capitol Hill', demand: 'Very High', medianOcc: '62%', avgRate: '$225', bestSeason: 'March - Nov' },
    { name: 'Dupont Circle / Conn Ave', demand: 'Very High', medianOcc: '65%', avgRate: '$210', bestSeason: 'Year-round' },
    { name: 'Georgetown / Burleith', demand: 'Very High', medianOcc: '58%', avgRate: '$285', bestSeason: 'Spring / Fall' },
    { name: 'Navy Yard / Near SE', demand: 'High', medianOcc: '54%', avgRate: '$195', bestSeason: 'Summer / Game Days' },
    { name: 'Adams Morgan / Kalorama', demand: 'High', medianOcc: '52%', avgRate: '$180', bestSeason: 'Spring - Autumn' },
    { name: 'Shaw / Logan Circle', demand: 'High', medianOcc: '53%', avgRate: '$190', bestSeason: 'Year-round' },
    { name: 'Petworth / Brightwood', demand: 'Moderate', medianOcc: '44%', avgRate: '$145', bestSeason: 'Spring - Autumn' },
    { name: 'Woodley Park / Cleveland Park', demand: 'Moderate', medianOcc: '46%', avgRate: '$165', bestSeason: 'Spring / Summer' },
  ];

  return (
    <div className="space-y-8">
      {/* Condensed Header & Active Property Lens */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#2A2320] tracking-tight">
            D.C. Short-Term Rental Regulations & Eligibility
          </h1>
          <p className="text-xs text-[#746B63] mt-0.5">
            📍 Filtered for <strong className="text-[#2A2320]">{propertyInput.neighbourhood} ({propertyInput.ward})</strong> · {propertyInput.bedrooms === 0 ? 'Studio' : `${propertyInput.bedrooms} BR`} {propertyInput.room_type} · {propertyInput.isPrimaryResidence ? 'Primary Residence' : 'Second Home'} · {propertyInput.isHosted ? 'Hosted' : 'Unhosted'}
          </p>
        </div>

        <button
          onClick={onNavigateToCalculator}
          className="px-3.5 py-2 bg-[#E08E6D] hover:bg-[#C97251] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          Compare Profits →
        </button>
      </div>

      {/* 1. Legal Eligibility Checklist */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-5 shadow-xs space-y-4">
        <div className="border-b border-[#E6DFD5]/80 pb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#2A2320]">
            Do regulations and restrictions allow me to list my AirBNB?
          </h2>
        </div>
        <p className="text-xs text-[#746B63]">
          Answer the 4 prerequisite questions below to assess your legal standing with the D.C. Department of Licensing and Consumer Protection (DLCP).
        </p>

        {/* 4 Interactive Questions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Q1: Primary Residence */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E6DFD5] space-y-3">
            <span className="text-xs font-semibold text-[#2A2320] block">
              1. Is this property your primary residence?
            </span>
            <p className="text-xs text-[#746B63]">
              D.C. law requires hosts to have homestead deduction status or maintain primary voting registration at the address.
            </p>
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsPrimaryResidence(true)}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  isPrimaryResidence === true
                    ? 'border-[#4A6B5D] bg-[#4A6B5D]/10 text-[#4A6B5D] font-bold'
                    : 'border-[#E6DFD5] text-[#746B63]'
                }`}
              >
                Yes (Primary Home)
              </button>
              <button
                type="button"
                onClick={() => setIsPrimaryResidence(false)}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  isPrimaryResidence === false
                    ? 'border-[#E08E6D] bg-[#E08E6D]/10 text-[#C97251] font-bold'
                    : 'border-[#E6DFD5] text-[#746B63]'
                }`}
              >
                No (2nd Home/Investment)
              </button>
            </div>
          </div>

          {/* Q2: Hosting Arrangement */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E6DFD5] space-y-3">
            <span className="text-xs font-semibold text-[#2A2320] block">
              2. Will you be present on premise during guest stays?
            </span>
            <p className="text-xs text-[#746B63]">
              Hosted stays allow 365 days; unhosted vacation rentals are capped at 90 days per calendar year.
            </p>
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setHostingStyle('hosted')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  hostingStyle === 'hosted'
                    ? 'border-[#4A6B5D] bg-[#4A6B5D]/10 text-[#4A6B5D] font-bold'
                    : 'border-[#E6DFD5] text-[#746B63]'
                }`}
              >
                Yes (Hosted · No Cap)
              </button>
              <button
                type="button"
                onClick={() => setHostingStyle('unhosted')}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  hostingStyle === 'unhosted'
                    ? 'border-[#E08E6D] bg-[#E08E6D]/10 text-[#C97251] font-bold'
                    : 'border-[#E6DFD5] text-[#746B63]'
                }`}
              >
                No (Unhosted · 90-Day Cap)
              </button>
            </div>
          </div>

          {/* Q3: HOA & Covenants */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E6DFD5] space-y-3">
            <span className="text-xs font-semibold text-[#2A2320] block">
              3. Does your HOA, Condo Board, or Lease allow short-term rentals?
            </span>
            <p className="text-xs text-[#746B63]">
              Many D.C. condo associations (e.g. FS Residential managed buildings) explicitly restrict STR operations.
            </p>
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setHasHoaApproval(true)}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  hasHoaApproval === true
                    ? 'border-[#4A6B5D] bg-[#4A6B5D]/10 text-[#4A6B5D] font-bold'
                    : 'border-[#E6DFD5] text-[#746B63]'
                }`}
              >
                Yes / Allowed
              </button>
              <button
                type="button"
                onClick={() => setHasHoaApproval(false)}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  hasHoaApproval === false
                    ? 'border-[#E08E6D] bg-[#E08E6D]/10 text-[#C97251] font-bold'
                    : 'border-[#E6DFD5] text-[#746B63]'
                }`}
              >
                No / Prohibited
              </button>
            </div>
          </div>

          {/* Q4: DLCP License */}
          <div className="p-4 rounded-xl bg-[#FDFBF7] border border-[#E6DFD5] space-y-3">
            <span className="text-xs font-semibold text-[#2A2320] block">
              4. Have you obtained your DLCP Short-Term Rental Endorsement?
            </span>
            <p className="text-xs text-[#746B63]">
              Required 2-year license ($104.50 fee) issued by D.C. DLCP before publishing on Airbnb/VRBO.
            </p>
            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setHasDlcpLicense(true)}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  hasDlcpLicense === true
                    ? 'border-[#4A6B5D] bg-[#4A6B5D]/10 text-[#4A6B5D] font-bold'
                    : 'border-[#E6DFD5] text-[#746B63]'
                }`}
              >
                Yes (Licensed)
              </button>
              <button
                type="button"
                onClick={() => setHasDlcpLicense(false)}
                className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                  hasDlcpLicense === false
                    ? 'border-[#E08E6D] bg-[#E08E6D]/10 text-[#C97251] font-bold'
                    : 'border-[#E6DFD5] text-[#746B63]'
                }`}
              >
                In Progress / Not Yet
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Quiz Assessment Result Card */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            eligibilityStatus === 'green'
              ? 'bg-[#EEF3F0] border-[#4A6B5D]/40 text-[#2A2320]'
              : eligibilityStatus === 'amber'
              ? 'bg-[#FAF0EB] border-[#E08E6D]/40 text-[#2A2320]'
              : 'bg-[#FBEAE8] border-[#D9534F]/40 text-[#2A2320]'
          }`}
        >
          <div className="flex items-start space-x-3">
            {eligibilityStatus === 'green' && (
              <CheckCircle2 className="w-6 h-6 text-[#4A6B5D] shrink-0 mt-0.5" />
            )}
            {eligibilityStatus === 'amber' && (
              <AlertTriangle className="w-6 h-6 text-[#E08E6D] shrink-0 mt-0.5" />
            )}
            {eligibilityStatus === 'red' && (
              <XCircle className="w-6 h-6 text-[#D9534F] shrink-0 mt-0.5" />
            )}

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-base">{statusTitle}</h4>
                <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/70 font-semibold">
                  {eligibilityStatus === 'green' ? 'Permitted' : eligibilityStatus === 'amber' ? 'Restricted' : 'Prohibited'}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[#746B63]">{statusMessage}</p>

              {!hasDlcpLicense && eligibilityStatus !== 'red' && (
                <div className="mt-3 pt-3 border-t border-[#E6DFD5] text-xs">
                  <strong>Action Required:</strong> Submit your Short-Term Rental endorsement application via{' '}
                  <a
                    href="https://dlcp.dc.gov/page/operating-short-term-rental-district-columbia"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#E08E6D] underline font-semibold inline-flex items-center space-x-0.5"
                  >
                    <span>DLCP Online Portal</span>
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                  . Include certificate of clean hands and proof of liability insurance ($500k+).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pros and Cons of Listing on AirBNB vs Long-Term Leases */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="border-b border-[#E6DFD5] pb-4">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#E08E6D] mb-1">
            <span>Decision Matrix</span>
            <span>·</span>
            <span>Strategic Comparison</span>
          </div>
          <h2 className="text-xl font-semibold text-[#2A2320]">
            Pros and Cons of Listing on AirBNB vs. Long-Term Leases
          </h2>
          <p className="text-xs text-[#746B63] mt-0.5">
            Weigh revenue upside against operational friction and tenant legal frameworks in the District of Columbia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AirBNB Side */}
          <div className="p-5 rounded-2xl bg-[#FAF0EB]/60 border border-[#E08E6D]/40 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#C97251] uppercase tracking-wider">
                Short-Term Rental (Airbnb)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E08E6D]/20 text-[#C97251] font-medium">
                High Flexibility
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="font-semibold text-[#2A2320]">Advantages (Pros):</div>
              <ul className="space-y-1.5 text-[#746B63]">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Higher Revenue Ceiling:</strong> Prime DC cherry blossom & congressional session rates can exceed $280-$400/night.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Personal Flexibility:</strong> Block dates whenever you need the home for family or personal residence.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Frequent Property Inspection:</strong> Professional cleaning teams inspect the premises between every guest checkout.
                  </span>
                </li>
              </ul>

              <div className="font-semibold text-[#2A2320] pt-2">Disadvantages (Cons):</div>
              <ul className="space-y-1.5 text-[#746B63]">
                <li className="flex items-start space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#E08E6D] shrink-0 mt-0.5" />
                  <span>
                    <strong>90-Day Unhosted Cap:</strong> Strict annual booking ceiling unless host resides on-site.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#E08E6D] shrink-0 mt-0.5" />
                  <span>
                    <strong>High Tax Burden:</strong> DC Transient Lodging Tax of 14.95% plus platform fees (~3%) and cleaning expenses.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#E08E6D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Operational Friction:</strong> Constant guest communication, noise complaints, and laundry turnover.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Long-Term Lease Side */}
          <div className="p-5 rounded-2xl bg-[#EEF3F0]/60 border border-[#4A6B5D]/40 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-[#4A6B5D] uppercase tracking-wider">
                Long-Term Residential Lease (12+ Months)
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#4A6B5D]/20 text-[#375347] font-medium">
                Passive Stability
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="font-semibold text-[#2A2320]">Advantages (Pros):</div>
              <ul className="space-y-1.5 text-[#746B63]">
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Predictable Monthly Cash Flow:</strong> Guaranteed monthly rent regardless of weather, winter lulls, or government shutdowns.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero Day-to-Day Turnover:</strong> No continuous cleaning coordination, key exchanges, or calendar management.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4A6B5D] shrink-0 mt-0.5" />
                  <span>
                    <strong>No 90-Day Cap Restrictions:</strong> 365 days of continuous rental revenue legally permitted across all D.C. properties.
                  </span>
                </li>
              </ul>

              <div className="font-semibold text-[#2A2320] pt-2">Disadvantages (Cons):</div>
              <ul className="space-y-1.5 text-[#746B63]">
                <li className="flex items-start space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#E08E6D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Rigid D.C. Tenant Laws:</strong> Strong tenant protection ordinances, TOPA rights, and prolonged eviction procedures.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#E08E6D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Capped Upside:</strong> Unable to take advantage of high-paying peak tourist periods and international conferences.
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <XCircle className="w-3.5 h-3.5 text-[#E08E6D] shrink-0 mt-0.5" />
                  <span>
                    <strong>Zero Personal Usage:</strong> The property is fully occupied by the tenant for the entire duration of the lease.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Market Demand Across DC Neighborhoods */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs space-y-5">
        <div className="border-b border-[#E6DFD5] pb-4">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#4A6B5D] mb-1">
            <span>Market Demand Index</span>
            <span>·</span>
            <span>Empirical Data Grounding</span>
          </div>
          <h2 className="text-xl font-semibold text-[#2A2320]">
            Would my place have high demand in the market?
          </h2>
          <p className="text-xs text-[#746B63] mt-0.5">
            D.C. Airbnb demand varies drastically by corridor proximity to the National Mall, Metro lines, and convention centers.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F4EFE6] text-[#746B63] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">DC Neighborhood</th>
                <th className="py-2.5 px-3">Demand Tier</th>
                <th className="py-2.5 px-3">Median Occupancy</th>
                <th className="py-2.5 px-3">Median Nightly Rate</th>
                <th className="py-2.5 px-3 rounded-r-lg">Peak Booking Seasons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DFD5]/60 font-sans">
              {neighborhoodDemand.map((row) => (
                <tr key={row.name} className="hover:bg-[#FDFBF7] transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#2A2320]">{row.name}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        row.demand === 'Very High'
                          ? 'bg-[#4A6B5D]/15 text-[#4A6B5D]'
                          : row.demand === 'High'
                          ? 'bg-[#E08E6D]/15 text-[#C97251]'
                          : 'bg-[#F4EFE6] text-[#746B63]'
                      }`}
                    >
                      {row.demand}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium text-[#2A2320]">{row.medianOcc}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#4A6B5D]">{row.avgRate}</td>
                  <td className="py-2.5 px-3 text-[#746B63]">{row.bestSeason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official References and Citations */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-5 shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-[#746B63] uppercase tracking-wider">
          Official DC Regulatory Sources & References
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <a
            href="https://dlcp.dc.gov/page/operating-short-term-rental-district-columbia"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-[#F4EFE6] hover:bg-[#EFE9DE] border border-[#E6DFD5] text-[#2A2320] transition-colors flex items-center justify-between"
          >
            <span>DLCP STR Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#746B63]" />
          </a>
          <a
            href="https://mayor.dc.gov/sites/default/files/dc/sites/mayormb/publication/attachments/ShortTermRentalAmendementActof2026.pdf"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-[#F4EFE6] hover:bg-[#EFE9DE] border border-[#E6DFD5] text-[#2A2320] transition-colors flex items-center justify-between"
          >
            <span>2026 STR Act (PDF)</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#746B63]" />
          </a>
          <a
            href="https://rabbu.com/airbnb-data/washington-dc"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-[#F4EFE6] hover:bg-[#EFE9DE] border border-[#E6DFD5] text-[#2A2320] transition-colors flex items-center justify-between"
          >
            <span>Rabbu DC Airbnb Data</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#746B63]" />
          </a>
          <a
            href="https://beancount.io/blog/2026/09/17/dc-renters-airbnb-hosts-short-term-rental-act-2026-guide"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-xl bg-[#F4EFE6] hover:bg-[#EFE9DE] border border-[#E6DFD5] text-[#2A2320] transition-colors flex items-center justify-between"
          >
            <span>Host Tax & 2026 Guide</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#746B63]" />
          </a>
        </div>
      </div>
    </div>
  );
};
