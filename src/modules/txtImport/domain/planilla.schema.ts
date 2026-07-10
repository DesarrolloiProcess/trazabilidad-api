import type { ITxtParserConfig } from '#src/shared/helpers/txtParser/domain/txtParser.js';

/**
 * Estructura de la planilla plana (TXT) de entregas. El formato exacto (delimitador,
 * orden y nombre de columnas) lo define iProcess; este layout es el acordado a la fecha
 * y debe actualizarse si iProcess publica una nueva versión del layout.
 *
 * El CEDI se toma del usuario autenticado que sube el archivo (no es una columna) y el
 * conductor se asigna después, desde el CEDI, vía PATCH /api/routes/:id/assign-driver.
 * clienteNit identifica al cliente (destinatario institucional) para el portal de consulta;
 * si el NIT no existe aún como cliente, se crea automáticamente durante la importación.
 */
export const PLANILLA_TXT_CONFIG: ITxtParserConfig = {
  delimiter: '|',
  expectedColumns: 11,
  hasHeader: true,
};

export const PLANILLA_COLUMNS = [
  'fecha',
  'routeCode',
  'trackingNumber',
  'clienteNit',
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
  routeCode: string;
  trackingNumber: string;
  clienteNit: string;
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
    routeCode: fields[1] ?? '',
    trackingNumber: fields[2] ?? '',
    clienteNit: fields[3] ?? '',
    direccion: fields[4] ?? '',
    destinatarioNombre: fields[5] ?? '',
    destinatarioTelefono: fields[6] ?? '',
    productoCodigo: fields[7] ?? '',
    productoDescripcion: fields[8] ?? '',
    productoCantidad: fields[9] ?? '',
    productoPrecio: fields[10] ?? '',
  };
}
