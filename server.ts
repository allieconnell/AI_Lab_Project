import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI client (telemetry User-Agent header required by gemini-api skill)
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const SYSTEM_INSTRUCTION = `You are the "DC Rental Intelligence Pro/Con Advisor" — an authoritative Washington D.C. housing economist and real estate strategist specializing in comparing Short-Term Rentals (Airbnb / VRBO) versus Long-Term Leases for D.C. property owners.

Your mission is to provide balanced, rigorous, highly practical Pro/Con analyses and strategic recommendations tailored to the user's specific property, neighborhood, and personal goals.

Key Washington D.C. Legal & Financial Realities (Current 2026 Regulations):
1. D.C. Short-Term Rental Regulation Act of 2018 (Law 22-307, fully enforced):
   - Primary Residence Requirement: Short-term rentals are ONLY permitted in the host's primary residence (where the owner has a homestead deduction). Second homes, pure investment condos, and corporate entities cannot operate short-term rentals legally.
   - Hosted vs. Unhosted:
     * Hosted Rentals (host is on-site overnight): No day limit (unlimited 365 days/year).
     * Unhosted Rentals (host is away): Strict 90-day annual cap per calendar year. Exemption for up to 180 days only for military/employer-mandated relocation.
   - Licensing: Department of Licensing and Consumer Protection (DLCP) license required ($104.50 biennially), plus clean hands certification, liability insurance ($500k), and smoke/CO detectors.
   - Taxes: 14.95% transient accommodation tax (collected directly by Airbnb/VRBO and remitted to D.C. Office of Tax and Revenue).
   - English Basements / Accessory Apartments (ADUs): Permitted only if the owner lives in the main residence.

2. D.C. Long-Term Lease Regulations:
   - Tenant Opportunity to Purchase Act (TOPA - D.C. Code § 42-3404): Single-family homes are exempt since 2018; however, multi-unit properties and English basements with distinct rental units may trigger TOPA notices and right of first refusal if sold.
   - Rent Control / Rent Stabilization: Applies to buildings constructed before 1975 with 5 or more units owned by non-natural persons. Single-family homes and condos owned by individuals (up to 4 units) can claim exemption via DLCP RAD Form 1.
   - Eviction Process: D.C. has strong tenant protections; evictions can take 6-12 months through D.C. Superior Court Landlord & Tenant Branch.
   - Security Deposits: Capped at one month's rent, held in interest-bearing escrow, must be refunded within 45 days.

3. Financial & Operational Dynamics:
   - Airbnb Pros: Peak event surges (Cherry Blossom Festival in March/April, IMF/World Bank annual meetings, Congressional sessions, inaugurations), personal flexibility to use the home, no long-term lease lock-in, payment secured by platform upfront.
   - Airbnb Cons: 90-day unhosted cap severely restricts unhosted revenue potential; 15-20% cleaning/turnover overhead; dynamic vacancy risk during slow summer (August) and winter (December/January); guest communication and wear-and-tear.
   - Long-Term Lease Pros: 12-month predictable cash flow, zero 90-day restriction, lower active management time, tenant pays utilities in many leases, steady appreciation and mortgage paydown.
   - Long-Term Lease Cons: Strict D.C. tenant laws, non-paying tenant risk, locked-in rent rate for the lease term, inability to use the space personally.

Tone & Formatting Rules:
- Direct, analytical, objective, and empathetic to homeowner concerns.
- Always organize your response with:
  1. **Quick Context & Scenario Assessment** (noting specific neighborhood/property factors if provided)
  2. **Short-Term Rental (Airbnb) Pros & Cons** (clear bullet points with financial/regulatory specifics)
  3. **Long-Term Lease Pros & Cons** (clear bullet points with cash-flow/legal specifics)
  4. **The Breakeven & Regulatory Reality** (highlighting the 90-day cap or hosted status)
  5. **Strategic Recommendation / Next Steps**
- Keep markdown clean and readable. Use bold headers, concise bullet points, and practical dollar/day estimates whenever applicable.`;

