import { DrizzleDeliveryImpl } from '#src/modules/delivery/infrastructure/repositories/drizzleDelivery.impl.js';
import { whatsappNotifierHandle } from '#src/shared/helpers/whatsappNotifier/infrastructure/dependencies.js';

import { GetDeliveryByIdUseCase } from '#src/modules/delivery/app/useCases/getDeliveryById/getDeliveryById.useCase.js';
import { ListDeliveriesUseCase } from '#src/modules/delivery/app/useCases/listDeliveries/listDeliveries.useCase.js';
import { AdvanceDeliveryStatusUseCase } from '#src/modules/delivery/app/useCases/advanceDeliveryStatus/advanceDeliveryStatus.useCase.js';
import { DeliveryEvidenceUseCase } from '#src/modules/delivery/app/useCases/deliveryEvidence/deliveryEvidence.useCase.js';
import { MarkNotDeliveredUseCase } from '#src/modules/delivery/app/useCases/markNotDelivered/markNotDelivered.useCase.js';
import { InvoiceExportUseCase } from '#src/modules/delivery/app/useCases/invoiceExport/invoiceExport.useCase.js';

import { GetDeliveryByIdCtrl } from '#src/modules/delivery/infrastructure/interface/api/controller/getDeliveryById.ctrl.js';
import { ListDeliveriesCtrl } from '#src/modules/delivery/infrastructure/interface/api/controller/listDeliveries.ctrl.js';
import { AdvanceDeliveryStatusCtrl } from '#src/modules/delivery/infrastructure/interface/api/controller/advanceDeliveryStatus.ctrl.js';
import { DeliveryEvidenceCtrl } from '#src/modules/delivery/infrastructure/interface/api/controller/deliveryEvidence.ctrl.js';
import { MarkNotDeliveredCtrl } from '#src/modules/delivery/infrastructure/interface/api/controller/markNotDelivered.ctrl.js';
import { InvoiceExportCtrl } from '#src/modules/delivery/infrastructure/interface/api/controller/invoiceExport.ctrl.js';

export const deliveryRepository = new DrizzleDeliveryImpl();

const getDeliveryByIdUseCase = new GetDeliveryByIdUseCase(deliveryRepository);
const listDeliveriesUseCase = new ListDeliveriesUseCase(deliveryRepository);
const advanceDeliveryStatusUseCase = new AdvanceDeliveryStatusUseCase(deliveryRepository);
const deliveryEvidenceUseCase = new DeliveryEvidenceUseCase(deliveryRepository, whatsappNotifierHandle);
const markNotDeliveredUseCase = new MarkNotDeliveredUseCase(deliveryRepository);
const invoiceExportUseCase = new InvoiceExportUseCase(deliveryRepository);

export const getDeliveryByIdCtrl = new GetDeliveryByIdCtrl(getDeliveryByIdUseCase);
export const listDeliveriesCtrl = new ListDeliveriesCtrl(listDeliveriesUseCase);
export const advanceDeliveryStatusCtrl = new AdvanceDeliveryStatusCtrl(advanceDeliveryStatusUseCase);
export const deliveryEvidenceCtrl = new DeliveryEvidenceCtrl(deliveryEvidenceUseCase);
export const markNotDeliveredCtrl = new MarkNotDeliveredCtrl(markNotDeliveredUseCase);
export const invoiceExportCtrl = new InvoiceExportCtrl(invoiceExportUseCase);
