import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { Button } from '#src/components/ui/Button';
import { TextField } from '#src/components/ui/TextField';
import { ApiError } from '#src/api/types';

const ALERT_THRESHOLD_KEY = 'farmatrack:alertThresholdHours';
const DEFAULT_THRESHOLD_HOURS = 24;

export function ConfiguracionPage() {
  const [selectedCediId, setSelectedCediId] = useState('');
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [thresholdHours, setThresholdHours] = useState(() => {
    const stored = localStorage.getItem(ALERT_THRESHOLD_KEY);
    return stored ? Number(stored) : DEFAULT_THRESHOLD_HOURS;
  });
  const [thresholdSaved, setThresholdSaved] = useState(false);
  const queryClient = useQueryClient();

  const centersQuery = useQuery({
    queryKey: ['distribution-centers'],
    queryFn: () => apiClient.listDistributionCenters(),
  });

  useEffect(() => {
    if (!selectedCediId && centersQuery.data && centersQuery.data.length > 0) {
      setSelectedCediId(centersQuery.data[0].id);
    }
  }, [centersQuery.data, selectedCediId]);

  useEffect(() => {
    const cedi = centersQuery.data?.find((c) => c.id === selectedCediId);
    if (cedi) {
      setName(cedi.name);
      setCity(cedi.city);
      setAddress(cedi.address);
    }
  }, [selectedCediId, centersQuery.data]);

  const updateMutation = useMutation({
    mutationFn: () =>
      apiClient.updateDistributionCenter(selectedCediId, { name: name.trim(), city: city.trim(), address: address.trim() }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['distribution-centers'] }),
  });

  const handleSaveThreshold = () => {
    localStorage.setItem(ALERT_THRESHOLD_KEY, String(thresholdHours));
    setThresholdSaved(true);
    setTimeout(() => setThresholdSaved(false), 2000);
  };

  return (
    <PanelLayout>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">Datos de las droguerías y preferencias de la plataforma</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-5">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-navy">Editar droguería</p>

          {centersQuery.isError && <ErrorBanner message="No pudimos cargar las droguerías." />}

          {centersQuery.isLoading ? (
            <SealLoader label="Cargando droguerías…" />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-1.5 block font-display text-xs font-semibold uppercase tracking-wide text-navy">Droguería</label>
                <select
                  value={selectedCediId}
                  onChange={(e) => setSelectedCediId(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-navy"
                >
                  {centersQuery.data?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
              <TextField label="Ciudad" value={city} onChange={(e) => setCity(e.target.value)} />
              <TextField label="Dirección" value={address} onChange={(e) => setAddress(e.target.value)} />

              {updateMutation.isSuccess && (
                <p className="text-sm font-medium text-dispensed">Droguería actualizada correctamente.</p>
              )}
              {updateMutation.isError && (
                <ErrorBanner message={updateMutation.error instanceof ApiError ? updateMutation.error.message : 'No pudimos guardar los cambios.'} />
              )}

              <Button type="submit" isLoading={updateMutation.isPending} disabled={!selectedCediId} className="w-full">
                Guardar cambios
              </Button>
            </form>
          )}
        </div>

        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-5">
          <p className="font-display text-sm font-bold uppercase tracking-wide text-navy">Umbral de alertas</p>
          <p className="mt-1 text-sm text-slate-500">
            Horas máximas esperadas sin movimiento antes de considerar una entrega como demorada. Este valor se guarda en tu
            navegador y aún no está conectado a ninguna alerta automática.
          </p>

          <div className="mt-4 flex items-end gap-3">
            <TextField
              label="Horas"
              type="number"
              min={1}
              value={thresholdHours}
              onChange={(e) => setThresholdHours(Number(e.target.value))}
              className="w-28"
            />
            <Button onClick={handleSaveThreshold}>Guardar</Button>
          </div>

          {thresholdSaved && <p className="mt-2 text-sm font-medium text-dispensed">Umbral guardado.</p>}
        </div>
      </div>
    </PanelLayout>
  );
}
