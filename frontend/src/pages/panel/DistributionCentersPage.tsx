import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { Button } from '#src/components/ui/Button';
import { TextField } from '#src/components/ui/TextField';
import { ApiError, type DistributionCenterDto } from '#src/api/types';

export function DistributionCentersPage() {
  const [dialogCedi, setDialogCedi] = useState<DistributionCenterDto | 'new' | null>(null);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => apiClient.updateDistributionCenter(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['distribution-centers'] }),
  });

  return (
    <PanelLayout>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Centros de distribución</h1>
          <p className="mt-1 text-sm text-slate-500">Cobertura nacional de FarmaTrack</p>
        </div>
        <Button onClick={() => setDialogCedi('new')}>Nuevo CEDI</Button>
      </div>

      <div className="p-8">
        {query.isError && (
          <ErrorBanner message={query.error instanceof ApiError ? query.error.message : 'No pudimos cargar los CEDIs.'} />
        )}

        {query.isLoading ? (
          <SealLoader label="Cargando CEDIs…" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {query.data?.map((cedi) => (
              <div key={cedi.id} className={`rounded-xl border border-slate-200 bg-white p-5 ${cedi.active ? '' : 'opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <p className="font-display text-base font-bold text-navy">{cedi.name}</p>
                  <span
                    className={`seal h-2.5 w-2.5 ${cedi.active ? 'bg-dispensed' : 'bg-slate-300'}`}
                    aria-hidden="true"
                    title={cedi.active ? 'Activo' : 'Inactivo'}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-500">{cedi.address}</p>
                <p className="mt-0.5 text-xs uppercase tracking-wide text-slate-400">{cedi.city}</p>

                <div className="mt-4 flex gap-2">
                  <Button variant="ghost" size="md" className="flex-1" onClick={() => setDialogCedi(cedi)}>
                    Editar
                  </Button>
                  <Button
                    variant={cedi.active ? 'danger' : 'secondary'}
                    size="md"
                    className="flex-1"
                    isLoading={toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === cedi.id}
                    onClick={() => toggleActiveMutation.mutate({ id: cedi.id, active: !cedi.active })}
                  >
                    {cedi.active ? 'Desactivar' : 'Reactivar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {dialogCedi && (
        <CediFormDialog
          cedi={dialogCedi === 'new' ? null : dialogCedi}
          open={Boolean(dialogCedi)}
          onOpenChange={(next) => !next && setDialogCedi(null)}
        />
      )}
    </PanelLayout>
  );
}

interface CediFormDialogProps {
  cedi: DistributionCenterDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CediFormDialog({ cedi, open, onOpenChange }: CediFormDialogProps) {
  const isEdit = Boolean(cedi);
  const [name, setName] = useState(cedi?.name ?? '');
  const [city, setCity] = useState(cedi?.city ?? '');
  const [address, setAddress] = useState(cedi?.address ?? '');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () => apiClient.createDistributionCenter({ name: name.trim(), city: city.trim(), address: address.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-centers'] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      apiClient.updateDistributionCenter(cedi!.id, { name: name.trim(), city: city.trim(), address: address.trim() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['distribution-centers'] });
      onOpenChange(false);
    },
  });

  const mutation = isEdit ? updateMutation : createMutation;
  const canSubmit = name.trim().length > 0 && city.trim().length > 0 && address.trim().length > 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-display text-lg font-bold uppercase tracking-wide text-navy">
            {isEdit ? 'Editar CEDI' : 'Nuevo CEDI'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">
            {isEdit ? 'Actualiza los datos del centro de distribución.' : 'Registra un nuevo centro de distribución.'}
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} placeholder="CEDI Bogotá Norte" />
            <TextField label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bogotá" />
            <TextField label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Cra 45 #103-22" />
          </div>

          {mutation.isError && (
            <div className="mt-4">
              <ErrorBanner message={mutation.error instanceof ApiError ? mutation.error.message : 'Ocurrió un error inesperado.'} />
            </div>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button isLoading={mutation.isPending} disabled={!canSubmit} onClick={() => mutation.mutate()}>
              {isEdit ? 'Guardar cambios' : 'Crear CEDI'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
