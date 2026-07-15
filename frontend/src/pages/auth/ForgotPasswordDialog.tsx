import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '#src/api/client';
import { ApiError } from '#src/api/types';
import { TextField } from '#src/components/ui/TextField';
import { Button } from '#src/components/ui/Button';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'email' | 'reset' | 'done';

export function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [issuedOtp, setIssuedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const requestMutation = useMutation({
    mutationFn: () => apiClient.requestPasswordResetOtp(email.trim()),
    onSuccess: (result) => {
      setIssuedOtp(result.otpCode);
      setStep('reset');
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => apiClient.resetPasswordWithOtp(email.trim(), otpCode.trim(), newPassword),
    onSuccess: () => setStep('done'),
  });

  const handleClose = (next: boolean) => {
    if (!next) {
      setStep('email');
      setEmail('');
      setOtpCode('');
      setIssuedOtp('');
      setNewPassword('');
      requestMutation.reset();
      resetMutation.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-navy-dark/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <Dialog.Title className="font-display text-lg font-bold uppercase tracking-wide text-navy">
            Recuperar contraseña
          </Dialog.Title>

          {step === 'email' && (
            <>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Ingresa tu correo corporativo y te enviaremos un código de verificación.
              </Dialog.Description>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  requestMutation.mutate();
                }}
                className="mt-4 space-y-4"
              >
                <TextField
                  label="Correo"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@iprocess.co"
                />

                {requestMutation.isError && (
                  <ErrorBanner
                    message={requestMutation.error instanceof ApiError ? requestMutation.error.message : 'No pudimos generar el código.'}
                  />
                )}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" isLoading={requestMutation.isPending} disabled={email.trim().length === 0}>
                    Enviar código
                  </Button>
                </div>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <Dialog.Description className="mt-1 text-sm text-slate-500">
                Como este es un ambiente de demostración (sin proveedor real de SMS/correo), mostramos el código directamente
                aquí.
              </Dialog.Description>

              <div className="mt-3 rounded-lg border-l-4 border-cold bg-cold/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-cold">Tu código de verificación</p>
                <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-navy">{issuedOtp}</p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  resetMutation.mutate();
                }}
                className="mt-4 space-y-4"
              >
                <TextField label="Código de verificación" mono value={otpCode} onChange={(e) => setOtpCode(e.target.value)} />
                <TextField
                  label="Nueva contraseña"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  hint="Mínimo 6 caracteres."
                />

                {resetMutation.isError && (
                  <ErrorBanner
                    message={resetMutation.error instanceof ApiError ? resetMutation.error.message : 'No pudimos actualizar la contraseña.'}
                  />
                )}

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" isLoading={resetMutation.isPending} disabled={otpCode.trim().length === 0 || newPassword.length < 6}>
                    Restablecer contraseña
                  </Button>
                </div>
              </form>
            </>
          )}

          {step === 'done' && (
            <>
              <div className="mt-4 rounded-lg border-l-4 border-dispensed bg-dispensed/5 px-4 py-3.5">
                <p className="font-display text-sm font-semibold uppercase tracking-wide text-dispensed">Contraseña actualizada</p>
                <p className="mt-1 text-sm text-navy/80">Ya puedes iniciar sesión con tu nueva contraseña.</p>
              </div>
              <Button className="mt-4 w-full" onClick={() => handleClose(false)}>
                Listo
              </Button>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
