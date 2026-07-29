import { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { EmptyState } from '#src/components/ui/EmptyState';
import { Button } from '#src/components/ui/Button';
import { TextField } from '#src/components/ui/TextField';
import { ApiError, type PatientDto } from '#src/api/types';

export function PatientsPage() {
  const [dialogPatient, setDialogPatient] = useState<PatientDto | 'new' | null>(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const patientsQuery = useQuery({
    queryKey: ['patients'],
    queryFn: () => apiClient.listPatients(),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => apiClient.updatePatient(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['patients'] }),
  });

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patientsQuery.data ?? [];
    return (patientsQuery.data ?? []).filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.phone ?? '').includes(term) ||
        (p.email ?? '').toLowerCase().includes(term) ||
        (p.documentNumber ?? '').includes(term),
    );
  }, [patientsQuery.data, search]);

  return (
    <PanelLayout>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Pacientes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Datos de contacto de los pacientes — se crean automáticamente al importar una planilla, y pueden editarse aquí.
          </p>
        </div>
        <Button onClick={() => setDialogPatient('new')}>Nuevo paciente</Button>
      </div>

      <div className="p-8">
        {patientsQuery.isError && (
          <ErrorBanner message={patientsQuery.error instanceof ApiError ? patientsQuery.error.message : 'No pudimos cargar los pacientes.'} />
        )}

        <div className="mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono, correo o documento…"
            className="w-full max-w-md rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm"
          />
        </div>

        {patientsQuery.isLoading ? (
          <SealLoader label="Cargando pacientes…" />
        ) : filteredPatients.length === 0 ? (
          <EmptyState title="Sin resultados" description="No hay pacientes que coincidan con la búsqueda." />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-arena/40 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Documento</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className={p.active ? '' : 'opacity-50'}>
                    <td className="px-4 py-3 font-medium text-navy">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.phone ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.email ?? '—'}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.documentNumber ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
                          p.active ? 'text-dispensed' : 'text-slate-400'
                        }`}
                      >
                        <span className={`seal h-2 w-2 ${p.active ? 'bg-dispensed' : 'bg-slate-300'}`} aria-hidden="true" />
                        {p.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="md" onClick={() => setDialogPatient(p)}>
                          Editar
                        </Button>
                        <Button
                          variant={p.active ? 'danger' : 'secondary'}
                          size="md"
                          isLoading={toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === p.id}
                          onClick={() => toggleActiveMutation.mutate({ id: p.id, active: !p.active })}
                        >
                          {p.active ? 'Desactivar' : 'Reactivar'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {dialogPatient && (
        <PatientFormDialog
          patient={dialogPatient === 'new' ? null : dialogPatient}
          open={Boolean(dialogPatient)}
          onOpenChange={(next) => !next && setDialogPatient(null)}
        />
      )}
    </PanelLayout>
  );
}

interface PatientFormDialogProps {
  patient: PatientDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function PatientFormDialog({ patient, open, onOpenChange }: PatientFormDialogProps) {
  const isEdit = Boolean(patient);
  const [name, setName] = useState(patient?.name ?? '');
  const [phone, setPhone] = useState(patient?.phone ?? '');
  const [email, setEmail] = useState(patient?.email ?? '');
  const [documentNumber, setDocumentNumber] = useState(patient?.documentNumber ?? '');
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.createPatient({
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        documentNumber: documentNumber.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      apiClient.updatePatient(patient!.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        documentNumber: documentNumber.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      onOpenChange(false);
    },
  });

  const mutation = isEdit ? updateMutation : createMutation;
  const canSubmit = name.trim().length > 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-display text-lg font-bold uppercase tracking-wide text-navy">
            {isEdit ? 'Editar paciente' : 'Nuevo paciente'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">
            {isEdit
              ? 'Si cambias el teléfono, se actualiza también en todas sus guías ya registradas.'
              : 'Registra un paciente para el Portal Cliente.'}
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <TextField label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="3011234567" />
            <TextField label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="paciente@correo.co" />
            <TextField label="Documento" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} placeholder="1098765432" />
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
              {isEdit ? 'Guardar cambios' : 'Crear paciente'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
