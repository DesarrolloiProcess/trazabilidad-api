import { useQuery } from '@tanstack/react-query';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { ApiError } from '#src/api/types';

export function DistributionCentersPage() {
  const query = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
  });

  return (
    <PanelLayout>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Centros de distribución</h1>
        <p className="mt-1 text-sm text-slate-500">Cobertura nacional de FarmaTrack</p>
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
              <div key={cedi.id} className="rounded-xl border border-slate-200 bg-white p-5">
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
              </div>
            ))}
          </div>
        )}
      </div>
    </PanelLayout>
  );
}
