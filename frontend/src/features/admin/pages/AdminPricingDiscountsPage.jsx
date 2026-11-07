// =============================================
// Deck Estimator — Admin Pricing & Discounts Management Hub
// =============================================
// Combined Unified Page:
// - Tab 1: Material Costs ($/gal) + Live 400 sq ft Deck Real-time Simulator
// - Tab 2: Labor & Productivity ($/hr, sq ft/hr)
// - Tab 3: Adjustment Factors (Wood Species, Condition & Elevation Multipliers)
// - Tab 4: Quote Margins & Minimum Job Charge
// - Tab 5: Contractor Discounts & Tier Incentives (Default 10% + Contractor Overrides based on completed jobs)
// - Tab 6: Discount & Pricing Audit Logs from MongoDB Atlas

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const TABS = [
  { id: 'material', label: 'Material Costs ($/gal)' },
  { id: 'labor', label: 'Labor & Productivity' },
  { id: 'factors', label: 'Adjustment Factors' },
  { id: 'quote', label: 'Quote Margins & Settings' },
  { id: 'contractor_discounts', label: 'Contractor Discounts & Incentives' },
  { id: 'audit_logs', label: 'Discount Audit History' },
];

export default function AdminPricingDiscountsPage() {
  const [activeTab, setActiveTab] = useState('material');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // PRICING CONFIGURATION STATE
  const [pricing, setPricing] = useState({
    materialCosts: {
      deckStainPerGallon: 46,
      woodStripperPerGallon: 38,
      deckBrightenerPerGallon: 28,
      cleanerPerGallon: 32,
    },
    laborAndProductivity: {
      hourlyLaborRate: 75,
      prepProductivitySqFtPerHour: 50,
      stainingProductivitySqFtPerHour: 65,
      maintenanceProductivityRatio: 0.7,
    },
    adjustmentFactors: {
      woodSpecies: {
        pressureTreated: 1.0,
        cedar: 1.15,
        redwood: 1.25,
        composite: 1.1,
      },
      conditionMultipliers: {
        good: 1.0,
        fair: 1.15,
        poor: 1.35,
      },
      elevationFactors: {
        ground: 1.0,
        secondStory: 1.2,
      },
    },
    quoteSettings: {
      wasteFactorPercent: 12,
      contractorMarkupPercent: 8,
      defaultMarginPercent: 20,
      minimumJobCharge: 450,
    },
  });

  // DISCOUNTS STATE
  const [discountData, setDiscountData] = useState(null);
  const [isEditingDefault, setIsEditingDefault] = useState(false);
  const [defaultVal, setDefaultVal] = useState(10);
  const [defaultReason, setDefaultReason] = useState('');
  const [savingDefault, setSavingDefault] = useState(false);

  // Contractor Override Modal State
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [customDiscount, setCustomDiscount] = useState(10);
  const [overrideReason, setOverrideReason] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pricingRes, discountRes] = await Promise.all([
        adminApi.getPricingConfig(),
        adminApi.getDiscountsOverview(),
      ]);

      if (pricingRes?.data) {
        const cp = pricingRes.data.calculatorPricing || {};
        setPricing({
          materialCosts: { ...pricing.materialCosts, ...(cp.materialCosts || {}) },
          laborAndProductivity: { ...pricing.laborAndProductivity, ...(cp.laborAndProductivity || {}) },
          adjustmentFactors: {
            woodSpecies: { ...pricing.adjustmentFactors.woodSpecies, ...(cp.adjustmentFactors?.woodSpecies || {}) },
            conditionMultipliers: { ...pricing.adjustmentFactors.conditionMultipliers, ...(cp.adjustmentFactors?.conditionMultipliers || {}) },
            elevationFactors: { ...pricing.adjustmentFactors.elevationFactors, ...(cp.adjustmentFactors?.elevationFactors || {}) },
          },
          quoteSettings: { ...pricing.quoteSettings, ...(cp.quoteSettings || {}) },
        });
      }

      if (discountRes?.data) {
        setDiscountData(discountRes.data);
        if (discountRes.data.defaultDiscount !== undefined) {
          setDefaultVal(discountRes.data.defaultDiscount);
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to load pricing & discount data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePricing = async () => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await adminApi.updatePricingConfig({
        calculatorPricing: pricing,
      });
      setSuccessMsg('Pricing engine parameters saved to MongoDB! Live calculator estimates updated.');
    } catch (err) {
      setError(err?.message || 'Failed to update pricing configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDefaultDiscount = async () => {
    setSavingDefault(true);
    setError(null);
    try {
      await adminApi.updateDefaultDiscount(Number(defaultVal), defaultReason || 'Default platform rate adjustment');
      setSuccessMsg(`Default contractor discount updated to ${defaultVal}%.`);
      setIsEditingDefault(false);
      loadAllData();
    } catch (err) {
      setError(err?.message || 'Failed to update default discount.');
    } finally {
      setSavingDefault(false);
    }
  };

  const handleOpenOverride = (c) => {
    setSelectedContractor(c);
    setCustomDiscount(c.customDiscount !== undefined ? c.customDiscount : defaultVal);
    setOverrideReason('');
  };

  const handleSaveOverride = async () => {
    if (!selectedContractor) return;
    setSavingOverride(true);
    setError(null);
    try {
      await adminApi.setContractorDiscount(
        selectedContractor._id,
        Number(customDiscount),
        overrideReason || `Incentive based on ${selectedContractor.completedProjects || 0} completed projects`
      );
      setSuccessMsg(`Custom discount set to ${customDiscount}% for ${selectedContractor.name}.`);
      setSelectedContractor(null);
      loadAllData();
    } catch (err) {
      setError(err?.message || 'Failed to set contractor discount.');
    } finally {
      setSavingOverride(false);
    }
  };

  // REAL-TIME SIMULATOR FOR 400 SQ FT DECK
  const deckSqFt = 400;
  const stainGals = Math.ceil(deckSqFt / 200);
  const prepGals = Math.ceil(deckSqFt / 250);
  const materialCost = (stainGals * (pricing.materialCosts.deckStainPerGallon || 46)) +
                       (prepGals * (pricing.materialCosts.woodStripperPerGallon || 38));
  const prepHours = deckSqFt / (pricing.laborAndProductivity.prepProductivitySqFtPerHour || 50);
  const stainHours = deckSqFt / (pricing.laborAndProductivity.stainingProductivitySqFtPerHour || 65);
  const totalLaborHours = prepHours + stainHours;
  const laborCost = totalLaborHours * (pricing.laborAndProductivity.hourlyLaborRate || 75);
  const subtotal = materialCost + laborCost;
  const wasteCost = subtotal * ((pricing.quoteSettings.wasteFactorPercent || 12) / 100);
  const markupCost = subtotal * ((pricing.quoteSettings.contractorMarkupPercent || 8) / 100);
  const simulatedTotal = Math.max(pricing.quoteSettings.minimumJobCharge || 450, subtotal + wasteCost + markupCost);
  const contractorDiscountAmt = simulatedTotal * ((defaultVal || 10) / 100);
  const simulatedContractorTotal = simulatedTotal - contractorDiscountAmt;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Pricing & Discounts Management Hub</h1>
          <p style={styles.subtitle}>
            Unified calculation engine, material rates, labor metrics, and contractor discount incentives.
          </p>
        </div>
        {activeTab !== 'contractor_discounts' && activeTab !== 'audit_logs' && (
          <button onClick={handleSavePricing} disabled={saving} style={styles.btnPrimary}>
            {saving ? 'Saving...' : 'Save Pricing Parameters'}
          </button>
        )}
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={styles.alertSuccess}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {error && (
        <div style={styles.alertError}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{error}</span>
          <button onClick={() => setError(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              ...styles.tabBtn,
              ...(activeTab === t.id ? styles.tabBtnActive : {}),
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main Layout Grid with Side Simulator */}
      <div style={styles.layoutGrid}>
        {/* Left Column: Active Tab Content */}
        <div style={styles.mainCol}>
          {loading ? (
            <div style={styles.loaderBox}>
              <div style={styles.spinner} />
              <span>Loading pricing & discount configurations...</span>
            </div>
          ) : activeTab === 'material' ? (
            /* TAB 1: MATERIAL COSTS */
            <div style={styles.card}>
              <h3 style={styles.cardSectionTitle}>Material Unit Costs ($ per Gallon)</h3>
              <p style={styles.cardSectionSub}>Unit rates used across all customer and contractor deck restoration calculations.</p>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Premium Deck Stain ($/Gal)</label>
                  <input
                    type="number"
                    value={pricing.materialCosts.deckStainPerGallon}
                    onChange={(e) => setPricing({
                      ...pricing,
                      materialCosts: { ...pricing.materialCosts, deckStainPerGallon: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Heavy Wood Stripper ($/Gal)</label>
                  <input
                    type="number"
                    value={pricing.materialCosts.woodStripperPerGallon}
                    onChange={(e) => setPricing({
                      ...pricing,
                      materialCosts: { ...pricing.materialCosts, woodStripperPerGallon: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Deck Brightener & Neutralizer ($/Gal)</label>
                  <input
                    type="number"
                    value={pricing.materialCosts.deckBrightenerPerGallon}
                    onChange={(e) => setPricing({
                      ...pricing,
                      materialCosts: { ...pricing.materialCosts, deckBrightenerPerGallon: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Deep Cleaner / Mildew Wash ($/Gal)</label>
                  <input
                    type="number"
                    value={pricing.materialCosts.cleanerPerGallon}
                    onChange={(e) => setPricing({
                      ...pricing,
                      materialCosts: { ...pricing.materialCosts, cleanerPerGallon: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'labor' ? (
            /* TAB 2: LABOR & PRODUCTIVITY */
            <div style={styles.card}>
              <h3 style={styles.cardSectionTitle}>Labor Rates & Crew Productivity</h3>
              <p style={styles.cardSectionSub}>Productivity baselines dictate the estimated labor hours per job.</p>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Hourly Labor Rate ($/hour)</label>
                  <input
                    type="number"
                    value={pricing.laborAndProductivity.hourlyLaborRate}
                    onChange={(e) => setPricing({
                      ...pricing,
                      laborAndProductivity: { ...pricing.laborAndProductivity, hourlyLaborRate: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Prep Productivity (sq ft / hr)</label>
                  <input
                    type="number"
                    value={pricing.laborAndProductivity.prepProductivitySqFtPerHour}
                    onChange={(e) => setPricing({
                      ...pricing,
                      laborAndProductivity: { ...pricing.laborAndProductivity, prepProductivitySqFtPerHour: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Staining Productivity (sq ft / hr)</label>
                  <input
                    type="number"
                    value={pricing.laborAndProductivity.stainingProductivitySqFtPerHour}
                    onChange={(e) => setPricing({
                      ...pricing,
                      laborAndProductivity: { ...pricing.laborAndProductivity, stainingProductivitySqFtPerHour: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Maintenance Ratio</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricing.laborAndProductivity.maintenanceProductivityRatio}
                    onChange={(e) => setPricing({
                      ...pricing,
                      laborAndProductivity: { ...pricing.laborAndProductivity, maintenanceProductivityRatio: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'factors' ? (
            /* TAB 3: ADJUSTMENT FACTORS */
            <div style={styles.card}>
              <h3 style={styles.cardSectionTitle}>Adjustment Multipliers</h3>
              <p style={styles.cardSectionSub}>Multipliers dynamically adjust labor and material cost based on substrate and condition.</p>

              <h4 style={{ margin: '16px 0 10px', fontSize: '13px', color: '#1e293b' }}>Wood Species Multipliers:</h4>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Pressure Treated Pine</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricing.adjustmentFactors.woodSpecies.pressureTreated}
                    onChange={(e) => setPricing({
                      ...pricing,
                      adjustmentFactors: {
                        ...pricing.adjustmentFactors,
                        woodSpecies: { ...pricing.adjustmentFactors.woodSpecies, pressureTreated: Number(e.target.value) },
                      },
                    })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Western Red Cedar</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricing.adjustmentFactors.woodSpecies.cedar}
                    onChange={(e) => setPricing({
                      ...pricing,
                      adjustmentFactors: {
                        ...pricing.adjustmentFactors,
                        woodSpecies: { ...pricing.adjustmentFactors.woodSpecies, cedar: Number(e.target.value) },
                      },
                    })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>California Redwood</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricing.adjustmentFactors.woodSpecies.redwood}
                    onChange={(e) => setPricing({
                      ...pricing,
                      adjustmentFactors: {
                        ...pricing.adjustmentFactors,
                        woodSpecies: { ...pricing.adjustmentFactors.woodSpecies, redwood: Number(e.target.value) },
                      },
                    })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Composite Decking</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricing.adjustmentFactors.woodSpecies.composite}
                    onChange={(e) => setPricing({
                      ...pricing,
                      adjustmentFactors: {
                        ...pricing.adjustmentFactors,
                        woodSpecies: { ...pricing.adjustmentFactors.woodSpecies, composite: Number(e.target.value) },
                      },
                    })}
                    style={styles.input}
                  />
                </div>
              </div>

              <h4 style={{ margin: '20px 0 10px', fontSize: '13px', color: '#1e293b' }}>Surface Degradation Multipliers:</h4>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Good Condition</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricing.adjustmentFactors.conditionMultipliers.good}
                    onChange={(e) => setPricing({
                      ...pricing,
                      adjustmentFactors: {
                        ...pricing.adjustmentFactors,
                        conditionMultipliers: { ...pricing.adjustmentFactors.conditionMultipliers, good: Number(e.target.value) },
                      },
                    })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Weathered / Grayed</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricing.adjustmentFactors.conditionMultipliers.fair}
                    onChange={(e) => setPricing({
                      ...pricing,
                      adjustmentFactors: {
                        ...pricing.adjustmentFactors,
                        conditionMultipliers: { ...pricing.adjustmentFactors.conditionMultipliers, fair: Number(e.target.value) },
                      },
                    })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Severely Degraded (Peeling)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pricing.adjustmentFactors.conditionMultipliers.poor}
                    onChange={(e) => setPricing({
                      ...pricing,
                      adjustmentFactors: {
                        ...pricing.adjustmentFactors,
                        conditionMultipliers: { ...pricing.adjustmentFactors.conditionMultipliers, poor: Number(e.target.value) },
                      },
                    })}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'quote' ? (
            /* TAB 4: QUOTE MARGINS */
            <div style={styles.card}>
              <h3 style={styles.cardSectionTitle}>Quote Margins & Charge Rules</h3>
              <p style={styles.cardSectionSub}>Waste allowances, contractor baseline margins, and minimum invoice floor.</p>

              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Waste & Spillage Allowance (%)</label>
                  <input
                    type="number"
                    value={pricing.quoteSettings.wasteFactorPercent}
                    onChange={(e) => setPricing({
                      ...pricing,
                      quoteSettings: { ...pricing.quoteSettings, wasteFactorPercent: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Contractor Markup Margin (%)</label>
                  <input
                    type="number"
                    value={pricing.quoteSettings.contractorMarkupPercent}
                    onChange={(e) => setPricing({
                      ...pricing,
                      quoteSettings: { ...pricing.quoteSettings, contractorMarkupPercent: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.inputLabel}>Minimum Job Invoice Floor ($)</label>
                  <input
                    type="number"
                    value={pricing.quoteSettings.minimumJobCharge}
                    onChange={(e) => setPricing({
                      ...pricing,
                      quoteSettings: { ...pricing.quoteSettings, minimumJobCharge: Number(e.target.value) },
                    })}
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 'contractor_discounts' ? (
            /* TAB 5: CONTRACTOR DISCOUNTS & INCENTIVES */
            <div>
              {/* Global Default Card */}
              <div style={styles.defaultCard}>
                <div style={styles.defaultCardContent}>
                  <div style={styles.defaultIconPill}>%</div>
                  <div>
                    <div style={styles.defaultSub}>Global Platform Standard</div>
                    <h2 style={styles.defaultTitle}>Default Contractor Discount: {discountData?.defaultDiscount ?? 10}%</h2>
                    <p style={styles.defaultDesc}>
                      Automatically subtracted from materials and services on all verified contractor estimates unless an individual override is configured.
                    </p>
                  </div>
                </div>

                <div>
                  {!isEditingDefault ? (
                    <button onClick={() => setIsEditingDefault(true)} style={styles.btnOutlineWhite}>
                      Edit Default Rate
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={defaultVal}
                        onChange={(e) => setDefaultVal(e.target.value)}
                        style={styles.inputWhite}
                        placeholder="e.g. 10"
                      />
                      <input
                        type="text"
                        value={defaultReason}
                        onChange={(e) => setDefaultReason(e.target.value)}
                        style={styles.inputWhiteSmall}
                        placeholder="Reason for change..."
                      />
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={handleSaveDefaultDiscount}
                          disabled={savingDefault}
                          style={styles.btnSaveWhite}
                        >
                          {savingDefault ? 'Saving...' : 'Save'}
                        </button>
                        <button onClick={() => setIsEditingDefault(false)} style={styles.btnCancelWhite}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Individual Contractor Overrides Table */}
              <div style={{ ...styles.card, marginTop: '20px' }}>
                <h3 style={styles.cardSectionTitle}>Individual Contractor Discount Overrides</h3>
                <p style={styles.cardSectionSub}>
                  Incentivize top partners based on completed deck projects. Rates: 0-5 jobs = 10% (Standard), 6-15 = 12% (Gold), 16+ = 15% (Platinum).
                </p>

                {(!discountData?.contractors || discountData.contractors.length === 0) ? (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>No contractors registered in the system.</p>
                ) : (
                  <div style={styles.tableResponsive}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>Contractor</th>
                          <th style={styles.th}>Completed Decks</th>
                          <th style={styles.th}>Current Discount</th>
                          <th style={styles.th}>Discount Policy</th>
                          <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discountData.contractors.map((c) => (
                          <tr key={c._id} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={{ fontWeight: '600', color: '#0f172a' }}>{c.name}</div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>{c.email}</div>
                            </td>
                            <td style={styles.td}>
                              <span style={styles.badgeCount}>{c.completedProjects || 0} Projects</span>
                            </td>
                            <td style={styles.td}>
                              <span style={{ fontSize: '14px', fontWeight: '800', color: '#1d4ed8' }}>
                                {c.currentDiscount || `${defaultVal}%`}
                              </span>
                            </td>
                            <td style={styles.td}>
                              <span style={c.discountType === 'Individual' ? styles.badgeCustom : styles.badgeDefault}>
                                {c.discountType || 'Default Standard'}
                              </span>
                            </td>
                            <td style={{ ...styles.td, textAlign: 'right' }}>
                              <button onClick={() => handleOpenOverride(c)} style={styles.actionBtnOutline}>
                                Set Custom Rate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 6: AUDIT HISTORY */
            <div style={styles.card}>
              <h3 style={styles.cardSectionTitle}>Discount Policy Modification Audit Trail</h3>
              <p style={styles.cardSectionSub}>Immutable audit records of all rate modifications and administrator justifications.</p>

              {(!discountData?.auditHistory || discountData.auditHistory.length === 0) ? (
                <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>No discount modification logs recorded yet.</p>
              ) : (
                <div style={styles.tableResponsive}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Date & Time</th>
                        <th style={styles.th}>Target</th>
                        <th style={styles.th}>Change</th>
                        <th style={styles.th}>Reason</th>
                        <th style={styles.th}>Modified By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {discountData.auditHistory.map((h, i) => (
                        <tr key={h._id || i} style={styles.tr}>
                          <td style={styles.td}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              {new Date(h.createdAt).toLocaleDateString()} {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </td>
                          <td style={styles.td}>
                            <strong>{h.contractorName || 'All Contractors'}</strong>
                          </td>
                          <td style={styles.td}>
                            <span style={{ color: '#b45309', fontWeight: 'bold' }}>
                              {h.previousDiscount}% → {h.newDiscount}%
                            </span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontSize: '13px', color: '#475569' }}>{h.reason || 'Rate adjustment'}</span>
                          </td>
                          <td style={styles.td}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>{h.updatedByName || 'Admin'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Real-Time Estimation Simulator */}
        <div style={styles.sideCol}>
          <div style={styles.simulatorCard}>
            <div style={styles.simHeader}>
              <span style={styles.simBadge}>LIVE SIMULATOR</span>
              <h4 style={styles.simTitle}>400 sq ft Sample Deck</h4>
              <p style={styles.simSub}>Real-time calculation based on current parameters</p>
            </div>

            <div style={styles.simBody}>
              <div style={styles.simRow}>
                <span>Materials ({stainGals} gal stain + {prepGals} gal prep):</span>
                <strong>${materialCost.toFixed(2)}</strong>
              </div>
              <div style={styles.simRow}>
                <span>Estimated Labor ({totalLaborHours.toFixed(1)} hrs @ ${pricing.laborAndProductivity.hourlyLaborRate}/hr):</span>
                <strong>${laborCost.toFixed(2)}</strong>
              </div>
              <div style={styles.simRow}>
                <span>Waste Factor ({pricing.quoteSettings.wasteFactorPercent}%):</span>
                <span>${wasteCost.toFixed(2)}</span>
              </div>
              <div style={styles.simRow}>
                <span>Contractor Markup ({pricing.quoteSettings.contractorMarkupPercent}%):</span>
                <span>${markupCost.toFixed(2)}</span>
              </div>

              <div style={styles.simDivider} />

              <div style={styles.simTotalRow}>
                <span>Client Quote Total:</span>
                <span style={styles.simTotalVal}>${simulatedTotal.toFixed(2)}</span>
              </div>

              <div style={styles.simContractorRow}>
                <span>Contractor Payout (after {defaultVal}% discount):</span>
                <span style={styles.simContractorVal}>${simulatedContractorTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTRACTOR CUSTOM RATE MODAL */}
      {selectedContractor && (
        <div style={styles.modalOverlay} onClick={() => setSelectedContractor(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Set Custom Contractor Discount</h3>
            <p style={styles.modalSub}>{selectedContractor.name} ({selectedContractor.email})</p>
            <p style={{ fontSize: '12px', color: '#047857', fontWeight: '600', margin: '4px 0 16px' }}>
              ✓ Completed {selectedContractor.completedProjects || 0} projects on platform.
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={styles.inputLabel}>Custom Discount Percentage (%):</label>
              <input
                type="number"
                min="0"
                max="50"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.inputLabel}>Reason / Incentive Note:</label>
              <textarea
                rows={2}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                style={styles.textarea}
                placeholder="e.g. Platinum tier partner with 16+ verified completed projects"
              />
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setSelectedContractor(null)} style={styles.btnSecondary} disabled={savingOverride}>
                Cancel
              </button>
              <button onClick={handleSaveOverride} style={styles.btnPrimary} disabled={savingOverride}>
                {savingOverride ? 'Saving...' : 'Save Custom Rate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#64748b',
    margin: '4px 0 0',
  },
  btnPrimary: {
    padding: '10px 18px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '8px 14px',
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    marginBottom: '16px',
    fontSize: '13px',
  },
  alertCloseBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '20px',
    overflowX: 'auto',
  },
  tabBtn: {
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    color: '#1d4ed8',
    borderBottomColor: '#1d4ed8',
  },
  layoutGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '24px',
    alignItems: 'start',
  },
  mainCol: {
    minWidth: 0,
  },
  sideCol: {
    position: 'sticky',
    top: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardSectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px',
  },
  cardSectionSub: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '6px',
    textTransform: 'uppercase',
  },
  input: {
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },
  textarea: {
    padding: '9px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  },
  defaultCard: {
    backgroundColor: '#1d4ed8',
    borderRadius: '8px',
    padding: '24px',
    color: '#ffffff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(29, 78, 216, 0.2)',
  },
  defaultCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '18px',
  },
  defaultIconPill: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    fontWeight: '800',
  },
  defaultSub: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#93c5fd',
  },
  defaultTitle: {
    margin: '4px 0',
    fontSize: '20px',
    fontWeight: '800',
  },
  defaultDesc: {
    margin: 0,
    fontSize: '12px',
    color: '#bfdbfe',
    maxWidth: '480px',
  },
  btnOutlineWhite: {
    padding: '9px 16px',
    backgroundColor: 'transparent',
    color: '#ffffff',
    border: '1px solid #ffffff',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '12px',
    cursor: 'pointer',
  },
  inputWhite: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: 'none',
    fontSize: '13px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  inputWhiteSmall: {
    padding: '6px 10px',
    borderRadius: '4px',
    border: 'none',
    fontSize: '11px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  btnSaveWhite: {
    flex: 1,
    padding: '6px 10px',
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '700',
    fontSize: '11px',
    cursor: 'pointer',
  },
  btnCancelWhite: {
    flex: 1,
    padding: '6px 10px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontWeight: '600',
    fontSize: '11px',
    cursor: 'pointer',
  },
  badgeCount: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#047857',
    backgroundColor: '#ecfdf5',
    padding: '2px 8px',
    borderRadius: '12px',
    border: '1px solid #a7f3d0',
  },
  badgeCustom: {
    fontSize: '10px',
    fontWeight: '700',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    padding: '2px 6px',
    borderRadius: '4px',
    border: '1px solid #bfdbfe',
  },
  badgeDefault: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  actionBtnOutline: {
    padding: '5px 10px',
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    border: '1px solid #1d4ed8',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  simulatorCard: {
    backgroundColor: '#0f172a',
    borderRadius: '8px',
    padding: '20px',
    color: '#ffffff',
    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
  },
  simHeader: {
    borderBottom: '1px solid #334155',
    paddingBottom: '12px',
    marginBottom: '16px',
  },
  simBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#38bdf8',
    letterSpacing: '0.05em',
  },
  simTitle: {
    margin: '4px 0 2px',
    fontSize: '16px',
    fontWeight: '700',
  },
  simSub: {
    margin: 0,
    fontSize: '12px',
    color: '#94a3b8',
  },
  simBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    fontSize: '13px',
  },
  simRow: {
    display: 'flex',
    justifyContent: 'space-between',
    color: '#cbd5e1',
  },
  simDivider: {
    height: '1px',
    backgroundColor: '#334155',
    margin: '6px 0',
  },
  simTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '700',
    color: '#ffffff',
  },
  simTotalVal: {
    fontSize: '18px',
    color: '#38bdf8',
    fontWeight: '800',
  },
  simContractorRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '12px',
    color: '#a7f3d0',
  },
  simContractorVal: {
    fontWeight: '700',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '13px',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    borderBottom: '2px solid #e2e8f0',
    color: '#475569',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '10px 12px',
    verticalAlign: 'middle',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    width: '100%',
    maxWidth: '460px',
  },
  modalTitle: {
    margin: '0 0 4px',
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    margin: '0 0 16px',
    fontSize: '13px',
    color: '#64748b',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  loaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 0',
    gap: '12px',
    color: '#64748b',
  },
  spinner: {
    width: '28px',
    height: '28px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

