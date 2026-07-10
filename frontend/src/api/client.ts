import type { ApiClient } from '#src/api/apiClient.types';
import { mockApiClient } from '#src/api/mock/mockApiClient';
import { httpApiClient } from '#src/api/httpApiClient';

/**
 * Único punto de conmutación entre el mock y el backend real. Hoy la base de
 * datos no está conectada, así que el mock es la implementación activa.
 * Para pasar a datos reales: VITE_API_MODE=real en el .env y nada más — ningún
 * componente de la app importa mockApiClient/httpApiClient directamente.
 */
const useReal = import.meta.env.VITE_API_MODE === 'real';

export const apiClient: ApiClient = useReal ? httpApiClient : mockApiClient;
