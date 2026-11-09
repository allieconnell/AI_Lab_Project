import React, { useEffect, useState } from 'react';
import { Header, NavTab } from './components/Header';
import { SideBySideCalculator } from './components/SideBySideCalculator';
import { RegressionStudio } from './components/RegressionStudio';
import { PropertyMap } from './components/PropertyMap';
import { RegulatoryGuide } from './components/RegulatoryGuide';
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
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('calculator');
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

  // Linear Regression Model
  const [priceModel, setPriceModel] = useState<RegressionModelResult | null>(null);

  // User Property Inputs
  const [propertyInput, setPropertyInput] = useState<UserPropertyInput>({
    neighbourhood: 'Dupont Circle, Connecticut Avenue/K Street',
    ward: 'Ward 2',
    bedrooms: 1,
    accommodates: 2,
    room_type: 'Entire home/apt',
    minimum_nights: 2,
    reviews_ltm: 16,
    isHosted: false, // Default unhosted vacation rental subject to DC 90-day cap
    customOccupancyNights: 90,
  });

  // Handle property input update
  const handleUpdatePropertyInput = (updated: Partial<UserPropertyInput>) => {
    setPropertyInput((prev) => {
      const next = { ...prev, ...updated };
      // If changing from hosted to unhosted and occupancy > 90, automatically cap
      if (updated.isHosted === false && next.customOccupancyNights > 90) {
        next.customOccupancyNights = 90;
      }
      return next;
    });
  };

  // Hydrate data from attached local CSVs on initial mount
  useEffect(() => {
    async function loadAllDatasets() {
      try {
        setLoading(true);
        setLoadError(null);

        // Fetch the attached datasets including new Ward 2 individual host listings
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
        const existingIds = new Set(parsedWard2.map(w => w.id));
        const filteredMain = parsedAirbnb.filter(a => !existingIds.has(a.id));
        const combinedAirbnb = [...parsedWard2, ...filteredMain];

        setAirbnbData(combinedAirbnb);
        setLongTermData(parsedLongTerm);
        setRevenueLookups(parsedRevenue);

        // Initialize multiple linear regression with primary physical & momentum factors
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

  return (
    <div className="min-h-screen bg-[#F4EFE6] text-[#2A2320] flex flex-col font-sans">
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
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

      {/* Compliant Header adhering to Top Bar Contract */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onQuickSimulate={() => setActiveTab('calculator')}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <Loader2 className="w-8 h-8 text-[#E08E6D] animate-spin" />
            <div className="text-center">
              <h3 className="text-base font-semibold text-[#2A2320]">
                Calibrating DC Rental Engine...
              </h3>
              <p className="text-xs text-[#746B63] mt-1">
                Parsing 1,100+ Airbnb records and 500 DC rent registry accommodations
              </p>
            </div>
          </div>
        ) : loadError ? (
          <div className="max-w-xl mx-auto my-12 p-6 rounded-2xl bg-[#FAF0EB] border border-[#E08E6D]/40 text-[#2A2320] space-y-3">
            <div className="flex items-center space-x-2 text-[#C97251]">
              <AlertCircle className="w-5 h-5" />
              <h3 className="font-semibold text-sm">Data Loading Error</h3>
            </div>
            <p className="text-xs text-[#746B63]">{loadError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#E08E6D] hover:bg-[#C97251] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : priceModel ? (
          <>
            {activeTab === 'calculator' && (
              <SideBySideCalculator
                propertyInput={propertyInput}
                onChangeInput={handleUpdatePropertyInput}
                priceModel={priceModel}
                longTermListings={longTermData}
                onOpenRegulations={() => setActiveTab('regulations')}
                onOpenRegression={() => setActiveTab('regression')}
              />
            )}

            {activeTab === 'regression' && (
              <RegressionStudio
                airbnbData={airbnbData}
                model={priceModel}
                onModelUpdate={setPriceModel}
                propertyInput={propertyInput}
                onChangeInput={handleUpdatePropertyInput}
              />
            )}

            {activeTab === 'map' && (
              <PropertyMap
                airbnbListings={airbnbData}
                longTermListings={longTermData}
                revenueLookups={revenueLookups}
                selectedWard={propertyInput.ward}
                onSelectWard={(w) => handleUpdatePropertyInput({ ward: w })}
              />
            )}

            {activeTab === 'regulations' && (
              <RegulatoryGuide
                revenueLookups={revenueLookups}
                onNavigateToCalculator={() => setActiveTab('calculator')}
              />
            )}
          </>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E6DFD5] bg-[#F4EFE6] py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#746B63] gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#2A2320]">DC Rental Intelligence</span>
            <span>·</span>
            <span>Ordinary Least Squares Model</span>
            <span>·</span>
            <span>DC DLCP STR Amendment Act 2026</span>
          </div>
          <div>
            Data sources: D.C. DHCD Rent Registry · AirBNB Open Data · DLCP Licensing
          </div>
        </div>
      </footer>
    </div>
  );
}
