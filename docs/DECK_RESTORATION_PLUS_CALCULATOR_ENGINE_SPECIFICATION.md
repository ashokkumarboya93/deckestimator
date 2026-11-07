# Deck Restoration Plus — Precision Estimator Engine
## Comprehensive Architectural & Mathematical Build Specification

---

### Executive Overview & Golden Rules

The **Deck Restoration Plus Precision Estimator Engine** is the central computation core powering both the **Customer Portal** (`/customer/decks/new`) and the **Contractor Portal** (`/contractor/decks/new`). 

Both portals share **100% identical computation logic**, backend data contracts, and MongoDB Atlas persistence, while presenting tailored presentation layers:
- **Customer View (Client Q12 Strict Compliance):** The customer receives **one total estimate amount only** and a clean project mobilization notice if their calculated scope is below the dispatch threshold. **Zero per-sqft rates, production rates, or formula coefficients are ever exposed to the customer browser.**
- **Contractor / Admin View:** Receives a full operational breakdown: billable surface area ($A$), rate card lookup tier, base hours, wood hours, access hours, travel fee, and an itemized structural repair line with overlap deductions.
- **Server-Side Ground Truth:** All calculations execute strictly server-side in `backend/src/modules/pricing/pricingEngine.js`. The browser never computes authoritative pricing.

---

### Section 1: Billable Surface Area Formula (F1)

The billable surface area ($A$) represents the total square footage of all wooden surfaces requiring chemical treatment, pressure washing, mechanical sanding, and coating application.

$$A = A_{\text{flooring}} + A_{\text{railings}} + A_{\text{stairs}} + A_{\text{pergola}} + A_{\text{privacyWall}} + A_{\text{siding}} + A_{\text{fascia}} + A_{\text{joists}} + A_{\text{other}}$$

#### Component Calculations:
1. **Main Deck Flooring ($A_{\text{flooring}}$):**
   $$A_{\text{flooring}} = \text{Length (ft)} \times \text{Width (ft)}$$
   *(For Square decks, Length = Width. Multi-level and custom footprints calculate the total usable walking deck surface).*

2. **Perimeter Railings ($A_{\text{railings}}$):**
   - Directly entered square footage, or:
     $$A_{\text{railings}} = \text{Railing Linear Feet (LF)} \times 4\text{ sq ft/LF}$$
   *(Accounts for baluster spindles, bottom rail, and top cap rail surface areas).*

3. **Stair Steps ($A_{\text{stairs}}$ — Step-Count Based):**
   - In real-world estimation, stairs are measured by **step count (treads & risers)** rather than manual square footage:
     $$A_{\text{stairs}} = \text{Number of Steps} \times 12\text{ sq ft/step}$$
   *(Standard 4-ft wide stair step: 4 ft tread top + 4 ft riser face + stringer allowance = 12 sq ft surface area per step).*

4. **Pergola Framing ($A_{\text{pergola}}$):**
   - Directly entered square footage (default 150 sq ft), or:
     $$A_{\text{pergola}} = \text{Pergola Length (LF)} \times 1.5\text{ sq ft/LF}$$

5. **Privacy Wall / Fencing ($A_{\text{privacyWall}}$):**
   - Directly entered square footage (default 80 sq ft), or:
     $$A_{\text{privacyWall}} = \text{Wall Length (LF)} \times 2\text{ (both sides)}$$

6. **Exterior Siding ($A_{\text{siding}}$):**
   - Directly entered architectural square footage (default 100 sq ft).

7. **Perimeter Fascia Board ($A_{\text{fascia}}$):**
   - Directly entered square footage (default 45 sq ft), or:
     $$A_{\text{fascia}} = \text{Fascia Length (LF)} \times 1.5\text{ sq ft/LF}$$

8. **Underside Framing Joists ($A_{\text{joists}}$):**
   - When exposed framing is selected for restoration:
     $$A_{\text{joists}} = A_{\text{flooring}} \times 0.40\text{ (40% joist factor)}$$

---

### Section 2: Job Classification & Rate Card Matrix (F2 & F3)

#### Job Classification:
- **Preparation Tier (`prep`):**
  - `clean`: Cleaning / Deep Cleaning / Pressure Washing selected.
  - `strip`: Paint Removal or Stain Stripping selected.
  - `strip_sand`: Stripping + Mechanical Sanding selected.
- **Finishing Tier (`finish`):**
  - `none`: No Coating / Natural Bare Finish selected.
  - `sealer`: Clear Sealing selected.
  - `semi`: Semi-Transparent or Semi-Solid Protective Stain selected.
  - `solid`: Solid Color Protective Stain or Solid Paint selected.

