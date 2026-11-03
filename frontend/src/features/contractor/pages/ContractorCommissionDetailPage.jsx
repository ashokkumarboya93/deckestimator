// =============================================
// Deck Estimator — Contractor Commission Transaction Details Page
// =============================================
// Matches Image 3 (Bottom Right) Visual Reference:
// - Breadcrumbs: Commissions & Earnings > Commission Details
// - Title: Commission Transaction — COM-1007 + Payable badge
// - Project & Estimate Details card (Lakeview Deck Refinish, Mark Johnson, EST-20261028-07124B, Project Value: $10,820, Rate: 4.5%, Commission: $486.00)
// - Transaction Details card: Transaction ID, Status, Earned On, Payout Due, Payment Method, Remarks
// - Commission Timeline: Estimate Created -> Job Converted -> Commission Earned -> Payout

import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

export default function ContractorCommissionDetailPage() {
  const navigate = useNavigate();
  const { commissionId } = useParams();

  const id = commissionId || 'COM-1007';

  return (
    <div style={styles.container}>
      {/* 1. BREADCRUMBS */}
      <div style={styles.breadcrumbRow}>
        <Link to="/contractor/commissions" style={styles.breadcrumbLink}>
          &larr; Commissions &amp; Earnings
        </Link>
        <span style={styles.breadcrumbDivider}>&rsaquo;</span>
        <span style={styles.breadcrumbCurrent}>Commission Details</span>
      </div>

      {/* 2. TITLE & STATUS */}
      <div style={styles.titleRow}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={styles.pageTitle}>Commission Transaction &mdash; {id}</h1>
          <span style={styles.payableBadge}>Payable</span>
        </div>
        <p style={styles.pageSub}>Detailed information for this commission earning.</p>
      </div>

      {/* 3. TWO CARDS: PROJECT & ESTIMATE DETAILS (LEFT) + TRANSACTION DETAILS (RIGHT) */}
      <div style={styles.detailsGrid}>
        {/* Left: Project & Estimate Details */}
        <div style={styles.card}>
          <h3 style={styles.cardHeading}>Project &amp; Estimate Details</h3>
          <div style={styles.projectHeaderRow}>
            <img
              src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=120&q=80"
              alt="Deck"
              style={styles.deckThumb}
            />
            <div>
              <div style={styles.projectTitle}>Lakeview Deck Refinish</div>
              <div style={styles.clientSub}>Mark Johnson</div>
            </div>
          </div>

          <div style={styles.dataList}>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Estimate #</span>
              <span style={styles.dataVal}>EST-20261028-07124B</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Project Value</span>
              <span style={styles.dataVal}>$10,820.00</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Commission Rate</span>
              <span style={styles.dataVal}>4.5%</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Commission Amount</span>
              <span style={styles.dataValBold}>$486.00</span>
            </div>
          </div>
        </div>

        {/* Right: Transaction Details */}
        <div style={styles.card}>
          <h3 style={styles.cardHeading}>Transaction Details</h3>
          <div style={styles.dataList}>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Transaction ID</span>
              <span style={styles.dataVal}>{id}</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Status</span>
              <span style={styles.payableText}>Payable</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Earned On</span>
              <span style={styles.dataVal}>Oct 28, 2026</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Payout Due</span>
              <span style={styles.dataVal}>Nov 15, 2026</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Payment Method</span>
              <span style={styles.dataVal}>Bank Transfer</span>
            </div>
            <div style={styles.dataRow}>
              <span style={styles.dataLabel}>Remarks</span>
              <span style={styles.dataVal}>Commission from estimate conversion</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. COMMISSION TIMELINE */}
      <div style={styles.timelineCard}>
        <h3 style={styles.cardHeading}>Commission Timeline</h3>

        <div style={styles.timelineRow}>
          {/* Step 1 */}
          <div style={styles.timelineStep}>
            <div style={styles.timelineCircleActive}>✓</div>
            <div style={styles.stepTitle}>Estimate Created</div>
            <div style={styles.stepDate}>Oct 28, 2026</div>
          </div>

          <div style={styles.timelineLineActive} />

          {/* Step 2 */}
          <div style={styles.timelineStep}>
            <div style={styles.timelineCircleActive}>✓</div>
            <div style={styles.stepTitle}>Job Converted</div>
            <div style={styles.stepDate}>Oct 30, 2026</div>
          </div>

          <div style={styles.timelineLineActive} />

          {/* Step 3 */}
          <div style={styles.timelineStep}>
            <div style={styles.timelineCircleCurrent}>⦿</div>
            <div style={styles.stepTitle}>Commission Earned</div>
            <div style={styles.stepDate}>Oct 28, 2026</div>
          </div>

          <div style={styles.timelineLinePending} />

          {/* Step 4 */}
          <div style={styles.timelineStep}>
            <div style={styles.timelineCirclePending}>○</div>
            <div style={styles.stepTitle}>Payout</div>
            <div style={styles.stepDate}>Pending</div>
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
    gap: '24px',
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
    flexDirection: 'column',
  },
  pageTitle: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#0f172a',
    margin: 0,
  },
  payableBadge: {
    backgroundColor: '#fef3c7',
    color: '#b45309',
    fontSize: '11px',
    fontWeight: '700',
    padding: '3px 10px',
    borderRadius: '12px',
  },
  pageSub: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
  },
  card: {
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
    margin: '0 0 18px 0',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '12px',
  },
  projectHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '18px',
  },
  deckThumb: {
    width: '46px',
    height: '46px',
    borderRadius: '8px',
    objectFit: 'cover',
  },
  projectTitle: {
    fontWeight: '700',
    color: '#0f172a',
    fontSize: '14px',
  },
  clientSub: {
    fontSize: '12px',
    color: '#64748b',
    marginTop: '2px',
  },
  dataList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  dataRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
  },
  dataLabel: {
    color: '#64748b',
  },
  dataVal: {
    color: '#0f172a',
    fontWeight: '600',
  },
  dataValBold: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: '15px',
  },
  payableText: {
    color: '#b45309',
    fontWeight: '800',
  },
  timelineCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  timelineRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 40px',
  },
  timelineStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  timelineCircleActive: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '14px',
    marginBottom: '8px',
  },
  timelineCircleCurrent: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    border: '2px solid #1d4ed8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '14px',
    marginBottom: '8px',
  },
  timelineCirclePending: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
    border: '1.5px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '14px',
    marginBottom: '8px',
  },
  timelineLineActive: {
    flex: 1,
    height: '3px',
    backgroundColor: '#1d4ed8',
    margin: '0 14px 28px 14px',
  },
  timelineLinePending: {
    flex: 1,
    height: '3px',
    backgroundColor: '#e2e8f0',
    margin: '0 14px 28px 14px',
  },
  stepTitle: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#0f172a',
  },
  stepDate: {
    fontSize: '11px',
    color: '#64748b',
    marginTop: '2px',
  },
};
