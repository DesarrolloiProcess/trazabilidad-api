import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { EmptyState } from '#src/components/ui/EmptyState';
import { ApiError } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';

export function FacturacionPage() {
  const [tab, setTab] = useState<'pendientes' | 'facturadas'>('pendientes');

  const query = useQuery({
    queryKey: ['deliveries', 'facturacion'],
    queryFn: () => apiClient.listDeliveries({ page: 1, limit: 100 }),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const deliverable = useMemo(
    () => (query.data?.data ?? []).filter((d) => d.status === 'entregado_cliente'),
    [query.data],
  );
  const pending = deliverable.filter((d) => !d.invoiced);
  const invoiced = deliverable.filter((d) => d.invoiced);
  const rows = tab === 'pendientes' ? pending : invoiced;

  return (
    <PanelLayout>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Facturación</h1>
        <p className="mt-1 text-sm text-slate-500">
          Vista de solo lectura: entregas confirmadas y su estado frente al sistema de facturación del cliente
        </p>
      </div>

      <div className="p-8">
        {query.isError && (
          <ErrorBanner message={query.error instanceof ApiError ? query.error.message : 'No pudimos cargar las entregas.'} />
        )}

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab('pendientes')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === 'pendientes' ? 'bg-cold text-white' : 'bg-white text-slate-500 border border-slate-300'
            }`}
          >
            Habilitadas para facturar ({pending.length})
          </button>
          <button
            onClick={() => setTab('facturadas')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === 'facturadas' ? 'bg-cold text-white' : 'bg-white text-slate-500 border border-slate-300'
            }`}
          >
            Facturadas ({invoiced.length})
          </button>
        </div>

        {query.isLoading ? (
          <SealLoader label="Cargando entregas facturables…" />
        ) : rows.length === 0 ? (
          <EmptyState
            title={tab === 'pendientes' ? 'Nada pendiente por facturar' : 'Aún no hay entregas facturadas'}
            description={
              tab === 'pendientes'
                ? 'Cuando una entrega se confirme, aparecerá aquí como habilitada para facturación.'
                : 'Las entregas que se marquen como facturadas quedarán registradas en esta pestaña.'
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Guía</th>
                  <th className="px-5 py-3 font-medium">Paciente</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">{tab === 'pendientes' ? 'Habilitado desde' : 'Facturado'}</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((delivery) => {
                  const total = delivery.products.reduce((sum, p) => sum + p.quantity * p.price, 0);
                  return (
                    <tr key={delivery.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-5 py-3">
                        <Link to={`/panel/entregas/${delivery.id}`} className="font-mono text-xs font-semibold text-cold hover:underline">
                          {delivery.trackingNumber}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-navy">{delivery.recipientName}</td>
                      <td className="px-5 py-3 font-mono tabular-nums text-navy">${total.toLocaleString('es-CO')}</td>
                      <td className="px-5 py-3 text-xs text-slate-400">
                        {new Date((tab === 'pendientes' ? delivery.deliveredAt : delivery.invoicedAt) ?? '').toLocaleString('es-CO')}
                      </td>
                      <td className="px-5 py-3">
                        {delivery.invoiced ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-dispensed">
                            <span className="seal h-2 w-2 bg-dispensed" aria-hidden="true" />
                            Facturado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-thermal">
                            <span className="seal h-2 w-2 bg-thermal" aria-hidden="true" />
                            Habilitado, pendiente
                          </span>
                        )}
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
