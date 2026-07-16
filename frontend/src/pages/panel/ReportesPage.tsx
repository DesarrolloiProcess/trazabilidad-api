import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_TONE, TONE_HEX } from '#src/components/status/statusConfig';
import type { DeliveryStatus } from '#src/api/types';

const STATUS_ORDER: DeliveryStatus[] = ['creado', 'alistado', 'entregado_transportador', 'entregado_cliente', 'no_entregado'];

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function ReportesPage() {
  const today = useMemo(() => new Date(), []);
  const thirtyDaysAgo = useMemo(() => new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), [today]);

  const [fromDate, setFromDate] = useState(isoDate(thirtyDaysAgo));
  const [toDate, setToDate] = useState(isoDate(today));
  const [cediFilter, setCediFilter] = useState('all');

  const deliveriesQuery = useQuery({
    queryKey: ['deliveries', 'reportes'],
    queryFn: () => apiClient.listDeliveries({ page: 1, limit: 100 }),
  });

  const routesQuery = useQuery({
    queryKey: ['routes', 'reportes'],
    queryFn: () => apiClient.listRoutes({ page: 1, limit: 100 }),
  });

  const centersQuery = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
  });

  const routeCediById = new Map((routesQuery.data?.data ?? []).map((r) => [r.id, r.distributionCenterId]));

  const filtered = useMemo(() => {
    if (!deliveriesQuery.data) return [];
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);

    return deliveriesQuery.data.data.filter((d) => {
      const created = new Date(d.createdAt);
      const inRange = created >= from && created <= to;
      const matchesCedi = cediFilter === 'all' || routeCediById.get(d.routeId) === cediFilter;
      return inRange && matchesCedi;
    });
  }, [deliveriesQuery.data, fromDate, toDate, cediFilter, routeCediById]);

  const countsByStatus = STATUS_ORDER.map((status) => ({
    status,
    count: filtered.filter((d) => d.status === status).length,
  }));

  const maxCount = Math.max(1, ...countsByStatus.map((c) => c.count));
  const isLoading = deliveriesQuery.isLoading || routesQuery.isLoading || centersQuery.isLoading;

  return (
    <PanelLayout>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Reportes</h1>
        <p className="mt-1 text-sm text-slate-500">Resumen de entregas por estado, filtrado por fecha y CEDI</p>
      </div>

      <div className="p-8">
        {(deliveriesQuery.isError || routesQuery.isError) && (
          <ErrorBanner message="No pudimos cargar los datos para el reporte." />
        )}

        <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5">
          <div>
            <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-navy">Desde</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-navy">Hasta</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-navy"
            />
          </div>
          <div>
            <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-navy">CEDI</label>
            <select
              value={cediFilter}
              onChange={(e) => setCediFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-navy"
            >
              <option value="all">Todos los CEDIs</option>
              {centersQuery.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <SealLoader label="Calculando reporte…" />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-navy">
              {filtered.length} entregas en el rango seleccionado
            </p>

            <div className="mt-5 space-y-4">
              {countsByStatus.map(({ status, count }) => (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-navy">{DELIVERY_STATUS_LABEL[status]}</span>
                    <span className="font-mono text-slate-500">{count}</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: TONE_HEX[DELIVERY_STATUS_TONE[status]],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
