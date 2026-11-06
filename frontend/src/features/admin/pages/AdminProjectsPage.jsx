// =============================================
// Deck Estimator — Admin Projects Directory & Progress Page
// =============================================
// Features:
// - Status summary metric cards: Total, Active / In Progress, Completed, On Hold
// - Table of projects with dimensions, customer, contractor, and progress bar
// - Update progress modal with 0-100% slider, status dropdown, note, and progress history timeline
// - Export to CSV & Excel with status filter
// - Directly backed by MongoDB via adminApi

import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/adminApi';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [progressModal, setProgressModal] = useState({ open: false, project: null, progress: 0, status: '', note: '' });
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getProjects({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        limit: 50,
      });
      setProjects(res.data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.title?.toLowerCase().includes(term) ||
      p.customerName?.toLowerCase().includes(term) ||
      p.contractorName?.toLowerCase().includes(term)
    );
  });

  const totalCount = projects.length;
  const inProgressCount = projects.filter((p) => p.status === 'in_progress').length;
  const completedCount = projects.filter((p) => p.status === 'completed').length;
  const onHoldCount = projects.filter((p) => p.status === 'on_hold').length;

  const handleOpenProgress = (project) => {
    setProgressModal({
      open: true,
      project,
      progress: project.progress || 0,
      status: project.status || 'in_progress',
      note: '',
    });
  };

  const handleSaveProgress = async () => {
    if (!progressModal.project) return;
    setSavingProgress(true);
    try {
      await adminApi.updateProjectProgress(progressModal.project._id, {
        progress: Number(progressModal.progress),
        status: progressModal.status,
        note: progressModal.note || `Progress adjusted to ${progressModal.progress}%`,
      });
      setSuccessMsg(`Progress updated for project: ${progressModal.project.title}`);
      setProgressModal({ open: false, project: null, progress: 0, status: '', note: '' });
      fetchProjects();
    } catch (err) {
      setError(err?.message || 'Failed to update project progress.');
    } finally {
      setSavingProgress(false);
    }
  };

  const handleOpenDetails = (proj) => {
    setSelectedProject(proj);
    setIsDetailsModalOpen(true);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Projects Directory</h1>
          <p style={styles.subtitle}>
            Monitor all deck restoration and staining projects across customer and contractor lifecycles.
          </p>
        </div>
        <div style={styles.headerActions}>
          <a
            href={adminApi.exportProjectsUrl('csv', statusFilter)}
            target="_blank"
            rel="noreferrer"
            style={styles.btnSecondary}
          >
            Export CSV
          </a>
          <a
            href={adminApi.exportProjectsUrl('excel', statusFilter)}
            target="_blank"
            rel="noreferrer"
            style={styles.btnSuccess}
          >
            Export Excel
          </a>
        </div>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div style={styles.alertSuccess}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {error && (
        <div style={styles.alertError}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
          </svg>
          <span style={{ marginLeft: 8 }}>{error}</span>
          <button onClick={() => setError(null)} style={styles.alertCloseBtn}>✕</button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Total Projects</span>
          <span style={styles.kpiValue}>{totalCount}</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>In Progress</span>
          <span style={{ ...styles.kpiValue, color: '#1d4ed8' }}>{inProgressCount}</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Completed</span>
          <span style={{ ...styles.kpiValue, color: '#047857' }}>{completedCount}</span>
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>On Hold</span>
          <span style={{ ...styles.kpiValue, color: '#b45309' }}>{onHoldCount}</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search projects by name, customer, contractor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.statusPills}>
          {['all', 'in_progress', 'completed', 'on_hold'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                ...styles.filterPill,
                ...(statusFilter === s ? styles.filterPillActive : {}),
              }}
            >
              {s === 'all' ? 'All' : s === 'in_progress' ? 'In Progress' : s.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div style={styles.card}>
        {loading ? (
          <div style={styles.loaderBox}>
            <div style={styles.spinner} />
            <span>Loading project records...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No projects found</p>
            <p style={styles.emptySub}>Estimates accepted by customers will create projects here automatically.</p>
          </div>
        ) : (
          <div style={styles.tableResponsive}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Project & Deck Details</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Contractor</th>
                  <th style={styles.th}>Progress (%)</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Last Updated</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((p) => (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '600', color: '#0f172a' }}>{p.title}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {p.deckSpecs?.length || 0}' × {p.deckSpecs?.width || 0}' ({((p.deckSpecs?.length || 0) * (p.deckSpecs?.width || 0))} sq ft)
                        {p.deckSpecs?.woodSpecies ? ` • ${p.deckSpecs.woodSpecies}` : ''}
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '500', color: '#0f172a' }}>{p.customerName || 'Customer'}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: '500', color: '#0f172a' }}>{p.contractorName || 'Assigned Specialist'}</div>
                    </td>
                    <td style={styles.td}>
                      <div style={styles.progressContainer}>
                        <div style={styles.progressTrack}>
                          <div
                            style={{
                              ...styles.progressBar,
                              width: `${p.progress || 0}%`,
                              backgroundColor: p.progress === 100 ? '#10b981' : '#1d4ed8',
                            }}
                          />
                        </div>
                        <span style={styles.progressText}>{p.progress || 0}%</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={getStatusBadge(p.status)}>
                        {(p.status || 'IN_PROGRESS').replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{ fontSize: '13px', color: '#64748b' }}>
                        {new Date(p.updatedAt || Date.now()).toLocaleDateString()}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actionButtonGroup}>
                        <button
                          onClick={() => handleOpenDetails(p)}
                          style={styles.actionBtnOutline}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleOpenProgress(p)}
                          style={styles.actionBtnPrimary}
                        >
                          Update Progress
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPDATE PROGRESS MODAL */}
      {progressModal.open && progressModal.project && (
        <div style={styles.modalOverlay} onClick={() => setProgressModal({ open: false, project: null, progress: 0, status: '', note: '' })}>
          <div style={styles.modalContentSmall} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Update Project Progress</h3>
            <p style={styles.modalSub}>{progressModal.project.title}</p>

            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={styles.inputLabel}>Progress Completion:</label>
                <span style={{ fontWeight: '700', color: '#1d4ed8' }}>{progressModal.progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressModal.progress}
                onChange={(e) => setProgressModal({ ...progressModal, progress: Number(e.target.value) })}
                style={{ width: '100%', accentColor: '#1d4ed8' }}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.inputLabel}>Milestone Status:</label>
              <select
                value={progressModal.status}
                onChange={(e) => setProgressModal({ ...progressModal, status: e.target.value })}
                style={styles.selectInputFull}
              >
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={styles.inputLabel}>Progress Note / History Log:</label>
              <textarea
                rows={2}
                style={styles.modalTextarea}
                placeholder="e.g. Completed pressure cleaning and sanding. Awaiting dry time..."
                value={progressModal.note}
                onChange={(e) => setProgressModal({ ...progressModal, note: e.target.value })}
              />
            </div>

            {/* Existing Progress History in modal */}
            {progressModal.project.progressHistory && progressModal.project.progressHistory.length > 0 && (
              <div style={{ marginTop: '16px', maxHeight: '140px', overflowY: 'auto' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Recent Milestone Logs:</span>
                <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {progressModal.project.progressHistory.map((h, i) => (
                    <div key={i} style={{ fontSize: '12px', padding: '6px', backgroundColor: '#f8fafc', borderRadius: '4px' }}>
                      <strong>{h.progress}%</strong> — {h.note || 'Milestone updated'} ({new Date(h.updatedAt).toLocaleDateString()})
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.modalFooter}>
              <button
                onClick={() => setProgressModal({ open: false, project: null, progress: 0, status: '', note: '' })}
                style={styles.btnSecondary}
                disabled={savingProgress}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProgress}
                style={styles.btnPrimary}
                disabled={savingProgress}
              >
                {savingProgress ? 'Saving...' : 'Save Milestone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROJECT DETAILS MODAL */}
      {isDetailsModalOpen && selectedProject && (
        <div style={styles.modalOverlay} onClick={() => setIsDetailsModalOpen(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>{selectedProject.title}</h2>
                <p style={styles.modalSub}>Detailed Project Specifications & Timeline</p>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.detailGrid}>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Customer</span>
                  <span style={styles.detailValue}>{selectedProject.customerName || 'Customer'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Contractor</span>
                  <span style={styles.detailValue}>{selectedProject.contractorName || 'Assigned Specialist'}</span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Status</span>
                  <span style={getStatusBadge(selectedProject.status)}>
                    {(selectedProject.status || 'IN_PROGRESS').replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>Current Progress</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#1d4ed8' }}>
                    {selectedProject.progress || 0}%
                  </span>
                </div>
              </div>

              {selectedProject.deckSpecs && (
                <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#0f172a' }}>Deck Specifications</h4>
                  <div style={styles.detailGrid}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Dimensions</span>
                      <span style={styles.detailValue}>{selectedProject.deckSpecs.length}' Length × {selectedProject.deckSpecs.width}' Width</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Area</span>
                      <span style={styles.detailValue}>{(selectedProject.deckSpecs.length || 0) * (selectedProject.deckSpecs.width || 0)} sq ft</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Wood Species</span>
                      <span style={styles.detailValue}>{selectedProject.deckSpecs.woodSpecies || 'Pressure Treated'}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Condition</span>
                      <span style={styles.detailValue}>{selectedProject.deckSpecs.condition || 'Fair'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress History Timeline */}
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 12px', fontSize: '14px', color: '#0f172a' }}>Progress History Timeline</h4>
                {selectedProject.progressHistory && selectedProject.progressHistory.length > 0 ? (
                  <div style={styles.historyList}>
                    {selectedProject.progressHistory.map((h, i) => (
                      <div key={i} style={styles.historyItem}>
                        <div style={styles.historyDot} />
                        <div style={styles.historyContent}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{h.progress}% Progress</strong>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(h.updatedAt).toLocaleString()}</span>
                          </div>
                          {h.note && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#475569' }}>{h.note}</p>}
                          <span style={{ fontSize: '11px', color: '#64748b' }}>By: {h.updatedBy || 'Admin System'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>No progress history logged yet.</p>
                )}
              </div>
            </div>

            <div style={{ ...styles.modalFooter, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={adminApi.exportSingleProjectUrl(selectedProject._id || selectedProject.id, 'csv')}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.actionBtnOutline}
                >
                  Export Project CSV
                </a>
                <a
                  href={adminApi.exportSingleProjectUrl(selectedProject._id || selectedProject.id, 'excel')}
                  target="_blank"
                  rel="noreferrer"
                  style={{ ...styles.actionBtnPrimary, textDecoration: 'none', display: 'inline-block' }}
                >
                  Export Project Excel
                </a>
              </div>
              <button onClick={() => setIsDetailsModalOpen(false)} style={styles.btnSecondary}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusBadge(status) {
  const base = {
    display: 'inline-block',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '700',
  };
  const s = (status || '').toLowerCase();
  if (s === 'completed') return { ...base, backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
  if (s === 'on_hold') return { ...base, backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
  if (s === 'cancelled') return { ...base, backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
  return { ...base, backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
}

const styles = {
  container: {
    padding: '24px 32px',
    backgroundColor: '#f8fafc',
    minHeight: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    margin: '6px 0 0',
    fontSize: '14px',
    color: '#64748b',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  btnSecondary: {
    padding: '8px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  btnSuccess: {
    padding: '8px 16px',
    backgroundColor: '#047857',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  btnPrimary: {
    padding: '8px 18px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    padding: '16px 20px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  kpiLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#0f172a',
    marginTop: '6px',
    display: 'block',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0 12px',
    flex: '1 1 300px',
    height: '40px',
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    padding: '0 8px',
    width: '100%',
    fontSize: '14px',
    color: '#0f172a',
  },
  statusPills: {
    display: 'flex',
    gap: '8px',
  },
  filterPill: {
    padding: '6px 14px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#64748b',
    cursor: 'pointer',
  },
  filterPillActive: {
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    borderColor: '#1d4ed8',
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  tableResponsive: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '12px 14px',
    fontSize: '12px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748b',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
  },
  td: {
    padding: '14px',
    fontSize: '14px',
    color: '#1e293b',
    verticalAlign: 'middle',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '140px',
  },
  progressTrack: {
    flex: 1,
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#334155',
    width: '32px',
    textAlign: 'right',
  },
  actionButtonGroup: {
    display: 'inline-flex',
    gap: '6px',
  },
  actionBtnOutline: {
    padding: '5px 10px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#334155',
    cursor: 'pointer',
  },
  actionBtnPrimary: {
    padding: '5px 12px',
    backgroundColor: '#1d4ed8',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  loaderBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '48px 0',
    gap: '12px',
    color: '#64748b',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid #e2e8f0',
    borderTopColor: '#1d4ed8',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyBox: {
    textAlign: 'center',
    padding: '48px 0',
  },
  emptyTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#334155',
    margin: '12px 0 4px',
  },
  emptySub: {
    fontSize: '13px',
    color: '#94a3b8',
    margin: 0,
  },
  alertSuccess: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertError: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
  },
  alertCloseBtn: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '16px',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalContentSmall: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '480px',
    padding: '24px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#0f172a',
  },
  modalSub: {
    margin: '4px 0 0',
    fontSize: '13px',
    color: '#64748b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    color: '#64748b',
    cursor: 'pointer',
  },
  modalBody: {
    padding: '24px',
  },
  detailGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: '14px',
    color: '#0f172a',
    fontWeight: '500',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    paddingLeft: '8px',
  },
  historyItem: {
    display: 'flex',
    gap: '12px',
    position: 'relative',
  },
  historyDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#1d4ed8',
    marginTop: '5px',
    flexShrink: 0,
  },
  historyContent: {
    flex: 1,
  },
  inputLabel: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#334155',
    marginBottom: '6px',
  },
  modalTextarea: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  selectInputFull: {
    width: '100%',
    height: '40px',
    padding: '0 12px',
    backgroundColor: '#ffffff',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#0f172a',
    outline: 'none',
    boxSizing: 'border-box',
  },
  modalFooter: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '16px',
  },
};

