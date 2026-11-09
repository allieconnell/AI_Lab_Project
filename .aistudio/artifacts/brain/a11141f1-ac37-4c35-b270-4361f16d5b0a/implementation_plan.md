# Implementation Plan: DC Rental Intelligence & Short-Term vs. Long-Term Revenue Engine

## User Review & Confirmed Decisions
- **Design System & Palette (Boho Organic - Earthy & Friendly)**:
  - **Primary (60%)**: Warm Oat / Sandstone (`#F4EFE6` background, `#FDFBF7` elevated cards, `#2C2623` rich charcoal typography).
  - **Secondary (30%)**: Terracotta Peach (`#E08E6D` for primary brand accents, badges, charts, and interactive highlights).
  - **Accent (10%)**: Olive / Forest Moss (`#4A6B5D` for positive revenue deltas, legal status confirmation, and long-term lease markers).
  - **Typography**: DM Sans / Inter font stack with 16px base body text and 1.5 line-height ratio (`leading-relaxed`) for comfortable reading.
  - **Button Styling**: Rounded corners (`rounded-xl` and `rounded-full` for chips and action triggers) with warm subtle shadows and tactile transitions.
- **Primary Focus**: Side-by-side rental revenue calculator as the main feature with the DC Homeowner Host Decision Guide & Regulatory Navigator accessible in tandem.
- **Geospatial Visualization**: A single unified interactive DC map with switchable layers (DC Rent Registry comparables vs. Airbnb neighborhood rates/heatmap).
- **Financial Calculation Depth**: Gross annual revenue comparison with dynamic occupancy rate sliders and break-even analysis.
- **Data Grounding**: Uses uploaded DC datasets (`revenue_lookup`, `training_sample_500`, and `comparables_sample`) combined with official DC Department of Licensing and Consumer Protection (DLCP) and Short-Term Rental Amendment Act guidelines.

---

## Overview & Core Concept
The application is a warm, earthy, and highly intuitive real estate intelligence suite designed for Washington D.C. property owners, prospective hosts, and investors. It integrates rigorous predictive modeling with practical local regulations:
1. **Multiple Linear Regression Engine**:
   - Live client-side Ordinary Least Squares (OLS) regression trained on 500+ verified DC Airbnb listings.
   - Interactive feature checklist (`bedrooms`, `accommodates`, `minimum_nights`, `reviews_ltm`, `room_type_entire`, `high_demand_neighborhood`).
   - Accuracy diagnostic panel: $R^2$, Adjusted $R^2$, Root Mean Squared Error (RMSE), Mean Absolute Error (MAE), and coefficient impact tables.
   - Live property simulator: test any custom combination of bedrooms, guest capacity, and neighborhood to generate predicted nightly rates and annual income.
2. **Short-Term vs. Long-Term Gross Revenue Comparison**:
   - Compares predicted Airbnb revenue (with customizable occupancy days and DC 90-day unhosted cap warnings) directly with actual registered DC residential lease rates from the DC Department of Housing & Community Development database.
   - Computes annual difference, percentage variance, and the exact break-even occupancy days required for Airbnb to surpass a traditional lease.
3. **Interactive D.C. Map with Switchable Layers**:
   - Single interactive map rendered with Leaflet and warm-toned cartography.
   - Switch between **Long-Term Comparables** (pins showing actual registered rental prices, property types, and wards) and **Airbnb Neighborhood Rates** (choropleth/heat circles colored by median neighborhood pricing and occupancy).
4. **DC 2026 Regulatory Advisor & Host Decision Matrix**:
   - Interactive 4-step compliance checker based on the Short-Term Rental Amendment Act of 2026 and DLCP regulations (homestead primary residence check, unhosted 90-day cap, hosted endorsement, HOA verification).
   - Pros & Cons matrix weighing short-term upside against tenant stability.
   - Neighborhood demand index calculated from empirical empirical occupancy percentiles.

---

