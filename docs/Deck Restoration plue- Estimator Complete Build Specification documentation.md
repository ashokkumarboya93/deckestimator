# Deck Pro – Customer Estimator: Complete Build Specification

 Built from your 10-section requirement, your pricing rules, the 20 client answers and the earlier prototype.

## 1. What you are building

Two **separate apps** (client Q15) that share one API and one MongoDB:

- **Customer Estimator** (public): customer fills the input sections, submits, and sees **one total number with no breakdown** (Q12).
- **Contractor / Admin app** (login): dashboard to review estimates, photos and the full breakdown, plus an Admin Portal where every rate, percentage and production rate is editable.

**Screen order:** Sections 1 → 2 → 3 → 4 → 5 → 6 → 8 → 9 → 10 → Submit → Section 7 (estimate output, not an input section).

**Golden rule:** the price is calculated **on the server only**, from the active `pricing_config`. The browser never receives rates or formulas.

**Not in v1:** changing deck dimensions in the 3D view (client Q19), taxes, deposits and payments (the client never mentioned them).

## 2. Conflicts and gaps: confirm these first

Your documents and the client answers disagree in places. I picked a default for each so you can start building, and every default is a config value you can flip in the Admin Portal.

| # | Issue | What the sources say | Default used in this spec | Ask |
| --- | --- | --- | --- | --- |
| D1 | Accessibility price | Your rule: +15 / 35 / 60% of labour hours. Client Q7: flat 0 / 4 / 8 / 16 extra man-hours by height | `accessMode = percent` (your rule). One switch flips to `fixed_hours` | Which is right? Biggest money difference in the whole estimator |
| D2 | Where the sqft rate comes from | Q5: $2.50 + $1 per coating. Q9: a 9-row rate card | Use the rate card for the main package. $1/sqft only for stacked finishes (D3) | Confirm |
| D3 | What triggers the +$1/sqft | 'multiple coatings or restoration services' is vague | +$1.00/sqft for each finish service beyond the first (Staining, Sealing, Waterproofing). Cleaning, stripping and sanding are already inside the rate-card tier | Confirm |
| D4 | Low–high range vs one number | Rate card gives ranges; client wants one total | Show the midpoint (`ratePosition = 0.5`). Contractor sees low–high | Mid, low or high? |
| D5 | Sanding | Q8: sanding is NOT in the sqft price and is judged from photos. Q9 card has 'Stripping, Sanding' rows | Card rows include sanding as an estimate. Flag `needs_photo_review`. Contractor can override | Confirm |
| D6 | Existing coating | Q5: each coating adds $1. Your Section 5: no pricing impact | No price impact (your rule). Stored for the contractor | Confirm |
| D7 | Trex −55% | Negative hours become a negative dollar credit that can wipe out the base price | Allow the credit, never go below $0, minimum job still applies | Confirm |
| D8 | Travel fee vs minimum job | Is the $200 inside the $3,000 minimum? Flat or distance-based? | Flat $200 is added first, then the minimum job floor is applied | Confirm |
| D9 | Missing species | Q2 lists pressure-treated pine, mahogany, teak. Your 6 options have no pine | Add **Pressure-treated pine = 0%**. Admin can add Mahogany and Teak | Add? |
| D10 | Finish choice missing | Rate card needs Sealer / Semi-Transparent / Solid, but Section 6 only has Staining and Sealing | Add a sub-input **Stain type** (Semi-Transparent, Solid) shown when Staining is ticked | Approve |
| D11 | Section 10 incomplete | Q13 also wants email, phone and 'How were you referred?' | Add Email, Phone, Referral source (7 inputs instead of 4) | Approve |
| D12 | Section 5 incomplete | Q4 lists No Coating, Other and Manufacturer name | Added to the options. No price effect | Approve |
| D13 | Posts | Listed in Section 2 but no pricing rule | Count × 6 sqft at the same rate | Confirm |
| D14 | Production rates | Only one example given (50 sqft/hour) | Starter values in Section 4. Calibrate from real job hours | Client / crew |
| D15 | User roles | Q11 was left blank | Customer, Contractor, Admin | Confirm |
| D16 | $250/hour vs labour already in the sqft price | In Example B the sqft price already pays about $94 per hour, so extras at $250 are expensive | Keep $250 as told. Review after the first 10 real quotes | Sanity check |
| D17 | Height mapping | Four access options vs four client height tiers | Ground 0–4 ft, First story 4–8 ft, Second story 8–12 ft, Roof work over 12 ft | Confirm |

