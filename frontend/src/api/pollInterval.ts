/**
 * Intervalo de refetch para pantallas que deben sentirse "en vivo" (ej. un cambio
 * hecho desde el móvil debe reflejarse en el Portal Web abierto en otro dispositivo).
 * Sin websockets: TanStack Query simplemente revalida cada pocos segundos.
 */
export const LIVE_POLL_INTERVAL = 4000;
