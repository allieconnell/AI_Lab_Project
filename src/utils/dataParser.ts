import { AirbnbListing, LongTermComparable, RevenueLookupItem } from '../types/rental';

/**
 * Robust CSV parser handling commas inside quotes.
 */
export function parseCSVRows(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  const rows: string[][] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const row: string[] = [];
    let insideQuotes = false;
    let entry = '';

    for (let c = 0; c < line.length; c++) {
      const char = line[charIndex(c)];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    rows.push(row);
  }

  function charIndex(idx: number): number {
    return idx;
  }

  return rows;
}

export function cleanValue(val: string): string {
  if (!val) return '';
  if (val.startsWith('"') && val.endsWith('"')) {
    return val.substring(1, val.length - 1).trim();
  }
  return val.trim();
}

export function parseAirbnbListings(csvText: string): AirbnbListing[] {
  const rows = parseCSVRows(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => cleanValue(h).toLowerCase());
  const idx = {
    id: headers.indexOf('id'),
    neighbourhood: headers.indexOf('neighbourhood'),
    room_type: headers.indexOf('room_type'),
    bedrooms: headers.indexOf('bedrooms'),
    accommodates: headers.indexOf('accommodates'),
    price_clean: headers.indexOf('price_clean'),
    occupancy_est: headers.indexOf('occupancy_est'),
    occ_at_ceiling: headers.indexOf('occ_at_ceiling'),
    reviews_ltm: headers.indexOf('reviews_ltm'),
    revenue_comp: headers.indexOf('revenue_comp'),
    pro_host: headers.indexOf('pro_host'),
    minimum_nights: headers.indexOf('minimum_nights'),
    sample_weight: headers.indexOf('sample_weight'),
  };

  const listings: AirbnbListing[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 6) continue;

    const price = parseFloat(row[idx.price_clean]) || 0;
    if (price <= 0 || isNaN(price)) continue;

    listings.push({
      id: cleanValue(row[idx.id] || `listing-${i}`),
      neighbourhood: cleanValue(row[idx.neighbourhood] || 'Washington, D.C.'),
      room_type: cleanValue(row[idx.room_type] || 'Entire home/apt'),
      bedrooms: Math.max(0, parseFloat(row[idx.bedrooms]) || 0),
      accommodates: Math.max(1, parseFloat(row[idx.accommodates]) || 1),
      price_clean: price,
      occupancy_est: Math.max(0, parseFloat(row[idx.occupancy_est]) || 0),
      occ_at_ceiling: row[idx.occ_at_ceiling]?.toLowerCase() === 'true',
      reviews_ltm: Math.max(0, parseFloat(row[idx.reviews_ltm]) || 0),
      revenue_comp: Math.max(0, parseFloat(row[idx.revenue_comp]) || 0),
      pro_host: row[idx.pro_host]?.toLowerCase() === 'true',
      minimum_nights: Math.max(1, parseFloat(row[idx.minimum_nights]) || 1),
      sample_weight: parseFloat(row[idx.sample_weight]) || 1,
    });
  }

  return listings;
}

export function parseWard2Listings(csvText: string): AirbnbListing[] {
  const rows = parseCSVRows(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => cleanValue(h).toLowerCase());
  const idx = {
    id: headers.indexOf('id'),
    name: headers.indexOf('name'),
    host_name: headers.indexOf('host_name'),
    neighbourhood: headers.indexOf('neighbourhood'),
    room_type: headers.indexOf('room_type'),
    bedrooms: headers.indexOf('bedrooms'),
    accommodates: headers.indexOf('accommodates'),
    price_clean: headers.indexOf('price_clean'),
    occupancy_est: headers.indexOf('occupancy_est'),
    occ_at_ceiling: headers.indexOf('occ_at_ceiling'),
    reviews_ltm: headers.indexOf('reviews_ltm'),
    revenue_comp: headers.indexOf('revenue_comp'),
    pro_host: headers.indexOf('pro_host'),
    minimum_nights: headers.indexOf('minimum_nights'),
    area: headers.indexOf('area'),
  };

  const listings: AirbnbListing[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 6) continue;

    const price = parseFloat(row[idx.price_clean]) || 0;
    if (price <= 0 || isNaN(price)) continue;

    listings.push({
      id: cleanValue(row[idx.id] || `w2-${i}`),
      name: cleanValue(row[idx.name] || ''),
      host_name: cleanValue(row[idx.host_name] || ''),
      neighbourhood: cleanValue(row[idx.neighbourhood] || 'Dupont Circle, Connecticut Avenue/K Street'),
      room_type: cleanValue(row[idx.room_type] || 'Entire home/apt'),
      bedrooms: Math.max(0, parseFloat(row[idx.bedrooms]) || 0),
      accommodates: Math.max(1, parseFloat(row[idx.accommodates]) || 1),
      price_clean: price,
      occupancy_est: Math.max(0, parseFloat(row[idx.occupancy_est]) || 0),
      occ_at_ceiling: row[idx.occ_at_ceiling]?.toLowerCase() === 'true',
      reviews_ltm: Math.max(0, parseFloat(row[idx.reviews_ltm]) || 0),
      revenue_comp: Math.max(0, parseFloat(row[idx.revenue_comp]) || 0),
      pro_host: row[idx.pro_host]?.toLowerCase() === 'true',
      minimum_nights: Math.max(1, parseFloat(row[idx.minimum_nights]) || 1),
      sample_weight: 1,
      area: cleanValue(row[idx.area] || 'Ward 2'),
    });
  }

  return listings;
}