## 3. Input fields (what the customer sees)

| Field | Type | Required | Options and validation | Price effect |
| --- | --- | --- | --- | --- |
| **Section 1 – Measurements** |  |  |  |  |
| 1.1 Project name | text | Yes | 2–80 chars | No |
| 1.2 Deck shape | select | Yes | Rectangle, Square, L-shape, U-shape, Multi-section, Custom | No (guides 1.3–1.5) |
| 1.3 Length (ft) | number | Rect/Square | greater than 0, max 200 | Via area |
| 1.4 Width (ft) | number | Rect/Square | greater than 0, max 200. Square copies length | Via area |
| 1.5 Total deck area (sq ft) | number | Yes | Rect/Square: auto = L × W. Other shapes: customer adds section rows (L × W each) which are summed, or types the total. Max 10,000. Warn if typed value differs from L × W by more than 10% | **Yes** (floor area) |
| **Section 2 – Components** |  |  |  |  |
| 2.1 Flooring | checkbox | Default on | Area = 1.5 | Yes |
| 2.2 Railings | checkbox + number | No | Toggle: sq ft directly, or linear ft (× 4) | Yes |
| 2.3 Stairs | checkbox + integer | No | Number of steps 0–40, optional (× 12 sq ft) | Yes |
| 2.4 Posts | checkbox + integer | No | Count 0–100 (× 6 sq ft) | Yes |
| 2.5 Joists / underside | checkbox | No | Area auto = floor × 0.4, editable | Yes |
| 2.6 Fascia | checkbox + number | No | Linear ft (× 1.5) or sq ft | Yes |
| 2.7 Other components | repeatable name + sq ft | No | Privacy wall, fencing, pergola, siding, etc. | Yes |
| **Section 3 – Wood** |  |  |  |  |
| 3.1 Wood species | select | Yes | Pressure-treated pine\*, Cedar, Redwood, Meranti, Tigerwood, Ipe, Composite Trex. Choosing Trex locks Section 6 to Cleaning and Pressure Washing | **Yes** (labour %) |
| **Section 4 – Site and access** |  |  |  |  |
| 4.1 Site conditions | multi-select + notes | No | Suggested: landscaping near deck, tight access, obstacles (furniture, grill), privacy wall or fence, sloped ground, no water access, no power access | No (contractor reference) |
| 4.2 Accessibility | radio | Yes | Ground Level (0–4 ft), First Story (4–8 ft), Second Story (8–12 ft), Roof Work (over 12 ft). No 'Number of Levels' input | **Yes** |
| **Section 5 – Existing coating** |  |  |  |  |
| 5.1 Existing coating | radio | Yes | No Coating\*, Paint, Sealer, Transparent Stain, Semi-transparent Stain, Solid Stain, Other\* | No |
| 5.2 Manufacturer name\* | text | No | Up to 60 chars | No |
| 5.3 Finish base | radio | Yes | Oil-based, Water-based (add 'Not sure' as a safe option) | No |
| **Section 6 – Services** |  |  |  |  |
| 6.1 Services | multi-select | At least 1 | Cleaning, Pressure Washing, Sanding, Paint Removal, Stain Stripping, Staining, Sealing, Waterproofing, Repairs | **Yes** |
| 6.2 Stain type\* | radio | If Staining ticked | Semi-Transparent, Solid | **Yes** |
| **Section 8 – Deck condition** |  |  |  |  |
| 8.1–8.8 | 8 checkboxes | No | Weathered/Faded, Peeling/Flaking, Cracks/Splinters, Mold/Mildew, Rotted Wood, Water Damage, Warped/Loose Boards, Railing Damage. Show the one-line description under each | No (see rules R3, R4) |
| **Section 9 – Photos** |  |  |  |  |
| 9.1 Upload | multi-file | No | Categories: Overall Deck, Flooring, Railings, Stairs, Damaged Areas. JPG/PNG/HEIC, 10 MB each, up to 10 per category | No (drives photo review) |
| **Section 10 – Project information** (collected at submit) |  |  |  |  |
| 10.1 Full name | text | Yes |  | No |
| 10.2 Project address | address autocomplete | Yes | Used to compute travel time | Via travel |
| 10.3 Location | auto from address (city, ZIP) | Yes | Confirm on map | Via travel |
| 10.4 Additional notes | textarea | No | Max 1,000 chars | No |
| 10.5 Email\* | email | Yes | CRM, PDF, history link | No |
| 10.6 Phone\* | tel | Yes |  | No |
| 10.7 How were you referred?\* | select | Yes | Online, Website, AI, Personal referral, Other | No (CRM only) |

