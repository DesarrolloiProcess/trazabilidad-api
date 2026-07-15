import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { useAuthStore } from '#src/store/authStore';
import { TextField } from '#src/components/ui/TextField';
import { Button } from '#src/components/ui/Button';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { ApiError } from '#src/api/types';

export function MiPerfilPage() {
  const user = useAuthStore((s) => s.user);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mutation = useMutation({
    mutationFn: () => apiClient.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
  });

  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit = currentPassword.length > 0 && newPassword.length >= 6 && !mismatch;

  return (
    <PanelLayout>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Mi perfil</h1>
        <p className="mt-1 text-sm text-slate-500">Datos de tu cuenta y seguridad</p>
      </div>

      <div className="p-8">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-5">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-navy">{user?.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">{user?.email}</p>
        </div>

        <div className="mt-6 max-w-md rounded-xl border border-slate-200 bg-white p-5">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-navy">Cambiar contraseña</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              mutation.mutate();
            }}
            className="mt-4 space-y-4"
          >
            <TextField
              label="Contraseña actual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="Nueva contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              hint="Mínimo 6 caracteres."
            />
            <TextField
              label="Confirmar nueva contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={mismatch ? 'Las contraseñas no coinciden.' : undefined}
            />

            {mutation.isSuccess && (
              <p className="rounded-lg border-l-4 border-dispensed bg-dispensed/5 px-4 py-3 text-sm font-medium text-dispensed">
                Contraseña actualizada correctamente.
              </p>
            )}

            {mutation.isError && (
              <ErrorBanner message={mutation.error instanceof ApiError ? mutation.error.message : 'No pudimos actualizar la contraseña.'} />
            )}

            <Button type="submit" isLoading={mutation.isPending} disabled={!canSubmit} className="w-full">
              Guardar nueva contraseña
            </Button>
          </form>
        </div>
      </div>
    </PanelLayout>
  );
}
