// =============================================
// Deck Estimator — Contractor Commercial Estimate Builder
// =============================================
// Matches Image 4 (Bottom Left) Visual Reference:
// - Title & description: Commercial Estimate Builder
// - Breadcrumbs: Estimates > Create Estimate
// - Project & Deck Area summary
// - Itemized Estimate Breakdown table: Item, Unit, Qty, Unit Cost, Amount
//   * Deck Cleaning (Power Wash), Sanding & Surface Prep, Staining (2 Coats), Railings Restoration
// - Estimate Summary card: Subtotal ($2,880.00), Markup (15%) ($432.00), Discount (Partner 5%) (-$165.60), Tax (8.25%) ($259.98), Total Estimate ($3,406.38)
// - Actions: Save Draft | Generate Estimate

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getDeckById, getDecks } from '../../customer/api/decksApi';
import { createEstimate } from '../../customer/api/estimatesApi';

export default function ContractorEstimateBuilderPage() {
  const navigate = useNavigate();
  const { deckId } = useParams();

  const [currentDeck, setCurrentDeck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [markupPercent, setMarkupPercent] = useState(15);
  const [discountPercent, setDiscountPercent] = useState(5);

  useEffect(() => {
    async function loadDeck() {
      setLoading(true);
      try {
        if (deckId && deckId.length === 24) {
          const d = await getDeckById(deckId);
          setCurrentDeck(d);
        } else {
          const res = await getDecks({ limit: 1 });
          const list = res?.decks || res?.data?.decks || (Array.isArray(res) ? res : []);
          if (list && list.length > 0) {
            setCurrentDeck(list[0]);
          }
        }
      } catch (err) {
        console.warn('Could not load deck for estimate builder:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDeck();
  }, [deckId]);

  // Line items matching Image 4
  const area = currentDeck?.dimensions?.area || 400;
  const lineItems = [
    { name: 'Deck Cleaning (Power Wash)', unit: 'sq ft', qty: area, unitCost: 2.50, amount: area * 2.50 },
    { name: 'Sanding & Surface Prep', unit: 'sq ft', qty: area, unitCost: 1.00, amount: area * 1.00 },
    { name: 'Staining (2 Coats)', unit: 'sq ft', qty: area, unitCost: 2.50, amount: area * 2.50 },
    { name: 'Railings Restoration', unit: 'ft', qty: 60, unitCost: 8.00, amount: 480.00 },
  ];

  const subtotal = lineItems.reduce((acc, cur) => acc + cur.amount, 0);
  const markupAmount = (subtotal * (markupPercent / 100));
  const discountAmount = ((subtotal + markupAmount) * (discountPercent / 100));
  const taxable = subtotal + markupAmount - discountAmount;
  const taxAmount = (taxable * 0.0825);
  const totalEstimate = taxable + taxAmount;

  async function handleSaveEstimate(status = 'draft') {
    setSubmitting(true);
    try {
      const targetDeckId = currentDeck?._id || (deckId && deckId.length === 24 ? deckId : null);
      if (!targetDeckId) {
        alert('Please create or select a deck project before generating an estimate.');
        navigate('/contractor/decks/new');
        return;
      }
      await createEstimate({
        deckId: targetDeckId,
        estimateName: `${currentDeck?.projectName || 'Deck'} Commercial Estimate`,
        floorArea: area,
        notes: `Commercial quote: Subtotal $${subtotal.toFixed(2)}, Markup (${markupPercent}%) $${markupAmount.toFixed(2)}, Discount (${discountPercent}%) -$${discountAmount.toFixed(2)}, Total $${totalEstimate.toFixed(2)}`,
      });
      alert('Commercial estimate generated and saved to database successfully!');
      navigate('/contractor/estimates');
    } catch (err) {
      alert(err?.message || 'Failed to generate estimate.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      {/* 1. BREADCRUMBS */}
      <div style={styles.breadcrumbRow}>
        <Link to="/contractor/estimates" style={styles.breadcrumbLink}>
          &larr; Estimates
        </Link>
        <span style={styles.breadcrumbDivider}>&rsaquo;</span>
        <span style={styles.breadcrumbCurrent}>Create Estimate</span>
      </div>

      {/* 2. TITLE BAR & ACTIONS */}
      <div style={styles.titleRow}>
        <div>
          <h1 style={styles.pageTitle}>Commercial Estimate Builder</h1>
          <p style={styles.pageSub}>Build a detailed estimate with materials, labor, markups and discounts.</p>
        </div>
        <div style={styles.actionBtnRow}>
          <button
            type="button"
            onClick={() => handleSaveEstimate('draft')}
            disabled={submitting}
            style={styles.saveDraftBtn}
          >
            {submitting ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSaveEstimate('submitted')}
            disabled={submitting}
            style={styles.genEstBtn}
          >
            {submitting ? 'Generating...' : 'Generate Estimate'}
          </button>
        </div>
      </div>

      {/* 3. PROJECT METADATA CARD */}
      <div style={styles.projectMetaCard}>
        <div><strong>Project:</strong> {currentDeck?.projectName || 'Riverside Deck Restoration'}</div>
        <div><strong>Deck Area:</strong> {area} sq ft</div>
      </div>

      {/* 4. TWO-COLUMN: ITEMIZED TABLE (LEFT) + ESTIMATE SUMMARY (RIGHT) */}
      <div style={styles.mainGrid}>
        {/* Left: Estimate Breakdown */}
        <div style={styles.tableCard}>
          <h2 style={styles.cardHeading}>Estimate Breakdown</h2>
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Item</th>
                  <th style={styles.th}>Unit</th>
                  <th style={styles.th}>Qty</th>
                  <th style={styles.th}>Unit Cost</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => (
                  <tr key={idx} style={styles.tr}>
                    <td style={styles.tdBold}>{item.name}</td>
                    <td style={styles.td}>{item.unit}</td>
                    <td style={styles.td}>{item.qty}</td>
                    <td style={styles.td}>${item.unitCost.toFixed(2)}</td>
                    <td style={{ ...styles.tdBold, textAlign: 'right' }}>${item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Estimate Summary */}
        <div style={styles.summaryCol}>
          <div style={styles.summaryCard}>
            <h3 style={styles.cardHeading}>Estimate Summary</h3>
            <div style={styles.sumList}>
              <div style={styles.sumRow}>
                <span style={styles.sumLabel}>Subtotal</span>
                <span style={styles.sumVal}>${subtotal.toFixed(2)}</span>
              </div>
              <div style={styles.sumRow}>
                <span style={styles.sumLabel}>Markup (15%)</span>
                <span style={styles.sumVal}>${markupAmount.toFixed(2)}</span>
              </div>
              <div style={styles.sumRow}>
                <span style={styles.sumLabel}>Discount (Partner 5%)</span>
                <span style={styles.sumValDiscount}>-${discountAmount.toFixed(2)}</span>
              </div>
              <div style={styles.sumRow}>
                <span style={styles.sumLabel}>Tax (8.25%)</span>
                <span style={styles.sumVal}>${taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div style={styles.totalBox}>
              <span style={styles.totalLabel}>Total Estimate</span>
              <span style={styles.totalValue}>${totalEstimate.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  breadcrumbRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  breadcrumbLink: {
    color: '#1d4ed8',
    textDecoration: 'none',
    fontWeight: '600',
  },
  breadcrumbDivider: {
    color: '#94a3b8',
  },
  breadcrumbCurrent: {
    color: '#64748b',
  },
  titleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a',
    margin: '0 0 4px 0',
  },
  pageSub: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
  },
  actionBtnRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  saveDraftBtn: {
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '10px 18px',
    fontSize: '13px',
    fontWeight: '700',
    color: '#0f172a',
    cursor: 'pointer',
  },
  genEstBtn: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(29, 78, 216, 0.25)',
  },
  projectMetaCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '14px 20px',
    display: 'flex',
    gap: '32px',
    fontSize: '13px',
    color: '#334155',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 340px',
    gap: '24px',
  },
  tableCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardHeading: {
    fontSize: '16px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 16px 0',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '13px',
  },
  th: {
    padding: '12px 14px',
    borderBottom: '1px solid #e2e8f0',
    color: '#64748b',
    fontWeight: '700',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px 14px',
    color: '#334155',
  },
  tdBold: {
    padding: '14px 14px',
    color: '#0f172a',
    fontWeight: '700',
  },
  summaryCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  sumList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '20px',
  },
  sumRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  sumLabel: {
    color: '#64748b',
  },
  sumVal: {
    color: '#0f172a',
    fontWeight: '700',
  },
  sumValDiscount: {
    color: '#16a34a',
    fontWeight: '700',
  },
  totalBox: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    borderRadius: '8px',
    padding: '14px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '13px',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: '18px',
    fontWeight: '900',
  },
};

