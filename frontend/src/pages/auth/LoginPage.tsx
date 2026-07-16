import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '#src/api/client';
import { ApiError } from '#src/api/types';
import { useAuthStore } from '#src/store/authStore';
import { TextField } from '#src/components/ui/TextField';
import { Button } from '#src/components/ui/Button';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { loginSchema, type LoginFormValues } from '#src/pages/auth/loginSchema';
import { roleHome } from '#src/routes/roleHome';
import { ForgotPasswordDialog } from '#src/pages/auth/ForgotPasswordDialog';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const [forgotOpen, setForgotOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: ({ email, password }: LoginFormValues) => apiClient.login(email, password),
    onSuccess: (result) => {
      login(result.token, result.user);
      const from = (location.state as { from?: Location })?.from?.pathname;
      navigate(from ?? roleHome(result.user.role), { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="seal mb-4 h-11 w-11 bg-cold" aria-hidden="true" />
          <p className="font-display text-2xl font-bold tracking-tight text-white">
            Farma<span className="text-cold">Track</span>
          </p>
          <p className="mt-1 text-sm text-white/50">Ingresa con tu cuenta corporativa</p>
        </div>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6"
          noValidate
        >
          {mutation.isError && (
            <ErrorBanner
              title="No pudimos iniciar sesión"
              message={mutation.error instanceof ApiError ? mutation.error.message : 'Intenta nuevamente en unos segundos.'}
            />
          )}

          <div className="[&_label]:text-white/70">
            <TextField
              label="Correo corporativo"
              type="email"
              placeholder="maria.rodriguez@farmatrack.co"
              error={errors.email?.message}
              className="bg-navy text-white placeholder:text-white/30"
              {...register('email')}
            />
          </div>
          <div className="[&_label]:text-white/70">
            <TextField
              label="Contraseña"
              type="password"
              placeholder="••••••••••"
              error={errors.password?.message}
              className="bg-navy text-white placeholder:text-white/30"
              {...register('password')}
            />
          </div>

          <Button type="submit" size="lg" isLoading={mutation.isPending} className="w-full">
            Ingresar al sistema
          </Button>

          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="block w-full text-center text-xs font-semibold text-cold hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>

        <Link to="/" className="mt-6 block text-center text-xs text-white/40 hover:text-white/70">
          ← Volver
        </Link>
      </div>

      <ForgotPasswordDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </div>
  );
}
