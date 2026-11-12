// =============================================
// Deck Estimator — Customer Enquiry Modal (Phase 8)
// =============================================

import React, { useEffect, useState } from 'react';
import { leadApi } from '../api/leadApi';
import { getErrorMessage } from '../../../api/apiErrors';

export default function EnquiryModal({ isOpen, onClose, deckId, estimateId, onSuccess }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('any');
  const [preferredContactTime, setPreferredContactTime] = useState('any');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      setError('Please provide both a subject and an enquiry message.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await leadApi.createLead({
        deckId,
        estimateId: estimateId || undefined,
        leadSource: estimateId ? 'estimate_enquiry' : 'customer_estimator',
        enquiry: {
          subject: subject.trim(),
          message: message.trim(),
          preferredContactMethod,
          preferredContactTime,
          additionalNotes: additionalNotes.trim(),
        },
      });

      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to submit enquiry.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={modalStyles.overlay} className="drp-modal-overlay" onClick={onClose}>
      <div
        style={modalStyles.card}
        className="drp-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="enquiry-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalStyles.header}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <h2 id="enquiry-modal-title" style={modalStyles.title}>Request Professional Restoration</h2>
            <p style={modalStyles.subtitle}>
              Submit your project enquiry to match with approved local deck contractors.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close enquiry modal"
            style={modalStyles.closeBtn}
            className="drp-touch-btn"
          >
            &times;
          </button>
        </div>

        {error && (
          <div style={modalStyles.errorBanner}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={modalStyles.form}>
          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Enquiry Subject *</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Cedar Deck Restoration & Power Washing"
              style={modalStyles.input}
              required
            />
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Project Description &amp; Requirements *</label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your timeline, desired finish, accessibility, or any questions for the contractor..."
              style={modalStyles.textarea}
              required
            />
          </div>

          <div style={modalStyles.twoColRow} className="drp-grid-collapse">
            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Preferred Contact Method</label>
              <select
                value={preferredContactMethod}
                onChange={(e) => setPreferredContactMethod(e.target.value)}
                style={modalStyles.input}
              >
                <option value="any">Any (Phone or Email)</option>
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div style={modalStyles.field}>
              <label style={modalStyles.label}>Preferred Contact Time</label>
              <input
                type="text"
                value={preferredContactTime}
                onChange={(e) => setPreferredContactTime(e.target.value)}
                placeholder="e.g. Weekdays 2-5 PM"
                style={modalStyles.input}
              />
            </div>
          </div>

          <div style={modalStyles.field}>
            <label style={modalStyles.label}>Additional Notes (Optional)</label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Gate code, dogs on premises, parking notes, etc."
              style={modalStyles.input}
            />
          </div>

          <div style={modalStyles.actions} className="drp-flex-wrap-mobile">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={modalStyles.cancelBtn}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ ...modalStyles.submitBtn, opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    backdropFilter: 'blur(3px)',
    padding: '16px',
  },
  card: {
    width: '100%',
    maxWidth: '580px',
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '14px',
    backgroundColor: '#ffffff',
    padding: '24px',
    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.28)',
    border: '1px solid #e2e8f0',
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '12px',
  },
  title: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '0.82rem',
    color: '#64748b',
  },
  closeBtn: {
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#475569',
    width: '36px',
    height: '36px',
    fontSize: '20px',
    lineHeight: '1',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  errorBanner: {
    marginTop: '14px',
    borderRadius: '8px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    padding: '10px 12px',
    fontSize: '0.88rem',
    color: '#b91c1c',
  },
  form: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: 0,
  },
  twoColRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: '#475569',
  },
  input: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    padding: '10px 12px',
    fontSize: '0.9rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
  },
  textarea: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    padding: '10px 12px',
    fontSize: '0.9rem',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    resize: 'vertical',
  },
  actions: {
    marginTop: '6px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '14px',
  },
  cancelBtn: {
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#ffffff',
    color: '#334155',
    padding: '9px 16px',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  submitBtn: {
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#d97706',
    color: '#ffffff',
    padding: '9px 18px',
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
};

