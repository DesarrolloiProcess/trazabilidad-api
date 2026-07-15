import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { EmptyState } from '#src/components/ui/EmptyState';
import { Button } from '#src/components/ui/Button';
import { ApiError } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';

export function FacturacionPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'pendientes' | 'facturadas'>('pendientes');

  const query = useQuery({
    queryKey: ['deliveries', 'facturacion'],
    queryFn: () => apiClient.listDeliveries({ page: 1, limit: 200 }),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const exportMutation = useMutation({
    mutationFn: (id: string) => apiClient.exportInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
    },
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
        <p className="mt-1 text-sm text-slate-500">Entregas confirmadas, listas para exportar al sistema de facturación del cliente</p>
      </div>

      <div className="p-8">
        {(query.isError || exportMutation.isError) && (
          <ErrorBanner
            message={
              [query.error, exportMutation.error].find((e) => e instanceof ApiError)?.message ??
              'No pudimos completar la acción.'
            }
          />
        )}

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab('pendientes')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === 'pendientes' ? 'bg-cold text-white' : 'bg-white text-slate-500 border border-slate-300'
            }`}
          >
            Por exportar ({pending.length})
          </button>
          <button
            onClick={() => setTab('facturadas')}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
              tab === 'facturadas' ? 'bg-cold text-white' : 'bg-white text-slate-500 border border-slate-300'
            }`}
          >
            Ya exportadas ({invoiced.length})
          </button>
        </div>

        {query.isLoading ? (
          <SealLoader label="Cargando entregas facturables…" />
        ) : rows.length === 0 ? (
          <EmptyState
            title={tab === 'pendientes' ? 'Nada pendiente por exportar' : 'Aún no hay entregas exportadas'}
            description={
              tab === 'pendientes'
                ? 'Cuando una entrega se confirme, aparecerá aquí lista para exportar a facturación.'
                : 'Las entregas que ya exportes a facturación quedarán registradas en esta pestaña.'
            }
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Guía</th>
                  <th className="px-5 py-3 font-medium">Destinatario</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">{tab === 'pendientes' ? 'Habilitado desde' : 'Exportado'}</th>
                  <th className="px-5 py-3 font-medium">Acción</th>
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
                          <Button
                            size="md"
                            isLoading={exportMutation.isPending && exportMutation.variables === delivery.id}
                            onClick={() => exportMutation.mutate(delivery.id)}
                          >
                            Exportar a facturación
                          </Button>
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
