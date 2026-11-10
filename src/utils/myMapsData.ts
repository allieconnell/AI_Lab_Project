import rawBoundaries from '../../public/assets/dc_my_maps_neighborhoods.json';

export interface MyMapsNeighborhoodBoundary {
  id: string;
  name: string;
  fullName: string;
  ward: string;
  color: string;
  centroid: [number, number];
  polygon: [number, number][];
}

/**
 * All 126 authentic DC neighborhood outlines from Google My Maps.
 * Ensures Dupont Circle is canonicalized to Ward 2.
 */
export const DC_MY_MAPS_BOUNDARIES: MyMapsNeighborhoodBoundary[] = (
  rawBoundaries as MyMapsNeighborhoodBoundary[]
).map((b) => {
  const isDupont = b.name.toLowerCase().includes('dupont');
  return {
    ...b,
    ward: isDupont ? 'Ward 2' : b.ward,
  };
});

/**
 * Filter boundaries by Ward (or 'All').
 */
export function getBoundariesByWard(ward: string = 'All'): MyMapsNeighborhoodBoundary[] {
  if (!ward || ward.toLowerCase() === 'all') {
    return DC_MY_MAPS_BOUNDARIES;
  }
  return DC_MY_MAPS_BOUNDARIES.filter(
    (b) => b.ward.toLowerCase() === ward.toLowerCase()
  );
}

/**
 * Match a neighborhood name to its authentic My Maps boundary polygon.
 */
export function findMyMapsBoundary(name: string): MyMapsNeighborhoodBoundary | undefined {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();

  // Explicit Dupont Circle check
  if (clean.includes('dupont')) {
    return DC_MY_MAPS_BOUNDARIES.find((b) => b.name.toLowerCase().includes('dupont'));
  }

  // Exact or partial match
  return (
    DC_MY_MAPS_BOUNDARIES.find((b) => b.name.toLowerCase() === clean) ||
    DC_MY_MAPS_BOUNDARIES.find((b) => clean.includes(b.name.toLowerCase())) ||
    DC_MY_MAPS_BOUNDARIES.find((b) => b.name.toLowerCase().includes(clean.split(',')[0].trim()))
  );
}
