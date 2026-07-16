import type { DeliveryStatus, RouteStatus } from '#src/api/types';

export type SealTone = 'neutral' | 'cold' | 'thermal' | 'dispensed' | 'controlled';

export const TONE_STYLES: Record<SealTone, { bg: string; text: string }> = {
  neutral: { bg: 'bg-slate-300', text: 'text-slate-700' },
  cold: { bg: 'bg-cold', text: 'text-white' },
  thermal: { bg: 'bg-thermal', text: 'text-white' },
  dispensed: { bg: 'bg-dispensed', text: 'text-white' },
  controlled: { bg: 'bg-controlled', text: 'text-white' },
};

/** Mismos tonos que TONE_STYLES pero en hex crudo, para superficies que no leen Tailwind (estilos inline). */
export const TONE_HEX: Record<SealTone, string> = {
  neutral: '#CBD5E1',
  cold: '#D62839',
  thermal: '#BC7A0E',
  dispensed: '#2F6F5E',
  controlled: '#7A2E52',
};

export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  creado: 'Creado',
  alistado: 'Alistado',
  entregado_transportador: 'En tránsito',
  entregado_cliente: 'Entregado',
  no_entregado: 'No entregado',
};

export const DELIVERY_STATUS_TONE: Record<DeliveryStatus, SealTone> = {
  creado: 'neutral',
  alistado: 'cold',
  entregado_transportador: 'thermal',
  entregado_cliente: 'dispensed',
  no_entregado: 'controlled',
};

export const ROUTE_STATUS_LABEL: Record<RouteStatus, string> = {
  creada: 'Creada',
  entregada_transportador: 'Entregada a transportador',
  en_curso: 'En curso',
  completada: 'Completada',
  con_novedad: 'Con novedad',
};

export const ROUTE_STATUS_TONE: Record<RouteStatus, SealTone> = {
  creada: 'neutral',
  entregada_transportador: 'cold',
  en_curso: 'thermal',
  completada: 'dispensed',
  con_novedad: 'controlled',
};
