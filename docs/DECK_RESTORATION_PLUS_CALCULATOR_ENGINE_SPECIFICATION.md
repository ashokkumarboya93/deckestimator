# Deck Restoration Plus (DRP) — Calculator Engine Internal Working & Mathematical Specification

**Source of Truth:** `backend/src/modules/pricing/pricingEngine.js` (Version 4)  
**Frontend Live Estimator:** `frontend/src/features/customer/components/ContinuousEstimatorForm.jsx`  
**Admin Live Tuning Hub:** `frontend/src/features/admin/pages/AdminPricingDiscountsPage.jsx`

This document provides the complete internal specification, exact baseline constants, mathematical formulas (`F1–F15`), damage overlap-prevention rules, contractor wholesale discount calculations, and worked examples matching the live production codebase.

---

## 1. Master Configuration Baseline (`DEFAULT_PRICING_CONFIG`)

All pricing constants are stored in MongoDB (`PricingConfiguration.restorationPricing`) and editable in real time via **Admin → Pricing & Discounts**. If no custom override is saved, the engine falls back to these exact defaults:

| Parameter | Key | Default Value | Description |
| :--- | :--- | :---: | :--- |
| **Hourly Labor Rate** | `labourRate` | **`$250 / hr`** | Applied to additive wood and access labor hours |
| **Rate Card Position** | `ratePosition` | **`0.5`** | Midpoint (`50%`) between `[low, high]` rate card bounds |
| **Stacked Finish Add-On** | `addonPerSqft` | **`$1.00 / sq ft`** | Charged per additional finish service beyond the first |
| **Access Mode** | `accessMode` | **`'percent'`** | `'percent'` (multiplier on base hours) or `'fixed_hours'` |
| **Free Travel Threshold** | `travel.freeMinutes` | **`45 min`** | One-way drive time covered without travel fee |
| **Extended Travel Fee** | `travel.fee` | **`$200`** | Flat fee applied when `travelMinutes > 45` |
| **Local Minimum Job** | `minJob.near` | **`$2,500`** | Standard mobilization floor when `travelMinutes <= 45` |
| **Extended Minimum Job** | `minJob.far` | **`$3,000`** | Mobilization floor when `travelMinutes > 45` |
| **Contractor Default Discount** | `CONTRACTOR_DEFAULT_5` | **`5%`** | Global wholesale trade discount (Admin-tunable globally or per contractor) |

---

## 2. Step-by-Step Mathematical Pipeline (`F1–F15`)

### Step F1 — Total Billable Surface Area (`A`)

The engine converts every selected architectural component into equivalent square footage (`sq ft`) using configurable conversion factors (`cfg.areas`):

| Component | Input Field(s) | Conversion Factor | Formula |
| :--- | :--- | :---: | :--- |
| **Deck Floor** | `deckArea` / `floorArea` | `1.0 × sq ft` | `floorVal` |
| **Railings** | `railingLf` / `railingLength` | **`4 sq ft / LF`** | `railingLf × 4` (or direct `railingSqft`) |
| **Stairs** | `stairSteps` / `stairCount` | **`12 sq ft / step`** | `stairSteps × 12` (or direct `stairSqft`) |
| **Pergola** | `pergolaLength` / `pergolaLf` | **`1.5 sq ft / LF`** | `pergolaLf × 1.5` (or direct `pergolaSqft`) |
| **Privacy Wall** | `privacyWallLength` | **`2 sq ft / LF`** | `privacyWallLf × 2` (or direct `privacyWallSqft`) |
| **Siding** | `sidingSqft` / `sidingArea` | `1.0 × sq ft` | `sidingSqft` |
| **Posts** | `postCount` / `posts` | **`6 sq ft / post`** | `postCount × 6` |
| **Joists (Underside)** | `joists` (boolean) | **`0.4 × floorArea`** | `floorVal × 0.4` (if `joists === true`) |
| **Fascia** | `fasciaLf` / `fasciaLength` | **`1.5 sq ft / LF`** | `fasciaLf × 1.5` (or direct `fasciaSqft`) |
| **Other Custom** | `other[]` | `1.0 × sq ft` | `Σ other[i].sqft` |