#### Official Rate Card Matrix (Price per Square Foot):
| Preparation Tier | Clear Sealer (`sealer`) | Semi-Transparent (`semi`) | Semi-Solid Stain (`semi_solid`) | Solid Color / Paint (`solid`) |
|---|---|---|---|---|
| **Clean Only (`clean`)** | \$2.50 – \$3.00 | \$3.00 – \$3.50 | \$3.25 – \$3.75 | \$3.50 – \$4.00 |
| **Strip (`strip`)** | \$3.00 – \$3.50 | \$3.50 – \$4.00 | \$4.25 – \$5.00 | \$5.00 – \$6.00 |
| **Strip & Sand (`strip_sand`)** | \$3.50 – \$4.50 | \$4.00 – \$4.50 | \$4.75 – \$5.50 | \$5.50 – \$6.50 |

---

### Section 3: Rate Interpolation & Stacked Finish Add-on (F4 & F5)

1. **Rate Interpolation (50% Standard Position):**
   For a given `prep` row and `finish` column with range $[lo, hi]$:
   $$\text{Base Rate} = lo + (hi - lo) \times 0.50$$
   *(Exception: When `finish === 'none'` [No Coating], the rate is fixed at the baseline $lo = \$2.50/\text{sq ft}$ without finish interpolation).*

2. **Stacked Finish Add-on (F4):**
   When multiple finishing services are combined (e.g. Staining + Clear Sealing + Waterproofing):
   $$\text{finishAddon} = \max(0, \text{finishesCount} - 1) \times \$1.00\text{ / sq ft}$$

3. **Sanding Without Stripping Differential (F6 & F7):**
   When sanding is performed without chemical stripping, the rate card sanding step differential is added to the clean rate:
   $$\text{Differential} = [lo_{\text{strip\_sand}} - lo_{\text{strip}}, \; hi_{\text{strip\_sand}} - hi_{\text{strip}}]$$
   $$\text{Adjusted Rate} = [lo_{\text{clean}} + \text{Differential}[0], \; hi_{\text{clean}} + \text{Differential}[1]]$$

---

### Section 4: Production Rates & Labor Hours (F8–F12)

Materials and standard crew baseline labor are built directly into the square foot rate card. Trade surcharges for difficult wood and high access are additive on base hours.

#### 1. Production Rates (Sq Ft per Labor Hour):
- **Deck Cleaning / Deep Wash:** $100\text{ sq ft/hr}$
- **Deck Sealing / Staining / Waterproofing:** $100\text{ sq ft/hr}$
- **Wood Brightening:** $100\text{ sq ft/hr}$
- **Mechanical Sanding:** $60\text{ sq ft/hr}$
- **Chemical Stain Stripping:** $50\text{ sq ft/hr}$
- **Heavy Paint Removal:** $40\text{ sq ft/hr}$

$$\text{Base Labor Hours} = \sum_{s \in \text{Services}} \frac{A}{\text{ProductionRate}_s}$$

#### 2. Wood Species Adjustment (F9):
| Wood Species | Labor Adjustment (%) | Services Allowed | Notes |
|---|---|---|---|
| **Pressure-Treated Pine** | `0%` | All services | Standard commercial exterior softwood |
| **Western Red Cedar** | `+10%` | All services | Natural grain requiring soft pressure wash |
| **California Redwood** | `+15%` | All services | Dense tannin-rich wood |
| **Honduran Mahogany** | `+20%` | All services | Dense ribbon grain hardwood |
| **Meranti Hardwood** | `+20%` | All services | Exotic exterior wood |
| **Tigerwood** | `+30%` | All services | Dense tropical exotic hardwood |
| **Teak / Brazilian Ipe** | `+35%` | All services | Extreme density hardwood |
| **Composite Trex** | `-55%` | **Cleaning only** | Staining/sanding strictly prohibited |

$$\text{Wood Hours} = \text{Base Labor Hours} \times \text{WoodPct}$$

#### 3. Site Accessibility & Elevation Adjustment (F10):
| Elevation Tier | Height in Feet | Percent Adjustment (%) | Fixed Hours Equivalent |
|---|---|---|---|
| **Ground Level** | `0 – 2 ft` | `0%` | 0 hrs |
| **Low Elevation** | `2 – 4 ft` | `+15%` | 4 hrs |
| **First Story** | `4 – 8 ft` | `+15%` | 4 hrs |
| **Second Story** | `8 – 12 ft` | `+35%` | 8 hrs |
| **Roof / High Structure** | `> 12 ft` | `+60%` | 16 hrs |

