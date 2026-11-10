export interface NeighborhoodBoundary {
  name: string;
  shortName: string;
  ward: string;
  color: string;
  centroid: [number, number];
  polygon: [number, number][];
}

// Earthy Boho Organic palette for neighborhood polygons
// Rich terracottas, sage greens, warm ochres, forest moss, dusty rose, warm sands
export const NEIGHBORHOOD_BOUNDARIES: Record<string, NeighborhoodBoundary> = {
  'Brightwood Park, Crestwood, Petworth': {
    name: 'Brightwood Park, Crestwood, Petworth',
    shortName: 'Petworth / Brightwood Park',
    ward: 'Ward 4',
    color: '#D4A373', // Warm Ochre
    centroid: [38.9505, -77.0272],
    polygon: [
      [38.968, -77.042],
      [38.968, -77.015],
      [38.938, -77.015],
      [38.936, -77.035],
      [38.948, -77.045],
    ],
  },
  'Brookland, Brentwood, Langdon': {
    name: 'Brookland, Brentwood, Langdon',
    shortName: 'Brookland / Brentwood',
    ward: 'Ward 5',
    color: '#7C9A86', // Soft Sage
    centroid: [38.9312, -76.9856],
    polygon: [
      [38.946, -77.002],
      [38.942, -76.968],
      [38.918, -76.972],
      [38.922, -77.005],
    ],
  },
  'Capitol Hill, Lincoln Park': {
    name: 'Capitol Hill, Lincoln Park',
    shortName: 'Capitol Hill',
    ward: 'Ward 6',
    color: '#E08E6D', // Terracotta Peach
    centroid: [38.8899, -76.9950],
    polygon: [
      [38.902, -77.012],
      [38.901, -76.978],
      [38.878, -76.978],
      [38.878, -77.008],
      [38.888, -77.015],
    ],
  },
  'Capitol View, Marshall Heights, Benning Heights': {
    name: 'Capitol View, Marshall Heights, Benning Heights',
    shortName: 'Capitol View / Marshall Heights',
    ward: 'Ward 7',
    color: '#BA7967', // Warm Clay
    centroid: [38.8885, -76.9280],
    polygon: [
      [38.898, -76.942],
      [38.895, -76.915],
      [38.876, -76.918],
      [38.878, -76.945],
    ],
  },
  'Cathedral Heights, McLean Gardens, Glover Park': {
    name: 'Cathedral Heights, McLean Gardens, Glover Park',
    shortName: 'Glover Park / Cathedral Heights',
    ward: 'Ward 3',
    color: '#4A6B5D', // Olive Moss
    centroid: [38.9288, -77.0765],
    polygon: [
      [38.941, -77.088],
      [38.940, -77.068],
      [38.918, -77.069],
      [38.919, -77.085],
    ],
  },
  'Cleveland Park, Woodley Park, Massachusetts Avenue Heights, Woodland-Normanstone Terrace': {
    name: 'Cleveland Park, Woodley Park, Massachusetts Avenue Heights, Woodland-Normanstone Terrace',
    shortName: 'Cleveland Park / Woodley Park',
    ward: 'Ward 3',
    color: '#3D5A4C', // Deep Forest
    centroid: [38.9388, -77.0635],
    polygon: [
      [38.952, -77.075],
      [38.950, -77.050],
      [38.925, -77.052],
      [38.926, -77.072],
    ],
  },
  'Colonial Village, Shepherd Park, North Portal Estates': {
    name: 'Colonial Village, Shepherd Park, North Portal Estates',
    shortName: 'Shepherd Park / Colonial Village',
    ward: 'Ward 4',
    color: '#C87D55', // Burnt Ochre
    centroid: [38.9850, -77.0380],
    polygon: [
      [38.998, -77.046],
      [38.995, -77.025],
      [38.972, -77.028],
      [38.974, -77.045],
    ],
  },
  'Columbia Heights, Mt. Pleasant, Pleasant Plains, Park View': {
    name: 'Columbia Heights, Mt. Pleasant, Pleasant Plains, Park View',
    shortName: 'Columbia Heights / Mt. Pleasant',
    ward: 'Ward 1',
    color: '#E29578', // Muted Coral
    centroid: [38.9295, -77.0326],
    polygon: [
      [38.941, -77.045],
      [38.940, -77.018],
      [38.919, -77.020],
      [38.918, -77.044],
    ],
  },
  'Congress Heights, Bellevue, Washington Highlands': {
    name: 'Congress Heights, Bellevue, Washington Highlands',
    shortName: 'Congress Heights / Bellevue',
    ward: 'Ward 8',
    color: '#8D6B94', // Dusty Heather
    centroid: [38.8412, -77.0012],
    polygon: [
      [38.858, -77.015],
      [38.855, -76.985],
      [38.825, -76.995],
      [38.828, -77.022],
    ],
  },
  'Deanwood, Burrville, Grant Park, Lincoln Heights, Fairmont Heights': {
    name: 'Deanwood, Burrville, Grant Park, Lincoln Heights, Fairmont Heights',
    shortName: 'Deanwood / Burrville',
    ward: 'Ward 7',
    color: '#C38D9E', // Dusky Rose
    centroid: [38.8988, -76.9285],
    polygon: [
      [38.915, -76.938],
      [38.910, -76.912],
      [38.888, -76.916],
      [38.890, -76.942],
    ],
  },
  'Douglas, Shipley Terrace': {
    name: 'Douglas, Shipley Terrace',
    shortName: 'Douglas / Shipley Terrace',
    ward: 'Ward 8',
    color: '#A25F4B', // Sienna
    centroid: [38.8520, -76.9880],
    polygon: [
      [38.862, -76.998],
      [38.860, -76.975],
      [38.842, -76.978],
      [38.845, -76.999],
    ],
  },
  'Downtown, Chinatown, Penn Quarters, Mount Vernon Square, North Capitol Street': {
    name: 'Downtown, Chinatown, Penn Quarters, Mount Vernon Square, North Capitol Street',
    shortName: 'Downtown / Chinatown / Penn Quarter',
    ward: 'Ward 2',
    color: '#C08081', // Dusty Terracotta
    centroid: [38.9010, -77.0220],
    polygon: [
      [38.909, -77.034],
      [38.908, -77.010],
      [38.892, -77.011],
      [38.893, -77.035],
    ],
  },
  'Dupont Circle, Connecticut Avenue/K Street': {
    name: 'Dupont Circle, Connecticut Avenue/K Street',
    shortName: 'Dupont Circle / Conn Ave',
    ward: 'Ward 2',
    color: '#E08E6D', // Terracotta Peach
    centroid: [38.9096, -77.0434],
    polygon: [
      [38.919, -77.054],
      [38.918, -77.034],
      [38.900, -77.035],
      [38.901, -77.052],
    ],
  },
  'Eastland Gardens, Kenilworth': {
    name: 'Eastland Gardens, Kenilworth',
    shortName: 'Kenilworth / Eastland Gardens',
    ward: 'Ward 7',
    color: '#7C9A86', // Soft Sage
    centroid: [38.9150, -76.9450],
    polygon: [
      [38.928, -76.958],
      [38.925, -76.935],
      [38.902, -76.938],
      [38.905, -76.959],
    ],
  },
  'Edgewood, Bloomingdale, Truxton Circle, Eckington': {
    name: 'Edgewood, Bloomingdale, Truxton Circle, Eckington',
    shortName: 'Bloomingdale / Eckington',
    ward: 'Ward 5',
    color: '#D4A373', // Warm Ochre
    centroid: [38.9160, -77.0070],
    polygon: [
      [38.927, -77.018],
      [38.926, -76.996],
      [38.905, -76.998],
      [38.906, -77.019],
    ],
  },
  'Fairfax Village, Naylor Gardens, Hillcrest, Summit Park': {
    name: 'Fairfax Village, Naylor Gardens, Hillcrest, Summit Park',
    shortName: 'Hillcrest / Naylor Gardens',
    ward: 'Ward 7',
    color: '#BA7967', // Warm Clay
    centroid: [38.8650, -76.9550],
    polygon: [
      [38.878, -76.968],
      [38.875, -76.942],
      [38.852, -76.946],
      [38.855, -76.970],
    ],
  },
  'Friendship Heights, American University Park, Tenleytown': {
    name: 'Friendship Heights, American University Park, Tenleytown',
    shortName: 'Tenleytown / Friendship Heights',
    ward: 'Ward 3',
    color: '#4A6B5D', // Olive Moss
    centroid: [38.9500, -77.0850],
    polygon: [
      [38.965, -77.098],
      [38.962, -77.072],
      [38.938, -77.075],
      [38.940, -77.099],
    ],
  },
  'Georgetown, Burleith/Hillandale': {
    name: 'Georgetown, Burleith/Hillandale',
    shortName: 'Georgetown / Burleith',
    ward: 'Ward 2',
    color: '#A25F4B', // Sienna Earth
    centroid: [38.9076, -77.0687],
    polygon: [
      [38.918, -77.082],
      [38.917, -77.056],
      [38.900, -77.058],
      [38.901, -77.080],
    ],
  },
  'Hawthorne, Barnaby Woods, Chevy Chase': {
    name: 'Hawthorne, Barnaby Woods, Chevy Chase',
    shortName: 'Chevy Chase / Barnaby Woods',
    ward: 'Ward 3',
    color: '#3D5A4C', // Forest Green
    centroid: [38.9720, -77.0680],
    polygon: [
      [38.992, -77.082],
      [38.990, -77.052],
      [38.958, -77.055],
      [38.960, -77.084],
    ],
  },
  'Historic Anacostia': {
    name: 'Historic Anacostia',
    shortName: 'Historic Anacostia',
    ward: 'Ward 8',
    color: '#C87D55', // Burnt Ochre
    centroid: [38.8680, -76.9850],
    polygon: [
      [38.878, -76.995],
      [38.875, -76.972],
      [38.858, -76.976],
      [38.860, -76.998],
    ],
  },
  'Howard University, Le Droit Park, Cardozo/Shaw': {
    name: 'Howard University, Le Droit Park, Cardozo/Shaw',
    shortName: 'LeDroit Park / Shaw North',
    ward: 'Ward 1',
    color: '#E08E6D', // Terracotta
    centroid: [38.9180, -77.0210],
    polygon: [
      [38.926, -77.029],
      [38.925, -77.012],
      [38.910, -77.014],
      [38.912, -77.031],
    ],
  },
  'Ivy City, Arboretum, Trinidad, Carver Langston': {
    name: 'Ivy City, Arboretum, Trinidad, Carver Langston',
    shortName: 'Ivy City / Trinidad / Arboretum',
    ward: 'Ward 5',
    color: '#7C9A86', // Soft Sage
    centroid: [38.9080, -76.9750],
    polygon: [
      [38.919, -76.988],
      [38.915, -76.955],
      [38.898, -76.958],
      [38.900, -76.989],
    ],
  },
  'Kalorama Heights, Adams Morgan, Lanier Heights': {
    name: 'Kalorama Heights, Adams Morgan, Lanier Heights',
    shortName: 'Adams Morgan / Kalorama',
    ward: 'Ward 1',
    color: '#D4A373', // Warm Sandstone
    centroid: [38.9215, -77.0441],
    polygon: [
      [38.929, -77.056],
      [38.928, -77.036],
      [38.912, -77.038],
      [38.914, -77.055],
    ],
  },
  'Near Southeast, Navy Yard': {
    name: 'Near Southeast, Navy Yard',
    shortName: 'Navy Yard / Near Southeast',
    ward: 'Ward 6',
    color: '#E08E6D', // Terracotta Peach
    centroid: [38.8766, -77.0035],
    polygon: [
      [38.884, -77.014],
      [38.883, -76.992],
      [38.868, -76.994],
      [38.870, -77.015],
    ],
  },
  'North Cleveland Park, Forest Hills, Van Ness': {
    name: 'North Cleveland Park, Forest Hills, Van Ness',
    shortName: 'Van Ness / Forest Hills',
    ward: 'Ward 3',
    color: '#4A6B5D', // Olive Moss
    centroid: [38.9480, -77.0650],
    polygon: [
      [38.960, -77.075],
      [38.958, -77.052],
      [38.938, -77.055],
      [38.940, -77.076],
    ],
  },
  'North Michigan Park, Michigan Park, University Heights': {
    name: 'North Michigan Park, Michigan Park, University Heights',
    shortName: 'Michigan Park / University Heights',
    ward: 'Ward 5',
    color: '#BA7967', // Warm Clay
    centroid: [38.9500, -76.9850],
    polygon: [
      [38.962, -76.996],
      [38.958, -76.972],
      [38.938, -76.975],
      [38.940, -76.998],
    ],
  },
  'Shaw, Logan Circle': {
    name: 'Shaw, Logan Circle',
    shortName: 'Shaw / Logan Circle',
    ward: 'Ward 2',
    color: '#C87D55', // Burnt Ochre
    centroid: [38.9118, -77.0242],
    polygon: [
      [38.919, -77.035],
      [38.918, -77.018],
      [38.904, -77.020],
      [38.905, -77.036],
    ],
  },
  'Southwest Employment Area, Southwest/Waterfront, Fort McNair, Buzzard Point': {
    name: 'Southwest Employment Area, Southwest/Waterfront, Fort McNair, Buzzard Point',
    shortName: 'Southwest Waterfront / Buzzard Point',
    ward: 'Ward 6',
    color: '#4A6B5D', // Olive Moss
    centroid: [38.8740, -77.0180],
    polygon: [
      [38.885, -77.032],
      [38.884, -77.008],
      [38.860, -77.012],
      [38.862, -77.030],
    ],
  },
  'Spring Valley, Palisades, Wesley Heights, Foxhall Crescent, Foxhall Village, Georgetown Reservoir': {
    name: 'Spring Valley, Palisades, Wesley Heights, Foxhall Crescent, Foxhall Village, Georgetown Reservoir',
    shortName: 'Palisades / Spring Valley / Wesley Heights',
    ward: 'Ward 3',
    color: '#3D5A4C', // Forest Green
    centroid: [38.9250, -77.0980],
    polygon: [
      [38.945, -77.115],
      [38.942, -77.085],
      [38.908, -77.092],
      [38.912, -77.118],
    ],
  },
  'Takoma, Brightwood, Manor Park': {
    name: 'Takoma, Brightwood, Manor Park',
    shortName: 'Takoma / Manor Park',
    ward: 'Ward 4',
    color: '#D4A373', // Warm Sandstone
    centroid: [38.9744, -77.0199],
    polygon: [
      [38.988, -77.032],
      [38.985, -77.005],
      [38.962, -77.008],
      [38.964, -77.035],
    ],
  },
  'Union Station, Stanton Park, Kingman Park': {
    name: 'Union Station, Stanton Park, Kingman Park',
    shortName: 'NoMa / Union Station / Kingman Park',
    ward: 'Ward 6',
    color: '#E08E6D', // Terracotta Peach
    centroid: [38.8980, -76.9920],
    polygon: [
      [38.908, -77.008],
      [38.906, -76.975],
      [38.889, -76.978],
      [38.891, -77.009],
    ],
  },
  'West End, Foggy Bottom, GWU': {
    name: 'West End, Foggy Bottom, GWU',
    shortName: 'West End / Foggy Bottom',
    ward: 'Ward 2',
    color: '#C08081', // Dusty Terracotta
    centroid: [38.9020, -77.0500],
    polygon: [
      [38.910, -77.060],
      [38.909, -77.042],
      [38.892, -77.044],
      [38.893, -77.062],
    ],
  },
  'Woodridge, Fort Lincoln, Gateway': {
    name: 'Woodridge, Fort Lincoln, Gateway',
    shortName: 'Woodridge / Fort Lincoln',
    ward: 'Ward 5',
    color: '#7C9A86', // Soft Sage
    centroid: [38.9320, -76.9620],
    polygon: [
      [38.945, -76.975],
      [38.942, -76.945],
      [38.918, -76.948],
      [38.920, -76.976],
    ],
  },
  'Lamont Riggs, Queens Chapel, Fort Totten, Pleasant Hill': {
    name: 'Lamont Riggs, Queens Chapel, Fort Totten, Pleasant Hill',
    shortName: 'Fort Totten / Lamont Riggs',
    ward: 'Ward 4',
    color: '#C87D55', // Burnt Ochre
    centroid: [38.9550, -77.0010],
    polygon: [
      [38.966, -77.014],
      [38.964, -76.988],
      [38.944, -76.990],
      [38.945, -77.016],
    ],
  },
  'Mayfair, Hillbrook, Mahaning Heights': {
    name: 'Mayfair, Hillbrook, Mahaning Heights',
    shortName: 'Mayfair / Hillbrook',
    ward: 'Ward 7',
    color: '#BA7967', // Warm Clay
    centroid: [38.8980, -76.9450],
    polygon: [
      [38.908, -76.958],
      [38.905, -76.932],
      [38.888, -76.935],
      [38.890, -76.959],
    ],
  },
  'River Terrace, Benning, Greenway, Dupont Park': {
    name: 'River Terrace, Benning, Greenway, Dupont Park',
    shortName: 'River Terrace / Benning / Greenway',
    ward: 'Ward 7',
    color: '#E08E6D', // Terracotta
    centroid: [38.8860, -76.9560],
    polygon: [
      [38.896, -76.968],
      [38.894, -76.942],
      [38.875, -76.946],
      [38.878, -76.970],
    ],
  },
  'Sheridan, Barry Farm, Buena Vista': {
    name: 'Sheridan, Barry Farm, Buena Vista',
    shortName: 'Barry Farm / Buena Vista / Sheridan',
    ward: 'Ward 8',
    color: '#8D6B94', // Dusty Heather
    centroid: [38.8600, -76.9920],
    polygon: [
      [38.870, -77.004],
      [38.868, -76.980],
      [38.850, -76.984],
      [38.852, -77.006],
    ],
  },
  'Twining, Fairlawn, Randle Highlands, Penn Branch, Fort Davis Park, Fort Dupont': {
    name: 'Twining, Fairlawn, Randle Highlands, Penn Branch, Fort Davis Park, Fort Dupont',
    shortName: 'Penn Branch / Fort Dupont / Fairlawn',
    ward: 'Ward 7',
    color: '#A25F4B', // Sienna Earth
    centroid: [38.8740, -76.9620],
    polygon: [
      [38.886, -76.974],
      [38.884, -76.948],
      [38.862, -76.952],
      [38.865, -76.976],
    ],
  },
  'Woodland/Fort Stanton, Garfield Heights, Knox Hill': {
    name: 'Woodland/Fort Stanton, Garfield Heights, Knox Hill',
    shortName: 'Fort Stanton / Garfield Heights',
    ward: 'Ward 8',
    color: '#7C9A86', // Soft Sage
    centroid: [38.8560, -76.9780],
    polygon: [
      [38.866, -76.988],
      [38.864, -76.965],
      [38.845, -76.968],
      [38.848, -76.990],
    ],
  },
};