$$
A = \text{round2}\big(\text{flooring} + \text{railings} + \text{stairs} + \text{pergola} + \text{privacyWall} + \text{siding} + \text{posts} + \text{joists} + \text{fascia} + \text{other}\big)
$$

> If $A \le 0$, the engine throws a `BadRequestError`.

---

### Step F2 — Job Classification (`prep`, `finish`, `col`)

Normalized selected services $S$ determine the **Preparation Tier** (`prep`) and **Finish Column** (`col`):

1. **Preparation Tier (`prep`):**
   - `stripping = true` if $S$ contains `paint_removal`, `stain_stripping`, `stripping`, or `deck_stripping`.
   - `sanding = true` if $S$ contains `sanding`, `mechanical_sanding`, `detail_sanding`, or `deck_sanding`.
   - `prep = stripping ? (sanding ? 'strip_sand' : 'strip') : 'clean'`.

2. **Finish Services (`finishes`):**
   - If `no_coating` is in $S$, `finishes = []`.
   - Otherwise, `finishes` = matching items from `['staining', 'deck_staining', 'sealing', 'deck_sealing', 'waterproofing', 'waterproofing_barrier']`.

3. **Stain Column (`stainCol`):**
   - Matches `stainType` / `finishType` / `coatingType`:
     - Contains `semi_solid` / `semisolid` → `'semi_solid'`
     - Contains `solid` → `'solid'`
     - Contains `sealer` / `clear` → `'sealer'`
     - Default → `'semi'` (Semi-Transparent)
   - `finish = S.has('staining') ? stainCol : (finishes.length > 0 ? 'sealer' : 'none')`
   - `col = finish === 'none' ? 'sealer' : finish`

---

### Step F3 — Base Rate Card Lookup (`[lo, hi]`)

Rates represent **$/sq ft** (inclusive of baseline chemical materials and baseline labor):

| Prep Tier \ Finish Column | Clear Sealer (`sealer`) | Semi-Transparent (`semi`) | Semi-Solid (`semi_solid`) | Solid Stain (`solid`) |
| :--- | :---: | :---: | :---: | :---: |
| **`clean`** (Cleaning / Brightening) | `[$2.50, $3.00]` | `[$3.00, $3.50]` | `[$3.25, $3.75]` | `[$3.50, $4.00]` |
| **`strip`** (Chemical Stripping) | `[$3.00, $3.50]` | `[$3.50, $4.00]` | `[$4.25, $5.00]` | `[$5.00, $6.00]` |
| **`strip_sand`** (Strip + Sanding) | `[$3.50, $4.50]` | `[$4.00, $4.50]` | `[$4.75, $5.50]` | `[$5.50, $6.50]` |

**Sanding Without Stripping Rule:**  
If `sanding === true` and `stripping === false`, the engine starts with the `clean` row and adds the sanding delta `(strip_sand[col] - strip[col])`:
$$
lo_{\text{adj}} = lo_{\text{clean}} + (lo_{\text{strip\_sand}} - lo_{\text{strip}}), \quad hi_{\text{adj}} = hi_{\text{clean}} + (hi_{\text{strip\_sand}} - hi_{\text{strip}})
$$

---

### Step F4 & F5 — Stacked-Finish Add-On & Effective Sqft Rate (`rateAt(pos)`)

$$
\text{finishAddon} = \max(0, \text{finishes.length} - 1) \times \text{addonPerSqft} \quad (\text{default } \$1.00/\text{sq ft})
$$

$$
\text{rateAt}(pos) = \begin{cases}
lo + \text{finishAddon}, & \text{if } \text{finish} = \text{'none'} \\
lo + (hi - lo) \times pos + \text{finishAddon}, & \text{otherwise}
\end{cases}
$$

At default midpoint `pos = 0.5`:  
$$\text{basePrice} = A \times \text{rateAt}(0.5)$$

---

### Step F8 — Base Production Hours (`baseHours`)

Each selected service $s \in S$ (excluding `'repairs'`) contributes production hours using its speed `production[s]` (in `sq ft / man-hour`):

