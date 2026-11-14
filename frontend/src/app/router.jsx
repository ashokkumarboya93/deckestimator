// =============================================
// Deck Estimator — Route Definitions
// =============================================

import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import RouteErrorBoundary from '../components/common/RouteErrorBoundary';

// Layouts
import CustomerLayout from '../features/customer/components/CustomerLayout';
import ContractorLayout from '../features/contractor/components/ContractorLayout';
import AdminLayout from '../features/admin/components/AdminLayout';

// Core & Auth Pages (Lazy Loaded)
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const LandingPage = lazy(() => import('../features/landing/pages/LandingPage'));

// Customer Pages (Lazy Loaded)
const CustomerDashboardPage = lazy(() => import('../features/customer/pages/CustomerDashboardPage'));
const DeckEstimatorPage = lazy(() => import('../features/customer/pages/DeckEstimatorPage'));
const DeckDetailPage = lazy(() => import('../features/customer/pages/DeckDetailPage'));
const CustomerEstimatesPage = lazy(() => import('../features/customer/pages/CustomerEstimatesPage'));
const EstimateBuilderPage = lazy(() => import('../features/customer/pages/EstimateBuilderPage'));
const EstimateDetailPage = lazy(() => import('../features/customer/pages/EstimateDetailPage'));
const CustomerProfilePage = lazy(() => import('../features/customer/pages/CustomerProfilePage'));
const CustomerSupportPage = lazy(() => import('../features/customer/pages/CustomerSupportPage'));

// Contractor Pages (Lazy Loaded)
const ContractorDashboardPage = lazy(() => import('../features/contractor/pages/ContractorDashboardPage'));
const ContractorLeadsPage = lazy(() => import('../features/contractor/pages/ContractorLeadsPage'));
const ContractorProjectsPage = lazy(() => import('../features/contractor/pages/ContractorProjectsPage'));
const ContractorDeckEstimatorPage = lazy(() => import('../features/contractor/pages/ContractorDeckEstimatorPage'));
const ContractorDeckDetailPage = lazy(() => import('../features/contractor/pages/ContractorDeckDetailPage'));
const ContractorEstimatesPage = lazy(() => import('../features/contractor/pages/ContractorEstimatesPage'));
const ContractorEstimateBuilderPage = lazy(() => import('../features/contractor/pages/ContractorEstimateBuilderPage'));
const ContractorVerificationPage = lazy(() => import('../features/contractor/pages/ContractorVerificationPage'));
const ContractorDocumentDetailPage = lazy(() => import('../features/contractor/pages/ContractorDocumentDetailPage'));
const ContractorCommissionsPage = lazy(() => import('../features/contractor/pages/ContractorCommissionsPage'));
const ContractorCommissionDetailPage = lazy(() => import('../features/contractor/pages/ContractorCommissionDetailPage'));
const ContractorDiscountsPage = lazy(() => import('../features/contractor/pages/ContractorDiscountsPage'));
const ContractorVerificationRequestPage = lazy(() => import('../features/contractor/pages/ContractorVerificationRequestPage'));
const ContractorProfilePage = lazy(() => import('../features/contractor/pages/ContractorProfilePage'));
const ContractorDiscountsEarningsPage = lazy(() => import('../features/contractor/pages/ContractorDiscountsEarningsPage'));
const ContractorSupportPage = lazy(() => import('../features/contractor/pages/ContractorSupportPage'));
const ContractorProjectDetailPage = lazy(() => import('../features/contractor/pages/ContractorProjectDetailPage'));

// Admin Portal Pages (Lazy Loaded)
const AdminLoginPage = lazy(() => import('../features/admin/pages/AdminLoginPage'));
const AdminDashboardPage = lazy(() => import('../features/admin/pages/AdminDashboardPage'));
const AdminUserManagementPage = lazy(() => import('../features/admin/pages/AdminUserManagementPage'));
const AdminUserProfilePage = lazy(() => import('../features/admin/pages/AdminUserProfilePage'));
const AdminVerificationProgressPage = lazy(() => import('../features/admin/pages/AdminVerificationProgressPage'));
const AdminLeadManagementPage = lazy(() => import('../features/admin/pages/AdminLeadManagementPage'));
const AdminProjectsPage = lazy(() => import('../features/admin/pages/AdminProjectsPage'));
const AdminPricingDiscountsPage = lazy(() => import('../features/admin/pages/AdminPricingDiscountsPage'));
const AdminReportsPage = lazy(() => import('../features/admin/pages/AdminReportsPage'));
const AdminSettingsPage = lazy(() => import('../features/admin/pages/AdminSettingsPage'));
const AdminGuidelinesPage = lazy(() => import('../features/admin/pages/AdminGuidelinesPage'));
const AdminProfilePage = lazy(() => import('../features/admin/pages/AdminProfilePage'));

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
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'landing',
        element: <LandingPage />,
      },
      {
        path: 'estimator',
        element: <DeckEstimatorPage />,
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
        errorElement: <RouteErrorBoundary />,
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
            path: 'projects',
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
        errorElement: <RouteErrorBoundary />,
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
            element: <ContractorDashboardPage />,
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
            element: <ContractorProfilePage />,
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
            path: 'projects/:projectId',
            element: (
              <RequireApprovedContractor>
                <ContractorProjectDetailPage />
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'estimates/:estimateId',
            element: (
              <RequireApprovedContractor>
                <ContractorProjectDetailPage />
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
            element: <ContractorVerificationRequestPage />,
          },
          {
            path: 'verification-request',
            element: <ContractorVerificationRequestPage />,
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
        errorElement: <RouteErrorBoundary />,
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
          {
            path: 'users/:id',
            element: <AdminUserProfilePage />,
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