/**
 * Returns the default neighborhood boundary for a given name,
 * with graceful fallback.
 */
export function getNeighborhoodBoundary(name: string): NeighborhoodBoundary {
  if (NEIGHBORHOOD_BOUNDARIES[name]) {
    return NEIGHBORHOOD_BOUNDARIES[name];
  }
  // Try partial match
  const matchKey = Object.keys(NEIGHBORHOOD_BOUNDARIES).find((k) =>
    name.toLowerCase().includes(k.split(',')[0].toLowerCase()) ||
    k.toLowerCase().includes(name.split(',')[0].toLowerCase())
  );
  if (matchKey) {
    return NEIGHBORHOOD_BOUNDARIES[matchKey];
  }
  // Fallback to central DC
  return {
    name,
    shortName: name.split(',')[0],
    ward: 'Ward 2',
    color: '#E08E6D',
    centroid: [38.9072, -77.0369],
    polygon: [
      [38.915, -77.045],
      [38.914, -77.025],
      [38.900, -77.026],
      [38.901, -77.046],
    ],
  };
}

/**
 * Deterministically generates a coordinate for an individual Airbnb listing
 * inside its neighborhood boundary based on its unique ID.
 */
export function getListingCoordinates(
  listingId: string,
  neighbourhoodName: string
): [number, number] {
  const boundary = getNeighborhoodBoundary(neighbourhoodName);
  const [cLat, cLng] = boundary.centroid;

  // Simple string hash
  let hash = 0;
  for (let i = 0; i < listingId.length; i++) {
    hash = (hash << 5) - hash + listingId.charCodeAt(i);
    hash |= 0;
  }

  // Generate bounded pseudo-random offset (-0.007 to +0.007 degrees ~ 700m radius)
  const norm1 = ((Math.abs(hash) % 1000) / 1000) - 0.5;
  const norm2 = ((Math.abs(hash * 31) % 1000) / 1000) - 0.5;

  const latOffset = norm1 * 0.012;
  const lngOffset = norm2 * 0.015;

  return [cLat + latOffset, cLng + lngOffset];
}
