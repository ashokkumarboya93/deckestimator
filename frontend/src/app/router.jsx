// =============================================
// Deck Estimator — Route Definitions
// =============================================

import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import CustomerDashboardPage from '../features/customer/pages/CustomerDashboardPage';
import DeckEstimatorPage from '../features/customer/pages/DeckEstimatorPage';
import DeckDetailPage from '../features/customer/pages/DeckDetailPage';
import CustomerEstimatesPage from '../features/customer/pages/CustomerEstimatesPage';
import EstimateBuilderPage from '../features/customer/pages/EstimateBuilderPage';
import EstimateDetailPage from '../features/customer/pages/EstimateDetailPage';
import CustomerLayout from '../features/customer/components/CustomerLayout';

// Contractor Pages & Layout
import ContractorLayout from '../features/contractor/components/ContractorLayout';
import ContractorDashboardPage from '../features/contractor/pages/ContractorDashboardPage';
import ContractorLeadsPage from '../features/contractor/pages/ContractorLeadsPage';
import ContractorProjectsPage from '../features/contractor/pages/ContractorProjectsPage';
import ContractorDeckEstimatorPage from '../features/contractor/pages/ContractorDeckEstimatorPage';
import ContractorDeckDetailPage from '../features/contractor/pages/ContractorDeckDetailPage';
import ContractorEstimatesPage from '../features/contractor/pages/ContractorEstimatesPage';
import ContractorEstimateBuilderPage from '../features/contractor/pages/ContractorEstimateBuilderPage';
import ContractorVerificationPage from '../features/contractor/pages/ContractorVerificationPage';
import ContractorDocumentDetailPage from '../features/contractor/pages/ContractorDocumentDetailPage';
import ContractorCommissionsPage from '../features/contractor/pages/ContractorCommissionsPage';
import ContractorCommissionDetailPage from '../features/contractor/pages/ContractorCommissionDetailPage';
import ContractorDiscountsPage from '../features/contractor/pages/ContractorDiscountsPage';
import ContractorVerificationRequestPage from '../features/contractor/pages/ContractorVerificationRequestPage';

// Admin Portal Pages & Layout
import AdminLoginPage from '../features/admin/pages/AdminLoginPage';
import AdminLayout from '../features/admin/components/AdminLayout';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import AdminUserManagementPage from '../features/admin/pages/AdminUserManagementPage';
import AdminVerificationProgressPage from '../features/admin/pages/AdminVerificationProgressPage';
import AdminLeadManagementPage from '../features/admin/pages/AdminLeadManagementPage';
import AdminProjectsPage from '../features/admin/pages/AdminProjectsPage';
import AdminEstimatorConfigPage from '../features/admin/pages/AdminEstimatorConfigPage';
import AdminCatalogPage from '../features/admin/pages/AdminCatalogPage';
import AdminPricingPage from '../features/admin/pages/AdminPricingPage';
import AdminDiscountsPage from '../features/admin/pages/AdminDiscountsPage';
import AdminReportsPage from '../features/admin/pages/AdminReportsPage';
import AdminSettingsPage from '../features/admin/pages/AdminSettingsPage';
import AdminProfilePage from '../features/admin/pages/AdminProfilePage';