/**
 * Intelligent domain-specific fallback for when Gemini API key is absent or in case of transient API errors.
 */
function generateRuleBasedAdvisorResponse(
  userMessage: string,
  context?: {
    neighborhood?: string;
    ward?: string;
    bedrooms?: number;
    currentLease?: number;
    airbnbPrice?: number;
    isPrimaryResidence?: boolean;
    isHosted?: boolean;
  }
): string {
  const q = userMessage.toLowerCase();
  const nh = context?.neighborhood || 'Washington, D.C.';
  const beds = context?.bedrooms ?? 1;
  const lease = context?.currentLease ?? 2450;
  const price = context?.airbnbPrice ?? 210;
  const annualLease = lease * 12;
  const breakevenDays = Math.ceil(annualLease / (price * 0.82)); // accounting for ~18% cleaning/platform fee

  if (q.includes('hosted') || q.includes('90 day') || q.includes('cap') || q.includes('unhosted')) {
    return `### Scenario Analysis: Hosted vs. Unhosted in ${nh}

In Washington D.C., the **Short-Term Rental Regulation Act of 2018 (Law 22-307)** creates a fundamental fork in profitability based on whether you are on-site:

---

#### 1. Short-Term Rental (Airbnb) Trade-offs
**Pros:**
- **Unlimited Days if Hosted:** If you reside on-site overnight (e.g. English basement, guest suite, spare bedroom), you can rent **all 365 days a year** with no statutory cap.
- **Peak Event Surges:** You can charge $350–$600+/night during the Cherry Blossom Festival, IMF meetings, and Congressional sessions.
- **No Long-Term Tenancy Rights:** Guests never acquire tenant status under D.C. Landlord-Tenant Court.

**Cons:**
- **Strict 90-Day Cap if Unhosted:** If you vacate the home completely, D.C. Law strictly caps bookings at **90 nights per calendar year**. At $${price}/night, your maximum gross unhosted Airbnb revenue is **~$${(price * 90).toLocaleString()}**, compared to **$${annualLease.toLocaleString()}** for a 12-month lease.
- **14.95% D.C. Hotel Tax:** Collected by platforms, but impacts guest price sensitivity.
- **DLCP Biennial License:** Mandatory inspection, $104.50 fee, and Clean Hands verification.

---

#### 2. Long-Term Lease Trade-offs
**Pros:**
- **Full 365-Day Revenue:** $${lease.toLocaleString()}/mo provides a guaranteed **$${annualLease.toLocaleString()} annually** without calendar caps.
- **Passive Operations:** No daily check-ins, linen cleaning, or key exchanges.
- **Tenant Covers Utilities:** Electric, gas, and internet are typically tenant-paid.

**Cons:**
- **D.C. Tenant Protections:** D.C. has robust eviction restrictions; non-payment disputes take 6–12 months in Landlord & Tenant Court.
- **Locked Rental Rate:** You cannot raise rent beyond the D.C. CPI index during the lease term.

---

#### Breakeven Verdict for ${beds}-Bed in ${nh}:
- **If Unhosted:** The 90-day ceiling caps your gross revenue at **$${(price * 90).toLocaleString()}**. Long-term lease wins by **+$${Math.max(0, annualLease - price * 90).toLocaleString()}/year**.
- **If Hosted (ADU/Basement):** At $${price}/night, you need **${breakevenDays} booked nights** to match long-term lease. Any nights booked beyond ${breakevenDays} are pure profit!`;
  }

  if (q.includes('basement') || q.includes('english') || q.includes('adu')) {
    return `### Strategy Dossier: English Basement / ADU in ${nh}

Renting out a garden-level unit or accessory apartment is one of D.C.'s most popular and lucrative strategies. Here is how the pros and cons compare:

---

#### 1. Airbnb in an English Basement
**Pros:**
- **Exempt from 90-Day Cap (Hosted Status):** Because you live in the primary residence upstairs, an English basement or ADU qualifies as a **hosted rental**, permitting year-round 365-day operation!
- **Flexible Guest Usage:** When family or friends visit D.C., you simply block out the calendar.
- **High Occupancy in D.C. Corridors:** Visiting government contractors, tourists, and interns frequently prefer self-contained English basements.

**Cons:**
- **Noise Transmission:** Sound transfer between main floor and basement requires good soundproofing (resilient channel / rugs).
- **Turnover Overhead:** 30–50 turnovers per year requiring laundry and cleaning.
- **DLCP Certificate of Occupancy:** Requires proper egress windows, 7-foot ceiling height clearance, and interconnected smoke/CO alarms.

---

#### 2. Long-Term 12-Month Lease
**Pros:**
- **Guaranteed Monthly Cashflow:** $${lease.toLocaleString()} direct deposit on the 1st of every month ($${annualLease.toLocaleString()} annually).
- **Single Vetted Neighbor:** One quiet tenant rather than rotating strangers entering your backyard/areaway.

**Cons:**
- **TOPA Considerations:** If you ever sell your house, an English basement designated as a separate rental dwelling unit may require TOPA notice compliance to the tenant.
- **No Personal Use:** Space is completely inaccessible for 12+ months.

---

#### Recommendation:
If your English basement has a valid C of O and you are comfortable with light hospitality management, **Airbnb easily wins financially** (yielding $30k–$42k gross vs $${annualLease.toLocaleString()} lease). If you prefer quiet privacy, a vetted 1-year tenant is the lower-stress path.`;
  }

  if (q.includes('topa') || q.includes('legal') || q.includes('regulat') || q.includes('license') || q.includes('dlcp')) {
    return `### D.C. Legal & Regulatory Deep Dive: Short-Term vs. Long-Term

Navigating the District's regulatory environment is essential before choosing your rental strategy:

---

#### 1. D.C. Short-Term Rental Regulatory Framework (Law 22-307)
- **Primary Residence Restriction:** The property MUST be your primary residence where you receive the D.C. Homestead Deduction. Pure investment properties are illegal for STR in D.C.
- **DLCP Endorsement:** You must obtain a Short-Term Rental License from the Department of Licensing and Consumer Protection ($104.50 fee, Clean Hands Certificate from OTR, proof of liability insurance).
- **The 90-Day Ceiling:** Strictly limits unhosted rentals to 90 cumulative days per year. Booking platforms automatically transmit booking data to DLCP.
- **Penalties:** Fines range from $250 for first offense up to $1,000–$5,000 for repeat non-compliance.

---

#### 2. D.C. Long-Term Lease Regulations
- **TOPA (Tenant Opportunity to Purchase Act):** Single-family homes are exempt (since the 2018 TOPA amendment), but single units in multi-family buildings and individual ADUs require strict notice procedures upon property sale.
- **Rental Housing Act (Rent Stabilization):** Buildings constructed before 1975 with 5+ units are rent controlled. If you own 4 or fewer rental units as an individual, you must file a **RAD Form 1 (Claim of Exemption)** with the Rent Administrator.
- **Eviction Moratoria & Procedures:** D.C. Superior Court handles all evictions; notices to vacate require statutory cause (non-payment, substantial violation, personal use).

---

#### The Bottom Line:
If you want **maximum legal simplicity** and zero tenant possession risk, **Hosted Airbnb** or **Short-term corporate rentals (31+ days)** avoid D.C. Landlord-Tenant Court entirely. For standard long-term leases, always execute rigorous tenant screening and require a standard D.C. Association of Realtors (DCAR) lease.`;
  }

  // General comprehensive Pro/Con comparison
  return `### Comprehensive Pro/Con Evaluation: ${nh} (${beds}-Bedroom)

Based on your property parameters (${beds} bed, $${lease.toLocaleString()}/mo long-term lease, estimated $${price}/night Airbnb rate):

---

#### 1. Short-Term Rental (Airbnb) Evaluation
**PROS:**
- **Upside Earning Potential:** During peak D.C. seasons (March–June, September–November), daily rates surge by 40–80%.
- **Homestead Flexibility:** You maintain control over your asset; you can block off dates for visiting family or personal use.
- **No Landlord-Tenant Eviction Exposure:** Guests are transient licensees, not statutory tenants under D.C. Code Title 42.
- **Upfront Platform Payment:** Airbnb collects payments in advance and provides Host Damage Protection (AirCover).

**CONS:**
- **The 90-Day Unhosted Trap:** If you do not live on-site, D.C. limits you to **90 booked nights/year**, capping revenue at **~$${(price * 90).toLocaleString()}** (far below your $${annualLease.toLocaleString()} lease baseline).
- **Operating Expense Drag:** 15%–20% of revenue goes toward turnover cleanings, consumables, and platform fees.
- **Seasonal Volatility:** July/August and January in D.C. experience significant tourist drops.

---

#### 2. Long-Term Lease Evaluation
**PROS:**
- **Guaranteed Predictable Income:** $${lease.toLocaleString()}/month ($${annualLease.toLocaleString()}/year) continuous cash flow without calendar gaps.
- **Zero Days-Cap Restriction:** Exempt from the D.C. 90-day unhosted short-term limit.
- **Low Ongoing Workload:** Once leased to a qualified tenant, management requires only periodic maintenance checks.
- **Tenant Covers Consumables & Utilities:** Reduces variable utility spikes in winter heating and summer AC.

**CONS:**
- **D.C. Tenant Protection Laws:** Non-payment or lease breach resolution in D.C. Landlord-Tenant Court can take 6–12 months.
- **Inflexible Access:** You cannot use or reoccupy the property for the entire 12-month lease period.
- **Inflation Lag:** Rent is locked in for the year regardless of inflation or market rate spikes.

---

#### Strategic Verdict:
- **Choose Airbnb if:** You reside on the property (hosted / English basement) and can rent year-round, OR you need personal access to your home multiple months each year.
- **Choose Long-Term Lease if:** The home is unhosted (vacant primary residence or separate investment), because the **90-day D.C. statutory cap** guarantees that a long-term lease generates **+$${Math.max(0, annualLease - price * 90).toLocaleString()} more per year**.`;
}

