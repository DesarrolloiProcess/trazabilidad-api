import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Vite empaqueta los assets de Leaflet con hashes en el nombre, lo que rompe la
// resolución de íconos por defecto de la librería — hay que apuntarlos a mano.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LatLng {
  lat: number;
  lng: number;
}

interface DeliveryMapProps {
  /** Punto de destino conocido desde la importación de la planilla. */
  destination: LatLng;
  destinationLabel?: string;
  /** Geolocalización capturada por el conductor al confirmar la entrega, si ya ocurrió. */
  evidence?: LatLng;
  evidenceLabel?: string;
  className?: string;
}

function isValidCoord(point: LatLng | undefined): point is LatLng {
  return (
    point !== undefined &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lng) <= 180 &&
    !(point.lat === 0 && point.lng === 0)
  );
}

export function DeliveryMap({
  destination,
  destinationLabel = 'Destino de la entrega',
  evidence,
  evidenceLabel = 'Ubicación capturada al confirmar',
  className,
}: DeliveryMapProps) {
  const validDestination = isValidCoord(destination) ? destination : undefined;
  const validEvidence = isValidCoord(evidence) ? evidence : undefined;
  const center = validEvidence ?? validDestination;

  if (!center) {
    return (
      <div className={className ?? 'flex h-64 w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50'}>
        <p className="text-xs text-slate-400">Sin coordenadas válidas para esta entrega.</p>
      </div>
    );
  }

  return (
    <div className={className ?? 'h-64 w-full overflow-hidden rounded-lg border border-slate-200'}>
      <MapContainer
        key={`${center.lat}-${center.lng}`}
        center={[center.lat, center.lng]}
        zoom={15}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {validDestination && (
          <Marker position={[validDestination.lat, validDestination.lng]}>
            <Popup>{destinationLabel}</Popup>
          </Marker>
        )}
        {validEvidence && (
          <Marker position={[validEvidence.lat, validEvidence.lng]}>
            <Popup>{evidenceLabel}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
