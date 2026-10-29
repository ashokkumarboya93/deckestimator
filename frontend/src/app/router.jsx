// =============================================
// DECK PRO — Route Definitions
// =============================================
// Maps URL paths to pages and layouts.
// Module-specific routes will be added as features are built.

import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// Phase 1: Minimal routing — just the app shell
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Public routes, auth routes, and role-specific routes
      // will be added in subsequent phases.
    ],
  },
]);

export default router;
