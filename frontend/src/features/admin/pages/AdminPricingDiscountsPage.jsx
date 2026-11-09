// =============================================
// Deck Estimator — Admin Pricing & Discounts Management Hub
// =============================================
// Replaced & Modernized with 6 Dedicated Tabs:
// - Tab 1: Master Rates & Thresholds (Labor Rate $250/hr, Rate Position 50%, Addon $1/sqft, Min Job $2500/$3000, Travel)
// - Tab 2: Base Rate Card Matrix (12-cell sqft matrix across Clean, Strip, Strip & Sand + 4 Finishes with live preview)
// - Tab 3: Wood Species & Materials (Table of 9 wood species, Multiplier %, Add New, Edit, Delete)
// - Tab 4: Deck Architectural Components (Table of 9 components, Area conversion factors, Add New, Edit, Delete)
// - Tab 5: Restoration Scope & Production (Table of 9 services, Production speeds sqft/hr, Add New, Edit, Delete)
// - Tab 6: Contractor Trade Discounts (Dedicated Separate Tab: Default 10%, Individual Contractor Overrides & History)

import React, { useState, useEffect, useMemo } from 'react';
import { adminApi } from '../api/adminApi';

// The 6 Approved Tabs (<= 6 tabs, contractor discounts on its own separate tab)
const TABS = [
  { id: 'master_rates', label: '1. Master Rates & Thresholds' },
  { id: 'rate_card', label: '2. Base Rate Card Matrix' },
  { id: 'wood_species', label: '3. Wood Species & Materials' },
  { id: 'deck_components', label: '4. Deck Components' },
  { id: 'scope_of_work', label: '5. Scope of Work' },
  { id: 'contractor_discounts', label: '6. Contractor Discounts' },
];

const renderTabIcon = (tabId) => {
  switch (tabId) {
    case 'master_rates':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'rate_card':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case 'wood_species':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L4 14h5v6h6v-6h5L12 2z" />
        </svg>
      );
    case 'deck_components':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
        </svg>
      );
    case 'scope_of_work':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case 'contractor_discounts':
      return (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return null;
  }
};

// Fallback Baseline Defaults from DRP Pricing Engine
const DEFAULT_ENGINE_CONFIG = {
  labourRate: 250,
  ratePosition: 0.5,
  addonPerSqft: 1.0,
  startRate: 2.5,
  travel: { freeMinutes: 45, fee: 200 },
  minJob: { near: 2500, far: 3000 },
  rateCard: {
    clean: {
      sealer: [2.5, 3.0],
      semi: [3.0, 3.5],
      semi_solid: [3.25, 3.75],
      solid: [3.5, 4.0],
    },
    strip: {
      sealer: [3.0, 3.5],
      semi: [3.5, 4.0],
      semi_solid: [4.25, 5.0],
      solid: [5.0, 6.0],
    },
    strip_sand: {
      sealer: [3.5, 4.5],
      semi: [4.0, 4.5],
      semi_solid: [4.75, 5.5],
      solid: [5.5, 6.5],
    },
  },
  wood: {
    pt_pine: { label: 'Pressure-treated pine', pct: 0, allowed: 'All Services' },
    cedar: { label: 'Western Red Cedar', pct: 0.10, allowed: 'All Services' },
    redwood: { label: 'California Redwood', pct: 0.15, allowed: 'All Services' },
    mahogany: { label: 'Genuine Mahogany', pct: 0.20, allowed: 'All Services' },
    meranti: { label: 'Meranti Mahogany', pct: 0.20, allowed: 'All Services' },
    tigerwood: { label: 'Exotic Tigerwood', pct: 0.30, allowed: 'All Services' },
    teak: { label: 'Burmese Teak', pct: 0.35, allowed: 'All Services' },
    ipe: { label: 'Brazilian Ipe (Ironwood)', pct: 0.35, allowed: 'All Services' },
    composite: { label: 'Composite / Trex', pct: -0.55, allowed: 'Cleaning & Wash Only' },
  },
  areas: {
    flooring: { label: 'Flooring Platform', unit: 'Length × Width (ft)', factor: 1.0, desc: 'Primary walkable deck surface' },
    railings: { label: 'Perimeter Railings', unit: 'Linear Feet (LF)', factor: 4.0, desc: 'Pickets, top cap, and balusters' },
    stairs: { label: 'Stairs & Steps', unit: 'Step Count', factor: 12.0, desc: 'Treads, risers, and stringers' },
    pergola: { label: 'Pergola Overhead', unit: 'Linear Feet (LF)', factor: 1.5, desc: 'Upper rafters and cross-beams' },
    privacy_wall: { label: 'Privacy Wall / Lattice', unit: 'Linear Feet (LF)', factor: 2.0, desc: 'Two-sided vertical privacy screening' },
    fascia: { label: 'Fascia Banding Boards', unit: 'Linear Feet (LF)', factor: 1.5, desc: 'Perimeter rim joist cladding' },
    posts: { label: 'Support Posts', unit: 'Post Count', factor: 6.0, desc: '4-sided vertical support posts' },
    joists: { label: 'Substructure Joists', unit: '% of Floor Area', factor: 0.40, desc: 'Under-deck joist framing wash' },
    siding: { label: 'House Siding Flashing', unit: 'Direct Sq Ft', factor: 1.0, desc: 'Protective siding perimeter' },
  },
  production: {
    cleaning: { label: 'Deck Cleaning / Pressure Washing', speed: 100, category: 'Preparation' },
    wood_brightening: { label: 'Wood Brightening & Neutralizing', speed: 100, category: 'Conditioning' },
    stain_stripping: { label: 'Chemical Stain Stripping', speed: 50, category: 'Stripping' },
    paint_removal: { label: 'Heavy Paint Removal', speed: 40, category: 'Stripping' },
    mechanical_sanding: { label: 'Mechanical Floor & Railing Sanding', speed: 60, category: 'Sanding' },
    detail_sanding: { label: 'Detail & Edge Sanding', speed: 90, category: 'Sanding' },
    staining: { label: 'Staining & Conditioning', speed: 100, category: 'Finishing' },
    sealing: { label: 'Clear Protective Sealing', speed: 100, category: 'Finishing' },
    waterproofing: { label: 'Deep Penetrating Waterproofing', speed: 100, category: 'Finishing' },
  },
};

