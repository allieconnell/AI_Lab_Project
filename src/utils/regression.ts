import { AirbnbListing, RegressionFeatureConfig, RegressionFeatureId, RegressionModelResult, UserPropertyInput } from '../types/rental';

export const AVAILABLE_FEATURES: RegressionFeatureConfig[] = [
  {
    id: 'bedrooms',
    label: 'Bedrooms Count',
    description: 'Number of dedicated bedrooms in the property',
    category: 'Property Physical',
    defaultValue: true,
  },
  {
    id: 'accommodates',
    label: 'Guest Capacity (Accommodates)',
    description: 'Maximum guests the property can comfortably host',
    category: 'Property Physical',
    defaultValue: true,
  },
  {
    id: 'room_type_entire',
    label: 'Entire Home Flag',
    description: 'Binary indicator: 1 if Entire Home/Apartment, 0 if Private Room',
    category: 'Property Physical',
    defaultValue: true,
  },
  {
    id: 'minimum_nights',
    label: 'Minimum Nights Rule',
    description: 'Minimum stay requirement (1 night vs 2+ nights policy)',
    category: 'Listing Rules',
    defaultValue: false,
  },
  {
    id: 'reviews_ltm',
    label: 'Reviews in Past 12 Months',
    description: 'Booking momentum and guest engagement indicator',
    category: 'Market Demand',
    defaultValue: true,
  },
  {
    id: 'high_demand_neighborhood',
    label: 'High Demand Area Flag',
    description: '1 if neighborhood has elevated historical occupancy (>90 nights/yr)',
    category: 'Market Demand',
    defaultValue: false,
  },
];

/**
 * Extracts a numeric value for a given feature from an AirbnbListing
 */
export function extractFeatureValue(listing: AirbnbListing, featureId: RegressionFeatureId): number {
  switch (featureId) {
    case 'bedrooms':
      return listing.bedrooms;
    case 'accommodates':
      return listing.accommodates;
    case 'minimum_nights':
      return listing.minimum_nights;
    case 'reviews_ltm':
      return listing.reviews_ltm;
    case 'room_type_entire':
      return listing.room_type.toLowerCase().includes('entire') ? 1 : 0;
    case 'high_demand_neighborhood':
      return listing.occupancy_est >= 90 ? 1 : 0;
    default:
      return 0;
  }
}

/**
 * Extracts feature value from user interactive input
 */
export function extractUserFeatureValue(input: UserPropertyInput, featureId: RegressionFeatureId): number {
  switch (featureId) {
    case 'bedrooms':
      return input.bedrooms;
    case 'accommodates':
      return input.accommodates;
    case 'minimum_nights':
      return input.minimum_nights;
    case 'reviews_ltm':
      return input.reviews_ltm;
    case 'room_type_entire':
      return input.room_type === 'Entire home/apt' ? 1 : 0;
    case 'high_demand_neighborhood':
      // Popular neighborhoods in DC: Dupont Circle, Capitol Hill, Georgetown, Logan Circle, Navy Yard
      const highDemandAreas = ['Dupont Circle', 'Capitol Hill', 'Georgetown', 'Shaw', 'Logan Circle', 'Navy Yard'];
      return highDemandAreas.some(area => input.neighbourhood.includes(area)) ? 1 : 0;
    default:
      return 0;
  }
}

/**
 * Solves A * x = b using Gaussian elimination with partial pivoting.
 * A is square matrix of size (m x m), b is vector of size m.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] {
  const m = A.length;
  // Create augmented matrix
  const M: number[][] = [];
  for (let i = 0; i < m; i++) {
    M.push([...A[i], b[i]]);
  }

  // Forward elimination
  for (let i = 0; i < m; i++) {
    // Find pivot row
    let maxRow = i;
    let maxVal = Math.abs(M[i][i]);
    for (let r = i + 1; r < m; r++) {
      if (Math.abs(M[r][i]) > maxVal) {
        maxVal = Math.abs(M[r][i]);
        maxRow = r;
      }
    }

    if (maxVal < 1e-12) {
      // Degenerate/singular; add small ridge epsilon
      M[i][i] += 1e-4;
    }

    // Swap pivot row
    if (maxRow !== i) {
      const temp = M[i];
      M[i] = M[maxRow];
      M[maxRow] = temp;
    }

    // Eliminate below
    for (let r = i + 1; r < m; r++) {
      const factor = M[r][i] / M[i][i];
      for (let c = i; c <= m; c++) {
        M[r][c] -= factor * M[i][c];
      }
    }
  }

  // Back substitution
  const x = new Array(m).fill(0);
  for (let i = m - 1; i >= 0; i--) {
    let sum = M[i][m];
    for (let c = i + 1; c < m; c++) {
      sum -= M[i][c] * x[c];
    }
    x[i] = sum / (M[i][i] || 1);
  }

  return x;
}

/**
 * Fits an Ordinary Least Squares (OLS) Multiple Linear Regression model
 * on the provided dataset and selected features.
 */
