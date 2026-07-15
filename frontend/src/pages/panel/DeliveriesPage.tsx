import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { EmptyState } from '#src/components/ui/EmptyState';
import { Button } from '#src/components/ui/Button';
import { StatusSeal } from '#src/components/status/StatusSeal';
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_TONE } from '#src/components/status/statusConfig';
import { ApiError, type DeliveryStatus } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';
import { TxtImportDialog } from '#src/pages/panel/TxtImportDialog';

const STATUS_FILTERS: Array<{ value: DeliveryStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'creado', label: DELIVERY_STATUS_LABEL.creado },
  { value: 'alistado', label: DELIVERY_STATUS_LABEL.alistado },
  { value: 'entregado_transportador', label: DELIVERY_STATUS_LABEL.entregado_transportador },
  { value: 'entregado_cliente', label: DELIVERY_STATUS_LABEL.entregado_cliente },
  { value: 'no_entregado', label: DELIVERY_STATUS_LABEL.no_entregado },
];

export function DeliveriesPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  const [importOpen, setImportOpen] = useState(false);

  const query = useQuery({
    queryKey: ['deliveries', 'panel-list'],
    queryFn: () => apiClient.listDeliveries({ page: 1, limit: 200 }),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const filtered = useMemo(() => {
    if (!query.data) return [];
    const term = search.trim().toLowerCase();

    return query.data.data.filter((delivery) => {
      const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
      const matchesSearch =
        term.length === 0 ||
        delivery.trackingNumber.toLowerCase().includes(term) ||
        delivery.recipientName.toLowerCase().includes(term) ||
        delivery.address.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [query.data, search, statusFilter]);

  return (
    <PanelLayout>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 bg-white px-8 py-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy">
            Entregas {query.data ? <span className="font-body text-base font-normal text-slate-400">({query.data.meta.total} registros)</span> : null}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Estado unificado de todos los pedidos en curso</p>
        </div>
        <Button onClick={() => setImportOpen(true)}>Importar planilla (TXT)</Button>
      </div>

      <div className="p-8">
        {query.isError && (
          <ErrorBanner message={query.error instanceof ApiError ? query.error.message : 'No pudimos cargar las entregas.'} />
        )}

        {query.isLoading ? (
          <SealLoader label="Cargando entregas…" />
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por guía, destinatario, dirección…"
                className="min-w-[260px] flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DeliveryStatus | 'all')}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-navy"
              >
                {STATUS_FILTERS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="Sin resultados"
                description="No hay entregas que coincidan con el filtro actual. Ajusta la búsqueda o importa una nueva planilla."
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3 font-medium">Guía</th>
                      <th className="px-5 py-3 font-medium">Destinatario</th>
                      <th className="px-5 py-3 font-medium">Dirección</th>
                      <th className="px-5 py-3 font-medium">Estado</th>
                      <th className="px-5 py-3 font-medium">Último movimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((delivery) => (
                      <tr key={delivery.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                        <td className="px-5 py-3">
                          <Link to={`/panel/entregas/${delivery.id}`} className="font-mono text-xs font-semibold text-cold hover:underline">
                            {delivery.trackingNumber}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-navy">{delivery.recipientName}</td>
                        <td className="px-5 py-3 text-slate-500">{delivery.address}</td>
                        <td className="px-5 py-3">
                          <StatusSeal label={DELIVERY_STATUS_LABEL[delivery.status]} tone={DELIVERY_STATUS_TONE[delivery.status]} size="sm" />
                        </td>
                        <td className="px-5 py-3 text-xs text-slate-400">{new Date(delivery.updatedAt).toLocaleString('es-CO')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <TxtImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </PanelLayout>
  );
}