`*` = my additions from the client answers. Remove them if the client disagrees.

## 4. Static values and configurable constants

Every value below lives in `pricing_configs` and is editable in the Admin Portal. Source tags: **Client** (client Q&A), **Req** (your requirement and pricing rules), **Proto** (earlier prototype), **Assumed** (my starting value, please confirm).

| Key | Default | Source |
| --- | --- | --- |
| `labourRate` | $250 per hour | Req + Client |
| `startRate` (no coating) | $2.50 per sqft | Req + Client |
| `addonPerSqft` | $1.00 per sqft | Req + Client |
| `accessMode` | `percent` | Assumed (D1) |
| `ratePosition` | 0.5 (0 = low, 1 = high) | Assumed (D4) |
| `travel.freeMinutes` | 45 | Client |
| `travel.fee` | $200 flat | Client (D8) |
| `minJob.near` / `minJob.far` | $2,500 / $3,000 | Client |
| Rounding | Customer total rounded to whole dollar | Assumed |

**Rate card ($ per sqft, low–high, one-story):**

| Prep level | Sealer | Semi-Transparent | Solid |
| --- | --- | --- | --- |
| `clean` (cleaning, pressure washing) | 2.50–3.00 | 3.00–3.50 | 3.50–4.00 |
| `strip` (paint removal or stain stripping) | 3.00–3.50 | 3.50–4.00 | 5.00–6.00 |
| `strip_sand` (stripping and sanding) | 3.50–4.50 | 4.00–4.50 | 5.50–6.50 |

Sanding without stripping is priced as `clean` plus the card's own sanding step (`strip_sand` minus `strip`): Sealer +0.50 to +1.00, Semi-Transparent +0.50, Solid +0.50. Source: Client.

**Wood labour adjustment (percent of base hours):**

| Species | % | Source |
| --- | --- | --- |
| Pressure-treated pine | 0% | Assumed |
| Cedar | +10% | Req |
| Redwood | +15% | Req |
| Meranti | +20% | Req |
| Tigerwood | +30% | Req |
| Ipe | +35% | Req |
| Composite Trex | −55% (cleaning only) | Req |

**Accessibility:**

| Option | Height | `percent` mode | `fixed_hours` mode |
| --- | --- | --- | --- |
| Ground Level | 0–4 ft | 0% | 0 h |
| First Story | 4–8 ft | +15% | +4 h |
| Second Story | 8–12 ft | +35% | +8 h |
| Roof Work | over 12 ft | +60% | +16 h |

**Production rates (sq ft per labour hour), all Assumed except the 50 from your example:**

| Service | Rate | Service | Rate |
| --- | --- | --- | --- |
| Cleaning | 100 | Stain Stripping | 50 |
| Pressure Washing | 100 | Staining | 100 |
| Sanding | 60 | Sealing | 100 |
| Paint Removal | 40 | Waterproofing | 100 |

Repairs has no production rate. It is priced by the contractor.

**Area conversions:** railing linear ft → sqft × 4 (Proto), stair step = 12 sqft (Proto), fascia linear ft × 1.5 (Proto), post = 6 sqft each (Assumed), joists / underside = floor × 0.4 (Proto).

## 5. Formulas, step by step

