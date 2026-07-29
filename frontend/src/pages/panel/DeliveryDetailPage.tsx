import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { Button } from '#src/components/ui/Button';
import { StatusSeal } from '#src/components/status/StatusSeal';
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_TONE } from '#src/components/status/statusConfig';
import { DeliveryMap } from '#src/components/map/DeliveryMap';
import { ApiError } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';
import { generateActaPdf } from '#src/utils/generateActaPdf';

export function DeliveryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['delivery', id],
    queryFn: () => apiClient.getDeliveryById(id!),
    enabled: Boolean(id),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const exportMutation = useMutation({
    mutationFn: () => apiClient.exportInvoice(id!),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery', id] }),
  });

  const handleDownloadActa = async () => {
    if (!query.data) return;
    setPdfError(null);
    setGeneratingPdf(true);
    try {
      await generateActaPdf({
        trackingNumber: query.data.trackingNumber,
        address: query.data.address,
        recipientName: query.data.recipientName,
        products: query.data.products,
        receiverName: query.data.receiverName,
        receiverIdNumber: query.data.receiverIdNumber,
        deliveredAt: query.data.deliveredAt,
        latitude: query.data.latitude,
        longitude: query.data.longitude,
        signatureUrl: query.data.signatureUrl,
        photoUrl: query.data.photoUrl,
        createdAt: query.data.createdAt,
        alistamientoStartedAt: query.data.alistamientoStartedAt,
        alistamientoEndedAt: query.data.alistamientoEndedAt,
        verifierSignatureUrl: query.data.verifierSignatureUrl,
      });
    } catch {
      setPdfError('No pudimos generar el acta de entrega. Intenta nuevamente.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <PanelLayout>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <Link to="/panel/entregas" className="text-xs font-semibold text-cold hover:underline">
          ← Volver a entregas
        </Link>
        <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-navy">
          {query.data ? query.data.trackingNumber : 'Detalle de entrega'}
        </h1>
      </div>

      <div className="p-8">
        {query.isError && (
          <ErrorBanner message={query.error instanceof ApiError ? query.error.message : 'No pudimos cargar esta entrega.'} />
        )}

        {query.isLoading ? (
          <SealLoader label="Cargando entrega…" />
        ) : query.data ? (
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="mb-3 border-b border-slate-100 pb-2 font-display text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Contenido del envío
                </p>
                <ul className="divide-y divide-slate-100">
                  {query.data.products.map((product) => (
                    <li key={product.code} className="flex items-center justify-between py-2.5 text-sm">
                      <div>
                        <p className="font-medium text-navy">{product.description}</p>
                        <p className="font-mono text-xs text-slate-400">{product.code}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono tabular-nums text-navy">× {product.quantity}</p>
                        <p className="text-xs text-slate-400">${product.price.toLocaleString('es-CO')} c/u</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="mb-3 border-b border-slate-100 pb-2 font-display text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Ubicación
                </p>
                <DeliveryMap
                  destination={{ lat: query.data.destinationLatitude ?? NaN, lng: query.data.destinationLongitude ?? NaN }}
                  destinationLabel={query.data.address}
                  evidence={
                    query.data.latitude != null && query.data.longitude != null
                      ? { lat: query.data.latitude, lng: query.data.longitude }
                      : undefined
                  }
                />
              </section>

              {query.data.status === 'entregado_cliente' && (
                <section className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="mb-3 border-b border-slate-100 pb-2 font-display text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Evidencia de entrega
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Recibido por</p>
                      <p className="mt-0.5 font-medium text-navy">{query.data.receiverName}</p>
                      <p className="font-mono text-xs text-slate-500">CC {query.data.receiverIdNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Geolocalización</p>
                      <p className="mt-0.5 font-mono text-xs text-navy">
                        {query.data.latitude?.toFixed(4)}, {query.data.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  {(query.data.signatureUrl || query.data.photoUrl) && (
                    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      {query.data.signatureUrl && (
                        <div>
                          <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">Firma</p>
                          <img src={query.data.signatureUrl} alt="Firma del receptor" className="w-full rounded-lg border border-slate-200" />
                        </div>
                      )}
                      {query.data.photoUrl && (
                        <div>
                          <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">Foto</p>
                          <img
                            src={query.data.photoUrl}
                            alt="Foto de entrega"
                            className="aspect-square w-full rounded-lg border border-slate-200 object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {query.data.status === 'no_entregado' && query.data.observation && (
                <ErrorBanner title="Observación de no entrega" message={query.data.observation} />
              )}
            </div>

            <aside className="h-fit rounded-xl border border-slate-200 bg-white p-5">
              <p className="mb-3 border-b border-slate-100 pb-2 font-display text-xs font-semibold uppercase tracking-wide text-slate-400">
                Estado
              </p>
              <StatusSeal label={DELIVERY_STATUS_LABEL[query.data.status]} tone={DELIVERY_STATUS_TONE[query.data.status]} size="lg" />

              {query.data.status !== 'creado' && (
                <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <span aria-hidden="true">📱</span>
                  Pre-alerta enviada al paciente por WhatsApp
                </div>
              )}

              {query.data.status === 'entregado_cliente' && query.data.deliveredAt && (
                <div className="mt-3 rounded-lg border-l-4 border-dispensed bg-dispensed/5 px-3 py-2.5">
                  <p className="text-sm font-semibold text-dispensed">✅ Habilitado para facturación</p>
                  <p className="mt-0.5 text-xs text-navy/70">
                    Desde {new Date(query.data.deliveredAt).toLocaleString('es-CO')}
                  </p>
                  {query.data.invoiced ? (
                    <p className="mt-2 text-xs font-semibold text-dispensed">
                      Ya exportada{query.data.invoicedAt && ` · ${new Date(query.data.invoicedAt).toLocaleString('es-CO')}`}
                    </p>
                  ) : (
                    <Button
                      size="md"
                      className="mt-2.5 w-full"
                      isLoading={exportMutation.isPending}
                      onClick={() => exportMutation.mutate()}
                    >
                      Exportar a facturación
                    </Button>
                  )}
                  {exportMutation.isError && (
                    <p className="mt-1.5 text-xs font-medium text-controlled">
                      {exportMutation.error instanceof ApiError ? exportMutation.error.message : 'No se pudo exportar.'}
                    </p>
                  )}
                </div>
              )}

              {query.data.status === 'entregado_cliente' && (
                <div className="mt-3">
                  <Button variant="secondary" className="w-full" isLoading={generatingPdf} onClick={handleDownloadActa}>
                    Descargar acta de entrega
                  </Button>
                  {pdfError && <p className="mt-1.5 text-xs font-medium text-controlled">{pdfError}</p>}
                </div>
              )}

              <dl className="mt-4 space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-400">Paciente</dt>
                  <dd className="font-medium text-navy">{query.data.recipientName}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Dirección</dt>
                  <dd className="text-right font-medium text-navy">{query.data.address}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-400">Teléfono</dt>
                  <dd className="font-mono text-navy">{query.data.recipientPhone}</dd>
                </div>
                {query.data.deliveredAt && (
                  <div className="flex justify-between">
                    <dt className="text-slate-400">Fecha entrega</dt>
                    <dd className="font-medium text-navy">{new Date(query.data.deliveredAt).toLocaleString('es-CO')}</dd>
                  </div>
                )}
              </dl>

              {query.data.statusHistory.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-3 font-display text-xs font-semibold uppercase tracking-wide text-slate-400">Línea de tiempo</p>
                  <ol className="space-y-3">
                    {query.data.statusHistory.map((entry, index) => {
                      const isLast = index === query.data!.statusHistory.length - 1;
                      const isAlistado = entry.status === 'alistado';
                      return (
                        <li key={`${entry.status}-${entry.changedAt}`} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <span
                              className={`seal h-2.5 w-2.5 shrink-0 ${isLast ? 'bg-cold' : 'bg-slate-300'}`}
                              aria-hidden="true"
                            />
                            {!isLast && <span className="mt-1 w-px flex-1 bg-slate-200" />}
                          </div>
                          <div className="pb-1">
                            {isAlistado && query.data!.alistamientoStartedAt && (
                              <p className="text-xs text-slate-400">
                                Inicio: {new Date(query.data!.alistamientoStartedAt).toLocaleString('es-CO')}
                              </p>
                            )}
                            <p className="text-sm font-medium text-navy">
                              {isAlistado ? 'Alistamiento verificado y planilla liberada' : DELIVERY_STATUS_LABEL[entry.status]}
                            </p>
                            <p className="text-xs text-slate-400">{new Date(entry.changedAt).toLocaleString('es-CO')}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}

              {query.data.verifierSignatureUrl && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="mb-1.5 text-xs uppercase tracking-wide text-slate-400">Firma de verificación (CDI)</p>
                  <img
                    src={query.data.verifierSignatureUrl}
                    alt="Firma del verificador CDI"
                    className="w-full rounded-lg border border-slate-200"
                  />
                </div>
              )}
            </aside>
          </div>
        ) : null}
      </div>
    </PanelLayout>
  );
}
