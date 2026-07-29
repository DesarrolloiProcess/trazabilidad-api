import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { useAuthStore } from '#src/store/authStore';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { EmptyState } from '#src/components/ui/EmptyState';
import { Button } from '#src/components/ui/Button';
import { StatusSeal } from '#src/components/status/StatusSeal';
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_TONE } from '#src/components/status/statusConfig';
import { ApiError, type DeliveryDto, type DeliveryStatus } from '#src/api/types';
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

type SortColumn = 'trackingNumber' | 'recipientName' | 'address' | 'status' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

const PAGE_SIZE = 30;

function sortValue(delivery: DeliveryDto, column: SortColumn): string | number {
  switch (column) {
    case 'trackingNumber':
      return delivery.trackingNumber;
    case 'recipientName':
      return delivery.recipientName;
    case 'address':
      return delivery.address;
    case 'status':
      return DELIVERY_STATUS_LABEL[delivery.status];
    case 'updatedAt':
      return new Date(delivery.updatedAt).getTime();
  }
}

export function DeliveriesPage() {
  const isCedi = useAuthStore((s) => s.user?.role === 'CEDI');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  // Para el rol CEDI, "pendientes" reemplaza el dropdown de estado: es lo unico que le
  // corresponde gestionar (verificar), el resto queda en "historial", fuera del flujo activo.
  const [cediTab, setCediTab] = useState<'pendientes' | 'historial'>('pendientes');
  const [sortColumn, setSortColumn] = useState<SortColumn>('updatedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [page, setPage] = useState(1);
  const [importOpen, setImportOpen] = useState(false);

  const query = useQuery({
    queryKey: ['deliveries', 'panel-list'],
    queryFn: () => apiClient.listDeliveries({ page: 1, limit: 500 }),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const allDeliveries = query.data?.data ?? [];
  const pendingCount = allDeliveries.filter((d) => d.status === 'creado').length;
  const historialCount = allDeliveries.length - pendingCount;

  const handleSort = (column: SortColumn) => {
    if (column === sortColumn) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
    setPage(1);
  };

  const filteredAndSorted = useMemo(() => {
    const term = search.trim().toLowerCase();

    const filtered = allDeliveries.filter((delivery) => {
      const matchesStatus = isCedi
        ? cediTab === 'pendientes'
          ? delivery.status === 'creado'
          : delivery.status !== 'creado'
        : statusFilter === 'all' || delivery.status === statusFilter;
      const matchesSearch =
        term.length === 0 ||
        delivery.trackingNumber.toLowerCase().includes(term) ||
        delivery.recipientName.toLowerCase().includes(term) ||
        delivery.address.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });

    const sorted = [...filtered].sort((a, b) => {
      const va = sortValue(a, sortColumn);
      const vb = sortValue(b, sortColumn);
      const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
      return sortDirection === 'asc' ? cmp : -cmp;
    });

    return sorted;
  }, [allDeliveries, search, statusFilter, isCedi, cediTab, sortColumn, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filteredAndSorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const columns: Array<{ key: SortColumn; label: string }> = [
    { key: 'trackingNumber', label: 'Guía' },
    { key: 'recipientName', label: 'Paciente' },
    { key: 'address', label: 'Dirección' },
    { key: 'status', label: 'Estado' },
    { key: 'updatedAt', label: 'Último movimiento' },
  ];

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
            {isCedi && (
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => {
                    setCediTab('pendientes');
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    cediTab === 'pendientes' ? 'bg-cold text-white' : 'bg-white text-slate-500 border border-slate-300'
                  }`}
                >
                  Pendientes de verificación ({pendingCount})
                </button>
                <button
                  onClick={() => {
                    setCediTab('historial');
                    setPage(1);
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    cediTab === 'historial' ? 'bg-cold text-white' : 'bg-white text-slate-500 border border-slate-300'
                  }`}
                >
                  Historial ({historialCount})
                </button>
              </div>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por guía, destinatario, dirección…"
                className="min-w-[260px] flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
              />
              {!isCedi && (
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as DeliveryStatus | 'all');
                    setPage(1);
                  }}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-navy"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {filteredAndSorted.length === 0 ? (
              <EmptyState
                title="Sin resultados"
                description="No hay entregas que coincidan con el filtro actual. Ajusta la búsqueda o importa una nueva planilla."
              />
            ) : (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                        {columns.map((col) => (
                          <th key={col.key} className="px-5 py-3 font-medium">
                            <button
                              onClick={() => handleSort(col.key)}
                              className="flex items-center gap-1 uppercase tracking-wide text-slate-400 hover:text-navy"
                            >
                              {col.label}
                              {sortColumn === col.key && <span aria-hidden="true">{sortDirection === 'asc' ? '▲' : '▼'}</span>}
                            </button>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((delivery) => (
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

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xs text-slate-500">
                      Página {currentPage} de {totalPages} — {filteredAndSorted.length} registros
                    </p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="md" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                        Anterior
                      </Button>
                      <Button
                        variant="ghost"
                        size="md"
                        disabled={currentPage >= totalPages}
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      <TxtImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </PanelLayout>
  );
}
