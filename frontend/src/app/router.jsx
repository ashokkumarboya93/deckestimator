// =============================================
// Deck Estimator — Route Definitions
// =============================================

import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import { GuestOnly } from './routeGuards';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
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
    ],
  },
]);

export default router;
