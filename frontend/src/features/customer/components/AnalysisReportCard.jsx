// =============================================
// Deck Estimator — Analysis Report Card Component (Phase 7)
// =============================================

import React from 'react';

const CONDITION_METADATA = {
  1: {
    title: 'Level 1 — Good Condition',
    color: '#15803d',
    bgColor: '#dcfce7',
    desc: 'Surface coating appears intact with uniform appearance and no significant visible deterioration.',
  },
  2: {
    title: 'Level 2 — Mild Wear',
    color: '#854d0e',
    bgColor: '#fef9c3',
    desc: 'Minor surface wear, slight color fading, or localized coating thinning. Suitable for maintenance wash or recoat.',
  },
  3: {
    title: 'Level 3 — Moderate Deterioration',
    color: '#c2410c',
    bgColor: '#ffedd5',
    desc: 'Noticeable peeling, discoloration, or surface wear. Substantial preparation, stripping, or power wash recommended.',
  },
  4: {
    title: 'Level 4 — Severe Deterioration',
    color: '#b91c1c',
    bgColor: '#fee2e2',
    desc: 'Extensive coating failure, weathering, and widespread surface cracking. Comprehensive restoration needed.',
  },
  5: {
    title: 'Level 5 — Significant Visible Wood Damage',
    color: '#7f1d1d',
    bgColor: '#fecaca',
    desc: 'Visible splintering, board fissures, or localized wood damage detected. Professional on-site physical inspection recommended.',
  },
};

const QUALITY_COLORS = {
  GOOD: { color: '#15803d', bg: '#dcfce7' },
  FAIR: { color: '#b45309', bg: '#fef3c7' },
  POOR: { color: '#b91c1c', bg: '#fee2e2' },
};