## UX & Visual Design: Boho Organic Theme
- **Color Tokens**:
  - `bg-oat`: `#F4EFE6` (Page background)
  - `bg-sandstone-card`: `#FAF7F2` (Elevated cards and panels with soft borders `#E5DDD0`)
  - `text-espresso`: `#2A2320` (High-contrast, warm dark brown text)
  - `text-sand-muted`: `#746B63` (Supportive labels and subtitles)
  - `terracotta`: `#E08E6D` (Interactive controls, Airbnb data points, slider tracks, active tabs)
  - `terracotta-dark`: `#C57252` (Hover states)
  - `olive-moss`: `#4A6B5D` (Long-term lease metrics, verified badges, break-even indicators)
  - `olive-moss-dark`: `#3A5449`
- **Typography**: Clean DM Sans / Inter font stack. Base body text set to `text-[16px] leading-[1.5]`. Numeric highlights displayed in clear, legible tabular figures.
- **Buttons & Controls**: Generously rounded (`rounded-xl` for action buttons, `rounded-full` for filter pills and toggle chips). Warm hover lifts and earthy focus rings (`ring-[#E08E6D]/30`).
- **Zero-Pill Discipline on Static Content**: Informational metadata uses clean inline typographic dividers (`·`) rather than heavy pill tags.
- **Top Bar Contract**: Single row header with app title `DC Rental Intelligence`, navigation links (`Calculator`, `Regression Studio`, `Market Map`, `DC Regulations & Guide`), and a primary quick-action CTA (`Analyze Property`).

---

## Technical Architecture & Flow

```
+---------------------------------------------------------------------------------------+
|              Header: Warm Oat (#F4EFE6) with Terracotta & Olive Accents              |
|  [DC Rental Intelligence]   ·   Calculator   ·   Regression   ·   Map   ·   Guide     |
+---------------------------------------------------------------------------------------+
                                           |
             +-----------------------------+-----------------------------+
             |                                                           |
+----------------------------+                               +------------------------+
|   Data Ingestion Layer     |                               |  User Property Input   |
|   - training_sample_500    |                               |  - Ward / Area         |
|   - comparables_sample     |                               |  - Beds / Accommodates |
|   - revenue_lookup         |                               |  - Hosted vs Unhosted  |
+----------------------------+                               +------------------------+
             |                                                           |
             v                                                           v
+----------------------------------------+               +----------------------------+
| OLS Multiple Linear Regression Core    |-------------->|  Predictive Revenue Engine |
| - Normal Equation: β = (X^T X)^-1 X^T Y|               |  - Nightly Rate Projection |
| - Dynamic Factor Toggle Selection      |               |  - Occupancy Adjustments   |
| - Accuracy Metrics: R², RMSE, MAE      |               +----------------------------+
+----------------------------------------+                              |
                                                                        v
+---------------------------------------------------------------------------------------+
|  Primary Comparison Dashboard (Boho Organic Cards):                                   |
|    [Short-Term Airbnb Forecast]             vs.       [DC Long-Term Rent Baseline]    |
|    Terracotta Theme: $215/night                       Olive Theme: $2,420/month       |
|    Gross Annual: $38,700                              Gross Annual: $29,040           |
|    Delta: +$9,660 / year (+33.3%)                     Break-even: 135 nights/year     |
+---------------------------------------------------------------------------------------+
             |                                                           |
             v                                                           v
+----------------------------------------+               +----------------------------+
| Interactive DC Map (Leaflet)           |               | DC 2026 Regulatory Advisor |
| - Layer 1: Long-Term Comparables Pins  |               | - DLCP STR License Test    |
| - Layer 2: Airbnb Price/Occupancy Heat |               | - 90-Day Cap Warning       |
| - Ward Filter & Price Markers          |               | - Pros/Cons & Demand Score |
+----------------------------------------+               +----------------------------+
```

---

## Key Modules & Implementation Details

1. **`src/utils/csvParser.ts`**:
   - Parses the three attached files directly from `/public/assets/aistudio/`:
     - `training_sample_500_a3feab2e.csv` (500 Airbnb records with bedrooms, accommodates, price, occupancy, reviews).
     - `comparables_sample_0992d01b.csv` (1,000+ DC DHCD registered rental accommodations with ward, lat/lng, monthly rent, property type).
     - `revenue_lookup_5b7e58d0.csv` (DC neighborhood percentiles: median price, occupancy, p25/p75 revenue, ceiling share).
