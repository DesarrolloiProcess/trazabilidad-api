import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ConductorLayout } from '#src/layouts/ConductorLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { Button } from '#src/components/ui/Button';
import { SignaturePad } from '#src/components/conductor/SignaturePad';
import { ApiError } from '#src/api/types';

export function RouteVerificationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const startedRef = useRef<string | null>(null);

  const routeQuery = useQuery({
    queryKey: ['route', id],
    queryFn: () => apiClient.getRouteById(id!),
    enabled: Boolean(id),
  });

  const deliveriesQuery = useQuery({
    queryKey: ['deliveries', 'route', id],
    queryFn: () => apiClient.listDeliveries({ routeId: id!, page: 1, limit: 100 }),
    enabled: Boolean(id),
  });

  const pending = useMemo(
    () => deliveriesQuery.data?.data.filter((d) => d.status === 'creado') ?? [],
    [deliveriesQuery.data],
  );

  // Marca automáticamente el inicio del alistamiento la primera vez que el CDI abre esta
  // planilla (hito de inicio para la trazabilidad completa) — no requiere acción del usuario
  // y es seguro llamarlo más de una vez (el backend lo ignora si ya quedó marcado).
  useEffect(() => {
    if (!id || pending.length === 0 || startedRef.current === id) return;
    startedRef.current = id;
    apiClient.startRouteVerification(id).catch(() => {
      // best-effort: si falla, el hito de inicio simplemente no queda registrado para esta
      // planilla, pero no debe bloquear al CDI de verificar y confirmar.
    });
  }, [id, pending.length]);

  const verifyMutation = useMutation({
    mutationFn: () => apiClient.verifyRoute(id!, signatureUrl!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cdi'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      navigate('/cdi', { replace: true });
    },
  });

  const toggleReviewed = (deliveryId: string) => {
    setReviewed((prev) => {
      const next = new Set(prev);
      if (next.has(deliveryId)) next.delete(deliveryId);
      else next.add(deliveryId);
      return next;
    });
  };

  const allReviewed = pending.length > 0 && pending.every((d) => reviewed.has(d.id));

  if (routeQuery.isLoading || deliveriesQuery.isLoading) {
    return (
      <ConductorLayout title="Verificar planilla" brandLabel="FarmaTrack Droguería">
        <SealLoader label="Cargando planilla…" />
      </ConductorLayout>
    );
  }

  if (routeQuery.isError || deliveriesQuery.isError || !routeQuery.data) {
    return (
      <ConductorLayout title="Verificar planilla" brandLabel="FarmaTrack Droguería">
        <ErrorBanner
          message={
            routeQuery.error instanceof ApiError ? routeQuery.error.message : 'No pudimos cargar esta planilla.'
          }
        />
        <Button variant="secondary" className="mt-4 w-full" onClick={() => navigate('/cdi')}>
          Volver
        </Button>
      </ConductorLayout>
    );
  }

  return (
    <ConductorLayout
      title={`Planilla ${routeQuery.data.code}`}
      subtitle={`${pending.length} ${pending.length === 1 ? 'entrega' : 'entregas'} por verificar`}
      brandLabel="FarmaTrack Droguería"
    >
      {verifyMutation.isError && (
        <div className="mb-4">
          <ErrorBanner
            message={
              verifyMutation.error instanceof ApiError ? verifyMutation.error.message : 'No pudimos verificar la planilla.'
            }
          />
        </div>
      )}

      {pending.length === 0 ? (
        <div className="rounded-xl border border-dispensed/30 bg-white p-5 text-center">
          <p className="text-sm text-slate-500">Esta planilla ya fue verificada.</p>
          <Button className="mt-4 w-full" onClick={() => navigate('/cdi')}>
            Volver
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-slate-500">
            Marca cada punto una vez confirmes que las cantidades y el contenido coinciden con la planilla física.
          </p>

          <ul className="space-y-2.5">
            {pending.map((delivery) => {
              const isReviewed = reviewed.has(delivery.id);
              return (
                <li key={delivery.id}>
                  <button
                    onClick={() => toggleReviewed(delivery.id)}
                    className={`w-full rounded-xl border bg-white p-3.5 text-left transition-colors ${
                      isReviewed ? 'border-dispensed/40 bg-dispensed/5' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-navy">{delivery.trackingNumber}</p>
                        <p className="truncate text-sm text-slate-600">{delivery.recipientName}</p>
                        <p className="truncate text-xs text-slate-400">{delivery.address}</p>
                      </div>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                          isReviewed ? 'bg-dispensed text-white' : 'border border-slate-300 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                    </div>
                    <ul className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                      {delivery.products.map((product) => (
                        <li key={product.code} className="flex items-center justify-between text-xs text-slate-500">
                          <span>{product.description}</span>
                          <span className="font-mono">× {product.quantity}</span>
                        </li>
                      ))}
                    </ul>
                  </button>
                </li>
              );
            })}
          </ul>

          {allReviewed && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-navy">
                Firma de quien verifica
              </p>
              <SignaturePad onChange={setSignatureUrl} />
            </div>
          )}

          <Button
            size="lg"
            className="mt-5 w-full"
            disabled={!allReviewed || !signatureUrl}
            isLoading={verifyMutation.isPending}
            onClick={() => verifyMutation.mutate()}
          >
            {!allReviewed
              ? `Verifica los ${pending.length - reviewed.size} puntos restantes`
              : !signatureUrl
                ? 'Firma para confirmar'
                : 'Confirmar planilla verificada'}
          </Button>
        </>
      )}
    </ConductorLayout>
  );
}