export default function AnalysisReportCard({ analysis, onRetry }) {
  if (!analysis) return null;

  const isUnableToAssess = analysis.analysisStatus === 'UNABLE_TO_ASSESS';
  const isFailed = analysis.analysisStatus === 'FAILED';
  const isReviewRequired = analysis.manualReview?.required;

  const levelMeta = analysis.conditionLevel ? CONDITION_METADATA[analysis.conditionLevel] : null;
  const quality = analysis.imageQuality?.label || 'GOOD';
  const qualityMeta = QUALITY_COLORS[quality] || QUALITY_COLORS.GOOD;

  return (
    <div style={styles.card}>
      {/* Top Header */}
      <div style={styles.header}>
        <div>
          <div style={styles.tagRow}>
            <span style={styles.phaseTag}>AI Visual Analysis (Phase 7)</span>
            <span
              style={{
                ...styles.statusBadge,
                backgroundColor:
                  analysis.analysisStatus === 'COMPLETED'
                    ? '#dcfce7'
                    : analysis.analysisStatus === 'REQUIRES_MANUAL_REVIEW'
                    ? '#ffedd5'
                    : '#fee2e2',
                color:
                  analysis.analysisStatus === 'COMPLETED'
                    ? '#15803d'
                    : analysis.analysisStatus === 'REQUIRES_MANUAL_REVIEW'
                    ? '#c2410c'
                    : '#b91c1c',
              }}
            >
              {analysis.analysisStatus}
            </span>
          </div>
          <h3 style={styles.heading}>Automated Deck Condition Report</h3>
          <p style={styles.subtext}>
            Evaluated on {new Date(analysis.createdAt).toLocaleDateString()} at{' '}
            {new Date(analysis.createdAt).toLocaleTimeString()}
          </p>
        </div>

        {(isFailed || isUnableToAssess) && onRetry && (
          <button type="button" onClick={() => onRetry(analysis._id || analysis.id)} style={styles.retryBtn}>
            🔄 Retry Analysis
          </button>
        )}
      </div>

      {/* Optical Image Quality Banner */}
      <div style={styles.qualityBar}>
        <div style={styles.qualityLeft}>
          <span style={styles.qualityTitle}>Photograph Quality Assessment:</span>
          <span style={{ ...styles.qualityBadge, backgroundColor: qualityMeta.bg, color: qualityMeta.color }}>
            {quality}
          </span>
          {analysis.imageQuality?.resolution && (
            <span style={styles.metaMuted}>({analysis.imageQuality.resolution})</span>
          )}
        </div>
        {analysis.imageQuality?.blurScore !== null && (
          <span style={styles.metaMuted}>
            Sharpness Score: {analysis.imageQuality.blurScore} | Exposure: {analysis.imageQuality.brightness}
          </span>
        )}
      </div>

      {/* Unable to Assess Warning */}
      {isUnableToAssess && (
        <div style={styles.warningBox}>
          <strong>⚠️ Unable to Assess Deck Condition</strong>
          <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
            {analysis.manualReview?.reason ||
              'Photograph optical quality is too blurry, dark, or low-resolution for reliable automated assessment.'}
          </p>
          <div style={{ marginTop: '8px', fontSize: '12px', color: '#854d0e' }}>
            Recommendation: Please upload a clear, well-lit photograph focusing on the main deck floorboards.
          </div>
        </div>
      )}

      {/* Failed Request Notice */}
      {isFailed && (
        <div style={styles.errorBox}>
          <strong>❌ Analysis Processing Failed</strong>
          <p style={{ margin: '6px 0 0', fontSize: '13px' }}>
            {analysis.errorMessage || 'The automated analysis engine encountered an unexpected error.'}
          </p>
        </div>
      )}

      {/* Condition Severity Level Display */}
      {levelMeta && (
        <div style={{ ...styles.levelCard, backgroundColor: levelMeta.bgColor, borderColor: levelMeta.color }}>
          <div style={styles.levelHeader}>
            <div style={{ ...styles.levelTitle, color: levelMeta.color }}>{levelMeta.title}</div>
            {analysis.conditionConfidence !== null && (
              <div style={styles.confidenceBadge}>
                {Math.round(analysis.conditionConfidence * 100)}% Confidence
              </div>
            )}
          </div>
          <p style={styles.levelDesc}>{levelMeta.desc}</p>
        </div>
      )}

      {/* Manual Review Callout Box */}
      {isReviewRequired && !isUnableToAssess && (
        <div style={styles.reviewBox}>
          <div style={styles.reviewHeader}>
            <span style={{ fontSize: '16px' }}>🔍</span>
            <strong>Manual Review Advised</strong>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#9a3412' }}>
            {analysis.manualReview.reason ||
              'A qualified contractor should inspect the deck on-site to verify surface sound-ness.'}
          </p>
        </div>
      )}

      {/* Multi-Label Detected Defects Grid */}
      {Array.isArray(analysis.defects) && analysis.defects.length > 0 && (
        <div style={styles.defectsSection}>
          <h4 style={styles.sectionTitle}>Visible Surface Defects Detected</h4>
          <div style={styles.defectTags}>
            {analysis.defects.map((d, idx) => (
              <span
                key={idx}
                style={{
                  ...styles.defectPill,
                  backgroundColor: d.detected ? '#fee2e2' : '#f1f5f9',
                  color: d.detected ? '#b91c1c' : '#64748b',
                  border: d.detected ? '1px solid #fca5a5' : '1px solid #e2e8f0',
                  fontWeight: d.detected ? 600 : 400,
                }}
              >
                {d.detected ? '⚠️ ' : '✓ '}
                {d.label.replace(/_/g, ' ')}
                {d.confidence ? ` (${Math.round(d.confidence * 100)}%)` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Advisory Limitations Notice (Spec §1) */}
      <div style={styles.limitationsBox}>
        <div style={styles.limitationsHeading}>ℹ️ Important Inspection Notice:</div>
        <ul style={styles.limitationsList}>
          {(analysis.limitations || [
            'Assessment is based strictly on visible exterior photograph surfaces.',
            'Structural safety, joist integrity, load-bearing capacity, and hidden internal rot cannot be evaluated from photographs.',
            'Results are intended for restoration estimate planning and do not substitute for a physical contractor inspection.',
          ]).map((lim, idx) => (
            <li key={idx}>{lim}</li>
          ))}
        </ul>
      </div>

      {/* Technical Metadata Footer */}
      <div style={styles.footer}>
        <span>
          Model: {analysis.model?.name || 'MobileNetV3'} v{analysis.model?.version || '1.0.0'}
        </span>
        {analysis.inferenceDurationMs && <span>Latency: {analysis.inferenceDurationMs}ms</span>}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    marginBottom: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  tagRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '4px',
  },
  phaseTag: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '4px',
    textTransform: 'uppercase',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: 700,
  },
  heading: {
    margin: '4px 0 2px',
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
  },
  subtext: {
    margin: 0,
    fontSize: '12px',
    color: '#64748b',
  },
  retryBtn: {
    padding: '6px 12px',
    backgroundColor: '#f1f5f9',
    color: '#0f172a',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  qualityBar: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    padding: '8px 12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    fontSize: '12px',
    flexWrap: 'wrap',
    gap: '8px',
  },
  qualityLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  qualityTitle: {
    fontWeight: 600,
    color: '#334155',
  },
  qualityBadge: {
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 700,
  },
  metaMuted: {
    color: '#64748b',
  },
  warningBox: {
    backgroundColor: '#fef9c3',
    border: '1px solid #fde047',
    color: '#713f12',
    padding: '12px 14px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    padding: '12px 14px',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  levelCard: {
    border: '1.5px solid',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  levelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },
  levelTitle: {
    fontSize: '17px',
    fontWeight: 800,
  },
  confidenceBadge: {
    backgroundColor: '#ffffff',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
    color: '#0f172a',
    border: '1px solid rgba(0,0,0,0.1)',
  },
  levelDesc: {
    margin: 0,
    fontSize: '13px',
    color: '#334155',
    lineHeight: '1.4',
  },
  reviewBox: {
    backgroundColor: '#fff7ed',
    border: '1px solid #fdba74',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px',
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#9a3412',
    fontSize: '14px',
  },
  defectsSection: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 8px',
  },
  defectTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  defectPill: {
    padding: '4px 10px',
    borderRadius: '14px',
    fontSize: '12px',
  },
  limitationsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: '6px',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    marginBottom: '14px',
  },
  limitationsHeading: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '4px',
  },
  limitationsList: {
    margin: 0,
    paddingLeft: '18px',
    fontSize: '11px',
    color: '#64748b',
    lineHeight: '1.4',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#94a3b8',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '10px',
  },
};