export function parseLongTermComparables(csvText: string): LongTermComparable[] {
  const rows = parseCSVRows(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => cleanValue(h).toLowerCase());
  const idx = {
    id: headers.indexOf('registered_accommodation_id'),
    ward: headers.indexOf('ward'),
    latitude: headers.indexOf('latitude'),
    longitude: headers.indexOf('longitude'),
    property_type_code: headers.indexOf('property_type_code'),
    property_type_text: headers.indexOf('property_type_text'),
    rent_monthly: headers.indexOf('rent_monthly'),
    registered_units: headers.indexOf('registered_units'),
    prev_rent_1: headers.indexOf('prev_rent_1'),
    modified_date: headers.indexOf('modified_date'),
  };

  const comparables: LongTermComparable[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 8) continue;

    const rent = parseFloat(row[idx.rent_monthly]) || 0;
    const lat = parseFloat(row[idx.latitude]);
    const lng = parseFloat(row[idx.longitude]);

    // Ignore records with invalid coordinates or zero rent
    if (isNaN(lat) || isNaN(lng) || rent <= 0 || lat < 38.0 || lat > 39.5) continue;

    comparables.push({
      id: cleanValue(row[idx.id] || `comp-${i}`),
      ward: cleanValue(row[idx.ward] || 'Ward 2'),
      latitude: lat,
      longitude: lng,
      property_type_code: parseFloat(row[idx.property_type_code]) || 0,
      property_type_text: cleanValue(row[idx.property_type_text] || 'Apartment/Condo'),
      rent_monthly: rent,
      registered_units: parseFloat(row[idx.registered_units]) || 1,
      prev_rent_1: row[idx.prev_rent_1] ? parseFloat(row[idx.prev_rent_1]) : null,
      modified_date: cleanValue(row[idx.modified_date] || ''),
    });
  }

  return comparables;
}

export function parseRevenueLookup(csvText: string): RevenueLookupItem[] {
  const rows = parseCSVRows(csvText);
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => cleanValue(h).toLowerCase());
  const idx = {
    neighbourhood: headers.indexOf('neighbourhood'),
    room_type: headers.indexOf('room_type'),
    bed: headers.indexOf('bed'),
    n: headers.indexOf('n'),
    median_price: headers.indexOf('median_price'),
    median_occ: headers.indexOf('median_occ'),
    p25_rev: headers.indexOf('p25_rev'),
    median_rev: headers.indexOf('median_rev'),
    p75_rev: headers.indexOf('p75_rev'),
    share_at_ceiling: headers.indexOf('share_at_ceiling'),
    low_sample: headers.indexOf('low_sample'),
  };

  const lookups: RevenueLookupItem[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 6) continue;

    lookups.push({
      neighbourhood: cleanValue(row[idx.neighbourhood]),
      room_type: cleanValue(row[idx.room_type]),
      bed: cleanValue(row[idx.bed]),
      n: parseInt(row[idx.n], 10) || 0,
      median_price: parseFloat(row[idx.median_price]) || 0,
      median_occ: parseFloat(row[idx.median_occ]) || 0,
      p25_rev: parseFloat(row[idx.p25_rev]) || 0,
      median_rev: parseFloat(row[idx.median_rev]) || 0,
      p75_rev: parseFloat(row[idx.p75_rev]) || 0,
      share_at_ceiling: parseFloat(row[idx.share_at_ceiling]) || 0,
      low_sample: row[idx.low_sample]?.toLowerCase() === 'true',
    });
  }

  return lookups;
}

// Approximate centroid coordinates for Washington DC neighborhoods in revenue_lookup
export const DC_NEIGHBORHOOD_CENTROIDS: Record<string, { lat: number; lng: number; ward: string }> = {
  "Brightwood Park, Crestwood, Petworth": { lat: 38.9505, lng: -77.0272, ward: "Ward 4" },
  "Brookland, Brentwood, Langdon": { lat: 38.9312, lng: -76.9856, ward: "Ward 5" },
  "Capitol Hill": { lat: 38.8899, lng: -76.9950, ward: "Ward 6" },
  "Columbia Heights, Mt. Pleasant, Pleasant Plains": { lat: 38.9275, lng: -77.0326, ward: "Ward 1" },
  "Congress Heights, Bellevue, Washington Highlands": { lat: 38.8412, lng: -77.0012, ward: "Ward 8" },
  "Deanwood, Burrville, Grant Park": { lat: 38.8988, lng: -76.9285, ward: "Ward 7" },
  "Downtown, Foggy Bottom, GWU": { lat: 38.8993, lng: -77.0494, ward: "Ward 2" },
  "Dupont Circle, Connecticut Avenue": { lat: 38.9096, lng: -77.0434, ward: "Ward 2" },
  "Georgetown, Burleith": { lat: 38.9076, lng: -77.0687, ward: "Ward 2" },
  "Kalorama Heights, Adams Morgan, Lanier Heights": { lat: 38.9215, lng: -77.0441, ward: "Ward 1" },
  "Navy Yard, Near Southeast": { lat: 38.8766, lng: -77.0035, ward: "Ward 6" },
  "NoMa, Near Northeast": { lat: 38.9054, lng: -76.9995, ward: "Ward 6" },
  "Shaw, Logan Circle": { lat: 38.9118, lng: -77.0242, ward: "Ward 2" },
  "Southwest Waterfront": { lat: 38.8785, lng: -77.0182, ward: "Ward 6" },
  "Takoma, Manor Park": { lat: 38.9744, lng: -77.0199, ward: "Ward 4" },
  "Woodley Park, Cleveland Park, Van Ness": { lat: 38.9388, lng: -77.0635, ward: "Ward 3" }
};