// API endpoint for Pro/Con Chatbot
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastMessage = messages[messages.length - 1];
    const userPrompt = lastMessage.content || '';

    // If Gemini client is configured and API key exists, call Gemini 3.8 Flash
    if (ai) {
      try {
        let contextualPrompt = userPrompt;
        if (context) {
          contextualPrompt = `User Property Context:
- Target Neighborhood: ${context.neighborhood || 'Washington, D.C.'}
- D.C. Ward: ${context.ward || 'Ward 2'}
- Bedrooms: ${context.bedrooms || 1}
- Baseline Monthly Lease: $${context.currentLease || 2450} / month
- Estimated Nightly Airbnb Rate: $${context.airbnbPrice || 210} / night
- Host Status: ${context.isHosted ? 'Hosted (on-site overnight)' : 'Unhosted (entire home vacant)'}

User Inquiry:
${userPrompt}`;
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: contextualPrompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });

        const replyText = response.text || '';
        if (replyText.trim().length > 0) {
          return res.json({
            role: 'assistant',
            content: replyText,
            source: 'gemini-3.8-flash',
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, falling back to rule-based advisor:', geminiError?.message || geminiError);
        // Fall back gracefully to rule-based engine
      }
    }

    // Dynamic rule-based response fallback
    const fallbackReply = generateRuleBasedAdvisorResponse(userPrompt, context);
    return res.json({
      role: 'assistant',
      content: fallbackReply,
      source: 'dc-rental-intelligence-engine',
    });
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({
      error: 'Failed to process inquiry',
      message: error.message || 'Unknown server error',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`DC Rental Intelligence full-stack server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
