import { TxtParserService } from '#src/shared/helpers/txtParser/app/txtParser.service.js';
import type { ITransaction, ITransactionRepository } from '#src/shared/helpers/transactions/domain/transaction.js';
import type { IUuidRepository } from '#src/shared/helpers/uuidHandle/domain/uuidHandle.js';
import { ValidationError } from '#src/shared/Errors/validationError.js';
import { BusinessLogicError } from '#src/shared/Errors/businessLogicError.js';
import { Role } from '#src/shared/constant/roles.constant.js';

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
    // El usuario CEDI (rol interno) siempre importa a su propia droguería, sin importar lo que haya
    // enviado en el body. ADMIN no pertenece a ninguna droguería, así que debe indicar a cuál importa.
    const distributionCenterId =
      command.authUser.role === Role.CEDI ? command.authUser.distributionCenterId : command.distributionCenterId;

    if (!distributionCenterId) {
      throw new BusinessLogicError(
        command.authUser.role === Role.CEDI
          ? 'El usuario que importa la planilla debe pertenecer a una droguería'
          : 'Selecciona la droguería de origen de esta planilla',
      );
    }

    const parsedRows = this.txtParser.parseAndValidate(command.content, PLANILLA_TXT_CONFIG);

    const rows: RowWithLine[] = parsedRows.map((parsedRow) => ({
      lineNumber: parsedRow.lineNumber,
      row: toPlanillaRow(parsedRow.fields),
    }));

    this.validateRows(rows);

    const [{ row: firstRow }] = rows;
    const now = new Date();

    await this.validateTrackingNumbersAreNew(rows.map(({ row }) => row.trackingNumber));

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

  /**
   * clienteNit identifica al convenio/EPS que paga la entrega, no al paciente (ese es
   * recipientName/receiverName en la propia entrega). Cuando viene vacío, todas las
   * entregas particulares comparten un mismo registro "Particular" (nit ''), para que
   * cualquier pantalla que muestre el nombre del pagador lo haga sin dejarlo en blanco.
   */
  private async getOrCreateClient(
    nit: string,
    phone: string,
    authUserId: string,
    cache: Map<string, Client>,
    tx: ITransaction,
  ): Promise<Client> {
    const normalizedNit = nit.trim();
    const cached = cache.get(normalizedNit);
    if (cached) return cached;

    const existing = await this.clientRepository.getByNit(normalizedNit);
    if (existing) {
      cache.set(normalizedNit, existing);
      return existing;
    }

    const now = new Date();
    const client = new Client({
      id: this.uuidHandle.uuid(),
      nit: normalizedNit,
      // Sin NIT no hay forma de saber el nombre real del convenio desde la planilla (no trae esa columna) —
      // se usa un nombre honesto en vez de reutilizar el nombre del paciente, que sería incorrecto.
      name: normalizedNit === '' ? 'Particular' : `Convenio ${normalizedNit}`,
      phone: normalizedNit === '' ? null : (phone || null),
      active: true,
      createdAt: now,
      updatedAt: now,
      createdBy: authUserId,
      updatedBy: authUserId,
    });

    const created = await this.clientRepository.create(client, { tx });
    cache.set(normalizedNit, created);
    return created;
  }

  private async validateTrackingNumbersAreNew(trackingNumbers: string[]): Promise<void> {
    const uniqueTrackingNumbers = [...new Set(trackingNumbers)];

    const existing = await Promise.all(
      uniqueTrackingNumbers.map(async (trackingNumber) => {
        const delivery = await this.deliveryRepository.getByTrackingNumber(trackingNumber);
        return delivery ? trackingNumber : null;
      }),
    );

    const duplicates = existing.filter((trackingNumber): trackingNumber is string => trackingNumber !== null);

    if (duplicates.length > 0) {
      throw new ValidationError(
        `El(los) número(s) de guía ya existen en el sistema: ${duplicates.join(', ')}`,
      );
    }
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

      // clienteNit es opcional: representa el convenio/EPS que paga, no siempre existe (pacientes particulares).
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
