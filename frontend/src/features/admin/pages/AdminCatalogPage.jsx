// =============================================
// Deck Estimator — Admin Catalog Management Hub
// =============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MaterialCategoriesTab from '../components/MaterialCategoriesTab';
import MaterialsTab from '../components/MaterialsTab';
import ServiceCategoriesTab from '../components/ServiceCategoriesTab';
import ServicesTab from '../components/ServicesTab';
import CompatibilityTab from '../components/CompatibilityTab';
import PricingConfigTab from '../components/PricingConfigTab';
import { useAuth } from '../../auth/hooks/useAuth';

const TABS = [
  { id: 'material-categories', label: 'Material Categories' },
  { id: 'materials', label: 'Materials Catalog' },
  { id: 'service-categories', label: 'Service Categories' },
  { id: 'services', label: 'Services Catalog' },
  { id: 'compatibility', label: 'Compatibility Matrix' },
  { id: 'pricing-config', label: 'Pricing Rules (Phase 6)' },
];

export default function AdminCatalogPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('materials');
  const { user } = useAuth();

  return (
    <div style={styles.container}>
      {/* Top Page Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.badgeRow}>
            <span style={styles.adminBadge}>Admin Portal</span>
            <span style={styles.phaseBadge}>Phase 5 Catalog</span>
            <button
              type="button"
              onClick={() => navigate('/admin/contractor-verifications')}
              style={{
                marginLeft: '12px',
                padding: '4px 10px',
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🛡 Contractor Verifications →
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/leads')}
              style={{
                marginLeft: '6px',
                padding: '4px 10px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                border: '1px solid #bbf7d0',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              📥 Leads Hub →
            </button>
          </div>
          <h1 style={styles.pageTitle}>Material & Service Catalog Management</h1>
          <p style={styles.subtitle}>
            Manage manufacturer products, specifications, service definitions, and compatibility matrices.
            Catalog modifications are restricted to administrators with audit trail recording.
          </p>
        </div>
        <div style={styles.userInfoBox}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
            {user?.fullName || 'Administrator'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Role: Admin</div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={isActive ? styles.tabBtnActive : styles.tabBtn}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active Tab Content Panel */}
      <div style={styles.tabContentPanel}>
        {activeTab === 'material-categories' && <MaterialCategoriesTab />}
        {activeTab === 'materials' && <MaterialsTab />}
        {activeTab === 'service-categories' && <ServiceCategoriesTab />}
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'compatibility' && <CompatibilityTab />}
        {activeTab === 'pricing-config' && <PricingConfigTab />}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '24px 20px 48px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
    borderBottom: '1px solid #e0e0e0',
    paddingBottom: '20px',
  },
  badgeRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  adminBadge: {
    background: '#d32f2f',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  phaseBadge: {
    background: '#1976d2',
    color: '#fff',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
  },
  pageTitle: {
    margin: '0 0 6px 0',
    fontSize: '26px',
    fontWeight: 700,
    color: '#1a1a1a',
  },
  subtitle: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
    maxWidth: '780px',
    lineHeight: '1.5',
  },
  userInfoBox: {
    background: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: '6px',
    padding: '10px 16px',
    textAlign: 'right',
  },
  tabBar: {
    display: 'flex',
    gap: '4px',
    borderBottom: '2px solid #e0e0e0',
    marginBottom: '24px',
    overflowX: 'auto',
  },
  tabBtn: {
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: '#666',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid #1976d2',
    marginBottom: '-2px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 700,
    color: '#1976d2',
    whiteSpace: 'nowrap',
  },
  tabContentPanel: {
    background: '#fff',
    borderRadius: '8px',
  },
};

