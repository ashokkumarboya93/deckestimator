// =============================================
// Deck Estimator — Contractor Verification Request Page
// =============================================
// Shown to unapproved contractors (draft, pending, under_review, rejected).
// Unapproved contractors cannot access the contractor dashboard until an Admin accepts/approves their request.
// Provides:
// 1. Business details submission form + optional license upload
// 2. Pending review status card with real-time status check
// 3. Rejection notice with admin reason & resubmission capability
// 4. Approved state redirect to dashboard

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { contractorLeadApi } from '../api/contractorLeadApi';
import { resolveAssetUrl } from '../../../api/client';
import { getErrorMessage } from '../../../api/apiErrors';
import mainLogo from '../../../assets/images/Main_Logo_v2.png';

export default function ContractorVerificationRequestPage() {
  const navigate = useNavigate();
  const { user, contractorProfile, refreshUser, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Business Form State
  const [formData, setFormData] = useState({
    businessName: '',
    businessPhone: '',
    businessEmail: '',
    website: '',
    licenseNumber: '',
    licenseJurisdiction: '',
    yearsOfExperience: 3,
    street: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  // Optional Document Upload State
  const [optionalDocFile, setOptionalDocFile] = useState(null);
  const [optionalDocCategory, setOptionalDocCategory] = useState('contractor_license');
  const [optionalDocNotes, setOptionalDocNotes] = useState('');

  // Supplemental upload state (while pending)
  const [uploadingExtra, setUploadingExtra] = useState(false);
  const [extraDocFile, setExtraDocFile] = useState(null);
  const [extraDocCategory, setExtraDocCategory] = useState('insurance_certificate');

  // Load existing profile & documents
  useEffect(() => {
    loadContractorData();
  }, []);

  async function loadContractorData() {
    setLoading(true);
    setError(null);
    try {
      const [profRes, docsRes] = await Promise.allSettled([
        contractorLeadApi.getProfile(),
        contractorLeadApi.getMyDocuments(),
      ]);

      let loadedProfile = null;
      if (profRes.status === 'fulfilled' && profRes.value) {
        loadedProfile = profRes.value?.data || profRes.value;
        setProfile(loadedProfile);
        setFormData({
          businessName: loadedProfile.businessName || '',
          businessPhone: loadedProfile.businessPhone || user?.phone || '',
          businessEmail: loadedProfile.businessEmail || user?.email || '',
          website: loadedProfile.website || '',
          licenseNumber: loadedProfile.licenseNumber || '',
          licenseJurisdiction: loadedProfile.licenseJurisdiction || 'TX',
          yearsOfExperience: loadedProfile.yearsOfExperience ?? 3,
          street: loadedProfile.businessAddress?.street || '',
          city: loadedProfile.businessAddress?.city || '',
          state: loadedProfile.businessAddress?.state || 'TX',
          zipCode: loadedProfile.businessAddress?.zipCode || '',
          notes: '',
        });
      }

      if (docsRes.status === 'fulfilled' && docsRes.value) {
        const docList = Array.isArray(docsRes.value) ? docsRes.value : docsRes.value?.data || [];
        setDocuments(docList);
      }

      // If already approved, can redirect immediately
      if (loadedProfile?.verificationStatus === 'approved') {
        navigate('/contractor/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Handle Form Change
  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  // Handle Business Details & Verification Submission
  async function handleSubmitApplication(e) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!formData.businessName.trim()) {
      setError('Business name is required.');
      return;
    }
    if (!formData.businessPhone.trim()) {
      setError('Business phone number is required.');
      return;
    }
    if (!formData.licenseNumber.trim()) {
      setError('Contractor license number is required.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Update Profile Information
      await contractorLeadApi.updateProfile({
        businessName: formData.businessName.trim(),
        businessPhone: formData.businessPhone.trim(),
        businessEmail: formData.businessEmail.trim() || undefined,
        website: formData.website.trim() || undefined,
        licenseNumber: formData.licenseNumber.trim(),
        licenseJurisdiction: formData.licenseJurisdiction.trim(),
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        businessAddress: {
          street: formData.street.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          zipCode: formData.zipCode.trim(),
          country: 'USA',
        },
      });

      // 2. If optional license document is provided, upload it
      if (optionalDocFile) {
        const uploadData = new FormData();
        uploadData.append('document', optionalDocFile);
        uploadData.append('documentType', optionalDocCategory);
        if (optionalDocNotes.trim()) {
          uploadData.append('notes', optionalDocNotes.trim());
        }
        await contractorLeadApi.uploadDocument(uploadData);
      }

      // 3. Submit Verification Request for Admin Review
      await contractorLeadApi.submitVerification(formData.notes.trim() || 'Contractor submitted verification application.');

      setSuccessMessage('Your verification request has been successfully submitted to Deck Pro administrators.');

      // 4. Refresh session state
      if (refreshUser) {
        await refreshUser();
      }

      // Reload fresh profile
      await loadContractorData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // Handle Supplemental Document Upload (While in Pending State)
  async function handleUploadSupplementalDoc(e) {
    e.preventDefault();
    if (!extraDocFile) {
      setError('Please select a file to upload.');
      return;
    }

    setUploadingExtra(true);
    setError(null);
    try {
      const uploadData = new FormData();
      uploadData.append('document', extraDocFile);
      uploadData.append('documentType', extraDocCategory);
      await contractorLeadApi.uploadDocument(uploadData);
      setSuccessMessage('Additional verification document uploaded successfully.');
      setExtraDocFile(null);

      // Refresh documents
      const docsRes = await contractorLeadApi.getMyDocuments();
      const docList = Array.isArray(docsRes) ? docsRes : docsRes?.data || [];
      setDocuments(docList);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploadingExtra(false);
    }
  }

  // Delete Document
  async function handleDeleteDoc(docId) {
    if (!window.confirm('Are you sure you want to remove this verification document?')) return;
    try {
      await contractorLeadApi.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => (d.id || d._id) !== docId));
      setSuccessMessage('✓ Document removed successfully.');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  // Real-time Status Refresh
  async function handleRefreshStatus() {
    setLoading(true);
    try {
      if (refreshUser) {
        await refreshUser();
      }
      await loadContractorData();
    } finally {
      setLoading(false);
    }
  }

  // Handle Logout
  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/login');
    }
  }

  const currentStatus = (profile?.verificationStatus || contractorProfile?.verificationStatus || user?.verificationStatus || 'pending').toLowerCase();
  const isPending = currentStatus === 'pending' || currentStatus === 'under_review';
  const isRejected = currentStatus === 'rejected';
  const isApproved = currentStatus === 'approved';

  if (loading && !profile) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner} />
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '500' }}>
          Loading your verification profile...
        </p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Main Container */}
      <div style={styles.content}>
        {/* Alerts */}
        {error && (
          <div style={styles.errorAlert}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" style={{ flexShrink: 0, marginRight: '10px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div style={styles.successAlert}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" style={{ flexShrink: 0, marginRight: '10px' }}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. Approved State */}
        {isApproved && (
          <div style={styles.card}>
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={styles.approvedIconCircle}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '16px 0 8px' }}>
                Your Contractor Account is Approved!
              </h2>
              <p style={{ color: '#475569', fontSize: '15px', maxWidth: '500px', margin: '0 auto 24px' }}>
                Your business licensing and credentials have been verified by Deck Pro administrators. You now have full access to your projects, lead dispatch inbox, and estimator tools.
              </p>
              <button
                type="button"
                onClick={() => navigate('/contractor/dashboard')}
                style={styles.primaryBtn}
              >
                Go to Contractor Dashboard &rarr;
              </button>
            </div>
          </div>
        )}

        {/* 2. Pending / Under Review State */}
        {isPending && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Status Hero Card */}
            <div style={styles.heroCard}>
              <div style={styles.heroHeader}>
                <div style={styles.pendingBadge}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginRight: '6px' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {currentStatus === 'under_review' ? 'UNDER ADMINISTRATIVE REVIEW' : 'PENDING ADMIN APPROVAL'}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleRefreshStatus}
                    style={styles.secondaryBtn}
                    title="Check if admin has approved your application"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                      <polyline points="23 4 23 10 17 10"></polyline>
                      <polyline points="1 20 1 14 7 14"></polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                    Refresh Status
                  </button>
                </div>
              </div>

              <h1 style={styles.heroTitle}>Waiting for Administrative Approval</h1>
              <p style={styles.heroSubtitle}>
                Your contractor account registration has been submitted and is currently waiting for administrator verification and activation. An administrator has received your business details and will review your credentials shortly. You can refresh this page at any time to check approval status.
              </p>

              {/* Application Details Summary */}
              <div style={styles.summaryGrid}>
                <div style={styles.summaryBox}>
                  <span style={styles.summaryLabel}>Business Name</span>
                  <span style={styles.summaryVal}>{profile?.businessName || '—'}</span>
                </div>
                <div style={styles.summaryBox}>
                  <span style={styles.summaryLabel}>License Number</span>
                  <span style={styles.summaryVal}>
                    <code style={styles.codeTag}>{profile?.licenseNumber || '—'}</code>
                    {profile?.licenseJurisdiction ? ` (${profile.licenseJurisdiction})` : ''}
                  </span>
                </div>
                <div style={styles.summaryBox}>
                  <span style={styles.summaryLabel}>Contact Phone</span>
                  <span style={styles.summaryVal}>{profile?.businessPhone || user?.phone || '—'}</span>
                </div>
                <div style={styles.summaryBox}>
                  <span style={styles.summaryLabel}>Experience</span>
                  <span style={styles.summaryVal}>{profile?.yearsOfExperience ?? 0} years</span>
                </div>
                <div style={styles.summaryBox}>
                  <span style={styles.summaryLabel}>Business Address</span>
                  <span style={styles.summaryVal}>
                    {[profile?.businessAddress?.city, profile?.businessAddress?.state].filter(Boolean).join(', ') || 'Texas, USA'}
                  </span>
                </div>
                <div style={styles.summaryBox}>
                  <span style={styles.summaryLabel}>Submission Date</span>
                  <span style={styles.summaryVal}>
                    {profile?.submittedAt ? new Date(profile.submittedAt).toLocaleDateString() : 'Today'}
                  </span>
                </div>
              </div>

              <div style={styles.complianceNotice}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" style={{ flexShrink: 0, marginRight: '12px' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                </svg>
                <div style={{ fontSize: '13px', color: '#1e3a8a', lineHeight: '1.5' }}>
                  <strong>Administrator Verification Protocol:</strong> Verification requests are typically reviewed within 1-2 business days. Once approved by an administrator, your dashboard will activate automatically. You can refresh this page at any time to check approval status.
                </div>
              </div>
            </div>

            {/* Uploaded Documents List & Supplemental Upload */}
            <div style={styles.card}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h3 style={styles.cardHeading}>Upload Verification Documents for Higher Wholesale Discounts (Optional)</h3>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803D', backgroundColor: '#DCFCE7', padding: '3px 8px', borderRadius: '4px', border: '1px solid #BBF7D0' }}>
                  ★ Qualify for 15%–25% Wholesale Margin
                </span>
              </div>
              <p style={styles.cardSubtext}>
                Document upload is <strong>completely optional</strong> to activate your contractor account. However, verified contractors who submit licensing, liability insurance, or tax registration qualify for our highest wholesale material discounts and priority dispatch.
              </p>

              {documents.length > 0 ? (
                <div className="drp-table-wrap" style={styles.docTableWrapper}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={styles.tableHeaderRow}>
                        <th style={styles.th}>Document Name</th>
                        <th style={styles.th}>Category</th>
                        <th style={styles.th}>Status</th>
                        <th style={styles.th}>Uploaded On</th>
                        <th style={{ ...styles.th, textAlign: 'center' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((doc) => (
                        <tr key={doc.id || doc._id} style={styles.tr}>
                          <td style={styles.tdBold}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                              <polyline points="14 2 14 8 20 8"></polyline>
                            </svg>
                            {doc.originalFileName || doc.fileName}
                          </td>
                          <td style={styles.td}>{doc.documentType?.replace(/_/g, ' ').toUpperCase() || 'LICENSE'}</td>
                          <td style={styles.td}>
                            <span style={styles.docStatusBadge}>
                              {doc.documentStatus?.replace(/_/g, ' ').toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                          <td style={styles.td}>
                            {new Date(doc.createdAt || Date.now()).toLocaleDateString()}
                          </td>
                          <td style={{ ...styles.td, textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
                              <a
                                href={resolveAssetUrl(`/api/v1/contractors/documents/${doc.id || doc._id}/file`)}
                                target="_blank"
                                rel="noreferrer"
                                style={styles.viewLink}
                              >
                                View File &rarr;
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteDoc(doc.id || doc._id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#DC2626',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  padding: '2px 6px',
                                }}
                                title="Remove this document"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={styles.emptyDocsBox}>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                    No verification documents uploaded yet. You can attach documents below for higher discount tier consideration.
                  </p>
                </div>
              )}

              {/* Supplemental Document Upload Form (Optional) */}
              <div style={styles.supplementalSection}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '6px' }}>
                  Attach Verification Document (Optional)
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '14px' }}>
                  Select a document category and upload your PDF or image to submit for tier discount review:
                </p>

                <form onSubmit={handleUploadSupplementalDoc} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <select
                    value={extraDocCategory}
                    onChange={(e) => setExtraDocCategory(e.target.value)}
                    style={styles.selectSmall}
                  >
                    <option value="contractor_license">Contractor Trade License</option>
                    <option value="insurance_certificate">Proof of General Liability Insurance</option>
                    <option value="business_registration">Business Registration / W-9 Certificate</option>
                  </select>

                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={(e) => setExtraDocFile(e.target.files[0] || null)}
                    style={styles.fileInputSmall}
                  />

                  <button
                    type="submit"
                    disabled={uploadingExtra || !extraDocFile}
                    style={styles.secondaryBtn}
                  >
                    {uploadingExtra ? 'Uploading...' : 'Upload for Discount Review'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 3. Draft / Rejected State: Show Verification Application Form */}
        {(!isPending && !isApproved) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Banner */}
            <div style={styles.formHeaderCard}>
              {isRejected ? (
                <div style={styles.rejectedBanner}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                    <span style={{ fontWeight: '800', color: '#b91c1c', fontSize: '16px' }}>
                      Application Not Approved
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px', color: '#7f1d1d', fontSize: '13px' }}>
                    Your previous verification submission was reviewed and declined by Deck Pro administrators.
                  </p>
                  {profile?.rejectionReason && (
                    <div style={styles.rejectionReasonBox}>
                      <strong>Reason from Administrator:</strong> {profile.rejectionReason}
                    </div>
                  )}
                  <p style={{ margin: '8px 0 0', color: '#7f1d1d', fontSize: '12px' }}>
                    Please review your business details below, provide any missing credentials, and re-submit your application for approval.
                  </p>
                </div>
              ) : (
                <>
                  <div style={styles.badgeStep}>STEP 1: BUSINESS REGISTRATION & VERIFICATION</div>
                  <h1 style={styles.formTitle}>Submit Your Business Verification Request</h1>
                  <p style={styles.formSubtitle}>
                    All contractor accounts on Deck Pro must be approved by an administrator before accessing client leads and estimator tools. Please provide your business information and licensing details below.
                  </p>
                </>
              )}
            </div>

            {/* The Main Application Form */}
            <form onSubmit={handleSubmitApplication} style={styles.applicationForm}>
              {/* Card 1: Business Profile & Licensing */}
              <div style={styles.card}>
                <h3 style={styles.cardHeading}>1. Business Profile & Licensing</h3>
                <p style={styles.cardSubtext}>
                  Enter the registered legal name of your contracting business and primary license credentials.
                </p>

                <div style={styles.formGrid}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      Business / Company Name <span style={styles.req}>*</span>
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      required
                      value={formData.businessName}
                      onChange={handleInputChange}
                      placeholder="e.g. Apex Deck Pros LLC"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      Business Phone <span style={styles.req}>*</span>
                    </label>
                    <input
                      type="tel"
                      name="businessPhone"
                      required
                      value={formData.businessPhone}
                      onChange={handleInputChange}
                      placeholder="e.g. 555-888-9999"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      Contractor License Number <span style={styles.req}>*</span>
                    </label>
                    <input
                      type="text"
                      name="licenseNumber"
                      required
                      value={formData.licenseNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. LIC-TX-2026-99"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>
                      License Jurisdiction / State <span style={styles.req}>*</span>
                    </label>
                    <input
                      type="text"
                      name="licenseJurisdiction"
                      required
                      value={formData.licenseJurisdiction}
                      onChange={handleInputChange}
                      placeholder="e.g. Texas (TX)"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Years of Experience in Deck Construction</label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      min="0"
                      max="60"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Business Website (Optional)</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://example.com"
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Business Address */}
              <div style={styles.card}>
                <h3 style={styles.cardHeading}>2. Business Headquarters / Service Location</h3>
                <p style={styles.cardSubtext}>
                  Provide your company's physical or operating address for territory matching.
                </p>

                <div style={styles.formGrid}>
                  <div style={{ ...styles.fieldGroup, gridColumn: '1 / -1' }}>
                    <label style={styles.label}>Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="123 Builder Way, Suite 200"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Austin"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>State / Province</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="TX"
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>ZIP / Postal Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      placeholder="78701"
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: License Upload (Explicitly Marked "Optional Field") */}
              <div style={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h3 style={{ ...styles.cardHeading, margin: 0 }}>3. Contractor License / Document Upload</h3>
                  <span style={styles.optionalBadge}>OPTIONAL FIELD</span>
                </div>
                <p style={styles.cardSubtext}>
                  You may optionally upload a copy of your contractor license, certificate of liability insurance, or company registration certificate. While optional at initial registration, providing documentation expedites administrative approval.
                </p>

                <div style={styles.uploadBox}>
                  <div style={styles.formGrid}>
                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Document Category</label>
                      <select
                        value={optionalDocCategory}
                        onChange={(e) => setOptionalDocCategory(e.target.value)}
                        style={styles.select}
                      >
                        <option value="contractor_license">Contractor License</option>
                        <option value="insurance_certificate">General Liability Insurance</option>
                        <option value="business_registration">Business Registration Certificate</option>
                      </select>
                    </div>

                    <div style={styles.fieldGroup}>
                      <label style={styles.label}>Select File (PDF, PNG, JPG, WebP — max 10MB)</label>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        onChange={(e) => setOptionalDocFile(e.target.files[0] || null)}
                        style={styles.fileInput}
                      />
                      {optionalDocFile && (
                        <span style={styles.fileSelectedText}>
                          Selected: <strong>{optionalDocFile.name}</strong> ({(optionalDocFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Additional Notes for Administrator */}
              <div style={styles.card}>
                <h3 style={styles.cardHeading}>4. Notes for Administrator (Optional)</h3>
                <p style={styles.cardSubtext}>
                  Include any special licensing details, service specializations, or notes for the reviewing administrator.
                </p>

                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="e.g. Certified Trex Pro installer with 10+ years specializing in composite decking and cedar restorations..."
                  style={styles.textarea}
                />
              </div>

              {/* Submit Action Banner */}
              <div style={styles.submitBanner}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                    Ready to submit for administrator review?
                  </h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    Once submitted, your account will be placed under administrator review.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.primaryBtn}
                >
                  {submitting ? (
                    <>
                      <div style={styles.btnSpinner} />
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      Submit Application for Approval
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '8px' }}>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: 'calc(100vh - 65px - 260px)',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '24px 20px 40px',
    width: '100%',
    boxSizing: 'border-box',
    flex: 1,
  },
  centerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 65px - 260px)',
    width: '100%',
    padding: '40px 20px',
    boxSizing: 'border-box',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  btnSpinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.4)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '8px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    color: '#166534',
    border: '1px solid #bbf7d0',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '24px 28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardHeading: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#0f172a',
    margin: '0 0 4px',
  },
  cardSubtext: {
    fontSize: '13px',
    color: '#64748b',
    margin: '0 0 20px',
  },
  formHeaderCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '28px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  badgeStep: {
    display: 'inline-block',
    fontSize: '11px',
    fontWeight: '800',
    letterSpacing: '0.6px',
    color: '#1d4ed8',
    backgroundColor: '#eff6ff',
    padding: '4px 8px',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  formTitle: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 8px',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#475569',
    margin: 0,
    lineHeight: '1.5',
  },
  applicationForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
    gap: '16px 20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
  },
  req: {
    color: '#dc2626',
  },
  input: {
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '14px',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  optionalBadge: {
    fontSize: '11px',
    fontWeight: '700',
    letterSpacing: '0.4px',
    padding: '3px 8px',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
  },
  uploadBox: {
    backgroundColor: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '18px 20px',
  },
  fileInput: {
    fontSize: '13px',
    color: '#475569',
    padding: '6px 0',
  },
  fileSelectedText: {
    fontSize: '12px',
    color: '#1d4ed8',
    marginTop: '4px',
  },
  submitBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '20px 28px',
    marginTop: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44px',
    padding: '0 22px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  secondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '36px',
    padding: '0 14px',
    backgroundColor: '#ffffff',
    color: '#1d4ed8',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '6px',
    border: '1px solid #1d4ed8',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  heroHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
  },
  pendingBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    border: '1px solid #fde68a',
    borderRadius: '9999px',
    padding: '4px 12px',
    fontSize: '12px',
    fontWeight: '800',
    letterSpacing: '0.4px',
  },
  heroTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    margin: '0 0 10px',
  },
  heroSubtitle: {
    fontSize: '14px',
    color: '#475569',
    lineHeight: '1.6',
    margin: '0 0 24px',
    maxWidth: '750px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  summaryLabel: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  summaryVal: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#0f172a',
  },
  codeTag: {
    backgroundColor: '#e2e8f0',
    padding: '2px 6px',
    borderRadius: '4px',
    fontFamily: 'monospace',
    fontSize: '13px',
  },
  complianceNotice: {
    display: 'flex',
    alignItems: 'flex-start',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '8px',
    padding: '14px 16px',
  },
  docTableWrapper: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflowX: 'auto',
    marginBottom: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  th: {
    padding: '10px 14px',
    fontSize: '12px',
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '12px 14px',
    fontSize: '13px',
    color: '#334155',
  },
  tdBold: {
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#0f172a',
  },
  docStatusBadge: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#92400e',
    backgroundColor: '#fef3c7',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  viewLink: {
    color: '#1d4ed8',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '12px',
  },
  emptyDocsBox: {
    backgroundColor: '#f8fafc',
    border: '1px dashed #cbd5e1',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    marginBottom: '20px',
  },
  supplementalSection: {
    borderTop: '1px solid #e2e8f0',
    paddingTop: '18px',
  },
  selectSmall: {
    height: '36px',
    padding: '0 10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
  },
  fileInputSmall: {
    fontSize: '12px',
  },
  rejectedBanner: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '16px 20px',
  },
  rejectionReasonBox: {
    backgroundColor: '#ffffff',
    border: '1px solid #fca5a5',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '13px',
    color: '#991b1b',
    margin: '8px 0',
  },
  approvedIconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: '#dcfce7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto',
  },
};

