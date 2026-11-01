// =============================================
// Deck Estimator — Customer Enquiry Modal (Phase 8)
// =============================================

import React, { useState } from 'react';
import { leadApi } from '../api/leadApi';

export default function EnquiryModal({ isOpen, onClose, deckId, estimateId, onSuccess }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [preferredContactMethod, setPreferredContactMethod] = useState('any');
  const [preferredContactTime, setPreferredContactTime] = useState('any');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setError(err?.response?.data?.error?.message || err.message || 'Failed to submit enquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Request Professional Restoration
            </h2>
            <p className="text-xs text-slate-500">
              Submit your project enquiry to match with approved local deck contractors.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Enquiry Subject *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Cedar Deck Restoration & Power Washing"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Project Description & Requirements *
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your timeline, desired finish, accessibility, or any questions for the contractor..."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Preferred Contact Method
              </label>
              <select
                value={preferredContactMethod}
                onChange={(e) => setPreferredContactMethod(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="any">Any (Phone or Email)</option>
                <option value="phone">Phone Call</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Preferred Contact Time
              </label>
              <input
                type="text"
                value={preferredContactTime}
                onChange={(e) => setPreferredContactTime(e.target.value)}
                placeholder="e.g. Weekdays 2-5 PM"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Gate code, dogs on premises, parking notes, etc."
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Enquiry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

