import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ConductorLayout } from '#src/layouts/ConductorLayout';
import { apiClient } from '#src/api/client';
import { useAuthStore } from '#src/store/authStore';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { EmptyState } from '#src/components/ui/EmptyState';
import { ApiError } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';

export function CdiVerificationListPage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const [selectedCediId, setSelectedCediId] = useState('');

  const centersQuery = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
    enabled: isAdmin,
  });

  // ADMIN no pertenece a un CEDI propio — necesita elegir cuál planilla revisar.
  const distributionCenterId = isAdmin ? selectedCediId : user?.distributionCenterId;

  const query = useQuery({
    queryKey: ['cdi', 'pending-verification', distributionCenterId],
    queryFn: () => apiClient.listPendingVerification(distributionCenterId!),
    enabled: Boolean(distributionCenterId),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  return (
    <ConductorLayout title="Planillas por verificar" subtitle={user?.name} brandLabel="FarmaTrack Droguería">
      {isAdmin && (
        <div className="mb-4">
          <label htmlFor="cedi-selector" className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-navy">
            Droguería a revisar
          </label>
          <select
            id="cedi-selector"
            value={selectedCediId}
            onChange={(e) => setSelectedCediId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-navy"
          >
            <option value="">Selecciona una droguería…</option>
            {centersQuery.data?.map((cedi) => (
              <option key={cedi.id} value={cedi.id}>
                {cedi.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {query.isError && (
        <ErrorBanner
          message={query.error instanceof ApiError ? query.error.message : 'No pudimos cargar las planillas pendientes.'}
        />
      )}

      {!distributionCenterId ? (
        <EmptyState title="Selecciona una droguería" description="Elige la droguería cuyas planillas quieres revisar." />
      ) : query.isLoading ? (
        <SealLoader label="Buscando planillas…" />
      ) : !query.data || query.data.length === 0 ? (
        <EmptyState
          title="Sin planillas pendientes"
          description="Todas las planillas recibidas ya fueron verificadas. Cuando llegue una nueva, aparecerá aquí."
        />
      ) : (
        <ul className="space-y-2.5">
          {query.data.map(({ route, deliveries }) => (
            <li key={route.id}>
              <button
                onClick={() => navigate(`/cdi/rutas/${route.id}`)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-cold"
              >
                <div>
                  <p className="font-mono text-sm font-bold text-navy">{route.code}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{new Date(route.date).toLocaleDateString('es-CO')}</p>
                </div>
                <span className="rounded-full bg-thermal/10 px-2.5 py-1 text-xs font-bold text-thermal">
                  {deliveries.length} por verificar
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => {
          logout();
          navigate('/login', { replace: true });
        }}
        className="mt-8 w-full text-center text-xs font-semibold uppercase tracking-wide text-slate-400"
      >
        Cerrar sesión
      </button>
    </ConductorLayout>
  );
}
