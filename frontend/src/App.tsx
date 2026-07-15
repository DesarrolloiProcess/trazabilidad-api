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
import { FacturacionPage } from '#src/pages/panel/FacturacionPage';
import { MapaRutasPage } from '#src/pages/panel/MapaRutasPage';
import { UsersPage } from '#src/pages/panel/UsersPage';
import { ReportesPage } from '#src/pages/panel/ReportesPage';
import { ConfiguracionPage } from '#src/pages/panel/ConfiguracionPage';
import { MiPerfilPage } from '#src/pages/panel/MiPerfilPage';

import { MyRoutePage } from '#src/pages/conductor/MyRoutePage';
import { DeliveryCapturePage } from '#src/pages/conductor/DeliveryCapturePage';

import { CdiVerificationListPage } from '#src/pages/cdi/CdiVerificationListPage';
import { RouteVerificationPage } from '#src/pages/cdi/RouteVerificationPage';

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
              <RequireRole roles={['ADMIN']}>
                <DashboardPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/entregas"
            element={
              <RequireRole roles={['ADMIN']}>
                <DeliveriesPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/entregas/:id"
            element={
              <RequireRole roles={['ADMIN']}>
                <DeliveryDetailPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/rutas"
            element={
              <RequireRole roles={['ADMIN']}>
                <RoutesPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/cedis"
            element={
              <RequireRole roles={['ADMIN']}>
                <DistributionCentersPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/mapa"
            element={
              <RequireRole roles={['ADMIN']}>
                <MapaRutasPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/facturacion"
            element={
              <RequireRole roles={['ADMIN']}>
                <FacturacionPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/usuarios"
            element={
              <RequireRole roles={['ADMIN']}>
                <UsersPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/reportes"
            element={
              <RequireRole roles={['ADMIN']}>
                <ReportesPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/configuracion"
            element={
              <RequireRole roles={['ADMIN']}>
                <ConfiguracionPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/perfil"
            element={
              <RequireRole roles={['ADMIN']}>
                <MiPerfilPage />
              </RequireRole>
            }
          />

          <Route
            path="/cdi"
            element={
              <RequireRole roles={['CEDI']}>
                <CdiVerificationListPage />
              </RequireRole>
            }
          />
          <Route
            path="/cdi/rutas/:id"
            element={
              <RequireRole roles={['CEDI']}>
                <RouteVerificationPage />
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
