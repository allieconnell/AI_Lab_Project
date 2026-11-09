import { LongTermComparable, RevenueComparisonResult, UserPropertyInput } from '../types/rental';

/**
 * Computes comparative financial projections between Short-Term Airbnb
 * and Long-Term residential leasing in Washington, D.C.
 */
export function calculateRevenueComparison(
  input: UserPropertyInput,
  predictedNightlyRate: number,
  longTermListings: LongTermComparable[]
): RevenueComparisonResult {
  // 1. Determine effective short-term nights based on DC 2026 regulations
  let effectiveNights = input.customOccupancyNights;
  let applied90DayCap = false;

  if (!input.isHosted) {
    // DC Short-Term Rental Act 2026 unhosted vacation rental 90-day limit
    if (effectiveNights > 90) {
      effectiveNights = 90;
      applied90DayCap = true;
    }
  }

  // Airbnb Gross
  const airbnbGross = Math.round(predictedNightlyRate * effectiveNights);

  // DC Transient Lodging Tax (14.95%) + Cleaning & Platform fees (~15%)
  const airbnbTaxAndFeesRate = 0.2995;
  const estimatedTaxesAndFees = Math.round(airbnbGross * airbnbTaxAndFeesRate);
  const airbnbNet = airbnbGross - estimatedTaxesAndFees;

  // 2. Long-Term Rent calculation from registered DC accommodations
  // Filter by user ward first
  let wardMatches = longTermListings.filter(c => c.ward.toLowerCase() === input.ward.toLowerCase());
  if (wardMatches.length === 0) {
    wardMatches = longTermListings;
  }

  // Calculate median rent in this ward
  const rents = wardMatches.map(c => c.rent_monthly).sort((a, b) => a - b);
  const mid = Math.floor(rents.length / 2);
  let medianMonthlyRent = rents.length > 0
    ? (rents.length % 2 !== 0 ? rents[mid] : (rents[mid - 1] + rents[mid]) / 2)
    : 2450; // default DC median if empty

  // Bedroom scaling adjustment for long-term:
  // Studio/1BR: ~0.85x, 2BR: 1.1x, 3BR: 1.35x, 4BR+: 1.6x
  let bedroomMultiplier = 1.0;
  if (input.bedrooms === 0) bedroomMultiplier = 0.82;
  else if (input.bedrooms === 1) bedroomMultiplier = 0.95;
  else if (input.bedrooms === 2) bedroomMultiplier = 1.18;
  else if (input.bedrooms === 3) bedroomMultiplier = 1.45;
  else if (input.bedrooms >= 4) bedroomMultiplier = 1.75;

  const adjustedMonthlyRent = Math.round(medianMonthlyRent * bedroomMultiplier);
  const longTermGross = adjustedMonthlyRent * 12;

  // Typical property management & maintenance allowance (~10%)
  const longTermManagementCosts = Math.round(longTermGross * 0.10);
  const longTermNet = longTermGross - longTermManagementCosts;

  // 3. Comparison metrics
  const deltaGrossAnnual = airbnbGross - longTermGross;
  const deltaPercent = longTermGross > 0 ? (deltaGrossAnnual / longTermGross) * 100 : 0;

  // Break-even occupancy nights per year
  const breakEvenNights = predictedNightlyRate > 0
    ? Math.min(365, Math.ceil(longTermGross / predictedNightlyRate))
    : 0;

  return {
    airbnb: {
      predictedNightlyRate,
      effectiveNights,
      grossAnnualRevenue: airbnbGross,
      applied90DayCap,
      estimatedTaxesAndFees,
      netEstimate: Math.max(0, airbnbNet),
    },
    longTerm: {
      medianMonthlyRent: adjustedMonthlyRent,
      grossAnnualRevenue: longTermGross,
      comparableCountInWard: wardMatches.length,
      estimatedManagementCosts: longTermManagementCosts,
      netEstimate: Math.max(0, longTermNet),
    },
    deltaGrossAnnual,
    deltaPercent: parseFloat(deltaPercent.toFixed(1)),
    breakEvenNights,
    higherEarningOption: airbnbGross >= longTermGross ? 'airbnb' : 'long_term',
  };
}
