// =============================================
// Deck Estimator — Admin Pricing & Discounts Management Hub
// =============================================
// 6 Dedicated Operational Tabs:
// - Tab 1: Master Rates & Thresholds (Labor Rate $250/hr, Rate Position 50%, Addon $1/sqft, Min Job $2500/$3000, Travel)
// - Tab 2: Base Rate Card Matrix (12-cell sqft matrix across Clean, Strip, Strip & Sand + 4 Finishes with live preview)
// - Tab 3: Wood Species & Materials (Dynamic species list, Multiplier %, Add New, Edit, Delete)
// - Tab 4: Deck Components (Dynamic architectural components, Area conversion factors, Add New, Edit, Delete)
// - Tab 5: Scope of Work (Dynamic restoration services, Production speeds sqft/hr, Add New, Edit, Delete)
// - Tab 6: Contractor Discounts (Global Default Wholesale Rate, Individual Contractor Tuning & Search, Overrides Matrix, Audit Logs)

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { adminApi } from '../api/adminApi';
import { ConfirmModal, SkeletonShimmer, SkeletonTable, SkeletonCard } from '../../../components/common';

// The 6 Approved Tabs
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

  // Contractor Discounts & Policy State
  const [discountData, setDiscountData] = useState(() => {
    try {
      const cached = localStorage.getItem('drp_admin_discounts_cache');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [defaultDiscountVal, setDefaultDiscountVal] = useState(() => {
    try {
      const cached = localStorage.getItem('drp_admin_discounts_cache');
      const parsed = cached ? JSON.parse(cached) : null;
      return parsed?.defaultDiscount !== undefined ? parsed.defaultDiscount : 5;
    } catch {
      return 5;
    }
  });
  const [defaultReason, setDefaultReason] = useState('');
  const [savingDefaultDiscount, setSavingDefaultDiscount] = useState(false);

  // Individual Contractor Tuning Section State
  const [contractorSearchQuery, setContractorSearchQuery] = useState('');
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [selectedContractorForTuning, setSelectedContractorForTuning] = useState(null);
  const [tuneDiscountVal, setTuneDiscountVal] = useState(15);
  const [tuneReasonVal, setTuneReasonVal] = useState('');
  const [savingIndividualDiscount, setSavingIndividualDiscount] = useState(false);

  // Table directory filters
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryTierFilter, setDirectoryTierFilter] = useState('all'); // 'all' | 'custom' | 'default'

  // Modals for Dynamic Add / Edit items
  const [woodModal, setWoodModal] = useState({ open: false, isEdit: false, key: '', label: '', pct: 0, allowed: 'All Services' });
  const [componentModal, setComponentModal] = useState({ open: false, isEdit: false, key: '', label: '', unit: '', factor: 1.0, desc: '' });
  const [serviceModal, setServiceModal] = useState({ open: false, isEdit: false, key: '', label: '', speed: 100, category: 'Preparation' });

  // Search queries for dynamic tables
  const [woodSearch, setWoodSearch] = useState('');
  const [componentSearch, setComponentSearch] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');

  // Universal Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm & Save',
    cancelLabel: 'Cancel',
    variant: 'primary',
    isLoading: false,
    onConfirm: null,
  });

  const searchBoxRef = useRef(null);

  // Initial Data Load
  useEffect(() => {
    loadAllData();
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAllData = async () => {
    if (!discountData) setLoading(true);
    setError(null);
    try {
      const [pricingResult, discountResult] = await Promise.allSettled([
        adminApi.getPricingConfig(),
        adminApi.getDiscountsOverview(),
      ]);

      if (pricingResult.status === 'fulfilled' && pricingResult.value?.data) {
        const rp = pricingResult.value.data.restorationPricing;
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

      const discountRes = discountResult.status === 'fulfilled' ? discountResult.value : null;
      // Safe unwrap of discount data (whether returned as res.data or direct object)
      let unwrappedDiscount =
        discountRes?.data?.contractors !== undefined
          ? discountRes.data
          : discountRes?.contractors !== undefined
          ? discountRes
          : discountRes?.data || discountRes;

      // Fallback: if discounts endpoint failed or returned 0 contractors, fetch contractors from users endpoint
      if (!unwrappedDiscount || !Array.isArray(unwrappedDiscount.contractors) || unwrappedDiscount.contractors.length === 0) {
        try {
          const usersRes = await adminApi.getUsers({ role: 'contractor', limit: 100 });
          const rawUsers = Array.isArray(usersRes?.data) ? usersRes.data : (Array.isArray(usersRes?.data?.data) ? usersRes.data.data : []);
          if (rawUsers.length > 0) {
            const defRate = unwrappedDiscount?.defaultDiscount !== undefined ? unwrappedDiscount.defaultDiscount : 5;
            const mappedContractors = rawUsers.map((c) => {
              const idStr = (c._id || c.id || '').toString();
              return {
                id: idStr,
                _id: idStr,
                contractorId: `CT-${idStr.slice(-4).toUpperCase()}`,
                name: c.fullName || c.name,
                fullName: c.fullName || c.name,
                email: c.email,
                phone: c.phone || '',
                businessName: c.contractorProfile?.businessName || c.company || c.businessName || 'Independent Pro',
                verificationStatus: c.contractorProfile?.verificationStatus || 'APPROVED',
                completedProjects: 0,
                defaultDiscount: `${defRate}%`,
                currentDiscount: `${defRate}%`,
                discountType: 'Default',
                hasCustomDiscount: false,
                customDiscount: null,
                rawDiscount: defRate,
                overrideReason: '',
              };
            });
            unwrappedDiscount = {
              defaultDiscount: defRate,
              contractorsWithDiscounts: 0,
              activeDiscountRules: 0,
              contractors: mappedContractors,
              auditHistory: unwrappedDiscount?.auditHistory || [],
            };
          }
        } catch {
          // Keep existing cached state if fallback also fails
        }
      }

      if (unwrappedDiscount && typeof unwrappedDiscount === 'object') {
        setDiscountData(unwrappedDiscount);
        if (unwrappedDiscount.defaultDiscount !== undefined) {
          setDefaultDiscountVal(unwrappedDiscount.defaultDiscount);
        }
        try {
          localStorage.setItem('drp_admin_discounts_cache', JSON.stringify(unwrappedDiscount));
        } catch {
          // Ignore storage quota
        }
      }
    } catch (err) {
      if (!discountData) {
        setError(err?.message || 'Could not load pricing and discount data.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to open confirmation dialog
  const promptConfirmation = ({
    title,
    message,
    confirmLabel = 'Confirm & Save',
    variant = 'primary',
    onConfirm,
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      cancelLabel: 'Cancel',
      variant,
      isLoading: false,
      onConfirm: async () => {
        try {
          setConfirmModal((prev) => ({ ...prev, isLoading: true }));
          await onConfirm();
        } finally {
          setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
        }
      },
    });
  };

  // --------------------------------------------------------------------------
  // Save Engine Configuration (Tabs 1 through 5)
  // --------------------------------------------------------------------------
  const executeSaveEngineConfig = async (overrideData = null, successNote = null) => {
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
      setSuccessMsg(successNote || 'Estimator pricing configuration successfully saved and live calculation engine synchronized!');
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      setError(err?.message || 'Failed to save pricing configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEngineConfig = (overrideData = null, customNote = null) => {
    promptConfirmation({
      title: 'Publish Pricing Engine Configuration?',
      message:
        'Are you sure you want to save and publish these rates? The live calculation engine, instant customer quotes, and contractor portal estimates will immediately reflect these updated rates across the platform.',
      confirmLabel: 'Confirm & Publish Rates',
      variant: 'primary',
      onConfirm: () => executeSaveEngineConfig(overrideData, customNote),
    });
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
  // Tab 3 Handlers: Wood Species & Materials
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
    promptConfirmation({
      title: woodModal.isEdit ? 'Update Wood Species?' : 'Add Wood Species?',
      message: `Confirm saving wood species "${woodModal.label.trim()}". This will immediately update questionnaire options and quote calculations.`,
      confirmLabel: 'Save Species',
      onConfirm: () => executeSaveEngineConfig(updated, `Wood species "${woodModal.label.trim()}" saved.`),
    });
  };

  const handleDeleteWoodSpecies = (key) => {
    const label = engineConfig.wood[key]?.label || key;
    promptConfirmation({
      title: 'Delete Wood Species?',
      message: `Are you sure you want to permanently delete "${label}" (${key})? This will update the estimator matrix immediately.`,
      confirmLabel: 'Delete Species',
      variant: 'danger',
      onConfirm: () => {
        const updatedWood = { ...engineConfig.wood };
        delete updatedWood[key];
        return executeSaveEngineConfig({ ...engineConfig, wood: updatedWood }, `Wood species "${label}" deleted.`);
      },
    });
  };

  // --------------------------------------------------------------------------
  // Tab 4 Handlers: Deck Components
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
        unit: componentModal.unit.trim() || 'Unit',
        factor: Number(componentModal.factor),
        desc: componentModal.desc.trim() || '',
      },
    };
    const updated = { ...engineConfig, areas: updatedAreas };
    setComponentModal({ open: false, isEdit: false, key: '', label: '', unit: '', factor: 1.0, desc: '' });
    promptConfirmation({
      title: componentModal.isEdit ? 'Update Deck Component?' : 'Add Deck Component?',
      message: `Confirm saving deck component "${componentModal.label.trim()}". Surface area calculations will update across all portals.`,
      confirmLabel: 'Save Component',
      onConfirm: () => executeSaveEngineConfig(updated, `Deck component "${componentModal.label.trim()}" saved.`),
    });
  };

  const handleDeleteComponent = (key) => {
    const label = engineConfig.areas[key]?.label || key;
    promptConfirmation({
      title: 'Delete Deck Component?',
      message: `Are you sure you want to permanently delete component "${label}" (${key})?`,
      confirmLabel: 'Delete Component',
      variant: 'danger',
      onConfirm: () => {
        const updatedAreas = { ...engineConfig.areas };
        delete updatedAreas[key];
        return executeSaveEngineConfig({ ...engineConfig, areas: updatedAreas }, `Component "${label}" deleted.`);
      },
    });
  };

  // --------------------------------------------------------------------------
  // Tab 5 Handlers: Scope of Work & Production Speeds
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
    promptConfirmation({
      title: serviceModal.isEdit ? 'Update Restoration Service?' : 'Add Restoration Service?',
      message: `Confirm saving service "${serviceModal.label.trim()}" with speed ${serviceModal.speed} sq ft/hr. Billable labor calculations will synchronize.`,
      confirmLabel: 'Save Service',
      onConfirm: () => executeSaveEngineConfig(updated, `Restoration service "${serviceModal.label.trim()}" saved.`),
    });
  };

  const handleDeleteService = (key) => {
    const label = engineConfig.production[key]?.label || key;
    promptConfirmation({
      title: 'Delete Restoration Service?',
      message: `Are you sure you want to permanently delete service "${label}" (${key})?`,
      confirmLabel: 'Delete Service',
      variant: 'danger',
      onConfirm: () => {
        const updatedProd = { ...engineConfig.production };
        delete updatedProd[key];
        return executeSaveEngineConfig({ ...engineConfig, production: updatedProd }, `Service "${label}" deleted.`);
      },
    });
  };

  // --------------------------------------------------------------------------
  // Tab 6 Handlers: Global Default & Individual Contractor Discounts
  // --------------------------------------------------------------------------
  const handleSaveDefaultDiscount = () => {
    const targetVal = Number(defaultDiscountVal);
    if (isNaN(targetVal) || targetVal < 0 || targetVal > 50) {
      alert('Default wholesale discount must be between 0% and 50%.');
      return;
    }
    promptConfirmation({
      title: 'Update Global Default Wholesale Discount?',
      message: `Are you sure you want to change the platform-wide default contractor discount to ${targetVal}%? All contractors without an individual custom override will automatically receive this new discount rate immediately in their portal and quote calculations. Contractors with customized overrides will remain unaffected.`,
      confirmLabel: 'Update Global Default %',
      variant: 'primary',
      onConfirm: async () => {
        setSavingDefaultDiscount(true);
        setError(null);
        try {
          await adminApi.updateDefaultDiscount(targetVal, defaultReason || 'Admin updated platform default wholesale trade discount');
          setSuccessMsg(`✓ Global default contractor discount updated to ${targetVal}%.`);
          setTimeout(() => setSuccessMsg(null), 4500);
          await loadAllData();
        } catch (err) {
          setError(err?.message || 'Failed to update default contractor discount.');
        } finally {
          setSavingDefaultDiscount(false);
        }
      },
    });
  };

  const handleSelectContractorForTuning = (contractor) => {
    setSelectedContractorForTuning(contractor);
    const existingVal = contractor.hasCustomDiscount ? contractor.customDiscount : (contractor.rawDiscount || defaultDiscountVal);
    setTuneDiscountVal(existingVal);
    setTuneReasonVal(contractor.overrideReason || '');
    setIsSearchDropdownOpen(false);
    setContractorSearchQuery('');
  };

  const handleApplyIndividualDiscount = () => {
    if (!selectedContractorForTuning) return;
    const targetVal = Number(tuneDiscountVal);
    if (isNaN(targetVal) || targetVal < 0 || targetVal > 50) {
      alert('Custom discount rate must be between 0% and 50%.');
      return;
    }

    const contractorName = selectedContractorForTuning.fullName || selectedContractorForTuning.name;
    const contractorId = selectedContractorForTuning.id || selectedContractorForTuning._id;

    promptConfirmation({
      title: 'Apply Individual Contractor Custom Discount?',
      message: `Are you sure you want to assign an isolated ${targetVal}% custom discount for ${contractorName}? This contractor will retain this override permanently, completely isolated from global platform default changes.`,
      confirmLabel: 'Apply Custom Rate',
      variant: 'primary',
      onConfirm: async () => {
        setSavingIndividualDiscount(true);
        setError(null);
        try {
          await adminApi.setContractorDiscount(
            contractorId,
            targetVal,
            tuneReasonVal || `Admin tuned custom discount for ${contractorName}`
          );
          setSuccessMsg(`✓ Custom trade discount of ${targetVal}% saved for ${contractorName}.`);
          setTimeout(() => setSuccessMsg(null), 4500);
          setSelectedContractorForTuning(null);
          await loadAllData();
        } catch (err) {
          setError(err?.message || 'Failed to update contractor custom discount.');
        } finally {
          setSavingIndividualDiscount(false);
        }
      },
    });
  };

  const handleResetContractorDiscount = (contractor) => {
    const contractorName = contractor.fullName || contractor.name;
    const contractorId = contractor.id || contractor._id;

    promptConfirmation({
      title: 'Reset to Platform Default Discount?',
      message: `Are you sure you want to remove the custom override for ${contractorName} and revert them back to the active platform default (${defaultDiscountVal}%)?`,
      confirmLabel: 'Reset to Default',
      variant: 'danger',
      onConfirm: async () => {
        setError(null);
        try {
          await adminApi.resetContractorDiscount(
            contractorId,
            `Admin reset ${contractorName} to global default discount`
          );
          setSuccessMsg(`✓ Reverted ${contractorName} to platform default discount (${defaultDiscountVal}%).`);
          setTimeout(() => setSuccessMsg(null), 4500);
          if (selectedContractorForTuning && (selectedContractorForTuning.id === contractorId || selectedContractorForTuning._id === contractorId)) {
            setSelectedContractorForTuning(null);
          }
          await loadAllData();
        } catch (err) {
          setError(err?.message || 'Failed to reset contractor discount.');
        }
      },
    });
  };

  // Filtered Search Results for Dropdown with fast instant matching
  const searchDropdownResults = useMemo(() => {
    const list = discountData?.contractors || [];
    if (!contractorSearchQuery.trim()) {
      return list.slice(0, 8);
    }
    const q = contractorSearchQuery.toLowerCase().trim();
    return list.filter((c) => {
      const name = (c.fullName || c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const biz = (c.businessName || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return name.includes(q) || email.includes(q) || biz.includes(q) || phone.includes(q);
    });
  }, [discountData?.contractors, contractorSearchQuery]);

  // Filtered Contractor Directory Matrix
  const filteredContractors = useMemo(() => {
    if (!discountData?.contractors) return [];
    let list = [...discountData.contractors];

    if (directoryTierFilter === 'custom') {
      list = list.filter((c) => c.hasCustomDiscount);
    } else if (directoryTierFilter === 'default') {
      list = list.filter((c) => !c.hasCustomDiscount);
    }

    if (directorySearch.trim()) {
      const q = directorySearch.toLowerCase();
      list = list.filter((c) => {
        const name = (c.fullName || c.name || '').toLowerCase();
        const email = (c.email || '').toLowerCase();
        const biz = (c.businessName || '').toLowerCase();
        return name.includes(q) || email.includes(q) || biz.includes(q);
      });
    }

    return list;
  }, [discountData?.contractors, directoryTierFilter, directorySearch]);

  // Filtered Lists for Dynamic Search (Tabs 3-5)
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
      <div style={{ padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonShimmer width="240px" height="28px" borderRadius="8px" />
            <SkeletonShimmer width="380px" height="14px" />
          </div>
          <SkeletonShimmer width="130px" height="38px" borderRadius="20px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '24px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px' }}>
          <SkeletonTable rows={6} columns={5} />
        </div>
      </div>
    );
  }

  const customOverridesCount = discountData?.contractors?.filter((c) => c.hasCustomDiscount)?.length || 0;
  const totalContractorsCount = discountData?.contractors?.length || 0;

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
            {saving ? 'Publishing Matrix...' : 'Save & Publish Pricing'}
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

      {/* HORIZONTAL TAB BAR (6 APPROVED TABS) */}
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
            <button
              onClick={() => handleSaveEngineConfig(null, 'Master rates & thresholds successfully saved.')}
              disabled={saving}
              style={styles.sectionSaveBtn}
            >
              Save Master Rates
            </button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Active Interpolator: </span>
                <strong style={{ color: '#034EA2' }}>
                  {Math.round((engineConfig.ratePosition !== undefined ? engineConfig.ratePosition : 0.5) * 100)}% Midpoint
                </strong>
              </div>
              <button
                onClick={() => handleSaveEngineConfig(null, 'Base rate card matrix successfully saved.')}
                disabled={saving}
                style={styles.sectionSaveBtn}
              >
                Save Rate Matrix
              </button>
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
      {/* TAB 3: WOOD SPECIES & MATERIALS */}
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
                          backgroundColor: isPositive ? '#FEF3C7' : isNegative ? '#DCFCE7' : '#F1F5F9',
                          color: isPositive ? '#92400E' : isNegative ? '#15803D' : '#475569',
                          borderColor: isPositive ? '#FCD34D' : isNegative ? '#86EFAC' : '#CBD5E1',
                        }}
                      >
                        {isPositive ? `+${pctVal}% labor difficulty` : isNegative ? `${pctVal}% discount` : '0% standard'}
                      </span>
                    </td>
                    <td style={styles.tableTd}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>{item.allowed || 'All Services'}</span>
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
                        title="Edit Wood Species"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteWoodSpecies(key)}
                        style={styles.deleteActionBtn}
                        title="Delete Wood Species"
                      >
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
      {/* TAB 4: DECK ARCHITECTURAL COMPONENTS */}
      {/* ==================================================================== */}
      {activeTab === 'deck_components' && (
        <div style={styles.tabContentCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Deck Architectural Components & Conversion Factors</h2>
              <p style={styles.sectionDesc}>
                Configure surface conversion multipliers for railings, stairs, benches, fascia, and framing elements.
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
                onClick={() => setComponentModal({ open: true, isEdit: false, key: '', label: '', unit: 'Linear Feet (LF)', factor: 1.5, desc: '' })}
                style={styles.addItemBtn}
              >
                + Add Component
              </button>
            </div>
          </div>

          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.tableTh}>Component Key</th>
                <th style={styles.tableTh}>Feature Title</th>
                <th style={styles.tableTh}>Input Measurement Unit</th>
                <th style={styles.tableTh}>Area Conversion Factor</th>
                <th style={styles.tableTh}>Calculation Formula / Description</th>
                <th style={{ ...styles.tableTh, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComponents.map(([key, item]) => (
                <tr key={key} style={styles.tableRow}>
                  <td style={styles.tableTd}>
                    <code style={styles.codeBadge}>{key}</code>
                  </td>
                  <td style={styles.tableTd}>
                    <strong>{item.label}</strong>
                  </td>
                  <td style={styles.tableTd}>
                    <span style={styles.categoryPill}>{item.unit}</span>
                  </td>
                  <td style={styles.tableTd}>
                    <strong style={{ color: '#034EA2', fontSize: '14px' }}>&times;{item.factor}</strong>
                    <span style={{ fontSize: '11px', color: '#64748B', marginLeft: '4px' }}>sq ft / unit</span>
                  </td>
                  <td style={styles.tableTd}>
                    <span style={{ fontSize: '12px', color: '#475569' }}>{item.desc || '—'}</span>
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
                          desc: item.desc || '',
                        })
                      }
                      style={styles.editActionBtn}
                      title="Edit Component"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComponent(key)}
                      style={styles.deleteActionBtn}
                      title="Delete Component"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 5: SCOPE OF WORK & PRODUCTION */}
      {/* ==================================================================== */}
      {activeTab === 'scope_of_work' && (
        <div style={styles.tabContentCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Scope of Work & Production Speeds</h2>
              <p style={styles.sectionDesc}>
                Define production speeds (sq ft per man-hour) for each restoration phase to calculate billable technician hours.
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
                + Add Service
              </button>
            </div>
          </div>

          <table style={styles.dataTable}>
            <thead>
              <tr>
                <th style={styles.tableTh}>Service Key</th>
                <th style={styles.tableTh}>Service Name</th>
                <th style={styles.tableTh}>Category</th>
                <th style={styles.tableTh}>Production Speed</th>
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
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(key)}
                        style={styles.deleteActionBtn}
                        title="Delete Service"
                      >
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
      {/* TAB 6: CONTRACTOR TRADE DISCOUNTS (ENHANCED WITH TUNING & AUDIT LOGS) */}
      {/* ==================================================================== */}
      {activeTab === 'contractor_discounts' && (
        <div style={styles.tabContentCard}>
          <div style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Contractor Partner Trade Discounts & Tuning Hub</h2>
              <p style={styles.sectionDesc}>
                Manage global wholesale trade discount policies and tune isolated discount overrides for individual contractor partners with live audit trails.
              </p>
            </div>
          </div>

          {/* KPI Mini-Cards */}
          <div style={styles.kpiRow}>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Global Default Wholesale</span>
              <strong style={{ ...styles.kpiVal, color: '#15803D' }}>{defaultDiscountVal}%</strong>
              <span style={styles.kpiSub}>Platform Baseline for All Partners</span>
            </div>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Custom Overrides Active</span>
              <strong style={{ ...styles.kpiVal, color: '#B45309' }}>{customOverridesCount}</strong>
              <span style={styles.kpiSub}>Isolated Negotiated Contractor Rates</span>
            </div>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Standard Platform Tier</span>
              <strong style={{ ...styles.kpiVal, color: '#034EA2' }}>{totalContractorsCount - customOverridesCount}</strong>
              <span style={styles.kpiSub}>Contractors on Default Policy</span>
            </div>
            <div style={styles.kpiCard}>
              <span style={styles.kpiLabel}>Calculation Engine Status</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
                <strong style={{ fontSize: '15px', color: '#0F2C59' }}>Online & Synchronized</strong>
              </div>
              <span style={styles.kpiSub}>Quotes update in real-time</span>
            </div>
          </div>

          {/* SECTION 1: GLOBAL DEFAULT POLICY CARD */}
          <div style={styles.discountHighlightBox}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '800', color: '#15803D', letterSpacing: '0.04em' }}>
                  Active Platform Default Policy
                </span>
                <span style={{ fontSize: '10px', backgroundColor: '#DCFCE7', color: '#15803D', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>
                  GLOBAL SETTING
                </span>
              </div>
              <h3 style={{ margin: '2px 0 6px 0', fontSize: '20px', color: '#065F46', fontWeight: '800' }}>
                Standard Wholesale Trade Tier ({defaultDiscountVal}%)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#047857', lineHeight: '1.45' }}>
                Automatically applies on contractor quote calculations in the Contractor Portal. Updating this global rate applies to all partners <strong>except</strong> those with an individual customized override below.
              </p>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: '#065F46', fontWeight: '700' }}>Presets:</span>
                {[5, 8, 10, 12, 15, 20].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setDefaultDiscountVal(rate)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: defaultDiscountVal === rate ? '1.5px solid #059669' : '1px solid #A7F3D0',
                      backgroundColor: defaultDiscountVal === rate ? '#059669' : '#FFFFFF',
                      color: defaultDiscountVal === rate ? '#FFFFFF' : '#047857',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end', minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={styles.inputPrefixWrap}>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={defaultDiscountVal}
                    onChange={(e) => setDefaultDiscountVal(e.target.value)}
                    style={{ ...styles.numericInput, width: '85px', color: '#15803D', fontWeight: '900', fontSize: '16px' }}
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
              <input
                type="text"
                placeholder="Optional reason for audit log..."
                value={defaultReason}
                onChange={(e) => setDefaultReason(e.target.value)}
                style={{ ...styles.searchInput, width: '240px', fontSize: '11.5px', padding: '6px 10px' }}
              />
            </div>
          </div>

          {/* SECTION 2: TUNE INDIVIDUAL CONTRACTOR DISCOUNT (DIRECT SEARCH & ASSIGN) */}
          <div style={styles.tuningContainerCard}>
            <div style={styles.tuningHeaderRow}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.tuningSectionBadge}>INDIVIDUAL TUNING ENGINE</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Isolated Contractor Overrides</span>
                </div>
                <h3 style={{ margin: '4px 0 2px 0', fontSize: '17px', color: '#0F2C59', fontWeight: '800' }}>
                  Tune Individual Contractor Trade Discount
                </h3>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#64748B' }}>
                  Search for any registered contractor to tune an isolated custom discount percentage. This custom rate will <strong>never</strong> be altered when global default discounts change.
                </p>
              </div>
            </div>

            {/* Contractor Search Dropdown / Autocomplete */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '520px' }} ref={searchBoxRef}>
                  <input
                    type="text"
                    placeholder="🔍 Search contractor by name, email, or company to tune discount..."
                    value={contractorSearchQuery}
                    onFocus={() => setIsSearchDropdownOpen(true)}
                    onChange={(e) => {
                      setContractorSearchQuery(e.target.value);
                      setIsSearchDropdownOpen(true);
                    }}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 36px 10px 14px',
                      borderRadius: '8px',
                      border: isSearchDropdownOpen ? '1.5px solid #034EA2' : '1.5px solid #CBD5E1',
                      fontSize: '13px',
                      color: '#0F2C59',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  />
                  {contractorSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setContractorSearchQuery('')}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: '#E2E8F0',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '800',
                        color: '#475569',
                        cursor: 'pointer',
                      }}
                      title="Clear search text"
                    >
                      ✕
                    </button>
                  )}

                  {/* Autocomplete Dropdown (Positioned directly under input) */}
                  {isSearchDropdownOpen && (
                    <div style={styles.searchDropdownList}>
                      {searchDropdownResults.length > 0 ? (
                        searchDropdownResults.map((c) => (
                          <div
                            key={c.id || c._id}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectContractorForTuning(c);
                            }}
                            style={styles.searchDropdownItem}
                          >
                            <div style={styles.contractorAvatarBadge}>
                              {(c.fullName || c.name || 'C')[0].toUpperCase()}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <strong style={{ fontSize: '13px', color: '#0F2C59', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {c.fullName || c.name}
                              </strong>
                              <span style={{ fontSize: '11px', color: '#64748B', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                {c.businessName || 'Independent Pro'} • {c.email}
                              </span>
                            </div>
                            <div>
                              <span
                                style={{
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  padding: '3px 8px',
                                  borderRadius: '12px',
                                  backgroundColor: c.hasCustomDiscount ? '#FEF3C7' : '#DCFCE7',
                                  color: c.hasCustomDiscount ? '#B45309' : '#15803D',
                                  border: c.hasCustomDiscount ? '1px solid #FCD34D' : '1px solid #86EFAC',
                                }}
                              >
                                {c.hasCustomDiscount ? `Custom: ${c.customDiscount}%` : `Default: ${defaultDiscountVal}%`}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ padding: '14px', textAlign: 'center', fontSize: '12.5px', color: '#64748B' }}>
                          No registered contractors found matching "<strong>{contractorSearchQuery}</strong>"
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  or click <strong>"Tune Discount"</strong> on any contractor in the directory table below.
                </span>
              </div>

              {/* Selected Contractor Active Pill with Cross Mark */}
              {selectedContractorForTuning && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '7px 14px',
                      backgroundColor: '#EFF6FF',
                      border: '1.5px solid #3B82F6',
                      borderRadius: '8px',
                      boxShadow: '0 2px 6px rgba(59, 130, 246, 0.12)',
                    }}
                  >
                    <div style={{ ...styles.contractorAvatarBadge, width: '24px', height: '24px', fontSize: '11px', backgroundColor: '#1D4ED8' }}>
                      {(selectedContractorForTuning.fullName || selectedContractorForTuning.name || 'C')[0].toUpperCase()}
                    </div>
                    <span style={{ fontSize: '12.5px', fontWeight: '800', color: '#1E3A8A' }}>
                      Selected: {selectedContractorForTuning.fullName || selectedContractorForTuning.name}
                    </span>
                    <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                      ({selectedContractorForTuning.email})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContractorForTuning(null);
                        setContractorSearchQuery('');
                      }}
                      style={{
                        background: '#DBEAFE',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: '900',
                        color: '#1D4ED8',
                        cursor: 'pointer',
                        marginLeft: '4px',
                      }}
                      title="Deselect Contractor"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Selected Contractor Active Tuning Panel */}
            {selectedContractorForTuning ? (
              <div style={styles.activeTuningBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ ...styles.contractorAvatarBadge, width: '42px', height: '42px', fontSize: '18px', backgroundColor: '#0F2C59' }}>
                      {(selectedContractorForTuning.fullName || selectedContractorForTuning.name || 'C')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '16px', color: '#0F2C59', fontWeight: '800' }}>
                          {selectedContractorForTuning.fullName || selectedContractorForTuning.name}
                        </h4>
                        <span style={styles.verifiedTierPill}>
                          ✓ {selectedContractorForTuning.verificationStatus || 'APPROVED'}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>
                        {selectedContractorForTuning.businessName || 'Independent Pro'} • {selectedContractorForTuning.email}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Current Standing:</span>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '800',
                        backgroundColor: selectedContractorForTuning.hasCustomDiscount ? '#FEF3C7' : '#DCFCE7',
                        color: selectedContractorForTuning.hasCustomDiscount ? '#92400E' : '#15803D',
                        border: selectedContractorForTuning.hasCustomDiscount ? '1px solid #FCD34D' : '1px solid #86EFAC',
                      }}
                    >
                      {selectedContractorForTuning.hasCustomDiscount
                        ? `★ Custom Override (${selectedContractorForTuning.customDiscount}%)`
                        : `✓ Global Default (${defaultDiscountVal}%)`}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContractorForTuning(null);
                        setContractorSearchQuery('');
                      }}
                      style={{
                        padding: '4px 10px',
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: '#64748B',
                        cursor: 'pointer',
                      }}
                      title="Clear Selection"
                    >
                      ✕ Deselect
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Assign Custom Trade Discount (%):
                    </label>
                    <div style={styles.inputPrefixWrap}>
                      <input
                        type="number"
                        min="0"
                        max="50"
                        step="1"
                        value={tuneDiscountVal}
                        onChange={(e) => setTuneDiscountVal(e.target.value)}
                        style={{ ...styles.numericInput, width: '90px', fontWeight: '800', color: '#0F2C59' }}
                      />
                      <span style={styles.inputSuffix}>%</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Reason / Incentive Agreement (Saved in Audit Log):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Platinum Partner (high volume commercial projects)"
                      value={tuneReasonVal}
                      onChange={(e) => setTuneReasonVal(e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '13px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '16px' }}>
                    <button
                      type="button"
                      onClick={handleApplyIndividualDiscount}
                      disabled={savingIndividualDiscount}
                      style={{
                        ...styles.modalSaveBtn,
                        padding: '10px 22px',
                        backgroundColor: '#0F2C59',
                        color: '#FFFFFF',
                        border: '1.5px solid #0F2C59',
                        boxShadow: '0 2px 6px rgba(15, 44, 89, 0.25)',
                      }}
                    >
                      {savingIndividualDiscount
                        ? 'Saving Custom Rate...'
                        : `✓ Save & Apply Custom Discount (${tuneDiscountVal}%) for ${selectedContractorForTuning.fullName || selectedContractorForTuning.name}`}
                    </button>

                    {selectedContractorForTuning.hasCustomDiscount && (
                      <button
                        type="button"
                        onClick={() => handleResetContractorDiscount(selectedContractorForTuning)}
                        style={styles.deleteActionBtn}
                        title="Revert back to Global Default"
                      >
                        ↺ Reset to Default ({defaultDiscountVal}%)
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedContractorForTuning(null);
                        setContractorSearchQuery('');
                      }}
                      style={styles.cancelBtn}
                    >
                      ✕ Clear Selection
                    </button>
                  </div>
                </div>

                {/* Preset Chips for tuning */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '700' }}>Quick Presets:</span>
                  {[5, 8, 10, 12, 15, 18, 20, 25].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setTuneDiscountVal(rate)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: Number(tuneDiscountVal) === rate ? '1.5px solid #0F2C59' : '1px solid #CBD5E1',
                        backgroundColor: Number(tuneDiscountVal) === rate ? '#0F2C59' : '#FFFFFF',
                        color: Number(tuneDiscountVal) === rate ? '#FFFFFF' : '#334155',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div style={styles.tuningEmptyHint}>
                <span>👆 Select any contractor via the search box above or click "Tune Discount" below to assign a customized trade discount.</span>
              </div>
            )}
          </div>

          {/* SECTION 3: REGISTERED CONTRACTORS & CUSTOM OVERRIDES MATRIX */}
          <div style={{ marginTop: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F2C59' }}>
                  Contractor Trade Discount Directory ({filteredContractors.length})
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Full roster of certified contractors showing effective discounts and override standing
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={directoryTierFilter}
                  onChange={(e) => setDirectoryTierFilter(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">All Contractors ({totalContractorsCount})</option>
                  <option value="custom">Custom Overrides Only ({customOverridesCount})</option>
                  <option value="default">Default Policy Only ({totalContractorsCount - customOverridesCount})</option>
                </select>

                <input
                  type="text"
                  placeholder="Filter contractors..."
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
            </div>

            <table style={styles.dataTable}>
              <thead>
                <tr>
                  <th style={styles.tableTh}>Contractor Name & Company</th>
                  <th style={styles.tableTh}>Contact Info</th>
                  <th style={styles.tableTh}>Verification Status</th>
                  <th style={styles.tableTh}>Completed Projects</th>
                  <th style={styles.tableTh}>Effective Trade Discount</th>
                  <th style={styles.tableTh}>Override Note</th>
                  <th style={{ ...styles.tableTh, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredContractors.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                      No contractors match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredContractors.map((contractor) => {
                    const hasCustom = contractor.hasCustomDiscount;
                    const effective = hasCustom ? contractor.customDiscount : defaultDiscountVal;
                    return (
                      <tr key={contractor.id || contractor._id} style={styles.tableRow}>
                        <td style={styles.tableTd}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={styles.contractorAvatarBadge}>
                              {(contractor.fullName || contractor.name || 'C')[0].toUpperCase()}
                            </div>
                            <div>
                              <strong>{contractor.fullName || contractor.name}</strong>
                              <span style={{ display: 'block', fontSize: '11px', color: '#64748B' }}>
                                {contractor.businessName || 'Independent Pro'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td style={styles.tableTd}>
                          <span style={{ fontSize: '13px', color: '#334155', display: 'block' }}>{contractor.email}</span>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>{contractor.phone || 'No phone'}</span>
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
                            {effective}% {hasCustom ? '(Custom Override)' : '(Platform Default)'}
                          </span>
                        </td>
                        <td style={styles.tableTd}>
                          <span style={{ fontSize: '12px', color: '#64748B' }}>
                            {contractor.overrideReason || (hasCustom ? 'Individual override' : 'Default platform tier')}
                          </span>
                        </td>
                        <td style={{ ...styles.tableTd, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <button
                            onClick={() => handleSelectContractorForTuning(contractor)}
                            style={styles.editActionBtn}
                            title="Tune Discount Rate"
                          >
                            Tune Discount
                          </button>
                          {hasCustom && (
                            <button
                              onClick={() => handleResetContractorDiscount(contractor)}
                              style={styles.deleteActionBtn}
                              title="Reset to Platform Default"
                            >
                              Reset
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* SECTION 4: DISCOUNT TUNING AUDIT LOGS */}
          <div style={{ marginTop: '36px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0F2C59' }}>
                  Discount Tuning & Policy Audit Logs ({discountData?.auditHistory?.length || 0})
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Real-time database records of all platform-wide and contractor-specific discount adjustments
                </span>
              </div>
            </div>

            <table style={styles.dataTable}>
              <thead>
                <tr>
                  <th style={styles.tableTh}>Date & Time</th>
                  <th style={styles.tableTh}>Target Contractor / Scope</th>
                  <th style={styles.tableTh}>Adjustment Type</th>
                  <th style={styles.tableTh}>Discount Rate Change</th>
                  <th style={styles.tableTh}>Reason / Administrative Note</th>
                  <th style={styles.tableTh}>Modified By Admin</th>
                </tr>
              </thead>
              <tbody>
                {(!discountData?.auditHistory || discountData.auditHistory.length === 0) ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                      No discount modifications recorded yet. All changes are automatically recorded here.
                    </td>
                  </tr>
                ) : (
                  discountData.auditHistory.map((log) => {
                    const isDefault = log.discountType === 'default';
                    return (
                      <tr key={log.id || log._id} style={styles.tableRow}>
                        <td style={styles.tableTd}>
                          <span style={{ fontSize: '12px', color: '#334155' }}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                          </span>
                        </td>
                        <td style={styles.tableTd}>
                          <strong>{log.contractorName || 'All Contractors (Default)'}</strong>
                        </td>
                        <td style={styles.tableTd}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '800',
                              padding: '2px 8px',
                              borderRadius: '10px',
                              backgroundColor: isDefault ? '#DCFCE7' : '#FEF3C7',
                              color: isDefault ? '#15803D' : '#92400E',
                            }}
                          >
                            {isDefault ? 'GLOBAL DEFAULT' : 'CUSTOM OVERRIDE'}
                          </span>
                        </td>
                        <td style={styles.tableTd}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: '#64748B', textDecoration: 'line-through', fontSize: '12px' }}>
                              {log.previousDiscount}%
                            </span>
                            <span style={{ color: '#034EA2', fontWeight: '800', fontSize: '13px' }}>
                              → {log.newDiscount}%
                            </span>
                          </div>
                        </td>
                        <td style={styles.tableTd}>
                          <span style={{ fontSize: '12px', color: '#475569' }}>
                            {log.reason || 'Administrative adjustment'}
                          </span>
                        </td>
                        <td style={styles.tableTd}>
                          <span style={{ fontSize: '12px', color: '#0F2C59', fontWeight: '600' }}>
                            {log.updatedByName || 'Admin User'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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
      {/* UNIVERSAL CONFIRMATION MODAL */}
      {/* ==================================================================== */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel={confirmModal.confirmLabel}
        cancelLabel={confirmModal.cancelLabel}
        variant={confirmModal.variant}
        isLoading={confirmModal.isLoading}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
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
    lineHeight: '1.45',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    flexShrink: 0,
  },
  primarySaveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '11px 22px',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13.5px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
    transition: 'all 0.15s ease',
  },
  sectionSaveBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 20px',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    border: '1.5px solid #16A34A',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.22)',
    transition: 'all 0.15s ease',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#ECFDF5',
    color: '#065F46',
    border: '1px solid #A7F3D0',
    padding: '12px 18px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    border: '1px solid #FECACA',
    padding: '12px 18px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: '600',
    marginBottom: '16px',
  },
  tabBar: {
    display: 'flex',
    gap: '8px',
    borderBottom: '2px solid #E2E8F0',
    marginBottom: '20px',
    overflowX: 'auto',
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 18px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748B',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
  },
  activeTabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 18px',
    border: 'none',
    backgroundColor: '#FFFFFF',
    color: '#034EA2',
    fontWeight: '900',
    fontSize: '13px',
    cursor: 'pointer',
    borderBottom: '3px solid #034EA2',
    marginBottom: '-2px',
    borderRadius: '8px 8px 0 0',
    boxShadow: '0 -2px 6px rgba(0,0,0,0.02)',
    whiteSpace: 'nowrap',
  },
  tabContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    padding: '24px 28px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
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
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '18px',
  },
  cardHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  cardIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: '800',
    color: '#0F2C59',
  },
  cardHelp: {
    fontSize: '12px',
    color: '#64748B',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
  },
  inputPrefixWrap: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    overflow: 'hidden',
    width: 'fit-content',
  },
  inputPrefix: {
    padding: '8px 10px',
    fontSize: '14px',
    fontWeight: '800',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    borderRight: '1px solid #CBD5E1',
  },
  inputSuffix: {
    padding: '8px 10px',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#64748B',
    backgroundColor: '#F1F5F9',
    borderLeft: '1px solid #CBD5E1',
  },
  numericInput: {
    border: 'none',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: '700',
    color: '#0F2C59',
    outline: 'none',
    width: '100px',
  },
  numericInputSmall: {
    width: '80px',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0F2C59',
  },
  badgePill: {
    padding: '4px 10px',
    borderRadius: '20px',
    backgroundColor: '#DBEAFE',
    color: '#1D4ED8',
    fontSize: '12.5px',
    fontWeight: '800',
  },
  matrixTable: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  matrixTh: {
    backgroundColor: '#0F2C59',
    color: '#FFFFFF',
    padding: '12px 14px',
    fontSize: '12.5px',
    fontWeight: '800',
    textAlign: 'left',
    border: '1px solid #1E3A8A',
  },
  matrixRowHeader: {
    backgroundColor: '#F8FAFC',
    padding: '14px',
    border: '1px solid #E2E8F0',
    verticalAlign: 'middle',
    width: '240px',
  },
  matrixSubtext: {
    display: 'block',
    fontSize: '11px',
    color: '#64748B',
    marginTop: '2px',
  },
  matrixCell: {
    padding: '14px',
    border: '1px solid #E2E8F0',
    verticalAlign: 'middle',
    backgroundColor: '#FFFFFF',
  },
  cellRangeInputs: {
    display: 'flex',
    alignItems: 'center',
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
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap',
    marginBottom: '24px',
  },
  secondarySaveBtn: {
    padding: '10px 20px',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
    transition: 'all 0.15s ease',
  },
  kpiRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  kpiCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  kpiLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  kpiVal: {
    fontSize: '24px',
    fontWeight: '900',
    margin: '4px 0 2px 0',
  },
  kpiSub: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  tuningContainerCard: {
    backgroundColor: '#F8FAFC',
    border: '1.5px solid #CBD5E1',
    borderRadius: '12px',
    padding: '20px 24px',
    marginBottom: '24px',
  },
  tuningHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tuningSectionBadge: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#034EA2',
    backgroundColor: '#DBEAFE',
    padding: '2px 8px',
    borderRadius: '10px',
    letterSpacing: '0.04em',
  },
  searchDropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    maxWidth: '520px',
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
    zIndex: 100,
    maxHeight: '260px',
    overflowY: 'auto',
    marginTop: '4px',
  },
  searchDropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderBottom: '1px solid #F1F5F9',
    cursor: 'pointer',
    transition: 'background 0.15s ease',
  },
  contractorAvatarBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0F2C59',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '800',
    flexShrink: 0,
  },
  activeTuningBox: {
    backgroundColor: '#FFFFFF',
    border: '1.5px solid #93C5FD',
    borderRadius: '10px',
    padding: '18px 20px',
    marginTop: '16px',
    boxShadow: '0 2px 6px rgba(3, 78, 162, 0.06)',
  },
  tuningEmptyHint: {
    marginTop: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#F1F5F9',
    border: '1px dashed #CBD5E1',
    fontSize: '12.5px',
    color: '#64748B',
    textAlign: 'center',
  },
  filterSelect: {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '12.5px',
    color: '#0F2C59',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    fontWeight: '600',
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
    padding: '9px 18px',
    backgroundColor: '#0F2C59',
    color: '#FFFFFF',
    border: '1.5px solid #0F2C59',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(15, 44, 89, 0.2)',
    transition: 'all 0.15s ease',
  },
  editActionBtn: {
    padding: '7px 15px',
    backgroundColor: '#EFF6FF',
    border: '1.5px solid #93C5FD',
    borderRadius: '7px',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#1D4ED8',
    cursor: 'pointer',
    marginRight: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 3px rgba(29, 78, 216, 0.08)',
  },
  deleteActionBtn: {
    padding: '7px 15px',
    backgroundColor: '#FEF2F2',
    border: '1.5px solid #FECACA',
    borderRadius: '7px',
    fontSize: '12.5px',
    fontWeight: '700',
    color: '#DC2626',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    transition: 'all 0.15s ease',
    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.08)',
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
    padding: '9px 18px',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.15s ease',
  },
  modalSaveBtn: {
    padding: '10px 20px',
    backgroundColor: '#15803D',
    color: '#FFFFFF',
    border: '1.5px solid #16A34A',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
    transition: 'all 0.15s ease',
  },
};