| Service Key(s) | Production Speed (`sq ft / hr`) |
| :--- | :---: |
| `cleaning`, `deck_cleaning`, `deep_cleaning`, `pressure_washing` | **`100`** |
| `wood_brightening`, `staining`, `deck_staining`, `staining_conditioning` | **`100`** |
| `sealing`, `deck_sealing`, `clear_sealing`, `waterproofing`, `waterproofing_barrier` | **`100`** |
| `detail_sanding` | **`90`** |
| `sanding`, `deck_sanding`, `floor_railing_sanding`, `mechanical_sanding` | **`60`** |
| `stain_stripping`, `deck_stripping`, `stripping` | **`50`** |
| `paint_removal` | **`40`** |

$$
\text{baseHours} = \sum_{s \in S,\; s \neq \text{'repairs'}} \frac{A}{\text{production}[s]}
$$

---

### Step F9 — Wood Species Labor Adjustment (`woodHours`)

| Wood Species Key | Display Label | Labor Modifier (`pct`) | Special Rules |
| :--- | :--- | :---: | :--- |
| `pt_pine`, `pressure_treated_pine` | Pressure-treated pine | **`0%`** (`0.00`) | Baseline |
| `cedar` | Western Red Cedar | **`+10%`** (`0.10`) | — |
| `redwood` | California Redwood | **`+15%`** (`0.15`) | — |
| `meranti`, `mahogany` | Meranti / Mahogany | **`+20%`** (`0.20`) | — |
| `tigerwood` | Tigerwood | **`+30%`** (`0.30`) | — |
| `teak`, `ipe` | Teak / Brazilian Ipe | **`+35%`** (`0.35`) | — |
| `trex`, `composite` | Composite Trex | **`-55%`** (`-0.55`) | **Rule R1:** Only `cleaning` / `pressure_washing` allowed |

$$
\text{woodHours} = \text{baseHours} \times \text{woodPct}
$$

---

### Step F10 — Elevation & Access Labor Adjustment (`accessHours`)

If numeric `exactHeightFt` is provided, `mapHeightFeetToAccessKey(heightFt)` maps:
- `<= 4 ft` → `'ground'`
- `4.01 – 8 ft` → `'first'`
- `8.01 – 12 ft` → `'second'`
- `> 12 ft` → `'roof'`

| Access Key | Height Hint | Percent Mode (`pct`) | Fixed Hours Mode |
| :--- | :--- | :---: | :---: |
| `ground`, `ground_level`, `standard_ground`, `low` | `0–4 ft` | **`0%`** (`0.00`) | `0 hrs` |
| `first`, `first_story` | `4–8 ft` | **`+15%`** (`0.15`) | `4 hrs` |
| `second`, `second_story`, `medium` | `8–12 ft` | **`+35%`** (`0.35`) | `8 hrs` |
| `roof`, `roof_work`, `high` | `over 12 ft` | **`+60%`** (`0.60`) | `16 hrs` |

$$
\text{accessHours} = \begin{cases}
\text{baseHours} \times \text{acc.pct}, & \text{if } \text{accessMode} = \text{'percent'} \\
\text{acc.fixedHours}, & \text{if } \text{accessMode} = \text{'fixed\_hours'}
\end{cases}
$$

---

### Step F11 & F12 — Additive Labor Cost (`labourAdj`)

$$
\text{addHours} = \text{woodHours} + \text{accessHours}
$$
$$
\text{labourAdj} = \text{addHours} \times \text{labourRate} \quad (\text{default } \$250/\text{hr})
$$

---

### Step F13, F14 & F15 — Travel Fee, Pure Total & Minimum Job Floor

- **Travel Distance Check:**
  - `far = (travelMinutes > 45)`
  - `travelFee = far ? 200 : 0`
  - `minJob = far ? 3000 : 2500`

- **Calculated & Floor Totals:**
  $$
  \text{calculatedSubtotal} = \max\big(0,\; A \times \text{rateAt}(\text{ratePosition}) + \text{labourAdj} + \text{travelFee}\big)
  $$
  $$
  \text{calculatedTotal} = \text{round}(\text{calculatedSubtotal})
  $$
  $$
  \text{floorTotal} = \max(\text{calculatedTotal},\; \text{minJob})
  $$
  $$
  \text{minJobApplied} = (\text{calculatedTotal} < \text{minJob})
  $$

