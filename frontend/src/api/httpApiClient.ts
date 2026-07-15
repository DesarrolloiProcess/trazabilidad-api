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
 * Implementación real, hoy contra el demo-server (Express + memoria, ver /demo-server)
 * desplegado para que el mock se comparta entre dispositivos. El día que la base de
 * datos MySQL del backend hexagonal esté conectada, solo cambia VITE_API_BASE_URL —
 * los contratos ya son los mismos que expone ese backend real.
 */
export const httpApiClient: ApiClient = {
  login: (email, password) => request('/api/users/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  changePassword: (currentPassword, newPassword) =>
    request('/api/users/change-password', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  requestPasswordResetOtp: (email) =>
    request('/api/users/request-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPasswordWithOtp: (email, otpCode, newPassword) =>
    request('/api/users/reset-password', { method: 'POST', body: JSON.stringify({ email, otpCode, newPassword }) }),

  importTxtPlanilla: (content, distributionCenterId) =>
    request('/api/txt-import', { method: 'POST', body: JSON.stringify({ content, distributionCenterId }) }),

  listRoutes: (params: ListRoutesParams) => request(`/api/routes${toQuery(params)}`),
  getRouteById: (id) => request(`/api/routes/${id}`),
  assignDriver: (routeId, driverId) =>
    request(`/api/routes/${routeId}/assign-driver`, { method: 'PATCH', body: JSON.stringify({ driverId }) }),
  updateRouteStatus: (routeId, status) =>
    request(`/api/routes/${routeId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  listPendingVerification: (distributionCenterId) =>
    request(`/api/cdi/pending-verification${toQuery({ distributionCenterId })}`),
  verifyRoute: (routeId) => request(`/api/cdi/routes/${routeId}/verify`, { method: 'POST' }),

  listDeliveries: (params: ListDeliveriesParams) => request(`/api/deliveries${toQuery(params)}`),
  getDeliveryById: (id) => request(`/api/deliveries/${id}`),
  advanceDeliveryStatus: (id, status) =>
    request(`/api/deliveries/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  submitDeliveryEvidence: (id, data) =>
    request(`/api/deliveries/${id}/evidence`, { method: 'POST', body: JSON.stringify(data) }),
  markNotDelivered: (id, observation) =>
    request(`/api/deliveries/${id}/not-delivered`, { method: 'POST', body: JSON.stringify({ observation }) }),
  exportInvoice: (id) => request(`/api/deliveries/${id}/export-invoice`, { method: 'POST' }),

  listDistributionCenters: async () => {
    const paged = await request<{ data: Awaited<ReturnType<ApiClient['listDistributionCenters']>> }>(
      `/api/distribution-centers${toQuery({ page: 1, limit: 100 })}`,
    );
    return paged.data;
  },
  createDistributionCenter: (input) =>
    request('/api/distribution-centers', { method: 'POST', body: JSON.stringify(input) }),
  updateDistributionCenter: (id, input) =>
    request(`/api/distribution-centers/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  listDrivers: async () => {
    const paged = await request<{ data: Awaited<ReturnType<ApiClient['listDrivers']>> }>(
      `/api/users${toQuery({ page: 1, limit: 100, role: 'CONDUCTOR' })}`,
    );
    return paged.data;
  },
  listUsers: async () => {
    const paged = await request<{ data: Awaited<ReturnType<ApiClient['listUsers']>> }>(
      `/api/users${toQuery({ page: 1, limit: 100 })}`,
    );
    return paged.data;
  },
  createUser: (input) => request('/api/users', { method: 'POST', body: JSON.stringify(input) }),
  updateUser: (id, input) => request(`/api/users/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),

  trackDelivery: (trackingNumber, verificationValue) =>
    request(`/portal/deliveries/${trackingNumber}${toQuery({ verificationValue })}`),
  listMyDeliveries: (trackingNumber, verificationValue) =>
    request(`/portal/my-deliveries/${trackingNumber}${toQuery({ verificationValue })}`),
};
