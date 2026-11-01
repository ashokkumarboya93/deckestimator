// =============================================
// Deck Estimator — Deck Analysis Section Component (Phase 7)
// =============================================

import React, { useState, useEffect, useCallback } from 'react';
import { createDeckAnalysis, getDeckAnalyses, retryAnalysis } from '../api/analysisApi';
import AnalysisReportCard from './AnalysisReportCard';

export default function DeckAnalysisSection({ deckId, isContractor = false }) {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const fetchAnalyses = useCallback(async () => {
    if (!deckId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getDeckAnalyses(deckId);
      setAnalyses(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load condition analyses.');
    } finally {
      setLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const handleRequestAnalysis = async () => {
    setRequesting(true);
    setError(null);
    try {
      await createDeckAnalysis(deckId);
      await fetchAnalyses();
    } catch (err) {
      setError(err.message || 'Failed to generate AI condition analysis.');
    } finally {
      setRequesting(false);
    }
  };

  const handleRetry = async (analysisId) => {
    setRequesting(true);
    setError(null);
    try {
      await retryAnalysis(analysisId);
      await fetchAnalyses();
    } catch (err) {
      setError(err.message || 'Failed to retry condition analysis.');
    } finally {
      setRequesting(false);
    }
  };

  const latestAnalysis = analyses.length > 0 ? analyses[0] : null;
  const historicalAnalyses = analyses.length > 1 ? analyses.slice(1) : [];

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <h2 style={styles.sectionTitle}>🤖 AI Visual Condition Analysis</h2>
          <p style={styles.sectionSub}>
            Automated optical inspection assesses visible deck surface wear, peeling, discoloration, and board damage
            from your uploaded photographs.
          </p>
        </div>

        {!isContractor && (
          <button
            type="button"
            onClick={handleRequestAnalysis}
            disabled={requesting || loading}
            style={styles.requestBtn}
          >
            {requesting ? 'Analyzing Deck Photos...' : '✨ Run AI Condition Analysis'}
          </button>
        )}
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {loading ? (
        <div style={styles.loadingBox}>Checking for condition analysis reports...</div>
      ) : !latestAnalysis ? (
        <div style={styles.emptyBox}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📸</div>
          <h4 style={{ margin: '0 0 6px', fontSize: '15px', color: '#0f172a' }}>No Condition Analysis Generated Yet</h4>
          <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b', maxWidth: '500px' }}>
            Request an automated evaluation to assess visible coating deterioration and surface wear before creating
            restoration estimates. Ensure you have uploaded at least one clear photograph of your deck.
          </p>
          {!isContractor && (
            <button
              type="button"
              onClick={handleRequestAnalysis}
              disabled={requesting}
              style={styles.requestBtn}
            >
              {requesting ? 'Processing Photographs...' : 'Analyze Deck Condition Now'}
            </button>
          )}
        </div>
      ) : (
        <div>
          <AnalysisReportCard analysis={latestAnalysis} onRetry={handleRetry} />

          {/* Historical Analyses Drawer */}
          {historicalAnalyses.length > 0 && (
            <div style={styles.historyContainer}>
              <button
                type="button"
                onClick={() => setShowHistory(!showHistory)}
                style={styles.historyToggleBtn}
              >
                {showHistory ? '▲ Hide Analysis History' : `▼ View Earlier Analysis Reports (${historicalAnalyses.length})`}
              </button>

              {showHistory && (
                <div style={{ marginTop: '16px' }}>
                  {historicalAnalyses.map((hist) => (
                    <AnalysisReportCard key={hist._id || hist.id} analysis={hist} onRetry={handleRetry} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '20px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0f172a',
    margin: '0 0 4px',
  },
  sectionSub: {
    fontSize: '13px',
    color: '#64748b',
    margin: 0,
    maxWidth: '650px',
    lineHeight: '1.4',
  },
  requestBtn: {
    backgroundColor: '#7c3aed',
    color: '#ffffff',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '13px',
    marginBottom: '16px',
  },
  loadingBox: {
    padding: '30px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
  },
  emptyBox: {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    border: '1px dashed #cbd5e1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  historyContainer: {
    marginTop: '16px',
    borderTop: '1px solid #f1f5f9',
    paddingTop: '16px',
  },
  historyToggleBtn: {
    background: 'none',
    border: 'none',
    color: '#7c3aed',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
};