Let `A` be the billable area, `S` the set of selected services, `pos` the rate position.

**F1 Billable area.** `A = flooring + railings + stairs + posts + joists + fascia + other`, each converted to sq ft using the table above.

**F2 Classify the job.**

- `stripping = PaintRemoval OR StainStripping`
- `prep = stripping ? (Sanding ? strip_sand : strip) : clean`
- `finishes = the selected ones of {Staining, Sealing, Waterproofing}`
- `finish = Staining ? (stainType) : any finish ? sealer : none`. A job with no finish uses the Sealer column.

**F3 Rate lookup.** `[low, high] = rateCard[prep][finish]`. If Sanding without stripping, add the sanding step from Section 4 to both ends.

**F4 Rate position.** `rate = low + (high − low) × pos`. If `finish = none` then `rate = low` (this is the client's 'starts at $2.50').

**F5 Stacked-finish add-on.** `addon = max(0, finishCount − 1) × $1.00`

**F6 Price per sqft.** `sqftPrice = rate + addon`

**F7 Base price.** `basePrice = A × sqftPrice` (labour and materials are built in, client Q8)

**F8 Base labour hours.** `baseHours = Σ (A ÷ productionRate[s])` for every selected service except Repairs. Example: 200 ÷ 50 = 4 h.

**F9 Wood hours.** `woodHours = baseHours × woodPct`. Example: 4 × 10% = 0.4 h.

**F10 Access hours.** `percent` mode: `baseHours × accessPct`. `fixed_hours` mode: the tier's hours. Example: 4 × 15% = 0.6 h.

**F11 Additional hours.** `addHours = woodHours + accessHours`. Example: 0.4 + 0.6 = 1.0 h.

**F12 Labour adjustment.** `labourAdj = addHours × $250`. Only the additional hours are billed. Base labour is already in the sqft price.

**F13 Travel and minimum.** `far = travelMinutes > 45`. `travelFee = far ? $200 : 0`. `minJob = far ? $3,000 : $2,500`.

**F14 Total.** `total = max( max(basePrice + labourAdj + travelFee, 0), minJob )`

**F15 Range.** Run F4–F14 with `pos = 0` for the low end and `pos = 1` for the high end (a no-finish job stays at low). Contractors see low–high. The customer sees only `total`, rounded.

> **Why this differs from your first prototype:** the prototype multiplied layers (`base × coating × species × access × (1 + condition)`). The new model **adds** percentages of the **same** base hours (4 + 0.4 + 0.6 = 5), and only the additional hours are charged at $250. Section 8 conditions and Section 5 coating no longer touch the math at all.

## 6. Worked examples (use these as your test cases)

Defaults: `percent` mode, `ratePosition = 0.5`.

| Case | Inputs | Key steps | Customer total | Low–high |
| --- | --- | --- | --- | --- |
| A (your example) | 200 sqft, Stain Stripping only, Cedar, First Story, 30 min | rate 3.00 (no finish = low), base $600, hours 4, wood 0.4 + access 0.6 = 1.0 h = $250, subtotal $850 | **$2,500** (minimum job applies) | 2,500–2,500 |
| B | 500 sqft, Cleaning + Stain Stripping + Staining (Semi), Cedar, First Story, 30 min | rate 3.75, base $1,875, hours 5 + 10 + 5 = 20, wood 2.0 + access 3.0 = 5.0 h = $1,250 | **$3,125** | 3,000–3,250 |
| B-fixed | Same as B with `fixed_hours` | access 4 h, additional 6.0 h = $1,500 | **$3,375** | 3,250–3,500 |
| C | 300 sqft, Cleaning + Sealing, Pressure-treated pine, Ground, 60 min | rate 2.75, base $825, hours 6, additional 0, travel +$200 = $1,025 | **$3,000** (far minimum) | 3,000–3,000 |
| D (Trex) | 400 sqft, Cleaning only, Trex, Ground, 30 min | rate 2.50, base $1,000, hours 4, wood −2.2 h = −$550, subtotal $450 | **$2,500** | 2,500–2,500 |
| E (add-ons) | 600 floor + 100 railing sqft, Pressure Washing + Paint Removal + Sanding + Staining (Solid) + Sealing + Waterproofing, Cedar, First Story, 30 min | prep strip\_sand, solid 5.50–6.50 mid 6.00, 3 finishes so +$2.00 = 8.00/sqft, base $5,600, hours 57.17, wood 5.72 + access 8.58 = 14.29 h = $3,572.92 | **$9,173** | 8,823–9,523 |
| F (components) | Floor 600, rail 40 lf, 6 steps, fascia 30 lf, 4 posts, joists ticked, Cleaning + Sealing, PT pine, Ground, 30 min | A = 600 + 160 + 72 + 45 + 24 + 240 = 1,141 sqft, rate 2.75, base $3,137.75 | **$3,138** | 2,853–3,423 |

**Insight for the client:** at typical rates the minimum job floor decides the price for decks below roughly 700–850 sqft. Tell them, because most small quotes will land on $2,500.

## 7. Rules and flags (automation with no price effect)

- **R1 Trex lock:** when Trex is selected, disable every service except Cleaning and Pressure Washing.
- **R2 Photo review:** if Sanding, Paint Removal or Repairs is selected, set `needsPhotoReview = true`, prompt for photos, and show 'Final price confirmed after photo review'.
- **R3 Repairs:** the estimate never prices Repairs. If Repairs is ticked, status becomes `needs_contractor_quote`. If Rotted Wood, Water Damage, Warped Boards or Railing Damage is ticked but Repairs is not, show a gentle prompt to add it.
- **R4 Coating hint:** if the existing coating is Paint or Solid Stain and no stripping service is selected, show 'This coating usually needs stripping'. Hint only, price unchanged.
- **R5 Minimum applied:** store `minJobApplied = true` so contractors see why the quote equals the minimum.
- **R6 Travel unknown:** if travel time cannot be computed, use the near zone and flag `travel_unknown` for contractor review.
- **R7 Sanity:** area above 3,000 sqft or total above $25,000 sets `needs_contractor_review`.
- **R8 Area check:** warn if typed area differs from L × W by more than 10%.

## 8. Data model (aligned with your MongoDB schema)

Uses your existing collections: `users`, `contractor_profiles`, `decks`, `files`, `estimates`, `pricing_configs`, `audit_logs`, `leads`. (`condition_analyses` is for the later AI photo analysis; `discount_plans` is not required by the client.)

**pricing\_configs** (versioned, one active at a time):

```js
{ version: 3, active: true, effectiveFrom: Date, updatedBy: ObjectId,
  labourRate: 250, accessMode: 'percent', ratePosition: 0.5,
  addonPerSqft: 1.0, startRate: 2.5,
  rateCard: { clean: { sealer: [2.5, 3.0], semi: [3.0, 3.5], solid: [3.5, 4.0] },
              strip: { sealer: [3.0, 3.5], semi: [3.5, 4.0], solid: [5.0, 6.0] },
              strip_sand: { sealer: [3.5, 4.5], semi: [4.0, 4.5], solid: [5.5, 6.5] } },
  production: { cleaning: 100, pressure_washing: 100, sanding: 60, paint_removal: 40,
                stain_stripping: 50, staining: 100, sealing: 100, waterproofing: 100 },
  wood: { pt_pine: { label: 'Pressure-treated pine', pct: 0 }, cedar: { pct: 0.10 },
          redwood: { pct: 0.15 }, meranti: { pct: 0.20 }, tigerwood: { pct: 0.30 },
          ipe: { pct: 0.35 },
          trex: { pct: -0.55, servicesAllowed: ['cleaning', 'pressure_washing'] } },
  access: { ground: { pct: 0, fixedHours: 0, hint: '0-4 ft' },
            first: { pct: 0.15, fixedHours: 4, hint: '4-8 ft' },
            second: { pct: 0.35, fixedHours: 8, hint: '8-12 ft' },
            roof: { pct: 0.60, fixedHours: 16, hint: 'over 12 ft' } },
  areas: { railingSqftPerLf: 4, stairSqftPerStep: 12, postSqftEach: 6,
           joistFactor: 0.4, fasciaSqftPerLf: 1.5 },
  travel: { freeMinutes: 45, fee: 200 }, minJob: { near: 2500, far: 3000 } }
```

**estimates** (never recalculated later; always store the snapshot):

```js
{ ref: 'DP-2026-00042', status: 'submitted', configVersion: 3, leadId, deckId,
  inputs: { /* full snapshot of Sections 1-10 */ }, photoFileIds: [],
  calc: { areas: {}, A, prep, finish, baseHours, woodHours, accessHours, addHours,
          basePrice, labourAdj, travelMinutes, travelFee, minJob, minJobApplied,
          total, low, high },
  flags: ['needs_photo_review'],
  override: { total, reason, by, at },   // contractor only
  pdfFileId, createdAt, updatedAt }
```

Statuses: `submitted`, `needs_photo_review`, `needs_contractor_quote`, `reviewed`, `quoted`, `accepted`, `declined`.

**leads:** name, email, phone, address, location, referralSource, estimateIds, crmSyncStatus. **audit\_logs:** every pricing config change (who, when, old and new value).

## 9. Apps and screens

**Customer Estimator (public app):** stepper for the 9 input sections, auto-save draft in the browser, area helper for L/U/multi-section shapes, upload with thumbnails, result screen (Section 7), 'Email me my estimate'. History is by email magic link (client Q16) with no password.

**Contractor dashboard:** list with filters (status, date, referral source, flags), estimate detail (inputs, photos, full breakdown, low–high), override final price with a reason, add Repairs and Sanding amounts after photo review, internal notes, change status, download PDF, export CSV.

**Admin Portal:** editors for the rate card (3 × 3 grid with low and high), production rates, wood %, accessibility (mode switch, %, fixed hours), labour rate, add-on, area conversions, travel and minimum job, rate position, option lists. Every save creates a new `pricing_configs` version plus an audit log. Include a **Test calculator** panel that shows each formula with the numbers plugged in, like the formula view we built earlier.

**Roles (D15):** Customer (no login), Contractor (own and assigned estimates, cannot edit pricing), Admin (everything, including pricing config and users).

## 10. API

| Method and path | Who | Purpose |
| --- | --- | --- |
| `POST /api/uploads/presign` | Customer | Signed URL for a photo upload |
| `POST /api/estimates` | Customer | Submit inputs, server calculates and returns `{ref, total}` only |
| `GET /api/estimates/:ref?token=` | Customer | View own estimate (magic link) |
| `GET /api/estimates/:ref/pdf` | Customer | Customer PDF |
| `GET /api/contractor/estimates` | Contractor | List with filters |
| `GET/PATCH /api/contractor/estimates/:id` | Contractor | Detail, override, status, notes |
| `GET /api/contractor/estimates/:id/pdf` | Contractor | PDF with breakdown |
| `GET/PUT /api/admin/pricing-config` | Admin | Read or save a new version |
| `GET /api/admin/audit-logs` | Admin | Config change history |
| `POST /api/admin/calc-test` | Admin | Run the engine on sample inputs and return every step |

**Travel time:** at submit, call the Google Distance Matrix API from your shop address to the project address and store `travelMinutes`. If it fails, see R6.

## 11. Outputs and integrations

- **Result screen:** big total, project name, one line 'This is an estimate. Final price is confirmed after review of your photos or a site visit.' No labour, material or breakdown lines (Q12).
- **PDF (Q17):** customer version shows the total and project summary only. Contractor version adds the breakdown. Estimate validity (suggest 30 days) needs client confirmation.
- **CRM (Q20):** after submit, push name, address, email, phone, referral source and the estimate total to the CRM through a webhook or API. Store `crmSyncStatus` and retry on failure.
- **3D / AI visual (Q18, Q19) – Phase 2:** the customer uploads a photo and an image-generation API produces a restored-deck rendering for selling the job. It is display only, dimensions are locked and the estimate does not change.

## 12. Reference implementation (the pricing engine)

One pure function with no database or UI code, so you can unit-test it against Section 6 before building anything else.

```js
function calculateEstimate(inp, cfg) {
  const n = v => Number(v) || 0;
  const a = cfg.areas;
  const areas = {
    flooring: n(inp.deckArea),
    railings: inp.railingSqft != null ? n(inp.railingSqft) : n(inp.railingLf) * a.railingSqftPerLf,
    stairs: n(inp.stairSteps) * a.stairSqftPerStep,
    posts: n(inp.postCount) * a.postSqftEach,
    joists: inp.joists ? (inp.joistsSqft != null ? n(inp.joistsSqft) : n(inp.deckArea) * a.joistFactor) : 0,
    fascia: inp.fasciaSqft != null ? n(inp.fasciaSqft) : n(inp.fasciaLf) * a.fasciaSqftPerLf,
    other: (inp.other || []).reduce((s, o) => s + n(o.sqft), 0)
  };
  const A = Object.values(areas).reduce((s, v) => s + v, 0);

  const S = new Set(inp.services);
  const stripping = S.has('paint_removal') || S.has('stain_stripping');
  const sanding = S.has('sanding');
  const finishes = ['staining', 'sealing', 'waterproofing'].filter(s => S.has(s));
  const finish = S.has('staining') ? (inp.stainType === 'solid' ? 'solid' : 'semi')
                 : finishes.length ? 'sealer' : 'none';
  const prep = stripping ? (sanding ? 'strip_sand' : 'strip') : 'clean';
  const col = finish === 'none' ? 'sealer' : finish;

  let [lo, hi] = cfg.rateCard[prep][col];
  if (sanding && !stripping) {            // sanding only: clean rate plus the card's sanding step
    const up = cfg.rateCard.strip_sand[col], dn = cfg.rateCard.strip[col];
    lo += up[0] - dn[0]; hi += up[1] - dn[1];
  }
  const addon = Math.max(0, finishes.length - 1) * cfg.addonPerSqft;
  const rateAt = pos => (finish === 'none' ? lo : lo + (hi - lo) * pos) + addon;

  const baseHours = [...S].filter(s => s !== 'repairs')
    .reduce((h, s) => h + A / cfg.production[s], 0);
  const woodHours = baseHours * cfg.wood[inp.wood].pct;
  const acc = cfg.access[inp.access];
  const accessHours = cfg.accessMode === 'percent' ? baseHours * acc.pct : acc.fixedHours;
  const addHours = woodHours + accessHours;
  const labourAdj = addHours * cfg.labourRate;

  const far = n(inp.travelMinutes) > cfg.travel.freeMinutes;
  const travel = far ? cfg.travel.fee : 0;
  const minJob = far ? cfg.minJob.far : cfg.minJob.near;
  const totalAt = pos => Math.max(Math.max(A * rateAt(pos) + labourAdj + travel, 0), minJob);

  return { areas, A, prep, finish, baseHours, woodHours, accessHours, addHours,
    basePrice: A * rateAt(cfg.ratePosition), labourAdj, travel, minJob,
    total: Math.round(totalAt(cfg.ratePosition)),
    low: Math.round(totalAt(0)), high: Math.round(totalAt(1)),
    minJobApplied: A * rateAt(cfg.ratePosition) + labourAdj + travel < minJob,
    needsPhotoReview: sanding || S.has('paint_removal') || S.has('repairs') };
}
```

**Server-side validation before calling it:** `A > 0`, at least one service, every selected service has a production rate above 0, the wood key exists, and Trex jobs contain only cleaning services.

## 13. Build order

1. **Engine and tests:** implement Section 12, turn Section 6 into unit tests, add edge cases (zero area, no services, Trex with a disallowed service, missing travel time).
2. **Config and Admin Portal:** `pricing_configs` with versioning, audit log, test-calculator panel.
3. **Customer app:** the stepper, validation, uploads, address lookup and travel time, result screen.
4. **Contractor dashboard:** list, detail, override, status, notes.
5. **PDF, history by magic link, CRM webhook.**
6. **Phase 2:** 3D / AI visual, `condition_analyses` photo analysis.

**Before you start coding, get answers to D1, D2/D3, D4, D5, D8 and D10.** These change the money. The rest are small defaults you can adjust later in the Admin Portal.