2. **`src/utils/regression.ts`**:
   - Implements multiple linear regression with matrix inversion (Gauss-Jordan elimination with partial pivoting) for zero-latency client-side training.
   - Calculates OLS coefficients $\hat{\beta} = (X^T X)^{-1} X^T Y$.
   - Computes $R^2 = 1 - \frac{SS_{res}}{SS_{tot}}$, Adjusted $R^2 = 1 - \frac{(1 - R^2)(n - 1)}{n - p - 1}$, RMSE $\sqrt{\frac{\sum(y - \hat{y})^2}{n}}$, and MAE $\frac{\sum |y - \hat{y}|}{n}$.
   - Dynamically re-trains when users toggle any combination of features:
     - Number of Bedrooms
     - Accommodates (Guest capacity)
     - Minimum Nights Requirement
     - Reviews in Last 12 Months (listing momentum)
     - Entire Home vs. Private Room
     - High Demand Neighborhood tier
3. **`src/components/SideBySideCalculator.tsx`**:
   - Primary feature view: Side-by-side comparison of Airbnb vs. Long-Term leasing.
   - Interactive property builder with slider controls for nights hosted and occupancy percentage.
   - Visual comparison card with Terracotta (`#E08E6D`) for Airbnb and Forest Moss (`#4A6B5D`) for long-term lease.
   - Direct break-even occupancy calculator: calculates exactly how many nights per year the owner must book on Airbnb to match a 12-month traditional lease.
   - DC 90-day unhosted cap notice trigger with real-time revenue adjustment.
4. **`src/components/RegressionStudio.tsx`**:
   - Feature selector with earthy rounded toggle buttons.
   - Live metrics summary ($R^2$, Adjusted $R^2$, RMSE, MAE).
   - Coefficients table showing each selected factor's dollar impact per unit increase (e.g., "+$48.50 per bedroom", "+$18.20 per guest").
   - Prediction tester to input hypothetical property values and see the instant regression output.
5. **`src/components/PropertyMap.tsx`**:
   - Leaflet map centered on Washington, D.C. (38.9072° N, 77.0369° W).
   - Single map with layer control:
     - **Long-Term Comparables**: Olive-toned markers with registered rents, unit types, and addresses from `comparables_sample`.
     - **Airbnb Neighborhood Rates**: Terracotta-toned circle markers sized and shaded by neighborhood median nightly rate and occupancy from `revenue_lookup`.
   - Filter by DC Ward (Ward 1 through Ward 8) and price range.
6. **`src/components/RegulatoryGuide.tsx`**:
   - DC Short-Term Rental Amendment Act of 2026 interactive decision flow:
     - Question 1: Is this your primary residence (homestead tax deduction / registered voter)?
     - Question 2: Hosted (present during stay) vs. Unhosted (vacation rental)?
     - Question 3: HOA, condo board, or lease covenants?
     - Question 4: DLCP STR license endorsement status.
   - Detailed Pros vs. Cons balance sheet (Income potential, calendar flexibility vs. transient tax, turnover labor, DC regulatory restrictions).
   - Market Demand score index by DC neighborhood (Capitol Hill, Dupont, Adams Morgan, Navy Yard, Shaw, etc.).

---

## Dependencies & Packages
- Batched installation of: `leaflet` and `@types/leaflet` for the interactive map.

---

## Verification Plan
1. **Compilation & Linting**: Co-run `compile_applet` and `lint_applet` to ensure error-free TypeScript execution.
2. **Regression Accuracy Verification**: Verify that toggling features updates $R^2$ and RMSE correctly without numerical instability.
3. **Styling Compliance**: Validate that `#F4EFE6` (Warm Oat), `#E08E6D` (Terracotta Peach), and `#4A6B5D` (Forest Moss) are applied consistently, buttons have rounded corners, and body font is 16px with 1.5 line height.
4. **Data Verification**: Ensure coordinates, rates, and occupancy figures load reliably from the attached CSVs.
