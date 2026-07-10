import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PortalLayout } from '#src/layouts/PortalLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { StatusSeal } from '#src/components/status/StatusSeal';
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_TONE } from '#src/components/status/statusConfig';
import { ApiError } from '#src/api/types';
import { getPortalSession } from '#src/pages/portal/portalSession';

const STATUS_EVIDENCE_COPY: Record<string, string> = {
  creado: 'Tu pedido fue recibido y está siendo preparado en el CEDI.',
  alistado: 'Tu pedido está alistado y pronto será entregado al transportador.',
  entregado_transportador: 'Tu pedido va en camino con el transportador asignado.',
  entregado_cliente: 'Entrega confirmada. Validada con firma digital y geolocalización.',
  no_entregado: 'No fue posible entregar el pedido en el último intento. Será reprogramado.',
};

export function DeliveryDetailPublicPage() {
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const navigate = useNavigate();
  const session = getPortalSession();

  useEffect(() => {
    if (!session) navigate('/portal', { replace: true });
  }, [session, navigate]);

  const query = useQuery({
    queryKey: ['portal', 'delivery', trackingNumber],
    queryFn: () => apiClient.trackDelivery(trackingNumber!, session!.verificationValue),
    enabled: Boolean(session && trackingNumber),
  });

  if (!session) return null;

  return (
    <PortalLayout wide>
      <Link to="/portal/mis-entregas" className="mb-4 inline-block text-xs font-semibold text-cold hover:underline">
        ← Volver a mis pedidos
      </Link>

      {query.isLoading ? (
        <SealLoader label="Cargando tu pedido…" />
      ) : query.isError ? (
        <ErrorBanner message={query.error instanceof ApiError ? query.error.message : 'No pudimos cargar este pedido.'} />
      ) : query.data ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-bold text-navy">{query.data.trackingNumber}</p>
              <p className="text-sm text-slate-500">{query.data.address}</p>
            </div>
            <StatusSeal label={DELIVERY_STATUS_LABEL[query.data.status]} tone={DELIVERY_STATUS_TONE[query.data.status]} />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="mb-2 border-b border-slate-100 pb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-slate-400">
                Contenido del envío
              </p>
              <ul className="space-y-1.5">
                {query.data.products.map((product) => (
                  <li key={product.code} className="flex items-center justify-between text-sm">
                    <span className="text-navy">{product.description}</span>
                    <span className="font-mono text-xs text-slate-400">× {product.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 border-b border-slate-100 pb-1.5 font-display text-xs font-semibold uppercase tracking-wide text-slate-400">
                Estado
              </p>
              <div className="rounded-lg border-l-4 border-cold bg-cold/5 px-3.5 py-3 text-sm text-navy/80">
                {STATUS_EVIDENCE_COPY[query.data.status]}
              </div>
              {query.data.deliveredAt && (
                <p className="mt-2 text-xs text-slate-400">{new Date(query.data.deliveredAt).toLocaleString('es-CO')}</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </PortalLayout>
  );
}
