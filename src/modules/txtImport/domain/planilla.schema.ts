import type { ITxtParserConfig } from '#src/shared/helpers/txtParser/domain/txtParser.js';

/**
 * Estructura de la planilla plana (TXT) de entregas. El formato exacto (delimitador,
 * orden y nombre de columnas) lo define iProcess; este layout es el acordado a la fecha
 * y debe actualizarse si iProcess publica una nueva versión del layout.
 */
export const PLANILLA_TXT_CONFIG: ITxtParserConfig = {
  delimiter: '|',
  expectedColumns: 11,
  hasHeader: true,
};

export const PLANILLA_COLUMNS = [
  'fecha',
  'cediId',
  'driverId',
  'trackingNumber',
  'direccion',
  'destinatarioNombre',
  'destinatarioTelefono',
  'productoCodigo',
  'productoDescripcion',
  'productoCantidad',
  'productoPrecio',
] as const;

export type PlanillaColumn = (typeof PLANILLA_COLUMNS)[number];

export interface IPlanillaRow {
  fecha: string;
  cediId: string;
  driverId: string;
  trackingNumber: string;
  direccion: string;
  destinatarioNombre: string;
  destinatarioTelefono: string;
  productoCodigo: string;
  productoDescripcion: string;
  productoCantidad: string;
  productoPrecio: string;
}

export function toPlanillaRow(fields: string[]): IPlanillaRow {
  return {
    fecha: fields[0] ?? '',
    cediId: fields[1] ?? '',
    driverId: fields[2] ?? '',
    trackingNumber: fields[3] ?? '',
    direccion: fields[4] ?? '',
    destinatarioNombre: fields[5] ?? '',
    destinatarioTelefono: fields[6] ?? '',
    productoCodigo: fields[7] ?? '',
    productoDescripcion: fields[8] ?? '',
    productoCantidad: fields[9] ?? '',
    productoPrecio: fields[10] ?? '',
  };
}
