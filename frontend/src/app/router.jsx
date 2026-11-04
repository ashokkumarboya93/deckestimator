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
import AdminCatalogPage from '../features/admin/pages/AdminCatalogPage';
import AdminContractorVerificationPage from '../features/admin/pages/AdminContractorVerificationPage';
import AdminLeadManagementPage from '../features/admin/pages/AdminLeadManagementPage';
import AdminCommissionsPage from '../features/admin/pages/AdminCommissionsPage';
import AdminDashboardPage from '../features/admin/pages/AdminDashboardPage';
import EstimateBuilderPage from '../features/customer/pages/EstimateBuilderPage';
import EstimateDetailPage from '../features/customer/pages/EstimateDetailPage';
import CustomerLayout from '../features/customer/components/CustomerLayout';
import AdminLayout from '../features/admin/components/AdminLayout';
import { GuestOnly, RequireAuth, RequireRole, RequireApprovedContractor, RootRedirect } from './routeGuards';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
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
      // Standalone Verification Request Route for Contractors (Accessible before Admin Approval)
      {
        path: 'contractor/verification-request',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              <ContractorVerificationRequestPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      // Contractor Portal Routes (Requires Admin Approval)
      {
        path: 'contractor',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              <RequireApprovedContractor>
                <ContractorLayout />
              </RequireApprovedContractor>
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
            path: 'leads',
            element: <ContractorLeadsPage />,
          },
          {
            path: 'projects',
            element: <ContractorProjectsPage />,
          },
          {
            path: 'decks',
            element: <Navigate to="/contractor/projects" replace />,
          },
          {
            path: 'decks/new',
            element: <ContractorDeckEstimatorPage />,
          },
          {
            path: 'decks/:deckId',
            element: <ContractorDeckDetailPage />,
          },
          {
            path: 'decks/:deckId/edit',
            element: <ContractorDeckEstimatorPage />,
          },
          {
            path: 'decks/:deckId/estimate/new',
            element: <ContractorEstimateBuilderPage />,
          },
          {
            path: 'estimates',
            element: <ContractorEstimatesPage />,
          },
          {
            path: 'estimates/new',
            element: <ContractorEstimateBuilderPage />,
          },
          {
            path: 'estimates/:estimateId',
            element: <EstimateDetailPage />,
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
            element: <ContractorCommissionsPage />,
          },
          {
            path: 'commissions/:commissionId',
            element: <ContractorCommissionDetailPage />,
          },
          {
            path: 'discounts',
            element: <ContractorDiscountsPage />,
          },
        ],
      },
      // Admin Portal Routes (Integrated AdminLayout with Collapsible Hover Sidebar & Topbar)
      {
        path: 'admin',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['admin']}>
              <AdminLayout />
            </RequireRole>
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <AdminDashboardPage />,
          },
          {
            path: 'catalog',
            element: <AdminCatalogPage />,
          },
          {
            path: 'contractor-verifications',
            element: <AdminContractorVerificationPage />,
          },
          {
            path: 'leads',
            element: <AdminLeadManagementPage />,
          },
          {
            path: 'commissions',
            element: <AdminCommissionsPage />,
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
