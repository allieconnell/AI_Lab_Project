import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps';
import { AirbnbListing, LongTermComparable, RevenueLookupItem } from '../types/rental';
import {
  CANONICAL_NEIGHBORHOOD_LIST,
  calculateCanonicalScenario,
  getCanonicalNeighborhood,
  CanonicalNeighborhood,
} from '../utils/canonicalMarketData';
import {
  DC_MY_MAPS_BOUNDARIES,
  MyMapsNeighborhoodBoundary,
} from '../utils/myMapsData';
import { getListingCoordinates } from '../utils/dcNeighborhoodPolygons';
import {
  Layers,
  MapPin,
  Filter,
  Sparkles,
  Info,
  Building,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Sliders,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  ChevronDown,
  Eye,
  Check,
  MoreHorizontal,
} from 'lucide-react';

interface PropertyMapProps {
  airbnbListings: AirbnbListing[];
  longTermListings: LongTermComparable[];
  revenueLookups: RevenueLookupItem[];
  selectedWard: string;
  onSelectWard: (ward: string) => void;
  userNeighborhood?: string;
  onSelectNeighborhood?: (name: string) => void;
  onOpenCalculator?: () => void;
}

/**
 * Controller inside GoogleMap to handle pan/zoom and sync zoom state.
 */
function MapPanZoomController({
  targetCoords,
  targetZoom,
  onZoomChange,
}: {
  targetCoords: [number, number] | null;
  targetZoom: number | null;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('zoom_changed', () => {
      const z = map.getZoom();
      if (typeof z === 'number') onZoomChange(z);
    });
    return () => google.maps.event.removeListener(listener);
  }, [map, onZoomChange]);

  useEffect(() => {
    if (!map || !targetCoords) return;
    map.panTo({ lat: targetCoords[0], lng: targetCoords[1] });
    if (targetZoom) {
      map.setZoom(targetZoom);
    }
  }, [map, targetCoords, targetZoom]);

  return null;
}

/**
 * Renders authentic DC neighborhood polygon outlines from Google My Maps (126 corridors).
 * Includes interactive hover highlighting and hover label events.
 */
function NeighborhoodPolygonsOverlay({
  boundaries,
  filterWard,
  selectedNeighborhoodName,
  onSelectBoundary,
  onHoverBoundary,
}: {
  boundaries: MyMapsNeighborhoodBoundary[];
  filterWard: string;
  selectedNeighborhoodName?: string;
  onSelectBoundary: (b: MyMapsNeighborhoodBoundary) => void;
  onHoverBoundary: (b: MyMapsNeighborhoodBoundary | null, position?: { lat: number; lng: number }) => void;
}) {
  const map = useMap();
  const polygonsRef = useRef<google.maps.Polygon[]>([]);

  useEffect(() => {
    if (!map || typeof google === 'undefined' || !google.maps) return;

    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];

    const filtered = boundaries.filter((b) => {
      if (filterWard !== 'All' && b.ward.toLowerCase() !== filterWard.toLowerCase()) {
        return false;
      }
      return true;
    });

    filtered.forEach((boundary) => {
      const isSelected = selectedNeighborhoodName
        ? boundary.name.toLowerCase().includes(selectedNeighborhoodName.toLowerCase()) ||
          selectedNeighborhoodName.toLowerCase().includes(boundary.name.toLowerCase())
        : false;

      const polygon = new google.maps.Polygon({
        paths: boundary.polygon.map(([lat, lng]) => ({ lat, lng })),
        strokeColor: isSelected ? '#2A2320' : boundary.color,
        strokeOpacity: isSelected ? 0.95 : 0.75,
        strokeWeight: isSelected ? 3 : 1.5,
        fillColor: boundary.color,
        fillOpacity: isSelected ? 0.35 : 0.16,
        clickable: true,
        map,
        zIndex: isSelected ? 5 : 1,
      });

      polygon.addListener('mouseover', (e: google.maps.PolyMouseEvent) => {
        polygon.setOptions({
          strokeColor: '#C97251',
          strokeWeight: 2.5,
          fillOpacity: 0.32,
          zIndex: 10,
        });
        const latLng = e.latLng
          ? { lat: e.latLng.lat(), lng: e.latLng.lng() }
          : { lat: boundary.centroid[0], lng: boundary.centroid[1] };
        onHoverBoundary(boundary, latLng);
      });

      polygon.addListener('mouseout', () => {
        polygon.setOptions({
          strokeColor: isSelected ? '#2A2320' : boundary.color,
          strokeWeight: isSelected ? 3 : 1.5,
          fillOpacity: isSelected ? 0.35 : 0.16,
          zIndex: isSelected ? 5 : 1,
        });
        onHoverBoundary(null);
      });

      polygon.addListener('click', () => {
        onSelectBoundary(boundary);
      });

      polygonsRef.current.push(polygon);
    });

    return () => {
      polygonsRef.current.forEach((p) => p.setMap(null));
      polygonsRef.current = [];
    };
  }, [map, boundaries, filterWard, selectedNeighborhoodName, onSelectBoundary, onHoverBoundary]);

  return null;
}

