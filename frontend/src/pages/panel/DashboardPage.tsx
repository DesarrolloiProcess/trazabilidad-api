import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { StatusSeal } from '#src/components/status/StatusSeal';
import { ROUTE_STATUS_LABEL, ROUTE_STATUS_TONE } from '#src/components/status/statusConfig';
import { ApiError } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function DashboardPage() {
  const deliveriesQuery = useQuery({
    queryKey: ['deliveries', 'dashboard'],
    queryFn: () => apiClient.listDeliveries({ page: 1, limit: 100 }),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const routesQuery = useQuery({
    queryKey: ['routes', 'dashboard'],
    queryFn: () => apiClient.listRoutes({ page: 1, limit: 50 }),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const centersQuery = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
  });

  const driversQuery = useQuery({
    queryKey: ['drivers'],
    queryFn: () => apiClient.listDrivers(),
  });

  return (
    <PanelLayout>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Panel operativo</h1>
        <p className="mt-1 text-sm text-slate-500">
          {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <div className="p-8">
        {(deliveriesQuery.isError || routesQuery.isError) && (
          <ErrorBanner
            message={
              deliveriesQuery.error instanceof ApiError
                ? deliveriesQuery.error.message
                : 'No pudimos cargar la información del panel.'
            }
          />
        )}

        {deliveriesQuery.isLoading || routesQuery.isLoading ? (
          <SealLoader label="Cargando panel…" />
        ) : deliveriesQuery.data && routesQuery.data ? (
          <>
            <Kpis deliveries={deliveriesQuery.data.data} />

            <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
              <div className="rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
                  <p className="font-display text-sm font-semibold uppercase tracking-wide text-navy">Rutas activas</p>
                  <Link to="/panel/rutas" className="text-xs font-semibold text-cold hover:underline">
                    Ver todas →
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
                        <th className="px-5 py-2.5 font-medium">Ruta</th>
                        <th className="px-5 py-2.5 font-medium">Droguería</th>
                        <th className="px-5 py-2.5 font-medium">Conductor</th>
                        <th className="px-5 py-2.5 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {routesQuery.data.data.map((route) => (
                        <tr key={route.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-5 py-3 font-mono text-xs font-medium">{route.code}</td>
                          <td className="px-5 py-3 text-slate-600">
                            {centersQuery.data?.find((c) => c.id === route.distributionCenterId)?.city ?? '—'}
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {route.driverId ? driversQuery.data?.find((d) => d.id === route.driverId)?.name ?? '—' : '— sin asignar'}
                          </td>
                          <td className="px-5 py-3">
                            <StatusSeal label={ROUTE_STATUS_LABEL[route.status]} tone={ROUTE_STATUS_TONE[route.status]} size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Alerts deliveries={deliveriesQuery.data.data} />
            </div>
          </>
        ) : null}
      </div>
    </PanelLayout>
  );
}

function Kpis({ deliveries }: { deliveries: import('#src/api/types').DeliveryDto[] }) {
  const activas = deliveries.filter((d) => ['creado', 'alistado', 'entregado_transportador'].includes(d.status)).length;
  const entregadasHoy = deliveries.filter((d) => d.status === 'entregado_cliente' && d.deliveredAt && isToday(d.deliveredAt)).length;
  const enAlistamiento = deliveries.filter((d) => d.status === 'alistado').length;
  const alertas = deliveries.filter((d) => d.status === 'no_entregado').length;

  const items = [
    { label: 'Entregas activas', value: activas, tone: 'text-navy' },
    { label: 'Entregadas hoy', value: entregadasHoy, tone: 'text-dispensed' },
    { label: 'En alistamiento', value: enAlistamiento, tone: 'text-cold' },
    { label: 'Alertas críticas', value: alertas, tone: 'text-controlled' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
          <p className={`mt-2 font-display text-4xl font-bold tabular-nums ${item.tone}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function Alerts({ deliveries }: { deliveries: import('#src/api/types').DeliveryDto[] }) {
  const alerts = deliveries.filter((d) => d.status === 'no_entregado').slice(0, 6);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3.5">
        <p className="font-display text-sm font-semibold uppercase tracking-wide text-navy">Alertas que requieren acción</p>
        <span className="rounded-full bg-controlled/10 px-2 py-0.5 text-xs font-bold text-controlled">{alerts.length}</span>
      </div>
      {alerts.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-slate-400">Sin novedades por ahora.</p>
      ) : (
        <ul>
          {alerts.map((delivery) => (
            <li key={delivery.id} className="border-b border-slate-100 px-5 py-3.5 last:border-0">
              <Link to={`/panel/entregas/${delivery.id}`} className="block hover:text-cold">
                <p className="font-mono text-xs font-semibold">{delivery.trackingNumber}</p>
                <p className="mt-0.5 text-sm text-slate-600">{delivery.observation ?? 'Pedido no entregado'}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
