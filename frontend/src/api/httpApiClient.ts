import type { ApiClient, ListDeliveriesParams, ListRoutesParams } from '#src/api/apiClient.types';
import { ApiError } from '#src/api/types';
import { getToken } from '#src/api/session';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(body?.message ?? 'Error inesperado del servidor', body?.code ?? 'UNKNOWN', response.status);
  }

  return body as T;
}

function toQuery(params: object): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/**
 * Implementación real, contra el backend Express/Drizzle. Hoy no está en uso
 * (ver src/api/client.ts) porque la base de datos aún no está conectada;
 * queda lista para el día en que solo haya que cambiar esa selección.
 */
export const httpApiClient: ApiClient = {
  login: (email, password) => request('/api/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  importTxtPlanilla: (content) =>
    request('/api/txt-import', { method: 'POST', body: JSON.stringify({ content }) }),

  listRoutes: (params: ListRoutesParams) => request(`/api/routes${toQuery(params)}`),
  getRouteById: (id) => request(`/api/routes/${id}`),
  assignDriver: (routeId, driverId) =>
    request(`/api/routes/${routeId}/assign-driver`, { method: 'PATCH', body: JSON.stringify({ driverId }) }),
  updateRouteStatus: (routeId, status) =>
    request(`/api/routes/${routeId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  listDeliveries: (params: ListDeliveriesParams) => request(`/api/deliveries${toQuery(params)}`),
  getDeliveryById: (id) => request(`/api/deliveries/${id}`),
  advanceDeliveryStatus: (id, status) =>
    request(`/api/deliveries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  submitDeliveryEvidence: (id, data) =>
    request(`/api/deliveries/${id}/evidence`, { method: 'POST', body: JSON.stringify(data) }),
  markNotDelivered: (id, observation) =>
    request(`/api/deliveries/${id}/not-delivered`, { method: 'POST', body: JSON.stringify({ observation }) }),

  listDistributionCenters: async () => {
    const paged = await request<{ data: Awaited<ReturnType<ApiClient['listDistributionCenters']>> }>(
      `/api/distribution-centers${toQuery({ page: 1, limit: 100 })}`,
    );
    return paged.data;
  },
  listDrivers: async () => {
    const paged = await request<{ data: Awaited<ReturnType<ApiClient['listDrivers']>> }>(
      `/api/users${toQuery({ page: 1, limit: 100 })}`,
    );
    return paged.data;
  },

  trackDelivery: (trackingNumber, verificationValue) =>
    request(`/portal/deliveries/${trackingNumber}${toQuery({ verificationValue })}`),
  listMyDeliveries: (trackingNumber, verificationValue) =>
    request(`/portal/my-deliveries/${trackingNumber}${toQuery({ verificationValue })}`),
};