export const PropertyMap: React.FC<PropertyMapProps> = ({
  airbnbListings,
  longTermListings,
  selectedWard,
  onSelectWard,
  userNeighborhood,
  onSelectNeighborhood,
  onOpenCalculator,
}) => {
  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // View Mode: Interactive GMP vs Embedded Google My Maps
  const [viewMode, setViewMode] = useState<'interactive' | 'embed_mymaps'>('interactive');

  // Metric Toggle: 'breakeven' (Breakeven Nights) vs 'delta' (Lease vs Airbnb Net $)
  const [metricDisplay, setMetricDisplay] = useState<'breakeven' | 'delta'>('breakeven');

  // Layer State: 'overview' | 'all' | 'airbnb_listings' | 'long_term'
  const [activeLayer, setActiveLayer] = useState<'overview' | 'all' | 'airbnb_listings' | 'long_term'>('overview');
  const [filterWard, setFilterWard] = useState<string>('All');
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [targetPanZoom, setTargetPanZoom] = useState<{ coords: [number, number]; zoom: number } | null>(null);

  // Price Filters & "More" Menu Popover
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPriceFilters, setShowPriceFilters] = useState(false);
  const [maxAirbnbPrice, setMaxAirbnbPrice] = useState<number>(600);
  const [maxLeasePrice, setMaxLeasePrice] = useState<number>(4500);

  // Hovered / Tapped Marker state for full info card popover
  const [hoveredCorridor, setHoveredCorridor] = useState<CanonicalNeighborhood | null>(null);

  // Hovered Polygon State for hover label
  const [hoveredBoundary, setHoveredBoundary] = useState<MyMapsNeighborhoodBoundary | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ lat: number; lng: number } | null>(null);

  const handleHoverBoundary = useCallback(
    (b: MyMapsNeighborhoodBoundary | null, pos?: { lat: number; lng: number }) => {
      setHoveredBoundary(b);
      setHoverPosition(pos || null);
    },
    []
  );

  // Selected Neighborhood (Single Source of Truth)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<CanonicalNeighborhood>(() => {
    if (userNeighborhood) return getCanonicalNeighborhood(userNeighborhood);
    return getCanonicalNeighborhood('Dupont Circle, Connecticut Avenue/K Street');
  });

  useEffect(() => {
    if (userNeighborhood) {
      setSelectedNeighborhood(getCanonicalNeighborhood(userNeighborhood));
    }
  }, [userNeighborhood]);

  // Selected Pin markers
  const [selectedAirbnb, setSelectedAirbnb] = useState<{
    listing: AirbnbListing;
    coords: [number, number];
  } | null>(null);
  const [selectedLongTerm, setSelectedLongTerm] = useState<LongTermComparable | null>(null);

  const dcWards = ['All', 'Ward 1', 'Ward 2', 'Ward 3', 'Ward 4', 'Ward 5', 'Ward 6', 'Ward 7', 'Ward 8'];

  // Canonical scenario for selected neighborhood
  const selectedScenario = useMemo(() => {
    return calculateCanonicalScenario({
      neighborhoodName: selectedNeighborhood.name,
      bedrooms: 1,
      spaceType: 'Entire home/apt',
      isPrimaryResidence: true,
      isHoaAllowed: true,
    });
  }, [selectedNeighborhood]);

  // Pre-calculated canonical metrics for all 39 corridors
  const canonicalCorridors = useMemo(() => {
    return CANONICAL_NEIGHBORHOOD_LIST.map((neighborhood) => {
      const scenario = calculateCanonicalScenario({
        neighborhoodName: neighborhood.name,
        bedrooms: 1,
        spaceType: 'Entire home/apt',
        isPrimaryResidence: true,
        isHoaAllowed: true,
      });

      return {
        neighborhood,
        scenario,
        breakevenNights: scenario.breakevenNights,
        unhostedNetDelta: scenario.unhostedNetDelta,
        adjustedNightlyRate: scenario.adjustedNightlyRate,
        adjustedMonthlyRent: scenario.adjustedMonthlyRent,
      };
    });
  }, []);

  // Filtered corridor list by ward
  const filteredCorridors = useMemo(() => {
    if (filterWard === 'All') return canonicalCorridors;
    return canonicalCorridors.filter(
      (c) => c.neighborhood.ward.toLowerCase() === filterWard.toLowerCase()
    );
  }, [canonicalCorridors, filterWard]);

  // Prepared individual Airbnb listings
  const filteredAirbnbListings = useMemo(() => {
    if (activeLayer === 'overview' || activeLayer === 'long_term') return [];

    return airbnbListings
      .filter((l) => {
        if (l.price_clean > maxAirbnbPrice) return false;
        if (filterWard !== 'All') {
          const boundary = getCanonicalNeighborhood(l.neighbourhood);
          if (boundary.ward.toLowerCase() !== filterWard.toLowerCase()) return false;
        }
        return true;
      })
      .slice(0, 150)
      .map((listing) => ({
        listing,
        coords: getListingCoordinates(listing.id, listing.neighbourhood),
        boundary: getCanonicalNeighborhood(listing.neighbourhood),
      }));
  }, [airbnbListings, activeLayer, filterWard, maxAirbnbPrice]);

  // Filtered long-term listings
  const filteredLongTermListings = useMemo(() => {
    if (activeLayer === 'overview' || activeLayer === 'airbnb_listings') return [];

    return longTermListings
      .filter((comp) => {
        if (comp.rent_monthly > maxLeasePrice) return false;
        if (filterWard !== 'All' && comp.ward.toLowerCase() !== filterWard.toLowerCase()) {
          return false;
        }
        return true;
      })
      .slice(0, 150);
  }, [longTermListings, activeLayer, filterWard, maxLeasePrice]);

  const totalIndividualCount = filteredAirbnbListings.length + filteredLongTermListings.length;

  // Handler for clicking authentic My Maps boundary polygons (126 corridors)
  const handleSelectMyMapsBoundary = useCallback(
    (boundary: MyMapsNeighborhoodBoundary) => {
      const canonical = getCanonicalNeighborhood(boundary.name);
      setSelectedNeighborhood(canonical);
      setSelectedAirbnb(null);
      setSelectedLongTerm(null);
      setHoveredCorridor(null);

      // Call onSelectNeighborhood to update Home Hub directly with NO tab switch!
      if (onSelectNeighborhood) {
        onSelectNeighborhood(canonical.name);
      }
      if (onSelectWard && canonical.ward !== selectedWard) {
        onSelectWard(canonical.ward);
      }

      setTargetPanZoom({
        coords: boundary.centroid,
        zoom: 14,
      });
    },
    [onSelectNeighborhood, onSelectWard, selectedWard]
  );

  // Handler: Selecting a neighborhood updates side panel AND Home Hub (Requirement 8)
  const handleSelectNeighborhood = (neighborhood: CanonicalNeighborhood) => {
    setSelectedNeighborhood(neighborhood);
    setSelectedAirbnb(null);
    setSelectedLongTerm(null);
    setHoveredCorridor(null);

    // Call onSelectNeighborhood to update Home Hub directly with NO tab switch!
    if (onSelectNeighborhood) {
      onSelectNeighborhood(neighborhood.name);
    }
    if (onSelectWard && neighborhood.ward !== selectedWard) {
      onSelectWard(neighborhood.ward);
    }

    setTargetPanZoom({
      coords: neighborhood.centroid,
      zoom: 14,
    });
  };

  return (
    <div className="space-y-5">
      {/* 1. Map Toolbar & Controls */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-3xl p-4 sm:p-5 shadow-xs space-y-3.5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#2A2320] tracking-tight">
              Washington D.C. Rental Market Map
            </h2>
            <p className="text-xs text-[#5A524C] mt-0.5">
              Click any neighborhood to activate it across the app. Dupont Circle is strictly Ward 2.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Toggle: Breakeven Nights vs Net Delta (Requirement 8) */}
            <div className="flex items-center bg-[#F4EFE6] p-1 rounded-2xl border border-[#E6DFD5] text-xs">
              <button
                type="button"
                onClick={() => setMetricDisplay('breakeven')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  metricDisplay === 'breakeven'
                    ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs'
                    : 'text-[#5A524C] hover:text-[#2A2320]'
                }`}
              >
                Breakeven Nights
              </button>
              <button
                type="button"
                onClick={() => setMetricDisplay('delta')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  metricDisplay === 'delta'
                    ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs'
                    : 'text-[#5A524C] hover:text-[#2A2320]'
                }`}
              >
                Lease vs Airbnb Net $
              </button>
            </div>

            {/* Layer View Mode */}
            <div className="flex items-center bg-[#F4EFE6] p-1 rounded-2xl border border-[#E6DFD5] text-xs">
              <button
                type="button"
                onClick={() => setActiveLayer('overview')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                  activeLayer === 'overview'
                    ? 'bg-[#E08E6D] text-white shadow-xs'
                    : 'text-[#5A524C] hover:text-[#2A2320]'
                }`}
              >
                Overview
              </button>

              {/* Hide "All Properties (0)" while empty (Requirement 8) */}
              {totalIndividualCount > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveLayer('all')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    activeLayer === 'all'
                      ? 'bg-[#2A2320] text-white shadow-xs'
                      : 'text-[#5A524C] hover:text-[#2A2320]'
                  }`}
                >
                  All Properties ({totalIndividualCount})
                </button>
              )}
            </div>

            {/* "More" Menu Dropdown (Contains My Maps Embed and Price Filters) (Requirement 8) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMoreMenu((prev) => !prev)}
                className={`px-3 py-1.5 rounded-2xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                  showMoreMenu || showPriceFilters || viewMode === 'embed_mymaps'
                    ? 'bg-[#FAF0EB] border-[#E08E6D] text-[#C97251]'
                    : 'bg-[#F4EFE6] border-[#E6DFD5] text-[#5A524C] hover:text-[#2A2320]'
                }`}
              >
                <MoreHorizontal className="w-4 h-4" />
                <span>More</span>
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl shadow-xl z-50 p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode((prev) => (prev === 'interactive' ? 'embed_mymaps' : 'interactive'));
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-white text-[#2A2320] flex items-center justify-between cursor-pointer"
                  >
                    <span>{viewMode === 'interactive' ? 'Switch to My Maps' : 'Switch to Interactive'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPriceFilters((prev) => !prev);
                      setShowMoreMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-xl hover:bg-white text-[#2A2320] flex items-center justify-between cursor-pointer"
                  >
                    <span>Price Filters</span>
                    {(maxAirbnbPrice < 600 || maxLeasePrice < 4500) && (
                      <span className="w-2 h-2 rounded-full bg-[#E08E6D]" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Price Filter Sliders (when opened via More menu) */}
        {showPriceFilters && (
          <div className="bg-[#FAF0EB]/60 border border-[#E08E6D]/40 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs animate-in fade-in">
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-[#5A524C]">Max Airbnb Nightly Rate:</span>
                <span className="font-mono text-[#E08E6D]">${maxAirbnbPrice} / night</span>
              </div>
              <input
                type="range"
                min="75"
                max="800"
                step="25"
                value={maxAirbnbPrice}
                onChange={(e) => setMaxAirbnbPrice(Number(e.target.value))}
                className="w-full accent-[#E08E6D] cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-[#5A524C]">Max Long-Term Monthly Lease:</span>
                <span className="font-mono text-[#4A6B5D]">${maxLeasePrice.toLocaleString()} / mo</span>
              </div>
              <input
                type="range"
                min="1200"
                max="6000"
                step="100"
                value={maxLeasePrice}
                onChange={(e) => setMaxLeasePrice(Number(e.target.value))}
                className="w-full accent-[#4A6B5D] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Ward Filter Pills */}
        <div className="pt-2 border-t border-[#E6DFD5]/70 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-[#5A524C] mr-1">Ward Filter:</span>
          {dcWards.map((w) => (
            <button
              key={w}
              onClick={() => {
                setFilterWard(w);
                if (w !== 'All') onSelectWard(w);
              }}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-colors cursor-pointer ${
                filterWard === w
                  ? 'bg-[#2A2320] text-white'
                  : 'bg-[#FFFFFF] text-[#5A524C] hover:text-[#2A2320] border border-[#E6DFD5]'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Map Canvas & Right Side Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Google Map Viewport */}
        <div className="lg:col-span-8">
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-3xl overflow-hidden shadow-xs relative h-[580px]">
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
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  {/* Pan/Zoom Controller */}
                  <MapPanZoomController
                    targetCoords={targetPanZoom ? targetPanZoom.coords : null}
                    targetZoom={targetPanZoom ? targetPanZoom.zoom : null}
                    onZoomChange={setMapZoom}
                  />

                  {/* Authentic DC Neighborhood Outlines from Google My Maps (126 Corridors) */}
                  <NeighborhoodPolygonsOverlay
                    boundaries={DC_MY_MAPS_BOUNDARIES}
                    filterWard={filterWard}
                    selectedNeighborhoodName={selectedNeighborhood.name}
                    onSelectBoundary={handleSelectMyMapsBoundary}
                    onHoverBoundary={handleHoverBoundary}
                  />

                  {/* HOVER LABEL FOR NEIGHBORHOOD NAME (User Request 3) */}
                  {hoveredBoundary && hoverPosition && (
                    <InfoWindow
                      position={hoverPosition}
                      disableAutoPan={true}
                      headerDisabled={true}
                    >
                      <div className="px-2.5 py-1 text-xs font-semibold text-[#2A2320] flex items-center space-x-1.5 whitespace-nowrap shadow-xs">
                        <span className="font-bold">{hoveredBoundary.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E08E6D]/15 text-[#C97251] font-mono">
                          {hoveredBoundary.ward}
                        </span>
                      </div>
                    </InfoWindow>
                  )}

                  {/* COMPACT COLOR-CODED OVERVIEW MARKERS (Requirement 8)
                      One metric per marker with metric toggle, full card on hover/tap
                  */}
                  {activeLayer === 'overview' &&
                    filteredCorridors.map((item) => {
                      const isSelected = selectedNeighborhood.id === item.neighborhood.id;
                      const isHovered = hoveredCorridor?.id === item.neighborhood.id;

                      // Pill label based on metricDisplay
                      const pillLabel =
                        metricDisplay === 'breakeven'
                          ? `${item.breakevenNights}d`
                          : item.unhostedNetDelta > 0
                          ? `+$${(item.unhostedNetDelta / 1000).toFixed(1)}k Lease`
                          : `+$${(Math.abs(item.unhostedNetDelta) / 1000).toFixed(1)}k Airbnb`;

                      // Color coding
                      const isLeaseAhead = item.unhostedNetDelta > 0;
                      const badgeBg = isSelected
                        ? '#2A2320'
                        : metricDisplay === 'breakeven'
                        ? item.breakevenNights > 90
                          ? '#FAF0EB'
                          : '#F4EFE6'
                        : isLeaseAhead
                        ? '#EAF0EC'
                        : '#FAF0EB';

                      const badgeText = isSelected
                        ? '#FFFFFF'
                        : metricDisplay === 'breakeven'
                        ? item.breakevenNights > 90
                          ? '#C97251'
                          : '#4A6B5D'
                        : isLeaseAhead
                        ? '#375347'
                        : '#C97251';

                      const badgeBorder = isSelected
                        ? '#2A2320'
                        : metricDisplay === 'breakeven'
                        ? item.breakevenNights > 90
                          ? '#E08E6D'
                          : '#7C9A86'
                        : isLeaseAhead
                        ? '#4A6B5D'
                        : '#E08E6D';

                      return (
                        <AdvancedMarker
                          key={item.neighborhood.id}
                          position={{
                            lat: item.neighborhood.centroid[0],
                            lng: item.neighborhood.centroid[1],
                          }}
                          onClick={() => handleSelectNeighborhood(item.neighborhood)}
                        >
                          <div
                            onMouseEnter={() => setHoveredCorridor(item.neighborhood)}
                            onMouseLeave={() => setHoveredCorridor(null)}
                            className="cursor-pointer transition-all hover:scale-110 active:scale-95 group relative"
                          >
                            {/* Compact Single-Metric Pill */}
                            <div
                              style={{
                                backgroundColor: badgeBg,
                                color: badgeText,
                                borderColor: badgeBorder,
                              }}
                              className="px-2.5 py-1 rounded-xl text-xs font-bold font-mono shadow-md border flex items-center space-x-1 whitespace-nowrap"
                            >
                              <span>{pillLabel}</span>
                            </div>

                            {/* Full Info Card on Hover or Tap (Requirement 8) */}
                            {(isHovered || isSelected) && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl shadow-xl p-3 z-50 text-left pointer-events-none animate-in fade-in">
                                <div className="font-bold text-xs text-[#2A2320] flex items-center justify-between pb-1 border-b border-[#E6DFD5]">
                                  <span>{item.neighborhood.shortName}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E08E6D]/15 text-[#C97251]">
                                    {item.neighborhood.ward}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono mt-1.5">
                                  <div>
                                    <span className="text-[9px] text-[#5A524C] block font-sans">Airbnb Avg</span>
                                    <strong className="text-[#E08E6D]">${item.adjustedNightlyRate}/nt</strong>
                                  </div>
                                  <div>
                                    <span className="text-[9px] text-[#5A524C] block font-sans">Lease Avg</span>
                                    <strong className="text-[#4A6B5D]">${item.adjustedMonthlyRent.toLocaleString()}/mo</strong>
                                  </div>
                                </div>

                                <div className="mt-1.5 pt-1 border-t border-[#E6DFD5] flex items-center justify-between text-[10px]">
                                  <span className="text-[#5A524C]">
                                    Breakeven: <strong>{item.breakevenNights}d</strong>
                                  </span>
                                  <span className="text-[#E08E6D] font-bold">Click to Select</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </AdvancedMarker>
                      );
                    })}

                  {/* DETAIL PINS: When viewing individual properties */}
                  {activeLayer !== 'overview' &&
                    filteredAirbnbListings.map((item) => (
                      <AdvancedMarker
                        key={item.listing.id}
                        position={{ lat: item.coords[0], lng: item.coords[1] }}
                        onClick={() => {
                          setSelectedAirbnb({ listing: item.listing, coords: item.coords });
                          handleSelectNeighborhood(item.boundary);
                        }}
                      >
                        <div className="cursor-pointer px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E08E6D] text-white border border-white shadow-md">
                          ${Math.round(item.listing.price_clean)}
                        </div>
                      </AdvancedMarker>
                    ))}
                </GoogleMap>
              </APIProvider>
            )}

            {/* Neighborhood Hover Status Pill (User Request 3 & 8) */}
            <div className="absolute top-4 left-4 z-10 bg-[#FAF7F2]/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-[#E6DFD5] text-[11px] shadow-sm font-semibold text-[#2A2320] flex items-center space-x-2 pointer-events-none max-w-[280px] truncate">
              <span className="w-2 h-2 rounded-full bg-[#E08E6D] shrink-0 animate-pulse" />
              {hoveredBoundary ? (
                <span className="truncate">
                  <strong>{hoveredBoundary.name}</strong> <span className="text-[#5A524C]">({hoveredBoundary.ward})</span>
                </span>
              ) : (
                <span className="text-[#5A524C]">
                  Hover over neighborhood outlines · Click to select
                </span>
              )}
            </div>

            {/* Status Legend Pill */}
            <div className="absolute top-4 right-4 z-10 bg-[#FAF7F2]/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-[#E6DFD5] text-[11px] shadow-sm font-semibold text-[#5A524C]">
              {metricDisplay === 'breakeven' ? (
                <span>Showing Breakeven Days (90d unhosted cap)</span>
              ) : (
                <span>Showing Annual Net Delta (Lease vs Airbnb)</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Unified Side Panel (Requirement 8)
            - Single primary button: "Use in calculator"
            - Identical numbers matching Home Hub exactly
            - Small source/date labels
        */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between border-b border-[#E6DFD5] pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#C97251]">
                  {selectedScenario.ward} · Active Selection
                </span>
                <h3 className="text-lg font-bold text-[#2A2320]">
                  {selectedScenario.neighborhood.shortName}
                </h3>
                <span className="text-[11px] text-[#5A524C] block truncate">
                  {selectedScenario.neighborhood.name}
                </span>
              </div>
              <span className="w-3 h-3 rounded-full bg-[#E08E6D] mt-1 shrink-0" />
            </div>

            {/* Breakeven Gauge Card */}
            <div className="p-4 rounded-2xl border border-[#E08E6D]/40 bg-[#FAF0EB] space-y-3">
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#C97251] block">
                    Breakeven Threshold
                  </span>
                  <div className="text-2xl font-bold font-mono text-[#2A2320]">
                    {selectedScenario.breakevenNights} Nights
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#5A524C] block">Lease Equivalent</span>
                  <span className="text-xs font-mono font-bold text-[#4A6B5D]">
                    ${selectedScenario.adjustedMonthlyRent.toLocaleString()}/mo
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#5A524C] leading-snug">
                {selectedScenario.breakevenNights > 90 ? (
                  <span className="text-[#C97251]">
                    <strong>Exceeds 90-day unhosted cap.</strong> 12-month lease yields +${selectedScenario.unhostedNetDelta.toLocaleString()} more per year net.
                  </span>
                ) : (
                  <span className="text-[#375347]">
                    <strong>Within 90-day unhosted cap.</strong> Airbnb reaches breakeven within legal limit.
                  </span>
                )}
              </p>
            </div>

            {/* Financial Metrics with Source/Date Labels (Requirement 1 & 8) */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#E6DFD5]">
                <div>
                  <span className="font-semibold text-[#2A2320] block">Benchmark Monthly Lease</span>
                  <span className="text-[10px] text-[#5A524C]">Source: {selectedScenario.sources.rent}</span>
                </div>
                <span className="font-mono font-bold text-[#4A6B5D] text-sm">
                  ${selectedScenario.adjustedMonthlyRent.toLocaleString()}/mo
                </span>
              </div>

              <div className="flex justify-between py-1.5 border-b border-[#E6DFD5]">
                <div>
                  <span className="font-semibold text-[#2A2320] block">Estimated Airbnb Rate</span>
                  <span className="text-[10px] text-[#5A524C]">Source: {selectedScenario.sources.rate}</span>
                </div>
                <span className="font-mono font-bold text-[#E08E6D] text-sm">
                  ${selectedScenario.adjustedNightlyRate}/night
                </span>
              </div>

              <div className="flex justify-between py-1.5">
                <div>
                  <span className="font-semibold text-[#2A2320] block">Annual Lease Net</span>
                  <span className="text-[10px] text-[#5A524C]">After 8% reserve</span>
                </div>
                <span className="font-mono font-bold text-[#2A2320] text-sm">
                  ${selectedScenario.longTerm.netAnnual.toLocaleString()}/yr
                </span>
              </div>
            </div>

            {/* EXACTLY ONE PRIMARY BUTTON (Requirement 8) */}
            <div className="pt-2 border-t border-[#E6DFD5]">
              <button
                type="button"
                onClick={() => {
                  if (onSelectNeighborhood) {
                    onSelectNeighborhood(selectedScenario.neighborhood.name);
                  }
                  if (onOpenCalculator) {
                    onOpenCalculator();
                  }
                }}
                className="w-full py-3 px-4 bg-[#E08E6D] hover:bg-[#C97251] text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-95"
              >
                <span>Use in calculator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
