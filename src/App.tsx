import React, { useEffect, useState, useCallback } from 'react';
import { Header, NavTab } from './components/Header';
import { HomeIntakeHub } from './components/HomeIntakeHub';
import { PropertyMap } from './components/PropertyMap';
import { ProConChatbot } from './components/ProConChatbot';
import {
  AirbnbListing,
  LongTermComparable,
  RegressionModelResult,
  RevenueLookupItem,
  UserPropertyInput,
} from './types/rental';
import {
  parseAirbnbListings,
  parseLongTermComparables,
  parseRevenueLookup,
  parseWard2Listings,
} from './utils/dataParser';
import { fitMultipleLinearRegression } from './utils/regression';
import { calculateCanonicalScenario, getCanonicalNeighborhood } from './utils/canonicalMarketData';
import { Loader2, AlertCircle, Scale, X } from 'lucide-react';

export default function App() {
  // Read initial state from URL query parameters (Requirement 10: URL persistence)
  const initialUrlParams = new URLSearchParams(window.location.search);
  const urlTab = initialUrlParams.get('tab') as NavTab;
  const urlNh = initialUrlParams.get('nh');
  const urlBeds = initialUrlParams.get('beds');
  const urlSpace = initialUrlParams.get('space');
  const urlPrim = initialUrlParams.get('prim');
  const urlHoa = initialUrlParams.get('hoa');

  const initialNeighborhood = urlNh
    ? getCanonicalNeighborhood(urlNh).name
    : 'Dupont Circle, Connecticut Avenue/K Street';

  const [activeTab, setActiveTab] = useState<NavTab>(
    urlTab === 'map' || urlTab === 'advisor' ? urlTab : 'home'
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState<boolean>(false);

  useEffect(() => {
    const handleQuotaExceeded = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
  }, []);

  // Parsed Datasets
  const [airbnbData, setAirbnbData] = useState<AirbnbListing[]>([]);
  const [longTermData, setLongTermData] = useState<LongTermComparable[]>([]);
  const [revenueLookups, setRevenueLookups] = useState<RevenueLookupItem[]>([]);

  // Floating Chat Drawer state
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState<boolean>(false);

  // Linear Regression Model
  const [priceModel, setPriceModel] = useState<RegressionModelResult | null>(null);

  // User Property Inputs
  const [propertyInput, setPropertyInput] = useState<UserPropertyInput>({
    neighbourhood: initialNeighborhood,
    ward: getCanonicalNeighborhood(initialNeighborhood).ward,
    bedrooms: urlBeds !== null ? parseInt(urlBeds, 10) || 1 : 1,
    accommodates: 2,
    room_type: urlSpace === 'private' ? 'Private room' : 'Entire home/apt',
    minimum_nights: 2,
    reviews_ltm: 16,
    isHosted: false,
    customOccupancyNights: 90,
    isPrimaryResidence: urlPrim !== '0',
    hasHoaApproval: urlHoa !== '0',
    ownershipStatus: 'owner',
    hasDlcpLicense: false,
  });

  // Handle property input update
  const handleUpdatePropertyInput = useCallback((updated: Partial<UserPropertyInput>) => {
    setPropertyInput((prev) => {
      const next = { ...prev, ...updated };
      if (updated.neighbourhood) {
        next.ward = getCanonicalNeighborhood(updated.neighbourhood).ward;
      }
      return next;
    });
  }, []);

  // Sync state to URL search parameters (Requirement 10)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('tab', activeTab);
    params.set('nh', propertyInput.neighbourhood);
    params.set('beds', propertyInput.bedrooms.toString());
    params.set('space', propertyInput.room_type === 'Private room' ? 'private' : 'entire');
    params.set('prim', propertyInput.isPrimaryResidence ? '1' : '0');
    params.set('hoa', propertyInput.hasHoaApproval ? '1' : '0');

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeTab, propertyInput]);

  // Hydrate data from attached local CSVs on initial mount
  useEffect(() => {
    async function loadAllDatasets() {
      try {
        setLoading(true);
        setLoadError(null);

        const [airbnbRes, longTermRes, revenueRes, ward2Res] = await Promise.all([
          fetch('/assets/aistudio/comparables_sample_0992d01b.csv'),
          fetch('/assets/aistudio/training_sample_500_a3feab2e.csv'),
          fetch('/assets/aistudio/revenue_lookup_5b7e58d0.csv'),
          fetch('/assets/aistudio/ward2_individual_host_listings_ed4f441d.csv'),
        ]);

        if (!airbnbRes.ok || !longTermRes.ok || !revenueRes.ok) {
          throw new Error('Failed to load dataset files from workspace asset paths.');
        }

        const [airbnbText, longTermText, revenueText, ward2Text] = await Promise.all([
          airbnbRes.text(),
          longTermRes.text(),
          revenueRes.text(),
          ward2Res.ok ? ward2Res.text() : Promise.resolve(''),
        ]);

        const parsedAirbnb = parseAirbnbListings(airbnbText);
        const parsedLongTerm = parseLongTermComparables(longTermText);
        const parsedRevenue = parseRevenueLookup(revenueText);
        const parsedWard2 = ward2Text ? parseWard2Listings(ward2Text) : [];

        // Merge Ward 2 listings with main Airbnb dataset (avoiding duplicates)
        const existingIds = new Set(parsedWard2.map((w) => w.id));
        const filteredMain = parsedAirbnb.filter((a) => !existingIds.has(a.id));
        const combinedAirbnb = [...parsedWard2, ...filteredMain];

        setAirbnbData(combinedAirbnb);
        setLongTermData(parsedLongTerm);
        setRevenueLookups(parsedRevenue);

        // Initialize multiple linear regression model
        const initialModel = fitMultipleLinearRegression(
          combinedAirbnb,
          ['bedrooms', 'accommodates', 'room_type_entire', 'reviews_ltm'],
          'price_clean'
        );
        setPriceModel(initialModel);
      } catch (err: any) {
        console.error('Data loading error:', err);
        setLoadError(err.message || 'Error loading rental datasets');
      } finally {
        setLoading(false);
      }
    }

    loadAllDatasets();
  }, []);

  // Canonical scenario computation (single source of truth for entire app)
  const activeScenario = calculateCanonicalScenario({
    neighborhoodName: propertyInput.neighbourhood,
    bedrooms: propertyInput.bedrooms,
    spaceType: propertyInput.room_type,
    isPrimaryResidence: propertyInput.isPrimaryResidence,
    isHoaAllowed: propertyInput.hasHoaApproval,
  });

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#2A2320] flex flex-col font-sans pb-16 md:pb-0">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-xs">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Simplified 3-Tab Header (Home Hub, Market Map, Pro/Con Advisor) */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onShareScenario={() => {
          navigator.clipboard.writeText(window.location.href);
        }}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <Loader2 className="w-8 h-8 text-[#E08E6D] animate-spin" />
            <div className="text-center">
              <h3 className="text-base font-semibold text-[#2A2320]">
                Calibrating DC Rental Engine...
              </h3>
              <p className="text-xs text-[#5A524C] mt-1">
                Synchronizing DC DHCD rent registry & 2026 short-term rental regulations
              </p>
            </div>
          </div>
        ) : loadError ? (
          <div className="max-w-xl mx-auto my-12 p-6 rounded-3xl bg-[#FAF0EB] border border-[#E08E6D]/40 text-[#2A2320] space-y-3">
            <div className="flex items-center space-x-2 text-[#C97251]">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Data Loading Error</h3>
            </div>
            <p className="text-xs text-[#5A524C]">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#E08E6D] hover:bg-[#C97251] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* TAB 1: HOME HUB (Typeahead search, Live sticky strip, 3-column table, regulation checklist, pros/cons) */}
            {activeTab === 'home' && (
              <HomeIntakeHub
                propertyInput={propertyInput}
                onChangeInput={handleUpdatePropertyInput}
                priceModel={priceModel}
                longTermListings={longTermData}
                onNavigateTab={setActiveTab}
              />
            )}

            {/* TAB 2: MARKET MAP (Compact markers, metric toggle, single primary button, single source of truth) */}
            {activeTab === 'map' && (
              <PropertyMap
                airbnbListings={airbnbData}
                longTermListings={longTermData}
                revenueLookups={revenueLookups}
                selectedWard={propertyInput.ward}
                onSelectWard={(w) => handleUpdatePropertyInput({ ward: w })}
                userNeighborhood={propertyInput.neighbourhood}
                onSelectNeighborhood={(n) => handleUpdatePropertyInput({ neighbourhood: n })}
                onOpenCalculator={() => setActiveTab('home')}
              />
            )}

            {/* TAB 3: PRO/CON ADVISOR CHATBOT */}
            {activeTab === 'advisor' && (
              <ProConChatbot
                context={{
                  neighborhood: propertyInput.neighbourhood,
                  ward: activeScenario.ward,
                  bedrooms: propertyInput.bedrooms,
                  currentLease: activeScenario.adjustedMonthlyRent,
                  airbnbPrice: activeScenario.adjustedNightlyRate,
                  isPrimaryResidence: propertyInput.isPrimaryResidence,
                  isHosted: propertyInput.isHosted,
                }}
                onNavigateToCalculator={() => setActiveTab('home')}
                onNavigateToRegulations={() => setActiveTab('home')}
              />
            )}
          </>
        )}
      </main>

      {/* Floating Advisor Launcher (Positioned above mobile bar so it never overlaps content) */}
      {activeTab !== 'advisor' && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-30">
          <button
            type="button"
            onClick={() => setIsFloatingChatOpen((prev) => !prev)}
            className="bg-[#2A2320] hover:bg-[#3A3330] text-white px-4 py-3 rounded-full shadow-xl border border-[#E6DFD5]/30 flex items-center space-x-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
            title="Open Pro/Con Advisor"
          >
            <div className="w-6 h-6 rounded-full bg-[#E08E6D] flex items-center justify-center text-white shrink-0">
              <Scale className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-semibold tracking-wide">
              {isFloatingChatOpen ? 'Close Advisor' : 'Pro/Con Advisor'}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#4A6B5D] animate-pulse" />
          </button>
        </div>
      )}

      {/* Floating Slide-over / Modal Chatbot */}
      {isFloatingChatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-black/40 backdrop-blur-xs">
          <div className="w-full sm:max-w-xl h-[85vh] sm:h-[680px] bg-[#FAF7F2] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[#E6DFD5]">
            <ProConChatbot
              isEmbedded
              onClose={() => setIsFloatingChatOpen(false)}
              context={{
                neighborhood: propertyInput.neighbourhood,
                ward: activeScenario.ward,
                bedrooms: propertyInput.bedrooms,
                currentLease: activeScenario.adjustedMonthlyRent,
                airbnbPrice: activeScenario.adjustedNightlyRate,
                isPrimaryResidence: propertyInput.isPrimaryResidence,
                isHosted: propertyInput.isHosted,
              }}
              onNavigateToCalculator={() => {
                setIsFloatingChatOpen(false);
                setActiveTab('home');
              }}
              onNavigateToRegulations={() => {
                setIsFloatingChatOpen(false);
                setActiveTab('home');
              }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#E6DFD5] bg-[#F4EFE6] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#5A524C] gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#2A2320]">DC Rental Intelligence</span>
            <span>·</span>
            <span>DC Department of Licensing and Consumer Protection (DLCP)</span>
            <span>·</span>
            <span>Short-Term Rental Regulation Act 2026</span>
          </div>
          <div>
            Data Sources: D.C. DHCD Rent Registry (Q4 2025) · D.C. Open Airbnb Dataset (2025–2026)
          </div>
        </div>
      </footer>
    </div>
  );
}