export function fitMultipleLinearRegression(
  data: AirbnbListing[],
  selectedFeatureIds: RegressionFeatureId[],
  target: 'price_clean' | 'revenue_comp' = 'price_clean'
): RegressionModelResult {
  // If no features selected, fallback to bedrooms
  const features = selectedFeatureIds.length > 0 ? selectedFeatureIds : (['bedrooms'] as RegressionFeatureId[]);
  const n = data.length;
  const p = features.length;

  // Intercept is feature index 0
  const m = p + 1;

  // Compute Normal Equation matrices X^T X and X^T Y
  const XtX: number[][] = Array.from({ length: m }, () => new Array(m).fill(0));
  const XtY: number[] = new Array(m).fill(0);

  let ySum = 0;
  const yVals: number[] = [];

  for (let i = 0; i < n; i++) {
    const listing = data[i];
    const y = target === 'price_clean' ? listing.price_clean : listing.revenue_comp;
    yVals.push(y);
    ySum += y;

    // Row vector: [1, x_1, x_2, ..., x_p]
    const row = [1];
    for (let j = 0; j < p; j++) {
      row.push(extractFeatureValue(listing, features[j]));
    }

    // Accumulate XtX and XtY
    for (let r = 0; r < m; r++) {
      XtY[r] += row[r] * y;
      for (let c = 0; c < m; c++) {
        XtX[r][c] += row[r] * row[c];
      }
    }
  }

  // Add slight L2 regularization (Ridge) to guarantee stability on collinear features
  for (let r = 1; r < m; r++) {
    XtX[r][r] += 1e-4;
  }

  // Solve for beta weights: beta = [beta_0, beta_1, ..., beta_p]
  const beta = solveLinearSystem(XtX, XtY);
  const intercept = beta[0];
  const coefficients: Record<string, number> = {};
  for (let j = 0; j < p; j++) {
    coefficients[features[j]] = beta[j + 1];
  }

  // Calculate residuals, SS_res, SS_tot, MAE
  const yMean = ySum / (n || 1);
  let ssTot = 0;
  let ssRes = 0;
  let absErrorSum = 0;

  const residualsSample: Array<{ id: string; actual: number; predicted: number; error: number }> = [];

  for (let i = 0; i < n; i++) {
    const listing = data[i];
    const yActual = yVals[i];

    let yPred = intercept;
    for (let j = 0; j < p; j++) {
      yPred += beta[j + 1] * extractFeatureValue(listing, features[j]);
    }
    // Price floor at $35 or zero
    yPred = Math.max(target === 'price_clean' ? 35 : 500, yPred);

    const error = yActual - yPred;
    ssRes += error * error;
    ssTot += (yActual - yMean) * (yActual - yMean);
    absErrorSum += Math.abs(error);

    // Keep representative residuals sample for the UI
    if (i < 20 || i % 40 === 0) {
      residualsSample.push({
        id: listing.id,
        actual: Math.round(yActual),
        predicted: Math.round(yPred),
        error: Math.round(error),
      });
    }
  }

  const rSquared = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0;
  const adjRSquared = n > p + 1 ? Math.max(0, 1 - ((1 - rSquared) * (n - 1)) / (n - p - 1)) : rSquared;
  const rmse = Math.sqrt(ssRes / (n || 1));
  const mae = absErrorSum / (n || 1);

  return {
    target,
    selectedFeatures: features,
    coefficients,
    intercept,
    rSquared,
    adjRSquared,
    rmse,
    mae,
    sampleSize: n,
    residualsSample: residualsSample.slice(0, 15),
  };
}

/**
 * Predicts nightly price or annual revenue for a new user property input
 */
export function predictPropertyMetric(
  input: UserPropertyInput,
  model: RegressionModelResult
): number {
  let predicted = model.intercept;

  for (const featureId of model.selectedFeatures) {
    const featureVal = extractUserFeatureValue(input, featureId);
    const weight = model.coefficients[featureId] || 0;
    predicted += weight * featureVal;
  }

  // Reasonable bounds
  if (model.target === 'price_clean') {
    return Math.max(45, Math.round(predicted));
  } else {
    return Math.max(1200, Math.round(predicted));
  }
}
