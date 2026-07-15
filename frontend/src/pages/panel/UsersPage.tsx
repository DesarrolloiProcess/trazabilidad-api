import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { Button } from '#src/components/ui/Button';
import { TextField } from '#src/components/ui/TextField';
import { ApiError, type Role, type UserDto } from '#src/api/types';

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Administrador',
  CEDI: 'CEDI',
  CONDUCTOR: 'Conductor',
};

export function UsersPage() {
  const [dialogUser, setDialogUser] = useState<UserDto | 'new' | null>(null);
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.listUsers(),
  });

  const centersQuery = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => apiClient.updateUser(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const centersById = new Map((centersQuery.data ?? []).map((c) => [c.id, c.name]));

  return (
    <PanelLayout>
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Usuarios</h1>
          <p className="mt-1 text-sm text-slate-500">Cuentas de acceso a FarmaTrack (Portal Web, App Conductor, CEDI)</p>
        </div>
        <Button onClick={() => setDialogUser('new')}>Nuevo usuario</Button>
      </div>

      <div className="p-8">
        {usersQuery.isError && (
          <ErrorBanner message={usersQuery.error instanceof ApiError ? usersQuery.error.message : 'No pudimos cargar los usuarios.'} />
        )}

        {usersQuery.isLoading ? (
          <SealLoader label="Cargando usuarios…" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-arena/40 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Correo</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">CEDI</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersQuery.data?.map((u) => (
                  <tr key={u.id} className={u.active ? '' : 'opacity-50'}>
                    <td className="px-4 py-3 font-medium text-navy">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">{ROLE_LABEL[u.role]}</td>
                    <td className="px-4 py-3 text-slate-500">{u.distributionCenterId ? centersById.get(u.distributionCenterId) ?? '—' : '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
                          u.active ? 'text-dispensed' : 'text-slate-400'
                        }`}
                      >
                        <span className={`seal h-2 w-2 ${u.active ? 'bg-dispensed' : 'bg-slate-300'}`} aria-hidden="true" />
                        {u.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="md" onClick={() => setDialogUser(u)}>
                          Editar
                        </Button>
                        <Button
                          variant={u.active ? 'danger' : 'secondary'}
                          size="md"
                          isLoading={toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === u.id}
                          onClick={() => toggleActiveMutation.mutate({ id: u.id, active: !u.active })}
                        >
                          {u.active ? 'Desactivar' : 'Reactivar'}
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

      {dialogUser && (
        <UserFormDialog
          user={dialogUser === 'new' ? null : dialogUser}
          open={Boolean(dialogUser)}
          onOpenChange={(next) => !next && setDialogUser(null)}
        />
      )}
    </PanelLayout>
  );
}

interface UserFormDialogProps {
  user: UserDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserFormDialog({ user, open, onOpenChange }: UserFormDialogProps) {
  const isEdit = Boolean(user);
  const [email, setEmail] = useState(user?.email ?? '');
  const [name, setName] = useState(user?.name ?? '');
  const [role, setRole] = useState<Role>(user?.role ?? 'CEDI');
  const [distributionCenterId, setDistributionCenterId] = useState(user?.distributionCenterId ?? '');
  const queryClient = useQueryClient();

  const centersQuery = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
    enabled: open,
  });

  const requiresCenter = role === 'CEDI' || role === 'CONDUCTOR';

  const createMutation = useMutation({
    mutationFn: () =>
      apiClient.createUser({
        email: email.trim(),
        name: name.trim(),
        role,
        distributionCenterId: requiresCenter ? distributionCenterId : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      apiClient.updateUser(user!.id, {
        name: name.trim(),
        role,
        distributionCenterId: requiresCenter ? distributionCenterId : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      onOpenChange(false);
    },
  });

  const mutation = isEdit ? updateMutation : createMutation;

  const canSubmit =
    name.trim().length > 0 && (isEdit || email.trim().length > 0) && (!requiresCenter || distributionCenterId.length > 0);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-navy-dark/60 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-display text-lg font-bold uppercase tracking-wide text-navy">
            {isEdit ? 'Editar usuario' : 'Nuevo usuario'}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-slate-500">
            {isEdit ? 'Actualiza los datos de la cuenta.' : 'Crea una cuenta de acceso a FarmaTrack.'}
          </Dialog.Description>

          <div className="mt-4 space-y-4">
            <TextField
              label="Correo"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEdit}
              placeholder="nombre@iprocess.co"
            />
            <TextField label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} />

            <div>
              <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-navy">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-navy"
              >
                <option value="ADMIN">Administrador</option>
                <option value="CEDI">CEDI</option>
                <option value="CONDUCTOR">Conductor</option>
              </select>
            </div>

            {requiresCenter && (
              <div>
                <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-navy">CEDI</label>
                <select
                  value={distributionCenterId}
                  onChange={(e) => setDistributionCenterId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-navy"
                >
                  <option value="">Selecciona un CEDI…</option>
                  {centersQuery.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
              {isEdit ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
