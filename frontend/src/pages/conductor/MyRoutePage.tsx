import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ConductorLayout } from '#src/layouts/ConductorLayout';
import { apiClient } from '#src/api/client';
import { useAuthStore } from '#src/store/authStore';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { EmptyState } from '#src/components/ui/EmptyState';
import { Button } from '#src/components/ui/Button';
import { QrScannerDialog } from '#src/components/conductor/QrScannerDialog';
import { ApiError, type DeliveryDto } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';

const TERMINAL_STATUSES = new Set(['entregado_cliente', 'no_entregado']);

export function MyRoutePage() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const routesQuery = useQuery({
    queryKey: ['routes', 'driver', user?.id],
    queryFn: () => apiClient.listRoutes({ driverId: user!.id, page: 1, limit: 5 }),
    enabled: Boolean(user),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const activeRoute = routesQuery.data?.data[0];

  const deliveriesQuery = useQuery({
    queryKey: ['deliveries', 'route', activeRoute?.id],
    queryFn: () => apiClient.listDeliveries({ routeId: activeRoute!.id, page: 1, limit: 100 }),
    enabled: Boolean(activeRoute),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const deliveries = deliveriesQuery.data?.data ?? [];
  const done = deliveries.filter((d) => TERMINAL_STATUSES.has(d.status)).length;
  const pending = deliveries.length - done;
  const nextStop = deliveries.find((d) => !TERMINAL_STATUSES.has(d.status));

  const handleScan = (code: string) => {
    const match = deliveries.find((d) => d.trackingNumber.toUpperCase() === code.toUpperCase());
    if (!match) {
      setScanError(`No encontramos la guía "${code}" en tu ruta de hoy.`);
      return;
    }
    setScannerOpen(false);
    setScanError(null);
    navigate(`/conductor/entregas/${match.id}`);
  };

  return (
    <ConductorLayout title="Mi ruta de hoy" subtitle={activeRoute ? `${user?.name} · Ruta ${activeRoute.code}` : user?.name}>
      {routesQuery.isError && (
        <ErrorBanner message={routesQuery.error instanceof ApiError ? routesQuery.error.message : 'No pudimos cargar tu ruta.'} />
      )}

      {routesQuery.isLoading ? (
        <SealLoader label="Buscando tu ruta…" />
      ) : !activeRoute ? (
        <EmptyState title="Sin ruta asignada" description="Todavía no tienes una ruta activa para hoy. Contacta a tu CEDI." />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-3 gap-3">
            <SummaryChip label="Puntos" value={deliveries.length} />
            <SummaryChip label="Entregados" value={done} tone="text-dispensed" />
            <SummaryChip label="Pendientes" value={pending} tone="text-thermal" />
          </div>

          <Button
            variant="secondary"
            className="mb-4 w-full"
            onClick={() => {
              setScanError(null);
              setScannerOpen(true);
            }}
          >
            Escanear guía
          </Button>

          {scanError && <ErrorBanner message={scanError} />}

          {deliveriesQuery.isLoading ? (
            <SealLoader label="Cargando puntos de entrega…" />
          ) : (
            <ul className="space-y-2.5">
              {deliveries.map((delivery, index) => (
                <Stop key={delivery.id} delivery={delivery} index={index + 1} onOpen={() => navigate(`/conductor/entregas/${delivery.id}`)} />
              ))}
            </ul>
          )}

          {nextStop && (
            <Button size="lg" className="mt-5 w-full" onClick={() => navigate(`/conductor/entregas/${nextStop.id}`)}>
              Continuar con el punto {deliveries.indexOf(nextStop) + 1}
            </Button>
          )}
        </>
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

      <QrScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} onScan={handleScan} />
    </ConductorLayout>
  );
}

function SummaryChip({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center">
      <p className={`font-display text-2xl font-bold tabular-nums ${tone ?? 'text-navy'}`}>{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function Stop({ delivery, index, onOpen }: { delivery: DeliveryDto; index: number; onOpen: () => void }) {
  const isDone = TERMINAL_STATUSES.has(delivery.status);
  const isNotDelivered = delivery.status === 'no_entregado';

  return (
    <li>
      <button
        onClick={onOpen}
        className={`flex w-full items-center gap-3 rounded-xl border bg-white p-3.5 text-left transition-colors ${
          isDone ? (isNotDelivered ? 'border-controlled/30' : 'border-dispensed/30') : 'border-slate-200 hover:border-cold'
        }`}
      >
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
            isDone
              ? isNotDelivered
                ? 'bg-controlled/10 text-controlled'
                : 'bg-dispensed/10 text-dispensed'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          {isDone ? (isNotDelivered ? '!' : '✓') : index}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy">{delivery.recipientName}</p>
          <p className="truncate text-xs text-slate-500">{delivery.address}</p>
        </div>
        <span
          className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${
            isDone ? (isNotDelivered ? 'text-controlled' : 'text-dispensed') : 'text-thermal'
          }`}
        >
          {isDone ? (isNotDelivered ? 'No entregado' : 'Entregado') : 'Pendiente'}
        </span>
      </button>
    </li>
  );
}