- **Low / High Range (Contractor & Admin View):**
  - `lowCalculated = round(max(0, A × rateAt(0) + labourAdj + travelFee))`
  - `highCalculated = round(max(0, A × rateAt(1) + labourAdj + travelFee))`
  - `low = max(lowCalculated, minJob)`, `high = max(highCalculated, minJob)`

---

## 3. Section 8 — Damage Condition & Repair Estimate Engine (`calculateRepairEstimate`)

Repair charges are calculated **separately** for Contractor/Admin inspection with strict **Overlap Prevention Rules**:

| Condition / Line Item | Material Cost | Labor Cost | Unit Total | Overlap Prevention Rule |
| :--- | :---: | :---: | :---: | :--- |
| **Good Condition** | `$0` | `$0` | **`$0`** | Exclusive option — suppresses all repair surcharges |
| **Structural Moisture & Integrity Inspection** | `$0` | `$150` | **`$150` flat** | Charged **once** even if both `rotted` & `water_damaged` are selected |
| **Rotted / Water-Damaged / Warped Board** | `$20` | `$25` | **`$45 / board`** | — |
| **Cracked & Loose Overlap Board** | `$20` | `$25` | **`$45 / board`** | Replaces board directly; avoids `$15 + $12` double charge |
| **Crack-Only Board** | `$5` | `$10` | **`$15 / board`** | Applied to `max(0, crackCount - crackLooseOverlap)` |
| **Loose-Only Board** | `$3` | `$9` | **`$12 / board`** | Applied to `max(0, looseCount - crackLooseOverlap)` |
| **Peeling Coating Prep** | `$0` | `$100` (or `$0`) | **`$0` if stripping** | Covered by stripping scope when stripping is selected |
| **Weathered Wood Switch** | `$0` | `5% × baseHours × $250` | Switch-gated | `switches.applyWeatheredLabor` (`false` by default) |
| **Mold / Mildew Switch** | `$0` | `15% × baseHours × $250` | Switch-gated | `switches.applyMoldLabor` (`false` by default) |

---

## 4. Contractor Wholesale Trade Discount

- **Default Platform Wholesale Tier:** **`5%`** (`CONTRACTOR_DEFAULT_5`), configurable globally or per-contractor by the Administrator in **Admin → Pricing & Discounts**.
- When a Contractor creates an estimate with `applyContractorDiscount = true`:
  $$
  \text{discountAmount} = \text{round2}\left(\text{totalAmount} \times \frac{\text{appliedDiscount\%}}{100}\right)
  $$
  $$
  \text{finalTotal} = \text{round2}(\text{totalAmount} - \text{discountAmount})
  $$

---

## 5. Role-Based Output Isolation (Q12 Compliance)

- **Customer Output (`customerOutput`):** Displays **one total number only** (`calculatedTotal` by default, or `floorTotal` if `applyMinJobPrice` is selected) with zero internal rate-card or labor-hour breakdown, plus mobilization notice if under `$2,500 / $3,000`.
- **Contractor & Admin Output:** Exposes full `areas`, `rateCardLookup`, `baseHours`, `woodHours`, `accessHours`, `labourAdj`, `low`/`high` range, `repairEstimate` line items, `overlapDeductions`, and `discountBreakdown`.

---

## 6. Worked Examples (Verified Against `pricingEngine.js`)

