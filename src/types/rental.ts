export interface AirbnbListing {
  id: string;
  neighbourhood: string;
  room_type: string;
  bedrooms: number;
  accommodates: number;
  price_clean: number;
  occupancy_est: number;
  occ_at_ceiling: boolean;
  reviews_ltm: number;
  revenue_comp: number;
  pro_host: boolean;
  minimum_nights: number;
  sample_weight: number;
  name?: string;
  host_name?: string;
  area?: string;
}

export interface LongTermComparable {
  id: string;
  ward: string;
  latitude: number;
  longitude: number;
  property_type_code: number;
  property_type_text: string;
  rent_monthly: number;
  registered_units: number;
  prev_rent_1: number | null;
  modified_date: string;
}

export interface RevenueLookupItem {
  neighbourhood: string;
  room_type: string;
  bed: string;
  n: number;
  median_price: number;
  median_occ: number;
  p25_rev: number;
  median_rev: number;
  p75_rev: number;
  share_at_ceiling: number;
  low_sample: boolean;
}

export type RegressionFeatureId =
  | 'bedrooms'
  | 'accommodates'
  | 'minimum_nights'
  | 'reviews_ltm'
  | 'room_type_entire'
  | 'high_demand_neighborhood';

export interface RegressionFeatureConfig {
  id: RegressionFeatureId;
  label: string;
  description: string;
  category: 'Property Physical' | 'Listing Rules' | 'Market Demand';
  defaultValue: boolean;
}

export interface RegressionModelResult {
  target: 'price_clean' | 'revenue_comp';
  selectedFeatures: RegressionFeatureId[];
  coefficients: { [feature: string]: number };
  intercept: number;
  rSquared: number;
  adjRSquared: number;
  rmse: number;
  mae: number;
  sampleSize: number;
  residualsSample: Array<{
    id: string;
    actual: number;
    predicted: number;
    error: number;
  }>;
}

export interface UserPropertyInput {
  neighbourhood: string;
  ward: string;
  bedrooms: number;
  accommodates: number;
  room_type: 'Entire home/apt' | 'Private room';
  minimum_nights: number;
  reviews_ltm: number;
  isHosted: boolean; // Hosted allows 365 days; Unhosted subject to DC 90-day annual cap
  customOccupancyNights: number; // 0 to 365
  isPrimaryResidence: boolean; // D.C. 2026 STR Act requires homestead deduction / primary residence
  hasHoaApproval: boolean; // Condo bylaws / HOA allow short-term rental
  ownershipStatus: 'owner' | 'renter'; // Owner vs tenant (renters require landlord notarized consent)
  hasDlcpLicense: boolean; // Basic Business License (BBL) registered with DLCP
}

export interface RevenueComparisonResult {
  airbnb: {
    predictedNightlyRate: number;
    effectiveNights: number;
    grossAnnualRevenue: number;
    applied90DayCap: boolean;
    estimatedTaxesAndFees: number; // 14.95% transient tax + 15% platform/cleaning
    netEstimate: number;
  };
  longTerm: {
    medianMonthlyRent: number;
    grossAnnualRevenue: number;
    comparableCountInWard: number;
    estimatedManagementCosts: number; // 8% property management
    netEstimate: number;
  };
  deltaGrossAnnual: number;
  deltaPercent: number;
  breakEvenNights: number;
  higherEarningOption: 'airbnb' | 'long_term';
}
