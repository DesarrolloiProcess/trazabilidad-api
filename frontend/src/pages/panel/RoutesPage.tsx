import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { useAuthStore } from '#src/store/authStore';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { StatusSeal } from '#src/components/status/StatusSeal';
import { ROUTE_STATUS_LABEL, ROUTE_STATUS_TONE } from '#src/components/status/statusConfig';
import { ApiError, type RouteDto, type RouteStatus } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';

const ROUTE_TRANSITIONS: Record<RouteStatus, RouteStatus[]> = {
  creada: ['entregada_transportador'],
  entregada_transportador: ['en_curso'],
  en_curso: ['completada', 'con_novedad'],
  completada: [],
  con_novedad: [],
};

export function RoutesPage() {
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((s) => s.user?.role === 'ADMIN');

  const routesQuery = useQuery({
    queryKey: ['routes', 'panel-list'],
    queryFn: () => apiClient.listRoutes({ page: 1, limit: 100 }),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: () => apiClient.listDrivers(),
  });

  const centersQuery = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
  });

  const assignMutation = useMutation({
    mutationFn: ({ routeId, driverId }: { routeId: string; driverId: string }) => apiClient.assignDriver(routeId, driverId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ routeId, status }: { routeId: string; status: RouteStatus }) => apiClient.updateRouteStatus(routeId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  });

  return (
    <PanelLayout>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Rutas</h1>
        <p className="mt-1 text-sm text-slate-500">Asigna conductores y controla el avance de cada ruta del día</p>
      </div>

      <div className="p-8">
        {(routesQuery.isError || assignMutation.isError || statusMutation.isError) && (
          <ErrorBanner
            message={
              [routesQuery.error, assignMutation.error, statusMutation.error].find((e) => e instanceof ApiError)?.message ??
              'No pudimos completar la acción.'
            }
          />
        )}

        {routesQuery.isLoading ? (
          <SealLoader label="Cargando rutas…" />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Ruta</th>
                  <th className="px-5 py-3 font-medium">Droguería</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Conductor</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {routesQuery.data?.data.map((route: RouteDto) => {
                  const nextStatuses = ROUTE_TRANSITIONS[route.status];
                  return (
                    <tr key={route.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3 font-mono text-xs font-semibold">{route.code}</td>
                      <td className="px-5 py-3 text-slate-600">
                        {centersQuery.data?.find((c) => c.id === route.distributionCenterId)?.name ?? '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{new Date(route.date).toLocaleDateString('es-CO')}</td>
                      <td className="px-5 py-3">
                        {route.driverId ? (
                          driversQuery.data?.find((d) => d.id === route.driverId)?.name ?? '—'
                        ) : (
                          <select
                            defaultValue=""
                            disabled={assignMutation.isPending}
                            onChange={(e) => e.target.value && assignMutation.mutate({ routeId: route.id, driverId: e.target.value })}
                            className="rounded-md border border-thermal/40 bg-thermal/5 px-2 py-1 text-xs font-medium text-thermal"
                          >
                            <option value="">— sin asignar —</option>
                            {driversQuery.data
                              ?.filter((d) => d.distributionCenterId === route.distributionCenterId)
                              .map((driver) => (
                                <option key={driver.id} value={driver.id}>
                                  {driver.name}
                                </option>
                              ))}
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <StatusSeal label={ROUTE_STATUS_LABEL[route.status]} tone={ROUTE_STATUS_TONE[route.status]} size="sm" />
                          {isAdmin && nextStatuses.length > 0 && (
                            <select
                              defaultValue=""
                              disabled={statusMutation.isPending}
                              onChange={(e) =>
                                e.target.value && statusMutation.mutate({ routeId: route.id, status: e.target.value as RouteStatus })
                              }
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-500"
                            >
                              <option value="">Cambiar a…</option>
                              {nextStatuses.map((status) => (
                                <option key={status} value={status}>
                                  {ROUTE_STATUS_LABEL[status]}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