### Example 1: Ground-Level Cedar Deck — Clean + Semi-Transparent Stain
- **Inputs:** Floor = `500 sq ft`, Stairs = `10 steps`, Railings = `30 LF`, Wood = `cedar` (`+10%`), Access = `ground` (`0%`), Services = `['cleaning', 'staining']`, Stain = `'semi'`, Travel = `30 min`.
- **Calculations:**
  1. **Area (`A`):** $500 + (10 \times 12) + (30 \times 4) = 500 + 120 + 120 = \mathbf{740\text{ sq ft}}$
  2. **Rate Card:** `prep = 'clean'`, `col = 'semi'` → `[3.00, 3.50]`, `finishAddon = $0.00`  
     `rateAt(0.5)` = $3.00 + (3.50 - 3.00) \times 0.5 = \mathbf{\$3.25/\text{sq ft}}$
  3. **Base Price:** $740 \times \$3.25 = \mathbf{\$2,405.00}$
  4. **Base Hours:** $(740 / 100) + (740 / 100) = 7.40 + 7.40 = \mathbf{14.80\text{ hrs}}$
  5. **Additive Labor:**  
     `woodHours` = $14.80 \times 0.10 = 1.48\text{ hrs}$; `accessHours` = $0\text{ hrs}$  
     `labourAdj` = $1.48 \times \$250 = \mathbf{\$370.00}$
  6. **Travel & Floor:** `travelFee = $0`, `minJob = $2,500`
  7. **Final Total:** $\$2,405.00 + \$370.00 = \mathbf{\$2,775.00}$ (`minJobApplied = false`).
  8. **With Contractor Default 5% Discount:** $\$2,775.00 - \$138.75 = \mathbf{\$2,636.25}$.

---

### Example 2: Small Pressure-Treated Pine Deck — Cleaning Only + Extended Travel
- **Inputs:** Floor = `250 sq ft`, Wood = `pt_pine` (`0%`), Access = `ground` (`0%`), Services = `['cleaning']`, Travel = `60 min` (`> 45 min`).
- **Calculations:**
  1. **Area (`A`):** $\mathbf{250\text{ sq ft}}$
  2. **Rate Card:** `prep = 'clean'`, `finish = 'none'` → `rateAt(0.5) = lo = $2.50/sq ft`
  3. **Base Price:** $250 \times \$2.50 = \mathbf{\$625.00}$
  4. **Additive Labor:** `woodHours = 0`, `accessHours = 0` → `labourAdj = $0.00`
  5. **Travel & Floor:** `travelMinutes = 60 > 45` → `travelFee = $200.00`, `minJob = $3,000`
  6. **Calculated Total:** $\$625.00 + \$200.00 = \mathbf{\$825.00}$ (`minJobApplied = true`, `floorTotal = $3,000`).

---

### Example 3: Second-Story Redwood Deck — Strip + Sand + Solid Stain + Sealer
- **Inputs:** Floor = `400 sq ft`, Fascia = `8 LF`, Wood = `redwood` (`+15%`), Height = `9 ft` (`second` = `+35%`), Services = `['stain_stripping', 'sanding', 'staining', 'sealing']`, Stain = `'solid'`, Travel = `30 min`.
- **Calculations:**
  1. **Area (`A`):** $400 + (8 \times 1.5) = \mathbf{412\text{ sq ft}}$
  2. **Finishes & Rate Card:** `finishes = ['staining', 'sealing']` (`finishAddon = $1.00/sq ft`), `prep = 'strip_sand'`, `col = 'solid'` → `[5.50, 6.50]`  
     `rateAt(0.5)` = $5.50 + (6.50 - 5.50) \times 0.5 + 1.00 = \mathbf{\$7.00/\text{sq ft}}$
  3. **Base Price:** $412 \times \$7.00 = \mathbf{\$2,884.00}$
  4. **Base Hours:** $\frac{412}{50} + \frac{412}{60} + \frac{412}{100} + \frac{412}{100} = 8.24 + 6.8667 + 4.12 + 4.12 = \mathbf{23.3467\text{ hrs}}$
  5. **Additive Labor:**  
     `woodHours` = $23.3467 \times 0.15 = 3.5020\text{ hrs}$  
     `accessHours` = $23.3467 \times 0.35 = 8.1713\text{ hrs}$  
     `addHours` = $11.6733\text{ hrs}$ → `labourAdj` = $11.6733 \times \$250 = \mathbf{\$2,918.33}$
  6. **Final Total:** $\$2,884.00 + \$2,918.33 = \mathbf{\$5,802.33} \rightarrow \mathbf{\$5,802}$.
