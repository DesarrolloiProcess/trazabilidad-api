import { TxtParserService } from '#src/shared/helpers/txtParser/app/txtParser.service.js';
import type { ITransaction, ITransactionRepository } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { IUuidRepository } from '#src/shared/helpers/uuidHandle/domain/uuidHandle.js';
import { ValidationError } from '#src/shared/Errors/validationError.js';
import { BusinessLogicError } from '#src/shared/Errors/businessLogicError.js';

import { Route } from '#src/modules/route/domain/route.entity.js';
import type { IRouteRepository } from '#src/modules/route/domain/route.repository.js';
import { Delivery, type IDeliveryProduct } from '#src/modules/delivery/domain/delivery.entity.js';
import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import { Client } from '#src/modules/client/domain/client.entity.js';
import type { IClientRepository } from '#src/modules/client/domain/client.repository.js';

import { PLANILLA_TXT_CONFIG, toPlanillaRow, type IPlanillaRow } from '#src/modules/txtImport/domain/planilla.schema.js';
import type { ImportTxtPlanillaCommand } from '#src/modules/txtImport/app/useCases/importTxtPlanilla/importTxtPlanilla.command.js';
import type { ImportResultDto } from '#src/modules/txtImport/app/dto/importResult.dto.js';

interface RowWithLine {
  lineNumber: number;
  row: IPlanillaRow;
}

export class ImportTxtPlanillaUseCase {
  constructor(
    private readonly routeRepository: IRouteRepository,
    private readonly deliveryRepository: IDeliveryRepository,
    private readonly clientRepository: IClientRepository,
    private readonly txtParser: TxtParserService,
    private readonly uuidHandle: IUuidRepository,
    private readonly transactionHandle: ITransactionRepository,
  ) {}

  async run(command: ImportTxtPlanillaCommand): Promise<ImportResultDto> {
    if (!command.authUser.distributionCenterId) {
      throw new BusinessLogicError('El usuario que importa la planilla debe pertenecer a un CEDI');
    }

    const distributionCenterId = command.authUser.distributionCenterId;

    const parsedRows = this.txtParser.parseAndValidate(command.content, PLANILLA_TXT_CONFIG);

    const rows: RowWithLine[] = parsedRows.map((parsedRow) => ({
      lineNumber: parsedRow.lineNumber,
      row: toPlanillaRow(parsedRow.fields),
    }));

    this.validateRows(rows);

    const [{ row: firstRow }] = rows;
    const now = new Date();

    const route = new Route({
      id: this.uuidHandle.uuid(),
      code: firstRow.routeCode,
      distributionCenterId,
      driverId: null,
      date: new Date(firstRow.fecha),
      status: 'creada',
      createdAt: now,
      updatedAt: now,
      createdBy: command.authUser.id,
      updatedBy: command.authUser.id,
    });

    const deliveriesByTracking = this.groupByTrackingNumber(rows);
    const trackingNumbers = [...deliveriesByTracking.keys()];
    const clientCache = new Map<string, Client>();

    await this.transactionHandle.buildTransaction(async (tx) => {
      await this.routeRepository.create(route, { tx });

      for (const trackingNumber of trackingNumbers) {
        const groupRows = deliveriesByTracking.get(trackingNumber)!;
        const [firstGroupRow] = groupRows;

        const client = await this.getOrCreateClient(
          firstGroupRow.clienteNit,
          firstGroupRow.destinatarioNombre,
          firstGroupRow.destinatarioTelefono,
          command.authUser.id,
          clientCache,
          tx,
        );

        const products: IDeliveryProduct[] = groupRows.map((row) => ({
          code: row.productoCodigo,
          description: row.productoDescripcion,
          quantity: Number(row.productoCantidad),
          price: Number(row.productoPrecio),
        }));

        const delivery = new Delivery({
          id: this.uuidHandle.uuid(),
          routeId: route.id,
          clientId: client.id,
          trackingNumber,
          address: firstGroupRow.direccion,
          recipientName: firstGroupRow.destinatarioNombre,
          recipientPhone: firstGroupRow.destinatarioTelefono,
          products,
          status: 'creado',
          signatureUrl: null,
          photoUrl: null,
          receiverName: null,
          receiverIdNumber: null,
          latitude: null,
          longitude: null,
          observation: null,
          deliveredAt: null,
          invoiced: false,
          invoicedAt: null,
          createdAt: now,
          updatedAt: now,
          createdBy: command.authUser.id,
          updatedBy: command.authUser.id,
        });

        await this.deliveryRepository.create(delivery, { tx });
      }
    });

    return {
      routeId: route.id,
      routeCode: route.code,
      distributionCenterId: route.distributionCenterId,
      date: route.date,
      deliveriesCount: trackingNumbers.length,
      trackingNumbers,
    };
  }

  private async getOrCreateClient(
    nit: string,
    name: string,
    phone: string,
    authUserId: string,
    cache: Map<string, Client>,
    tx: ITransaction,
  ): Promise<Client> {
    const cached = cache.get(nit);
    if (cached) return cached;

    const existing = await this.clientRepository.getByNit(nit);
    if (existing) {
      cache.set(nit, existing);
      return existing;
    }

    const now = new Date();
    const client = new Client({
      id: this.uuidHandle.uuid(),
      nit,
      name,
      phone,
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
      updatedBy: authUserId,
    });

    const created = await this.clientRepository.create(client, { tx });
    cache.set(nit, created);
    return created;
  }

  private groupByTrackingNumber(rows: RowWithLine[]): Map<string, IPlanillaRow[]> {
    const grouped = new Map<string, IPlanillaRow[]>();

    for (const { row } of rows) {
      const existing = grouped.get(row.trackingNumber) ?? [];
      existing.push(row);
      grouped.set(row.trackingNumber, existing);
    }

    return grouped;
  }

  private validateRows(rows: RowWithLine[]): void {
    const errors: string[] = [];
    const [{ row: firstRow }] = rows;

    for (const { lineNumber, row } of rows) {
      if (!row.routeCode) {
        errors.push(`Línea ${lineNumber}: routeCode (ruta/número de planilla) vacío`);
      }

      if (!row.clienteNit) {
        errors.push(`Línea ${lineNumber}: clienteNit vacío`);
      }

      if (Number.isNaN(Date.parse(row.fecha))) {
        errors.push(`Línea ${lineNumber}: fecha inválida`);
      }

      if (!Number.isInteger(Number(row.productoCantidad)) || Number(row.productoCantidad) <= 0) {
        errors.push(`Línea ${lineNumber}: cantidad de producto inválida`);
      }

      if (Number.isNaN(Number(row.productoPrecio)) || Number(row.productoPrecio) < 0) {
        errors.push(`Línea ${lineNumber}: precio de producto inválido`);
      }

      if (row.routeCode !== firstRow.routeCode || row.fecha !== firstRow.fecha) {
        errors.push(`Línea ${lineNumber}: todos los registros de la planilla deben pertenecer a la misma ruta (mismo routeCode y fecha)`);
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('La planilla TXT contiene registros inválidos', errors);
    }
  }
}
