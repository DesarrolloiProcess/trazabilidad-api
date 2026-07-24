import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '#src/api/client';
import { ApiError } from '#src/api/types';
import { Button } from '#src/components/ui/Button';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { useAuthStore } from '#src/store/authStore';

const VALID_SAMPLE = `fecha|routeCode|trackingNumber|clienteNit|direccion|destinatarioNombre|destinatarioTelefono|productoCodigo|productoDescripcion|productoCantidad|productoPrecio
2026-07-10|R-020|FARMA-00300|900123456|Cra 45 #103-22, Bogotá|Diana Torres|3011234567|MED-1042|Amoxicilina 500mg x21|3|15400
2026-07-10|R-020|FARMA-00300|900123456|Cra 45 #103-22, Bogotá|Diana Torres|3011234567|MED-1050|Losartán 50mg x30|1|9800
2026-07-10|R-020|FARMA-00301||Cll 80 #12-40, Bogotá|Julián Peña|3022345678|MED-4410|Metformina 850mg x30|2|8600`;

interface TxtImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TxtImportDialog({ open, onOpenChange }: TxtImportDialogProps) {
  const user = useAuthStore((s) => s.user);
  const needsCediSelector = user?.role !== 'CEDI';

  const [content, setContent] = useState('');
  const [distributionCenterId, setDistributionCenterId] = useState('');
  const queryClient = useQueryClient();

  const centersQuery = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
    enabled: open && needsCediSelector,
  });

  const mutation = useMutation({
    mutationFn: (txt: string) => apiClient.importTxtPlanilla(txt, needsCediSelector ? distributionCenterId : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['cdi'] });
    },
  });

  const handleClose = (next: boolean) => {
    if (!next) {
      setContent('');
      setDistributionCenterId('');
      mutation.reset();
    }
    onOpenChange(next);
  };

  const canSubmit = content.trim().length > 0 && (!needsCediSelector || distributionCenterId.length > 0);

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-display text-lg font-bold uppercase tracking-wide text-navy">
            Importar planilla (TXT)
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">
            Pega el contenido de la planilla plana. El formato de columnas lo define iProcess — cada línea es un producto,
            agrupado por número de guía. La planilla llega en estado "Creado" y queda pendiente de verificación por la
            droguería de origen desde su app móvil.
          </Dialog.Description>

          {mutation.isSuccess ? (
            <div className="mt-5 rounded-lg border-l-4 border-dispensed bg-dispensed/5 px-4 py-3.5">
              <p className="font-display text-sm font-semibold uppercase tracking-wide text-dispensed">Planilla cargada</p>
              <p className="mt-1 text-sm text-navy/80">
                Ruta <span className="font-mono font-semibold">{mutation.data.routeCode}</span> creada con{' '}
                <strong>{mutation.data.deliveriesCount}</strong> entregas. Queda pendiente de verificación en la droguería.
              </p>
              <Button size="md" className="mt-3" onClick={() => handleClose(false)}>
                Listo
              </Button>
            </div>
          ) : (
            <>
              {needsCediSelector && (
                <div className="mt-4">
                  <label htmlFor="import-cedi" className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-navy">
                    Droguería de origen
                  </label>
                  <select
                    id="import-cedi"
                    value={distributionCenterId}
                    onChange={(e) => setDistributionCenterId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-navy"
                  >
                    <option value="">Selecciona la droguería que recibe esta planilla…</option>
                    {centersQuery.data?.map((cedi) => (
                      <option key={cedi.id} value={cedi.id}>
                        {cedi.name}
                      </option>
                    ))}
                  </select>
                  {!distributionCenterId && (
                    <p className="mt-1 text-xs font-medium text-controlled">Selecciona una droguería para poder importar.</p>
                  )}
                </div>
              )}

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                placeholder="fecha|routeCode|trackingNumber|clienteNit|direccion|..."
                className="mt-4 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-xs text-navy"
              />

              <div className="mt-2 flex gap-4 text-xs">
                <button type="button" className="font-semibold text-cold hover:underline" onClick={() => setContent(VALID_SAMPLE)}>
                  Usar plantilla de formato
                </button>
              </div>

              {mutation.isError && (
                <div className="mt-4">
                  <ErrorBanner
                    title="La planilla no se pudo cargar"
                    message={mutation.error instanceof ApiError ? mutation.error.message : 'Ocurrió un error inesperado.'}
                  />
                </div>
              )}

              <div className="mt-5 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => handleClose(false)}>
                  Cancelar
                </Button>
                <Button isLoading={mutation.isPending} disabled={!canSubmit} onClick={() => mutation.mutate(content)}>
                  Importar planilla
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
