import type { ApiClient } from '#src/api/apiClient.types';
import { mockApiClient } from '#src/api/mock/mockApiClient';
import { httpApiClient } from '#src/api/httpApiClient';

/**
 * Único punto de conmutación entre el mock y el backend real — ningún
 * componente de la app importa mockApiClient/httpApiClient directamente.
 * Se controla con VITE_API_MODE en el .env (real | mock).
 */
const useReal = import.meta.env.VITE_API_MODE === 'real';

export const apiClient: ApiClient = useReal ? httpApiClient : mockApiClient;