$$\text{Access Hours} = \text{Base Labor Hours} \times \text{AccessPct}$$

#### 4. Additional Labor Surcharge (F11 & F12):
$$\text{Total Additional Hours} = \text{Wood Hours} + \text{Access Hours}$$
$$\text{Labor Adjustment Surcharge} = \text{Total Additional Hours} \times \$250.00\text{ / hr}$$

---

### Section 5: Travel Distance & Mobilization Minimum (F13–F15)

1. **Travel Distance Threshold:**
   - **Local ($\le 45\text{ minutes}$):** $\$0\text{ Travel Fee}$, Near Mobilization Minimum = $\mathbf{\$2,500.00}$.
   - **Far ($> 45\text{ minutes}$):** $\$200\text{ Travel Fee}$, Far Mobilization Minimum = $\mathbf{\$3,000.00}$.

2. **Subtotal Calculation:**
   $$\text{Calculated Subtotal} = (A \times \text{Final Rate}) + \text{Labor Adjustment Surcharge} + \text{Travel Fee}$$

3. **Mobilization Minimum Threshold:**
   $$\text{Official Floor Total} = \max(\text{Calculated Subtotal}, \; \text{Mobilization Minimum})$$
   - If $\text{Calculated Subtotal} < \text{Mobilization Minimum}$, the customer estimate clearly highlights their calculated scope and provides the required notice explaining the mobilization dispatch floor.

---

### Section 6: Section 8 Spec Damage Overlap Prevention & Repair Engine

The dedicated repair engine replaces legacy rule R3 with an itemized, deduplicated structural repair calculation:

1. **Rule 1 (Good Condition Exclusive):**
   If *Good Condition (Baseline)* is selected, all other damage surcharges and inspection fees are suppressed to **\$0.00**.

2. **Rule 2 (Crack & Loose Board Overlap):**
   When a board suffers from both surface cracking and loose fasteners, the engine charges **board replacement only (\$45.00)**, avoiding duplicate charges for minor repair (\$15) and refastening (\$12).

3. **Rule 3 (Rotted & Water Damaged Shared Inspection):**
   When both rotted boards and water-damaged wood are detected, the system charges a **single \$150.00 structural moisture inspection fee**, combining replacement board lists.

4. **Rule 4 (Peeling Old Coating):**
   When stripping service is already included in the restoration scope, peeling coating damage surcharges are set to **\$0.00** (already covered by chemical stripping).

5. **Rule 5 (Weathered & Mold Admin Switches):**
   Configurable labor adjustments (5% Weathered, 15% Mold) remain **OFF by default** as administrative switches until client activation.

---

### Section 7: Resilient Fullstack Architecture & Database Mapping

#### 1. Zero-Failure Network Architecture:
- **Automatic Connection Retry:** `frontend/src/api/client.js` executes exponential backoff retries (350ms, 700ms) for transient network drops or backend reloads, preventing raw `"Failed to fetch"` browser errors.
- **Permissive Localhost CORS:** `backend/src/config/cors.js` allows all standard development hosts (`http://localhost:*`, `http://127.0.0.1:*`) dynamically.
- **Double-Event Shield:** Card checkboxes utilize `readOnly` and `pointer-events: none` so user clicks register exactly once without state oscillation.

#### 2. Database Schema Mapping (MongoDB Atlas):
- **`decks` Collection:**
  - `dimensions`: `{ length, width, area }`
  - `structureDetails`: `{ height, exactHeightFt, hasRailings, railingSqft, hasStairs, stairStepCount, stairSqft, hasPergola, pergolaSqft, hasPrivacyWall, privacyWallSqft, hasSiding, sidingSqft, hasFascia, fasciaSqft, includeJoists, joistsSqft }`
  - `surfaceDetails`: `{ material, woodSpecies, coatingStatus }`
  - `visibleConditions`: Array of validated observed conditions.
- **`estimates` Collection:**
  - `pricingSnapshot`: Full mathematical snapshot containing $A$, rate, prep, finish, base hours, wood hours, access hours, calculated total, and repair estimate line items.
  - `totalAmount`: Final authoritative job amount.
- **`leads` Collection:**
  - Automatic lead generation upon clicking *"Book Site Inspection & Convert to Lead"*, linking the user ID, deck ID, and calculated estimate.

