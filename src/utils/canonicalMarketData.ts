/**
 * Canonical Market Data & Scenario Engine for Washington D.C.
 * Single source of truth across Home Hub, Market Map, Side Panel, and Advisor.
 */

export interface CanonicalNeighborhood {
  id: string;
  name: string;
  shortName: string;
  ward: 'Ward 1' | 'Ward 2' | 'Ward 3' | 'Ward 4' | 'Ward 5' | 'Ward 6' | 'Ward 7' | 'Ward 8';
  color: string;
  centroid: [number, number];
  polygon: [number, number][];
  baseMonthlyRent: number; // 1BR benchmark monthly lease
  baseNightlyRate: number; // 1BR benchmark nightly Airbnb rate
}

export const CANONICAL_NEIGHBORHOODS: Record<string, CanonicalNeighborhood> = {
  'Brightwood Park, Crestwood, Petworth': {
    id: 'petworth',
    name: 'Brightwood Park, Crestwood, Petworth',
    shortName: 'Petworth / Brightwood Park',
    ward: 'Ward 4',
    color: '#D4A373',
    centroid: [38.9505, -77.0272],
    polygon: [
      [38.968, -77.042],
      [38.968, -77.015],
      [38.938, -77.015],
      [38.936, -77.035],
      [38.948, -77.045],
    ],
    baseMonthlyRent: 2150,
    baseNightlyRate: 155,
  },
  'Brookland, Brentwood, Langdon': {
    id: 'brookland',
    name: 'Brookland, Brentwood, Langdon',
    shortName: 'Brookland / Brentwood',
    ward: 'Ward 5',
    color: '#7C9A86',
    centroid: [38.9312, -76.9856],
    polygon: [
      [38.946, -77.002],
      [38.942, -76.968],
      [38.918, -76.972],
      [38.922, -77.005],
    ],
    baseMonthlyRent: 2250,
    baseNightlyRate: 175,
  },
  'Capitol Hill, Lincoln Park': {
    id: 'capitol_hill',
    name: 'Capitol Hill, Lincoln Park',
    shortName: 'Capitol Hill',
    ward: 'Ward 6',
    color: '#E08E6D',
    centroid: [38.8899, -76.9950],
    polygon: [
      [38.902, -77.012],
      [38.901, -76.978],
      [38.878, -76.978],
      [38.878, -77.008],
      [38.888, -77.015],
    ],
    baseMonthlyRent: 2600,
    baseNightlyRate: 212,
  },
  'Capitol View, Marshall Heights, Benning Heights': {
    id: 'capitol_view',
    name: 'Capitol View, Marshall Heights, Benning Heights',
    shortName: 'Capitol View / Marshall Heights',
    ward: 'Ward 7',
    color: '#BA7967',
    centroid: [38.8885, -76.9280],
    polygon: [
      [38.898, -76.942],
      [38.895, -76.915],
      [38.876, -76.918],
      [38.878, -76.945],
    ],
    baseMonthlyRent: 1750,
    baseNightlyRate: 131,
  },
  'Cathedral Heights, McLean Gardens, Glover Park': {
    id: 'glover_park',
    name: 'Cathedral Heights, McLean Gardens, Glover Park',
    shortName: 'Glover Park / Cathedral Heights',
    ward: 'Ward 3',
    color: '#4A6B5D',
    centroid: [38.9288, -77.0765],
    polygon: [
      [38.941, -77.088],
      [38.940, -77.068],
      [38.918, -77.069],
      [38.919, -77.085],
    ],
    baseMonthlyRent: 2500,
    baseNightlyRate: 190,
  },
  'Cleveland Park, Woodley Park, Massachusetts Avenue Heights, Woodland-Normanstone Terrace': {
    id: 'cleveland_park',
    name: 'Cleveland Park, Woodley Park, Massachusetts Avenue Heights, Woodland-Normanstone Terrace',
    shortName: 'Cleveland Park / Woodley Park',
    ward: 'Ward 3',
    color: '#3D5A4C',
    centroid: [38.9388, -77.0635],
    polygon: [
      [38.952, -77.075],
      [38.950, -77.050],
      [38.925, -77.052],
      [38.926, -77.072],
    ],
    baseMonthlyRent: 2550,
    baseNightlyRate: 199,
  },
  'Colonial Village, Shepherd Park, North Portal Estates': {
    id: 'shepherd_park',
    name: 'Colonial Village, Shepherd Park, North Portal Estates',
    shortName: 'Shepherd Park / Colonial Village',
    ward: 'Ward 4',
    color: '#C87D55',
    centroid: [38.9850, -77.0380],
    polygon: [
      [38.998, -77.046],
      [38.995, -77.025],
      [38.972, -77.028],
      [38.974, -77.045],
    ],
    baseMonthlyRent: 2100,
    baseNightlyRate: 162,
  },
  'Columbia Heights, Mt. Pleasant, Pleasant Plains, Park View': {
    id: 'columbia_heights',
    name: 'Columbia Heights, Mt. Pleasant, Pleasant Plains, Park View',
    shortName: 'Columbia Heights / Mt. Pleasant',
    ward: 'Ward 1',
    color: '#E29578',
    centroid: [38.9295, -77.0326],
    polygon: [
      [38.941, -77.045],
      [38.940, -77.018],
      [38.919, -77.020],
      [38.918, -77.044],
    ],
    baseMonthlyRent: 2450,
    baseNightlyRate: 191,
  },
  'Congress Heights, Bellevue, Washington Highlands': {
    id: 'congress_heights',
    name: 'Congress Heights, Bellevue, Washington Highlands',
    shortName: 'Congress Heights / Bellevue',
    ward: 'Ward 8',
    color: '#8D6B94',
    centroid: [38.8412, -77.0012],
    polygon: [
      [38.858, -77.015],
      [38.855, -76.985],
      [38.825, -76.995],
      [38.828, -77.022],
    ],
    baseMonthlyRent: 1650,
    baseNightlyRate: 125,
  },
  'Deanwood, Burrville, Grant Park, Lincoln Heights, Fairmont Heights': {
    id: 'deanwood',
    name: 'Deanwood, Burrville, Grant Park, Lincoln Heights, Fairmont Heights',
    shortName: 'Deanwood / Burrville',
    ward: 'Ward 7',
    color: '#C38D9E',
    centroid: [38.8988, -76.9285],
    polygon: [
      [38.915, -76.938],
      [38.910, -76.912],
      [38.888, -76.916],
      [38.890, -76.942],
    ],
    baseMonthlyRent: 1750,
    baseNightlyRate: 178,
  },
  'Douglas, Shipley Terrace': {
    id: 'douglas',
    name: 'Douglas, Shipley Terrace',
    shortName: 'Douglas / Shipley Terrace',
    ward: 'Ward 8',
    color: '#A25F4B',
    centroid: [38.8520, -76.9880],
    polygon: [
      [38.862, -76.998],
      [38.860, -76.975],
      [38.842, -76.978],
      [38.845, -76.999],
    ],
    baseMonthlyRent: 1600,
    baseNightlyRate: 120,
  },
  'Downtown, Chinatown, Penn Quarters, Mount Vernon Square, North Capitol Street': {
    id: 'downtown',
    name: 'Downtown, Chinatown, Penn Quarters, Mount Vernon Square, North Capitol Street',
    shortName: 'Downtown / Chinatown / Penn Quarter',
    ward: 'Ward 2',
    color: '#C08081',
    centroid: [38.9010, -77.0220],
    polygon: [
      [38.909, -77.034],
      [38.908, -77.010],
      [38.892, -77.011],
      [38.893, -77.035],
    ],
    baseMonthlyRent: 2700,
    baseNightlyRate: 245,
  },
  // Canonical Dupont Circle: Strictly Ward 2
  'Dupont Circle, Connecticut Avenue/K Street': {
    id: 'dupont_circle',
    name: 'Dupont Circle, Connecticut Avenue/K Street',
    shortName: 'Dupont Circle',
    ward: 'Ward 2',
    color: '#E08E6D',
    centroid: [38.9096, -77.0434],
    polygon: [
      [38.919, -77.054],
      [38.918, -77.034],
      [38.900, -77.035],
      [38.901, -77.052],
    ],
    baseMonthlyRent: 2650,
    baseNightlyRate: 249,
  },
  'Eastland Gardens, Kenilworth': {
    id: 'kenilworth',
    name: 'Eastland Gardens, Kenilworth',
    shortName: 'Kenilworth / Eastland Gardens',
    ward: 'Ward 7',
    color: '#7C9A86',
    centroid: [38.9150, -76.9450],
    polygon: [
      [38.928, -76.958],
      [38.925, -76.935],
      [38.902, -76.938],
      [38.905, -76.959],
    ],
    baseMonthlyRent: 1700,
    baseNightlyRate: 148,
  },
  'Edgewood, Bloomingdale, Truxton Circle, Eckington': {
    id: 'bloomingdale',
    name: 'Edgewood, Bloomingdale, Truxton Circle, Eckington',
    shortName: 'Bloomingdale / Eckington',
    ward: 'Ward 5',
    color: '#D4A373',
    centroid: [38.9160, -77.0070],
    polygon: [
      [38.927, -77.018],
      [38.926, -76.996],
      [38.905, -76.998],
      [38.906, -77.019],
    ],
    baseMonthlyRent: 2350,
    baseNightlyRate: 187,
  },
  'Fairfax Village, Naylor Gardens, Hillcrest, Summit Park': {
    id: 'hillcrest',
    name: 'Fairfax Village, Naylor Gardens, Hillcrest, Summit Park',
    shortName: 'Hillcrest / Naylor Gardens',
    ward: 'Ward 7',
    color: '#BA7967',
    centroid: [38.8650, -76.9550],
    polygon: [
      [38.878, -76.968],
      [38.875, -76.942],
      [38.852, -76.946],
      [38.855, -76.970],
    ],
    baseMonthlyRent: 1750,
    baseNightlyRate: 128,
  },
  'Friendship Heights, American University Park, Tenleytown': {
    id: 'tenleytown',
    name: 'Friendship Heights, American University Park, Tenleytown',
    shortName: 'Tenleytown / Friendship Heights',
    ward: 'Ward 3',
    color: '#4A6B5D',
    centroid: [38.9500, -77.0850],
    polygon: [
      [38.965, -77.098],
      [38.962, -77.072],
      [38.938, -77.075],
      [38.940, -77.099],
    ],
    baseMonthlyRent: 2500,
    baseNightlyRate: 190,
  },
  'Georgetown, Burleith/Hillandale': {
    id: 'georgetown',
    name: 'Georgetown, Burleith/Hillandale',
    shortName: 'Georgetown / Burleith',
    ward: 'Ward 2',
    color: '#A25F4B',
    centroid: [38.9076, -77.0687],
    polygon: [
      [38.918, -77.082],
      [38.917, -77.056],
      [38.900, -77.058],
      [38.901, -77.080],
    ],
    baseMonthlyRent: 2850,
    baseNightlyRate: 211,
  },
  'Hawthorne, Barnaby Woods, Chevy Chase': {
    id: 'chevy_chase',
    name: 'Hawthorne, Barnaby Woods, Chevy Chase',
    shortName: 'Chevy Chase / Barnaby Woods',
    ward: 'Ward 3',
    color: '#3D5A4C',
    centroid: [38.9720, -77.0680],
    polygon: [
      [38.992, -77.082],
      [38.990, -77.052],
      [38.958, -77.055],
      [38.960, -77.084],
    ],
    baseMonthlyRent: 2600,
    baseNightlyRate: 233,
  },
  'Historic Anacostia': {
    id: 'anacostia',
    name: 'Historic Anacostia',
    shortName: 'Historic Anacostia',
    ward: 'Ward 8',
    color: '#C87D55',
    centroid: [38.8680, -76.9850],
    polygon: [
      [38.878, -76.995],
      [38.875, -76.972],
      [38.858, -76.976],
      [38.860, -76.998],
    ],
    baseMonthlyRent: 1700,
    baseNightlyRate: 132,
  },
  'Howard University, Le Droit Park, Cardozo/Shaw': {
    id: 'ledroit_park',
    name: 'Howard University, Le Droit Park, Cardozo/Shaw',
    shortName: 'LeDroit Park / Shaw North',
    ward: 'Ward 1',
    color: '#E08E6D',
    centroid: [38.9180, -77.0210],
    polygon: [
      [38.926, -77.029],
      [38.925, -77.012],
      [38.910, -77.014],
      [38.912, -77.031],
    ],
    baseMonthlyRent: 2450,
    baseNightlyRate: 208,
  },
  'Ivy City, Arboretum, Trinidad, Carver Langston': {
    id: 'ivy_city',
    name: 'Ivy City, Arboretum, Trinidad, Carver Langston',
    shortName: 'Ivy City / Trinidad',
    ward: 'Ward 5',
    color: '#7C9A86',
    centroid: [38.9080, -76.9750],
    polygon: [
      [38.919, -76.988],
      [38.915, -76.955],
      [38.898, -76.958],
      [38.900, -76.989],
    ],
    baseMonthlyRent: 2200,
    baseNightlyRate: 170,
  },
  'Kalorama Heights, Adams Morgan, Lanier Heights': {
    id: 'adams_morgan',
    name: 'Kalorama Heights, Adams Morgan, Lanier Heights',
    shortName: 'Adams Morgan / Kalorama',
    ward: 'Ward 1',
    color: '#D4A373',
    centroid: [38.9215, -77.0441],
    polygon: [
      [38.929, -77.056],
      [38.928, -77.036],
      [38.912, -77.038],
      [38.914, -77.055],
    ],
    baseMonthlyRent: 2550,
    baseNightlyRate: 183,
  },
  'Near Southeast, Navy Yard': {
    id: 'navy_yard',
    name: 'Near Southeast, Navy Yard',
    shortName: 'Navy Yard / Near Southeast',
    ward: 'Ward 6',
    color: '#E08E6D',
    centroid: [38.8766, -77.0035],
    polygon: [
      [38.884, -77.014],
      [38.883, -76.992],
      [38.868, -76.994],
      [38.870, -77.015],
    ],
    baseMonthlyRent: 2650,
    baseNightlyRate: 232,
  },
  'North Cleveland Park, Forest Hills, Van Ness': {
    id: 'van_ness',
    name: 'North Cleveland Park, Forest Hills, Van Ness',
    shortName: 'Van Ness / Forest Hills',
    ward: 'Ward 3',
    color: '#4A6B5D',
    centroid: [38.9480, -77.0650],
    polygon: [
      [38.960, -77.075],
      [38.958, -77.052],
      [38.938, -77.055],
      [38.940, -77.076],
    ],
    baseMonthlyRent: 2450,
    baseNightlyRate: 202,
  },
  'North Michigan Park, Michigan Park, University Heights': {
    id: 'michigan_park',
    name: 'North Michigan Park, Michigan Park, University Heights',
    shortName: 'Michigan Park / Brookland North',
    ward: 'Ward 5',
    color: '#BA7967',
    centroid: [38.9500, -76.9850],
    polygon: [
      [38.962, -76.996],
      [38.958, -76.972],
      [38.938, -76.975],
      [38.940, -76.998],
    ],
    baseMonthlyRent: 2100,
    baseNightlyRate: 139,
  },
  'Shaw, Logan Circle': {
    id: 'logan_circle',
    name: 'Shaw, Logan Circle',
    shortName: 'Shaw / Logan Circle',
    ward: 'Ward 2',
    color: '#C87D55',
    centroid: [38.9118, -77.0242],
    polygon: [
      [38.919, -77.035],
      [38.918, -77.018],
      [38.904, -77.020],
      [38.905, -77.036],
    ],
    baseMonthlyRent: 2650,
    baseNightlyRate: 249,
  },
  'Southwest Employment Area, Southwest/Waterfront, Fort McNair, Buzzard Point': {
    id: 'southwest_waterfront',
    name: 'Southwest Employment Area, Southwest/Waterfront, Fort McNair, Buzzard Point',
    shortName: 'The Wharf / SW Waterfront',
    ward: 'Ward 6',
    color: '#4A6B5D',
    centroid: [38.8740, -77.0180],
    polygon: [
      [38.885, -77.032],
      [38.884, -77.008],
      [38.860, -77.012],
      [38.862, -77.030],
    ],
    baseMonthlyRent: 2600,
    baseNightlyRate: 245,
  },
  'Spring Valley, Palisades, Wesley Heights, Foxhall Crescent, Foxhall Village, Georgetown Reservoir': {
    id: 'palisades',
    name: 'Spring Valley, Palisades, Wesley Heights, Foxhall Crescent, Foxhall Village, Georgetown Reservoir',
    shortName: 'Palisades / Spring Valley',
    ward: 'Ward 3',
    color: '#3D5A4C',
    centroid: [38.9250, -77.0980],
    polygon: [
      [38.945, -77.115],
      [38.942, -77.085],
      [38.908, -77.092],
      [38.912, -77.118],
    ],
    baseMonthlyRent: 2700,
    baseNightlyRate: 222,
  },
  'Takoma, Brightwood, Manor Park': {
    id: 'takoma',
    name: 'Takoma, Brightwood, Manor Park',
    shortName: 'Takoma / Manor Park',
    ward: 'Ward 4',
    color: '#D4A373',
    centroid: [38.9744, -77.0199],
    polygon: [
      [38.988, -77.032],
      [38.985, -77.005],
      [38.962, -77.008],
      [38.964, -77.035],
    ],
    baseMonthlyRent: 2050,
    baseNightlyRate: 139,
  },
  'Union Station, Stanton Park, Kingman Park': {
    id: 'union_station',
    name: 'Union Station, Stanton Park, Kingman Park',
    shortName: 'NoMa / Union Station',
    ward: 'Ward 6',
    color: '#E08E6D',
    centroid: [38.8980, -76.9920],
    polygon: [
      [38.908, -77.008],
      [38.906, -76.975],
      [38.889, -76.978],
      [38.891, -77.009],
    ],
    baseMonthlyRent: 2550,
    baseNightlyRate: 206,
  },
  'West End, Foggy Bottom, GWU': {
    id: 'foggy_bottom',
    name: 'West End, Foggy Bottom, GWU',
    shortName: 'West End / Foggy Bottom',
    ward: 'Ward 2',
    color: '#C08081',
    centroid: [38.9020, -77.0500],
    polygon: [
      [38.910, -77.060],
      [38.909, -77.042],
      [38.892, -77.044],
      [38.893, -77.062],
    ],
    baseMonthlyRent: 2650,
    baseNightlyRate: 210,
  },
  'Woodridge, Fort Lincoln, Gateway': {
    id: 'woodridge',
    name: 'Woodridge, Fort Lincoln, Gateway',
    shortName: 'Woodridge / Fort Lincoln',
    ward: 'Ward 5',
    color: '#7C9A86',
    centroid: [38.9320, -76.9620],
    polygon: [
      [38.945, -76.975],
      [38.942, -76.945],
      [38.918, -76.948],
      [38.920, -76.976],
    ],
    baseMonthlyRent: 2050,
    baseNightlyRate: 156,
  },
  'Lamont Riggs, Queens Chapel, Fort Totten, Pleasant Hill': {
    id: 'fort_totten',
    name: 'Lamont Riggs, Queens Chapel, Fort Totten, Pleasant Hill',
    shortName: 'Fort Totten / Lamont Riggs',
    ward: 'Ward 4',
    color: '#C87D55',
    centroid: [38.9550, -77.0010],
    polygon: [
      [38.966, -77.014],
      [38.964, -76.988],
      [38.944, -76.990],
      [38.945, -77.016],
    ],
    baseMonthlyRent: 2050,
    baseNightlyRate: 126,
  },
  'Mayfair, Hillbrook, Mahaning Heights': {
    id: 'mayfair',
    name: 'Mayfair, Hillbrook, Mahaning Heights',
    shortName: 'Mayfair / Hillbrook',
    ward: 'Ward 7',
    color: '#BA7967',
    centroid: [38.8980, -76.9450],
    polygon: [
      [38.908, -76.958],
      [38.905, -76.932],
      [38.888, -76.935],
      [38.890, -76.959],
    ],
    baseMonthlyRent: 1700,
    baseNightlyRate: 129,
  },
  'River Terrace, Benning, Greenway, Dupont Park': {
    id: 'river_terrace',
    name: 'River Terrace, Benning, Greenway, Dupont Park',
    shortName: 'River Terrace / Benning',
    ward: 'Ward 7',
    color: '#E08E6D',
    centroid: [38.8860, -76.9560],
    polygon: [
      [38.896, -76.968],
      [38.894, -76.942],
      [38.875, -76.946],
      [38.878, -76.970],
    ],
    baseMonthlyRent: 1750,
    baseNightlyRate: 148,
  },
  'Sheridan, Barry Farm, Buena Vista': {
    id: 'barry_farm',
    name: 'Sheridan, Barry Farm, Buena Vista',
    shortName: 'Barry Farm / Sheridan',
    ward: 'Ward 8',
    color: '#8D6B94',
    centroid: [38.8600, -76.9920],
    polygon: [
      [38.870, -77.004],
      [38.868, -76.980],
      [38.850, -76.984],
      [38.852, -77.006],
    ],
    baseMonthlyRent: 1650,
    baseNightlyRate: 148,
  },
  'Twining, Fairlawn, Randle Highlands, Penn Branch, Fort Davis Park, Fort Dupont': {
    id: 'penn_branch',
    name: 'Twining, Fairlawn, Randle Highlands, Penn Branch, Fort Davis Park, Fort Dupont',
    shortName: 'Penn Branch / Fort Dupont',
    ward: 'Ward 7',
    color: '#A25F4B',
    centroid: [38.8740, -76.9620],
    polygon: [
      [38.886, -76.974],
      [38.884, -76.948],
      [38.862, -76.952],
      [38.865, -76.976],
    ],
    baseMonthlyRent: 1750,
    baseNightlyRate: 163,
  },
  'Woodland/Fort Stanton, Garfield Heights, Knox Hill': {
    id: 'fort_stanton',
    name: 'Woodland/Fort Stanton, Garfield Heights, Knox Hill',
    shortName: 'Fort Stanton / Garfield Heights',
    ward: 'Ward 8',
    color: '#7C9A86',
    centroid: [38.8560, -76.9780],
    polygon: [
      [38.866, -76.988],
      [38.864, -76.965],
      [38.845, -76.968],
      [38.848, -76.990],
    ],
    baseMonthlyRent: 1650,
    baseNightlyRate: 125,
  },
};

