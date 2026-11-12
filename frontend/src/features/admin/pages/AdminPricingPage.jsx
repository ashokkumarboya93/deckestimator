// =============================================
// Deck Estimator — Admin Pricing Management Engine
// =============================================
// Features:
// - 4 horizontal tabs: Material Costs, Labor & Productivity, Adjustment Factors, Quote Settings
// - Live Estimation Simulator Card on the side: Instant quote preview for a 400 sq ft deck
// - Directly backed by MongoDB via adminApi; updates instantly govern all customer & contractor calculators

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

const TABS = [
  { id: 'material', label: 'Material Costs ($/gal)' },
  { id: 'labor', label: 'Labor & Productivity' },
  { id: 'factors', label: 'Adjustment Factors' },
  { id: 'quote', label: 'Quote Margins & Settings' },
];

export default function AdminPricingPage() {
  const [activeTab, setActiveTab] = useState('material');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Editable Pricing Fields State
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

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getPricingConfig();
      if (res?.data) {
        setConfig(res.data);
        const cp = res.data.calculatorPricing || {};
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
    } catch (err) {
      setError(err?.message || 'Failed to load pricing configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await adminApi.updatePricingConfig({
        calculatorPricing: pricing,
      });
      setSuccessMsg('Pricing parameters saved! Calculator engine across customer and contractor portals updated.');
    } catch (err) {
      setError(err?.message || 'Failed to update pricing.');
    } finally {
      setSaving(false);
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

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Pricing Management</h1>
          <p style={styles.subtitle}>
            Calibrate core material gallon rates, labor productivity, waste margins, and condition multipliers.
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} style={styles.btnPrimary}>
          {saving ? 'Saving Changes...' : 'Save Pricing Parameters'}
        </button>
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

      {/* Two Column Layout: Editor (Left) & Live Simulator (Right) */}
      <div style={styles.layoutRow}>
        {/* LEFT COLUMN: TABS & PARAMETERS */}
        <div style={styles.leftCol}>
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

          <div style={styles.card}>
            {loading ? (
              <div style={styles.loaderBox}>
                <div style={styles.spinner} />
                <span>Loading pricing rules...</span>
              </div>
            ) : activeTab === 'material' ? (
              <div>
                <h3 style={styles.cardSectionTitle}>Material Product Gallon Costs</h3>
                <p style={styles.cardSectionSub}>Standard base supply costs factored into raw material calculations.</p>

                <div className="drp-grid-collapse" style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.inputLabel}>Deck Stain ($/gallon)</label>
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
                    <label style={styles.inputLabel}>Wood Stripper ($/gallon)</label>
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
                    <label style={styles.inputLabel}>Deck Brightener ($/gallon)</label>
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
                    <label style={styles.inputLabel}>Deck Cleaner ($/gallon)</label>
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
              <div>
                <h3 style={styles.cardSectionTitle}>Labor & Productivity Rates</h3>
                <p style={styles.cardSectionSub}>Crew efficiency rates used to estimate total work hours and prep labor.</p>

                <div className="drp-grid-collapse" style={styles.formGrid}>
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
                    <label style={styles.inputLabel}>Prep Productivity (sq ft/hour)</label>
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
                    <label style={styles.inputLabel}>Staining Productivity (sq ft/hour)</label>
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
                    <label style={styles.inputLabel}>Maintenance Ratio Multiplier</label>
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
              <div>
                <h3 style={styles.cardSectionTitle}>Wood Species & Condition Multipliers</h3>
                <p style={styles.cardSectionSub}>Coefficients applied to base estimates based on complexity and substrate.</p>

                <h4 style={{ margin: '16px 0 8px', fontSize: '14px', color: '#1e293b' }}>Wood Species Multipliers</h4>
                <div className="drp-grid-collapse" style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.inputLabel}>Pressure Treated</label>
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
                    <label style={styles.inputLabel}>Cedar</label>
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
                    <label style={styles.inputLabel}>Redwood</label>
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
                    <label style={styles.inputLabel}>Composite</label>
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

                <h4 style={{ margin: '20px 0 8px', fontSize: '14px', color: '#1e293b' }}>Condition Multipliers</h4>
                <div className="drp-grid-collapse" style={styles.formGrid}>
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
                    <label style={styles.inputLabel}>Fair Condition</label>
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
                    <label style={styles.inputLabel}>Poor / Weathered</label>
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
            ) : (
              <div>
                <h3 style={styles.cardSectionTitle}>Quote Margins & Settings</h3>
                <p style={styles.cardSectionSub}>Markup and margin controls defining quote profitability and safety buffers.</p>

                <div className="drp-grid-collapse" style={styles.formGrid}>
                  <div style={styles.formGroup}>
                    <label style={styles.inputLabel}>Waste Factor (%)</label>
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
                    <label style={styles.inputLabel}>Contractor Markup (%)</label>
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
                    <label style={styles.inputLabel}>Default Profit Margin (%)</label>
                    <input
                      type="number"
                      value={pricing.quoteSettings.defaultMarginPercent}
                      onChange={(e) => setPricing({
                        ...pricing,
                        quoteSettings: { ...pricing.quoteSettings, defaultMarginPercent: Number(e.target.value) },
                      })}
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.inputLabel}>Minimum Job Charge ($)</label>
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
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE SIMULATOR */}
        <div style={styles.rightCol}>
          <div style={styles.simulatorCard}>
            <div style={styles.simHeader}>
              <span style={styles.simBadge}>Live Calculator Test</span>
              <h3 style={styles.simTitle}>Benchmark Deck (400 sq ft)</h3>
            </div>

            <div style={styles.simBody}>
              <div style={styles.simRow}>
                <span>Materials ({stainGals} gal stain + {prepGals} gal prep):</span>
                <strong>${materialCost.toFixed(2)}</strong>
              </div>
              <div style={styles.simRow}>
                <span>Labor ({totalLaborHours.toFixed(1)} hrs @ ${pricing.laborAndProductivity.hourlyLaborRate}/hr):</span>
                <strong>${laborCost.toFixed(2)}</strong>
              </div>
              <div style={styles.simRow}>
                <span>Waste Buffer ({pricing.quoteSettings.wasteFactorPercent}%):</span>
                <strong>${wasteCost.toFixed(2)}</strong>
              </div>
              <div style={styles.simRow}>
                <span>Contractor Markup ({pricing.quoteSettings.contractorMarkupPercent}%):</span>
                <strong>${markupCost.toFixed(2)}</strong>
              </div>

              <div style={styles.simDivider} />

              <div style={styles.simTotalRow}>
                <span>Simulated Total Quote:</span>
                <span style={styles.simTotalVal}>${simulatedTotal.toFixed(2)}</span>
              </div>
              <p style={styles.simHint}>
                Real-time feedback: adjusting any parameter in the editor automatically updates this output.
              </p>
            </div>
          </div>
        </div>
      </div>
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
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  btnPrimary: {
    padding: '8px 20px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertCloseBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    fontWeight: 'bold',
  },
  layoutRow: {
    display: 'flex',
    gap: '24px',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  leftCol: {
    flex: '1 1 min(100%, 540px)',
    minWidth: 0,
  },
  rightCol: {
    flex: '1 1 min(100%, 320px)',
    minWidth: 0,
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '16px',
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
    marginBottom: '-2px',
  },
  tabBtnActive: {
    color: '#1d4ed8',
    borderBottom: '2px solid #1d4ed8',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
  },
  cardSectionTitle: {
    margin: '0 0 4px',
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
  },
  cardSectionSub: {
    margin: '0 0 20px',
    fontSize: '13px',
    color: '#64748b',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  inputLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
  },
  simulatorCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  simHeader: {
    backgroundColor: '#0a1628',
    padding: '20px',
    color: '#ffffff',
  },
  simBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: '#93c5fd',
    marginBottom: '6px',
  },
  simTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '700',
  },
  simBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  simRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#475569',
  },
  simDivider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '8px 0',
  },
  simTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0f172a',
  },
  simTotalVal: {
    fontSize: '22px',
    color: '#1d4ed8',
    fontWeight: '800',
  },
  simHint: {
    margin: '12px 0 0',
    fontSize: '11px',
    color: '#94a3b8',
    lineHeight: 1.4,
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
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

