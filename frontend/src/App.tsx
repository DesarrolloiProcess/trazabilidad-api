import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
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
import { UsersPage } from '#src/pages/panel/UsersPage';
import { PatientsPage } from '#src/pages/panel/PatientsPage';
import { ReportesPage } from '#src/pages/panel/ReportesPage';
import { ConfiguracionPage } from '#src/pages/panel/ConfiguracionPage';
import { MiPerfilPage } from '#src/pages/panel/MiPerfilPage';

import { MyRoutePage } from '#src/pages/conductor/MyRoutePage';
import { DeliveryCapturePage } from '#src/pages/conductor/DeliveryCapturePage';

// React Router no remonta el elemento de una ruta solo porque cambie el parametro :id —
// sin esto, navegar de una entrega a otra reutiliza la instancia (y el estado local: firma,
// foto, campos del formulario) de la entrega anterior en vez de partir en blanco.
function KeyedDeliveryCapturePage() {
  const { id } = useParams<{ id: string }>();
  return <DeliveryCapturePage key={id} />;
}

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
              <RequireRole roles={['ADMIN']}>
                <DistributionCentersPage />
              </RequireRole>
            }
          />
          <Route
            path="/panel/facturacion"
            element={
              <RequireRole roles={['ADMIN', 'CEDI']}>
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
            path="/panel/pacientes"
            element={
              <RequireRole roles={['ADMIN']}>
                <PatientsPage />
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
              <RequireRole roles={['ADMIN', 'CEDI']}>
                <CdiVerificationListPage />
              </RequireRole>
            }
          />
          <Route
            path="/cdi/rutas/:id"
            element={
              <RequireRole roles={['ADMIN', 'CEDI']}>
                <RouteVerificationPage />
              </RequireRole>
            }
          />

          <Route
            path="/conductor"
            element={
              <RequireRole roles={['ADMIN', 'CONDUCTOR']}>
                <MyRoutePage />
              </RequireRole>
            }
          />
          <Route
            path="/conductor/entregas/:id"
            element={
              <RequireRole roles={['ADMIN', 'CONDUCTOR']}>
                <KeyedDeliveryCapturePage />
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