// Route Guards
import {
  GuestOnly,
  RequireAuth,
  RequireRole,
  RequireApprovedContractor,
  RequireAdminAuth,
  AdminGuestOnly,
  RootRedirect,
} from './routeGuards';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      // Customer & Contractor Login
      {
        path: 'login',
        element: (
          <GuestOnly>
            <LoginPage />
          </GuestOnly>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestOnly>
            <RegisterPage />
          </GuestOnly>
        ),
      },
      // Dedicated Admin Login (Completely separate from Customer/Contractor)
      {
        path: 'admin/login',
        element: (
          <AdminGuestOnly>
            <AdminLoginPage />
          </AdminGuestOnly>
        ),
      },

      // Customer Routes
      {
        path: 'customer',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'admin']}>
              <CustomerLayout />
            </RequireRole>
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/customer/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <CustomerDashboardPage />,
          },
          {
            path: 'decks/new',
            element: <DeckEstimatorPage />,
          },
          {
            path: 'decks/:deckId',
            element: <DeckDetailPage />,
          },
          {
            path: 'decks/:deckId/edit',
            element: <DeckEstimatorPage />,
          },
          {
            path: 'decks/:deckId/estimate/new',
            element: <EstimateBuilderPage />,
          },
          {
            path: 'estimates',
            element: <CustomerEstimatesPage />,
          },
          {
            path: 'estimates/:estimateId',
            element: <EstimateDetailPage />,
          },
        ],
      },

      // Contractor Routes
      {
        path: 'contractor',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              <ContractorLayout />
            </RequireRole>
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/contractor/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: (
              <RequireApprovedContractor>
                <ContractorDashboardPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'verification-request',
            element: <ContractorVerificationRequestPage />,
          },
          {
            path: 'leads',
            element: (
              <RequireApprovedContractor>
                <ContractorLeadsPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'projects',
            element: (
              <RequireApprovedContractor>
                <ContractorProjectsPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'decks/new',
            element: (
              <RequireApprovedContractor>
                <ContractorDeckEstimatorPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'decks/:deckId',
            element: (
              <RequireApprovedContractor>
                <ContractorDeckDetailPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'decks/:deckId/edit',
            element: (
              <RequireApprovedContractor>
                <ContractorDeckEstimatorPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'estimates',
            element: (
              <RequireApprovedContractor>
                <ContractorEstimatesPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'estimates/new',
            element: (
              <RequireApprovedContractor>
                <ContractorEstimateBuilderPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'estimates/:estimateId',
            element: (
              <RequireApprovedContractor>
                <EstimateDetailPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'verification',
            element: <ContractorVerificationPage />,
          },
          {
            path: 'verification/:documentId',
            element: <ContractorDocumentDetailPage />,
          },
          {
            path: 'commissions',
            element: (
              <RequireApprovedContractor>
                <ContractorCommissionsPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'commissions/:commissionId',
            element: (
              <RequireApprovedContractor>
                <ContractorCommissionDetailPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'discounts',
            element: (
              <RequireApprovedContractor>
                <ContractorDiscountsPage />
              </RequireApprovedContractor>
            ),
          },
        ],
      },

      // Admin Portal Routes (Strict sequence: 11 Pages + Profile + Aliases)
      {
        path: 'admin',
        element: (
          <RequireAdminAuth>
            <AdminLayout />
          </RequireAdminAuth>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          // 1. Dashboard
          {
            path: 'dashboard',
            element: <AdminDashboardPage />,
          },
          // 2. User Management
          {
            path: 'users',
            element: <AdminUserManagementPage />,
          },
          // 3. Verification & Progress
          {
            path: 'verification-progress',
            element: <AdminVerificationProgressPage />,
          },
          // 4. Lead Management
          {
            path: 'leads',
            element: <AdminLeadManagementPage />,
          },
          // 5. Projects
          {
            path: 'projects',
            element: <AdminProjectsPage />,
          },
          // 6. Estimator Configuration
          {
            path: 'estimator-config',
            element: <AdminEstimatorConfigPage />,
          },
          // 7. Catalog Management
          {
            path: 'catalog',
            element: <AdminCatalogPage />,
          },
          // 8. Pricing Management
          {
            path: 'pricing',
            element: <AdminPricingPage />,
          },
          // 9. Discounts Management
          {
            path: 'discounts',
            element: <AdminDiscountsPage />,
          },
          // 10. Reports & Analytics
          {
            path: 'reports',
            element: <AdminReportsPage />,
          },
          // 11. System Settings
          {
            path: 'settings',
            element: <AdminSettingsPage />,
          },
          // My Profile
          {
            path: 'profile',
            element: <AdminProfilePage />,
          },
          // Route Compatibility Aliases
          {
            path: 'contractor-verifications',
            element: <Navigate to="/admin/verification-progress" replace />,
          },
          {
            path: 'commissions',
            element: <Navigate to="/admin/discounts" replace />,
          },
        ],
      },

      // Fallback
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
