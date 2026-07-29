import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { ConductorLayout } from '#src/layouts/ConductorLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { Button } from '#src/components/ui/Button';
import { TextField } from '#src/components/ui/TextField';
import { StatusSeal } from '#src/components/status/StatusSeal';
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_TONE } from '#src/components/status/statusConfig';
import { SignaturePad } from '#src/components/conductor/SignaturePad';
import { GeoCapture } from '#src/components/conductor/GeoCapture';
import { ApiError } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';
import { generateActaPdf } from '#src/utils/generateActaPdf';

export function DeliveryCapturePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['delivery', id],
    queryFn: () => apiClient.getDeliveryById(id!),
    enabled: Boolean(id),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState('');
  const [receiverIdNumber, setReceiverIdNumber] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [observation, setObservation] = useState('');
  const [showNotDelivered, setShowNotDelivered] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['delivery', id] });
    queryClient.invalidateQueries({ queryKey: ['deliveries'] });
  };

  const receiveMutation = useMutation({
    mutationFn: () => apiClient.advanceDeliveryStatus(id!, 'entregado_transportador'),
    onSuccess: invalidate,
  });

  const confirmMutation = useMutation({
    mutationFn: () =>
      apiClient.submitDeliveryEvidence(id!, {
        signatureUrl: signatureUrl!,
        photoUrl: photoUrl!,
        receiverName,
        receiverIdNumber,
        latitude: coords!.latitude,
        longitude: coords!.longitude,
      }),
    onSuccess: invalidate,
  });

  const notDeliveredMutation = useMutation({
    mutationFn: () => apiClient.markNotDelivered(id!, observation),
    onSuccess: invalidate,
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

  if (query.isLoading) {
    return (
      <ConductorLayout title="Entrega">
        <SealLoader label="Cargando entrega…" />
      </ConductorLayout>
    );
  }

  if (query.isError || !query.data) {
    return (
      <ConductorLayout title="Entrega">
        <ErrorBanner message={query.error instanceof ApiError ? query.error.message : 'No pudimos cargar esta entrega.'} />
        <Button variant="secondary" className="mt-4 w-full" onClick={() => navigate('/conductor')}>
          Volver a mi ruta
        </Button>
      </ConductorLayout>
    );
  }

  const delivery = query.data;
  const missingItems = [
    !signatureUrl && 'firma',
    !photoUrl && 'foto',
    !receiverName.trim() && 'nombre de quien recibe',
    !receiverIdNumber.trim() && 'cédula de quien recibe',
    !coords && 'ubicación',
  ].filter((item): item is string => Boolean(item));
  const canReadyForForm = missingItems.length === 0;

  return (
    <ConductorLayout title={delivery.recipientName} subtitle={`${delivery.trackingNumber} · ${delivery.address}`}>
      <div className="mb-4">
        <StatusSeal label={DELIVERY_STATUS_LABEL[delivery.status]} tone={DELIVERY_STATUS_TONE[delivery.status]} />
      </div>

      {(receiveMutation.isError || confirmMutation.isError || notDeliveredMutation.isError) && (
        <div className="mb-4">
          <ErrorBanner
            message={
              [receiveMutation.error, confirmMutation.error, notDeliveredMutation.error].find((e) => e instanceof ApiError)
                ?.message ?? 'No pudimos completar la acción.'
            }
          />
        </div>
      )}

      {delivery.status === 'creado' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center">
          <p className="text-sm text-slate-500">Esta entrega todavía no ha sido alistada por la droguería.</p>
        </div>
      )}

      {delivery.status === 'alistado' && (
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-600">La droguería ya alistó este pedido. Confirma que lo recibiste para iniciar el transporte.</p>
          <Button className="mt-4 w-full" size="lg" isLoading={receiveMutation.isPending} onClick={() => receiveMutation.mutate()}>
            Recibir para transporte
          </Button>
        </div>
      )}

      {delivery.status === 'entregado_transportador' && !showNotDelivered && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-navy">Firma de quien recibe</p>
            <SignaturePad onChange={setSignatureUrl} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-navy">Foto de entrega</p>
            <label className="flex h-20 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 text-sm text-slate-500">
              {photoUrl ? (
                <img src={photoUrl} alt="Evidencia de entrega" className="h-full rounded-lg object-cover" />
              ) : (
                'Tomar foto de soporte'
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setPhotoUrl(reader.result as string);
                  reader.readAsDataURL(file);
                }}
              />
            </label>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-navy">Datos de quien recibe</p>
            <div className="space-y-3">
              <TextField
                id="receiverName"
                name="receiverName"
                label="Nombre completo"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
              />
              <TextField
                id="receiverIdNumber"
                name="receiverIdNumber"
                label="Número de cédula"
                mono
                value={receiverIdNumber}
                onChange={(e) => setReceiverIdNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-navy">Ubicación</p>
            <GeoCapture onCapture={setCoords} />
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={!canReadyForForm}
            isLoading={confirmMutation.isPending}
            onClick={() => confirmMutation.mutate()}
          >
            Confirmar entrega
          </Button>
          {missingItems.length > 0 && (
            <p className="text-center text-xs font-medium text-controlled">Falta: {missingItems.join(', ')}</p>
          )}
          <button
            type="button"
            onClick={() => setShowNotDelivered(true)}
            className="w-full text-center text-xs font-semibold uppercase tracking-wide text-controlled"
          >
            No se pudo entregar
          </button>
        </div>
      )}

      {delivery.status === 'entregado_transportador' && showNotDelivered && (
        <div className="rounded-xl border border-controlled/30 bg-white p-4">
          <p className="mb-2 font-display text-xs font-semibold uppercase tracking-wide text-controlled">Motivo de no entrega</p>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            rows={4}
            placeholder="Ej: punto cerrado, no había quien recibiera…"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
          />
          {!observation.trim() && (
            <p className="mt-1 text-xs font-medium text-controlled">Escribe el motivo para poder confirmar.</p>
          )}
          <div className="mt-3 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowNotDelivered(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              disabled={!observation.trim()}
              isLoading={notDeliveredMutation.isPending}
              onClick={() => notDeliveredMutation.mutate()}
            >
              Confirmar
            </Button>
          </div>
        </div>
      )}

      {delivery.status === 'entregado_cliente' && (
        <div className="rounded-xl border border-dispensed/30 bg-white p-5 text-center">
          <span className="seal mx-auto mb-3 flex h-12 w-12 items-center justify-center bg-dispensed text-xl font-bold text-white">✓</span>
          <p className="font-display text-base font-bold text-navy">Entrega confirmada</p>
          <p className="mt-1 text-sm text-slate-500">
            {delivery.receiverName} · {delivery.deliveredAt && new Date(delivery.deliveredAt).toLocaleTimeString('es-CO')}
          </p>
          <div className="mt-3 rounded-lg border-l-4 border-dispensed bg-dispensed/5 px-3 py-2 text-left text-xs text-navy/80">
            El acta de entrega quedó lista para facturación. Notificación automática enviada por WhatsApp al paciente.
          </div>
          <Button variant="secondary" className="mt-4 w-full" isLoading={generatingPdf} onClick={handleDownloadActa}>
            Descargar acta de entrega
          </Button>
          {pdfError && <p className="mt-1.5 text-xs font-medium text-controlled">{pdfError}</p>}
          <Button className="mt-3 w-full" onClick={() => navigate('/conductor')}>
            Volver a mi ruta
          </Button>
        </div>
      )}

      {delivery.status === 'no_entregado' && (
        <div className="rounded-xl border border-controlled/30 bg-white p-5 text-center">
          <p className="font-display text-base font-bold text-controlled">No entregado</p>
          <p className="mt-1 text-sm text-slate-500">{delivery.observation}</p>
          <Button className="mt-4 w-full" onClick={() => navigate('/conductor')}>
            Volver a mi ruta
          </Button>
        </div>
      )}
    </ConductorLayout>
  );
}
