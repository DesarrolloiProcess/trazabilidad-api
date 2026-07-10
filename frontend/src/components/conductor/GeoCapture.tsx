import { useState } from 'react';
import { Button } from '#src/components/ui/Button';

interface GeoCaptureProps {
  onCapture: (coords: { latitude: number; longitude: number }) => void;
}

export function GeoCapture({ onCapture }: GeoCaptureProps) {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const capture = () => {
    if (!navigator.geolocation) {
      setError('Este dispositivo no soporta geolocalización.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        setCoords(next);
        onCapture(next);
        setLoading(false);
      },
      () => {
        setError('No pudimos acceder a tu ubicación. Revisa los permisos del navegador.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  if (coords) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-dispensed/10 px-3 py-1.5 font-mono text-xs font-semibold text-dispensed">
        <span className="seal h-2 w-2 bg-dispensed" aria-hidden="true" />
        {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
      </span>
    );
  }

  return (
    <div>
      <Button type="button" variant="secondary" onClick={capture} isLoading={loading}>
        Capturar ubicación
      </Button>
      {error && <p className="mt-1.5 text-xs font-medium text-controlled">{error}</p>}
    </div>
  );
}
