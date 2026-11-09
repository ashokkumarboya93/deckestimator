// =============================================
// Deck Estimator — Blocked Account Portal Experience
// =============================================
// Displayed when a Customer or Contractor has accountStatus === 'blocked'
// Provides warning notice and appeal mechanism routed directly to Admin "User Requests".

import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import mainLogo from '../../../assets/images/MainLodo.png';
import { client } from '../../../api/client';

export default function BlockedAccountPortal({ user }) {
  const { logout } = useAuth();
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState(null);

  // Check existing unblock request status
  useEffect(() => {
    let mounted = true;
    client.get('/users/unblock-request/status')
      .then((res) => {
        if (mounted && res.data?.data) {
          setSubmittedRequest(res.data.data);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmitAppeal = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please provide a message explaining your reactivation request.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await client.post('/users/unblock-request', {
        message: message.trim(),
        phone: phone.trim(),
      });
      setFeedback('Your reactivation appeal has been submitted successfully to Deck Restoration Plus Team.');
      setSubmittedRequest(res.data?.data || { status: 'pending', createdAt: new Date() });
      setMessage('');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to submit appeal request.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } finally {
      window.location.href = '/login';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Brand Header */}
        <div style={styles.brandHeader}>
          <img src={mainLogo} alt="Deck Restoration Plus" style={styles.logo} />
        </div>

        {/* Warning Banner */}
        <div style={styles.warningBanner}>
          <div style={styles.warningIconBox}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
          </div>
          <div>
            <h2 style={styles.warningTitle}>Account Access Restricted</h2>
            <p style={styles.warningText}>
              Your account has been blocked by the Deck Restoration Plus Administration. Portal features, estimates, and project tools are temporarily disabled for your profile.
            </p>
          </div>
        </div>

        {/* Status of Existing Request */}
        {submittedRequest && submittedRequest.status === 'pending' && (
          <div style={styles.pendingNotice}>
            <div style={styles.pendingDot} />
            <div>
              <div style={styles.pendingTitle}>Reactivation Appeal Under Review</div>
              <p style={styles.pendingBody}>
                You submitted an appeal on <strong>{new Date(submittedRequest.createdAt).toLocaleDateString()} at {new Date(submittedRequest.createdAt).toLocaleTimeString()}</strong>. Our team is reviewing your request.
              </p>
            </div>
          </div>
        )}

        {feedback && (
          <div style={styles.alertSuccess}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>{feedback}</span>
          </div>
        )}

        {error && (
          <div style={styles.alertError}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Request Form */}
        <div style={styles.formContainer}>
          <h3 style={styles.formTitle}>Raise Unblock Request to Deck Restoration Plus Team</h3>
          <p style={styles.formSubtitle}>
            If you believe this action was taken in error or if you have resolved any compliance questions, please explain below. An administrator will review your account dossier.
          </p>

          <form onSubmit={handleSubmitAppeal}>
            <div style={styles.rowTwo}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  type="text"
                  value={user?.fullName || ''}
                  disabled
                  style={{ ...styles.input, backgroundColor: '#f1f5f9', color: '#64748b' }}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Registered Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  style={{ ...styles.input, backgroundColor: '#f1f5f9', color: '#64748b' }}
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Contact Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Appeal Message / Details *</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="State why you are requesting to have your account unblocked, any relevant context, or steps taken..."
                style={styles.textarea}
                required
              />
            </div>

            <div style={styles.buttonRow}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Submitting Appeal...' : 'Submit Unblock Request'}
              </button>

              <button
                type="button"
                onClick={handleSignOut}
                style={styles.logoutBtn}
              >
                Sign Out
              </button>
            </div>
          </form>
        </div>

        {/* Footer Support Info */}
        <div style={styles.footerNote}>
          Need urgent assistance? Contact Deck Restoration Plus Support at <strong>support@deckrestorationplus.com</strong> or call <strong>(800) 555-DECK</strong>.
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a1628',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  card: {
    maxWidth: '680px',
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  brandHeader: {
    padding: '24px 32px',
    backgroundColor: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottom: '1px solid #1e293b',
  },
  logo: {
    height: '46px',
    objectFit: 'contain',
  },
  warningBanner: {
    backgroundColor: '#fef2f2',
    borderBottom: '1px solid #fee2e2',
    padding: '22px 32px',
    display: 'flex',
    gap: '16px',
    alignItems: 'flex-start',
  },
  warningIconBox: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  warningTitle: {
    margin: '0 0 6px 0',
    fontSize: '18px',
    fontWeight: '800',
    color: '#991b1b',
  },
  warningText: {
    margin: 0,
    fontSize: '13px',
    lineHeight: '1.5',
    color: '#7f1d1d',
  },
  pendingNotice: {
    margin: '20px 32px 0 32px',
    padding: '14px 18px',
    backgroundColor: '#fffbeb',
    border: '1px solid #fef3c7',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  pendingDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#f59e0b',
    flexShrink: 0,
  },
  pendingTitle: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#92400e',
    marginBottom: '2px',
  },
  pendingBody: {
    fontSize: '12px',
    color: '#78350f',
    margin: 0,
  },
  alertSuccess: {
    margin: '20px 32px 0 32px',
    padding: '12px 16px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#166534',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  alertError: {
    margin: '20px 32px 0 32px',
    padding: '12px 16px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  formContainer: {
    padding: '28px 32px 20px 32px',
  },
  formTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 6px 0',
  },
  formSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    lineHeight: '1.45',
    margin: '0 0 20px 0',
  },
  rowTwo: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
    marginBottom: '14px',
  },
  formGroup: {
    marginBottom: '14px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  buttonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '18px',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
    boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)',
    cursor: 'pointer',
  },
  logoutBtn: {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    padding: '12px 18px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '13px',
    cursor: 'pointer',
  },
  footerNote: {
    padding: '16px 32px',
    backgroundColor: '#f8fafc',
    borderTop: '1px solid #f1f5f9',
    fontSize: '11px',
    color: '#64748b',
    textAlign: 'center',
  },
};

