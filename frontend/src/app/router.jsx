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
import ContractorDashboardPage from '../features/contractor/pages/ContractorDashboardPage';
import ContractorDeckEstimatorPage from '../features/contractor/pages/ContractorDeckEstimatorPage';
import ContractorDeckDetailPage from '../features/contractor/pages/ContractorDeckDetailPage';
import AdminCatalogPage from '../features/admin/pages/AdminCatalogPage';
import EstimateBuilderPage from '../features/customer/pages/EstimateBuilderPage';
import EstimateDetailPage from '../features/customer/pages/EstimateDetailPage';
import { GuestOnly, RequireAuth, RequireRole } from './routeGuards';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/customer/dashboard" replace />,
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
        path: 'customer/dashboard',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'admin']}>
              <CustomerDashboardPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'customer/decks/new',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'admin']}>
              <DeckEstimatorPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'customer/decks/:deckId',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'admin']}>
              <DeckDetailPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'customer/decks/:deckId/edit',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'admin']}>
              <DeckEstimatorPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'customer/decks/:deckId/estimate/new',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'admin']}>
              <EstimateBuilderPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'customer/estimates/:estimateId',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'admin']}>
              <EstimateDetailPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      // Contractor Routes
      {
        path: 'contractor/dashboard',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              <ContractorDashboardPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'contractor/decks/new',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              <ContractorDeckEstimatorPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'contractor/decks/:deckId',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              <ContractorDeckDetailPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'contractor/decks/:deckId/edit',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              <ContractorDeckEstimatorPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'contractor/decks/:deckId/estimate/new',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              <EstimateBuilderPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'contractor/estimates/:estimateId',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['contractor', 'admin']}>
              <EstimateDetailPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      // Admin Routes (Phase 5)
      {
        path: 'admin/catalog',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['admin']}>
              <AdminCatalogPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
    ],
  },
]);

export default router;
