import type { UserDto } from '#src/api/types';

/**
 * Fuente única de la sesión activa para la capa de API (mock e HTTP real).
 * El store de auth (Zustand) es quien la mantiene sincronizada, incluida la
 * rehidratación desde localStorage — así el mock nunca pierde sesión al
 * refrescar la página, y el cliente HTTP real sabrá qué token adjuntar.
 */
let currentToken: string | null = null;
let currentUser: UserDto | null = null;

export function setSession(token: string, user: UserDto): void {
  currentToken = token;
  currentUser = user;
}

export function clearSession(): void {
  currentToken = null;
  currentUser = null;
}

export function getToken(): string | null {
  return currentToken;
}

export function getCurrentUser(): UserDto | null {
  return currentUser;
}