export const CANONICAL_NEIGHBORHOOD_LIST = Object.values(CANONICAL_NEIGHBORHOODS);

/**
 * Finds the canonical neighborhood by full or partial name.
 * Always resolves Dupont Circle to Ward 2.
 */
export function getCanonicalNeighborhood(name: string): CanonicalNeighborhood {
  if (CANONICAL_NEIGHBORHOODS[name]) {
    return CANONICAL_NEIGHBORHOODS[name];
  }

  const clean = name.toLowerCase().trim();

  // Explicit Dupont check
  if (clean.includes('dupont')) {
    return CANONICAL_NEIGHBORHOODS['Dupont Circle, Connecticut Avenue/K Street'];
  }

  const found = CANONICAL_NEIGHBORHOOD_LIST.find((n) => {
    const fn = n.name.toLowerCase();
    const sn = n.shortName.toLowerCase();
    return (
      clean === fn ||
      clean === sn ||
      fn.includes(clean) ||
      clean.includes(sn) ||
      sn.includes(clean) ||
      fn.split(',')[0].trim() === clean.split(',')[0].trim()
    );
  });

  return found || CANONICAL_NEIGHBORHOODS['Dupont Circle, Connecticut Avenue/K Street'];
}

export interface ScenarioCalculationResult {
  neighborhood: CanonicalNeighborhood;
  ward: string;
  isEligible: boolean;
  ineligibilityReason?: string;
  adjustedMonthlyRent: number;
  adjustedNightlyRate: number;
  sources: {
    rent: string;
    rate: string;
  };
  longTerm: {
    monthlyRent: number;
    grossAnnual: number;
    managementAndMaintCost: number;
    netAnnual: number;
  };
  airbnbUnhosted: {
    allowedNights: number; // 90
    grossAnnual: number;
    tltTax: number; // 14.95%
    platformFees: number; // 3%
    cleaningAndOps: number; // 12%
    dlcpLicenseAnnual: number; // $138 ($275 biennial)
    totalDeductions: number;
    netAnnual: number;
  };
  airbnbHosted: {
    typicalNights: number; // 210
    grossAnnual: number;
    tltTax: number;
    platformFees: number;
    cleaningAndOps: number;
    dlcpLicenseAnnual: number;
    totalDeductions: number;
    netAnnual: number;
  };
  breakevenNights: number;
  unhostedNetDelta: number; // longTerm.netAnnual - airbnbUnhosted.netAnnual
  hostedNetDelta: number; // airbnbHosted.netAnnual - longTerm.netAnnual
  verdictSummary: string;
}

