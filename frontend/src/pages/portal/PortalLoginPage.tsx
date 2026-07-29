import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { PortalLayout } from '#src/layouts/PortalLayout';
import { apiClient } from '#src/api/client';
import { ApiError } from '#src/api/types';
import { TextField } from '#src/components/ui/TextField';
import { Button } from '#src/components/ui/Button';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { setPortalSession } from '#src/pages/portal/portalSession';
import { portalLoginSchema, type PortalLoginFormValues } from '#src/pages/portal/portalLoginSchema';

export function PortalLoginPage() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PortalLoginFormValues>({ resolver: zodResolver(portalLoginSchema) });

  const mutation = useMutation({
    mutationFn: ({ trackingNumber, verificationValue }: PortalLoginFormValues) =>
      apiClient.listMyDeliveries(trackingNumber, verificationValue),
    onSuccess: (_, variables) => {
      setPortalSession(variables);
      navigate('/portal/mis-entregas');
    },
  });

  return (
    <PortalLayout>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-center font-display text-lg font-bold text-navy">Consulta tu pedido</p>
        <p className="mt-1 text-center text-sm text-slate-500">Ingresa los datos de tu guía para ver el estado de tus entregas</p>

        <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-5 space-y-4" noValidate>
          {mutation.isError && (
            <ErrorBanner
              title={mutation.error instanceof ApiError && mutation.error.status === 404 ? 'Guía no encontrada' : 'No pudimos verificar tu pedido'}
              message={
                mutation.error instanceof ApiError
                  ? mutation.error.message
                  : 'Intenta nuevamente en unos segundos.'
              }
            />
          )}

          <TextField
            label="Número de guía"
            mono
            placeholder="FARMA-00231"
            error={errors.trackingNumber?.message}
            {...register('trackingNumber')}
          />
          <TextField
            label="Teléfono, documento o correo"
            mono
            placeholder="3011234567"
            hint="El mismo con el que registramos tu pedido"
            error={errors.verificationValue?.message}
            {...register('verificationValue')}
          />

          <Button type="submit" size="lg" isLoading={mutation.isPending} className="w-full">
            Consultar mis pedidos
          </Button>
        </form>
      </div>
    </PortalLayout>
  );
}
