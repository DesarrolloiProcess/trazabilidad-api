import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { queryClient } from '#src/queryClient';
import { RequireRole } from '#src/routes/RequireRole';

import { LandingPage } from '#src/pages/LandingPage';
import { LoginPage } from '#src/pages/auth/LoginPage';

import { DashboardPage } from '#src/pages/panel/DashboardPage';
import { DeliveriesPage } from '#src/pages/panel/DeliveriesPage';
import { DeliveryDetailPage } from '#src/pages/panel/DeliveryDetailPage';
import { RoutesPage } from '#src/pages/panel/RoutesPage';
import { DistributionCentersPage } from '#src/pages/panel/DistributionCentersPage';

import { MyRoutePage } from '#src/pages/conductor/MyRoutePage';
import { DeliveryCapturePage } from '#src/pages/conductor/DeliveryCapturePage';

import { PortalLoginPage } from '#src/pages/portal/PortalLoginPage';
import { MyDeliveriesPage } from '#src/pages/portal/MyDeliveriesPage';
import { DeliveryDetailPublicPage } from '#src/pages/portal/DeliveryDetailPublicPage';

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/panel"
            element={
              <RequireRole roles={['ADMIN', 'CEDI']}>
                <DashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/entregas"
            element={
              <RequireRole roles={['ADMIN', 'CEDI']}>
                <DeliveriesPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/entregas/:id"
            element={
              <RequireRole roles={['ADMIN', 'CEDI']}>
                <DeliveryDetailPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/rutas"
            element={
              <RequireRole roles={['ADMIN', 'CEDI']}>
                <RoutesPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/cedis"
            element={
              <RequireRole roles={['ADMIN', 'CEDI']}>
                <DistributionCentersPage />
              </RequireRole>
            }
          />

          <Route
            path="/conductor"
            element={
              <RequireRole roles={['CONDUCTOR']}>
                <MyRoutePage />
              </RequireRole>
            }
          />
          <Route
            path="/conductor/entregas/:id"
            element={
              <RequireRole roles={['CONDUCTOR']}>
                <DeliveryCapturePage />
              </RequireRole>
            }
          />

          <Route path="/portal" element={<PortalLoginPage />} />
          <Route path="/portal/mis-entregas" element={<MyDeliveriesPage />} />
          <Route path="/portal/guia/:trackingNumber" element={<DeliveryDetailPublicPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
