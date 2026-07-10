import type { IDeliveryRepository } from '#src/modules/delivery/domain/delivery.repository.js';
import type { InvoiceExportCommand } from '#src/modules/delivery/app/useCases/invoiceExport/invoiceExport.command.js';
import { toInvoiceExportDto, type InvoiceExportDto } from '#src/modules/delivery/app/dto/invoiceExport.dto.js';

export class InvoiceExportUseCase {
  constructor(private readonly repository: IDeliveryRepository) {}

  async run(command: InvoiceExportCommand): Promise<InvoiceExportDto[]> {
    const deliveries = await this.repository.getConfirmedInWindow(new Date(command.from), new Date(command.to));

    return deliveries.map(toInvoiceExportDto);
  }
}
