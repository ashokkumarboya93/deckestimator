// =============================================
// DECK PRO — React Entry Point
// =============================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import router from './app/router.jsx';
import { Providers } from './app/providers.jsx';
import './assets/styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>
);
