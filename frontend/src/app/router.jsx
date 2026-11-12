// =============================================
// Deck Estimator — Route Definitions
// =============================================

import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import App from './App';
import RouteLoadingFallback from '../components/RouteLoadingFallback';

// Route Guards (lightweight sync wrappers)
import {
  GuestOnly,
  RequireAuth,
  RequireRole,
  RequireApprovedContractor,
  RequireAdminAuth,
  AdminGuestOnly,
} from './routeGuards';

const withSuspense = (element) => (
  <Suspense fallback={<RouteLoadingFallback />}>{element}</Suspense>
);

// Public & Auth Pages (Lazy Loaded)
const LandingPage = lazy(() => import('../features/landing/pages/LandingPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const AdminLoginPage = lazy(() => import('../features/admin/pages/AdminLoginPage'));

// Customer Portal Layout & Pages (Lazy Loaded)
const CustomerLayout = lazy(() => import('../features/customer/components/CustomerLayout'));
const CustomerDashboardPage = lazy(() => import('../features/customer/pages/CustomerDashboardPage'));
const DeckEstimatorPage = lazy(() => import('../features/customer/pages/DeckEstimatorPage'));
const DeckDetailPage = lazy(() => import('../features/customer/pages/DeckDetailPage'));
const CustomerEstimatesPage = lazy(() => import('../features/customer/pages/CustomerEstimatesPage'));
const EstimateBuilderPage = lazy(() => import('../features/customer/pages/EstimateBuilderPage'));
const EstimateDetailPage = lazy(() => import('../features/customer/pages/EstimateDetailPage'));
const CustomerProfilePage = lazy(() => import('../features/customer/pages/CustomerProfilePage'));
const CustomerSupportPage = lazy(() => import('../features/customer/pages/CustomerSupportPage'));

// Contractor Portal Layout & Pages (Lazy Loaded)
const ContractorLayout = lazy(() => import('../features/contractor/components/ContractorLayout'));
const ContractorDashboardPage = lazy(() => import('../features/contractor/pages/ContractorDashboardPage'));
const ContractorProjectsPage = lazy(() => import('../features/contractor/pages/ContractorProjectsPage'));
const ContractorDeckEstimatorPage = lazy(() => import('../features/contractor/pages/ContractorDeckEstimatorPage'));
const ContractorDeckDetailPage = lazy(() => import('../features/contractor/pages/ContractorDeckDetailPage'));
const ContractorVerificationRequestPage = lazy(() => import('../features/contractor/pages/ContractorVerificationRequestPage'));
const ContractorProfilePage = lazy(() => import('../features/contractor/pages/ContractorProfilePage'));
const ContractorDiscountsEarningsPage = lazy(() => import('../features/contractor/pages/ContractorDiscountsEarningsPage'));
const ContractorSupportPage = lazy(() => import('../features/contractor/pages/ContractorSupportPage'));
const ContractorProjectDetailPage = lazy(() => import('../features/contractor/pages/ContractorProjectDetailPage'));

// Admin Portal Layout & Pages (Lazy Loaded)
const AdminLayout = lazy(() => import('../features/admin/components/AdminLayout'));
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
const NotFoundPage = lazy(() => import('../components/NotFoundPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: withSuspense(<LandingPage />),
      },
      {
        path: 'landing',
        element: withSuspense(<LandingPage />),
      },
      {
        path: 'estimator',
        element: withSuspense(<DeckEstimatorPage />),
      },
      // Customer & Contractor Login
      {
        path: 'login',
        element: (
          <GuestOnly>
            {withSuspense(<LoginPage />)}
          </GuestOnly>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestOnly>
            {withSuspense(<RegisterPage />)}
          </GuestOnly>
        ),
      },
      // Dedicated Admin Login (Completely separate from Customer/Contractor)
      {
        path: 'admin/login',
        element: (
          <AdminGuestOnly>
            {withSuspense(<AdminLoginPage />)}
          </AdminGuestOnly>
        ),
      },

      // Customer Routes
      {
        path: 'customer',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'admin']}>
              {withSuspense(<CustomerLayout />)}
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
            element: withSuspense(<CustomerDashboardPage />),
          },
          {
            path: 'decks/new',
            element: withSuspense(<DeckEstimatorPage />),
          },
          {
            path: 'decks/:deckId',
            element: withSuspense(<DeckDetailPage />),
          },
          {
            path: 'decks/:deckId/edit',
            element: withSuspense(<DeckEstimatorPage />),
          },
          {
            path: 'decks/:deckId/estimate/new',
            element: withSuspense(<EstimateBuilderPage />),
          },
          {
            path: 'estimates',
            element: withSuspense(<CustomerEstimatesPage />),
          },
          {
            path: 'projects',
            element: withSuspense(<CustomerEstimatesPage />),
          },
          {
            path: 'estimates/:estimateId',
            element: withSuspense(<EstimateDetailPage />),
          },
          {
            path: 'profile',
            element: withSuspense(<CustomerProfilePage />),
          },
          {
            path: 'support',
            element: withSuspense(<CustomerSupportPage />),
          },
        ],
      },

      // Contractor Routes
      {
        path: 'contractor',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              {withSuspense(<ContractorLayout />)}
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
            element: withSuspense(<ContractorDashboardPage />),
          },
          {
            path: 'decks/new',
            element: (
              <RequireApprovedContractor>
                {withSuspense(<ContractorDeckEstimatorPage />)}
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'projects',
            element: (
              <RequireApprovedContractor>
                {withSuspense(<ContractorProjectsPage />)}
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'discounts-earnings',
            element: (
              <RequireApprovedContractor>
                {withSuspense(<ContractorDiscountsEarningsPage />)}
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'support',
            element: (
              <RequireApprovedContractor>
                {withSuspense(<ContractorSupportPage />)}
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'profile',
            element: withSuspense(<ContractorProfilePage />),
          },
          {
            path: 'decks/:deckId',
            element: (
              <RequireApprovedContractor>
                {withSuspense(<ContractorDeckDetailPage />)}
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'decks/:deckId/edit',
            element: (
              <RequireApprovedContractor>
                {withSuspense(<ContractorDeckEstimatorPage />)}
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'projects/:projectId',
            element: (
              <RequireApprovedContractor>
                {withSuspense(<ContractorProjectDetailPage />)}
              </RequireApprovedContractor>
            ),
          },
          {
            path: 'estimates/:estimateId',
            element: (
              <RequireApprovedContractor>
                {withSuspense(<ContractorProjectDetailPage />)}
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
            element: withSuspense(<ContractorVerificationRequestPage />),
          },
          {
            path: 'verification-request',
            element: withSuspense(<ContractorVerificationRequestPage />),
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
            {withSuspense(<AdminLayout />)}
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
            element: withSuspense(<AdminDashboardPage />),
          },
          // 2. User Management
          {
            path: 'users',
            element: withSuspense(<AdminUserManagementPage />),
          },
          {
            path: 'users/:id',
            element: withSuspense(<AdminUserProfilePage />),
          },
          // 3. Verification & Progress
          {
            path: 'verification-progress',
            element: withSuspense(<AdminVerificationProgressPage />),
          },
          // 4. Lead Management
          {
            path: 'leads',
            element: withSuspense(<AdminLeadManagementPage />),
          },
          // 5. Projects
          {
            path: 'projects',
            element: withSuspense(<AdminProjectsPage />),
          },
          // 6. Pricing & Discounts Unified Engine
          {
            path: 'pricing',
            element: withSuspense(<AdminPricingDiscountsPage />),
          },
          // 7. Reports & Analytics
          {
            path: 'reports',
            element: withSuspense(<AdminReportsPage />),
          },
          // 8. System Settings & Communications
          {
            path: 'settings',
            element: withSuspense(<AdminSettingsPage />),
          },
          // 9. Administrator Guidelines & SOP Manual
          {
            path: 'guidelines',
            element: withSuspense(<AdminGuidelinesPage />),
          },
          // My Profile
          {
            path: 'profile',
            element: withSuspense(<AdminProfilePage />),
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
        element: withSuspense(<NotFoundPage />),
      },
    ],
  },
]);

export default router;
