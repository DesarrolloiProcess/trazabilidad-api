import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { PanelLayout } from '#src/layouts/PanelLayout';
import { apiClient } from '#src/api/client';
import { useAuthStore } from '#src/store/authStore';
import { SealLoader } from '#src/components/ui/SealLoader';
import { ErrorBanner } from '#src/components/ui/ErrorBanner';
import { EmptyState } from '#src/components/ui/EmptyState';
import { DELIVERY_STATUS_LABEL, DELIVERY_STATUS_TONE, TONE_HEX } from '#src/components/status/statusConfig';
import { ApiError } from '#src/api/types';
import { LIVE_POLL_INTERVAL } from '#src/api/pollInterval';

const BOGOTA_CENTER: [number, number] = [4.65, -74.08];

export function MapaRutasPage() {
  const user = useAuthStore((s) => s.user);
  const isConductor = user?.role === 'CONDUCTOR';

  // El conductor solo puede ver entregas de una ruta suya — el backend lo exige.
  const routesQuery = useQuery({
    queryKey: ['routes', 'driver', user?.id],
    queryFn: () => apiClient.listRoutes({ driverId: user!.id, page: 1, limit: 5 }),
    enabled: isConductor,
  });
  const ownRouteId = routesQuery.data?.data[0]?.id;

  const query = useQuery({
    queryKey: ['deliveries', 'mapa', isConductor ? ownRouteId : 'all'],
    queryFn: () => apiClient.listDeliveries({ page: 1, limit: 300, routeId: isConductor ? ownRouteId : undefined }),
    enabled: !isConductor || Boolean(ownRouteId),
    refetchInterval: LIVE_POLL_INTERVAL,
  });

  const points = (query.data?.data ?? []).filter(
    (d) => d.destinationLatitude !== null && d.destinationLongitude !== null,
  );

  const noOwnRoute = isConductor && !routesQuery.isLoading && !ownRouteId;

  return (
    <PanelLayout>
      <div className="border-b border-slate-200 bg-white px-8 py-6">
        <h1 className="font-display text-2xl font-bold tracking-tight text-navy">Mapa de rutas</h1>
        <p className="mt-1 text-sm text-slate-500">
          {isConductor
            ? 'Ubicación de los puntos de entrega de tu ruta de hoy (solo lectura)'
            : 'Distribución geográfica de las entregas del día, coloreadas por estado'}
        </p>
      </div>

      <div className="p-8">
        {query.isError && (
          <ErrorBanner message={query.error instanceof ApiError ? query.error.message : 'No pudimos cargar el mapa.'} />
        )}

        {noOwnRoute ? (
          <EmptyState title="Sin ruta asignada" description="Todavía no tienes una ruta activa para hoy." />
        ) : query.isLoading || routesQuery.isLoading ? (
          <SealLoader label="Cargando mapa…" />
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200" style={{ height: '620px' }}>
            <MapContainer center={BOGOTA_CENTER} zoom={11} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {points.map((delivery) => (
                <CircleMarker
                  key={delivery.id}
                  center={[delivery.destinationLatitude!, delivery.destinationLongitude!]}
                  radius={9}
                  pathOptions={{
                    color: '#FAFAF8',
                    weight: 2,
                    fillColor: TONE_HEX[DELIVERY_STATUS_TONE[delivery.status]],
                    fillOpacity: 0.95,
                  }}
                >
                  <Popup>
                    <div className="font-mono text-xs">
                      <p className="font-semibold">{delivery.trackingNumber}</p>
                      <p>{delivery.recipientName}</p>
                      <p className="text-slate-500">{delivery.address}</p>
                      <p className="mt-1 font-semibold">{DELIVERY_STATUS_LABEL[delivery.status]}</p>
                      {!isConductor && (
                        <Link to={`/panel/entregas/${delivery.id}`} className="text-cold underline">
                          Ver detalle →
                        </Link>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
          {(['neutral', 'cold', 'thermal', 'dispensed', 'controlled'] as const).map((tone) => (
            <span key={tone} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TONE_HEX[tone] }} />
              {tone === 'neutral' && 'Creado'}
              {tone === 'cold' && 'Alistado / Entregada a transportador'}
              {tone === 'thermal' && 'En tránsito / En curso'}
              {tone === 'dispensed' && 'Entregado'}
              {tone === 'controlled' && 'No entregado'}
            </span>
          ))}
        </div>
      </div>
    </PanelLayout>
  );
}
