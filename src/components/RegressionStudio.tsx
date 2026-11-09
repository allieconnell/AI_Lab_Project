import React, { useState } from 'react';
import {
  AirbnbListing,
  RegressionFeatureConfig,
  RegressionFeatureId,
  RegressionModelResult,
  UserPropertyInput,
} from '../types/rental';
import {
  AVAILABLE_FEATURES,
  fitMultipleLinearRegression,
  predictPropertyMetric,
} from '../utils/regression';
import {
  BarChart3,
  CheckCircle2,
  SlidersHorizontal,
  Calculator,
  RefreshCw,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

interface RegressionStudioProps {
  airbnbData: AirbnbListing[];
  model: RegressionModelResult;
  onModelUpdate: (newModel: RegressionModelResult) => void;
  propertyInput: UserPropertyInput;
  onChangeInput: (updated: Partial<UserPropertyInput>) => void;
}

export const RegressionStudio: React.FC<RegressionStudioProps> = ({
  airbnbData,
  model,
  onModelUpdate,
  propertyInput,
  onChangeInput,
}) => {
  const [targetVariable, setTargetVariable] = useState<'price_clean' | 'revenue_comp'>('price_clean');
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<RegressionFeatureId[]>(
    model.selectedFeatures
  );

  // Toggle factor
  const handleToggleFeature = (id: RegressionFeatureId) => {
    let next: RegressionFeatureId[];
    if (selectedFeatureIds.includes(id)) {
      if (selectedFeatureIds.length <= 1) return; // keep at least 1
      next = selectedFeatureIds.filter((f) => f !== id);
    } else {
      next = [...selectedFeatureIds, id];
    }
    setSelectedFeatureIds(next);
    const updated = fitMultipleLinearRegression(airbnbData, next, targetVariable);
    onModelUpdate(updated);
  };

  // Switch target between nightly price and overall annual revenue
  const handleSwitchTarget = (target: 'price_clean' | 'revenue_comp') => {
    setTargetVariable(target);
    const updated = fitMultipleLinearRegression(airbnbData, selectedFeatureIds, target);
    onModelUpdate(updated);
  };

  // Reset to optimal defaults
  const handleResetDefaults = () => {
    const defaults: RegressionFeatureId[] = ['bedrooms', 'accommodates', 'room_type_entire', 'reviews_ltm'];
    setSelectedFeatureIds(defaults);
    const updated = fitMultipleLinearRegression(airbnbData, defaults, targetVariable);
    onModelUpdate(updated);
  };

  // Interactive live prediction from user values
  const livePrediction = predictPropertyMetric(propertyInput, model);

  return (
    <div className="space-y-8">
      {/* Studio Header */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#4A6B5D] mb-1">
              <span>Ordinary Least Squares (OLS) Studio</span>
              <span>·</span>
              <span>N = {airbnbData.length} Listings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#2A2320] tracking-tight">
              Predictive Linear Regression Modeling
            </h1>
            <p className="text-sm text-[#746B63] mt-1 max-w-2xl leading-relaxed">
              Select which factors to include in the multi-variable model. Review real-time goodness-of-fit metrics, inspect coefficient weightings, and enter custom property values to generate instant predictions.
            </p>
          </div>

          {/* Target Toggle */}
          <div className="flex items-center space-x-2 bg-[#F4EFE6] p-1.5 rounded-xl border border-[#E6DFD5]">
            <button
              onClick={() => handleSwitchTarget('price_clean')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                targetVariable === 'price_clean'
                  ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs font-semibold'
                  : 'text-[#746B63] hover:text-[#2A2320]'
              }`}
            >
              Nightly Price ($)
            </button>
            <button
              onClick={() => handleSwitchTarget('revenue_comp')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                targetVariable === 'revenue_comp'
                  ? 'bg-[#FAF7F2] text-[#2A2320] shadow-xs font-semibold'
                  : 'text-[#746B63] hover:text-[#2A2320]'
              }`}
            >
              Annual Revenue ($)
            </button>
          </div>
        </div>
      </div>

      {/* Accuracy Measures Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* R-Squared */}
        <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#746B63] uppercase tracking-wider">
              R² (Variance Explained)
            </span>
            <div className="group relative">
              <HelpCircle className="w-4 h-4 text-[#746B63] cursor-pointer" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover:block w-48 p-2 bg-[#2A2320] text-white text-[11px] rounded-lg shadow-lg z-10">
                Proportion of price variance explained by your chosen factors.
              </div>
            </div>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-[#2A2320]">
              {(model.rSquared * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-[#4A6B5D] font-medium">
              Adj: {(model.adjRSquared * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-[#EFE9DE] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#4A6B5D] h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, model.rSquared * 100)}%` }}
            />
          </div>
        </div>

        {/* RMSE */}
        <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#746B63] uppercase tracking-wider">
              RMSE (Standard Error)
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-[#2A2320]">
              ${Math.round(model.rmse).toLocaleString()}
            </span>
            <span className="text-xs text-[#746B63]">
              {targetVariable === 'price_clean' ? '/night' : '/year'}
            </span>
          </div>
          <p className="text-[11px] text-[#746B63] mt-2">
            Root Mean Squared Error penalizes large residual deviations.
          </p>
        </div>

        {/* MAE */}
        <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#746B63] uppercase tracking-wider">
              MAE (Mean Abs Error)
            </span>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-[#2A2320]">
              ${Math.round(model.mae).toLocaleString()}
            </span>
            <span className="text-xs text-[#746B63]">
              {targetVariable === 'price_clean' ? '/night' : '/year'}
            </span>
          </div>
          <p className="text-[11px] text-[#746B63] mt-2">
            Average absolute difference between actual listing prices & model predictions.
          </p>
        </div>

        {/* Active Factors */}
        <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-4 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#746B63] uppercase tracking-wider">
              Model Degrees of Freedom
            </span>
            <button
              onClick={handleResetDefaults}
              className="text-[#E08E6D] hover:text-[#C97251] text-xs flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-bold font-mono text-[#2A2320]">
              {selectedFeatureIds.length}
            </span>
            <span className="text-xs text-[#746B63]">/ {AVAILABLE_FEATURES.length} factors selected</span>
          </div>
          <p className="text-[11px] text-[#746B63] mt-2">
            Base intercept: <span className="font-mono font-medium">${Math.round(model.intercept)}</span>
          </p>
        </div>
      </div>

      {/* Main Studio Interactive Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Factor Selector & Coefficients Table */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-[#E6DFD5] pb-4">
              <div>
                <h3 className="text-base font-semibold text-[#2A2320] flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#E08E6D]" />
                  <span>Choose Model Factors</span>
                </h3>
                <p className="text-xs text-[#746B63] mt-0.5">
                  Select independent variables to include in the linear regression equation.
                </p>
              </div>
            </div>

            {/* Factor Checkboxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_FEATURES.map((feat) => {
                const isSelected = selectedFeatureIds.includes(feat.id);
                const coef = model.coefficients[feat.id];

                return (
                  <div
                    key={feat.id}
                    onClick={() => handleToggleFeature(feat.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#4A6B5D] bg-[#4A6B5D]/5 ring-1 ring-[#4A6B5D]'
                        : 'border-[#E6DFD5] bg-[#FDFBF7] opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-[#746B63] block">
                          {feat.category}
                        </span>
                        <span className="text-sm font-semibold text-[#2A2320]">{feat.label}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#4A6B5D] text-white' : 'border border-[#D9CEBE]'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </div>

                    <p className="text-xs text-[#746B63] mt-2">{feat.description}</p>

                    <div className="mt-3 pt-2 border-t border-[#E6DFD5]/60 flex justify-between items-center text-xs">
                      <span className="text-[#746B63]">Marginal Impact:</span>
                      {isSelected && coef !== undefined ? (
                        <span className="font-mono font-semibold text-[#4A6B5D]">
                          {coef >= 0 ? '+' : ''}${coef.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-[#746B63] italic">Excluded</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Regression Equation Preview */}
            <div className="p-4 rounded-xl bg-[#F4EFE6] border border-[#E6DFD5]">
              <span className="text-[11px] font-semibold text-[#746B63] uppercase tracking-wider block mb-1">
                Fitted Linear Regression Equation
              </span>
              <div className="font-mono text-xs text-[#2A2320] break-all leading-relaxed">
                <span className="font-bold text-[#E08E6D]">
                  {targetVariable === 'price_clean' ? 'NightlyPrice' : 'AnnualRevenue'}
                </span>{' '}
                = ${Math.round(model.intercept)}
                {selectedFeatureIds.map((id) => {
                  const weight = model.coefficients[id] || 0;
                  const sign = weight >= 0 ? '+' : '-';
                  return (
                    <span key={id}>
                      {' '}
                      {sign} ${Math.abs(weight).toFixed(2)} × <span className="underline decoration-[#E08E6D]/50">{id}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Enter New Values to Get Prediction */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center border-b border-[#E6DFD5] pb-4">
              <div>
                <h3 className="text-base font-semibold text-[#2A2320] flex items-center space-x-2">
                  <Calculator className="w-4 h-4 text-[#E08E6D]" />
                  <span>Enter New Values for Prediction</span>
                </h3>
                <p className="text-xs text-[#746B63] mt-0.5">
                  Test hypothetical property specifications on the active model.
                </p>
              </div>
            </div>

            {/* Interactive Inputs */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#746B63]">Bedrooms</span>
                  <span className="font-mono font-medium text-[#2A2320]">{propertyInput.bedrooms} BR</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={5}
                  value={propertyInput.bedrooms}
                  onChange={(e) => onChangeInput({ bedrooms: parseInt(e.target.value) })}
                  className="w-full accent-[#E08E6D] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#746B63]">Accommodates (Guests)</span>
                  <span className="font-mono font-medium text-[#2A2320]">{propertyInput.accommodates} guests</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={propertyInput.accommodates}
                  onChange={(e) => onChangeInput({ accommodates: parseInt(e.target.value) })}
                  className="w-full accent-[#E08E6D] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#746B63]">Reviews in Past Year</span>
                  <span className="font-mono font-medium text-[#2A2320]">{propertyInput.reviews_ltm} reviews</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={propertyInput.reviews_ltm}
                  onChange={(e) => onChangeInput({ reviews_ltm: parseInt(e.target.value) })}
                  className="w-full accent-[#E08E6D] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-[#746B63] block mb-1">Room Arrangement</label>
                  <select
                    value={propertyInput.room_type}
                    onChange={(e) => onChangeInput({ room_type: e.target.value as any })}
                    className="w-full bg-[#FDFBF7] border border-[#E6DFD5] rounded-xl px-3 py-2 text-xs text-[#2A2320]"
                  >
                    <option value="Entire home/apt">Entire Home</option>
                    <option value="Private room">Private Room</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#746B63] block mb-1">Minimum Nights</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={propertyInput.minimum_nights}
                    onChange={(e) => onChangeInput({ minimum_nights: parseInt(e.target.value) || 1 })}
                    className="w-full bg-[#FDFBF7] border border-[#E6DFD5] rounded-xl px-3 py-2 text-xs text-[#2A2320] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="mt-6 p-5 rounded-xl border border-[#E08E6D]/50 bg-[#FAF0EB] space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-semibold text-[#C97251] uppercase tracking-wider">
                  Model Output
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#E08E6D]/20 text-[#C97251] font-mono">
                  OLS Matrix Solution
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-extrabold font-mono text-[#2A2320]">
                  ${livePrediction.toLocaleString()}
                </span>
                <span className="text-xs text-[#746B63]">
                  {targetVariable === 'price_clean' ? 'predicted / night' : 'predicted gross / year'}
                </span>
              </div>

              {targetVariable === 'price_clean' && (
                <div className="pt-2 border-t border-[#E08E6D]/20 text-xs text-[#746B63] flex justify-between">
                  <span>At 90 days (DC unhosted cap):</span>
                  <span className="font-mono font-semibold text-[#2A2320]">
                    ${(livePrediction * 90).toLocaleString()}/yr
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Residuals and Calibration Table */}
      <div className="bg-[#FAF7F2] border border-[#E6DFD5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E6DFD5] pb-4">
          <div>
            <h3 className="text-base font-semibold text-[#2A2320] flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#4A6B5D]" />
              <span>Model Residuals & Actual Listing Calibration</span>
            </h3>
            <p className="text-xs text-[#746B63] mt-0.5">
              Comparison between observed DC Airbnb listing values (y) and model fitted values (y&#770;).
            </p>
          </div>
          <span className="text-xs font-mono text-[#746B63]">Sample validation window</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#F4EFE6] text-[#746B63] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">Listing ID</th>
                <th className="py-2.5 px-3">Actual Value</th>
                <th className="py-2.5 px-3">Model Predicted</th>
                <th className="py-2.5 px-3">Residual Error (e)</th>
                <th className="py-2.5 px-3 rounded-r-lg">Accuracy Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E6DFD5]/60 font-mono">
              {model.residualsSample.map((res) => {
                const absErrPct = res.actual > 0 ? Math.round((Math.abs(res.error) / res.actual) * 100) : 0;
                return (
                  <tr key={res.id} className="hover:bg-[#FDFBF7] transition-colors">
                    <td className="py-2.5 px-3 text-[#2A2320] font-sans font-medium">{res.id}</td>
                    <td className="py-2.5 px-3 text-[#2A2320]">${res.actual.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-[#4A6B5D] font-semibold">${res.predicted.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <span className={res.error >= 0 ? 'text-[#4A6B5D]' : 'text-[#E08E6D]'}>
                        {res.error >= 0 ? '+' : ''}${res.error.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[#746B63] font-sans">
                      <span className="inline-block px-2 py-0.5 rounded-full bg-[#FAF0EB] text-[#2A2320] text-[11px]">
                        ±{absErrPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
