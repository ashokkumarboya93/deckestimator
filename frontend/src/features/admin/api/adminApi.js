// =============================================
// Deck Estimator — Comprehensive Admin Portal API Service
// =============================================

import { client, BASE_URL } from '../../../api/client';

export const adminApi = {
  // 1. Dashboard
  getDashboardSummary: async (dateRange = '30d') => {
    const res = await client.get('/admin/dashboard/summary', { params: { dateRange } });
    return res.data;
  },
  getActivityTrend: async (period = '30d') => {
    const res = await client.get('/admin/dashboard/trend', { params: { period } });
    return res.data;
  },
  getRecentActivity: async () => {
    try {
      const res = await client.get('/admin/dashboard/summary');
      return res.data?.data?.recentActivities || res.data?.recentActivities || [];
    } catch {
      return [];
    }
  },
  getSummary: async (dateRange = '30d') => {
    const res = await client.get('/admin/dashboard/summary', { params: { dateRange } });
    return res.data;
  },

  // 2. User Management
  getUsers: async (params = {}) => {
    return client.get('/admin/users', { params });
  },
  getUserProfile: async (id) => {
    const res = await client.get(`/admin/users/${id}`);
    return res.data;
  },
  updateUserStatus: async (id, status, reason = '') => {
    const res = await client.patch(`/admin/users/${id}/status`, { status, reason });
    return res.data;
  },
  softDeleteUser: async (id, reason = '', permanent = false) => {
    const res = await client.delete(`/admin/users/${id}`, { params: { permanent }, body: JSON.stringify({ reason, permanent }) });
    return res.data;
  },
  getUserRequests: async (params = {}) => {
    return client.get('/admin/user-requests', { params });
  },
  resolveUserRequest: async (id, action, adminNotes = '') => {
    const res = await client.patch(`/admin/user-requests/${id}/action`, { action, adminNotes });
    return res.data;
  },
  exportUserUrl: (id, format = 'csv') => {
    return `${BASE_URL}/admin/users/${id}/export?format=${format}`;
  },

  // 3. Contractor Verifications & Documents
  getVerifications: async (params = {}) => {
    return client.get('/admin/verifications', { params });
  },
  getContractorDocuments: async (params = {}) => {
    return client.get('/admin/contractor-documents', { params });
  },
  reviewContractorDocument: async (id, status, notes = '') => {
    const res = await client.patch(`/admin/contractor-documents/${id}/review`, { status, notes });
    return res.data;
  },
  approveVerification: async (id) => {
    const res = await client.post(`/admin/verifications/${id}/approve`);
    return res.data;
  },
  rejectVerification: async (id, reason) => {
    const res = await client.post(`/admin/verifications/${id}/reject`, { reason });
    return res.data;
  },
  getVerificationHistory: async (contractorId = '') => {
    const res = await client.get(`/admin/verifications/${contractorId || 'all'}/history`);
    return res.data;
  },

  // 4. Projects & Progress
  getProjects: async (params = {}) => {
    return client.get('/admin/projects', { params });
  },
  updateProjectProgress: async (id, payload) => {
    const res = await client.patch(`/admin/projects/${id}/progress`, payload);
    return res.data;
  },
  exportProjectsUrl: (format = 'csv', status = 'all') => {
    return `${BASE_URL}/admin/projects/export?format=${format}&status=${status}`;
  },
  exportSingleProjectUrl: (id, format = 'csv') => {
    return `${BASE_URL}/admin/projects/${id}/export?format=${format}`;
  },

  // 5. Leads
  getLeads: async (params = {}) => {
    return client.get('/admin/leads', { params });
  },
  getLeadDetails: async (id) => {
    const res = await client.get(`/admin/leads/${id}`);
    return res.data;
  },
  exportLeadsUrl: (format = 'csv', tab = 'all', filters = {}) => {
    const params = new URLSearchParams({ format, tab, ...filters });
    return `${BASE_URL}/admin/leads/export?${params.toString()}`;
  },
  exportSingleLeadUrl: (id, format = 'csv') => {
    return `${BASE_URL}/admin/leads/${id}/export?format=${format}`;
  },

  // 6. Estimator Configuration
  getEstimatorFields: async () => {
    const res = await client.get('/admin/estimator-config/fields');
    return res.data;
  },
  saveEstimatorField: async (data, id = null) => {
    const res = id
      ? await client.put(`/admin/estimator-config/fields/${id}`, data)
      : await client.post('/admin/estimator-config/fields', data);
    return res.data;
  },
  deleteEstimatorField: async (id) => {
    const res = await client.delete(`/admin/estimator-config/fields/${id}`);
    return res.data;
  },
  getEstimatorDependencies: async () => {
    const res = await client.get('/admin/estimator-config/dependencies');
    return res.data;
  },
  saveEstimatorDependency: async (data, id = null) => {
    const res = id
      ? await client.put(`/admin/estimator-config/dependencies/${id}`, data)
      : await client.post('/admin/estimator-config/dependencies', data);
    return res.data;
  },
  deleteEstimatorDependency: async (id) => {
    const res = await client.delete(`/admin/estimator-config/dependencies/${id}`);
    return res.data;
  },

  // 7. Catalog
  getCatalogOverview: async () => {
    const res = await client.get('/admin/catalog/overview');
    return res.data;
  },
  getMaterials: async () => {
    const res = await client.get('/admin/catalog/materials');
    return res.data;
  },
  saveMaterial: async (data, id = null) => {
    const res = id
      ? await client.put(`/admin/catalog/materials/${id}`, data)
      : await client.post('/admin/catalog/materials', data);
    return res.data;
  },
  getProducts: async () => {
    const res = await client.get('/admin/catalog/products');
    return res.data;
  },
  saveProduct: async (data, id = null) => {
    const res = id
      ? await client.put(`/admin/catalog/products/${id}`, data)
      : await client.post('/admin/catalog/products', data);
    return res.data;
  },
  getSubstrates: async () => {
    const res = await client.get('/admin/catalog/substrates');
    return res.data;
  },
  saveSubstrate: async (data, id = null) => {
    const res = id
      ? await client.put(`/admin/catalog/substrates/${id}`, data)
      : await client.post('/admin/catalog/substrates', data);
    return res.data;
  },
  getServices: async () => {
    const res = await client.get('/admin/catalog/services');
    return res.data;
  },
  saveService: async (data, id = null) => {
    const res = id
      ? await client.put(`/admin/catalog/services/${id}`, data)
      : await client.post('/admin/catalog/services', data);
    return res.data;
  },
  getCoverageRates: async () => {
    const res = await client.get('/admin/catalog/coverage-rates');
    return res.data;
  },
  saveCoverageRate: async (data, id = null) => {
    const res = id
      ? await client.put(`/admin/catalog/coverage-rates/${id}`, data)
      : await client.post('/admin/catalog/coverage-rates', data);
    return res.data;
  },
  uploadCatalogImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await client.post('/admin/catalog/upload-image', formData);
    return res.data;
  },

  // 8. Pricing
  getPricingConfig: async () => {
    const res = await client.get('/admin/pricing');
    return res.data;
  },
  updatePricingConfig: async (payload) => {
    const res = await client.put('/admin/pricing', payload);
    return res.data;
  },

  // 9. Discounts
  getDiscountsOverview: async () => {
    const res = await client.get('/admin/discounts');
    return res.data;
  },
  updateDefaultDiscount: async (discount, reason = '') => {
    const res = await client.put('/admin/discounts/default', { discount, reason });
    return res.data;
  },
  setContractorDiscount: async (contractorId, discount, reason = '') => {
    const res = await client.put(`/admin/discounts/contractors/${contractorId}`, { discount, reason });
    return res.data;
  },

  // 10. System Settings & Info
  getSystemSettings: async () => {
    const res = await client.get('/admin/settings');
    return res.data;
  },
  updateSystemSettings: async (settingsPayload) => {
    const res = await client.put('/admin/settings', settingsPayload);
    return res.data;
  },
  dispatchNotification: async (payload) => {
    const res = await client.post('/admin/notifications/dispatch', payload);
    return res.data;
  },
  getNotificationHistory: async (limit = 30) => {
    const res = await client.get('/admin/notifications/history', { params: { limit } });
    return res.data;
  },
  searchRecipients: async (q = '') => {
    const res = await client.get('/admin/users/search-recipients', { params: { q } });
    return res.data;
  },

  // 11. Permissions Matrix
  getPermissions: async () => {
    const res = await client.get('/admin/permissions');
    return res.data;
  },
  savePermissions: async (permissions) => {
    const res = await client.put('/admin/permissions', { permissions });
    return res.data;
  },

  // 12. Reports & Analytics
  getReports: async (tab = 'business_overview', params = {}) => {
    const res = await client.get('/admin/reports', { params: { tab, ...params } });
    return res.data;
  },
  exportReportsUrl: (format = 'csv', tab = 'business_overview', dateRange = '30d') => {
    return `${BASE_URL}/admin/reports/export?format=${format}&tab=${tab}&dateRange=${dateRange}`;
  },

  // 13. Admin Profile & Hierarchy
  getProfile: async () => {
    const res = await client.get('/admin/profile');
    return res.data;
  },
  updateProfile: async (payload) => {
    const res = await client.put('/admin/profile', payload);
    return res.data;
  },
  changePassword: async (payload) => {
    const res = await client.post('/admin/profile/change-password', payload);
    return res.data;
  },
  getHierarchy: async () => {
    const res = await client.get('/admin/hierarchy');
    return res.data;
  },
  createChildAdmin: async (payload) => {
    const res = await client.post('/admin/child-admins', payload);
    return res.data;
  },
  deleteChildAdmin: async (adminId) => {
    const res = await client.delete(`/admin/child-admins/${adminId}`);
    return res.data;
  },
};
