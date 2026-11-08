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
import CustomerProfilePage from '../features/customer/pages/CustomerProfilePage';
import CustomerSupportPage from '../features/customer/pages/CustomerSupportPage';

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
import ContractorProfilePage from '../features/contractor/pages/ContractorProfilePage';
import ContractorDiscountsEarningsPage from '../features/contractor/pages/ContractorDiscountsEarningsPage';
import ContractorSupportPage from '../features/contractor/pages/ContractorSupportPage';

// Admin Portal Pages & Layout
import AdminLoginPage from '../features/admin/pages/AdminLoginPage';
import AdminLayout from '../features/admin/components/AdminLayout';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import AdminUserManagementPage from '../features/admin/pages/AdminUserManagementPage';
import AdminVerificationProgressPage from '../features/admin/pages/AdminVerificationProgressPage';
import AdminLeadManagementPage from '../features/admin/pages/AdminLeadManagementPage';
import AdminProjectsPage from '../features/admin/pages/AdminProjectsPage';
import AdminPricingDiscountsPage from '../features/admin/pages/AdminPricingDiscountsPage';
import AdminReportsPage from '../features/admin/pages/AdminReportsPage';
import AdminSettingsPage from '../features/admin/pages/AdminSettingsPage';
import AdminGuidelinesPage from '../features/admin/pages/AdminGuidelinesPage';
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
          {
            path: 'profile',
            element: <CustomerProfilePage />,
          },
          {
            path: 'support',
            element: <CustomerSupportPage />,
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
            path: 'decks/new',
            element: (
              <RequireApprovedContractor>
                <ContractorDeckEstimatorPage />
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
            path: 'discounts-earnings',
            element: (
              <RequireApprovedContractor>
                <ContractorDiscountsEarningsPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'support',
            element: (
              <RequireApprovedContractor>
                <ContractorSupportPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'profile',
            element: (
              <RequireApprovedContractor>
                <ContractorProfilePage />
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
            path: 'estimates/:estimateId',
            element: (
              <RequireApprovedContractor>
                <EstimateDetailPage />
              </RequireApprovedContractor>
            ),
          },
          // Route Compatibility Aliases for unified contractor portal
          {
            path: 'estimates',
            element: <Navigate to="/contractor/projects" replace />,
          },
          {
            path: 'estimates/new',
            element: <Navigate to="/contractor/decks/new" replace />,
          },
          {
            path: 'leads',
            element: <Navigate to="/contractor/projects" replace />,
          },
          {
            path: 'verification',
            element: <Navigate to="/contractor/profile" replace />,
          },
          {
            path: 'verification-request',
            element: <Navigate to="/contractor/profile" replace />,
          },
          {
            path: 'settings',
            element: <Navigate to="/contractor/profile" replace />,
          },
          {
            path: 'commissions',
            element: <Navigate to="/contractor/discounts-earnings" replace />,
          },
          {
            path: 'commissions/:commissionId',
            element: <Navigate to="/contractor/discounts-earnings" replace />,
          },
          {
            path: 'discounts',
            element: <Navigate to="/contractor/discounts-earnings" replace />,
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
          // 6. Pricing & Discounts Unified Engine
          {
            path: 'pricing',
            element: <AdminPricingDiscountsPage />,
          },
          // 7. Reports & Analytics
          {
            path: 'reports',
            element: <AdminReportsPage />,
          },
          // 8. System Settings & Communications
          {
            path: 'settings',
            element: <AdminSettingsPage />,
          },
          // 9. Administrator Guidelines & SOP Manual
          {
            path: 'guidelines',
            element: <AdminGuidelinesPage />,
          },
          // My Profile
          {
            path: 'profile',
            element: <AdminProfilePage />,
          },
          // Removed features / redirects
          {
            path: 'estimator-config',
            element: <Navigate to="/admin/pricing" replace />,
          },
          {
            path: 'catalog',
            element: <Navigate to="/admin/pricing" replace />,
          },
          {
            path: 'discounts',
            element: <Navigate to="/admin/pricing" replace />,
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