export default function AdminPricingDiscountsPage() {
  const [activeTab, setActiveTab] = useState('master_rates');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Core Engine Config State
  const [engineConfig, setEngineConfig] = useState(DEFAULT_ENGINE_CONFIG);

  // Contractor Discounts State
  const [discountData, setDiscountData] = useState(null);
  const [defaultDiscountVal, setDefaultDiscountVal] = useState(10);
  const [defaultReason, setDefaultReason] = useState('');
  const [savingDefaultDiscount, setSavingDefaultDiscount] = useState(false);

  // Contractor Override Modal State
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [contractorCustomDiscount, setContractorCustomDiscount] = useState(10);
  const [overrideReason, setOverrideReason] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);

  // Modals for Dynamic Add / Edit
  const [woodModal, setWoodModal] = useState({ open: false, isEdit: false, key: '', label: '', pct: 0, allowed: 'All Services' });
  const [componentModal, setComponentModal] = useState({ open: false, isEdit: false, key: '', label: '', unit: '', factor: 1.0, desc: '' });
  const [serviceModal, setServiceModal] = useState({ open: false, isEdit: false, key: '', label: '', speed: 100, category: 'Preparation' });

  // Search/Filter queries for dynamic tables
  const [woodSearch, setWoodSearch] = useState('');
  const [componentSearch, setComponentSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  // Initial Data Load
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
        const rp = pricingRes.data.restorationPricing;
        if (rp && typeof rp === 'object') {
          setEngineConfig({
            ...DEFAULT_ENGINE_CONFIG,
            ...rp,
            travel: { ...DEFAULT_ENGINE_CONFIG.travel, ...(rp.travel || {}) },
            minJob: { ...DEFAULT_ENGINE_CONFIG.minJob, ...(rp.minJob || {}) },
            rateCard: {
              clean: { ...DEFAULT_ENGINE_CONFIG.rateCard.clean, ...(rp.rateCard?.clean || {}) },
              strip: { ...DEFAULT_ENGINE_CONFIG.rateCard.strip, ...(rp.rateCard?.strip || {}) },
              strip_sand: { ...DEFAULT_ENGINE_CONFIG.rateCard.strip_sand, ...(rp.rateCard?.strip_sand || {}) },
            },
            wood: { ...DEFAULT_ENGINE_CONFIG.wood, ...(rp.wood || {}) },
            areas: { ...DEFAULT_ENGINE_CONFIG.areas, ...(rp.areas || {}) },
            production: { ...DEFAULT_ENGINE_CONFIG.production, ...(rp.production || {}) },
          });
        }
      }

      if (discountRes?.data) {
        setDiscountData(discountRes.data);
        if (discountRes.data.defaultDiscount !== undefined) {
          setDefaultDiscountVal(discountRes.data.defaultDiscount);
        }
      }
    } catch (err) {
      setError(err?.message || 'Could not load pricing and discount data.');
    } finally {
      setLoading(false);
    }
  };

  // Save Engine Configuration (Tabs 1 through 5)
  const handleSaveEngineConfig = async (overrideData = null) => {
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    const dataToSave = overrideData || engineConfig;
    try {
      await adminApi.updatePricingConfig({
        restorationPricing: dataToSave,
        laborRate: dataToSave.labourRate,
        minimumJobPrice: dataToSave.minJob?.near || 2500,
      });
      setEngineConfig(dataToSave);
      setSuccessMsg('Estimator pricing configuration successfully saved to MongoDB and synchronized live!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err?.message || 'Failed to save pricing configuration.');
    } finally {
      setSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Tab 1 Handlers: Master Rates & Thresholds
  // --------------------------------------------------------------------------
  const handleMasterChange = (field, value) => {
    setEngineConfig((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  const handleMinJobChange = (key, value) => {
    setEngineConfig((prev) => ({
      ...prev,
      minJob: {
        ...prev.minJob,
        [key]: Number(value),
      },
    }));
  };

  const handleTravelChange = (key, value) => {
    setEngineConfig((prev) => ({
      ...prev,
      travel: {
        ...prev.travel,
        [key]: Number(value),
      },
    }));
  };

  // --------------------------------------------------------------------------
  // Tab 2 Handlers: Rate Card Matrix
  // --------------------------------------------------------------------------
  const handleRateCardCellChange = (tier, finish, index, value) => {
    setEngineConfig((prev) => {
      const currentRange = prev.rateCard[tier]?.[finish] || [3.0, 3.5];
      const updatedRange = [...currentRange];
      updatedRange[index] = Number(value);
      return {
        ...prev,
        rateCard: {
          ...prev.rateCard,
          [tier]: {
            ...prev.rateCard[tier],
            [finish]: updatedRange,
          },
        },
      };
    });
  };

  // --------------------------------------------------------------------------
  // Tab 3 Handlers: Wood Species & Materials (Add / Edit / Delete)
  // --------------------------------------------------------------------------
  const handleSaveWoodSpecies = () => {
    const rawKey = woodModal.key.trim().toLowerCase().replace(/[\s\/-]+/g, '_');
    if (!rawKey || !woodModal.label.trim()) {
      alert('Please provide a valid species key and label.');
      return;
    }
    const updatedWood = {
      ...engineConfig.wood,
      [rawKey]: {
        label: woodModal.label.trim(),
        pct: Number(woodModal.pct) / 100,
        allowed: woodModal.allowed || 'All Services',
      },
    };
    const updated = { ...engineConfig, wood: updatedWood };
    setWoodModal({ open: false, isEdit: false, key: '', label: '', pct: 0, allowed: 'All Services' });
    handleSaveEngineConfig(updated);
  };

  const handleDeleteWoodSpecies = (key) => {
    if (!window.confirm(`Are you sure you want to delete wood species "${engineConfig.wood[key]?.label || key}"?`)) return;
    const updatedWood = { ...engineConfig, wood: updatedWood };
    delete updatedWood[key];
    const updated = { ...engineConfig, wood: updatedWood };
    handleSaveEngineConfig(updated);
  };

  // --------------------------------------------------------------------------
  // Tab 4 Handlers: Deck Components (Add / Edit / Delete)
  // --------------------------------------------------------------------------
  const handleSaveComponent = () => {
    const rawKey = componentModal.key.trim().toLowerCase().replace(/[\s\/-]+/g, '_');
    if (!rawKey || !componentModal.label.trim()) {
      alert('Please provide a valid component key and title.');
      return;
    }
    const updatedAreas = {
      ...engineConfig.areas,
      [rawKey]: {
        label: componentModal.label.trim(),
        unit: componentModal.unit || 'Linear Feet (LF)',
        factor: Number(componentModal.factor),
        desc: componentModal.desc || 'Architectural deck component',
      },
    };
    const updated = { ...engineConfig, areas: updatedAreas };
    setComponentModal({ open: false, isEdit: false, key: '', label: '', unit: '', factor: 1.0, desc: '' });
    handleSaveEngineConfig(updated);
  };

  const handleDeleteComponent = (key) => {
    if (!window.confirm(`Are you sure you want to delete deck component "${engineConfig.areas[key]?.label || key}"?`)) return;
    const updatedAreas = { ...engineConfig.areas };
    delete updatedAreas[key];
    const updated = { ...engineConfig, areas: updatedAreas };
    handleSaveEngineConfig(updated);
  };

  // --------------------------------------------------------------------------
  // Tab 5 Handlers: Scope of Work / Production Speeds (Add / Edit / Delete)
  // --------------------------------------------------------------------------
  const handleSaveService = () => {
    const rawKey = serviceModal.key.trim().toLowerCase().replace(/[\s\/-]+/g, '_');
    if (!rawKey || !serviceModal.label.trim()) {
      alert('Please provide a valid service key and name.');
      return;
    }
    const updatedProd = {
      ...engineConfig.production,
      [rawKey]: {
        label: serviceModal.label.trim(),
        speed: Number(serviceModal.speed),
        category: serviceModal.category || 'Preparation',
      },
    };
    const updated = { ...engineConfig, production: updatedProd };
    setServiceModal({ open: false, isEdit: false, key: '', label: '', speed: 100, category: 'Preparation' });
    handleSaveEngineConfig(updated);
  };

  const handleDeleteService = (key) => {
    if (!window.confirm(`Are you sure you want to delete restoration service "${engineConfig.production[key]?.label || key}"?`)) return;
    const updatedProd = { ...engineConfig.production };
    delete updatedProd[key];
    const updated = { ...engineConfig, production: updatedProd };
    handleSaveEngineConfig(updated);
  };

  // --------------------------------------------------------------------------
  // Tab 6 Handlers: Contractor Trade Discounts (Dedicated Separate Tab)
  // --------------------------------------------------------------------------
  const handleSaveDefaultDiscount = async () => {
    setSavingDefaultDiscount(true);
    setError(null);
    try {
      await adminApi.updateDefaultDiscount(Number(defaultDiscountVal), defaultReason || 'Admin updated wholesale partner rate');
      setSuccessMsg(`Default contractor trade discount updated to ${defaultDiscountVal}%.`);
      setTimeout(() => setSuccessMsg(null), 4000);
      loadAllData();
    } catch (err) {
      setError(err?.message || 'Failed to update default contractor discount.');
    } finally {
      setSavingDefaultDiscount(false);
    }
  };

  const handleSaveContractorOverride = async () => {
    if (!selectedContractor) return;
    setSavingOverride(true);
    setError(null);
    try {
      await adminApi.setContractorDiscount(
        selectedContractor._id || selectedContractor.id,
        Number(contractorCustomDiscount),
        overrideReason || `Custom tier applied for ${selectedContractor.fullName}`
      );
      setSuccessMsg(`Custom discount set to ${contractorCustomDiscount}% for ${selectedContractor.fullName}.`);
      setSelectedContractor(null);
      setTimeout(() => setSuccessMsg(null), 4000);
      loadAllData();
    } catch (err) {
      setError(err?.message || 'Failed to update contractor custom discount.');
    } finally {
      setSavingOverride(false);
    }
  };

  // Filtered Lists for Dynamic Search
  const filteredWood = useMemo(() => {
    return Object.entries(engineConfig.wood || {}).filter(([key, item]) => {
      const q = woodSearch.toLowerCase();
      return key.toLowerCase().includes(q) || (item.label && item.label.toLowerCase().includes(q));
    });
  }, [engineConfig.wood, woodSearch]);

  const filteredComponents = useMemo(() => {
    return Object.entries(engineConfig.areas || {}).filter(([key, item]) => {
      const q = componentSearch.toLowerCase();
      return key.toLowerCase().includes(q) || (item.label && item.label.toLowerCase().includes(q));
    });
  }, [engineConfig.areas, componentSearch]);

  const filteredServices = useMemo(() => {
    return Object.entries(engineConfig.production || {}).filter(([key, item]) => {
      const q = serviceSearch.toLowerCase();
      return key.toLowerCase().includes(q) || (item.label && item.label.toLowerCase().includes(q));
    });
  }, [engineConfig.production, serviceSearch]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '16px', color: '#0F2C59', fontWeight: '700' }}>
          Loading Estimator Pricing & Configuration Engine...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.pageContainer}>
      {/* HEADER SECTION */}
      <div style={styles.headerBanner}>
        <div>
          <span style={styles.headerTag}>Deck Restoration Plus • Central Administration</span>
          <h1 style={styles.pageTitle}>Estimator Pricing & Options Tuning Engine</h1>
          <p style={styles.pageSubtitle}>
            Configure base rate cards, hourly labor rates, mobilization floors, dynamic wood species, architectural components, and contractor trade discounts.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => handleSaveEngineConfig()}
            disabled={saving}
            style={styles.primarySaveBtn}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {saving ? 'Saving to Database...' : 'Save & Publish Pricing'}
          </button>
        </div>
      </div>

      {/* FEEDBACK ALERTS */}
      {successMsg && (
        <div style={styles.successAlert}>
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div style={styles.errorAlert}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* HORIZONTAL TAB BAR (6 TABS MAXIMUM) */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={isActive ? styles.activeTabBtn : styles.tabBtn}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>{renderTabIcon(tab.id)}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: MASTER RATES & THRESHOLDS */}
      {/* ==================================================================== */}
      {activeTab === 'master_rates' && (
        <div style={styles.tabContentCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Master Labor Rate & Mobilization Thresholds</h2>
              <p style={styles.sectionDesc}>
                Universal macro-pricing levers that directly control labor adjustments, multi-coat surcharges, and crew dispatch minimums.
              </p>
            </div>
          </div>

          <div style={styles.formGrid}>
            {/* Master Labor Rate */}
            <div style={styles.formCard}>
              <div style={styles.cardHeaderRow}>
                <span style={styles.cardIcon}>⏱️</span>
                <strong style={styles.cardTitle}>Master Technician Hourly Labor Rate</strong>
              </div>
              <p style={styles.cardHelp}>
                Multiplier for all additive labor hours (H_wood + H_access). Current baseline is $250.00/hr.
              </p>
              <div style={styles.inputPrefixWrap}>
                <span style={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  min="50"
                  max="1000"
                  step="5"
                  value={engineConfig.labourRate || 250}
                  onChange={(e) => handleMasterChange('labourRate', e.target.value)}
                  style={styles.numericInput}
                />
                <span style={styles.inputSuffix}>/ man-hour</span>
              </div>
            </div>

            {/* Rate Position Interpolator */}
            <div style={styles.formCard}>
              <div style={styles.cardHeaderRow}>
                <span style={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="21" x2="4" y2="14" />
                    <line x1="4" y1="10" x2="4" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12" y2="3" />
                    <line x1="20" y1="21" x2="20" y2="16" />
                    <line x1="20" y1="12" x2="20" y2="3" />
                    <line x1="1" y1="14" x2="7" y2="14" />
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="17" y1="16" x2="23" y2="16" />
                  </svg>
                </span>
                <strong style={styles.cardTitle}>Rate Position (Midpoint % Interpolator)</strong>
              </div>
              <p style={styles.cardHelp}>
                Controls position between Rate Card [Low, High]. 0.50 = exact 50% midpoint. Raising this slides quotes toward high quartile.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={engineConfig.ratePosition !== undefined ? engineConfig.ratePosition : 0.5}
                  onChange={(e) => handleMasterChange('ratePosition', e.target.value)}
                  style={{ flex: 1, accentColor: '#034EA2' }}
                />
                <span style={styles.badgePill}>
                  {Math.round((engineConfig.ratePosition !== undefined ? engineConfig.ratePosition : 0.5) * 100)}%
                </span>
              </div>
            </div>

            {/* Stacked Finish Addon */}
            <div style={styles.formCard}>
              <div style={styles.cardHeaderRow}>
                <span style={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2z" />
                  </svg>
                </span>
                <strong style={styles.cardTitle}>Stacked-Finish Surcharge ($/sq ft)</strong>
              </div>
              <p style={styles.cardHelp}>
                Billed for every additional finish requested beyond the first (e.g. Staining + Clear Sealer + Waterproofing).
              </p>
              <div style={styles.inputPrefixWrap}>
                <span style={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.25"
                  value={engineConfig.addonPerSqft || 1.0}
                  onChange={(e) => handleMasterChange('addonPerSqft', e.target.value)}
                  style={styles.numericInput}
                />
                <span style={styles.inputSuffix}>/ sq ft per extra coat</span>
              </div>
            </div>

            {/* Minimum Job Floor (Near) */}
            <div style={styles.formCard}>
              <div style={styles.cardHeaderRow}>
                <span style={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </span>
                <strong style={styles.cardTitle}>Minimum Mobilization Price (Near Distance)</strong>
              </div>
              <p style={styles.cardHelp}>
                Standard minimum job floor for local dispatches (&le; 45 minutes travel). Can be applied by user via checkbox.
              </p>
              <div style={styles.inputPrefixWrap}>
                <span style={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  min="500"
                  max="10000"
                  step="50"
                  value={engineConfig.minJob?.near || 2500}
                  onChange={(e) => handleMinJobChange('near', e.target.value)}
                  style={styles.numericInput}
                />
              </div>
            </div>

            {/* Minimum Job Floor (Far) */}
            <div style={styles.formCard}>
              <div style={styles.cardHeaderRow}>
                <span style={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <strong style={styles.cardTitle}>Minimum Mobilization Price (Far Distance)</strong>
              </div>
              <p style={styles.cardHelp}>
                Minimum mobilization threshold for extended customer dispatches (&gt; 45 minutes travel distance).
              </p>
              <div style={styles.inputPrefixWrap}>
                <span style={styles.inputPrefix}>$</span>
                <input
                  type="number"
                  min="500"
                  max="15000"
                  step="50"
                  value={engineConfig.minJob?.far || 3000}
                  onChange={(e) => handleMinJobChange('far', e.target.value)}
                  style={styles.numericInput}
                />
              </div>
            </div>

            {/* Travel Radius & Fee */}
            <div style={styles.formCard}>
              <div style={styles.cardHeaderRow}>
                <span style={styles.cardIcon}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#034EA2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
                  </svg>
                </span>
                <strong style={styles.cardTitle}>Travel Radius & Surcharge</strong>
              </div>
              <p style={styles.cardHelp}>
                Distance threshold in minutes and flat mobilization fee charged when distance exceeds free radius.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '2px' }}>Free Travel:</span>
                  <input
                    type="number"
                    min="0"
                    max="180"
                    value={engineConfig.travel?.freeMinutes || 45}
                    onChange={(e) => handleTravelChange('freeMinutes', e.target.value)}
                    style={styles.numericInputSmall}
                  />
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>minutes</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginBottom: '2px' }}>Travel Fee:</span>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    step="25"
                    value={engineConfig.travel?.fee || 200}
                    onChange={(e) => handleTravelChange('fee', e.target.value)}
                    style={styles.numericInputSmall}
                  />
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>dollars</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: BASE RATE CARD MATRIX */}
      {/* ==================================================================== */}
      {activeTab === 'rate_card' && (
        <div style={styles.tabContentCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Base Rate Card Grid ($/sq ft)</h2>
              <p style={styles.sectionDesc}>
                Edit low and high square foot rates for each chemical preparation tier across all finish coatings.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Current Active Interpolator: </span>
              <strong style={{ color: '#034EA2' }}>
                {Math.round((engineConfig.ratePosition !== undefined ? engineConfig.ratePosition : 0.5) * 100)}% Midpoint
              </strong>
            </div>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '16px' }}>
            <table style={styles.matrixTable}>
              <thead>
                <tr>
                  <th style={styles.matrixTh}>Preparation Scope</th>
                  <th style={styles.matrixTh}>Clear Sealer ($/sq ft)</th>
                  <th style={styles.matrixTh}>Semi-Transparent ($/sq ft)</th>
                  <th style={styles.matrixTh}>Semi-Solid Stain ($/sq ft)</th>
                  <th style={styles.matrixTh}>Solid Color ($/sq ft)</th>
                </tr>
              </thead>
              <tbody>
                {/* Clean Row */}
                <tr>
                  <td style={styles.matrixRowHeader}>
                    <strong>Deck Cleaning & Wash</strong>
                    <span style={styles.matrixSubtext}>Standard wash & pH neutralize</span>
                  </td>
                  {['sealer', 'semi', 'semi_solid', 'solid'].map((finish) => {
                    const range = engineConfig.rateCard?.clean?.[finish] || [2.5, 3.0];
                    const pos = engineConfig.ratePosition !== undefined ? engineConfig.ratePosition : 0.5;
                    const liveRate = range[0] + (range[1] - range[0]) * pos;
                    return (
                      <td key={finish} style={styles.matrixCell}>
                        <div style={styles.cellRangeInputs}>
                          <input
                            type="number"
                            step="0.25"
                            value={range[0]}
                            onChange={(e) => handleRateCardCellChange('clean', finish, 0, e.target.value)}
                            style={styles.cellInput}
                            title="Low Rate"
                          />
                          <span style={{ color: '#94A3B8' }}>–</span>
                          <input
                            type="number"
                            step="0.25"
                            value={range[1]}
                            onChange={(e) => handleRateCardCellChange('clean', finish, 1, e.target.value)}
                            style={styles.cellInput}
                            title="High Rate"
                          />
                        </div>
                        <span style={styles.cellLiveRate}>Live: ${liveRate.toFixed(2)}/sf</span>
                      </td>
                    );
                  })}
                </tr>

                {/* Strip Row */}
                <tr>
                  <td style={styles.matrixRowHeader}>
                    <strong>Chemical Stain Stripping</strong>
                    <span style={styles.matrixSubtext}>Caustic chemical coating strip</span>
                  </td>
                  {['sealer', 'semi', 'semi_solid', 'solid'].map((finish) => {
                    const range = engineConfig.rateCard?.strip?.[finish] || [3.0, 3.5];
                    const pos = engineConfig.ratePosition !== undefined ? engineConfig.ratePosition : 0.5;
                    const liveRate = range[0] + (range[1] - range[0]) * pos;
                    return (
                      <td key={finish} style={styles.matrixCell}>
                        <div style={styles.cellRangeInputs}>
                          <input
                            type="number"
                            step="0.25"
                            value={range[0]}
                            onChange={(e) => handleRateCardCellChange('strip', finish, 0, e.target.value)}
                            style={styles.cellInput}
                            title="Low Rate"
                          />
                          <span style={{ color: '#94A3B8' }}>–</span>
                          <input
                            type="number"
                            step="0.25"
                            value={range[1]}
                            onChange={(e) => handleRateCardCellChange('strip', finish, 1, e.target.value)}
                            style={styles.cellInput}
                            title="High Rate"
                          />
                        </div>
                        <span style={styles.cellLiveRate}>Live: ${liveRate.toFixed(2)}/sf</span>
                      </td>
                    );
                  })}
                </tr>

                {/* Strip + Sand Row */}
                <tr>
                  <td style={styles.matrixRowHeader}>
                    <strong>Stripping + Mechanical Sanding</strong>
                    <span style={styles.matrixSubtext}>Heavy dual chemical + rotary sand</span>
                  </td>
                  {['sealer', 'semi', 'semi_solid', 'solid'].map((finish) => {
                    const range = engineConfig.rateCard?.strip_sand?.[finish] || [3.5, 4.5];
                    const pos = engineConfig.ratePosition !== undefined ? engineConfig.ratePosition : 0.5;
                    const liveRate = range[0] + (range[1] - range[0]) * pos;
                    return (
                      <td key={finish} style={styles.matrixCell}>
                        <div style={styles.cellRangeInputs}>
                          <input
                            type="number"
                            step="0.25"
                            value={range[0]}
                            onChange={(e) => handleRateCardCellChange('strip_sand', finish, 0, e.target.value)}
                            style={styles.cellInput}
                            title="Low Rate"
                          />
                          <span style={{ color: '#94A3B8' }}>–</span>
                          <input
                            type="number"
                            step="0.25"
                            value={range[1]}
                            onChange={(e) => handleRateCardCellChange('strip_sand', finish, 1, e.target.value)}
                            style={styles.cellInput}
                            title="High Rate"
                          />
                        </div>
                        <span style={styles.cellLiveRate}>Live: ${liveRate.toFixed(2)}/sf</span>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: WOOD SPECIES & MATERIALS (DYNAMIC ADD / EDIT / DELETE) */}
      {/* ==================================================================== */}
      {activeTab === 'wood_species' && (
        <div style={styles.tabContentCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Wood Species & Material Difficulty Multipliers</h2>
              <p style={styles.sectionDesc}>
                Manage active wood types presented in customer/contractor questionnaires and configure labor difficulty percentages.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search wood species..."
                value={woodSearch}
                onChange={(e) => setWoodSearch(e.target.value)}
                style={styles.searchInput}
              />
              <button
                onClick={() => setWoodModal({ open: true, isEdit: false, key: '', label: '', pct: 10, allowed: 'All Services' })}
                style={styles.addItemBtn}
              >
                + Add Wood Species
              </button>
            </div>
          </div>

          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.tableTh}>Internal Key</th>
                <th style={styles.tableTh}>Display Label</th>
                <th style={styles.tableTh}>Labor Difficulty Multiplier</th>
                <th style={styles.tableTh}>Service Restrictions</th>
                <th style={{ ...styles.tableTh, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWood.map(([key, item]) => {
                const pctVal = Math.round((item.pct || 0) * 100);
                const isPositive = pctVal > 0;
                const isNegative = pctVal < 0;
                return (
                  <tr key={key} style={styles.tableRow}>
                    <td style={styles.tableTd}>
                      <code style={styles.codeBadge}>{key}</code>
                    </td>
                    <td style={styles.tableTd}>
                      <strong>{item.label}</strong>
                    </td>
                    <td style={styles.tableTd}>
                      <span
                        style={{
                          ...styles.difficultyBadge,
                          backgroundColor: isPositive ? '#FEF2F2' : isNegative ? '#EFF6FF' : '#F8FAFC',
                          color: isPositive ? '#B91C1C' : isNegative ? '#034EA2' : '#475569',
                          borderColor: isPositive ? '#FECACA' : isNegative ? '#BFDBFE' : '#E2E8F0',
                        }}
                      >
                        {isPositive ? `+${pctVal}% Labor Surcharge` : isNegative ? `${pctVal}% Labor Discount` : '0% Baseline Pine'}
                      </span>
                    </td>
                    <td style={styles.tableTd}>
                      <span style={{ fontSize: '12px', color: '#475569' }}>
                        {item.allowed || (key === 'composite' || key === 'trex' ? 'Cleaning Only' : 'All Services')}
                      </span>
                    </td>
                    <td style={{ ...styles.tableTd, textAlign: 'right' }}>
                      <button
                        onClick={() =>
                          setWoodModal({
                            open: true,
                            isEdit: true,
                            key,
                            label: item.label,
                            pct: Math.round((item.pct || 0) * 100),
                            allowed: item.allowed || 'All Services',
                          })
                        }
                        style={styles.editActionBtn}
                        title="Edit Species"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWoodSpecies(key)}
                        style={styles.deleteActionBtn}
                        title="Delete Species"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 4: DECK ARCHITECTURAL COMPONENTS (DYNAMIC ADD / EDIT / DELETE) */}
      {/* ==================================================================== */}
      {activeTab === 'deck_components' && (
        <div style={styles.tabContentCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Deck Architectural Components & Surface Area Multipliers</h2>
              <p style={styles.sectionDesc}>
                Manage components customers can add and calibrate how dimensions or counts convert to billable square feet ($A$).
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search components..."
                value={componentSearch}
                onChange={(e) => setComponentSearch(e.target.value)}
                style={styles.searchInput}
              />
              <button
                onClick={() => setComponentModal({ open: true, isEdit: false, key: '', label: '', unit: 'Linear Feet (LF)', factor: 2.0, desc: '' })}
                style={styles.addItemBtn}
              >
                + Add Deck Component
              </button>
            </div>
          </div>

          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.tableTh}>Component Key</th>
                <th style={styles.tableTh}>Architectural Feature</th>
                <th style={styles.tableTh}>Measurement Unit</th>
                <th style={styles.tableTh}>Area Conversion Multiplier</th>
                <th style={styles.tableTh}>Formula Description</th>
                <th style={{ ...styles.tableTh, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComponents.map(([key, item]) => {
                return (
                  <tr key={key} style={styles.tableRow}>
                    <td style={styles.tableTd}>
                      <code style={styles.codeBadge}>{key}</code>
                    </td>
                    <td style={styles.tableTd}>
                      <strong>{item.label}</strong>
                    </td>
                    <td style={styles.tableTd}>
                      <span style={{ fontSize: '12px', color: '#475569' }}>{item.unit}</span>
                    </td>
                    <td style={styles.tableTd}>
                      <strong style={{ color: '#034EA2', fontSize: '14px' }}>
                        {item.factor} {item.unit?.includes('%') ? 'of floor' : 'sq ft / unit'}
                      </strong>
                    </td>
                    <td style={styles.tableTd}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>{item.desc || 'Standard component calculation'}</span>
                    </td>
                    <td style={{ ...styles.tableTd, textAlign: 'right' }}>
                      <button
                        onClick={() =>
                          setComponentModal({
                            open: true,
                            isEdit: true,
                            key,
                            label: item.label,
                            unit: item.unit,
                            factor: item.factor,
                            desc: item.desc,
                          })
                        }
                        style={styles.editActionBtn}
                        title="Edit Multiplier"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComponent(key)}
                        style={styles.deleteActionBtn}
                        title="Delete Component"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: RESTORATION SCOPE & PRODUCTION (DYNAMIC ADD / EDIT / DELETE) */}
      {/* ==================================================================== */}
      {activeTab === 'scope_of_work' && (
        <div style={styles.tabContentCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Restoration Scope & Production Speeds</h2>
              <p style={styles.sectionDesc}>
                Manage active restoration services and technician production rates. Lowering production speeds increases billable labor hours.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Search services..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                style={styles.searchInput}
              />
              <button
                onClick={() => setServiceModal({ open: true, isEdit: false, key: '', label: '', speed: 80, category: 'Preparation' })}
                style={styles.addItemBtn}
              >
                + Add Restoration Service
              </button>
            </div>
          </div>

          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.tableTh}>Service Key</th>
                <th style={styles.tableTh}>Service Name</th>
                <th style={styles.tableTh}>Category</th>
                <th style={styles.tableTh}>Production Rate (sq ft / man-hour)</th>
                <th style={styles.tableTh}>Estimated Time for 500 sq ft</th>
                <th style={{ ...styles.tableTh, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map(([key, item]) => {
                const hours500 = (500 / (item.speed || 100)).toFixed(1);
                return (
                  <tr key={key} style={styles.tableRow}>
                    <td style={styles.tableTd}>
                      <code style={styles.codeBadge}>{key}</code>
                    </td>
                    <td style={styles.tableTd}>
                      <strong>{item.label}</strong>
                    </td>
                    <td style={styles.tableTd}>
                      <span style={styles.categoryPill}>{item.category || 'Preparation'}</span>
                    </td>
                    <td style={styles.tableTd}>
                      <strong style={{ color: '#0F2C59', fontSize: '14px' }}>
                        {item.speed} sq ft / hr
                      </strong>
                    </td>
                    <td style={styles.tableTd}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>~{hours500} man-hours</span>
                    </td>
                    <td style={{ ...styles.tableTd, textAlign: 'right' }}>
                      <button
                        onClick={() =>
                          setServiceModal({
                            open: true,
                            isEdit: true,
                            key,
                            label: item.label,
                            speed: item.speed,
                            category: item.category || 'Preparation',
                          })
                        }
                        style={styles.editActionBtn}
                        title="Edit Production Speed"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(key)}
                        style={styles.deleteActionBtn}
                        title="Delete Service"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 6: CONTRACTOR TRADE DISCOUNTS (DEDICATED SEPARATE TAB) */}
      {/* ==================================================================== */}
      {activeTab === 'contractor_discounts' && (
        <div style={styles.tabContentCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Contractor Partner Trade Discounts & Overrides</h2>
              <p style={styles.sectionDesc}>
                Manage platform wholesale discount policies for certified contractors, including tier adjustments and individual contractor incentives.
              </p>
            </div>
          </div>

          {/* Default Wholesale Discount Card */}
          <div style={styles.discountHighlightBox}>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: '#15803D' }}>
                Active Platform Default Policy
              </span>
              <h3 style={{ margin: '4px 0', fontSize: '20px', color: '#065F46' }}>
                Standard Wholesale Trade Tier ({defaultDiscountVal}%)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#047857' }}>
                Automatically applied on contractor quote cards in the Contractor Portal unless customized below.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={styles.inputPrefixWrap}>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={defaultDiscountVal}
                  onChange={(e) => setDefaultDiscountVal(e.target.value)}
                  style={{ ...styles.numericInput, width: '80px', color: '#15803D', fontWeight: '900' }}
                />
                <span style={styles.inputSuffix}>%</span>
              </div>
              <button
                onClick={handleSaveDefaultDiscount}
                disabled={savingDefaultDiscount}
                style={styles.secondarySaveBtn}
              >
                {savingDefaultDiscount ? 'Saving...' : 'Update Default %'}
              </button>
            </div>
          </div>

          {/* Individual Contractor Directory with Custom Overrides */}
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F2C59', marginTop: '28px', marginBottom: '12px' }}>
            Registered Contractors & Custom Overrides ({discountData?.contractors?.length || 0})
          </h3>

          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.tableTh}>Contractor Name & Company</th>
                <th style={styles.tableTh}>Email Address</th>
                <th style={styles.tableTh}>Verification Tier</th>
                <th style={styles.tableTh}>Completed Projects</th>
                <th style={styles.tableTh}>Effective Trade Discount</th>
                <th style={{ ...styles.tableTh, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(discountData?.contractors || []).map((contractor) => {
                const effective = contractor.customDiscount !== undefined ? contractor.customDiscount : defaultDiscountVal;
                const hasCustom = contractor.customDiscount !== undefined;
                return (
                  <tr key={contractor._id || contractor.id} style={styles.tableRow}>
                    <td style={styles.tableTd}>
                      <strong>{contractor.fullName}</strong>
                      <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>
                        {contractor.businessName || 'Independent Pro'}
                      </span>
                    </td>
                    <td style={styles.tableTd}>
                      <span style={{ fontSize: '13px', color: '#334155' }}>{contractor.email}</span>
                    </td>
                    <td style={styles.tableTd}>
                      <span style={styles.verifiedTierPill}>
                        ✓ {contractor.verificationStatus || 'APPROVED'}
                      </span>
                    </td>
                    <td style={styles.tableTd}>
                      <strong style={{ color: '#034EA2' }}>{contractor.completedJobsCount || 0} jobs</strong>
                    </td>
                    <td style={styles.tableTd}>
                      <span
                        style={{
                          ...styles.discountRatePill,
                          backgroundColor: hasCustom ? '#FEF3C7' : '#DCFCE7',
                          color: hasCustom ? '#92400E' : '#15803D',
                          borderColor: hasCustom ? '#FCD34D' : '#86EFAC',
                        }}
                      >
                        {effective}% {hasCustom ? '(Custom Override)' : '(Default Platform)'}
                      </span>
                    </td>
                    <td style={{ ...styles.tableTd, textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          setSelectedContractor(contractor);
                          setContractorCustomDiscount(effective);
                          setOverrideReason('');
                        }}
                        style={styles.editActionBtn}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}>
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                        Set Custom %
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT WOOD SPECIES */}
      {/* ==================================================================== */}
      {woodModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>
              {woodModal.isEdit ? 'Edit Wood Species' : 'Add New Wood Species'}
            </h3>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Species Key (Internal ID, lowercase without spaces):</label>
              <input
                type="text"
                value={woodModal.key}
                disabled={woodModal.isEdit}
                onChange={(e) => setWoodModal((prev) => ({ ...prev, key: e.target.value }))}
                placeholder="e.g. bamboo, cumaru"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Display Label:</label>
              <input
                type="text"
                value={woodModal.label}
                onChange={(e) => setWoodModal((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Moso High-Density Bamboo"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Labor Difficulty Adjustment (%):</label>
              <input
                type="number"
                step="5"
                value={woodModal.pct}
                onChange={(e) => setWoodModal((prev) => ({ ...prev, pct: Number(e.target.value) }))}
                placeholder="e.g. 20 for +20%"
                style={styles.modalInput}
              />
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Use positive numbers for difficulty surcharges (e.g. +20%), negative for discounts (e.g. -50%).
              </span>
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Allowed Service Scope:</label>
              <input
                type="text"
                value={woodModal.allowed}
                onChange={(e) => setWoodModal((prev) => ({ ...prev, allowed: e.target.value }))}
                placeholder="e.g. All Services or Cleaning Only"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalBtnRow}>
              <button
                type="button"
                onClick={() => setWoodModal((prev) => ({ ...prev, open: false }))}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWoodSpecies}
                style={styles.modalSaveBtn}
              >
                Save Species
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT DECK COMPONENT */}
      {/* ==================================================================== */}
      {componentModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>
              {componentModal.isEdit ? 'Edit Deck Component' : 'Add New Deck Component'}
            </h3>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Component Key (Internal ID):</label>
              <input
                type="text"
                value={componentModal.key}
                disabled={componentModal.isEdit}
                onChange={(e) => setComponentModal((prev) => ({ ...prev, key: e.target.value }))}
                placeholder="e.g. benches, gazebo_roof"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Feature Title / Label:</label>
              <input
                type="text"
                value={componentModal.label}
                onChange={(e) => setComponentModal((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Built-in Benches"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Measurement Unit:</label>
              <input
                type="text"
                value={componentModal.unit}
                onChange={(e) => setComponentModal((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder="e.g. Linear Feet (LF), Count, % of Floor"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Surface Area Multiplier Factor:</label>
              <input
                type="number"
                step="0.1"
                value={componentModal.factor}
                onChange={(e) => setComponentModal((prev) => ({ ...prev, factor: Number(e.target.value) }))}
                placeholder="e.g. 3.0"
                style={styles.modalInput}
              />
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Square footage billable per unit entered by customer or contractor.
              </span>
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Formula Description:</label>
              <input
                type="text"
                value={componentModal.desc}
                onChange={(e) => setComponentModal((prev) => ({ ...prev, desc: e.target.value }))}
                placeholder="e.g. Both seat and backrest surfaces"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalBtnRow}>
              <button
                type="button"
                onClick={() => setComponentModal((prev) => ({ ...prev, open: false }))}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveComponent}
                style={styles.modalSaveBtn}
              >
                Save Component
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ADD / EDIT RESTORATION SERVICE */}
      {/* ==================================================================== */}
      {serviceModal.open && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>
              {serviceModal.isEdit ? 'Edit Restoration Service' : 'Add New Restoration Service'}
            </h3>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Service Key (Internal ID):</label>
              <input
                type="text"
                value={serviceModal.key}
                disabled={serviceModal.isEdit}
                onChange={(e) => setServiceModal((prev) => ({ ...prev, key: e.target.value }))}
                placeholder="e.g. mildew_kill_wash"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Service Name:</label>
              <input
                type="text"
                value={serviceModal.label}
                onChange={(e) => setServiceModal((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="e.g. Algaecide & Mildew Wash"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Service Category:</label>
              <select
                value={serviceModal.category}
                onChange={(e) => setServiceModal((prev) => ({ ...prev, category: e.target.value }))}
                style={styles.modalInput}
              >
                <option value="Preparation">Preparation</option>
                <option value="Conditioning">Conditioning</option>
                <option value="Stripping">Stripping</option>
                <option value="Sanding">Sanding</option>
                <option value="Finishing">Finishing</option>
              </select>
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Production Speed (sq ft per man-hour):</label>
              <input
                type="number"
                step="5"
                value={serviceModal.speed}
                onChange={(e) => setServiceModal((prev) => ({ ...prev, speed: Number(e.target.value) }))}
                placeholder="e.g. 80"
                style={styles.modalInput}
              />
              <span style={{ fontSize: '11px', color: '#64748B' }}>
                Technician square feet completed per hour. Lower values increase billable labor hours.
              </span>
            </div>
            <div style={styles.modalBtnRow}>
              <button
                type="button"
                onClick={() => setServiceModal((prev) => ({ ...prev, open: false }))}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveService}
                style={styles.modalSaveBtn}
              >
                Save Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: SET CONTRACTOR CUSTOM DISCOUNT */}
      {/* ==================================================================== */}
      {selectedContractor && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={styles.modalTitle}>Set Custom Contractor Trade Discount</h3>
            <p style={{ margin: '4px 0 16px 0', fontSize: '13px', color: '#64748B' }}>
              Assigning a custom discount for <strong>{selectedContractor.fullName}</strong> ({selectedContractor.businessName || 'Independent Pro'}).
            </p>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Custom Wholesale Discount (%):</label>
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                value={contractorCustomDiscount}
                onChange={(e) => setContractorCustomDiscount(e.target.value)}
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalField}>
              <label style={styles.modalLabel}>Reason for Override / Tier Assignment:</label>
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="e.g. Platinum Partner (>10 completed projects)"
                style={styles.modalInput}
              />
            </div>
            <div style={styles.modalBtnRow}>
              <button
                type="button"
                onClick={() => setSelectedContractor(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveContractorOverride}
                disabled={savingOverride}
                style={styles.modalSaveBtn}
              >
                {savingOverride ? 'Applying...' : 'Apply Custom %'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// MODERN DECK RESTORATION PLUS ADMIN STYLES
// =============================================
const styles = {
  pageContainer: {
    padding: '24px 32px 60px 32px',
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '70vh',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #E2E8F0',
    borderTop: '4px solid #034EA2',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  headerBanner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: '24px 28px',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
    marginBottom: '20px',
    gap: '20px',
  },
  headerTag: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    color: '#034EA2',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0F2C59',
    margin: '0 0 6px 0',
    letterSpacing: '-0.02em',
  },
  pageSubtitle: {
    fontSize: '13.5px',
    color: '#64748B',
    margin: 0,
    maxWidth: '750px',
    lineHeight: 1.45,
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  primarySaveBtn: {
    padding: '11px 22px',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13.5px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(21,128,61,0.25)',
    transition: 'all 0.15s ease',
  },
  secondarySaveBtn: {
    padding: '9px 16px',
    backgroundColor: '#034EA2',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '12.5px',
    cursor: 'pointer',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#DCFCE7',
    border: '1px solid #86EFAC',
    color: '#15803D',
    padding: '12px 18px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    marginBottom: '16px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FEE2E2',
    border: '1px solid #FCA5A5',
    color: '#B91C1C',
    padding: '12px 18px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    marginBottom: '16px',
  },
  tabBar: {
    display: 'flex',
    gap: '6px',
    backgroundColor: '#FFFFFF',
    padding: '6px',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    marginBottom: '20px',
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#64748B',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  activeTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 18px',
    backgroundColor: '#0F2C59',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: '0 2px 4px rgba(15,44,89,0.2)',
  },
  tabContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    padding: '24px 28px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '16px',
    marginBottom: '20px',
    gap: '16px',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: '0 0 4px 0',
  },
  sectionDesc: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '18px',
  },
  formCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    padding: '18px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  cardIcon: {
    fontSize: '18px',
  },
  cardTitle: {
    fontSize: '13.5px',
    color: '#0F2C59',
  },
  cardHelp: {
    fontSize: '12px',
    color: '#64748B',
    margin: '0 0 14px 0',
    lineHeight: 1.4,
  },
  inputPrefixWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    padding: '0 10px',
  },
  inputPrefix: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: '14px',
  },
  inputSuffix: {
    color: '#64748B',
    fontSize: '12px',
    paddingLeft: '6px',
  },
  numericInput: {
    border: 'none',
    outline: 'none',
    padding: '10px 8px',
    fontSize: '15px',
    fontWeight: '800',
    color: '#0F2C59',
    width: '100%',
    backgroundColor: 'transparent',
  },
  numericInputSmall: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F2C59',
  },
  badgePill: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
    fontWeight: '800',
    fontSize: '12px',
  },
  matrixTable: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '8px',
  },
  matrixTh: {
    textAlign: 'center',
    fontSize: '12px',
    fontWeight: '800',
    color: '#0F2C59',
    padding: '10px',
    backgroundColor: '#F1F5F9',
    borderRadius: '6px',
  },
  matrixRowHeader: {
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    padding: '14px',
    verticalAlign: 'middle',
    border: '1px solid #E2E8F0',
    width: '220px',
  },
  matrixSubtext: {
    display: 'block',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
  },
  matrixCell: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    verticalAlign: 'middle',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
  },
  cellRangeInputs: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  cellInput: {
    width: '65px',
    padding: '6px 4px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    textAlign: 'center',
    fontSize: '13.5px',
    fontWeight: '700',
    color: '#0F2C59',
  },
  cellLiveRate: {
    display: 'block',
    marginTop: '6px',
    fontSize: '11px',
    fontWeight: '800',
    color: '#034EA2',
  },
  dataTable: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '8px',
  },
  tableTh: {
    textAlign: 'left',
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '800',
    color: '#64748B',
    borderBottom: '2px solid #E2E8F0',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  tableRow: {
    borderBottom: '1px solid #F1F5F9',
    transition: 'background 0.15s ease',
  },
  tableTd: {
    padding: '14px',
    verticalAlign: 'middle',
    fontSize: '13px',
    color: '#1E293B',
  },
  codeBadge: {
    backgroundColor: '#F1F5F9',
    color: '#0F2C59',
    padding: '3px 7px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  difficultyBadge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '800',
    border: '1px solid transparent',
  },
  categoryPill: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    backgroundColor: '#F1F5F9',
    color: '#475569',
  },
  verifiedTierPill: {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '800',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
  },
  discountRatePill: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '11.5px',
    fontWeight: '800',
    border: '1px solid transparent',
  },
  discountHighlightBox: {
    backgroundColor: '#ECFDF5',
    border: '1.5px solid #A7F3D0',
    borderRadius: '10px',
    padding: '18px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  searchInput: {
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '12.5px',
    width: '200px',
    outline: 'none',
  },
  addItemBtn: {
    padding: '8px 16px',
    backgroundColor: '#0F2C59',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '12.5px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  editActionBtn: {
    padding: '5px 10px',
    backgroundColor: '#F1F5F9',
    border: '1px solid #CBD5E1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#0F2C59',
    cursor: 'pointer',
    marginRight: '6px',
  },
  deleteActionBtn: {
    padding: '5px 10px',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#DC2626',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px 28px',
    maxWidth: '480px',
    width: '90%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#0F2C59',
    margin: '0 0 16px 0',
  },
  modalField: {
    marginBottom: '14px',
  },
  modalLabel: {
    display: 'block',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#334155',
    marginBottom: '4px',
  },
  modalInput: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1.5px solid #CBD5E1',
    fontSize: '13.5px',
    color: '#0F2C59',
    outline: 'none',
  },
  modalBtnRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '20px',
  },
  cancelBtn: {
    padding: '9px 16px',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
  },
  modalSaveBtn: {
    padding: '9px 18px',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
  },
};
