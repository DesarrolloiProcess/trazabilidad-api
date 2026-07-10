const KEY = 'farmatrack-portal-session';

export interface PortalSession {
  trackingNumber: string;
  verificationValue: string;
}

export function getPortalSession(): PortalSession | null {
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalSession;
  } catch {
    return null;
  }
}

export function setPortalSession(session: PortalSession): void {
  sessionStorage.setItem(KEY, JSON.stringify(session));
}

export function clearPortalSession(): void {
  sessionStorage.removeItem(KEY);
}
