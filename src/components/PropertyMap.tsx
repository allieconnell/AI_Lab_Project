import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { AirbnbListing, LongTermComparable, RevenueLookupItem } from '../types/rental';
import {
  NEIGHBORHOOD_BOUNDARIES,
  NeighborhoodBoundary,
  getListingCoordinates,
  getNeighborhoodBoundary,
} from '../utils/dcNeighborhoodPolygons';
import {
  Layers,
  MapPin,
  Filter,
  Sparkles,
  Info,
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Eye,
  Sliders,
} from 'lucide-react';

interface PropertyMapProps {
  airbnbListings: AirbnbListing[];
  longTermListings: LongTermComparable[];
  revenueLookups: RevenueLookupItem[];
  selectedWard: string;
  onSelectWard: (ward: string) => void;
}

function NeighborhoodPolygonsOverlay({
  boundaries,
  activeLayer,
  filterWard,
  onSelectNeighborhood,
  hoveredNeighborhood,
  setHoveredNeighborhood,
}: {
  boundaries: NeighborhoodBoundary[];
  activeLayer: string;
  filterWard: string;
  onSelectNeighborhood: (b: NeighborhoodBoundary) => void;
  hoveredNeighborhood: string | null;
  setHoveredNeighborhood: (name: string | null) => void;
}) {
  const map = useMap();
  const polygonsRef = useRef<google.maps.Polygon[]>([]);
  const tooltipRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    // Create shared floating hover tooltip InfoWindow
    if (!tooltipRef.current) {
      tooltipRef.current = new google.maps.InfoWindow({
        disableAutoPan: true,
        headerDisabled: true,
      });
    }
    const tooltip = tooltipRef.current;

    // Clear old polygons
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    if (activeLayer !== 'all' && activeLayer !== 'neighborhoods') {
      return;
    }

    const filtered = boundaries.filter((b) => {
      if (filterWard !== 'All' && b.ward.toLowerCase() !== filterWard.toLowerCase()) {
        return false;
      }
      return true;
    });

    filtered.forEach((boundary) => {
      const isHovered = hoveredNeighborhood === boundary.name;

      const polygon = new google.maps.Polygon({
        paths: boundary.polygon.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: boundary.color,
        strokeOpacity: isHovered ? 1.0 : 0.75,
        strokeWeight: isHovered ? 3.5 : 2,
        fillColor: boundary.color,
        fillOpacity: isHovered ? 0.55 : 0.35,
        clickable: true,
        map,
        zIndex: 1,
      });

      polygon.addListener('click', () => {
        onSelectNeighborhood(boundary);
      });

      polygon.addListener('mouseover', (e: google.maps.MapMouseEvent) => {
        setHoveredNeighborhood(boundary.name);
        if (e.latLng && tooltip) {
          tooltip.setContent(`
            <div style="font-family: 'DM Sans', -apple-system, sans-serif; padding: 4px 8px; text-align: center;">
              <div style="font-size: 13px; font-weight: 700; color: #2A2320; letter-spacing: -0.01em;">${boundary.name}</div>
              <div style="font-size: 11px; font-weight: 600; color: #4A6B5D; margin-top: 1px;">${boundary.ward} · Click to analyze</div>
            </div>
          `);
          tooltip.setPosition(e.latLng);
          tooltip.open({ map });
        }
      });

      polygon.addListener('mousemove', (e: google.maps.MapMouseEvent) => {
        if (e.latLng && tooltip) {
          tooltip.setPosition(e.latLng);
        }
      });

      polygon.addListener('mouseout', () => {
        setHoveredNeighborhood(null);
        if (tooltip) {
          tooltip.close();
        }
      });

      polygonsRef.current.push(polygon);
    });

    return () => {
      if (tooltipRef.current) {
        tooltipRef.current.close();
      }
      polygonsRef.current.forEach((p) => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, boundaries, activeLayer, filterWard, hoveredNeighborhood]);

  return null;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  airbnbListings,
  longTermListings,
  revenueLookups,
  selectedWard,
  onSelectWard,
}) => {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Mode: Native Interactive GMP Map vs Original Google My Maps Embed
  const [viewMode, setViewMode] = useState<'interactive' | 'embed_mymaps'>('interactive');
  const [myMapsBoundaries, setMyMapsBoundaries] = useState<NeighborhoodBoundary[]>([]);

  // Layer State
  const [activeLayer, setActiveLayer] = useState<'all' | 'neighborhoods' | 'airbnb_listings' | 'long_term'>('all');
  const [mapTypeId, setMapTypeId] = useState<'roadmap' | 'terrain' | 'hybrid'>('roadmap');
  const [filterWard, setFilterWard] = useState<string>('All');
  const [hoveredNeighborhood, setHoveredNeighborhood] = useState<string | null>(null);

  // Load the 126 authentic DC neighborhood outlines from Google My Maps
  useEffect(() => {
    fetch('/assets/dc_my_maps_neighborhoods.json')
      .then((r) => r.json())
      .then((data: NeighborhoodBoundary[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setMyMapsBoundaries(data);
        }
      })
      .catch((err) => console.warn('Could not load My Maps polygons:', err));
  }, []);

  // Selected Item Info for Sidebar & InfoWindow
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<NeighborhoodBoundary | null>(
    NEIGHBORHOOD_BOUNDARIES['Capitol Hill, Lincoln Park'] || null
  );
  const [selectedAirbnb, setSelectedAirbnb] = useState<{
    listing: AirbnbListing;
    coords: [number, number];
  } | null>(null);
  const [selectedLongTerm, setSelectedLongTerm] = useState<LongTermComparable | null>(null);

  const dcWards = ['All', 'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'];

  // Calculate ward median monthly rents from DC Rent Registry
  const wardMedianRents = useMemo(() => {
    const map: Record<string, number> = {};
    dcWards.forEach((w) => {
      if (w === 'All') return;
      const comps = longTermListings.filter((c) => c.ward.toLowerCase() === w.toLowerCase());
      const rents = comps.map((c) => c.rent_monthly).sort((a, b) => a - b);
      if (rents.length > 0) {
        const mid = Math.floor(rents.length / 2);
        map[w] = rents[mid];
      } else {
        map[w] = 2450;
      }
    });
    return map;
  }, [longTermListings]);

  // Aggregate lookup map for neighborhoods
  const neighborhoodMetrics = useMemo(() => {
    const map: Record<string, { medianPrice: number; medianOcc: number; p75Rev: number; count: number }> = {};
    revenueLookups.forEach((r) => {
      if (!map[r.neighbourhood]) {
        map[r.neighbourhood] = {
          medianPrice: r.median_price,
          medianOcc: r.median_occ,
          p75Rev: r.p75_rev,
          count: r.n,
        };
      }
    });
    return map;
  }, [revenueLookups]);

  // Prepared individual Airbnb listings with deterministic coordinates
  const displayAirbnbListings = useMemo(() => {
    // If ward filter is active, prioritize listings matching the ward so they are not cut off
    const candidateList =
      filterWard === 'All'
        ? airbnbListings.slice(0, 450)
        : airbnbListings
            .filter((l) => {
              const boundary = getNeighborhoodBoundary(l.neighbourhood);
              return boundary.ward.toLowerCase() === filterWard.toLowerCase();
            })
            .slice(0, 450);

    return candidateList.map((listing) => {
      const coords = getListingCoordinates(listing.id, listing.neighbourhood);
      const boundary = getNeighborhoodBoundary(listing.neighbourhood);
      const areaRent = wardMedianRents[boundary.ward] || 2450;
      const breakEvenNights = listing.price_clean > 0 ? Math.ceil((areaRent * 12) / listing.price_clean) : 150;

      return {
        listing,
        coords,
        boundary,
        areaRent,
        breakEvenNights,
      };
    });
  }, [airbnbListings, wardMedianRents, filterWard]);

  // Filtered individual Airbnb listings
  const filteredAirbnbListings = useMemo(() => {
    if (activeLayer !== 'all' && activeLayer !== 'airbnb_listings') return [];
    return displayAirbnbListings;
  }, [displayAirbnbListings, activeLayer]);

  // Filtered Long-Term DC Rent Registry Listings
  const filteredLongTermListings = useMemo(() => {
    if (activeLayer !== 'all' && activeLayer !== 'long_term') return [];
    return longTermListings.slice(0, 150).filter((comp) => {
      if (filterWard !== 'All' && comp.ward.toLowerCase() !== filterWard.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [longTermListings, activeLayer, filterWard]);

  // Breakeven metrics for the currently selected neighborhood space
  const currentNeighborhoodBreakeven = useMemo(() => {
    if (!selectedNeighborhood) return null;
    const boundary = selectedNeighborhood;
    const metrics = neighborhoodMetrics[boundary.name] || {
      medianPrice: 195,
      medianOcc: 110,
      p75Rev: 32000,
      count: 45,
    };
    const monthlyLease = wardMedianRents[boundary.ward] || 2450;
    const annualLeaseGross = monthlyLease * 12;
    const breakEvenNights = metrics.medianPrice > 0 ? Math.ceil(annualLeaseGross / metrics.medianPrice) : 150;
    const exceedsUnhostedCap = breakEvenNights > 90;

    return {
      boundary,
      metrics,
      monthlyLease,
      annualLeaseGross,
      breakEvenNights,
      exceedsUnhostedCap,
    };
  }, [selectedNeighborhood, neighborhoodMetrics, wardMedianRents]);

  const boundariesList = useMemo(() => {
    if (myMapsBoundaries.length > 0) {
      return myMapsBoundaries;
    }
    return Object.values(NEIGHBORHOOD_BOUNDARIES);
  }, [myMapsBoundaries]);

  return (
    <div className="space-y-6">
      {/* Top Map Toolbar & Layer Controls */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#E08E6D] mb-1">
              <span>Google Maps Platform Underlay</span>
              <span>·</span>
              <span>126 D.C. Neighborhood Outlines & Analytics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#2A2320]">
              Washington D.C. Rental Market & Breakeven Explorer
            </h2>
            <p className="text-xs text-[#746B63] mt-0.5">
              Explore 126 D.C. neighborhood outlines directly from the Google My Maps layer, compare individual Airbnb listings, and review breakeven occupancy thresholds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle: Interactive vs Embedded My Maps */}
            <div className="flex items-center bg-[#F4EFE6] p-1 rounded-xl border border-[#E6DFD5] text-xs">
              <button
                onClick={() => setViewMode('interactive')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                  viewMode === 'interactive' ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs font-semibold' : 'text-[#746B63]'
                }`}
              >
                Interactive Map ({boundariesList.length} Outlines)
              </button>
              <button
                onClick={() => setViewMode('embed_mymaps')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium flex items-center space-x-1 ${
                  viewMode === 'embed_mymaps' ? 'bg-[#E08E6D] text-white shadow-xs font-semibold' : 'text-[#746B63]'
                }`}
              >
                <span>Google My Maps Embed</span>
              </button>
            </div>

            {viewMode === 'interactive' && (
              <>
                {/* Base Underlay Style */}
                <div className="flex items-center bg-[#F4EFE6] p-1 rounded-xl border border-[#E6DFD5] text-xs">
                  <button
                    onClick={() => setMapTypeId('roadmap')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                      mapTypeId === 'roadmap' ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs' : 'text-[#746B63]'
                    }`}
                  >
                    Road
                  </button>
                  <button
                    onClick={() => setMapTypeId('terrain')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                      mapTypeId === 'terrain' ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs' : 'text-[#746B63]'
                    }`}
                  >
                    Terrain
                  </button>
                  <button
                    onClick={() => setMapTypeId('hybrid')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                      mapTypeId === 'hybrid' ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs' : 'text-[#746B63]'
                    }`}
                  >
                    Satellite
                  </button>
                </div>

                {/* Layer Filter */}
                <div className="flex items-center bg-[#F4EFE6] p-1 rounded-xl border border-[#E6DFD5] text-xs">
                  <button
                    onClick={() => setActiveLayer('all')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                      activeLayer === 'all' ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs' : 'text-[#746B63]'
                    }`}
                  >
                    All Layers
                  </button>
                  <button
                    onClick={() => setActiveLayer('neighborhoods')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                      activeLayer === 'neighborhoods' ? 'bg-[#D4A373] text-white shadow-xs' : 'text-[#746B63]'
                    }`}
                  >
                    Spaces ({boundariesList.length})
                  </button>
                  <button
                    onClick={() => setActiveLayer('airbnb_listings')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                      activeLayer === 'airbnb_listings' ? 'bg-[#E08E6D] text-white shadow-xs' : 'text-[#746B63]'
                    }`}
                  >
                    Airbnb ({filteredAirbnbListings.length})
                  </button>
                  <button
                    onClick={() => setActiveLayer('long_term')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                      activeLayer === 'long_term' ? 'bg-[#4A6B5D] text-white shadow-xs' : 'text-[#746B63]'
                    }`}
                  >
                    Long-Term
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Ward Filter Bar */}
        <div className="mt-4 pt-3 border-t border-[#E6DFD5]/70 flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#746B63] mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter Ward:</span>
          </div>
          {dcWards.map((w) => (
            <button
              key={w}
              onClick={() => {
                setFilterWard(w);
                if (w !== 'All') onSelectWard(w);
              }}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                filterWard === w
                  ? 'bg-[#2A2320] text-white'
                  : 'bg-[#F4EFE6] text-[#746B63] hover:text-[#2A2320] hover:bg-[#EFE9DE]'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas & Side Intelligence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Google Map Viewport or Embedded My Maps */}
        <div className="lg:col-span-8">
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl overflow-hidden shadow-xs relative h-[560px]">
            {viewMode === 'embed_mymaps' ? (
              <div className="w-full h-full relative bg-[#EDE7DC]">
                <iframe
                  src="https://www.google.com/maps/d/embed?mid=1z_3yTY-G8hZZ3z5qh3tM9dBh5ps&hl=en_US&ehbc=2E312F"
                  width="100%"
                  height="100%"
                  style={{ border: 0, width: '100%', height: '100%' }}
                  allowFullScreen
                  loading="lazy"
                  title="Washington DC neighborhoods - Google My Maps"
                />
              </div>
            ) : (
              <APIProvider apiKey={mapsApiKey}>
                <GoogleMap
                defaultCenter={{ lat: 38.9072, lng: -77.0369 }}
                defaultZoom={12}
                minZoom={11}
                maxZoom={17}
                mapId="DEMO_MAP_ID"
                mapTypeId={mapTypeId}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                gestureHandling="greedy"
                disableDefaultUI={false}
                style={{ width: '100%', height: '100%' }}
              >
                {/* 1. Neighborhood Boundaries & Color Fills Overlay */}
                <NeighborhoodPolygonsOverlay
                  boundaries={boundariesList}
                  activeLayer={activeLayer}
                  filterWard={filterWard}
                  onSelectNeighborhood={(b) => {
                    setSelectedNeighborhood(b);
                    setSelectedAirbnb(null);
                    setSelectedLongTerm(null);
                  }}
                  hoveredNeighborhood={hoveredNeighborhood}
                  setHoveredNeighborhood={setHoveredNeighborhood}
                />

                {/* 2. Individual Airbnb Listings Markers */}
                {filteredAirbnbListings.map((item) => (
                  <AdvancedMarker
                    key={item.listing.id}
                    position={{ lat: item.coords[0], lng: item.coords[1] }}
                    onClick={() => {
                      setSelectedAirbnb({ listing: item.listing, coords: item.coords });
                      setSelectedNeighborhood(item.boundary);
                      setSelectedLongTerm(null);
                    }}
                  >
                    <div
                      className="cursor-pointer transition-transform hover:scale-110 flex items-center space-x-1"
                      style={{
                        backgroundColor: item.listing.host_name ? '#C97251' : '#E08E6D',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif",
                        border: '1.5px solid #FFFFFF',
                        boxShadow: '0 2px 6px rgba(42,35,32,0.35)',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.listing.name || `Airbnb Listing #${item.listing.id}`}
                    >
                      {item.listing.host_name && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                      )}
                      <span>${Math.round(item.listing.price_clean)}</span>
                    </div>
                  </AdvancedMarker>
                ))}

                {/* 3. DC Long-Term Rent Registry Accommodation Markers */}
                {filteredLongTermListings.map((comp) => (
                  <AdvancedMarker
                    key={comp.id}
                    position={{ lat: comp.latitude, lng: comp.longitude }}
                    onClick={() => {
                      setSelectedLongTerm(comp);
                      setSelectedAirbnb(null);
                      const boundary = getNeighborhoodBoundary(comp.ward);
                      setSelectedNeighborhood(boundary);
                    }}
                  >
                    <div
                      className="cursor-pointer transition-transform hover:scale-110"
                      style={{
                        backgroundColor: '#4A6B5D',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '9999px',
                        fontSize: '10px',
                        fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif",
                        border: '1.5px solid #FFFFFF',
                        boxShadow: '0 2px 6px rgba(42,35,32,0.35)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ${Math.round(comp.rent_monthly)}/mo
                    </div>
                  </AdvancedMarker>
                ))}

                {/* InfoWindow for Clicked Airbnb Listing */}
                {selectedAirbnb && (
                  <InfoWindow
                    position={{ lat: selectedAirbnb.coords[0], lng: selectedAirbnb.coords[1] }}
                    onCloseClick={() => setSelectedAirbnb(null)}
                  >
                    <div className="p-2.5 max-w-xs font-sans text-xs space-y-1.5 text-[#2A2320]">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E08E6D]/20 text-[#C97251]">
                          {selectedAirbnb.listing.host_name ? 'Verified Host Listing' : 'Individual Airbnb Listing'}
                        </span>
                        <span className="text-[#746B63] font-mono text-[10px]">#{selectedAirbnb.listing.id.slice(-6)}</span>
                      </div>

                      {/* Authentic Listing Title from Ward 2 dataset */}
                      {selectedAirbnb.listing.name && (
                        <div className="text-xs font-bold text-[#2A2320] leading-snug line-clamp-2">
                          {selectedAirbnb.listing.name}
                        </div>
                      )}

                      {/* Authentic Host Name and Corridor Area */}
                      {selectedAirbnb.listing.host_name && (
                        <div className="text-[11px] text-[#4A6B5D] font-medium flex items-center space-x-1">
                          <span>Host:</span>
                          <strong className="text-[#2A2320]">{selectedAirbnb.listing.host_name}</strong>
                          {selectedAirbnb.listing.area && (
                            <span className="text-[#746B63]">· {selectedAirbnb.listing.area}</span>
                          )}
                        </div>
                      )}

                      <div className="text-sm font-bold text-[#2A2320]">
                        ${Math.round(selectedAirbnb.listing.price_clean)} / night
                      </div>

                      <div className="text-[#746B63]">
                        {selectedAirbnb.listing.room_type} · {selectedAirbnb.listing.bedrooms} BR · {selectedAirbnb.listing.accommodates} Guests
                      </div>

                      <div className="pt-1.5 border-t border-[#E6DFD5] space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#746B63]">Est. Occupancy:</span>
                          <span className="font-mono font-medium">{Math.round(selectedAirbnb.listing.occupancy_est)} nights/yr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#746B63]">Gross Revenue:</span>
                          <span className="font-mono font-semibold text-[#4A6B5D]">
                            ${Math.round(selectedAirbnb.listing.revenue_comp).toLocaleString()}/yr
                          </span>
                        </div>
                        <div className="flex justify-between font-semibold text-[#2A2320]">
                          <span>Breakeven vs Lease:</span>
                          <span className="font-mono text-[#E08E6D]">
                            {Math.ceil(((wardMedianRents[getNeighborhoodBoundary(selectedAirbnb.listing.neighbourhood).ward] || 2450) * 12) / selectedAirbnb.listing.price_clean)} nights
                          </span>
                        </div>
                      </div>
                    </div>
                  </InfoWindow>
                )}

                {/* InfoWindow for Clicked Long-Term Comparable */}
                {selectedLongTerm && (
                  <InfoWindow
                    position={{ lat: selectedLongTerm.latitude, lng: selectedLongTerm.longitude }}
                    onCloseClick={() => setSelectedLongTerm(null)}
                  >
                    <div className="p-2 max-w-xs font-sans text-xs space-y-1.5 text-[#2A2320]">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#4A6B5D]/20 text-[#375347]">
                        DC Rent Registry Record
                      </span>
                      <div className="text-sm font-bold text-[#2A2320]">
                        ${Math.round(selectedLongTerm.rent_monthly).toLocaleString()} / month
                      </div>
                      <div className="text-[#746B63]">
                        {selectedLongTerm.ward} · {selectedLongTerm.property_type_text || 'Registered Units'} ({selectedLongTerm.registered_units} units)
                      </div>
                      <div className="text-[11px] text-[#746B63] pt-1 border-t border-[#E6DFD5]">
                        Annual Gross Baseline: <strong className="text-[#2A2320]">${Math.round(selectedLongTerm.rent_monthly * 12).toLocaleString()}</strong>
                      </div>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </APIProvider>
          )}

          {/* Top Floating Hover Neighborhood Label Badge */}
            {hoveredNeighborhood && viewMode === 'interactive' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-[#FAF7F2]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#E6DFD5] shadow-md flex items-center space-x-2 text-xs pointer-events-none transition-all">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E08E6D] animate-pulse" />
                <span className="font-bold text-[#2A2320]">{hoveredNeighborhood}</span>
                <span className="text-[#746B63]">· Click to analyze breakeven</span>
              </div>
            )}

            {/* Map Legend Overlay */}
            <div className="absolute bottom-4 left-4 z-10 bg-[#FAF7F2]/95 backdrop-blur-sm p-3 rounded-xl border border-[#E6DFD5] text-xs shadow-md space-y-1.5 max-w-xs pointer-events-auto">
              <span className="font-semibold text-[#2A2320] block mb-1">Map Layer Legend</span>
              <div className="flex items-center space-x-2 text-[#746B63]">
                <div className="w-3.5 h-3.5 rounded-sm bg-[#D4A373]/50 border border-[#D4A373]" />
                <span>Polygons: Neighborhood Spaces with Boho Color Fills</span>
              </div>
              <div className="flex items-center space-x-2 text-[#746B63]">
                <div className="w-3 h-3 rounded-full bg-[#E08E6D]" />
                <span>Terracotta: Individual Airbnb Listings ($/night)</span>
              </div>
              <div className="flex items-center space-x-2 text-[#746B63]">
                <div className="w-3 h-3 rounded-full bg-[#4A6B5D]" />
                <span>Olive: Registered DC Monthly Lease Units ($/mo)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Breakeven Point Analysis & Neighborhood Dossier */}
        <div className="lg:col-span-4 space-y-5">
          {currentNeighborhoodBreakeven ? (
            <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: currentNeighborhoodBreakeven.boundary.color }}
                    />
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#746B63]">
                      {currentNeighborhoodBreakeven.boundary.ward}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#2A2320] mt-0.5">
                    {currentNeighborhoodBreakeven.boundary.shortName}
                  </h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#F4EFE6] border border-[#E6DFD5] text-[#2A2320]">
                  {currentNeighborhoodBreakeven.metrics.count} sample units
                </span>
              </div>

              {/* Breakeven Point Card */}
              <div className="p-4 rounded-xl border border-[#E08E6D]/50 bg-[#FAF0EB] space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#C97251] block">
                      Market Breakeven Threshold
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-[#2A2320]">
                      {currentNeighborhoodBreakeven.breakEvenNights} Nights / Year
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-[#746B63] block">Lease Equivalent</span>
                    <span className="text-xs font-mono font-bold text-[#4A6B5D]">
                      ${currentNeighborhoodBreakeven.monthlyLease.toLocaleString()}/mo
                    </span>
                  </div>
                </div>

                {/* Progress bar compared to 90-day unhosted cap and 365-day ceiling */}
                <div>
                  <div className="flex justify-between text-[11px] text-[#746B63] mb-1">
                    <span>90-day unhosted cap</span>
                    <span className="font-semibold text-[#2A2320]">{currentNeighborhoodBreakeven.breakEvenNights} nights</span>
                    <span>365-day hosted</span>
                  </div>
                  <div className="w-full bg-[#EFE9DE] h-2 rounded-full overflow-hidden relative">
                    {/* 90 day marker line */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[#C97251] z-10"
                      style={{ left: `${(90 / 365) * 100}%` }}
                      title="90-day unhosted cap"
                    />
                    <div
                      className="bg-[#E08E6D] h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, (currentNeighborhoodBreakeven.breakEvenNights / 365) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-xs text-[#746B63] leading-relaxed">
                  {currentNeighborhoodBreakeven.exceedsUnhostedCap ? (
                    <div className="flex items-start space-x-1.5 text-[#C97251]">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Exceeds 90-day unhosted limit:</strong> Requires a <em>Hosted (owner on-site)</em> license endorsement to exceed the long-term lease baseline.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-1.5 text-[#4A6B5D]">
                      <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Unhosted Compliant:</strong> Breakeven achievable within D.C.&apos;s 90-day unhosted vacation rental allowance.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Benchmark Numbers */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#E6DFD5]/60">
                  <span className="text-[#746B63]">Airbnb Median Nightly Price</span>
                  <span className="font-mono font-semibold text-[#2A2320]">
                    ${Math.round(currentNeighborhoodBreakeven.metrics.medianPrice)} / night
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E6DFD5]/60">
                  <span className="text-[#746B63]">Typical Annual Booked Occupancy</span>
                  <span className="font-mono font-semibold text-[#2A2320]">
                    {Math.round(currentNeighborhoodBreakeven.metrics.medianOcc)} nights/yr
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#E6DFD5]/60">
                  <span className="text-[#746B63]">DC Rent Registry Monthly Median</span>
                  <span className="font-mono font-semibold text-[#4A6B5D]">
                    ${currentNeighborhoodBreakeven.monthlyLease.toLocaleString()} / month
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-[#746B63]">Annual Long-Term Gross Lease</span>
                  <span className="font-mono font-bold text-[#4A6B5D]">
                    ${currentNeighborhoodBreakeven.annualLeaseGross.toLocaleString()} / year
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 text-center text-[#746B63] space-y-2">
              <MapPin className="w-6 h-6 mx-auto text-[#D9CEBE]" />
              <p className="text-xs">Click any neighborhood space or listing pin to inspect breakeven intelligence.</p>
            </div>
          )}

          {/* Quick Guidance Box */}
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-5 shadow-xs space-y-2 text-xs text-[#746B63]">
            <h4 className="font-semibold text-[#2A2320] flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-[#4A6B5D]" />
              <span>Breakeven Formula & Methodology</span>
            </h4>
            <p className="leading-relaxed">
              Breakeven occupancy represents the exact number of nights an owner must rent on Airbnb at current market rates to match a standard 12-month lease in the same D.C. corridor:
            </p>
            <div className="p-2 rounded-lg bg-[#F4EFE6] font-mono text-[11px] text-[#2A2320]">
              Breakeven Days = (Monthly Rent × 12) / Nightly Rate
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
