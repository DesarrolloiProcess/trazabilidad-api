import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { PortalLayout } from '#src/layouts/PortalLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { StatusSeal } from '#src/components/status/StatusSeal';
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_TONE } from '#src/components/status/statusConfig';
import { ApiError } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';
import { clearPortalSession, getPortalSession } from '#src/pages/portal/portalSession';

export function MyDeliveriesPage() {
  const navigate = useNavigate();
  const session = getPortalSession();

  useEffect(() => {
    if (!session) navigate('/portal', { replace: true });
  }, [session, navigate]);

  const query = useQuery({
    queryKey: ['portal', 'my-deliveries', session?.trackingNumber],
    queryFn: () => apiClient.listMyDeliveries(session!.trackingNumber, session!.verificationValue),
    enabled: Boolean(session),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  if (!session) return null;

  return (
    <PortalLayout wide>
      {query.isLoading ? (
        <SealLoader label="Cargando tus pedidos…" />
      ) : query.isError ? (
        <ErrorBanner message={query.error instanceof ApiError ? query.error.message : 'No pudimos cargar tus pedidos.'} />
      ) : query.data ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-bold text-navy">
                {query.data.deliveries[0]?.recipientName ?? 'Tus pedidos'}
              </p>
              <p className="text-xs text-slate-400">{query.data.client.name}</p>
            </div>
            <button
              onClick={() => {
                clearPortalSession();
                navigate('/portal');
              }}
              className="text-xs font-semibold uppercase tracking-wide text-slate-400 hover:text-cold"
            >
              Salir
            </button>
          </div>

          <ul className="divide-y divide-slate-100">
            {query.data.deliveries.map((delivery) => (
              <li key={delivery.trackingNumber}>
                <Link
                  to={`/portal/guia/${delivery.trackingNumber}`}
                  className="flex items-center justify-between gap-4 py-3.5 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold text-navy">{delivery.trackingNumber}</p>
                    <p className="truncate text-sm text-slate-500">{delivery.address}</p>
                  </div>
                  <StatusSeal label={DELIVERY_STATUS_LABEL[delivery.status]} tone={DELIVERY_STATUS_TONE[delivery.status]} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </PortalLayout>
  );
}