/**
 * Calculates identical three-column comparison numbers, gross/net breakdowns,
 * and breakeven point from single source of truth.
 */
export function calculateCanonicalScenario(params: {
  neighborhoodName: string;
  bedrooms: number; // 0 = Studio, 1, 2, 3, 4+
  spaceType: 'Entire home/apt' | 'Private room';
  isPrimaryResidence: boolean;
  isHoaAllowed: boolean;
  overrideNightlyRate?: number;
  overrideMonthlyRent?: number;
}): ScenarioCalculationResult {
  const neighborhood = getCanonicalNeighborhood(params.neighborhoodName);

  // Bedroom scaling multipliers
  // Studio = 0.85, 1BR = 1.0, 2BR = 1.25, 3BR = 1.55, 4BR+ = 1.85
  const bedMultipliers: Record<number, number> = {
    0: 0.85,
    1: 1.0,
    2: 1.25,
    3: 1.55,
    4: 1.85,
  };
  const bedMult = bedMultipliers[Math.min(4, Math.max(0, params.bedrooms))] || 1.0;

  // Space type multiplier
  const spaceMult = params.spaceType === 'Private room' ? 0.58 : 1.0;

  // Rates
  const adjustedMonthlyRent =
    params.overrideMonthlyRent && params.overrideMonthlyRent > 0
      ? params.overrideMonthlyRent
      : Math.round(neighborhood.baseMonthlyRent * bedMult);

  const adjustedNightlyRate =
    params.overrideNightlyRate && params.overrideNightlyRate > 0
      ? params.overrideNightlyRate
      : Math.round(neighborhood.baseNightlyRate * bedMult * spaceMult);

  // Eligibility check
  let isEligible = true;
  let ineligibilityReason = '';

  if (!params.isPrimaryResidence) {
    isEligible = false;
    ineligibilityReason =
      'Under D.C. Law 22-307, short-term rentals are restricted exclusively to your primary residence (homestead deduction required). Second homes, pure investments, and LLC-owned properties cannot legally host short-term rentals in D.C.';
  } else if (!params.isHoaAllowed) {
    isEligible = false;
    ineligibilityReason =
      'Your condo association bylaws, HOA rules, or master lease prohibit short-term rentals. Operating without association approval risks immediate civil fines and lease termination.';
  }

  // 1. Long-Term Lease Financials
  const ltGrossAnnual = adjustedMonthlyRent * 12;
  const ltMaintRate = 0.08; // 8% maintenance & vacancy reserve
  const ltMaintCost = Math.round(ltGrossAnnual * ltMaintRate);
  const ltNetAnnual = ltGrossAnnual - ltMaintCost;

  // Deduction rates for Airbnb
  const tltRate = 0.1495; // 14.95% DC Transient Lodging Tax
  const platformRate = 0.03; // 3% host platform fee
  const cleaningRate = 0.12; // 12% turnover, laundry & consumables
  const annualDlcpLicense = 138; // $275 biennial DLCP fee = $137.50/yr

  // 2. Airbnb Unhosted (90 Nights Cap under DC Law 22-307)
  const unhostedNights = 90;
  const unhostedGross = adjustedNightlyRate * unhostedNights;
  const unhostedTlt = Math.round(unhostedGross * tltRate);
  const unhostedPlatform = Math.round(unhostedGross * platformRate);
  const unhostedCleaning = Math.round(unhostedGross * cleaningRate);
  const unhostedDeductions = unhostedTlt + unhostedPlatform + unhostedCleaning + annualDlcpLicense;
  const unhostedNet = Math.max(0, unhostedGross - unhostedDeductions);

  // 3. Airbnb Hosted (365 Days Allowed / 210 Typical Booked Nights)
  const hostedTypicalNights = 210;
  const hostedGross = adjustedNightlyRate * hostedTypicalNights;
  const hostedTlt = Math.round(hostedGross * tltRate);
  const hostedPlatform = Math.round(hostedGross * platformRate);
  const hostedCleaning = Math.round(hostedGross * cleaningRate);
  const hostedDeductions = hostedTlt + hostedPlatform + hostedCleaning + annualDlcpLicense;
  const hostedNet = Math.max(0, hostedGross - hostedDeductions);

  // 4. Breakeven Nights (Net nights required to match Long-Term Net)
  const netRetainedPerNightRate = adjustedNightlyRate * (1 - (tltRate + platformRate + cleaningRate));
  const breakevenNights =
    netRetainedPerNightRate > 0
      ? Math.ceil((ltNetAnnual + annualDlcpLicense) / netRetainedPerNightRate)
      : 180;

  // Deltas
  const unhostedNetDelta = ltNetAnnual - unhostedNet; // positive means lease wins
  const hostedNetDelta = hostedNet - ltNetAnnual; // positive means hosted wins

  // Live Verdict Summary string
  let verdictSummary = '';
  if (!isEligible) {
    verdictSummary = `Not Eligible for STR · 12-Month Lease is your legal path · $${ltGrossAnnual.toLocaleString()}/yr`;
  } else if (unhostedNetDelta > 0) {
    verdictSummary = `Eligible (90-day cap) · Lease wins by $${unhostedNetDelta.toLocaleString()}/yr net · Breakeven ${breakevenNights} nights`;
  } else {
    verdictSummary = `Eligible (90-day cap) · Airbnb unhosted ahead by $${Math.abs(unhostedNetDelta).toLocaleString()}/yr net · Breakeven ${breakevenNights} nights`;
  }

  return {
    neighborhood,
    ward: neighborhood.ward,
    isEligible,
    ineligibilityReason,
    adjustedMonthlyRent,
    adjustedNightlyRate,
    sources: {
      rent: 'D.C. DHCD Rent Registry (Q4 2025)',
      rate: 'D.C. Open Airbnb Dataset (2025–2026)',
    },
    longTerm: {
      monthlyRent: adjustedMonthlyRent,
      grossAnnual: ltGrossAnnual,
      managementAndMaintCost: ltMaintCost,
      netAnnual: ltNetAnnual,
    },
    airbnbUnhosted: {
      allowedNights: unhostedNights,
      grossAnnual: unhostedGross,
      tltTax: unhostedTlt,
      platformFees: unhostedPlatform,
      cleaningAndOps: unhostedCleaning,
      dlcpLicenseAnnual: annualDlcpLicense,
      totalDeductions: unhostedDeductions,
      netAnnual: unhostedNet,
    },
    airbnbHosted: {
      typicalNights: hostedTypicalNights,
      grossAnnual: hostedGross,
      tltTax: hostedTlt,
      platformFees: hostedPlatform,
      cleaningAndOps: hostedCleaning,
      dlcpLicenseAnnual: annualDlcpLicense,
      totalDeductions: hostedDeductions,
      netAnnual: hostedNet,
    },
    breakevenNights,
    unhostedNetDelta,
    hostedNetDelta,
    verdictSummary,
  };
}
