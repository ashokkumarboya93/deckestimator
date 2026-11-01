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
      {
        path: 'customer/dashboard',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'contractor', 'admin']}>
              <CustomerDashboardPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'customer/decks/new',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'contractor', 'admin']}>
              <DeckEstimatorPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'customer/decks/:deckId',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'contractor', 'admin']}>
              <DeckDetailPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
      {
        path: 'customer/decks/:deckId/edit',
        element: (
          <RequireAuth>
            <RequireRole allowedRoles={['customer', 'contractor', 'admin']}>
              <DeckEstimatorPage />
            </RequireRole>
          </RequireAuth>
        ),
      },
    ],
  },
]);

export default router;
